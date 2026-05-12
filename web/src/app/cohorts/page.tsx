import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COHORTS } from "@/lib/cohorts";

/**
 * /cohorts — the public yearbook index.
 *
 * Every NexGen corridor is listed here, sorted by intake. Filling
 * corridors show the live verified count + meter. Unlocked corridors
 * (post-60) become permanent yearbook entries with their founding-class
 * roster.
 *
 * This is the most permanent surface NexGen produces. Every corridor
 * that ever forms gets a row here, forever. A student verified in
 * UCD Sept '26 can come back in 2031 and find their corridor still on
 * this page, with their name in it (if they consented).
 *
 * v18 category-presence pass · Mechanism 3 (cohort-naming compounding).
 */

export const metadata: Metadata = {
  title: "Cohorts",
  description:
    "The public yearbook of every NexGen corridor — Indian student arrival corridors organised by destination and intake. Filling corridors show live verification progress.",
  alternates: { canonical: "/cohorts" },
  openGraph: {
    title: "Cohorts · NexGen Connect",
    description:
      "The public yearbook of every NexGen verified arrival corridor.",
    url: "/cohorts",
    type: "website",
  },
};

export default function CohortsIndexPage() {
  // Group cohorts by country for the visual rhythm.
  const byCountry = COHORTS.reduce<Record<string, typeof COHORTS>>(
    (acc, c) => {
      (acc[c.country] ||= [] as never).push(c);
      return acc;
    },
    {},
  );

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Cohorts · the public yearbook
              </p>
              <h1 className="mt-6 display-xl text-[color:var(--color-fg)]">
                Every corridor,{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  on the record.
                </span>
              </h1>
              <p className="mt-7 body-lg text-[color:var(--color-fg-muted)]">
                Each row is a verified arrival corridor — a home country,
                a destination city, a university, an intake month. Once a
                corridor crosses sixty verified members, group chat
                unlocks and the founding-class roster becomes permanent.
                You can come back ten years from now and find your
                corridor here.
              </p>
            </div>
          </div>
        </section>

        {/* Listings by country. Mono-uppercase country header, then
            a stack of corridor cards. Each card is a Link to the
            /cohorts/[slug] detail page. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] space-y-16">
              {Object.entries(byCountry).map(([country, cohorts]) => (
                <div key={country}>
                  <p className="label-eyebrow text-[color:var(--color-primary)]">
                    {country} · {cohorts[0]!.intakeLabel}
                  </p>
                  <ul className="mt-8 space-y-3">
                    {cohorts.map((c) => {
                      const pct = Math.min(
                        100,
                        Math.round((c.verifiedCount / c.threshold) * 100),
                      );
                      const unlocked = c.status === "unlocked";
                      return (
                        <li key={c.slug}>
                          <Link
                            href={`/cohorts/${c.slug}`}
                            className="card-interactive group block p-6"
                          >
                            <div className="flex items-baseline justify-between gap-4">
                              <div>
                                <h2 className="title-md text-[color:var(--color-fg)] transition-colors group-hover:text-[color:var(--color-primary)]">
                                  {c.uniFull} · {c.destination}
                                </h2>
                                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                                  {c.intakeLabel} ·{" "}
                                  {unlocked ? "unlocked" : "filling"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-heading text-[20px] font-semibold tabular-nums tracking-[-0.015em] text-[color:var(--color-fg)]">
                                  {c.verifiedCount}
                                  <span className="ml-1 body-sm text-[color:var(--color-fg-muted)]">
                                    /{c.threshold}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Meter */}
                            <div
                              className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--color-border)]"
                              role="progressbar"
                              aria-valuenow={c.verifiedCount}
                              aria-valuemin={0}
                              aria-valuemax={c.threshold}
                            >
                              <div
                                className="h-full rounded-full bg-[color:var(--color-primary)] transition-[width] duration-[700ms] ease-out"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer note. The yearbook framing makes the page
            recognisable as a permanent record, not a marketing list. */}
        <section className="mt-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] border-t border-[color:var(--color-border)] pt-12">
              <p className="font-serif italic text-[16px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[17px]">
                Every member of a corridor can request to appear on
                their cohort page, or remain anonymous. The default is
                anonymous; consent to be named is opt-in, never automatic.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Join a corridor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
