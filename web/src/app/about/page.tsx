import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /about — the institutional about page.
 *
 * The canonical narrative surface. Every category-defining company
 * has one: Stripe's about page is the "internet financial
 * infrastructure" sentence + the founder portrait; Patagonia's is
 * the environmental commitment; Linear's is "the issue tracking
 * tool the world needs."
 *
 * NexGen Connect's: "Two million Indian students will move abroad
 * this decade..." The page that holds the narrative the founder
 * controls. Repeat-able across press releases, investor decks,
 * employee onboarding (eventually), the cohort yearbooks.
 *
 * Structure:
 *   1. The narrative paragraph — large, declarative, the one we
 *      repeat for ten years.
 *   2. The four supporting institutional documents linked.
 *   3. The category in one sentence (the press-quote version).
 *   4. Founder + reachable line.
 *
 * v18 category-presence pass · Section 7 of the strategy doc.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "Why NexGen Connect exists, what we are building, and who we are accountable to. The verified arrival corridor for Indian students moving abroad.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · NexGen Connect",
    description:
      "Why NexGen Connect exists. The verified arrival corridor for Indian students moving abroad.",
    url: "/about",
    type: "website",
  },
};

const SUPPORTING_DOCS = [
  {
    href: "/promises",
    eyebrow: "The promises",
    title: "Five things we will never do.",
    desc: "Signed commitments — written with the discipline of someone who knows they'd be embarrassed to break them.",
  },
  {
    href: "/stories/founding",
    eyebrow: "Founder letter № 01",
    title: "Why we built the corridor.",
    desc: "A personal letter from Aayush, on the founding day. The origin story and the personal commitments.",
  },
  {
    href: "/cohorts",
    eyebrow: "The yearbook",
    title: "Every corridor, on the record.",
    desc: "The public registry of every NexGen corridor — past, present, filling. The most permanent surface we produce.",
  },
  {
    href: "/incidents",
    eyebrow: "Incidents",
    title: "What happened, and what we did about it.",
    desc: "Public log of scam attempts blocked, system outages, and T&S incidents. Empty by design until events occur — the posture matters.",
  },
  {
    href: "/founder",
    eyebrow: "The founder",
    title: "Aayush Shah.",
    desc: "Who built the company, where, and why a single founder still answers every email.",
  },
  {
    href: "/research",
    eyebrow: "Research",
    title: "What we know about the corridor.",
    desc: "The data behind the mechanic — corridor density, verification rates, scam reports. Open methodology, free to cite.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero — the narrative paragraph in editorial type.
            This is the single most-quoted sentence the company will
            produce. Treated like the masthead of a journal: large,
            italic accent, no chrome competing with the words. */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                About
              </p>

              {/* The narrative paragraph. Set in heading face for weight;
                  individual sentences carry the rhythm. The italic
                  accent lands on the category claim. */}
              <p
                className="mt-8 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(28px, 4.6vw + 0.5rem, 48px)",
                  lineHeight: 1.18,
                  letterSpacing: "-0.022em",
                }}
              >
                Two million Indian students will move abroad this decade.
                Almost all of them will start by being scammed, ignored, or
                alone.
              </p>

              <p
                className="mt-7 font-serif italic text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(24px, 3.6vw + 0.5rem, 38px)",
                  lineHeight: 1.28,
                  letterSpacing: "-0.015em",
                }}
              >
                We built the verified arrival corridor so they walk into
                people they already know.
              </p>

              <p className="mt-7 body-lg text-[color:var(--color-fg-muted)]">
                Not a community. Not an app. The trust infrastructure of
                arrival.
              </p>
            </div>
          </div>
        </section>

        {/* The category in one sentence — the press-quote version,
            offset as a callout so it's easy to copy. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] border-y border-[color:var(--color-border)] py-10 sm:py-14">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                For journalists · the one-sentence version
              </p>
              <blockquote
                className="mt-5 font-serif italic text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(22px, 3vw, 30px)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.012em",
                }}
              >
                &ldquo;NexGen Connect builds{" "}
                <span className="not-italic font-sans font-semibold tracking-[-0.012em] text-[color:var(--color-primary)]">
                  verified arrival corridors
                </span>{" "}
                — the trust infrastructure for the largest cross-border
                student migration in human history.&rdquo;
              </blockquote>
              <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                Free to quote · attribute · paraphrase
              </p>
            </div>
          </div>
        </section>

        {/* The four supporting institutional documents. The about page
            is the front door; these four are the rooms. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Read further
              </p>
              <p className="mt-3 body-md text-[color:var(--color-fg-muted)]">
                The four documents that say what kind of company this is.
              </p>

              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {SUPPORTING_DOCS.map((doc) => (
                  <li key={doc.href}>
                    <Link
                      href={doc.href}
                      className="card-interactive group block h-full p-6"
                    >
                      <p className="label-eyebrow text-[color:var(--color-primary)]">
                        {doc.eyebrow}
                      </p>
                      <h2 className="mt-4 title-md text-[color:var(--color-fg)] transition-colors group-hover:text-[color:var(--color-primary)]">
                        {doc.title}
                      </h2>
                      <p className="mt-3 body-sm text-[color:var(--color-fg-muted)]">
                        {doc.desc}
                      </p>
                      <p className="mt-5 inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] transition-colors group-hover:text-[color:var(--color-primary)]">
                        Read
                        <span aria-hidden="true">→</span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing — founder signature + the reachable line. The
            commitment that one named person stands behind this
            document, this company, and this category. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] border-t border-[color:var(--color-border)] pt-12">
              <p className="font-serif italic text-[18px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[20px]">
                One person built this. He still answers every email.
              </p>
              <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="title-md text-[color:var(--color-fg)]">
                  Aayush Shah
                </p>
                <p className="body-sm text-[color:var(--color-fg-muted)]">
                  Founder · Mumbai
                </p>
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="font-mono text-[12px] text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
                >
                  hello@nexgenconnect.com
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Join the corridor
                </Link>
                <Link
                  href="/press"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  Press room
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
