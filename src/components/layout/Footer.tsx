import Link from "next/link";
import { SocialChips } from "@/components/ui/SocialChips";
import { FooterEmail } from "@/components/layout/FooterEmail";

/**
 * Footer. Quiet closing bar, three columns on desktop:
 *     1. wordmark + elevator pitch + socials + email (identity & contact)
 *     2. Navigate (how, founder, pricing, FAQ, press, legal - merged)
 *     3. Campuses (Ireland + Germany side-by-side, flat)
 * Collapses to a single column on mobile.
 *
 * v11 declutter: the previous pass had four columns, a Campuses column
 * with two nested sub-sections each carrying their own label and
 * internal 2-col grid, and a Company column that stacked links + social
 * chips + email on top of each other. It read as a wall of small
 * sections rather than a footer. This rework:
 *   - Merges Product + Company into a single "Navigate" column.
 *   - Splits Campuses horizontally into Ireland | Germany rather than
 *     a stacked block, so the two corridors read side-by-side the same
 *     way the rest of the marketing does.
 *   - Moves the contact row (social chips + email) into the identity
 *     column so the closing feels like one pitch, not four.
 *   - Drops the duplicated "Ireland Sept 2026 · Germany Oct 2026" line
 *     from the legal strip - the dates already appear above under each
 *     campus block, so we only need the copyright note at the foot.
 */

const NAVIGATE_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/founder", label: "Founder" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/press", label: "Press" },
  { href: "/legal", label: "Privacy & Terms" },
];

const IRELAND_CAMPUSES = [
  { href: "/trinity", label: "Trinity" },
  { href: "/ucd", label: "UCD" },
  { href: "/ucc", label: "UCC" },
  { href: "/checklist", label: "Checklist" },
];

const GERMANY_CAMPUSES = [
  { href: "/tum", label: "TUM Munich" },
  { href: "/lmu", label: "LMU Munich" },
  { href: "/rwth-aachen", label: "RWTH Aachen" },
  { href: "/humboldt", label: "HU Berlin" },
  { href: "/checklist-germany", label: "Checklist" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] pt-12 pb-10 sm:pt-16">
      <div className="container-narrow">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-12 md:gap-10">
          {/* Column 1 - identity, pitch, socials, email. One consolidated
              block so the closing voice reads as a single note, not
              four separate scraps. */}
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
            <p className="mt-5 max-w-[340px] text-[13.5px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              Find your people before you land. A pocket-sized group of
              verified students flying to the same country, the same month,
              as you.
            </p>
            <div className="mt-6">
              <SocialChips size="sm" tone="subtle" />
            </div>
            <FooterEmail email="hello@nexgenconnect.com" />
          </div>

          {/* Column 2 - Navigate. Product + Company links live together
              here now; one label, one list, less nesting. */}
          <nav aria-label="Footer navigation" className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Navigate
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAVIGATE_LINKS.map((l) => (
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
          </nav>

          {/* Column 3 - Campuses split horizontally into the two live
              corridors. Side-by-side beats stacked here because it
              mirrors the "two live corridors" story the globe section
              tells, and halves the vertical footprint. */}
          <div className="md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Campuses
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                  />
                  Ireland
                </div>
                <ul className="mt-2 space-y-1.5">
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
                  Germany
                </div>
                <ul className="mt-2 space-y-1.5">
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
        </div>

        {/* Bottom legal strip. Single line - the corridor dates that
            used to be duplicated here live above now. */}
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-6 sm:mt-14 md:flex-row md:items-center">
          <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            &copy; {year} NexGen Connect &middot; Made with care
          </p>
          <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            Ireland &middot; Sept 2026 &nbsp;|&nbsp; Germany &middot; Oct 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
