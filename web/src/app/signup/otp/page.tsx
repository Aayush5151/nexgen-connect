"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { authRequestOtp, authVerifyOtp } from "@/lib/signup/services";
import { trackPostHog } from "@/lib/posthog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * /signup/otp — 6-digit OTP entry. Step 2 of 7.
 *
 * v16 web pivot §Bucket 4 / §P1.c (resend timer + SMS fallback).
 *
 * Resend cooldown: 30s client-side; the server enforces real limits
 * (2/min, 3/hr per phone — see auth.ts withRateLimit). Channel switch
 * "Try SMS instead" wires preferSms=true into the next request, so
 * the user gets out of WhatsApp jail when their account isn't on it.
 */
const RESEND_COOLDOWN_SECONDS = 30;

export default function SignupOtpPage() {
  const router = useRouter();
  const otpSessionId = useSignup((s) => s.otpSessionId);
  const phone = useSignup((s) => s.phone);
  const otpChannel = useSignup((s) => s.otpChannel);
  const setOtpSession = useSignup((s) => s.setOtpSession);
  const setSession = useSignup((s) => s.setSession);

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Stamp request-time once for the duration metric on otp_verified.
  // React 19's purity rule rejects `Date.now()` as a render-time
  // useRef initial value, so we set it from an effect instead.
  const requestStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (requestStartRef.current === null) {
      requestStartRef.current = Date.now();
    }
  }, []);

  // Bounce back to /signup if state is missing.
  useEffect(() => {
    if (!otpSessionId || !phone) router.replace("/signup");
  }, [otpSessionId, phone, router]);

  // Countdown tick for the resend button. Stops at zero, restarted by
  // a successful resend below.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const canSubmit = code.length === 6 && !submitting;
  // SMS switch is offered when the active channel is WhatsApp and a
  // resend is allowed by the cooldown. Once we've already switched to
  // SMS, the affordance disappears — there's no third channel.
  const canSwitchToSms = (otpChannel ?? "whatsapp") === "whatsapp";
  const canResend = !resending && secondsLeft <= 0;

  async function verify(currentCode: string) {
    if (submitting || !otpSessionId || currentCode.length !== 6) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authVerifyOtp({
        otpSessionId,
        code: currentCode,
        // Required by the real MSG91 path; mock ignores it.
        phoneE164: phone ? `+${phone.e164}` : undefined,
      });
      // The new verifyOtp returns a single-use nonce, NOT a session token.
      // The nonce binds this verify to the establish-session call below.
      // We keep a UI-only "session marker" so the funnel zustand can tell
      // an OTP-verified state apart from a fresh load — but it's not a
      // real auth credential.
      setSession("otp-verified");
      trackPostHog("otp_verified", {
        // Use the captured request channel; falls back to whatsapp
        // for legacy state shapes that pre-date P1.c.
        channel: otpChannel ?? "whatsapp",
        durationMs: requestStartRef.current
          ? Date.now() - requestStartRef.current
          : 0,
      });

      // Bridge to a real Supabase Auth session. Two-step:
      //   1. POST /api/auth/establish-session WITH the sessionNonce we
      //      just received from auth.verifyOtp. The server consumes the
      //      nonce single-use and verifies phoneE164 matches the phone
      //      bound to the nonce; refuses otherwise. Without this binding
      //      anyone could call establish-session for any phone.
      //   2. Client calls supabase.auth.verifyOtp({token_hash, type,
      //      email}) which sets the sb-access-token + sb-refresh-token
      //      cookies via @supabase/ssr.
      if (phone?.e164) {
        try {
          const sessionRes = await fetch("/api/auth/establish-session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              phoneE164: `+${phone.e164}`,
              sessionNonce: res.sessionNonce,
            }),
            credentials: "include",
          });
          const sessionPayload = (await sessionRes.json()) as {
            mode?: string;
            hashedToken?: string;
            email?: string;
          };
          if (
            sessionPayload?.mode === "magic-link-ready" &&
            sessionPayload.hashedToken &&
            sessionPayload.email
          ) {
            const supabase = createSupabaseBrowserClient();
            const { error: verifyErr } = await supabase.auth.verifyOtp({
              token_hash: sessionPayload.hashedToken,
              type: "magiclink",
            });
            if (verifyErr) {
              console.warn(
                "[signup/otp] supabase verifyOtp failed:",
                verifyErr.message,
              );
            }
          }
        } catch (sessionErr) {
          console.warn("[signup/otp] establish-session failed:", sessionErr);
        }
      }

      router.push("/signup/you");
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : "unknown_error";
      trackPostHog("otp_failed", {
        errorCode,
        channel: otpChannel ?? "whatsapp",
      });
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setCode("");
      setSubmitting(false);
    }
  }

  async function handleResend(preferSms: boolean) {
    if (resending || !phone) return;
    if (!preferSms && secondsLeft > 0) return;

    setResending(true);
    setError(null);
    setResendNotice(null);
    try {
      const res = await authRequestOtp({
        phone,
        // Resend doesn't re-prompt Turnstile — the visitor already
        // passed it on /signup. Server-side rate limits (2/min, 3/hr)
        // are the real bot gate here.
        turnstileToken: "resend",
        preferSms,
      });
      setOtpSession(res.otpSessionId, res.channel);
      setCode("");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      requestStartRef.current = Date.now();
      const channelLabel = res.channel === "sms" ? "SMS" : "WhatsApp";
      setResendNotice(`New code sent via ${channelLabel}.`);
      trackPostHog(preferSms ? "otp_channel_switched" : "otp_resent", {
        channel: res.channel,
        preferSms,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't resend.";
      setError(message);
      trackPostHog("otp_failed", {
        errorCode: message,
        channel: preferSms ? "sms" : (otpChannel ?? "whatsapp"),
      });
    } finally {
      setResending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void verify(code);
  }

  function onCodeChange(next: string) {
    const digits = next.replace(/\D/g, "");
    setCode(digits);
    // Auto-submit at 6 — fire from the event handler, not an effect, so
    // the React 19 "no setState in effect" rule stays satisfied.
    if (digits.length === 6) void verify(digits);
  }

  const channelLabel = (otpChannel ?? "whatsapp") === "sms" ? "SMS" : "WhatsApp";

  return (
    <SignupShell step={2}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Six digits.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        Sent via {channelLabel} to{" "}
        <span className="font-mono">+91 *****{phone?.e164.slice(-4) ?? ""}</span>
        {process.env.NODE_ENV !== "production" && (
          <>
            . Mock dev code: <span className="font-mono">123456</span>
          </>
        )}
        .
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="h-16 w-full rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-center font-mono text-[28px] tracking-[0.4em] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
          autoFocus
        />
        {resendNotice && !error && (
          <p
            role="status"
            aria-live="polite"
            className="text-[12px] text-[color:var(--color-success)]"
          >
            {resendNotice}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="text-[12px] text-[color:var(--color-danger)]"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Verifying…" : "Verify"}
        </button>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => handleResend(false)}
            disabled={!canResend}
            className="text-[12px] text-[color:var(--color-fg-muted)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)] disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
          >
            {resending
              ? "Resending…"
              : secondsLeft > 0
              ? `Resend code in ${secondsLeft}s`
              : "Resend code"}
          </button>
          {canSwitchToSms && (
            <button
              type="button"
              onClick={() => handleResend(true)}
              disabled={resending}
              className="text-[12px] text-[color:var(--color-fg-subtle)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Not on WhatsApp? Try SMS instead
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[12px] text-[color:var(--color-fg-subtle)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)]"
          >
            Wrong number? Go back
          </button>
        </div>
      </form>
    </SignupShell>
  );
}
