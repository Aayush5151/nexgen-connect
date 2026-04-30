/**
 * Unit tests — cert-pinning configuration.
 *
 * Validates the declarative pin map covers the six required production
 * hosts and that PINNING_ENABLED matches the env.
 *
 * v6 build §11 / Build Prompt Bucket 6.
 */
import { PINNED_HOSTS, PINNING_ENABLED } from "@/lib/security/cert-pinning";

describe("PINNED_HOSTS", () => {
  it("covers all six required production hosts", () => {
    const hostnames = PINNED_HOSTS.map((h) => h.hostname);
    expect(hostnames).toEqual(
      expect.arrayContaining([
        "nexgen-connect-api.vercel.app",
        "api.razorpay.com",
        "api.digitallocker.gov.in",
        "*.supabase.co",
        "api.twilio.com",
        "api.stripe.com",
      ]),
    );
  });
  it("each host has a rationale", () => {
    for (const h of PINNED_HOSTS) {
      expect(h.rationale.length).toBeGreaterThan(10);
    }
  });
});

describe("PINNING_ENABLED", () => {
  it("is OFF in dev (jest sets __DEV__=true)", () => {
    // @ts-expect-error global __DEV__ flag
    if (typeof __DEV__ === "boolean" && __DEV__) {
      expect(PINNING_ENABLED).toBe(false);
    }
  });
});
