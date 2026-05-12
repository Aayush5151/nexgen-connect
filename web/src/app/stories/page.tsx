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
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Stories · NexGen Connect",
    description:
      "Long-form essays from the verified corridors, founder letters, and the annual Migration Report.",
    url: "/stories",
    type: "website",
  },
};

const FORTHCOMING = [
  {
    n: "I",
    section: "The Founder Letters",
    desc: "Quarterly. Aayush on what the company learned this quarter, what worked, what didn't, what's next.",
    first: "First letter · Q3 2026",
  },
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
                every story is first-person. We&apos;re publishing the first
                pieces in Q3 2026.
              </p>
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
                Stories will be published quarterly, written by verified
                members, lightly edited, never sponsored. If you want to be
                notified when the first piece lands, the corridor email list
                carries it.
              </p>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Join the corridor
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
