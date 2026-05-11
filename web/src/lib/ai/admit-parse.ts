import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { aiAvailable, aiFlags, aiModel } from "./client";

/**
 * Vision parse for an uploaded admit letter.
 *
 * Fetches the image bytes from Cloudflare Images via the account-token
 * REST API (server-to-server), then asks Claude Haiku 4.5 to extract
 * the structured fields and surface any red flags. The result is
 * persisted into `auth.users.user_metadata.admit_extracted` so the
 * /admin reviewer sees the AI's read alongside the raw image.
 *
 * The model never auto-approves. It only PRE-VALIDATES against the
 * fields the user typed at signup (destination_uni, intake) and flags
 * mismatches the founder should look at first.
 *
 * Hard requirements:
 *   - Both AI_GATEWAY (or VERCEL_OIDC_TOKEN) AND
 *     `AI_ADMIT_PARSE_ENABLED=true` must be present, otherwise this
 *     resolves to {ok: false, reason: "disabled"} and the upstream
 *     route falls back to the existing human-only path.
 *   - The vision model is bounded to 30s; longer means a 5xx upstream
 *     and the route should treat the parse as best-effort.
 *
 * v16 web pivot Bucket 4 follow-up.
 */

export const AdmitExtractedSchema = z.object({
  university_name: z
    .string()
    .nullable()
    .describe(
      "The university or institution that issued the letter. Use the most official form on the letterhead, not the user-facing brand. Null if not visible.",
    ),
  intake_term: z
    .string()
    .nullable()
    .describe(
      "Course start term as printed, e.g. 'September 2026', 'Fall 2026', '2026/27 Semester 1'. Null if not visible.",
    ),
  applicant_name: z
    .string()
    .nullable()
    .describe(
      "Full name of the admitted student exactly as printed on the letter (after honorifics). Null if not visible.",
    ),
  applicant_id: z
    .string()
    .nullable()
    .describe(
      "Applicant / student / CAO / UCAS reference number. Null if not visible.",
    ),
  course_name: z
    .string()
    .nullable()
    .describe(
      "Programme / degree title, e.g. 'BSc (Hons) Computer Science', 'M.Sc. Data Analytics'. Null if not visible.",
    ),
  red_flags: z
    .array(z.string())
    .describe(
      "Concrete forgery / mismatch signals you observe. Examples: 'mismatched fonts in name field', 'no university crest', 'photocopier moiré on signature', 'reference number does not match this institution\\'s pattern'. Empty array if nothing is suspicious.",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "How confident you are in your extraction overall. 0.9+ = clean letterhead, fields easy to read. <0.5 = blurry / partial / heavily obscured.",
    ),
});

export type AdmitExtracted = z.infer<typeof AdmitExtractedSchema>;

export type AdmitParseResult =
  | { ok: true; extracted: AdmitExtracted }
  | { ok: false; reason: string };

const FETCH_TIMEOUT_MS = 30_000;

/**
 * Fetch the raw bytes of a Cloudflare Images-hosted image by id, using
 * the account-scoped API token. Returns base64 + mime type so the AI
 * SDK's vision input can consume it without a public URL.
 */
async function fetchCfImageBytes(
  imageId: string,
): Promise<{ base64: string; mimeType: string } | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
  if (!accountId || !token) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${encodeURIComponent(
      imageId,
    )}/blob`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return { base64: buf.toString("base64"), mimeType };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const SYSTEM_PROMPT = `You read university admit letters and extract structured fields. You DO NOT make admission decisions; the founder reviews everything. Your job:

1. Pull the printed values verbatim, university, intake term, applicant name, applicant id, course name. Do not paraphrase or normalise. If a field isn't on the letter, return null for that field.
2. List concrete red flags only, things you can SEE on the page (mismatched fonts, missing crest, broken alignment, doctored signature, irregular reference-number format for this institution). Do NOT speculate. Empty list is the right answer when nothing is suspicious.
3. Report your overall confidence in the extraction (0..1). Lower it for blurry / partial scans.

Output the structured JSON via the tool schema. Return only the schema fields.`;

export async function parseAdmitLetter(
  imageId: string,
): Promise<AdmitParseResult> {
  if (!aiAvailable()) return { ok: false, reason: "no-credentials" };
  if (!aiFlags.admitParse) return { ok: false, reason: "disabled" };

  const image = await fetchCfImageBytes(imageId);
  if (!image) return { ok: false, reason: "image-fetch-failed" };

  try {
    const { output } = await generateText({
      model: aiModel(),
      output: Output.object({ schema: AdmitExtractedSchema }),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the fields and any red flags from this admit letter.",
            },
            {
              type: "image",
              image: `data:${image.mimeType};base64,${image.base64}`,
            },
          ],
        },
      ],
      abortSignal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return { ok: true, extracted: output };
  } catch (err) {
    console.warn(
      "[ai:admit-parse] vision call failed:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, reason: "model-error" };
  }
}

/**
 * Compare extracted fields against the user-supplied corridor metadata.
 * Returns an array of human-readable mismatch labels for the /admin
 * reviewer chip — empty array means everything aligned.
 */
export function diffAdmitExtracted(
  extracted: AdmitExtracted,
  expected: { destinationUni: string | null; intake: string | null },
): string[] {
  const out: string[] = [];

  if (
    extracted.university_name &&
    expected.destinationUni &&
    !looselyEqual(extracted.university_name, expected.destinationUni)
  ) {
    out.push(
      `university mismatch: letter says "${extracted.university_name}", user picked "${expected.destinationUni}"`,
    );
  }
  if (
    extracted.intake_term &&
    expected.intake &&
    !looselyEqual(extracted.intake_term, expected.intake)
  ) {
    out.push(
      `intake mismatch: letter says "${extracted.intake_term}", user picked "${expected.intake}"`,
    );
  }
  return out;
}

function looselyEqual(a: string, b: string): boolean {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const an = norm(a);
  const bn = norm(b);
  if (!an || !bn) return false;
  return an === bn || an.includes(bn) || bn.includes(an);
}
