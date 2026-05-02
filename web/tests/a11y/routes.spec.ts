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

for (const route of [...ROUTES_PUBLIC, ...ROUTES_SIGNUP, ...ROUTES_APP]) {
  test(`a11y · ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations, `axe violations on ${route}`).toEqual([]);
  });
}
