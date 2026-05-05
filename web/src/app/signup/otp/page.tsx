"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { authVerifyOtp } from "@/lib/signup/services";

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
      router.push("/signup/you");
    } catch (err) {
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
