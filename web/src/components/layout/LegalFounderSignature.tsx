/**
 * LegalFounderSignature — the signed footer line for legal pages.
 *
 * Stripe Atlas pattern: a personally-named human stands behind the
 * legal copy. Converts corporate hedge-language into personal
 * commitment. Drops into the bottom of /privacy, /terms, /legal.
 *
 * Single source of truth for the date — update LAST_REVIEWED here
 * and every legal page reflects the new review date.
 *
 * v18 category-presence pass · Mechanism 2 (founder presence).
 */

const LAST_REVIEWED = "12 May 2026";

export function LegalFounderSignature() {
  return (
    <div className="mt-16 border-t border-[color:var(--color-border)] pt-10">
      <p className="font-serif italic text-[16px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[17px]">
        This document was last reviewed by Aayush Shah on {LAST_REVIEWED}.
        If anything reads as misleading or wrong, write to{" "}
        <a
          href="mailto:hello@nexgenconnect.com"
          className="text-[color:var(--color-fg)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-primary)]"
        >
          hello@nexgenconnect.com
        </a>
        . I&apos;ll read it.
      </p>
      <p className="mt-4 title-sm text-[color:var(--color-fg)]">
        Aayush Shah
      </p>
      <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
        Founder · NexGen Connect
      </p>
    </div>
  );
}
