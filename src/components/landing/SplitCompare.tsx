import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * SplitCompare. Compact diptych that sits in the reader's viewport
 * without scroll. Previous two full-height phone mockups doubled the
 * page length; this replaces them with one unified card that still
 * reads as "chaos vs calm" at a glance.
 */

const NOISE = [
  { from: "FOREX", text: "96.5 INR/EUR DM for rate" },
  { from: "+91 UNKNOWN", text: "Hi anyone from Indore??" },
  { from: "AGENTPRO", text: "FREE visa consultation" },
  { from: "RENT", text: "Studio €1400 from 1 Sept" },
];

const VERIFIED = [
  { initials: "RM", city: "Mumbai" },
  { initials: "KS", city: "Bangalore" },
  { initials: "AP", city: "Pune" },
  { initials: "MD", city: "Delhi" },
  { initials: "PV", city: "Hyderabad" },
  { initials: "IR", city: "Chennai" },
  { initials: "SK", city: "Mumbai" },
  { initials: "RG", city: "Pune" },
  { initials: "NL", city: "Delhi" },
  { initials: "AD", city: "Mumbai" },
];

export function SplitCompare() {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">The switch</SectionLabel>
          <h2
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Same flight.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              Different phone.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]">
            One group is 487 strangers, agents, forex spam. The other is ten
            verified classmates from your city.
          </p>
        </div>

        {/* One diptych card. Chaos on the left, calm on the right. Same
            vertical rhythm on both sides so the eye contrasts them 1:1. */}
        <div className="mx-auto mt-8 max-w-[960px] sm:mt-10">
          <div className="relative grid grid-cols-1 overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-sm)] sm:rounded-[16px] md:grid-cols-[1fr_auto_1fr]">
            {/* Left: chaos */}
            <div className="relative p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  Without NexGen
                </p>
                <span className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                  487 members
                </span>
              </div>
              <p className="mt-4 font-heading text-[15px] font-semibold text-[color:var(--color-fg-muted)]">
                India → Ireland Sept 2026
              </p>

              <ul className="mt-4 space-y-1.5">
                {NOISE.map((m, i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-2 rounded-md bg-[color:var(--color-bg)] px-2.5 py-1.5"
                  >
                    <span className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-fg-subtle)]">
                      {m.from}
                    </span>
                    <span className="truncate text-[12px] text-[color:var(--color-fg-muted)]">
                      {m.text}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                482 unread &middot; nobody from your city
              </p>
            </div>

            {/* Divider + arrow. Horizontal on mobile, vertical on desktop. */}
            <div
              aria-hidden="true"
              className="relative flex items-center justify-center bg-[color:var(--color-bg)] md:w-14"
            >
              <span className="h-px w-full bg-[color:var(--color-border)] md:h-full md:w-px" />
              <span className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-surface)] text-[color:var(--color-primary)]">
                <ArrowRight
                  className="h-4 w-4 rotate-90 md:rotate-0"
                  strokeWidth={2}
                />
              </span>
            </div>

            {/* Right: calm */}
            <div className="relative bg-[color:color-mix(in_srgb,var(--color-primary)_4%,var(--color-surface))] p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                  With NexGen
                </p>
                <span className="rounded-full border border-[color:var(--color-primary)]/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                  10 verified
                </span>
              </div>
              <p className="mt-4 font-heading text-[14px] font-semibold text-[color:var(--color-fg)] sm:text-[15px]">
                Mumbai → UCD &middot; Sept 2026
              </p>

              <ul className="mt-4 grid grid-cols-5 gap-1 sm:gap-1.5">
                {VERIFIED.map((a) => (
                  <li
                    key={`${a.initials}-${a.city}`}
                    className="flex min-w-0 flex-col items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1 sm:p-1.5"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] font-heading text-[9px] font-semibold text-[color:var(--color-primary)] sm:h-7 sm:w-7 sm:text-[10px]">
                      {a.initials}
                    </span>
                    <span className="mt-1 w-full truncate text-center text-[8px] font-medium text-[color:var(--color-fg-muted)]">
                      {a.city}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                All ten from your city &middot; DigiLocker verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
