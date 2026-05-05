import "server-only";

/**
 * Launch-readiness boot warnings.
 *
 * Imported once from the root layout (server side) so we log a clear
 * structured warning on every cold start when a Tier-1 launch env var
 * is missing in production. Production with mocks is not an outage,
 * but it IS a state we want to surface — Vercel deploy logs become
 * the single visible signal that "OTP is mock", "premium is mock",
 * "Sentry is dark", etc.
 *
 * No-ops outside production. Idempotent across HMR (the warned set
 * lives at module-scope so the same key doesn't spam every render).
 *
 * Format: a single JSON-serialisable line per missing var so logs are
 * grep-friendly:
 *   [launch-readiness] missing=INNGEST_EVENT_KEY service=Inngest
 *     impact="durable jobs (premium async, T&S SLA, push fan-out,
 *     welcome email) won't run" mitigation="set in Vercel env"
 *
 * v16 web pivot Bucket 4 follow-up.
 */

type Tier1Var = {
  /** Env var name. */
  key: string;
  /** Human service name (Inngest, Razorpay, etc.). */
  service: string;
  /** What flips on once it's set. */
  impact: string;
  /** Group of related vars that should land together. */
  group: string;
};

const TIER1: readonly Tier1Var[] = [
  // OTP — primary + fallback
  {
    key: "META_WA_PHONE_NUMBER_ID",
    service: "Meta WhatsApp Cloud",
    impact: "OTP primary channel switches from SMS-mock to real WhatsApp",
    group: "whatsapp",
  },
  {
    key: "META_WA_ACCESS_TOKEN",
    service: "Meta WhatsApp Cloud",
    impact: "OTP primary channel switches from SMS-mock to real WhatsApp",
    group: "whatsapp",
  },
  {
    key: "META_WA_TEMPLATE_NAME",
    service: "Meta WhatsApp Cloud",
    impact: "OTP primary channel switches from SMS-mock to real WhatsApp",
    group: "whatsapp",
  },
  {
    key: "MSG91_AUTH_KEY",
    service: "MSG91",
    impact:
      "real SMS fallback when WhatsApp returns recipient_not_on_whatsapp; flip MOCK_OTP=false alongside",
    group: "msg91",
  },
  // Razorpay — premium ₹999
  {
    key: "RAZORPAY_KEY_ID",
    service: "Razorpay",
    impact: "real ₹999 premium charges; webhook fires premium/order.paid Inngest event",
    group: "razorpay",
  },
  {
    key: "RAZORPAY_KEY_SECRET",
    service: "Razorpay",
    impact: "server-side order creation",
    group: "razorpay",
  },
  {
    key: "RAZORPAY_WEBHOOK_SECRET",
    service: "Razorpay",
    impact: "HMAC verification on payment webhook",
    group: "razorpay",
  },
  // Email
  {
    key: "RESEND_API_KEY",
    service: "Resend",
    impact: "welcome email after phone OTP; parent-link magic link",
    group: "resend",
  },
  // Bot protection
  {
    key: "TURNSTILE_SECRET_KEY",
    service: "Cloudflare Turnstile",
    impact: "anti-bot gate on /signup (currently dev-bypass token accepted)",
    group: "turnstile",
  },
  // Background jobs
  {
    key: "INNGEST_EVENT_KEY",
    service: "Inngest",
    impact: "durable jobs run in cloud (currently /api/inngest 500s without it)",
    group: "inngest",
  },
  {
    key: "INNGEST_SIGNING_KEY",
    service: "Inngest",
    impact: "durable jobs run in cloud (currently /api/inngest 500s without it)",
    group: "inngest",
  },
  // Observability
  {
    key: "SENTRY_DSN",
    service: "Sentry",
    impact: "server-side error tracking",
    group: "sentry",
  },
  {
    key: "NEXT_PUBLIC_SENTRY_DSN",
    service: "Sentry",
    impact: "browser-side error tracking + Replay",
    group: "sentry",
  },
  {
    key: "NEXT_PUBLIC_POSTHOG_KEY",
    service: "PostHog",
    impact: "all 25 funnel events land in dashboards (currently dropped)",
    group: "posthog",
  },
];

const warnedGroups = new Set<string>();

/**
 * Run on cold start in production. Logs one warning line per
 * missing-vars group (groups with all vars set are silent).
 */
export function reportLaunchReadiness(): void {
  // Hobby: VERCEL_ENV is the canonical signal. NODE_ENV is "production"
  // even on preview deploys for Next.js apps.
  if (process.env.VERCEL_ENV !== "production") return;

  const missingByGroup = new Map<string, Tier1Var[]>();
  for (const v of TIER1) {
    if (!process.env[v.key]) {
      const arr = missingByGroup.get(v.group) ?? [];
      arr.push(v);
      missingByGroup.set(v.group, arr);
    }
  }

  for (const [group, vars] of missingByGroup) {
    if (warnedGroups.has(group)) continue;
    warnedGroups.add(group);
    const sample = vars[0];
    const keys = vars.map((v) => v.key).join(",");
    console.warn(
      `[launch-readiness] group=${group} service="${sample.service}" missing=[${keys}] impact="${sample.impact}"`,
    );
  }

  if (missingByGroup.size === 0) {
    console.log("[launch-readiness] all Tier-1 launch vars present");
  }
}
