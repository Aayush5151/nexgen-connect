import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { aiAvailable, aiFlags, aiModel } from "./client";

/**
 * LLM-augmented name match for the DigiLocker → waitlist join.
 *
 * Background. The Aadhaar response carries the full legal name in
 * Latin script ("RAHUL KUMAR SHARMA"); the waitlist stores what the
 * user typed during phone OTP, often a casual / regional / partial
 * variant ("Rahul", "Aayush" vs "Ayush", "देवांग" vs "Devang").
 * The legacy token-overlap match (`namesMatch` in
 * `web/src/lib/digilocker.ts`) catches the easy cases but rejects
 * legitimate users on:
 *   - transliteration differences (English ↔ Devanagari, Tamil, etc.)
 *   - regional spelling drift (Aayussh / Aayush / Ayush / आयुष)
 *   - missing/added honorifics (Mr., Smt., S/O markers)
 *   - middle-name expansion ("Rahul S Kumar" vs "Rahul Sharma")
 *
 * Strategy: keep token-match as the fast happy path. Only call the
 * LLM when the token-match returns FALSE — that's the borderline
 * bucket where false rejections cost real users their identity step.
 * The LLM either confirms the rejection (most common) or overrides
 * it with a clear explanation that goes into audit_log so we can
 * spot-check decisions later.
 *
 * Hard requirements:
 *   - aiAvailable() (OIDC token wired).
 *   - AI_NAME_MATCH_ENABLED=true.
 *   - The token-match has already returned false (we don't override
 *     positive matches — they're already cheap and correct).
 *
 * v16 web pivot Bucket 4 follow-up.
 */

export const NameMatchVerdictSchema = z.object({
  match: z
    .boolean()
    .describe(
      "True ONLY if the two names plausibly identify the same person, accounting for transliteration, honorifics, regional spelling drift, and missing/extra middle names. False otherwise. Be conservative, when in doubt, return false.",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Calibrated confidence in your verdict. Reserve 0.9+ for clear cases; use 0.5–0.8 when there's a plausible match but the variation is significant.",
    ),
  rationale: z
    .string()
    .max(180)
    .describe(
      "One short sentence, what specifically about the two names made you decide match/no-match? Cite the variation if relevant ('transliteration: Aayush ↔ आयुष').",
    ),
});

export type NameMatchVerdict = z.infer<typeof NameMatchVerdictSchema>;

export type NameMatchResult =
  | { ok: true; verdict: NameMatchVerdict }
  | { ok: false; reason: string };

const SYSTEM_PROMPT = `You compare two name strings to decide if they plausibly identify the same person. The first is the LEGAL name on an Indian Aadhaar (full, all-caps, often with honorifics or 'S/O' / 'D/O' / 'W/O' markers). The second is what the user typed during signup, usually a first name or short form, sometimes in their native script.

Return match=true when:
- Tokens match after Latin/Devanagari/Tamil/Bengali/Telugu/Kannada transliteration.
- The signup name is a clear short form of the legal name ('Rahul' from 'Rahul Kumar Sharma').
- Spelling variation is consistent with regional Indian conventions ('Aayush' / 'Ayush' / 'Aayussh').

Return match=false when:
- The names share zero phonetic root (Rahul vs Vikram).
- The signup name appears to be a different person referenced in the Aadhaar (a parent named in S/O / D/O markers).
- You can't tell, never default to true on uncertainty.

Output the structured JSON via the tool schema.`;

const TIMEOUT_MS = 6_000;

/**
 * Borderline-case enhancement. Caller invokes this only after the
 * cheap token-match has already returned FALSE; this function decides
 * whether the LLM thinks the match should be overridden.
 *
 * Returns ok:false when the model is unavailable / disabled / errors —
 * caller should treat those as "stick with the original false".
 */
export async function llmNameMatch(
  aadhaarName: string,
  signupName: string,
): Promise<NameMatchResult> {
  if (!aiAvailable()) return { ok: false, reason: "no-credentials" };
  if (!aiFlags.nameMatch) return { ok: false, reason: "disabled" };
  if (!aadhaarName.trim() || !signupName.trim()) {
    return { ok: false, reason: "empty-input" };
  }

  try {
    const { output } = await generateText({
      model: aiModel(),
      output: Output.object({ schema: NameMatchVerdictSchema }),
      system: SYSTEM_PROMPT,
      prompt: `Aadhaar legal name: ${aadhaarName.slice(0, 200)}\nSignup name: ${signupName.slice(0, 100)}`,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { ok: true, verdict: output };
  } catch (err) {
    console.warn(
      "[ai:name-match] call failed:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, reason: "model-error" };
  }
}

/** Confidence floor for the LLM verdict to override a token-match
 *  rejection. Keep this high — false positives on identity match are
 *  the worst outcome (let an impersonator through). */
export const NAME_MATCH_OVERRIDE_THRESHOLD = 0.85;
