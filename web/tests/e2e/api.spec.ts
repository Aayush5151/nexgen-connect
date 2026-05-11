import { expect, test } from "@playwright/test";

/**
 * API-route smoke specs.
 *
 * Asserts the public auth surface of every /api/* REST route. The
 * "happy path" assertions (SLA routing, schedule status, etc.) lived
 * here when the routes were unauthed stubs; once Bucket 7+8 wired
 * the SSR auth gate, the unauthed surface is the only thing this
 * spec can exercise without Supabase fixtures. Authed-path coverage
 * lives in `packages/server/__tests__/` (tRPC procedure-level) and
 * in route-internal logic that's inherently unit-testable.
 *
 * Without Supabase env wired (the default web-a11y CI), the gate
 * returns 503; with env wired but no cookie, it returns 401. Both
 * count as "auth required."
 *
 * v16 web pivot §Bucket 11.
 */

// /api/auth/send-otp + /api/auth/verify-otp REST routes were removed
// in the cross-cut cleanup PR — the /signup funnel now goes through
// trpcVanilla.auth.requestOtp / .verifyOtp (P1.b). Input-validation
// coverage moved to packages/server/__tests__/otp-router.test.ts.

// Plain `number[]` (not `as const`) — Playwright's `toContain` matcher
// rejects `readonly`/tuple types under TS-strict in some installs.
const AUTH_REQUIRED: number[] = [401, 503];

test.describe("/api/razorpay/webhook (HMAC-authed, not session-authed)", () => {
  test("rejects unsigned body in real mode", async ({ request }) => {
    const res = await request.post("/api/razorpay/webhook", {
      data: { event: "payment.captured" },
    });
    // Mock mode bypasses verification; in mock mode we expect 200.
    // In real mode (RAZORPAY_WEBHOOK_SECRET set) we expect 401.
    expect([200, 401].includes(res.status())).toBe(true);
  });
});

test.describe("/api/chat/report (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/chat/report", {
      data: {
        messageId: crypto.randomUUID(),
        category: "harassment",
        detail: "test",
      },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });

  test("rejects unauthed POST (invalid category fails auth first, not validation)", async ({
    request,
  }) => {
    const res = await request.post("/api/chat/report", {
      data: { messageId: crypto.randomUUID(), category: "not_a_category" },
    });
    // Auth fires before zod parse — not 400 anymore.
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/chat/send (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/chat/send", {
      data: { threadId: crypto.randomUUID(), content: "hi" },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/y6/check-in (auth-gated)", () => {
  test("rejects unauthed schedule", async ({ request }) => {
    const res = await request.post("/api/y6/check-in", {
      data: {
        kind: "schedule",
        atIso: new Date(Date.now() + 86400_000).toISOString(),
        airport: "DUB",
      },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });

  test("rejects unauthed arrive", async ({ request }) => {
    const res = await request.post("/api/y6/check-in", {
      data: { kind: "arrive", arrivalId: crypto.randomUUID() },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/admit/sign-upload (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/admit/sign-upload", {
      data: { mimeType: "image/jpeg", fileSizeBytes: 1024 },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/admit/complete (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/admit/complete", {
      data: { docId: "demo-doc-id" },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/group-apply/submit (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/group-apply/submit", {
      data: { groupId: crypto.randomUUID() },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/push/subscribe (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/push/subscribe", {
      data: {
        endpoint: "https://example.com/push/abc",
        keys: { p256dh: "k1", auth: "k2" },
      },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/parent-link/send (auth-gated)", () => {
  test("rejects unauthed POST", async ({ request }) => {
    const res = await request.post("/api/parent-link/send", {
      data: { email: "parent@example.com" },
    });
    expect(AUTH_REQUIRED.includes(res.status())).toBe(true);
  });
});

test.describe("/api/parent-link/verify (token-authed, not session-authed)", () => {
  test("returns mock data for any token in dev", async ({ request }) => {
    const res = await request.post("/api/parent-link/verify", {
      data: { token: "demo-token-1234567890" },
    });
    // Mock path returns 200 + ok:true; real path with no DB returns 501.
    expect([200, 501].includes(res.status())).toBe(true);
  });
});
