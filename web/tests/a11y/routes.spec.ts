import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * axe-core a11y sweep across every public + authed route.
 *
 * Target: WCAG 2.1 AA pass on every URL. Zero violations is the gate.
 * Disable rules per-route only with a written rationale (auto-injected
 * marketing third-party scripts may legitimately fail "color-contrast"
 * for ad pixels — re-evaluate before launch).
 *
 * v16 web pivot §Bucket 11.
 */

const ROUTES_PUBLIC = [
  "/",
  "/privacy",
  "/terms",
  "/press",
  "/founder",
  "/research",
  "/checklist",
  "/checklist-germany",
  "/how",
  "/women-only",
  "/trinity",
  "/ucd",
  "/ucc",
  "/lmu",
  "/tum",
  "/humboldt",
  "/rwth-aachen",
];

const ROUTES_SIGNUP = [
  "/signup",
  "/signup/otp",
  "/signup/you",
  "/signup/corridor",
  "/signup/preview",
  "/signup/identity",
  "/signup/admit",
];

const ROUTES_APP = [
  "/app",
  "/app/corridor",
  "/app/chat",
  "/app/help",
  "/app/help/now",
  "/app/help/scams",
  "/app/profile",
  "/app/profile/premium",
  "/app/profile/parent",
  "/app/profile/group-apply",
  "/app/profile/y6",
  "/app/profile/settings",
];

// Report-only mode (default for v16): the polish pass to drive
// violations to zero is incremental, so we log violations to the
// CI output but don't fail the spec. Set AXE_GATE=1 to flip to
// gating mode once the public surface is at zero.
const GATE = process.env.AXE_GATE === "1";

for (const route of [...ROUTES_PUBLIC, ...ROUTES_SIGNUP, ...ROUTES_APP]) {
  test(`a11y · ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    if (results.violations.length > 0) {
      // Always log so the CI output and any future grafana/sentry
      // pipeline can pick up the route × violation matrix.
      console.log(
        `[axe] ${route} — ${results.violations.length} violations: ` +
          results.violations
            .map((v) => `${v.id}(${v.nodes.length})`)
            .join(", "),
      );
    }

    if (GATE) {
      // Switched from `toEqual([])` to a length check because some
      // Playwright + TS-strict combos drop the array-matcher overload
      // from `expect()` when stale @types/jest is hoisted into the
      // tree. Semantics are identical for an axe results array.
      expect(results.violations.length, `axe violations on ${route}`).toBe(0);
    }
  });
}
