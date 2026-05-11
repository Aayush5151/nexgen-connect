"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

/**
 * Root error boundary — catches every unhandled error in the route
 * tree. Apple-style "we know, here's the way forward" presentation
 * over a stack trace.
 *
 * Three principles:
 *   1. Tell the user what happened, in their language.
 *   2. Give them a way out that always works (Home + Try again).
 *   3. Send the error to Sentry so we hear about it.
 *
 * `error.tsx` MUST be a client component in App Router. The `reset`
 * function comes from React — calling it re-renders the segment
 * without a full reload, which is the right escape hatch for
 * transient failures (network blips, stale tokens).
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main
      id="main"
      className="flex min-h-[70vh] items-center px-4 py-24"
      role="alert"
      aria-live="assertive"
    >
      <div className="container-narrow">
        <div className="max-w-[560px]">
          <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
            Something broke
          </p>
          <h1 className="mt-6 display-lg text-[color:var(--color-fg)]">
            Not your fault.
          </h1>
          <p className="mt-6 body-lg text-[color:var(--color-fg-muted)]">
            We hit an error loading this page. The team has been notified
            automatically. You can try again, or head back to safe ground.
          </p>
          {error.digest && (
            <p className="mt-4 font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
              Reference: {error.digest}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
