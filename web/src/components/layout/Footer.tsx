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
  { href: "/women-only", label: "Women-only" },
  { href: "/research", label: "Research" },
  { href: "/founder", label: "Founder" },
  { href: "/#pricing", label: "Pricing" },
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
    <footer className="mt-auto border-t border-[color:var(--color-border)] pt-8 pb-6 sm:pt-16 sm:pb-10">
      <div className="container-narrow">
        {/* Mobile: identity row (compact) + 2-col Navigate | Campuses
            below + socials + email at the foot.
            md+: original 3-column layout. */}
        <div className="grid gap-6 sm:gap-10 md:grid-cols-12 md:gap-10">
          {/* Identity column. Pitch is hidden on mobile so the footer
              doesn't repeat the hero copy. Socials + email move to the
              bottom on mobile (a separate flex row below the link grid). */}
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
              <span>NexGen Connect</span>
            </Link>
            <p className="mt-3 hidden max-w-[340px] text-[13.5px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:mt-5 sm:block">
              Find your people before you land. A verified group of
              classmates from your home city, going to your destination,
              in your intake month.
            </p>
            <div className="mt-4 hidden sm:mt-6 sm:block">
              <SocialChips size="sm" tone="subtle" />
            </div>
            <div className="hidden sm:block">
              <FooterEmail email="hello@nexgenconnect.com" />
            </div>
          </div>

          {/* Three sibling link columns: Navigate / Ireland / Germany.
              The same 3-column grid renders identically at every
              breakpoint, just with more breathing room as the viewport
              widens. Sits inside the desktop 7-col allocation via
              md:col-span-7. */}
          <div className="grid grid-cols-3 gap-x-3 sm:gap-x-6 md:col-span-7 md:gap-x-8">
            <nav aria-label="Footer navigation">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                Navigate
              </p>
              <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                {NAVIGATE_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[12.5px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:text-[13.5px]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                />
                Ireland
              </div>
              <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                {IRELAND_CAMPUSES.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[12.5px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:text-[13.5px]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                />
                Germany
              </div>
              <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                {GERMANY_CAMPUSES.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[12.5px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:text-[13.5px]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile-only socials + email row, sits below the link grid
            so the identity / contact info still has a home but doesn't
            push the link block out of the viewport. Hidden at sm+
            because there it lives inside the identity column above. */}
        <div className="mt-6 flex flex-col gap-3 sm:hidden">
          <SocialChips size="sm" tone="subtle" />
          <FooterEmail email="hello@nexgenconnect.com" />
        </div>

        {/* Bottom legal strip. Single line on mobile, two-up on md+. */}
        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-4 sm:mt-12 sm:pt-6 md:mt-14 md:flex-row md:items-center">
          <p className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
            &copy; {year} NexGen Connect &middot; Made in India
          </p>
          <p className="hidden font-mono text-[11px] text-[color:var(--color-fg-subtle)] sm:block">
            Ireland &middot; Sept 2026 &nbsp;|&nbsp; Germany &middot; Oct 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
