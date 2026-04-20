"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { joinEmailWaitlistAction } from "@/app/actions/email-waitlist";
import { ConfettiBurst } from "@/components/shared/ConfettiBurst";
import { cn } from "@/lib/utils";

/**
 * EmailWaitlistForm. Single-field pre-launch email collector.
 *
 * Two visual modes:
 *   - "pill": inline field + button inside a single pill (used in hero)
 *   - "stack": stacked input + full-width button (used in final CTA)
 *
 * Submits via the `joinEmailWaitlistAction` server action and:
 *   - Treats duplicate-email as a quiet success.
 *   - Fires a sonner toast so the success feedback is noticed even if
 *     the form is off-screen.
 *   - Bursts a confetti animation under the success chip the first time.
 *   - Blocks the button while the action is in flight + shows a spinner.
 */

type Mode = "pill" | "stack";

type Props = {
  mode?: Mode;
  referrer: string;
  className?: string;
  /** Override the default placeholder copy. */
  placeholder?: string;
  /** Override the default submit button label. */
  submitLabel?: string;
};

function isLikelyValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function EmailWaitlistForm({
  mode = "pill",
  referrer,
  className,
  placeholder = "you@school.edu",
  submitLabel = "Notify me",
}: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = !isPending && isLikelyValidEmail(email);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please enter a valid email address.");
      return;
    }
    startTransition(async () => {
      const res = await joinEmailWaitlistAction({ email, referrer });
      if (res.ok) {
        setDone(true);
        setBurst(Date.now());
        setEmail("");
        toast.success(
          res.already ? "You're already on the list." : "You're on the list.",
          {
            description: res.already
              ? "We saved your spot already. Expect an email on launch day."
              : "We'll email you the moment the app is live.",
            icon: <Sparkles className="h-4 w-4" />,
          },
        );
      } else {
        setError(res.error);
        toast.error("Couldn't add you", { description: res.error });
      }
    });
  }

  if (mode === "pill") {
    return (
      <form
        onSubmit={submit}
        noValidate
        className={cn("relative w-full max-w-[420px]", className)}
      >
        <ConfettiBurst trigger={burst} />
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex h-[52px] items-center gap-3 rounded-[12px] border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 text-[14px] text-[color:var(--color-fg)]"
            >
              <motion.span
                initial={{ scale: 0.2, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 14,
                  delay: 0.05,
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
              <span>
                You&apos;re on the list.{" "}
                <span className="text-[color:var(--color-fg-muted)]">
                  We&apos;ll email you on launch day.
                </span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={false}
              className="flex h-[52px] items-center gap-1.5 overflow-hidden rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-1.5 transition-[border-color,box-shadow] focus-within:border-[color:var(--color-primary)]/60 focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
            >
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={placeholder}
                aria-label="Email address"
                aria-invalid={Boolean(error)}
                className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-full shrink-0 items-center gap-1.5 rounded-[8px] bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                ) : null}
                {submitLabel}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-[12px] text-[color:var(--color-danger)]"
          >
            {error}
          </motion.p>
        )}
      </form>
    );
  }

  // stack mode
  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn("relative w-full max-w-[420px]", className)}
    >
      <ConfettiBurst trigger={burst} />
      {done ? (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex items-center gap-3 rounded-[12px] border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 py-4 text-[14px] text-[color:var(--color-fg)]"
        >
          <motion.span
            initial={{ scale: 0.2, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.05 }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
          <span>
            You&apos;re on the list.{" "}
            <span className="text-[color:var(--color-fg-muted)]">
              We&apos;ll email you the moment it launches.
            </span>
          </span>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="sr-only" htmlFor={`email-${referrer}`}>
            Email address
          </label>
          <input
            id={`email-${referrer}`}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className="h-14 w-full rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color,box-shadow] focus:border-[color:var(--color-primary)]/60 focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[12px] bg-[color:var(--color-primary)] text-[15px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
            )}
            {submitLabel}
          </button>
        </div>
      )}

      {error && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-[12px] text-[color:var(--color-danger)]"
        >
          {error}
        </motion.p>
      )}
    </form>
  );
}
