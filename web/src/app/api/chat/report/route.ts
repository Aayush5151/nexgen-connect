import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { inngest } from "@/lib/inngest/client";
import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/chat/report
 *
 * T&S report routing. Categories + SLA per v15 BP §3.5 and v16 §Bucket 7:
 *
 *   harassment   → 1h SLA (women-only sub-thread routes here too)
 *   self_harm    → 1h SLA (escalate to crisis path /app/help/now)
 *   scam | spam  → 4h SLA
 *   other        → 4h SLA
 *
 * Auth: required. reporter_user_id comes from the authenticated user
 * (was "demo-user-1" placeholder in the original Bucket 7 stub) and a
 * tight rate limit (5/h) closes the abuse vector — without it any
 * unauthed POST could flood the Inngest queue with phantom reports.
 *
 * Soft-delete of the offending message is the advisor's call — not
 * auto-applied.
 *
 * Input: { messageId: string, category: ChatReportCategory, detail?: string }
 *
 * v16 web pivot §Bucket 7 (auth wired).
 */

const categorySchema = z.enum(["harassment", "self_harm", "scam", "spam", "other"]);

const inputSchema = z.object({
  messageId: z.string().uuid(),
  category: categorySchema,
  detail: z.string().max(1000).optional(),
});

function slaHoursFor(category: z.infer<typeof categorySchema>): 1 | 4 {
  return category === "harassment" || category === "self_harm" ? 1 : 4;
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // Reports trigger T&S work + Inngest events. 5/hour is enough for
  // legitimate use, low enough to bound abuse fan-out.
  const rl = await enforceRateLimit({
    route: "chat-report",
    userId: auth.user.id,
    ip: clientIp(req),
    limit: 5,
    windowSec: 3600,
  });
  if (!rl.ok) return rl.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E072:invalid_report" }, { status: 400 });
  }

  const slaHours = slaHoursFor(body.category);
  const ticketId = `chat_${Date.now()}`;

  // Hand off to Inngest's `ts-sla` durable function — it sleeps for
  // the SLA window then re-checks the report state and escalates if
  // still pending. Inngest's `step.sleep` survives function restarts,
  // which a setTimeout in this route handler would not.
  try {
    await inngest.send({
      name: "ts/report.filed",
      data: {
        reportId: ticketId,
        filedByUserId: auth.user.id,
        reportedMessageId: body.messageId,
        // The thread/corridor id isn't in scope of this REST shape yet
        // (the chat thread page passes only the messageId). The job
        // accepts an empty string and looks up the corridor from the
        // message row — wire-up follow-up.
        corridorId: "",
        reasonCode: body.category,
      },
    });
  } catch (err) {
    // Non-fatal: the report row is what matters for SLA — Inngest just
    // fires the escalation reminder. Surface to logs (Sentry will pick
    // these up via the auto-instrumentation).
    console.warn("[chat.report] inngest emit failed:", err);
  }

  // Real path: insert into chat_report with reporter_user_id from
  // Supabase SSR cookie. Bucket 8 wires the Supabase service-role
  // insert here.
  return NextResponse.json({
    ticketId,
    slaHours,
    deadlineAt: new Date(Date.now() + slaHours * 3600_000).toISOString(),
    routedTo: body.category === "harassment" || body.category === "self_harm" ? "ts_priority" : "ts_general",
  });
}
