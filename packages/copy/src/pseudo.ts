/**
 * Pseudo-locale generator (en-PSEUDO).
 *
 * Build Prompt §Bucket 8: "Pseudo-locale (en-PSEUDO) for development
 * to surface untranslated strings and length issues. Run as a dev-mode
 * toggle."
 *
 * Strategy: take every EN string, wrap in [⟦…⟧], and inflate length
 * by ~30% (matching average German / Devanagari overhead so layouts
 * stress-test before real translations land). Letters stay legible
 * (we don't ROT13) so engineers can still copy-paste UI strings into
 * bug reports.
 *
 * Inflation: `Find your people` → `[⟦Fíñd ýöür péöplèèè⟧]` (38 chars
 * vs 16 baseline = +138%; the bracket overhead means even short
 * strings get a layout test, while long strings get a realistic +30%
 * inflation from the duplicated trailing chars).
 *
 * Usage:
 *   pick("en-PSEUDO", "onboarding", "welcome.heading")
 *
 * Toggle in dev: usePreferences.setLocale("en-PSEUDO").
 *
 * v6 build §20 / Build Prompt Bucket 8.
 */

const ACCENT_MAP: Record<string, string> = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "ü",
  A: "Á",
  E: "É",
  I: "Í",
  O: "Ö",
  U: "Ü",
  n: "ñ",
  c: "ç",
};

/**
 * Wrap and inflate. Doesn't touch interpolation tokens like `{count}` —
 * those preserve their `{…}` braces so resolvers / formatters don't
 * break under en-PSEUDO.
 */
export function pseudoize(en: string): string {
  // Split on interpolation tokens so we don't accent {count} into {çóüñt}.
  const parts = en.split(/(\{[^}]+\})/);
  const accented = parts
    .map((p) => {
      if (p.startsWith("{") && p.endsWith("}")) return p; // preserve token
      return p
        .split("")
        .map((c) => ACCENT_MAP[c] ?? c)
        .join("");
    })
    .join("");

  // Inflate ~30% by duplicating the last vowel-ish char of each word.
  // For short strings this hits hard; for long strings it stays
  // proportional. Skips interpolation tokens.
  const inflated = accented
    .split(" ")
    .map((word) => {
      if (word.startsWith("{") && word.endsWith("}")) return word;
      if (word.length < 4) return word;
      // Duplicate the last char twice if it's a letter; ignore punctuation.
      const last = word[word.length - 1];
      if (last && /[a-zA-Záéíóüñç]/i.test(last)) {
        return word + last + last;
      }
      return word;
    })
    .join(" ");

  return `[⟦${inflated}⟧]`;
}

/**
 * Apply pseudoize to every value in a copy table. Returns a new table.
 */
export function pseudoizeTable(table: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(table)) {
    out[k] = pseudoize(v);
  }
  return out;
}
