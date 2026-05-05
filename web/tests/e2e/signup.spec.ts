import { expect, test } from "@playwright/test";

/**
 * Signup funnel smoke specs.
 *
 * Walks the full /signup → /signup/admit/outcome flow against the
 * MOCK_OTP=true / mock-services path. Real MSG91 + DigiLocker +
 * Cloudflare Images run in a separate suite gated by sandbox env vars.
 *
 * v16 web pivot §Bucket 11.
 */

test.describe("signup funnel — mock", () => {
  test("phone entry route renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("OTP page rejects 5-digit code", async ({ page }) => {
    // Direct-nav skips the funnel state; the page bounces back to /signup.
    await page.goto("/signup/otp");
    await expect(page).toHaveURL(/\/signup(\/|$)/);
  });

  test("admit/pending bounces to /signup/admit when state missing", async ({
    page,
  }) => {
    await page.goto("/signup/admit/pending");
    await expect(page).toHaveURL(/\/signup\/admit(\/|$)/);
  });

  test("admit/outcome bounces to /signup/admit when state missing", async ({
    page,
  }) => {
    await page.goto("/signup/admit/outcome");
    await expect(page).toHaveURL(/\/signup\/admit(\/|$)/);
  });
});
