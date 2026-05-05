/**
 * Sentry browser-side config.
 *
 * Loaded automatically by @sentry/nextjs at the top of every client
 * bundle. Initialises the SDK only when SENTRY_DSN is set — dev and
 * preview deploys without the secret stay quiet.
 *
 * The `beforeSend` filter strips PII per v15 BP §16:
 *   - phone, e164, e_164                phone numbers
 *   - aadhaar, aadhar, vid, otp         Indian identity / OTP fields
 *   - email                             email addresses
 *   - sessionToken, refreshToken        any auth tokens
 *   - sb-access-token, sb-refresh-token Supabase cookies
 *
 * Replays are session-only (errorSampleRate=1, sessionSampleRate=0)
 * so we capture the user's last 30s when an error fires but never
 * record idle sessions.
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
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Production sample rate is conservative — we expect <2% trace
  // budget against a free-tier Sentry quota for the first 1000
  // verified-user beta.
  tracesSampleRate: 0.1,
  // Replay only on errors — never record idle.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  integrations: [
    Sentry.replayIntegration({
      // Mask everything by default; rely on explicit `data-sentry-mask
      // ="false"` attributes if a future polish pass wants to unmask
      // a specific UI surface.
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = scrub(event.request.data);
    }
    if (event.extra) {
      event.extra = scrub(event.extra);
    }
    return event;
  },
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
});
