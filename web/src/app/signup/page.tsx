"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { SignupShell } from "@/components/signup/SignupShell";
import { TurnstileWidget } from "@/components/signup/TurnstileWidget";
import { useSignup } from "@/lib/signup/state";
import { authRequestOtp } from "@/lib/signup/services";
import { signInWithGoogle } from "@/lib/auth/oauth";
import { trackPostHog } from "@/lib/posthog";

/**
 * /signup, OAuth-first entry. Step 1 of 7.
 *
 * Three ways in, ranked by friction (lowest first):
 *
 *   1. Continue with Google — one-tap on a phone in India. Hands off
 *      to Supabase OAuth, comes back via /auth/callback. The user
 *      still has to add their phone at /signup/phone-verify before
 *      /signup/corridor (the verification chain stays intact).
 *
 *   2. Continue with email — magic link via Supabase + Resend. Same
 *      "phone still required" rule applies.
 *
 *   3. Continue with phone — the v15/v16 phone-OTP entry, kept as the
 *      direct path for users who'd rather not link a social account.
 *      This is also the only path where phone OTP is verified first,
 *      meaning the user skips /signup/phone-verify later.
 *
 * Trust-model note: phone-OTP is never optional. OAuth and email
 * lower the click-cost to enter the funnel but every member of a
 * corridor still has a phone-bound identity hash. See `/signup/
 * phone-verify`.
 *
 * v17 OAuth entry.
 */
export default function SignupChooserPage() {
  return (
    <SignupShell step={1}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Sign in or sign up.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        One step. Then your name, your corridor, and a quick
        identity check.
      </p>

      <Suspense fallback={null}>
        <FromToast />
      </Suspense>

      <ChooserBody />
    </SignupShell>
  );
}

function FromToast() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const from = searchParams?.get("from");
    if (!from) return;
    if (from === "auth-error") {
      toast.error("Sign-in failed. Try again.");
      return;
    }
    toast("Sign up first", {
      description: "Verify your identity to access your group.",
    });
  }, [searchParams]);
  return null;
}

function ChooserBody() {
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    trackPostHog("signup_started", {});
  }, []);

  return (
    <div className="mt-8 space-y-3">
      <GoogleButton />
      <EmailButton />

      <Divider />

      {!showPhone ? (
        <button
          type="button"
          onClick={() => {
            setShowPhone(true);
            trackPostHog("signup_method_selected", { method: "phone" });
          }}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-border-strong)] bg-transparent text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:bg-[color:var(--color-surface)]"
        >
          Continue with phone
        </button>
      ) : (
        <PhoneForm onCancel={() => setShowPhone(false)} />
      )}

      <p className="pt-2 text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        By continuing you agree to the{" "}
        <Link
          href="/terms"
          className="underline decoration-dotted underline-offset-4"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline decoration-dotted underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-medium text-[color:var(--color-fg-subtle)]">
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
    </div>
  );
}

function GoogleButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        trackPostHog("signup_method_selected", { method: "google" });
        const res = await signInWithGoogle();
        if (!res.ok) {
          toast.error(
            res.error.includes("Provider not enabled")
              ? "Google sign-in isn't wired up on this build yet."
              : "Couldn't start Google sign-in.",
          );
          setPending(false);
        }
        // On success Supabase redirects the page away — no need to
        // reset `pending`.
      }}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[10px] bg-white text-[14px] font-semibold text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-opacity hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleLogo />
      {pending ? "Connecting to Google…" : "Continue with Google"}
    </button>
  );
}

function EmailButton() {
  return (
    <Link
      href="/signup/email"
      onClick={() => trackPostHog("signup_method_selected", { method: "email" })}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-border-strong)] bg-transparent text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:bg-[color:var(--color-surface)]"
    >
      <EmailIcon />
      Continue with email
    </Link>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="h-px flex-1 bg-[color:var(--color-border)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        or
      </span>
      <span className="h-px flex-1 bg-[color:var(--color-border)]" />
    </div>
  );
}

function PhoneForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const setPhone = useSignup((s) => s.setPhone);
  const setOtpSession = useSignup((s) => s.setOtpSession);
  const [digits, setDigits] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validDigits = /^[6-9]\d{9}$/.test(digits);
  const canSubmit = validDigits && turnstileToken && !submitting;

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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
            autoFocus
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

      <button
        type="button"
        onClick={onCancel}
        className="mx-auto block text-[12px] text-[color:var(--color-fg-subtle)] underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline"
      >
        Use a different method
      </button>
    </form>
  );
}

/** Google "G" mark, official multi-colour. */
function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
