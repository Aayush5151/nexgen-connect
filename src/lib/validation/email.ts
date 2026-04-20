/**
 * Email validation. A single source of truth used by every waitlist form
 * so inline validation, on-submit validation, and the server action all
 * produce the same error message. Each branch returns a user-facing
 * sentence - never a developer string - and a `code` a caller can key
 * off for analytics or styling.
 */

export type EmailValidation =
  | { ok: true; email: string; suggestion?: string }
  | { ok: false; code: EmailErrorCode; error: string; suggestion?: string };

export type EmailErrorCode =
  | "empty"
  | "too_short"
  | "too_long"
  | "whitespace"
  | "missing_at"
  | "multiple_at"
  | "missing_local"
  | "missing_domain"
  | "missing_tld"
  | "short_tld"
  | "invalid_chars"
  | "consecutive_dots"
  | "invalid_format";

// Popular domains, used only for "did you mean ...?" correction hints.
const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "me.com",
  "live.com",
  "aol.com",
  "edu.in",
] as const;

// Exact typo → correction. Caught *before* the distance fallback so
// the hint is deterministic for the common cases.
const TYPO_MAP: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.om": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "outloook.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "icoud.com": "icloud.com",
  "iclou.com": "icloud.com",
  "protonmail.co": "protonmail.com",
};

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const next =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(prev, row[j - 1], row[j]);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Suggest a close domain for a likely typo. Returns the corrected
 * full email (local part kept, domain swapped) or undefined if no
 * confident suggestion is available.
 */
export function suggestEmailCorrection(email: string): string | undefined {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return undefined;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();

  if (TYPO_MAP[domain]) return `${local}@${TYPO_MAP[domain]}`;

  // Distance fallback - only suggest if within 2 edits and not already
  // in the known-good set (avoid suggesting "gmail.com" to "gmail.com").
  if (COMMON_DOMAINS.some((d) => d === domain)) return undefined;
  let best: { domain: string; dist: number } | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(domain, d);
    if (dist <= 2 && (!best || dist < best.dist)) {
      best = { domain: d, dist };
    }
  }
  return best ? `${local}@${best.domain}` : undefined;
}

/**
 * Validate an email address with explicit, user-facing error messages.
 * Normalises the email (trim + lowercase) before validating so we never
 * mismatch with the server action.
 */
export function validateEmail(raw: string): EmailValidation {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      ok: false,
      code: "empty",
      error: "Enter your email to get notified.",
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      ok: false,
      code: "whitespace",
      error: "Remove the space in your email.",
    };
  }

  if (trimmed.length < 5) {
    return {
      ok: false,
      code: "too_short",
      error: "That email looks too short. Double-check the spelling.",
    };
  }

  if (trimmed.length > 254) {
    return {
      ok: false,
      code: "too_long",
      error: "That email is too long. The limit is 254 characters.",
    };
  }

  const atCount = (trimmed.match(/@/g) ?? []).length;
  if (atCount === 0) {
    return {
      ok: false,
      code: "missing_at",
      error: "Add an @ symbol - e.g. you@school.edu.",
    };
  }
  if (atCount > 1) {
    return {
      ok: false,
      code: "multiple_at",
      error: "Too many @ symbols. An email has exactly one.",
    };
  }

  const lowered = trimmed.toLowerCase();
  const [local, domain] = lowered.split("@");

  if (!local) {
    return {
      ok: false,
      code: "missing_local",
      error: "Add the part before the @ - e.g. you@school.edu.",
    };
  }

  if (!domain) {
    return {
      ok: false,
      code: "missing_domain",
      error: "Add a domain after the @ - e.g. you@school.edu.",
    };
  }

  if (lowered.includes("..")) {
    return {
      ok: false,
      code: "consecutive_dots",
      error: "Remove the double dots in your email.",
    };
  }

  if (!domain.includes(".")) {
    return {
      ok: false,
      code: "missing_tld",
      error: "Add a domain ending, like .com or .edu.",
    };
  }

  const tld = domain.split(".").pop() ?? "";
  if (tld.length < 2) {
    return {
      ok: false,
      code: "short_tld",
      error: "That domain ending looks off. Try .com, .edu, .in, or similar.",
    };
  }

  // Disallow anything outside the standard email charset. This is
  // deliberately stricter than RFC 5321 to catch paste-typos like
  // trailing commas or quotes.
  if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i.test(lowered)) {
    return {
      ok: false,
      code: "invalid_format",
      error: "That email looks off. Check for stray characters.",
    };
  }

  // Domain must not start or end with . or - (common paste issue)
  if (/^[.\-]|[.\-]$/.test(domain)) {
    return {
      ok: false,
      code: "invalid_chars",
      error: "Your domain starts or ends with an invalid character.",
    };
  }

  const suggestion = suggestEmailCorrection(lowered);
  return { ok: true, email: lowered, ...(suggestion ? { suggestion } : {}) };
}
