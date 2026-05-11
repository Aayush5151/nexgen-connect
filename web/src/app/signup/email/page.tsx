"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

import { SignupShell } from "@/components/signup/SignupShell";
import { signInWithEmail } from "@/lib/auth/oauth";
import { trackPostHog } from "@/lib/posthog";

/**
 * /signup/email, magic-link entry.
 *
 * The user types an email, we ask Supabase to mail a one-time link.
 * Clicking the link lands them back at /auth/callback which signs
 * them in and routes to /signup/you (same convergence point as the
 * Google path).
 *
 * Magic-link is friendlier than email+password for our audience —
 * no password to remember on a phone, and the link doubles as
 * the email-verification step.
 *
 * v17 OAuth entry.
 */

const emailSchema = z.string().trim().email();

export default function SignupEmailPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = emailSchema.safeParse(email).success;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    setPending(true);
    setError(null);
    trackPostHog("signup_email_link_requested", {});
    const res = await signInWithEmail(email.trim());
    setPending(false);
    if (!res.ok) {
      setError("Couldn't send the link. Try again or use a different method.");
      toast.error("Couldn't send the magic link.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <SignupShell step={1}>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          Check your inbox.
        </h1>
        <p className="mt-3 text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]">
          We sent a one-time sign-in link to{" "}
          <span className="text-[color:var(--color-fg)]">{email}</span>. It
          works once and expires in 15 minutes.
        </p>
        <p className="mt-6 text-[13px] text-[color:var(--color-fg-subtle)]">
          Didn&apos;t get it? Check spam, or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-[color:var(--color-fg)] underline underline-offset-2"
          >
            use a different email
          </button>
          .
        </p>
      </SignupShell>
    );
  }

  return (
    <SignupShell step={1}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Use your email.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        We&apos;ll send a one-time sign-in link. No password to remember.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <label className="block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Email
          </span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-14 w-full rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
          />
        </label>

        {error && (
          <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={!valid || pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send magic link"}
        </button>

        <Link
          href="/signup"
          className="mx-auto block text-center text-[12px] text-[color:var(--color-fg-subtle)] underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline"
        >
          Use a different method
        </Link>
      </form>
    </SignupShell>
  );
}
