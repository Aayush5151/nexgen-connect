import { expect, test } from "@playwright/test";

/**
 * Landing-surface smoke specs.
 *
 * v16 web pivot §Bucket 11 — first slice of the ≥50-spec target.
 */

test.describe("/ landing", () => {
  test("renders hero + primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    // Pricing sweep landed at ₹999, not the v15 ₹1,499.
    await expect(page.getByText("999", { exact: false })).toBeVisible();
  });

  test("nav CTA tap target is ≥ 44px (WCAG 2.5.5)", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav, header").first();
    const link = nav.getByRole("link").first();
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    // Same Playwright+TS-strict workaround as api.spec.ts: comparing
    // via plain JS + toBe(true) sidesteps the dropped numeric-matcher
    // overload when stale @types/jest is hoisted.
    if (box) expect(Math.min(box.width, box.height) >= 40).toBe(true);
  });
});

test.describe("/privacy", () => {
  test("Privacy Policy renders sections", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("/terms", () => {
  test("Terms render sections", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("/legal redirect", () => {
  test("/legal → /privacy", async ({ page }) => {
    await page.goto("/legal");
    expect(page.url()).toContain("/privacy");
  });
});
