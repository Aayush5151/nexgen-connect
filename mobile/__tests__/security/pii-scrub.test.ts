/**
 * Unit tests — PII scrubbing.
 *
 * Validates the SDK-level filter that prevents PII from reaching
 * Sentry / PostHog. Per Build Prompt §Bucket 3:
 *   "Phone numbers must be masked (last-4 only)."
 *   "Aadhaar VIDs and tokens are NEVER logged."
 *   "PostHog event properties whitelisted; names are NEVER sent to
 *    analytics."
 *
 * v6 build §16, §21 / Build Prompt Bucket 6.
 */
import {
  maskPhone,
  maskEmail,
  scrubObject,
  sentryBeforeSend,
  filterAnalyticsProperties,
  POSTHOG_PROPERTY_WHITELIST,
} from "@/lib/security/pii-scrub";

describe("maskPhone", () => {
  it("masks E.164 to last-4 only", () => {
    expect(maskPhone("919876543210")).toBe("********3210");
  });
  it("strips non-digits", () => {
    expect(maskPhone("+91 98765-43210")).toBe("********3210");
  });
  it("handles short input", () => {
    expect(maskPhone("12")).toBe("****");
  });
});

describe("maskEmail", () => {
  it("masks email to first-char + domain", () => {
    expect(maskEmail("alice@example.com")).toBe("a***@example.com");
  });
  it("returns *** for malformed input", () => {
    expect(maskEmail("nope")).toBe("***");
    expect(maskEmail("@only.com")).toBe("***");
  });
});

describe("scrubObject", () => {
  it("redacts known PII keys", () => {
    const input = {
      userId: "u-1",
      phone: "919876543210",
      email: "alice@example.com",
      aadhaar: "1234-5678-9012",
      session_token: "secret",
    };
    const result = scrubObject(input) as Record<string, unknown>;
    expect(result.userId).toBe("u-1");
    expect(result.phone).toBe("[REDACTED]");
    expect(result.email).toBe("[REDACTED]");
    expect(result.aadhaar).toBe("[REDACTED]");
    expect(result.session_token).toBe("[REDACTED]");
  });
  it("redacts case-insensitive variants", () => {
    expect((scrubObject({ Phone: "x" }) as Record<string, string>).Phone).toBe("[REDACTED]");
    expect((scrubObject({ E164: "x" }) as Record<string, string>).E164).toBe("[REDACTED]");
  });
  it("recurses into nested objects", () => {
    const input = { user: { id: "u-1", phone: "919876543210" } };
    const result = scrubObject(input) as Record<string, Record<string, unknown>>;
    expect(result.user.id).toBe("u-1");
    expect(result.user.phone).toBe("[REDACTED]");
  });
  it("recurses into arrays", () => {
    const input = [{ phone: "919876543210" }, { name: "Alice" }];
    const result = scrubObject(input) as Record<string, unknown>[];
    expect(result[0].phone).toBe("[REDACTED]");
    expect(result[1].name).toBe("[REDACTED]");
  });
  it("preserves non-PII primitives", () => {
    const input = { count: 42, ok: true, ratio: 0.85 };
    const result = scrubObject(input);
    expect(result).toEqual(input);
  });
  it("stops at depth 8", () => {
    let nest: unknown = { phone: "x" };
    for (let i = 0; i < 12; i++) nest = { inner: nest };
    const result = scrubObject(nest);
    expect(JSON.stringify(result)).toContain("DEPTH_LIMIT");
  });
});

describe("sentryBeforeSend", () => {
  it("scrubs event request body", () => {
    const event = {
      request: { url: "https://api.example.com/x", body: { phone: "919876543210" } },
    };
    const result = sentryBeforeSend(event) as { request: { body: { phone: string } } };
    expect(result.request.body.phone).toBe("[REDACTED]");
  });
  it("strips PII query params from URLs", () => {
    const event = {
      request: { url: "https://api.example.com/verify?phone=919876543210&ok=1", body: {} },
    };
    const result = sentryBeforeSend(event) as { request: { url: string } };
    expect(result.request.url).not.toContain("919876543210");
    expect(result.request.url).toContain("ok=1");
  });
});

describe("filterAnalyticsProperties / POSTHOG_PROPERTY_WHITELIST", () => {
  it("drops non-whitelist keys", () => {
    const result = filterAnalyticsProperties({
      count: 5,
      phone: "919876543210", // NOT whitelisted
      name: "Alice", // NOT whitelisted
      isFirstTimer: true,
    });
    expect(result).toEqual({ count: 5, isFirstTimer: true });
  });
  it("returns undefined for undefined input", () => {
    expect(filterAnalyticsProperties(undefined)).toBeUndefined();
  });
  it("whitelist contains expected funnel keys", () => {
    expect(POSTHOG_PROPERTY_WHITELIST.has("isValidIN")).toBe(true);
    expect(POSTHOG_PROPERTY_WHITELIST.has("count")).toBe(true);
    expect(POSTHOG_PROPERTY_WHITELIST.has("category")).toBe(true);
  });
  it("whitelist excludes PII keys", () => {
    expect(POSTHOG_PROPERTY_WHITELIST.has("phone")).toBe(false);
    expect(POSTHOG_PROPERTY_WHITELIST.has("email")).toBe(false);
    expect(POSTHOG_PROPERTY_WHITELIST.has("name")).toBe(false);
    expect(POSTHOG_PROPERTY_WHITELIST.has("aadhaar")).toBe(false);
    expect(POSTHOG_PROPERTY_WHITELIST.has("dob")).toBe(false);
  });
});
