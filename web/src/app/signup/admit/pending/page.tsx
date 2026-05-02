"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";

/**
 * /signup/admit/pending — under-review state.
 *
 * Real impl polls verification.status; mock immediately routes to
 * outcome on a 5-second timer.
 *
 * v16 web pivot §Bucket 4.
 */
export default function SignupAdmitPendingPage() {
  const router = useRouter();
  const admitState = useSignup((s) => s.admitState);

  useEffect(() => {
    if (!admitState) {
      router.replace("/signup/admit");
      return;
    }
    // Mock: auto-approve after 5 seconds. Real impl polls
    // verification.status() and routes when state changes.
    const timer = setTimeout(() => router.push("/signup/admit/outcome"), 5000);
    return () => clearTimeout(timer);
  }, [admitState, router]);

  return (
    <SignupShell step={7}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        Under review
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        A real human is reading your letter.
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        Median review: 4 hours. Hard SLA: 48 hours. We email you the
        moment it&apos;s decided. Mock dev: auto-routing to the outcome
        in 5 seconds.
      </p>

      <div className="mt-8 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          What happens while you wait
        </p>
        <ul className="mt-3 space-y-2 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
          <li>· You can close this tab — we&apos;ll email when done.</li>
          <li>· Your admit letter auto-deletes 60 min after the decision.</li>
          <li>· If something looks off, the reviewer messages you directly.</li>
        </ul>
      </div>

      <Link
        href="/"
        className="mt-8 block text-center text-[12px] text-[color:var(--color-fg-subtle)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)]"
      >
        Close — we&apos;ll email you
      </Link>
    </SignupShell>
  );
}
