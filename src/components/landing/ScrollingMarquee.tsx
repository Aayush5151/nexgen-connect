"use client";

/**
 * ScrollingMarquee. A thin horizontal strip of keywords and coordinates
 * that drifts slowly left. Pure presentation - gives the long-scroll
 * page an ambient "still breathing" feel between heavier sections.
 *
 * Two identical tracks side-by-side animated in tandem so the loop is
 * seamless; CSS-only (translate at 40s linear infinite), prefers-
 * reduced-motion disables it.
 */

const KEYWORDS = [
  "Verified",
  "53.35°N · 6.26°W",
  "Aadhaar · PAN · DL · Passport",
  "Ten per corridor",
  "Dublin · September 2026",
  "Your city → your campus",
  "No agents · no forex spam",
  "DigiLocker",
  "Group closes when full",
  "Instagram only on mutual verify",
  "Fly into a group",
  "Phase 01 · Ireland",
];

export function ScrollingMarquee() {
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-4"
    >
      {/* Edge fade masks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[color:var(--color-surface)] to-transparent sm:w-24"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[color:var(--color-surface)] to-transparent sm:w-24"
      />

      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap will-change-transform sm:gap-14">
        {/* Two copies back-to-back so the loop is seamless */}
        {[0, 1].map((loop) => (
          <ul
            key={loop}
            className="flex items-center gap-10 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:gap-14"
          >
            {KEYWORDS.map((k, i) => (
              <li key={`${loop}-${i}`} className="flex items-center gap-10 sm:gap-14">
                <span className={i % 3 === 0 ? "text-[color:var(--color-primary)]" : ""}>
                  {k}
                </span>
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-border-strong)]"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee 55s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            /* Move exactly one full copy width left */
            transform: translate3d(-50%, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
