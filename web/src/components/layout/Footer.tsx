import Link from "next/link";
import { SocialChips } from "@/components/ui/SocialChips";
import { FooterEmail } from "@/components/layout/FooterEmail";

/**
 * Footer — quiet closing bar.
 *
 * v18 trillion-dollar simplification. The previous footer ran four
 * different rhythms (identity pitch + email pill + socials + 3 link
 * columns + 2-line legal strip). It read as a wall of small sections
 * rather than a footer. Apple/Stripe footers work because they have
 * one rhythm: a single dense column of links, tight type, generous
 * whitespace.
 *
 * This rewrite:
 *   - Quieter editorial top: wordmark + one-line pitch + a closing
 *     italic line ("You don't land alone.") as the emotional bookend.
 *   - Three link columns sit on the right, kickers in the same muted
 *     tone as everything else (no more two primary-tinted Ireland /
 *     Germany kickers competing with everything above).
 *   - Socials + email move into a single thin row above the legal
 *     strip — no more identity-column-bottom + mobile-row variants.
 *   - Legal strip stays single-line on mobile, two-up on md+.
 *
 * Result: half the visual density, all the navigation.
 */

const NAVIGATE_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/promises", label: "Our promises" },
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
    <footer className="mt-auto border-t border-[color:var(--color-border)] pt-12 pb-8 sm:pt-20 sm:pb-12">
      <div className="container-narrow">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* IDENTITY — wordmark + one-line pitch + closing italic. */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-heading text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)] transition-opacity hover:opacity-90"
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
            <p className="mt-5 max-w-[360px] body-md text-[color:var(--color-fg-muted)]">
              Find your verified group before you fly abroad.
            </p>
            <p className="mt-3 max-w-[360px] font-serif italic text-[15px] leading-[1.5] tracking-[-0.005em] text-[color:var(--color-fg-subtle)]">
              You don&apos;t land alone.
            </p>
          </div>

          {/* LINK COLUMNS — three siblings, identical rhythm. */}
          <div className="grid grid-cols-3 gap-x-6 md:col-span-7 md:gap-x-8">
            <FooterColumn label="Navigate" links={NAVIGATE_LINKS} />
            <FooterColumn label="Ireland" links={IRELAND_CAMPUSES} />
            <FooterColumn label="Germany" links={GERMANY_CAMPUSES} />
          </div>
        </div>

        {/* CONTACT STRIP — socials + email, one thin row. */}
        <div className="mt-12 flex flex-col items-start gap-4 border-t border-[color:var(--color-border)] pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <SocialChips size="sm" tone="subtle" />
          <FooterEmail email="hello@nexgenconnect.com" />
        </div>

        {/* PROVENANCE LINE — the Apple "Designed in California by..."
            move, but ours. Names the founder + the city, signals that
            a real person stands behind the work. Sits above the legal
            strip because it's a *trust* signal, not a *legal* one. */}
        <p className="mt-6 border-t border-[color:var(--color-border)] pt-6 font-serif italic text-[14px] leading-[1.5] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[15px]">
          Designed in Mumbai by{" "}
          <Link
            href="/founder"
            className="text-[color:var(--color-fg)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-primary)]"
          >
            Aayush Shah
          </Link>
          . Reachable at{" "}
          <a
            href="mailto:hello@nexgenconnect.com"
            className="text-[color:var(--color-fg)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-primary)]"
          >
            hello@nexgenconnect.com
          </a>
          .
        </p>

        {/* LEGAL STRIP. */}
        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-4 md:flex-row md:items-center">
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

function FooterColumn({
  label,
  links,
}: {
  label: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <nav aria-label={`${label} navigation`}>
      <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
        {label}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
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
  );
}
