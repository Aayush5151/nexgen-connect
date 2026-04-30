/**
 * Detox spec — Flow 1 of 7 critical flows (Build Prompt §Bucket 6):
 *   "Signup → OTP → DigiLocker happy path → admit upload →
 *    verification waiting → Layer 2 placement."
 *
 * Status: SKELETON. Runs against the dev simulator with mock backend
 * (MOCK_OTP=true, MOCK_DIGILOCKER=true). Real-network E2E lands when
 * TestFlight credentials clear per C5.
 *
 * The remaining six flows (DigiLocker S27/S28 fallbacks, S31 hybrid
 * warning, Layer 2 unlock event, Premium → Parent dashboard, 4-hour
 * harassment SLA) follow the same structure — each is a standalone
 * spec file in this directory.
 *
 * v6 build §23 / Build Prompt Bucket 6.
 */
/// <reference types="detox" />

describe("Flow 1: Signup → OTP → DigiLocker → admit → Layer 2", () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true, newInstance: true });
  });

  it("renders welcome and starts onboarding", async () => {
    await expect(element(by.text("Find your people"))).toBeVisible();
    await element(by.text("Continue")).tap();
  });

  it("submits IN phone number and receives OTP", async () => {
    await element(by.id("phone-input")).typeText("9876543210");
    await element(by.text("Send code")).tap();
    await waitFor(element(by.id("otp-input")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("enters magic dev OTP and verifies", async () => {
    // MOCK_OTP=true → dev code is 123456
    await element(by.id("otp-input")).typeText("123456");
    await waitFor(element(by.text("What scares you most about September?")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("skips O3a scared prompt and continues to YOU screen", async () => {
    await element(by.text("Skip")).tap();
    await waitFor(element(by.text("Tell us about you")))
      .toBeVisible()
      .withTimeout(3000);
  });

  it("completes profile and corridor wizard", async () => {
    await element(by.id("first-name-input")).typeText("Aayush");
    await element(by.id("home-city-input")).typeText("Pune");
    await element(by.text("Continue")).tap();
    // Corridor wizard step 0: RC question
    await element(by.text("First time")).tap();
    // Step 1-4: country / city / uni / intake
    await element(by.text("Ireland")).tap();
    await element(by.text("Dublin")).tap();
    await element(by.text("University College Dublin")).tap();
    await element(by.text("September 2026")).tap();
    await element(by.text("See your corridor")).tap();
  });

  it("shows preview with Layer 2 count = 95 (mock)", async () => {
    await waitFor(element(by.text("95")))
      .toBeVisible()
      .withTimeout(3000);
  });

  it("completes DigiLocker mock + admit upload", async () => {
    await element(by.text("Continue to verification")).tap();
    await element(by.text("Open DigiLocker")).tap();
    // mock returns success immediately
    await waitFor(element(by.text("Identity verified")))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.text("Continue")).tap();
    await element(by.text("Upload admit letter")).tap();
    // mock fileSize 5MB application/pdf
    await element(by.id("admit-mock-pdf")).tap();
    await element(by.text("Submit")).tap();
  });

  it("lands on the corridor home post-approval (mock auto-approves)", async () => {
    await waitFor(element(by.text("UCD · September 2026")))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.text("95 verified · group chat live"))).toBeVisible();
  });
});
