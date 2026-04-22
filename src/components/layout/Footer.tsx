import Link from "next/link";
import { SocialChips } from "@/components/ui/SocialChips";
import { FooterEmail } from "@/components/layout/FooterEmail";

/**
 * Footer. Quiet closing bar, four columns on desktop:
 *     1. wordmark + elevator pitch
 *     2. Product links (how, founder, pricing, FAQ)
 *     3. Campuses (7 uni pages + 2 pre-arrival checklists)
 *     4. Company (press, legal) + social row + contact
 * Collapses to a single column on mobile.
 *
 * v10 discoverability: the Campuses column was previously missing, so
 * /trinity /ucd /ucc /tum /lmu /rwth-aachen /humboldt /checklist /
 * checklist-germany were reachable only via SEO. Navbar now has a
 * Campuses dropdown and the Footer catches every user who scrolls
 * all the way down without opening the dropdown.
 *
 * Privacy + Terms live on a single /legal page, with /privacy and
 * /terms acting as anchored shortcuts into that page.
 */

const PRODUCT_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/founder", label: "Founder" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const IRELAND_CAMPUSES = [
  { href: "/trinity", label: "Trinity" },
  { href: "/ucd", label: "UCD" },
  { href: "/ucc", label: "UCC" },
  { href: "/checklist", label: "Checklist · Ireland" },
];

const GERMANY_CAMPUSES = [
  { href: "/tum", label: "TUM Munich" },
  { href: "/lmu", label: "LMU Munich" },
  { href: "/rwth-aachen", label: "RWTH Aachen" },
  { href: "/humboldt", label: "HU Berlin" },
  { href: "/checklist-germany", label: "Checklist · Germany" },
];

const COMPANY_LINKS = [
  { href: "/press", label: "Press" },
  { href: "/legal", label: "Privacy & Terms" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] pt-12 pb-10 sm:pt-16">
      <div className="container-narrow">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-12 md:gap-8">
          {/* Column 1 - wordmark + elevator pitch */}
          <div className="md:col-span-4">
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

          {/* Column 2 - Product */}
          <div className="md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Product
            </p>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
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

          {/* Column 3 - Campuses (stacked: Ireland block → Germany block) */}
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Campuses
            </p>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                  />
                  Ireland · Sept 2026
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {IRELAND_CAMPUSES.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                  />
                  Germany · Oct 2026
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {GERMANY_CAMPUSES.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 4 - Company + social */}
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Company
            </p>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((l) => (
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
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                Elsewhere
              </p>
              <div className="mt-3">
                <SocialChips size="sm" tone="subtle" />
              </div>
              <FooterEmail email="hello@nexgenconnect.com" />
            </div>
          </div>
        </div>

        {/* Bottom legal strip */}
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-6 sm:mt-16 md:flex-row md:items-center">
          <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            © {year} NexGen Connect · Made with care
          </p>
          <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            Ireland Sept 2026 · Germany Oct 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
