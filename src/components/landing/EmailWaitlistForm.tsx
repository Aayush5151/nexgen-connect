"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { joinEmailWaitlistAction } from "@/app/actions/email-waitlist";
import { cn } from "@/lib/utils";

/**
 * EmailWaitlistForm. Single-field pre-launch email collector.
 *
 * Two visual modes:
 *   - "pill": inline field + button inside a single pill (used in hero)
 *   - "stack": stacked input + full-width button (used in final CTA)
 *
 * Submits via the `joinEmailWaitlistAction` server action, swallows
 * duplicate-email cases silently (treats them as success), and animates
 * into a compact success state with a check icon.
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
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await joinEmailWaitlistAction({ email, referrer });
      if (res.ok) {
        setDone(true);
        setEmail("");
      } else {
        setError(res.error);
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
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-[52px] items-center gap-3 rounded-[12px] border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 text-[14px] text-[color:var(--color-fg)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
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
              className="flex h-[52px] items-center gap-1.5 overflow-hidden rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-1.5 transition-colors focus-within:border-[color:var(--color-primary)]/60"
            >
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending || email.length === 0}
                className="inline-flex h-full shrink-0 items-center gap-1.5 rounded-[8px] bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
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
          <p
            role="alert"
            className="mt-2 text-[12px] text-[color:var(--color-danger)]"
          >
            {error}
          </p>
        )}
      </form>
    );
  }

  // stack mode
  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn("w-full max-w-[420px]", className)}
    >
      {done ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 rounded-[12px] border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 py-4 text-[14px] text-[color:var(--color-fg)]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="h-14 w-full rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending || email.length === 0}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[12px] bg-[color:var(--color-primary)] text-[15px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
            )}
            {submitLabel}
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 text-[12px] text-[color:var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </form>
  );
}
