import { type ReactNode } from "react";
import Link from "next/link";
import { AppNav } from "@/components/app/AppNav";
import { FunnelReset } from "@/components/app/FunnelReset";
import { InstallPrompt } from "@/components/app/InstallPrompt";
import { ServiceWorkerRegistrar } from "@/components/app/ServiceWorkerRegistrar";

/**
 * (app) layout — chrome shared by all authed product surface routes.
 *
 * Renders:
 *   - thin top bar with NexGen wordmark + profile entry
 *   - main content slot
 *   - app-nav strip (corridor, chat, help, profile)
 *
 * Bucket 5 ships with NO real auth gate — Bucket 6 wires Supabase SSR
 * so middleware can redirect unauthenticated requests to /signup. The
 * nav itself is a Client Component so the active-tab calc lives where
 * `usePathname()` works.
 *
 * v16 web pivot §Bucket 5.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
        <div className="container-narrow flex h-14 items-center justify-between">
          <Link
            href="/app/corridor"
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
          <Link
            href="/app/profile"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
          >
            Profile
          </Link>
        </div>
      </header>

      <main id="main" className="flex-1 px-4 pb-[88px] pt-6 md:pt-8">
        <div className="container-narrow">{children}</div>
      </main>

      <AppNav />

      {/* Wipe the signup funnel zustand store once we've landed on any
          authed /app/* route. This breaks the gate-cascade race that
          caused "Open my corridor" → DigiLocker bounces — see
          components/app/FunnelReset.tsx for the full story. */}
      <FunnelReset />

      {/* PWA niceties — register SW + show install prompt on second visit */}
      <ServiceWorkerRegistrar />
      <InstallPrompt />
    </div>
  );
}
