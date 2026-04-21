"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { joinEmailWaitlistAction } from "@/app/actions/email-waitlist";
import { ConfettiBurst } from "@/components/shared/ConfettiBurst";
import {
  suggestEmailCorrection,
  validateEmail,
} from "@/lib/validation/email";
import { cn } from "@/lib/utils";

/**
 * EmailWaitlistForm. Single-field pre-launch email collector.
 *
 * Two visual modes:
 *   - "pill": inline field + button inside a single pill (used in hero)
 *   - "stack": stacked input + full-width button (used in final CTA)
 *
 * Validation:
 *   - Live as-you-type: stays quiet until the user has tried at least one
 *     full submit or blurred the field with bad input. Then it shows a
 *     specific inline message.
 *   - On submit, runs the full validator and blocks submission if the
 *     email is empty, missing @, missing TLD, too long, etc.
 *   - Typo suggestions ("did you mean gmail.com?") appear when a likely
 *     mistake is detected. One-click accept inserts the corrected value
 *     and focuses the field so the user can verify.
 *
 * Submit path:
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

export function EmailWaitlistForm({
  mode = "pill",
  referrer,
  className,
  placeholder = "you@school.edu",
  submitLabel = "Secure my spot",
}: Props) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // "Did you mean gmial.com → gmail.com?" - only computed after the user
  // has written something that *looks* like a full email, so we don't
  // distract while they're still typing.
  const suggestion = useMemo(() => {
    if (!email.includes("@") || !email.includes(".")) return undefined;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length < 6) return undefined;
    return suggestEmailCorrection(trimmed);
  }, [email]);

  // Live validation after the first blur / failed submit. We don't show
  // errors on the very first keystrokes - that would be annoying.
  const liveError = useMemo(() => {
    if (!touched) return null;
    if (!email.trim()) return "Enter your email to get notified.";
    const result = validateEmail(email);
    return result.ok ? null : result.error;
  }, [touched, email]);

  const displayedError = error ?? liveError;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    const result = validateEmail(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    const normalisedEmail = result.email;

    startTransition(async () => {
      const res = await joinEmailWaitlistAction({
        email: normalisedEmail,
        referrer,
      });
      if (res.ok) {
        setDone(true);
        setBurst(Date.now());
        setEmail("");
        setTouched(false);
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

  // Accept the typo suggestion and move focus back into the field so
  // the user can eyeball the correction before submitting.
  function acceptSuggestion() {
    if (!suggestion) return;
    setEmail(suggestion);
    setError(null);
    // touched stays true so live validation confirms the fix
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLInputElement>(
        `input[data-waitlist-ref="${referrer}"]`,
      );
      el?.focus();
    });
  }

  const inputProps = {
    type: "email" as const,
    autoComplete: "email" as const,
    inputMode: "email" as const,
    required: true,
    value: email,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (error) setError(null);
    },
    onBlur: () => setTouched(true),
    placeholder,
    "aria-invalid": Boolean(displayedError),
    "aria-describedby": displayedError
      ? `email-error-${referrer}`
      : suggestion
        ? `email-hint-${referrer}`
        : undefined,
    "data-waitlist-ref": referrer,
  };

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
              className={cn(
                "flex h-[52px] items-center gap-1.5 overflow-hidden rounded-[12px] border bg-[color:var(--color-surface)] p-1.5 transition-[border-color,box-shadow]",
                displayedError
                  ? "border-[color:var(--color-danger)]/70 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_15%,transparent)]"
                  : "border-[color:var(--color-border-strong)] focus-within:border-[color:var(--color-primary)]/60 focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]",
              )}
            >
              <input
                {...inputProps}
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending}
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

        <FormFeedback
          referrer={referrer}
          error={displayedError}
          suggestion={suggestion && !displayedError ? suggestion : undefined}
          onAcceptSuggestion={acceptSuggestion}
        />
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
            {...inputProps}
            id={`email-${referrer}`}
            className={cn(
              "h-14 w-full rounded-[12px] border bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color,box-shadow] focus:outline-none",
              displayedError
                ? "border-[color:var(--color-danger)]/70 focus:border-[color:var(--color-danger)]/80 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_15%,transparent)]"
                : "border-[color:var(--color-border-strong)] focus:border-[color:var(--color-primary)]/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]",
            )}
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[12px] bg-[color:var(--color-primary)] text-[15px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
            )}
            {submitLabel}
          </button>
        </div>
      )}

      <FormFeedback
        referrer={referrer}
        error={displayedError}
        suggestion={suggestion && !displayedError ? suggestion : undefined}
        onAcceptSuggestion={acceptSuggestion}
      />
    </form>
  );
}

function FormFeedback({
  referrer,
  error,
  suggestion,
  onAcceptSuggestion,
}: {
  referrer: string;
  error: string | null | undefined;
  suggestion: string | undefined;
  onAcceptSuggestion: () => void;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.p
          key="error"
          id={`email-error-${referrer}`}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-2 flex items-start gap-1.5 text-[12.5px] leading-[1.4] text-[color:var(--color-danger)]"
        >
          <AlertCircle
            className="mt-[1px] h-3.5 w-3.5 shrink-0"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span>{error}</span>
        </motion.p>
      ) : suggestion ? (
        <motion.p
          key="suggestion"
          id={`email-hint-${referrer}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] leading-[1.4] text-[color:var(--color-fg-muted)]"
        >
          <span>Did you mean</span>
          <button
            type="button"
            onClick={onAcceptSuggestion}
            className="rounded-[6px] bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-1.5 py-0.5 font-mono text-[12px] font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
          >
            {suggestion}
          </button>
          <span>?</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
