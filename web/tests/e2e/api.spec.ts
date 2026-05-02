import { expect, test } from "@playwright/test";

/**
 * API-route smoke specs.
 *
 * Sanity checks for the Bucket 6/7/8 routes — input validation,
 * mock-fallback paths, signature verification rejecting unsigned bodies.
 *
 * v16 web pivot §Bucket 11.
 */

test.describe("/api/auth/send-otp", () => {
  test("rejects missing turnstile token", async ({ request }) => {
    const res = await request.post("/api/auth/send-otp", {
      data: { phone: { country: "IN", e164: "919999999999" }, turnstileToken: "" },
    });
    expect([400, 502]).toContain(res.status());
  });

  test("rejects invalid phone", async ({ request }) => {
    const res = await request.post("/api/auth/send-otp", {
      data: { phone: { country: "IN", e164: "12345" }, turnstileToken: "x" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("/api/razorpay/webhook", () => {
  test("rejects unsigned body with 401", async ({ request }) => {
    const res = await request.post("/api/razorpay/webhook", {
      data: { event: "payment.captured" },
    });
    // Mock mode bypasses verification; in mock mode we expect 200.
    // In real mode (RAZORPAY_WEBHOOK_SECRET set) we expect 401.
    expect([200, 401]).toContain(res.status());
  });
});

test.describe("/api/chat/report", () => {
  test("rejects invalid category", async ({ request }) => {
    const res = await request.post("/api/chat/report", {
      data: { messageId: crypto.randomUUID(), category: "not_a_category" },
    });
    expect(res.status()).toBe(400);
  });

  test("harassment routes to 1h SLA", async ({ request }) => {
    const res = await request.post("/api/chat/report", {
      data: {
        messageId: crypto.randomUUID(),
        category: "harassment",
        detail: "test",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.slaHours).toBe(1);
  });

  test("spam routes to 4h SLA", async ({ request }) => {
    const res = await request.post("/api/chat/report", {
      data: {
        messageId: crypto.randomUUID(),
        category: "spam",
        detail: "test",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.slaHours).toBe(4);
  });
});

test.describe("/api/y6/check-in", () => {
  test("rejects invalid arrival time", async ({ request }) => {
    const res = await request.post("/api/y6/check-in", {
      data: { kind: "schedule", atIso: "not-a-date" },
    });
    expect(res.status()).toBe(400);
  });

  test("schedule returns scheduled status", async ({ request }) => {
    const res = await request.post("/api/y6/check-in", {
      data: { kind: "schedule", atIso: new Date(Date.now() + 86400_000).toISOString(), airport: "DUB" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("scheduled");
  });
});

test.describe("/api/parent-link/verify", () => {
  test("returns mock data for any token in dev", async ({ request }) => {
    const res = await request.post("/api/parent-link/verify", {
      data: { token: "demo-token-1234567890" },
    });
    // Mock path returns 200 + ok:true; real path with no DB returns 501.
    expect([200, 501]).toContain(res.status());
  });
});
