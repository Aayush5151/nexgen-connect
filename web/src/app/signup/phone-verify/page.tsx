"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SignupShell } from "@/components/signup/SignupShell";
import { TurnstileWidget } from "@/components/signup/TurnstileWidget";
import { authRequestOtp, authVerifyOtp } from "@/lib/signup/services";
import { trackPostHog } from "@/lib/posthog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * /signup/phone-verify, phone-OTP step for OAuth-entry users.
 *
 * OAuth + email-magic-link users already have a Supabase session, but
 * their `user_metadata.phone_verified_at` is unset. The corridor /
 * identity / admit steps all require a phone-bound identity hash, so
 * this page is the bridge. Same authRequestOtp + authVerifyOtp
 * services as the /signup → /signup/otp pair; just compressed into a
 * single page since the user is already in the funnel and we don't
 * need the chooser chrome.
 *
 * Flow:
 *   1. User enters phone + clears Turnstile.
 *   2. Send code (WhatsApp primary, SMS fallback).
 *   3. User enters the 6-digit code.
 *   4. Verify. Server marks `phone_verified_at` and advances
 *      signup_step from "profile" to "corridor". We redirect there.
 *
 * v17 OAuth entry.
 */

const RESEND_COOLDOWN_SECONDS = 30;

export default function PhoneVerifyPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [digits, setDigits] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);

  // Mount auth gate. This page is for OAuth-entry users only — without
  // a Supabase session they should never be here. Without this gate,
  // an unauthed visitor could trigger SMS sends (burning MSG91 budget)
  // before the attach-phone 401 lands.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!data?.user) router.replace("/signup");
      } catch {
        if (!cancelled) router.replace("/signup");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);
  const [channel, setChannel] = useState<"whatsapp" | "sms" | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  // Countdown for resend.
  useEffect(() => {
    if (stage !== "code" || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [stage, secondsLeft]);

  const validDigits = /^[6-9]\d{9}$/.test(digits);
  const canSubmitPhone = validDigits && turnstileToken && !pending;
  const canSubmitCode = code.length === 6 && !pending;
  const e164 = `91${digits}`;
  const phoneTail = `*****${digits.slice(-4)}`;

  async function onSubmitPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPhone) return;
    setPending(true);
    setError(null);
    try {
      const res = await authRequestOtp({
        phone: { country: "IN", e164 },
        turnstileToken: turnstileToken!,
      });
      setOtpSessionId(res.otpSessionId);
      setChannel(res.channel ?? "whatsapp");
      trackPostHog("otp_requested", {
        channel: res.channel ?? "whatsapp",
        preferSms: false,
        from: "phone-verify",
      });
      setStage("code");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      trackPostHog("otp_failed", {
        errorCode: err instanceof Error ? err.message : "unknown_error",
        from: "phone-verify",
      });
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  async function onSubmitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitCode || !otpSessionId) return;
    setPending(true);
    setError(null);
    try {
      // Step 1: verify OTP code via tRPC. Returns a single-use
      // sessionNonce that binds this verify to the attach-phone call
      // below — without the nonce, attach-phone would refuse.
      const verified = await authVerifyOtp({
        otpSessionId,
        code,
        phoneE164: `+${e164}`,
      });

      // Step 2: attach the verified phone to the user's existing
      // Supabase auth.users row. The nonce + phone proves the user
      // controls this number.
      const attachRes = await fetch("/api/auth/attach-phone", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phoneE164: `+${e164}`,
          sessionNonce: verified.sessionNonce,
        }),
        credentials: "include",
      });
      if (!attachRes.ok) {
        const payload = (await attachRes.json().catch(() => ({}))) as {
          error?: string;
        };
        if (payload.error === "E023:phone_belongs_to_other_account") {
          setError(
            "This phone is already linked to a different NexGen account. Sign in with the original method.",
          );
        } else {
          setError("Couldn't attach phone to your account. Try again.");
        }
        trackPostHog("otp_verify_failed", {
          errorCode: payload.error ?? "attach_failed",
        });
        setPending(false);
        return;
      }
      const attached = (await attachRes.json()) as {
        nextStep?: string;
      };

      trackPostHog("otp_verified", { from: "phone-verify" });
      toast.success("Phone verified.");
      const next = attached.nextStep ?? "corridor";
      router.replace(`/signup/${next}`);
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown_error";
      trackPostHog("otp_verify_failed", { errorCode: code });
      setError(
        code === "E021:invalid_code"
          ? "That code didn't match. Try again."
          : "Verification failed. Try again.",
      );
      setPending(false);
    }
  }

  async function onResend() {
    if (secondsLeft > 0 || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await authRequestOtp({
        phone: { country: "IN", e164 },
        turnstileToken: turnstileToken!,
      });
      setOtpSessionId(res.otpSessionId);
      setChannel(res.channel ?? "whatsapp");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      toast.message("Code resent.");
    } catch {
      toast.error("Couldn't resend. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SignupShell step={3}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        {stage === "phone" ? "Add your phone." : "Enter the code."}
      </h1>
      <p className="mt-2 text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]">
        {stage === "phone" ? (
          <>
            One last check. Every member of your corridor has a verified
            phone, so you do too.
          </>
        ) : (
          <>
            Sent via {channel === "sms" ? "SMS" : "WhatsApp"} to +91 {phoneTail}.
          </>
        )}
      </p>

      {stage === "phone" ? (
        <form onSubmit={onSubmitPhone} className="mt-8 space-y-5" noValidate>
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
            disabled={!canSubmitPhone}
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmitCode} className="mt-8 space-y-5" noValidate>
          <label className="block">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              6-digit code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-2 h-14 w-full rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-center font-mono text-[24px] tracking-[0.32em] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
            />
          </label>

          {error && (
            <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmitCode}
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify"}
          </button>

          <div className="flex items-center justify-between text-[12px] text-[color:var(--color-fg-subtle)]">
            <button
              type="button"
              onClick={() => {
                setStage("phone");
                setCode("");
                setError(null);
              }}
              className="underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline"
            >
              ← Use a different number
            </button>
            <button
              type="button"
              disabled={secondsLeft > 0 || pending}
              onClick={onResend}
              className="underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </SignupShell>
  );
}
