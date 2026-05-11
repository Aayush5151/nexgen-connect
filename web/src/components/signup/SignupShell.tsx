"use client";

import { type ReactNode } from "react";
import Link from "next/link";

/**
 * SignupShell — shared chrome for /signup/* pages.
 *
 * Renders:
 *   - thin top bar with NexGen wordmark only
 *   - centered content slot
 *   - footer with help link
 *
 * The full Navbar/Footer are intentionally NOT rendered inside the
 * funnel — fewer escape hatches, fewer distractions during onboarding.
 *
 * The "Step N / 7" indicator was removed: surfacing the total step
 * count up-front made the funnel feel longer than it is and risked
 * early bailouts. Each page already shows its own heading + a one-
 * line subtitle telling the user what this step is for, which is
 * the only context that helps. The `step` prop is kept on the type
 * signature so future telemetry / progress UI can use it without
 * changing every page.
 *
 * v16 web pivot §Bucket 4.
 */

type Props = {
  /** Reserved for future telemetry / progress UI. Currently unused
   *  in the rendered chrome — the visible step indicator was removed
   *  to keep the funnel from advertising its length. */
  step: number;
  total?: number;
  children: ReactNode;
};

export function SignupShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-border)]">
        <div className="container-narrow flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-[14px] font-semibold text-[color:var(--color-fg)]"
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 9V3l8 6V3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            NexGen Connect
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[480px]">{children}</div>
      </main>
      <footer className="border-t border-[color:var(--color-border)]">
        <div className="container-narrow flex h-12 items-center justify-between text-[12px] text-[color:var(--color-fg-subtle)]">
          <span>Stuck?</span>
          <a
            href="mailto:hello@nexgenconnect.com"
            className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
          >
            hello@nexgenconnect.com
          </a>
        </div>
      </footer>
    </div>
  );
}
