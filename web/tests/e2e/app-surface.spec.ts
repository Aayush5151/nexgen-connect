import { expect, test } from "@playwright/test";

/**
 * Authed product-surface smoke specs (mock data).
 *
 * v16 web pivot §Bucket 11.
 */

test.describe("/app/* surfaces", () => {
  test("/app redirects to /app/corridor", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app\/corridor$/);
  });

  test("/app/corridor renders Layer cards", async ({ page }) => {
    await page.goto("/app/corridor");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Hometown crew|First five/)).toBeVisible();
  });

  test("/app/chat lists threads", async ({ page }) => {
    await page.goto("/app/chat");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/app/help shows triage tiles", async ({ page }) => {
    await page.goto("/app/help");
    await expect(page.getByText("Harassment", { exact: false })).toBeVisible();
    await expect(page.getByText(/scam/i)).toBeVisible();
  });

  test("/app/help/scams lists 5 patterns", async ({ page }) => {
    await page.goto("/app/help/scams");
    const patterns = page.getByText(/Pattern \d/);
    await expect(patterns).toHaveCount(5);
  });

  test("/app/profile shows ₹999 upsell", async ({ page }) => {
    await page.goto("/app/profile");
    await expect(page.getByText(/999/)).toBeVisible();
  });
});

test.describe("/app/profile/y6 — arrival check-in", () => {
  test("renders the one-ping copy", async ({ page }) => {
    await page.goto("/app/profile/y6");
    await expect(page.getByText(/One ping/i)).toBeVisible();
    await expect(page.getByText(/no GPS/i)).toBeVisible();
  });
});
