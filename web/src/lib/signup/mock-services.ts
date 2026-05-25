/**
 * Mock signup services — used by the /signup funnel until Bucket 6
 * wires real MSG91 / DigiLocker / Cloudflare Images.
 *
 * Each function mirrors the shape of the corresponding tRPC procedure
 * in packages/server/src/server/routers/. When the real wiring lands,
 * the consumer call site changes ONE import line:
 *
 *   import { authRequestOtp } from "@/lib/signup/mock-services";
 *   //                       ^^^ swap to:
 *   import { trpc } from "@/lib/trpc";
 *   const authRequestOtp = (input) => trpc.auth.requestOtp.mutate(input);
 *
 * v16 web pivot §Bucket 4. Real impls land in Bucket 6.
 */

const SLEEP_MS = 600;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Phone = { country: "IN"; e164: string };

export async function authRequestOtp(input: { phone: Phone; turnstileToken: string }) {
  await sleep(SLEEP_MS);
  if (!/^91[6-9]\d{9}$/.test(input.phone.e164)) {
    throw new Error("E010:invalid_phone");
  }
  return {
    otpSessionId: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    maskedPhone: `+91 *****${input.phone.e164.slice(-4)}`,
  };
}

export async function authVerifyOtp(input: { otpSessionId: string; code: string }) {
  await sleep(SLEEP_MS);
  if (input.code !== "123456") {
    throw new Error("E022:otp_invalid");
  }
  // Mock the new nonce-based return shape so the funnel walks forward
  // identically in dev. In real verify the nonce is stored server-side
  // in Upstash; here it's just a UUID that the mock attach-phone /
  // establish-session route ignores.
  return {
    sessionNonce: crypto.randomUUID(),
    phoneE164: "+919999999999",
    expiresAt: new Date(Date.now() + 2 * 60_000).toISOString(),
  };
}

export async function corridorPreview(input: {
  homeCity: string;
  destination: string;
  intake: string;
}) {
  await sleep(SLEEP_MS);
  // Cold-start aware: most corridors return 0-4 verified at launch.
  // Mock returns deterministic data based on the destination so dev
  // can see both empty + populated states. Per v16 §Bucket 4: when
  // verified < 5, show the "Layer 1 small / Layer 2 active" empty
  // state with Aayush-personally-calls copy.
  const verifiedCount = mockCountFor(input.destination);
  return {
    layer1Count: Math.max(0, Math.min(verifiedCount, 8)),
    layer2Count: verifiedCount,
    layer3Count: 312,
    isColdStart: verifiedCount < 5,
    threshold: 30,
  };
}

function mockCountFor(destination: string): number {
  // Deterministic mock — UCD/Trinity/TUM more populated, others cold-start.
  const populated = ["UCD", "Trinity", "TUM"];
  return populated.some((u) => destination.toLowerCase().includes(u.toLowerCase())) ? 47 : 2;
}

export async function verificationStartDigiLocker() {
  await sleep(SLEEP_MS);
  return {
    authUrl: "/signup/identity/callback?mock=success",
    state: "mock-digilocker-state",
  };
}

export async function verificationCompleteDigiLocker(input: {
  state: string;
  code: string;
}) {
  await sleep(SLEEP_MS);
  // Mock: state "mock-digilocker-failure-X" simulates the 4 fallback paths.
  if (input.state.includes("aadhaar_not_linked")) {
    throw new Error("E031:digilocker_aadhaar_not_linked");
  }
  if (input.state.includes("mobile_changed")) {
    throw new Error("E032:digilocker_mobile_changed");
  }
  if (input.state.includes("deactivated")) {
    throw new Error("E033:digilocker_deactivated");
  }
  if (input.state.includes("invisible_character")) {
    throw new Error("E034:digilocker_invisible_character");
  }
  return {
    maskedHash: "****12af",
    summary: { nameFirstAndLast: "Aayush Shah", yearMonthOfBirth: "2003-03" },
  };
}

export async function verificationUploadAdmit(input: {
  mimeType: string;
  fileSizeBytes: number;
}) {
  await sleep(SLEEP_MS);
  if (!["image/jpeg", "image/png", "application/pdf"].includes(input.mimeType)) {
    throw new Error("E041:admit_unsupported_mime");
  }
  if (input.fileSizeBytes > 8 * 1024 * 1024) {
    throw new Error("E042:admit_file_too_large");
  }
  return {
    uploadUrl: "/api/mock-upload",
    docId: crypto.randomUUID(),
    retentionMinutesAfterReview: 60,
  };
}

export async function verificationCompleteAdmit(input: { docId: string }) {
  await sleep(SLEEP_MS);
  return {
    reviewBy: new Date(Date.now() + 48 * 3600_000).toISOString(),
    queuePosition: 12,
    docId: input.docId,
  };
}

export async function verificationStatus() {
  await sleep(SLEEP_MS);
  return {
    phone: { state: "verified" as const, verifiedAt: new Date().toISOString() },
    identity: { state: "verified" as const, verifiedAt: new Date().toISOString() },
    admit: {
      state: "approved" as const,
      reviewedAt: new Date().toISOString(),
    },
  };
}
