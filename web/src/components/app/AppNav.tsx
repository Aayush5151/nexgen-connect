"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MessageCircle, LifeBuoy, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * AppNav — fixed bottom strip for the (app) routes.
 *
 * Mobile-style bottom nav reused on web because the verified-student
 * interaction loop (corridor / chat / help / profile) is identical
 * across surfaces.
 *
 * v18 polish notes:
 *   - Magic-move active indicator. A single 2px bar sits above the
 *     active tab and slides between tabs using `translateX`. The slide
 *     follows our motion language: 300ms / ease-out. This is the iOS
 *     "the indicator IS one thing that moves" detail that separates
 *     premium nav from generic nav.
 *   - Icons + label. lucide-react at 20px, label at 11px, both colored
 *     via the active state. Icons make the nav read as iOS-grade.
 *   - Tactile press: active:scale-[0.96] on the link.
 *   - prefers-reduced-motion neutralizes the slide via the global rule.
 *
 * v17 / v16 web pivot §Bucket 5.
 */

type Tab = {
  href: string;
  label: string;
  matchPrefix: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { href: "/app/corridor", label: "Corridor", matchPrefix: "/app/corridor", Icon: Users },
  { href: "/app/chat", label: "Chat", matchPrefix: "/app/chat", Icon: MessageCircle },
  { href: "/app/help", label: "Help", matchPrefix: "/app/help", Icon: LifeBuoy },
  { href: "/app/profile", label: "Profile", matchPrefix: "/app/profile", Icon: User },
];

export function AppNav() {
  const pathname = usePathname() ?? "/";
  const activeIndex = TABS.findIndex((t) => pathname.startsWith(t.matchPrefix));
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;
  const tabWidth = 100 / TABS.length;

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/90 backdrop-blur"
    >
      <div className="container-narrow relative">
        {/* Magic-move indicator. Single element, slides between tabs.
            Width = 1/n of the row; horizontal position = activeIndex/n.
            Centered horizontally inside its slot via the -translate-x-1/2
            offset inside the inner span. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-[2px] rounded-full bg-[color:var(--color-primary)] transition-transform duration-[300ms] ease-out"
          style={{
            width: `calc(${tabWidth}% - 56px)`,
            left: `${tabWidth / 2}%`,
            transform: `translateX(calc(${safeIndex * 100}% - 50%))`,
          }}
        />

        <ul className="grid h-[72px] grid-cols-4 items-stretch">
          {TABS.map((t, i) => {
            const active = i === safeIndex;
            return (
              <li key={t.href} className="contents">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-[0.01em] transition-[color,transform] duration-[150ms] active:scale-[0.96] " +
                    (active
                      ? "text-[color:var(--color-primary)]"
                      : "text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]")
                  }
                >
                  <t.Icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={active ? 2.25 : 1.75}
                    className="transition-[stroke-width] duration-[200ms]"
                  />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
