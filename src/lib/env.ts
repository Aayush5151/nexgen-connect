import "server-only";

/**
 * Centralised production-readiness checks for environment variables.
 *
 * Philosophy:
 *   - NEVER throw from this module during request handling — startup crashes
 *     are far worse than a missing non-critical env var
 *   - LOG loudly when prod is running with mock creds or missing required
 *     secrets — that gets caught during canary / first user report
 *   - Individual lib modules still validate their own required vars at use
 *     time (see hash.ts, session.ts); this is a belt-and-suspenders layer
 *
 * Wire-up: imported once from the Next.js `instrumentation.ts` hook so the
 * warnings print on every cold-start in every environment.
 */

const REQUIRED_IN_PROD = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PHONE_PEPPER",
  "OTP_PEPPER",
  "AADHAAR_REF_PEPPER",
  "SESSION_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const REQUIRED_FOR_LIVE_OTP = [
  "MSG91_AUTH_KEY",
  "MSG91_TEMPLATE_ID",
] as const;

const REQUIRED_FOR_LIVE_DIGILOCKER = [
  "DIGILOCKER_CLIENT_ID",
  "DIGILOCKER_CLIENT_SECRET",
  "DIGILOCKER_REDIRECT_URI",
  "DIGILOCKER_BASE_URL",
] as const;

const REQUIRED_FOR_EMAIL = ["RESEND_API_KEY"] as const;

function warn(msg: string) {
  console.warn(`\x1b[33m[env-check] ${msg}\x1b[0m`);
}
function error(msg: string) {
  console.error(`\x1b[31m[env-check] ${msg}\x1b[0m`);
}

/**
 * Run the full check. Safe to call repeatedly. Returns `true` if the env
 * passes the "do not ship" bar, `false` if there are blocking issues. Never
 * throws so instrumentation can wrap it in try/catch without surprises.
 */
export function runEnvChecks(): boolean {
  const env = process.env;
  const isProd = env.NODE_ENV === "production";
  const isVercelProd = env.VERCEL_ENV === "production";
  const mode = isVercelProd ? "VERCEL PROD" : isProd ? "PROD" : "DEV";
  let allClear = true;

  // --- Always required ---
  for (const name of REQUIRED_IN_PROD) {
    if (!env[name]) {
      if (isProd) {
        error(`missing required secret: ${name} (${mode})`);
        allClear = false;
      } else {
        warn(`missing secret: ${name} (dev — okay for now)`);
      }
    }
  }

  // --- Secret strength ---
  const sessionSecret = env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.length < 32) {
    error("SESSION_SECRET is shorter than 32 chars — HMAC is weak. Regenerate with `openssl rand -hex 32`.");
    allClear = false;
  }

  const peppers: Array<[string, string | undefined]> = [
    ["PHONE_PEPPER", env.PHONE_PEPPER],
    ["OTP_PEPPER", env.OTP_PEPPER],
    ["AADHAAR_REF_PEPPER", env.AADHAAR_REF_PEPPER],
  ];
  for (const [name, value] of peppers) {
    if (value && value.length < 32) {
      warn(`${name} is shorter than 32 chars — re-run \`openssl rand -hex 32\`.`);
    }
  }

  // --- Mock-mode guardrails ---
  if (isVercelProd || isProd) {
    if (env.MOCK_OTP === "true") {
      error("MOCK_OTP=true in production — real users will receive NO SMS and can 'verify' with 000000.");
      allClear = false;
    }
    if (env.MOCK_DIGILOCKER === "true" && env.DIGILOCKER_ENABLED === "true") {
      error("MOCK_DIGILOCKER=true AND DIGILOCKER_ENABLED=true in production — identity flow is fake.");
      allClear = false;
    }
  }

  // --- Live SMS prereqs (only warn if OTP is live) ---
  if (env.MOCK_OTP !== "true") {
    for (const name of REQUIRED_FOR_LIVE_OTP) {
      if (!env[name]) {
        error(`live OTP enabled but ${name} is missing.`);
        allClear = false;
      }
    }
  }

  // --- Live DigiLocker prereqs ---
  if (env.DIGILOCKER_ENABLED === "true" && env.MOCK_DIGILOCKER !== "true") {
    for (const name of REQUIRED_FOR_LIVE_DIGILOCKER) {
      if (!env[name]) {
        error(`DigiLocker enabled but ${name} is missing.`);
        allClear = false;
      }
    }
  }

  // --- Email ---
  for (const name of REQUIRED_FOR_EMAIL) {
    if (!env[name]) {
      warn(`${name} missing — welcome emails will fail.`);
    }
  }

  // --- Site URL sanity ---
  const site = env.NEXT_PUBLIC_SITE_URL;
  if (isProd && site && site.includes("localhost")) {
    error(`NEXT_PUBLIC_SITE_URL points at localhost in production: ${site}`);
    allClear = false;
  }
  if (isProd && site && !site.startsWith("https://")) {
    warn(`NEXT_PUBLIC_SITE_URL is not https: ${site}`);
  }

  return allClear;
}
