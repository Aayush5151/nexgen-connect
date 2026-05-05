/**
 * Sentry server-side config.
 *
 * Mirrors the client config's PII filter so trace and request data
 * captured server-side never carry phone / OTP / Aadhaar / token
 * fields. Same DSN, same sample rate.
 *
 * v16 web pivot Bucket 4 follow-up (P3 work).
 */
import * as Sentry from "@sentry/nextjs";

const PII_KEYS = new Set([
  "phone",
  "phoneE164",
  "e164",
  "e_164",
  "aadhaar",
  "aadhar",
  "vid",
  "otp",
  "code",
  "email",
  "sessionToken",
  "refreshToken",
  "sb-access-token",
  "sb-refresh-token",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PHONE_PEPPER",
  "AADHAAR_REF_PEPPER",
  "OTP_PEPPER",
]);

function scrub<T>(input: T): T {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) {
    return input.map((v) => scrub(v)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = PII_KEYS.has(k) ? "[redacted]" : scrub(v);
  }
  return out as T;
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = scrub(event.request.data);
    }
    if (event.extra) {
      event.extra = scrub(event.extra);
    }
    return event;
  },
  environment: process.env.VERCEL_ENV ?? "development",
});
