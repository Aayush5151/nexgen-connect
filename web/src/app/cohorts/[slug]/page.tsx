import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COHORTS, getCohortBySlug } from "@/lib/cohorts";

/**
 * /cohorts/[slug] — per-corridor yearbook detail page.
 *
 * Three states the page can be in:
 *
 *   FILLING (verifiedCount < threshold)
 *     - Hero shows the corridor identity + filling meter
 *     - "The First Sixty" section appears with placeholder slots
 *       ("Reserved · awaiting verification")
 *     - CTA: join this corridor
 *
 *   UNLOCKED (verifiedCount >= threshold)
 *     - Hero shows "Unlocked on [date]" + The First Sixty roster
 *     - The roster is the permanent record
 *
 *   ANNIVERSARY (post-unlock, with consented members)
 *     - "Where they are now" section appears
 *
 * v18 category-presence pass · Mechanism 3 (cohort-naming) +
 * Mechanism 5 (ritual compounding).
 */

// Next.js 16 dynamic params — async. (Required by next/cache-components
// when params are Promise-typed.)
export async function generateStaticParams() {
  return COHORTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) {
    return { title: "Cohort not found" };
  }
  return {
    title: `${cohort.uniFull} · ${cohort.intakeLabel}`,
    description: `The verified ${cohort.uni} ${cohort.intakeLabel} corridor — currently ${cohort.verifiedCount} of ${cohort.threshold} verified. ${cohort.country}.`,
    alternates: { canonical: `/cohorts/${cohort.slug}` },
    openGraph: {
      title: `${cohort.uniFull} · ${cohort.intakeLabel} · NexGen Connect`,
      description: `The verified ${cohort.uni} ${cohort.intakeLabel} corridor.`,
      url: `/cohorts/${cohort.slug}`,
      type: "website",
    },
  };
}

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const pct = Math.min(
    100,
    Math.round((cohort.verifiedCount / cohort.threshold) * 100),
  );
  const remaining = Math.max(0, cohort.threshold - cohort.verifiedCount);
  const unlocked = cohort.status === "unlocked";

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero — corridor identity in editorial mode */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                <Link
                  href="/cohorts"
                  className="transition-colors hover:text-[color:var(--color-fg)]"
                >
                  ← All cohorts
                </Link>
              </p>

              <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                {cohort.country} · {cohort.destination} ·{" "}
                {cohort.intakeLabel}
              </p>

              <h1 className="mt-5 display-xl text-[color:var(--color-fg)]">
                {cohort.uniFull},{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  {cohort.intakeLabel.toLowerCase()}.
                </span>
              </h1>

              {/* Status + count + meter */}
              <div className="mt-10 flex items-baseline gap-3">
                <span className="font-heading text-[44px] font-semibold tabular-nums tracking-[-0.025em] text-[color:var(--color-fg)] sm:text-[56px]">
                  {cohort.verifiedCount}
                </span>
                <span className="body-md text-[color:var(--color-fg-muted)]">
                  of {cohort.threshold} verified
                </span>
              </div>

              <div
                className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--color-border)]"
                role="progressbar"
                aria-valuenow={cohort.verifiedCount}
                aria-valuemin={0}
                aria-valuemax={cohort.threshold}
              >
                <div
                  className="h-full rounded-full bg-[color:var(--color-primary)] transition-[width] duration-[700ms] ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="mt-4 body-md text-[color:var(--color-fg-muted)]">
                {unlocked ? (
                  <>
                    This corridor is unlocked. Group chat is live; the
                    founding-class roster is permanent.
                  </>
                ) : (
                  <>
                    Filling now. <strong>{remaining}</strong> more
                    verified students unlock group chat.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* The First Sixty — the founding-class roster. Pre-unlock:
            placeholder slots that say "Reserved · awaiting verification."
            Post-unlock: the consented names. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                The First Sixty · the founding class
              </p>
              <p className="mt-3 body-md text-[color:var(--color-fg-muted)]">
                {unlocked
                  ? "The members below consented to be named on this page. Standing in this corridor is permanent."
                  : "Every member of this corridor who verifies before the threshold becomes one of the First Sixty. Standing is permanent; appearance on this page is opt-in."}
              </p>

              {/* Roster grid — pre-launch: empty/redacted; post-launch:
                  fills with consented members. The grid is sized to
                  60 slots regardless, so the page shape is stable
                  through the corridor's lifecycle. */}
              <ul className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-6">
                {Array.from({ length: 60 }).map((_, i) => {
                  const consented = cohort.foundingClassConsented[i];
                  const filled = i < cohort.verifiedCount;
                  return (
                    <li key={i}>
                      <div
                        className={
                          "flex aspect-square flex-col items-center justify-center rounded-[10px] p-1.5 text-center transition-colors " +
                          (consented
                            ? "border border-[color:var(--color-primary)]/45 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                            : filled
                              ? "border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]"
                              : "border border-dashed border-[color:var(--color-border)]")
                        }
                      >
                        {consented ? (
                          <>
                            <p className="title-sm text-[color:var(--color-primary)]">
                              {consented.firstName}
                            </p>
                            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                              {consented.homeCity}
                            </p>
                          </>
                        ) : filled ? (
                          <>
                            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]">
                              Verified
                            </p>
                            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                              # {i + 1}
                            </p>
                          </>
                        ) : (
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                            Reserved
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                {cohort.foundingClassConsented.length} of{" "}
                {cohort.verifiedCount} verified members have consented to
                be named. Consent is requested once, never automatic.
              </p>
            </div>
          </div>
        </section>

        {/* CTA — join this corridor */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] border-t border-[color:var(--color-border)] pt-12">
              <p className="font-serif italic text-[18px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[20px]">
                {unlocked
                  ? "This corridor is closed to new members; the roster is the roster."
                  : `If you are heading to ${cohort.uniFull} in ${cohort.intakeLabel}, this is your corridor.`}
              </p>
              {!unlocked && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                  >
                    Verify into this corridor
                  </Link>
                  <Link
                    href="/promises"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                  >
                    Read the promises
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
