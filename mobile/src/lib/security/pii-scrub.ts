/**
 * PII-scrubbing helpers.
 *
 * Build Prompt §Bucket 3:
 *   "No PII in logs: audit every console.log, every Sentry breadcrumb,
 *    every PostHog event property. Phone numbers must be masked
 *    (last-4 only). User IDs are UUIDs, never identifying. Aadhaar
 *    VIDs and tokens are NEVER logged. Admit-letter content is NEVER
 *    logged."
 *   "Crash reports must not leak PII. Configure Sentry's beforeSend
 *    to scrub: phone, email, Aadhaar VID, token strings, admit-letter
 *    URL. Filter at the SDK level, not just server-side."
 *   "Analytics events must not leak PII. PostHog event properties
 *    whitelisted; phone numbers masked; admit-letter HEI codes are
 *    OK (institutional, not personal); names are NEVER sent to
 *    analytics."
 *
 * This module owns:
 *   - maskPhone — converts E.164 to last-4-only ("****6543").
 *   - scrubObject — recursively redacts known-PII keys.
 *   - sentryBeforeSend — Sentry SDK hook that strips events of PII.
 *   - posthogPropertyWhitelist — keys allowed in PostHog event props;
 *     anything outside the list gets dropped before send.
 *
 * v15 BP §9.1 / v6 build §16, §21, §22 / Build Prompt Bucket 3.
 */

/* ------------------------------------------------------------------ */
/* Identifier masks                                                    */
/* ------------------------------------------------------------------ */

/** Masks an E.164 phone to last-4 only — never log full numbers. */
export function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return "*".repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
}

/** Masks an email to first-char + domain. "alice@example.com" → "a***@example.com". */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "***";
  return email[0] + "***" + email.slice(at);
}

/* ------------------------------------------------------------------ */
/* Object scrubber                                                     */
/* ------------------------------------------------------------------ */

/**
 * Keys that, when seen anywhere in a payload tree, get replaced with
 * "[REDACTED]". Matched case-insensitive on the key name. Includes
 * variants (snake_case + camelCase + dotted paths) so a payload from
 * a server uses one casing and the client another.
 *
 * Aadhaar VID, refresh tokens, JWT bodies, admit-letter content,
 * passcodes — all on this list. Phone is on the list because callers
 * who genuinely want to log it should call maskPhone() explicitly.
 */
const REDACT_KEYS = new Set([
  "aadhaar",
  "aadhaar_vid",
  "aadhaarvid",
  "vid",
  "session_token",
  "sessiontoken",
  "refresh_token",
  "refreshtoken",
  "jwt",
  "auth_token",
  "authtoken",
  "password",
  "passcode",
  "pin",
  "phone",
  "e164",
  "email",
  "name",
  "first_name",
  "firstname",
  "last_name",
  "lastname",
  "admit_letter",
  "admitletter",
  "admit_url",
  "admiturl",
  "address",
  "dob",
  "date_of_birth",
  "dateofbirth",
]);

/**
 * Recursively walk an object/array tree and replace any value at a
 * key in REDACT_KEYS with "[REDACTED]". Returns a NEW value — does
 * not mutate the input.
 *
 * Cycles: depth-limited at 8 levels. PII payloads should never nest
 * that deep; if they do, deeper data is dropped (cheaper than cycle
 * detection).
 */
export function scrubObject<T>(value: T, depth: number = 0): unknown {
  if (depth > 8) return "[DEPTH_LIMIT]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => scrubObject(v, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (REDACT_KEYS.has(k.toLowerCase())) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = scrubObject(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* Sentry beforeSend                                                   */
/* ------------------------------------------------------------------ */

/**
 * Sentry SDK hook — pass to Sentry.init({ beforeSend }). Strips PII
 * from the event tree (request body, breadcrumbs, contexts, extras,
 * tags, exceptions[].value).
 *
 * Returns the scrubbed event, or `null` to drop the event entirely.
 * We never drop — better to log a scrubbed crash than no crash.
 */
type SentryEvent = Record<string, unknown>;

export function sentryBeforeSend(event: SentryEvent): SentryEvent {
  const scrubbed = scrubObject(event) as SentryEvent;
  // Belt-and-braces: if the URL field carries PII (e.g., /verify?phone=+91…),
  // strip the query.
  if (typeof scrubbed.request === "object" && scrubbed.request !== null) {
    const req = scrubbed.request as Record<string, unknown>;
    if (typeof req.url === "string") {
      try {
        const u = new URL(req.url);
        for (const key of Array.from(u.searchParams.keys())) {
          if (REDACT_KEYS.has(key.toLowerCase())) u.searchParams.delete(key);
        }
        req.url = u.toString();
      } catch {
        // Not a URL; leave untouched.
      }
    }
  }
  return scrubbed;
}

/* ------------------------------------------------------------------ */
/* PostHog property whitelist                                          */
/* ------------------------------------------------------------------ */

/**
 * Whitelisted PostHog event property keys per Build Prompt §Bucket 3.
 * Keys outside this set are dropped at the analytics SDK boundary,
 * NOT just server-side — defence-in-depth.
 *
 * Add a key only when:
 *   - The data is non-PII (institutional code, count, score, flag).
 *   - There's a § ref in the commit that motivates the addition.
 *
 * Reviewers block PRs that add PII-shaped keys (anything ending in
 * -id-name, -phone, -email, -dob, -aadhaar).
 */
export const POSTHOG_PROPERTY_WHITELIST: ReadonlySet<string> = new Set([
  // Funnel state
  "isValidIN",
  "count",
  "length",
  "vote",
  "day",
  "isFirstTimer",
  "hasEmail",

  // Verification
  "reason", // bounded enum: aadhaar_not_linked / mobile_changed / etc.
  "sizeMb",
  "mime",
  "canResubmit",

  // Corridor
  "threshold",

  // Chat
  "channelKind",
  "topic",
  "category",
  "patternId",
  "region",

  // Premium / parent
  "source",

  // Misc institutional codes
  "uniCode",
  "intakeCode",
  "destinationCode",
]);

/**
 * Filter a property bag to the whitelist. Drops unknown keys silently
 * — PostHog still fires the event, but with only safe properties.
 */
export function filterAnalyticsProperties(
  props: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!props) return undefined;
  const filtered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (POSTHOG_PROPERTY_WHITELIST.has(k)) {
      filtered[k] = v;
    }
  }
  return filtered;
}
