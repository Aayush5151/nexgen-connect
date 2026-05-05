"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * AppNav — fixed bottom strip for the (app) routes.
 *
 * Mobile-style bottom nav reused on web because the verified-student
 * interaction loop (corridor / chat / help / profile) is identical
 * across surfaces. Web users on small screens get the same tap target;
 * desktop users get the same anchor — no second navigation grammar to
 * learn.
 *
 * v16 web pivot §Bucket 5.
 */

const TABS: { href: string; label: string; matchPrefix: string }[] = [
  { href: "/app/corridor", label: "Corridor", matchPrefix: "/app/corridor" },
  { href: "/app/chat", label: "Chat", matchPrefix: "/app/chat" },
  { href: "/app/help", label: "Help", matchPrefix: "/app/help" },
  { href: "/app/profile", label: "Profile", matchPrefix: "/app/profile" },
];

export function AppNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/90 backdrop-blur"
    >
      <ul className="container-narrow grid h-[72px] grid-cols-4 items-stretch">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.matchPrefix);
          return (
            <li key={t.href} className="contents">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-[0.02em] " +
                  (active
                    ? "text-[color:var(--color-primary)]"
                    : "text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]")
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    "h-1 w-8 rounded-full " +
                    (active ? "bg-[color:var(--color-primary)]" : "bg-transparent")
                  }
                />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
