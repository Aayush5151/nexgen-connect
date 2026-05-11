"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

import { SignupShell } from "@/components/signup/SignupShell";
import { TurnstileWidget } from "@/components/signup/TurnstileWidget";
import { useSignup } from "@/lib/signup/state";
import { authRequestOtp } from "@/lib/signup/services";
import { signInWithGoogle } from "@/lib/auth/oauth";
import { trackPostHog } from "@/lib/posthog";

/**
 * /signup — OAuth-first entry. Step 1 of 7.
 *
 * Three ways in, ranked by friction (lowest first):
 *
 *   1. Continue with Google — one-tap on a phone in India. Supabase
 *      OAuth → /auth/callback → /signup/you. No second phone-OTP
 *      gate; OAuth is the identity anchor (DigiLocker + admit letter
 *      handle real trust further down).
 *
 *   2. Continue with email — magic link via Supabase. Same identity
 *      semantics as Google.
 *
 *   3. Continue with phone — direct phone-OTP path for users who
 *      don't want to link a social account. This is the only path
 *      where phone is the anchor.
 *
 * Interactive surface (v17): kinetic typography, live verification
 * ticker, method cards with motion, animated background. Replaces
 * the previous flat-button design that read as a generic form. Tone
 * stays honest — every motion element points at real signal
 * (verifications, corridor activity), no decorative fluff.
 *
 * v17 OAuth entry.
 */
export default function SignupChooserPage() {
  return (
    <SignupShell step={1}>
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

/* ----------------------------- chooser body ----------------------------- */

function ChooserBody() {
  const [showPhone, setShowPhone] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    trackPostHog("signup_started", {});
  }, []);

  // Stagger reveal order: live badge → headline → subtitle → cards →
  // footer. Each child uses transition.delay to schedule itself
  // relative to mount. Honors prefers-reduced-motion by skipping the
  // initial offset entirely.
  const stagger = (i: number) =>
    prefersReducedMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="relative">
      <AmbientBackdrop />

      <motion.div {...stagger(0)} className="relative">
        <LiveActivityBadge />
      </motion.div>

      <motion.h1
        {...stagger(1)}
        className="relative mt-5 font-heading text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)]"
      >
        Sign in.
        <br />
        <span className="text-[color:var(--color-primary)]">Or sign up.</span>
      </motion.h1>

      <motion.p
        {...stagger(2)}
        className="relative mt-3 text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]"
      >
        One step now. Then your name, your corridor, and a quick
        identity check. Five minutes, end-to-end.
      </motion.p>

      <motion.div {...stagger(3)} className="relative mt-7 space-y-3">
        <GoogleCard />
        <EmailCard />

        <DividerOr />

        <AnimatePresence mode="wait" initial={false}>
          {!showPhone ? (
            <motion.div
              key="phone-button"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <PhoneCardCollapsed
                onExpand={() => {
                  setShowPhone(true);
                  trackPostHog("signup_method_selected", { method: "phone" });
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="phone-form"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
            >
              <PhoneForm onCancel={() => setShowPhone(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div {...stagger(4)} className="relative">
        <RecentVerifications />
      </motion.div>

      <motion.div {...stagger(5)} className="relative">
        <FooterChrome />
      </motion.div>
    </div>
  );
}

/* --------------------------- ambient backdrop --------------------------- */

/**
 * Subtle floating geometry sitting behind the foreground content. Two
 * slow-drifting blurred shapes in the brand mint, low opacity, no
 * pointer events. CSS-only animation so it doesn't compete with the
 * framer-motion entrance schedule for the main thread.
 */
function AmbientBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -left-24 -top-24 h-64 w-64 rounded-full opacity-[0.10] blur-3xl"
        style={{
          background: "var(--color-primary)",
          animation: "nx-drift-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-32 top-1/3 h-72 w-72 rounded-full opacity-[0.08] blur-3xl"
        style={{
          background: "var(--color-primary)",
          animation: "nx-drift-b 28s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes nx-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(20px, 32px, 0) scale(1.08); }
        }
        @keyframes nx-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-24px, -28px, 0) scale(1.06); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------ live activity badge -------------------------- */

/**
 * Animated counter for the corridor-wide signup pulse. The number
 * counts up on mount, with a small green dot pulsing to signal live
 * status. Mock value for now — Bucket 5's verifiedCount feed wires
 * this to a real number.
 */
function LiveActivityBadge() {
  const target = 47; // mock; replace with real corridorPreview.layer2Count
  const value = useCountUp(target, 900);
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/[0.08] px-3 py-1.5">
      <PulseDot />
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
        {value} students verified this week
      </span>
    </div>
  );
}

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2 items-center justify-center">
      <span
        aria-hidden="true"
        className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-primary)] opacity-75"
        style={{ animation: "nx-ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }}
      />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
      <style>{`
        @keyframes nx-ping {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

/* -------------------------- method cards ------------------------------- */

function MethodCard({
  onClick,
  href,
  children,
  variant = "outline",
  icon,
  disabled,
  trailing,
  "aria-label": ariaLabel,
}: {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  variant?: "primary-light" | "outline";
  icon: React.ReactNode;
  disabled?: boolean;
  trailing?: React.ReactNode;
  "aria-label"?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const base =
    "group relative flex h-14 w-full items-center gap-3 overflow-hidden rounded-[12px] px-4 text-left text-[14px] font-semibold transition-colors";
  const variantClass =
    variant === "primary-light"
      ? "bg-white text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-white/95"
      : "border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] hover:border-[color:var(--color-primary)]/50 hover:bg-[color:var(--color-surface-elevated)]";
  const disabledClass = disabled ? "cursor-not-allowed opacity-60" : "";
  const className = `${base} ${variantClass} ${disabledClass}`;

  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">{icon}</span>
      <span className="flex-1 truncate">{children}</span>
      <span className="shrink-0 text-[color:var(--color-fg-subtle)]">
        {trailing ?? <Arrow />}
      </span>
    </>
  );

  const motionProps = prefersReducedMotion
    ? {}
    : { whileHover: { y: -1 }, whileTap: { scale: 0.985 } };

  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link href={href} onClick={onClick} aria-label={ariaLabel} className={className}>
          {inner}
        </Link>
      </motion.div>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="transition-transform group-hover:translate-x-0.5"
    >
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleCard() {
  const [pending, setPending] = useState(false);
  return (
    <MethodCard
      variant="primary-light"
      icon={<GoogleLogo />}
      disabled={pending}
      trailing={
        pending ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:#666]">
            Connecting…
          </span>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:#666]">
            Fastest
          </span>
        )
      }
      onClick={async () => {
        if (pending) return;
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
    >
      Continue with Google
    </MethodCard>
  );
}

function EmailCard() {
  return (
    <MethodCard
      icon={<EmailIcon />}
      href="/signup/email"
      onClick={() => trackPostHog("signup_method_selected", { method: "email" })}
    >
      Continue with email
    </MethodCard>
  );
}

function PhoneCardCollapsed({ onExpand }: { onExpand: () => void }) {
  return (
    <MethodCard icon={<PhoneIcon />} onClick={onExpand}>
      Continue with phone
    </MethodCard>
  );
}

/* ------------------------------ divider -------------------------------- */

function DividerOr() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-[color:var(--color-border)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        or
      </span>
      <span className="h-px flex-1 bg-[color:var(--color-border)]" />
    </div>
  );
}

/* ------------------------- recent verifications ------------------------ */

/**
 * Slowly auto-rotating verification ticker. Mock data for now — the
 * shape mirrors the real corridorPreview feed so wiring is a swap.
 * Helps surface the "you'd join real people, not an empty list"
 * signal that v15 BP §3.4 calls out as the cold-start trust anchor.
 */
const RECENT_MOCK = [
  { name: "Priya", from: "Mumbai", to: "UCD Dublin", minutesAgo: 3 },
  { name: "Arjun", from: "Pune", to: "TUM Munich", minutesAgo: 7 },
  { name: "Sneha", from: "Bengaluru", to: "RWTH Aachen", minutesAgo: 12 },
  { name: "Rohan", from: "Delhi", to: "Trinity Dublin", minutesAgo: 19 },
  { name: "Ananya", from: "Hyderabad", to: "LMU Munich", minutesAgo: 26 },
];

function RecentVerifications() {
  const [idx, setIdx] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % RECENT_MOCK.length);
    }, 3200);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const current = RECENT_MOCK[idx];

  return (
    <div className="mt-8 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
          Live
        </span>
        <span className="h-3 w-px bg-[color:var(--color-border)]" />
        <div className="relative h-5 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${current.name}-${idx}`}
              initial={prefersReducedMotion ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { y: -14, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 truncate text-[12px] leading-5 text-[color:var(--color-fg-muted)]"
            >
              <span className="text-[color:var(--color-fg)]">{current.name}</span>
              {" · "}
              <span>{current.from}</span>
              <span className="mx-1 text-[color:var(--color-fg-subtle)]">→</span>
              <span>{current.to}</span>
              <span className="ml-1.5 text-[color:var(--color-fg-subtle)]">
                · {current.minutesAgo} min ago
              </span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ footer --------------------------------- */

function FooterChrome() {
  return (
    <>
      <p className="mt-6 text-center text-[11px] leading-[1.5] text-[color:var(--color-fg-subtle)]">
        By continuing you agree to the{" "}
        <Link
          href="/terms"
          className="underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg-muted)]"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg-muted)]"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-[color:var(--color-fg-subtle)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3 w-3 text-[color:var(--color-primary)]"
          fill="currentColor"
        >
          <path d="M8 1.2 2.4 3.4v3.7c0 3.5 2.4 6.7 5.6 7.7 3.2-1 5.6-4.2 5.6-7.7V3.4L8 1.2Zm-1 9.5L4 7.7l1-1 2 2 4-4 1 1-5 5Z" />
        </svg>
        Mumbai region · DPDP compliant
      </p>
    </>
  );
}

/* ------------------------------ phone form ----------------------------- */

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
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-[14px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-4"
    >
      <div>
        <label
          htmlFor="phone"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]"
        >
          Mobile number
        </label>
        <div className="mt-2 flex h-14 items-center rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 transition-colors focus-within:border-[color:var(--color-primary)]/60">
          <span className="mr-3 inline-flex items-center gap-1.5 border-r border-[color:var(--color-border)] pr-3 font-mono text-[14px] text-[color:var(--color-fg-muted)]">
            <FlagIN />
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
            className="min-w-0 flex-1 bg-transparent text-[15px] tracking-[0.02em] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:outline-none"
          />
          {validDigits && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              aria-hidden="true"
              className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)]/15"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.5l2.2 2.2L9.5 3.5"
                  stroke="var(--color-primary)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          )}
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

      <motion.button
        type="submit"
        disabled={!canSubmit}
        whileTap={canSubmit ? { scale: 0.985 } : undefined}
        className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send code"}
      </motion.button>

      <button
        type="button"
        onClick={onCancel}
        className="mx-auto block text-[12px] text-[color:var(--color-fg-subtle)] underline decoration-dotted underline-offset-2 hover:text-[color:var(--color-fg-muted)]"
      >
        Use a different method
      </button>
    </form>
  );
}

/* ------------------------------- icons --------------------------------- */

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="text-[color:var(--color-fg-muted)]"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="text-[color:var(--color-fg-muted)]"
    >
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function FlagIN() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-3 w-[18px] flex-col overflow-hidden rounded-[1px] ring-1 ring-[color:var(--color-border)]"
    >
      <span className="flex-1 bg-[#FF9933]" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-[#138808]" />
    </span>
  );
}

/* ------------------------------ helpers -------------------------------- */

/**
 * Count up from 0 to `target` over `durationMs` using requestAnimationFrame.
 * Eases out so the last few values arrive slowly — feels less robotic than
 * a linear ramp. Respects prefers-reduced-motion by snapping to target.
 */
function useCountUp(target: number, durationMs: number) {
  const prefersReducedMotion = useReducedMotion();
  // Lazy initial state so the reduced-motion path lands on `target`
  // without a setState-in-effect-body — React 19 rejects that pattern.
  const [value, setValue] = useState<number>(() =>
    prefersReducedMotion ? target : 0,
  );

  useEffect(() => {
    // Reduced-motion: nothing to animate, initial state already
    // matches `target`. Bail out before scheduling the rAF tick.
    if (prefersReducedMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      // setState inside a rAF callback is fine — it's an async path
      // out of the effect body, not a sync render-triggering call.
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, prefersReducedMotion]);

  return value;
}
