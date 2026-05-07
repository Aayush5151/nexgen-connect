/**
 * Chat scam detection — runs Claude Haiku on every outgoing chat
 * message and auto-files a chat_report when confidence is high.
 *
 * Triggered by `chat/message.sent` (same event as push-fanout, runs in
 * parallel — Inngest dispatches both to their own functions). The
 * `bodyExcerpt` field on the event is the 140-char preview that the
 * chat-send route already capped to keep PII bounded; we use that
 * directly so the classifier never sees more than the user signed up
 * to share with their counterpart.
 *
 * What we DO:
 *   - Classify the excerpt via the AI Gateway.
 *   - When `is_likely_scam=true` AND `confidence >= SCAM_AUTO_FILE_THRESHOLD`,
 *     insert a chat_report with reporter_user_id = senderId,
 *     auto_filed = true, ai_category, ai_confidence, ai_reason.
 *   - The `ts/report.filed` Inngest event then schedules SLA escalation
 *     via the existing ts-sla job — same flow as a user-filed report,
 *     no special path required.
 *
 * What we DON'T:
 *   - Block the message. Auto-blocking on AI judgement is a brittle
 *     trust failure mode; the message goes through, the report goes
 *     to the T&S queue, the human decides.
 *   - Run on harassment / self_harm. Those need a dedicated workflow
 *     (counsellor escalation, not "report"). Out of scope for this
 *     follow-up.
 *
 * Failure semantics: any classifier failure (no creds, model error,
 * disabled flag) is a no-op. The function logs and returns ok:true
 * so Inngest doesn't retry needlessly — we are a best-effort lane,
 * not part of the chat critical path.
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { inngest } from "../client";
import {
  classifyChatMessage,
  SCAM_AUTO_FILE_THRESHOLD,
} from "@/lib/ai/scam-classify";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type AutoFileResult = {
  filed: boolean;
  reportId: string | null;
  reason: string;
};

export const chatScamDetect = inngest.createFunction(
  {
    id: "chat-scam-detect",
    retries: 1,
    triggers: [{ event: "chat/message.sent" }],
  },
  async ({ event, step }) => {
    const { messageId, corridorId, senderId, bodyExcerpt } = event.data;

    const classification = await step.run("classify", async () => {
      const res = await classifyChatMessage(bodyExcerpt);
      if (!res.ok) {
        return { skipped: true as const, reason: res.reason };
      }
      return { skipped: false as const, ...res.classification };
    });

    if (classification.skipped) {
      return { ok: true, action: "skipped", reason: classification.reason };
    }

    const { is_likely_scam, confidence, category, reason } = classification;
    if (!is_likely_scam || confidence < SCAM_AUTO_FILE_THRESHOLD) {
      return {
        ok: true,
        action: "below-threshold",
        category,
        confidence,
      };
    }

    // Map fine-grained AI category to the chat_report.category enum
    // (harassment / scam / spam / self_harm / other). The fine-grained
    // value goes in ai_category for analytics + advisor context.
    const schemaCategory =
      category === "harassment"
        ? "harassment"
        : category === "self_harm"
          ? "self_harm"
          : category === "payment_advance" ||
              category === "off_platform_contact" ||
              category === "accommodation_scam" ||
              category === "impersonation"
            ? "scam"
            : "other";

    // SLA: 1h for harassment + self_harm per chat_report check
    // constraint, 4h otherwise. Mirrors the slaHoursFor() helper in
    // /api/chat/report.
    const slaHours =
      schemaCategory === "harassment" || schemaCategory === "self_harm" ? 1 : 4;

    const result = await step.run("auto-file-report", async (): Promise<AutoFileResult> => {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Dev / preview: no DB. Log + return.
        console.log(
          `[inngest:chat-scam-detect] would file report message=${messageId} cat=${category} conf=${confidence.toFixed(2)}`,
        );
        return { filed: false, reportId: null, reason: "no-service-role" };
      }
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("chat_report")
        .insert({
          message_id: messageId,
          reporter_user_id: senderId,
          category: schemaCategory,
          status: "open",
          sla_hours: slaHours,
          auto_filed: true,
          ai_category: category,
          ai_confidence: confidence,
          ai_reason: reason,
        })
        .select("id")
        .single();
      if (error || !data) {
        console.warn(
          `[inngest:chat-scam-detect] insert failed: ${error?.message ?? "no row"}`,
        );
        return { filed: false, reportId: null, reason: error?.message ?? "no-row" };
      }
      return { filed: true, reportId: data.id as string, reason: "filed" };
    });

    if (!result.filed || !result.reportId) {
      return { ok: true, action: "file-skipped", reason: result.reason };
    }

    // Hand off to the SLA workflow exactly like a user-filed report.
    await step.sendEvent("ts-report-filed", {
      name: "ts/report.filed",
      data: {
        reportId: result.reportId,
        filedByUserId: senderId,
        reportedMessageId: messageId,
        corridorId,
        reasonCode: category,
      },
    });

    return {
      ok: true,
      action: "filed",
      reportId: result.reportId,
      category,
      confidence,
    };
  },
);
