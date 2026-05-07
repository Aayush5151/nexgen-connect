import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { aiAvailable, aiFlags, aiModel } from "./client";
import type { SignupRow } from "@/lib/supabase/schema";

/**
 * Founder triage verdict.
 *
 * One short sentence per row in the /admin review queue, prefixed
 * with a label (ok / review / concerning). The founder scans the
 * verdict, then clicks Approve / Decline. The model is an
 * **assistant**, not the decision-maker — every action remains
 * human-issued.
 *
 * Inputs we feed the model:
 *   - corridor metadata the user typed (city, destination uni, intake)
 *   - identity verification status (digilocker verified / not)
 *   - admit-letter parse output (extracted fields, mismatches, red flags)
 *   - account age + funnel step
 *
 * What we DO NOT pass:
 *   - phone number, email, exact name (only first-name initial)
 *   - any free-text the user wrote in the funnel
 *   - any chat content
 *
 * v16 web pivot Bucket 4 follow-up.
 */

export const TriageVerdictSchema = z.object({
  label: z
    .enum(["ok", "review", "concerning"])
    .describe(
      "ok = signals consistent, no flags. review = at least one mismatch worth a human eyeball. concerning = multiple red flags or hard contradictions; recommend founder declines unless they can quickly explain the mismatch.",
    ),
  one_liner: z
    .string()
    .max(140)
    .describe(
      "ONE short sentence summarising the rationale, written for the founder reviewing 50+ rows in a session. Lead with the strongest signal. Avoid hedging language.",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Calibrated confidence in the verdict (0..1). Lower this when input data is sparse (e.g., admit_extracted is missing).",
    ),
});

export type TriageVerdict = z.infer<typeof TriageVerdictSchema>;

export type TriageResult =
  | { ok: true; verdict: TriageVerdict }
  | { ok: false; reason: string };

const SYSTEM_PROMPT = `You triage applicants for a verified-trust app for Indian students moving abroad. Each row you see has already passed phone OTP. The founder is the only reviewer; you order their attention by labelling each applicant ok / review / concerning and explaining why in ONE short sentence.

Use these signals:
- Identity verified via DigiLocker → strong positive.
- Admit letter extracted university matches the user-typed destination → strong positive.
- Mismatches (letter says University X, user picked University Y; intake mismatch; suspect red flags from vision parse) → reasons to label 'review' or 'concerning'.
- Funnel step still 'phone' or 'profile' after several days, with no admit / identity progress → 'review'.

Use 'ok' for clean rows the founder can one-click approve. Use 'review' when one or two things should be eyeballed. Reserve 'concerning' for multiple red flags / explicit contradictions. Do NOT recommend an action — you don't get a vote, you order attention.

Output the structured JSON via the tool schema. Keep one_liner under 140 characters; lead with the strongest signal.`;

const TIMEOUT_MS = 8_000;

/**
 * Build the compact JSON payload the model sees. Strips PII and
 * normalises field names to keep the prompt short and the cache
 * hit-rate high.
 */
function buildSignals(row: SignupRow): Record<string, unknown> {
  return {
    funnel_step: row.signup_step,
    days_since_signup: Math.floor(
      (Date.now() - new Date(row.created_at).getTime()) / 86_400_000,
    ),
    home_city: row.home_city,
    destination_uni_typed: row.destination_uni,
    intake_typed: row.intake,
    identity_status: row.identity_status,
    admit_status: row.admit_status,
    admit_extracted: row.admit_extracted
      ? {
          university_name: row.admit_extracted.university_name,
          intake_term: row.admit_extracted.intake_term,
          mismatches: row.admit_extracted.mismatches,
          red_flags: row.admit_extracted.red_flags,
          confidence: row.admit_extracted.confidence,
        }
      : null,
  };
}

export async function computeTriageVerdict(
  row: SignupRow,
): Promise<TriageResult> {
  if (!aiAvailable()) return { ok: false, reason: "no-credentials" };
  if (!aiFlags.triage) return { ok: false, reason: "disabled" };

  const signals = buildSignals(row);
  try {
    const { output } = await generateText({
      model: aiModel(),
      output: Output.object({ schema: TriageVerdictSchema }),
      system: SYSTEM_PROMPT,
      prompt: `Triage this applicant:\n\n${JSON.stringify(signals, null, 2)}`,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { ok: true, verdict: output };
  } catch (err) {
    console.warn(
      "[ai:triage] call failed:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, reason: "model-error" };
  }
}
