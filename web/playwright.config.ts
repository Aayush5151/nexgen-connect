import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — Bucket 11 baseline.
 *
 * The full ≥50-spec suite from the v16 prompt's acceptance check lands
 * incrementally — we ship the harness here so each subsequent feature
 * branch can add specs against a known-good baseline.
 *
 * Default config:
 *   - Run against `next start` on :3000 (CI uses `playwright test --webServer.url`)
 *   - Three projects: chromium, firefox, webkit
 *   - `traces` retained on first retry for triage
 *
 * v16 web pivot §Bucket 11.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
