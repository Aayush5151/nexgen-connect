import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /stories — the editorial property.
 *
 * Even with zero stories shipped, the page existing signals posture:
 * NexGen is also a publishing house. Stripe Press, Substack pre-launch,
 * Patagonia's Journal are the references. By year 2, this page hosts
 * long-form essays from verified members + the annual Migration Report
 * + founder letters.
 *
 * For now the page reads as a *quiet promise* — editorial typography,
 * generous whitespace, the kind of "coming soon" that signals taste
 * rather than backlog. A real essay drop in Q4 2026 fills the table
 * of contents.
 *
 * v18 category-presence pass · Mechanism 7 (narrative compounding).
 */

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Long-form essays from the NexGen verified corridors — what students wish they'd known before landing, founder letters, and the annual Migration Report.",
  alternates: {
    canonical: "/stories",
    // Standard RSS auto-discovery — feed readers and aggregators
    // pick this up automatically when they visit /stories. The
    // editorial-property posture made discoverable.
    types: {
      "application/rss+xml": "/stories/rss.xml",
    },
  },
  openGraph: {
    title: "Stories · NexGen Connect",
    description:
      "Long-form essays from the verified corridors, founder letters, and the annual Migration Report.",
    url: "/stories",
    type: "website",
  },
};

// Live pieces — appear above the forthcoming index. As the publishing
// house ships, items move from FORTHCOMING into LIVE_PIECES.
const LIVE_PIECES = [
  {
    n: "01",
    title: "Why we built the corridor.",
    desc: "Letter № 01 — a personal note from Aayush on the founding day. Why the verification stack matters, what we will never do, who is in the founding class.",
    href: "/stories/founding",
    date: "12 May 2026",
    kind: "Founder letter",
  },
] as const;

const FORTHCOMING = [
  {
    n: "II",
    section: "Corridor Stories",
    desc: "Long-form essays from verified members. What it actually felt like to land. What the orientation week didn't tell them.",
    first: "First story · Q4 2026",
  },
  {
    n: "III",
    section: "The Migration Report",
    desc: "Annual. Real data from the verified corpus: which corridors moved, where students settled, what they paid, what they wish they'd known.",
    first: "First edition · January 2027",
  },
] as const;

export default function StoriesPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero — editorial masthead, not a marketing pitch. */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Stories · the editorial property
              </p>
              <h1 className="mt-6 display-xl text-[color:var(--color-fg)]">
                The corridor,{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  in long form.
                </span>
              </h1>
              <p className="mt-7 body-lg text-[color:var(--color-fg-muted)]">
                Three years from now, this page will hold the most accurate
                record of Indian student migration that exists anywhere —
                because every member is verified, every destination is real,
                every story is first-person. The first letter is up. The
                index below tells you what&apos;s next.
              </p>
            </div>
          </div>
        </section>

        {/* Live pieces — published essays. Editorial card layout, dated. */}
        <section className="mt-16 sm:mt-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-[760px]">
              <p className="label-eyebrow text-[color:var(--color-primary)]">
                Now publishing
              </p>

              <ol className="mt-8 flex flex-col gap-4">
                {LIVE_PIECES.map((p) => (
                  <li key={p.n}>
                    <Link
                      href={p.href}
                      className="card-interactive group block p-6 sm:p-7"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                          {p.kind} · No. {p.n}
                        </p>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                          {p.date}
                        </p>
                      </div>
                      <h2 className="mt-4 title-xl text-[color:var(--color-fg)] transition-colors group-hover:text-[color:var(--color-primary)]">
                        {p.title}
                      </h2>
                      <p className="mt-3 body-md text-[color:var(--color-fg-muted)]">
                        {p.desc}
                      </p>
                      <p className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                        Read the letter
                        <span aria-hidden="true">→</span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Forthcoming — table of contents for things that don't exist yet,
            laid out like the index of a literary quarterly. The act of
            publishing the index in advance is the editorial commitment. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[760px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Forthcoming
              </p>

              <ol className="mt-8 flex flex-col divide-y divide-[color:var(--color-border)]">
                {FORTHCOMING.map((f) => (
                  <li key={f.n} className="py-8 first:pt-0 sm:py-10">
                    <div className="grid gap-4 sm:grid-cols-[80px_1fr] sm:gap-10">
                      <p
                        className="font-serif italic text-[28px] leading-none tracking-[-0.01em] text-[color:var(--color-fg-subtle)] sm:text-[36px]"
                        aria-hidden="true"
                      >
                        {f.n}.
                      </p>
                      <div>
                        <h2 className="title-lg text-[color:var(--color-fg)]">
                          {f.section}
                        </h2>
                        <p className="mt-3 body-md text-[color:var(--color-fg-muted)]">
                          {f.desc}
                        </p>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                          {f.first}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Footer note — sets editorial tone explicitly. Patagonia's
            Journal, Stripe Press, Cabin Magazine reference. */}
        <section className="mt-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px] border-t border-[color:var(--color-border)] pt-12">
              <p className="font-serif italic text-[16px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[17px]">
                Stories are published quarterly, written by verified
                members, lightly edited, never sponsored. If you want
                notifications when the next piece lands, the corridor
                email list carries it — or follow the RSS feed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Join the corridor
                </Link>
                <a
                  href="/stories/rss.xml"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-[color:var(--color-border)] px-5 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  RSS feed
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
