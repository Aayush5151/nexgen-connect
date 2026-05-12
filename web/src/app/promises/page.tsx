import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /promises — the signed commitments page.
 *
 * Five things we'll never do, written with the discipline of someone
 * who knows they'd be embarrassed to break them. The asymmetric-
 * vulnerability move (Wise on fees, Stripe on chargebacks, Patagonia
 * on repair-not-replace): trust earned by revealing what could damage
 * us, not by promising what couldn't.
 *
 * Treated as an institutional document. Dated. Signed by founder.
 * Reachable from the footer + the trust strip in pricing. Anyone
 * who reads it should walk away understanding what kind of company
 * this is.
 *
 * v18 category-presence pass.
 */

const LAST_UPDATED = "12 May 2026";

export const metadata: Metadata = {
  title: "Our promises",
  description:
    "Five things NexGen Connect will never do, signed by Aayush Shah. The asymmetric commitments that define how we build the verified arrival network.",
  alternates: { canonical: "/promises" },
  openGraph: {
    title: "Our promises · NexGen Connect",
    description:
      "Five signed commitments. Written with the vulnerability of someone who knows they'd be embarrassed to break them.",
    url: "/promises",
    type: "article",
  },
};

const PROMISES = [
  {
    n: "01",
    title: "We will never sell or share your Aadhaar data.",
    body:
      "The hash we store is one-way. It cannot be reversed into a number. Your real Aadhaar lives only at DigiLocker; we receive a token, not the digits. If we ever change this, it is a breach of the company, not a policy update.",
  },
  {
    n: "02",
    title: "Premium is once. Forever.",
    body:
      "We will never auto-renew, upsell to a recurring tier, or quietly convert your one-time purchase into a subscription. If a future version of NexGen ships a recurring product, every existing Premium user is grandfathered for life.",
  },
  {
    n: "03",
    title: "We will never let agents, brokers, or recruiters into a corridor.",
    body:
      "Corridors are for verified students. If we ever discover a paid actor inside one — recruiter, housing fixer, agent — we remove them, publish their identity, and refund every Premium user in that corridor.",
  },
  {
    n: "04",
    title:
      "If a verified user is harassed or scammed by another verified user in their corridor, we refund the year and pay their security deposit.",
    body:
      "Our verification stack is meant to prevent this from happening. If it ever does, we own the failure financially. This isn't a marketing promise — it's an underwriting commitment that limits how loose we can ever afford to be on verification.",
  },
  {
    n: "05",
    title: "If NexGen ever shuts down, you keep everything.",
    body:
      "Your data exports cleanly. Your corridor list, your verification proof, your messages — they come with you. We will publish the verification spec as open documentation and, if the company winds down, release the source code under a permissive license so the work survives us.",
  },
] as const;

export default function PromisesPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero — quiet, editorial */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                The promises
              </p>
              <h1 className="mt-6 display-xl text-[color:var(--color-fg)]">
                Five things we will{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  never do.
                </span>
              </h1>
              <p className="mt-7 body-lg text-[color:var(--color-fg-muted)]">
                These are written with the vulnerability of someone who
                knows they&apos;d be embarrassed to break them. They are not
                marketing copy. They are underwriting commitments — they
                limit the company we can become.
              </p>
            </div>
          </div>
        </section>

        {/* The list — ordered, generous whitespace */}
        <section className="mt-16 sm:mt-24">
          <div className="container-narrow">
            <ol className="mx-auto flex max-w-[760px] flex-col divide-y divide-[color:var(--color-border)]">
              {PROMISES.map((p) => (
                <li key={p.n} className="py-10 first:pt-0 last:pb-0 sm:py-14">
                  <div className="grid gap-5 sm:grid-cols-[80px_1fr] sm:gap-10">
                    <p
                      className="font-mono text-[14px] font-semibold tracking-[0.08em] text-[color:var(--color-primary)] sm:text-[16px]"
                      aria-hidden="true"
                    >
                      No.&nbsp;{p.n}
                    </p>
                    <div>
                      <h2 className="title-lg text-[color:var(--color-fg)] sm:title-xl">
                        {p.title}
                      </h2>
                      <p className="mt-4 body-lg text-[color:var(--color-fg-muted)]">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Signature block — the founder accountability */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px] border-t border-[color:var(--color-border)] pt-12 sm:pt-16">
              <p
                className="font-serif italic tracking-[-0.005em] text-[color:var(--color-fg)]"
                style={{ fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: 1.35 }}
              >
                &ldquo;If we ever get one of these wrong, my number is in your
                phone. I&rsquo;ll answer it.&rdquo;
              </p>
              <div className="mt-8 flex items-center justify-between gap-6">
                <div>
                  <p className="title-md text-[color:var(--color-fg)]">
                    Aayush Shah
                  </p>
                  <p className="mt-1 body-sm text-[color:var(--color-fg-muted)]">
                    Founder · NexGen Connect
                  </p>
                  <a
                    href="mailto:hello@nexgenconnect.com"
                    className="mt-2 inline-block font-mono text-[12px] text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
                  >
                    hello@nexgenconnect.com
                  </a>
                </div>
                <p className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                  Last updated
                  <br />
                  {LAST_UPDATED}
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Join the verified corridor
                </Link>
                <Link
                  href="/founder"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  About the founder
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
