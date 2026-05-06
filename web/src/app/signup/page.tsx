"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SignupShell } from "@/components/signup/SignupShell";
import { TurnstileWidget } from "@/components/signup/TurnstileWidget";
import { useSignup } from "@/lib/signup/state";
import { authRequestOtp } from "@/lib/signup/services";
import { trackPostHog } from "@/lib/posthog";

/**
 * /signup — phone entry. Step 1 of 7.
 *
 * Validates 10-digit Indian mobile (must start 6/7/8/9). Calls
 * authRequestOtp() with phone + Turnstile token. On success, stores
 * otpSessionId in funnel state and routes to /signup/otp.
 *
 * Layout split: the page renders a `<Suspense>`-wrapped `<FromToast>`
 * for the proxy-redirect explainer (uses useSearchParams) plus the
 * stateful `<SignupForm>`. Next.js 16 requires every useSearchParams
 * caller to live under a Suspense boundary so static generation can
 * bail out cleanly without falling back to client-side rendering of
 * the entire page.
 *
 * v16 web pivot §Bucket 4.
 */
export default function SignupPhonePage() {
  return (
    <SignupShell step={1}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Your mobile.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        First check. We&apos;ll send a six-digit code via WhatsApp (or
        SMS if you&apos;re not on WhatsApp).
      </p>
      {/* useSearchParams is a CSR-bailout boundary on Next.js 16 — must
          live under a Suspense wrapper for /signup to keep its
          static-prerender story. The toast is purely an explainer
          when the user lands here from a proxy redirect, so a null
          fallback is fine. */}
      <Suspense fallback={null}>
        <FromToast />
      </Suspense>
      <SignupForm />
    </SignupShell>
  );
}

function FromToast() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const from = searchParams?.get("from");
    if (!from) return;
    toast("Sign up first", {
      description: "Verify your phone to access your group.",
    });
  }, [searchParams]);
  return null;
}

function SignupForm() {
  const router = useRouter();
  const setPhone = useSignup((s) => s.setPhone);
  const setOtpSession = useSignup((s) => s.setOtpSession);
  const [digits, setDigits] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validDigits = /^[6-9]\d{9}$/.test(digits);
  const canSubmit = validDigits && turnstileToken && !submitting;

  // Fire signup_started once on first paint of /signup. The page is
  // the funnel entry point; subsequent OTP / verify steps emit
  // their own events.
  useEffect(() => {
    trackPostHog("signup_started", {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const e164 = `91${digits}`;
      const res = await authRequestOtp({
        phone: { country: "IN", e164 },
        turnstileToken: turnstileToken!,
      });
      setPhone({ country: "IN", e164 });
      // Pass the resolved channel so /signup/otp can label the banner
      // (e.g. "Sent via SMS to +91 *****1234") and decide whether the
      // "Try SMS instead" affordance is still useful.
      setOtpSession(res.otpSessionId, res.channel);
      trackPostHog("otp_requested", {
        channel: res.channel ?? "whatsapp",
        preferSms: false,
      });
      router.push("/signup/otp");
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : "unknown_error";
      trackPostHog("otp_failed", { errorCode });
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
      <div>
        <label
          htmlFor="phone"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
        >
          Mobile number
        </label>
        <div className="mt-2 flex h-14 items-center rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 focus-within:border-[color:var(--color-primary)]/60">
          <span className="mr-3 border-r border-[color:var(--color-border)] pr-3 font-mono text-[15px] text-[color:var(--color-fg-muted)]">
            +91
          </span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            placeholder="9876543210"
            value={digits}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:outline-none"
          />
        </div>
        {digits.length > 0 && !validDigits && (
          <p className="mt-2 text-[12px] text-[color:var(--color-danger)]">
            Enter a 10-digit Indian mobile starting 6, 7, 8, or 9.
          </p>
        )}
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />

      {error && (
        <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send code"}
      </button>
      {/* India data-residency / DPDP signal. The Supabase project
          backing this funnel is in ap-south-1 (Mumbai); the CI
          region-drift guard blocks any merge that would move PII
          off Mumbai. Surfacing it on the funnel page closes the
          most common parent objection without a long privacy
          sub-page hop. */}
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-[color:var(--color-fg-subtle)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3 w-3 text-[color:var(--color-primary)]"
          fill="currentColor"
        >
          <path d="M8 1.2 2.4 3.4v3.7c0 3.5 2.4 6.7 5.6 7.7 3.2-1 5.6-4.2 5.6-7.7V3.4L8 1.2Zm-1 9.5L4 7.7l1-1 2 2 4-4 1 1-5 5Z" />
        </svg>
        Your data stays in India · Mumbai region · DPDP compliant
      </p>
      <p className="text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        By continuing you agree to the{" "}
        <a href="/terms" className="underline decoration-dotted underline-offset-4">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline decoration-dotted underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
