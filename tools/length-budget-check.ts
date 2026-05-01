/**
 * Length-budget enforcement.
 *
 * Build Prompt §Bucket 8: "Length-budget enforcement: any HI or TA/MR
 * string >150% of EN length triggers a CI warning. Layout adjustments
 * must accommodate."
 *
 * Strategy: walk every key in every locale, compare its rendered
 * length to EN. Anything past the 150% threshold is reported. CI
 * surfaces the warning; engineers either tighten the translation,
 * widen the screen layout, or both.
 *
 * Exit codes:
 *   0 — no overflow (≤150% on every key) OR --warn-only
 *   1 — overflow found, --strict mode
 *
 * Usage:
 *   npm run length-budget                      # --warn-only (default)
 *   npm run length-budget -- --strict          # exit 1 on any overflow
 *
 * v6 build §20 / Build Prompt Bucket 8.
 */
import { _keysIn, pick, type Locale } from "@nexgen-connect/copy";

const NON_EN_LOCALES: Locale[] = ["hi", "mr"];
const NAMESPACES = [
  "onboarding",
  "verification",
  "premium",
  "errors",
  "push",
  "empty-states",
  "corridor",
  "chat",
  "safety",
] as const;

const THRESHOLD = 1.5; // 150%

interface Overflow {
  locale: Locale;
  namespace: string;
  key: string;
  enLength: number;
  localeLength: number;
  ratio: number;
}

function main(): void {
  const strict = process.argv.includes("--strict");
  const overflows: Overflow[] = [];

  for (const locale of NON_EN_LOCALES) {
    for (const namespace of NAMESPACES) {
      const keys = _keysIn(locale, namespace as Parameters<typeof _keysIn>[1]);
      for (const key of keys) {
        const en = pick("en", namespace as Parameters<typeof pick>[1], key);
        const localized = pick(locale, namespace as Parameters<typeof pick>[1], key);
        // If the locale falls back to EN (no localized value), the strings
        // are equal — ratio = 1.0 — no overflow. Skip.
        if (localized === en) continue;
        const ratio = localized.length / Math.max(1, en.length);
        if (ratio > THRESHOLD) {
          overflows.push({
            locale,
            namespace: String(namespace),
            key,
            enLength: en.length,
            localeLength: localized.length,
            ratio,
          });
        }
      }
    }
  }

  if (overflows.length === 0) {
    console.log(`✓ length-budget: no overflows over ${THRESHOLD * 100}% threshold.`);
    process.exit(0);
  }

  console.log(`length-budget: ${overflows.length} string(s) over ${THRESHOLD * 100}%:`);
  console.log("");
  console.log(
    "locale".padEnd(8) +
      "namespace".padEnd(15) +
      "ratio".padEnd(10) +
      "key".padEnd(40) +
      "EN→localized",
  );
  console.log("-".repeat(110));
  for (const o of overflows.sort((a, b) => b.ratio - a.ratio)) {
    console.log(
      o.locale.padEnd(8) +
        o.namespace.padEnd(15) +
        `${(o.ratio * 100).toFixed(0)}%`.padEnd(10) +
        o.key.padEnd(40) +
        `${o.enLength}→${o.localeLength}`,
    );
  }
  console.log("");
  console.log("Fixes:");
  console.log("  - Tighten the translation (preferred).");
  console.log("  - Widen the screen layout to accommodate.");
  console.log("  - Add a {key}-mobile shorter variant if the desktop translation is canonical.");

  process.exit(strict ? 1 : 0);
}

main();
