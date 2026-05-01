/**
 * Unit tests — session manager idle timeout.
 *
 * Build Prompt §Bucket 3: "15-minute idle timeout for un-verified
 * users (phone-only state). 7-day idle timeout for fully verified
 * users."
 *
 * Validates that:
 *   - phone-only stage hits idle threshold at 15 minutes.
 *   - fully-verified stage waits 7 days.
 *   - unauthenticated stage never times out.
 *   - bumpActivity() resets the clock.
 *
 * v6 build §16 / Build Prompt Bucket 6.
 */
import {
  bumpActivity,
  idleDurationMs,
  idleThresholdFor,
  _setLastActivityForTest,
} from "@/lib/security/session-manager";

describe("idleThresholdFor", () => {
  it("returns 15min for phone_only", () => {
    expect(idleThresholdFor("phone_only")).toBe(15 * 60 * 1000);
  });
  it("returns 7 days for fully_verified", () => {
    expect(idleThresholdFor("fully_verified")).toBe(7 * 24 * 60 * 60 * 1000);
  });
  it("returns Infinity for unauthenticated", () => {
    expect(idleThresholdFor("unauthenticated")).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("bumpActivity / idleDurationMs", () => {
  beforeEach(() => {
    bumpActivity();
  });
  it("resets idle to ~0 on bump", () => {
    expect(idleDurationMs()).toBeLessThan(50);
  });
  it("idleDurationMs increases when last activity is in the past", () => {
    _setLastActivityForTest(Date.now() - 60_000);
    expect(idleDurationMs()).toBeGreaterThanOrEqual(60_000);
  });
});
