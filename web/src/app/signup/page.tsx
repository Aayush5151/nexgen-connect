"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
 * v16 web pivot §Bucket 4.
 */
export default function SignupPhonePage() {
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
    <SignupShell step={1}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Your mobile.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        First check. We&apos;ll send a six-digit code on SMS.
      </p>
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
    </SignupShell>
  );
}
