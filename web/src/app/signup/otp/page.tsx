"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { authVerifyOtp } from "@/lib/signup/services";
import { trackPostHog } from "@/lib/posthog";

/**
 * /signup/otp — 6-digit OTP entry. Step 2 of 7.
 * v16 web pivot §Bucket 4.
 */
export default function SignupOtpPage() {
  const router = useRouter();
  const otpSessionId = useSignup((s) => s.otpSessionId);
  const phone = useSignup((s) => s.phone);
  const setSession = useSignup((s) => s.setSession);

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const canSubmit = code.length === 6 && !submitting;

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
      setSession(res.sessionToken);
      trackPostHog("otp_verified", {
        // Channel isn't on the verify response — default to whatsapp;
        // the request side already captured the actual channel.
        channel: "whatsapp",
        durationMs: requestStartRef.current
          ? Date.now() - requestStartRef.current
          : 0,
      });

      // Bridge to a real Supabase session via /api/auth/establish-
      // session. The hashedToken lets the browser verifyOtp into
      // setting the SSR cookie chain. Failure is non-fatal — the
      // funnel still has the demo-phone-only token in zustand.
      if (phone?.e164) {
        try {
          await fetch("/api/auth/establish-session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ phoneE164: `+${phone.e164}` }),
            credentials: "include",
          });
        } catch (sessionErr) {
          console.warn("[signup/otp] establish-session failed:", sessionErr);
        }
      }

      router.push("/signup/you");
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : "unknown_error";
      trackPostHog("otp_failed", { errorCode, channel: "whatsapp" });
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setCode("");
      setSubmitting(false);
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

  return (
    <SignupShell step={2}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Six digits.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        Sent to <span className="font-mono">+91 *****{phone?.e164.slice(-4) ?? ""}</span>.
        Mock dev code: <span className="font-mono">123456</span>.
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
        {error && (
          <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Verifying…" : "Verify"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="block w-full text-center text-[12px] text-[color:var(--color-fg-subtle)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)]"
        >
          Wrong number? Go back
        </button>
      </form>
    </SignupShell>
  );
}
