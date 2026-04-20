import Link from "next/link";
import { SocialChips } from "@/components/ui/SocialChips";
import { FooterEmail } from "@/components/layout/FooterEmail";

/**
 * Footer. Quiet closing bar. Three columns on desktop:
 *   1. wordmark + elevator pitch
 *   2. site links
 *   3. social row + tiny legal line
 * Collapses to a single column on mobile.
 */

const FOOTER_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/founder", label: "Founder" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] pt-16 pb-10">
      <div className="container-narrow">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Column 1 - wordmark + line */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)]"
            >
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 9V3l8 6V3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>NexGen</span>
            </Link>
            <p className="mt-5 max-w-[320px] text-[13.5px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              Find your people before you land. A pocket-sized group of
              verified students flying to the same country, the same month,
              as you.
            </p>
          </div>

          {/* Column 2 - links */}
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - socials + contact */}
          <div className="md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Elsewhere
            </p>
            <div className="mt-4">
              <SocialChips size="sm" tone="subtle" />
            </div>
            <FooterEmail email="hello@nexgenconnect.com" />
          </div>
        </div>

        {/* Bottom legal strip */}
        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-6 md:flex-row md:items-center">
          <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            © {year} NexGen Connect · Made with care
          </p>
          <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            The app ships Sept 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
