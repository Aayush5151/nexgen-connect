"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  submitFeedbackAction,
  type FeedbackTopic,
} from "@/app/actions/feedback";
import { ConfettiBurst } from "@/components/shared/ConfettiBurst";
import { suggestEmailCorrection, validateEmail } from "@/lib/validation/email";

/**
 * FeedbackForm. Compact 4-field form used in the footer FAQ block.
 * Validates inline with the same validator the waitlist uses so error
 * copy is consistent across the site.
 *
 * Fields: name (optional), email (optional), topic (select), message
 * (required, 8-2000 chars). Submits via `submitFeedbackAction`, shows
 * a toast + confetti on success, and resets back to an empty form.
 */

const TOPIC_OPTIONS: { value: FeedbackTopic; label: string }[] = [
  { value: "general", label: "General question" },
  { value: "verification", label: "Verification / safety" },
  { value: "pricing", label: "Pricing" },
  { value: "bug", label: "Bug or issue" },
  { value: "other", label: "Something else" },
];

type FieldError = "name" | "email" | "topic" | "message";

export function FeedbackForm({ referrer }: { referrer: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<FeedbackTopic>("general");
  const [message, setMessage] = useState("");

  const [touched, setTouched] = useState<Record<FieldError, boolean>>({
    name: false,
    email: false,
    topic: false,
    message: false,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldError, string>>>({});
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const emailSuggestion = useMemo(() => {
    if (!email || !email.includes("@") || !email.includes(".")) return;
    return suggestEmailCorrection(email.trim().toLowerCase());
  }, [email]);

  const liveEmailError = useMemo(() => {
    if (!touched.email || !email.trim()) return null;
    const r = validateEmail(email);
    return r.ok ? null : r.error;
  }, [touched.email, email]);

  const liveMessageError = useMemo(() => {
    if (!touched.message) return null;
    const len = message.trim().length;
    if (len === 0) return "Write a message so we know what to reply to.";
    if (len < 8) return "A little more detail, please - at least 8 characters.";
    if (len > 2000) return "Please keep messages under 2000 characters.";
    return null;
  }, [touched.message, message]);

  function field(name: FieldError): string | undefined {
    const live =
      name === "email"
        ? liveEmailError
        : name === "message"
          ? liveMessageError
          : undefined;
    return errors[name] ?? live ?? undefined;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, topic: true, message: true });

    // Pre-flight: block if the client-side validator already disagrees.
    const nextErrors: Partial<Record<FieldError, string>> = {};
    if (email.trim()) {
      const r = validateEmail(email);
      if (!r.ok) nextErrors.email = r.error;
    }
    const len = message.trim().length;
    if (len === 0) nextErrors.message = "Write a message so we know what to reply to.";
    else if (len < 8) nextErrors.message = "A little more detail, please - at least 8 characters.";
    else if (len > 2000) nextErrors.message = "Please keep messages under 2000 characters.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const res = await submitFeedbackAction({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        topic,
        message: message.trim(),
        referrer,
      });
      if (res.ok) {
        setDone(true);
        setBurst(Date.now());
        setName("");
        setEmail("");
        setMessage("");
        setTopic("general");
        setTouched({ name: false, email: false, topic: false, message: false });
        toast.success("Message sent.", {
          description: "We read every one. Expect a reply the same day.",
        });
      } else {
        if (res.field) {
          setErrors({ [res.field]: res.error });
        } else {
          setErrors({ message: res.error });
        }
        toast.error("Couldn't send", { description: res.error });
      }
    });
  }

  function acceptEmailSuggestion() {
    if (!emailSuggestion) return;
    setEmail(emailSuggestion);
    setErrors((prev) => ({ ...prev, email: undefined }));
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex items-start gap-3 rounded-[12px] border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 py-5 text-[13.5px] text-[color:var(--color-fg)]"
      >
        <ConfettiBurst trigger={burst} />
        <span className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <div>
          <p className="font-heading text-[15px] font-semibold">
            Thanks - got it.
          </p>
          <p className="mt-1 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            A real person reads every message. If you left an email, expect
            a reply the same day.
          </p>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-primary)] underline underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
          >
            Send another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Name (optional)"
          htmlFor="fb-name"
          error={touched.name ? field("name") : undefined}
        >
          <input
            id="fb-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            maxLength={80}
            placeholder="Priya"
            className="h-11 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color,box-shadow] focus:border-[color:var(--color-primary)]/60 focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
          />
        </Field>
        <Field
          label="Email (optional)"
          htmlFor="fb-email"
          error={touched.email ? field("email") : undefined}
          hint={
            emailSuggestion && !field("email")
              ? { text: emailSuggestion, onAccept: acceptEmailSuggestion }
              : undefined
          }
        >
          <input
            id="fb-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="you@school.edu"
            className={`h-11 w-full rounded-[10px] border bg-[color:var(--color-bg)] px-3 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color,box-shadow] focus:outline-none ${
              field("email") && touched.email
                ? "border-[color:var(--color-danger)]/70 focus:border-[color:var(--color-danger)]/80 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_15%,transparent)]"
                : "border-[color:var(--color-border-strong)] focus:border-[color:var(--color-primary)]/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
            }`}
          />
        </Field>
      </div>

      <Field label="Topic" htmlFor="fb-topic">
        <select
          id="fb-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as FeedbackTopic)}
          className="h-11 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 text-[14px] text-[color:var(--color-fg)] transition-[border-color,box-shadow] focus:border-[color:var(--color-primary)]/60 focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
        >
          {TOPIC_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Your message"
        htmlFor="fb-message"
        error={touched.message ? field("message") : undefined}
        counter={{ current: message.trim().length, max: 2000 }}
      >
        <textarea
          id="fb-message"
          required
          rows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          maxLength={2000}
          placeholder="What's on your mind?"
          className={`w-full rounded-[10px] border bg-[color:var(--color-bg)] px-3 py-2.5 text-[14px] leading-[1.55] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color,box-shadow] focus:outline-none ${
            field("message") && touched.message
              ? "border-[color:var(--color-danger)]/70 focus:border-[color:var(--color-danger)]/80 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_15%,transparent)]"
              : "border-[color:var(--color-border-strong)] focus:border-[color:var(--color-primary)]/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
          }`}
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-4 text-[13.5px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
        ) : (
          <Send className="h-4 w-4" strokeWidth={2.2} />
        )}
        {isPending ? "Sending…" : "Send message"}
      </button>
      <p className="text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        We read every message. No auto-replies, ever.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  counter,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: { text: string; onAccept: () => void };
  counter?: { current: number; max: number };
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]"
        >
          {label}
        </label>
        {counter && (
          <span
            className={`font-mono text-[10px] ${
              counter.current > counter.max * 0.9
                ? "text-[color:var(--color-warning)]"
                : "text-[color:var(--color-fg-subtle)]"
            }`}
          >
            {counter.current}/{counter.max}
          </span>
        )}
      </div>
      {children}
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            role="alert"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.16 }}
            className="flex items-start gap-1 text-[11.5px] leading-[1.35] text-[color:var(--color-danger)]"
          >
            <AlertCircle
              className="mt-[1px] h-3 w-3 shrink-0"
              strokeWidth={2.4}
              aria-hidden="true"
            />
            <span>{error}</span>
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.16 }}
            className="flex flex-wrap items-center gap-x-1 text-[11.5px] text-[color:var(--color-fg-muted)]"
          >
            <span>Did you mean</span>
            <button
              type="button"
              onClick={hint.onAccept}
              className="rounded-[5px] bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-1 py-0.5 font-mono text-[11px] font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
            >
              {hint.text}
            </button>
            <span>?</span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
