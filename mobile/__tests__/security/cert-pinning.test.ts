/**
 * Unit tests — cert-pinning configuration + fail-closed contract.
 *
 * Validates:
 *   - The declarative pin map covers the six required production hosts.
 *   - PINNING_ENABLED defaults to false until real SPKIs land
 *     (post-Bucket-10 review item 1).
 *   - assertPinningCoherent throws when pinning is enabled but any
 *     host has no SPKI fingerprints — the false-signal state we never
 *     want shipping.
 *
 * v6 build §11 / Build Prompt Bucket 6 + post-Bucket-10 review.
 */
import {
  PINNED_HOSTS,
  PINNING_ENABLED,
  assertPinningCoherent,
  type PinnedHost,
} from "@/lib/security/cert-pinning";

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
  it("defaults to false until real SPKIs land", () => {
    // Per post-Bucket-10 review item 1: pinning stays off — explicitly
    // — until production SPKIs are extracted via mobile/docs/cert-
    // pinning.md "Initial extraction" AND the native module is wired
    // (post-Bucket-5 EAS Build).
    expect(PINNING_ENABLED).toBe(false);
  });
  it("is coherent with the current pin map (no module-load throw)", () => {
    // The module did its self-check at import time. If it had
    // thrown, this file wouldn't have loaded — the fact that we got
    // here is evidence enough, but assert the same condition
    // explicitly for clarity.
    expect(() => assertPinningCoherent(PINNING_ENABLED, PINNED_HOSTS)).not.toThrow();
  });
});

describe("assertPinningCoherent — fail-closed contract", () => {
  const hostWithEmptyPins: PinnedHost = {
    hostname: "example.com",
    publicKeyHashes: [],
    rationale: "test fixture",
  };
  const hostWithRealPin: PinnedHost = {
    hostname: "example.com",
    publicKeyHashes: ["sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
    rationale: "test fixture",
  };

  it("does NOT throw when pinning is disabled (the current default)", () => {
    expect(() => assertPinningCoherent(false, [hostWithEmptyPins])).not.toThrow();
  });

  it("does NOT throw when pinning is enabled and every host has pins", () => {
    expect(() => assertPinningCoherent(true, [hostWithRealPin])).not.toThrow();
  });

  it("THROWS when pinning is enabled but any host has empty pins", () => {
    expect(() => assertPinningCoherent(true, [hostWithEmptyPins])).toThrow(
      /cert-pinning: PINNING_ENABLED=true but example\.com has no SPKI fingerprints/,
    );
  });

  it("THROWS even when most hosts are populated and only one is empty", () => {
    expect(() =>
      assertPinningCoherent(true, [hostWithRealPin, hostWithEmptyPins]),
    ).toThrow(/example\.com has no SPKI fingerprints/);
  });

  it("error message points the reader at the rotation doc", () => {
    try {
      assertPinningCoherent(true, [hostWithEmptyPins]);
      throw new Error("should have thrown");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      expect(message).toContain("mobile/docs/cert-pinning.md");
      expect(message).toContain("Never claim security you don't deliver");
    }
  });
});
