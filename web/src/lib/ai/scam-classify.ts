import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { aiAvailable, aiFlags, aiModel } from "./client";

/**
 * Classify a single chat message for scam / abuse signals.
 *
 * Operates on the message text only — never on PII outside it. The
 * classifier is conservative: confidence < 0.7 means "do not act".
 * Above the threshold, the upstream Inngest job opens a chat_report
 * with `auto_filed = true` so the T&S advisor sees it in the queue
 * without a victim having to report first.
 *
 * Why an LLM and not a regex: Indian-corridor scam patterns evolve
 * weekly ("DM me on Telegram for accommodation deposit", "PG owner
 * needs ₹X token now", impersonating a senior at the destination
 * uni). A small instruction-tuned model handles paraphrase and
 * mixed-language (Hindi-English code-switching) far better than a
 * brittle keyword list, and Haiku 4.5 is cheap enough at $0.0001/msg
 * to run on every send without budget concerns.
 *
 * Hard requirements:
 *   - aiAvailable() must be true (OIDC token wired).
 *   - AI_SCAM_DETECT_ENABLED=true (per-feature flag).
 *
 * v16 web pivot Bucket 4 follow-up.
 */

const SCAM_CATEGORIES = [
  "payment_advance", // "send ₹X first, then I'll secure the room"
  "off_platform_contact", // "ping me on Telegram", "let's move to WhatsApp"
  "accommodation_scam", // fake PG / hostel / lease offers
  "impersonation", // claiming to be staff / senior / agent
  "harassment", // 1:1 abuse, threats
  "self_harm", // user expressing self-harm / crisis
  "none", // benign — the overwhelmingly common case
] as const;

export const ScamClassificationSchema = z.object({
  category: z.enum(SCAM_CATEGORIES).describe(
    "Pick the single most-fitting category. Use 'none' for benign messages.",
  ),
  is_likely_scam: z
    .boolean()
    .describe(
      "True only if the category is one of the scam types (payment_advance, off_platform_contact, accommodation_scam, impersonation) AND the message is reasonably suspicious. Harassment / self_harm should set this to false — they are abuse / safety, not scams.",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Calibrated confidence. Reserve 0.9+ for unambiguous cases (explicit advance-payment ask). Use 0.6-0.8 for likely-but-not-certain. Use < 0.5 when the message could plausibly be benign in context.",
    ),
  reason: z
    .string()
    .max(160)
    .describe(
      "One short sentence — what specifically in the message triggered this classification? Quote the load-bearing phrase if there is one.",
    ),
});

export type ScamClassification = z.infer<typeof ScamClassificationSchema>;

export type ScamClassifyResult =
  | { ok: true; classification: ScamClassification }
  | { ok: false; reason: string };

const SYSTEM_PROMPT = `You are a moderation classifier for a chat between Indian university students moving abroad. The platform is verified-trust (every member passed phone OTP + identity check), so straight-up trolling is rare. The real risks:

- Payment advance scams ("transfer X first, then I'll secure your accommodation / coach / visa slot").
- Off-platform pull ("DM me on Telegram", "let's move to WhatsApp", "give me your number") — often a precursor to scam since it removes our T&S surface.
- Accommodation scams (fake PG / hostel offers in the destination city, fake leases, fake brokers).
- Impersonation (claiming to be senior at the uni / student-affairs staff / official agent).
- Harassment (1:1 abuse, threats, doxxing).
- Self-harm signals (someone expressing crisis).

Default to 'none' when the message is plausibly benign — students do legitimately swap WhatsApp numbers between friends and discuss apartment hunting. Only escalate when there's a concrete signal in the message itself.

Return the structured JSON via the tool schema.`;

const TIMEOUT_MS = 8_000;

export async function classifyChatMessage(
  text: string,
): Promise<ScamClassifyResult> {
  if (!aiAvailable()) return { ok: false, reason: "no-credentials" };
  if (!aiFlags.scamDetect) return { ok: false, reason: "disabled" };

  // Hard cap on input length — chat_message body is 4000 chars max but
  // longer prompts inflate cost and the classifier doesn't need more
  // than the first ~600 chars to make the call.
  const trimmed = text.slice(0, 600);

  try {
    const { output } = await generateText({
      model: aiModel(),
      output: Output.object({ schema: ScamClassificationSchema }),
      system: SYSTEM_PROMPT,
      prompt: `Classify this chat message:\n\n${trimmed}`,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { ok: true, classification: output };
  } catch (err) {
    console.warn(
      "[ai:scam-classify] call failed:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, reason: "model-error" };
  }
}

/** Threshold above which the Inngest job auto-files a chat_report. */
export const SCAM_AUTO_FILE_THRESHOLD = 0.75;
