import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /stories/founding — the first founder letter.
 *
 * This is the piece that turns /stories from "we will publish" into
 * "we have published." Patrick Collison's letters from Stripe, Yvon
 * Chouinard's letters from Patagonia, and the Substack founder posts
 * are the references. Long-form. Signed. Dated. No marketing voice.
 *
 * The letter does four things:
 *   1. Names the category (verified arrival corridor).
 *   2. Tells the personal origin story (friends scammed at the airport).
 *   3. States the underwriting commitments (the three checks, the
 *      personal calls, the promises page).
 *   4. Says what's next.
 *
 * Treated as the canonical narrative artifact. If a journalist quotes
 * one piece of writing about NexGen, this is the one we want them to
 * quote.
 *
 * v18 category-presence pass · Mechanism 7 (narrative compounding).
 */

const PUBLISHED = "12 May 2026";

export const metadata: Metadata = {
  title: "Founding letter · Aayush Shah",
  description:
    "Why we built the verified arrival corridor. A personal letter from Aayush Shah, founder of NexGen Connect, on the first day of publishing.",
  alternates: { canonical: "/stories/founding" },
  openGraph: {
    title: "Founding letter · NexGen Connect",
    description:
      "Why we built the verified arrival corridor. A personal letter from Aayush Shah, founder of NexGen Connect.",
    url: "/stories/founding",
    type: "article",
    publishedTime: "2026-05-12",
    authors: ["Aayush Shah"],
  },
};

/**
 * Article JSON-LD — schema.org structured data for the founder letter.
 * Lets Google show this as a rich article in search results, lets
 * news aggregators (Apple News, Flipboard) treat it as a real
 * article, and gives the canonical author + publisher metadata that
 * any social platform looking deeper than og: tags will pick up.
 *
 * Schema fields per https://schema.org/Article. dateModified equals
 * datePublished because letters are never quietly revised — if we
 * change a published letter, we ship a public correction note and
 * bump dateModified explicitly.
 */
const ARTICLE_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why we built the corridor.",
  description:
    "A personal letter from Aayush Shah, founder of NexGen Connect, on the founding day. Why the verification stack matters, what we will never do, who is in the founding class.",
  author: {
    "@type": "Person",
    name: "Aayush Shah",
    jobTitle: "Founder",
    worksFor: { "@type": "Organization", name: "NexGen Connect" },
    email: "hello@nexgenconnect.com",
  },
  publisher: {
    "@type": "Organization",
    name: "NexGen Connect",
    logo: {
      "@type": "ImageObject",
      url: "https://nexgen-connect.vercel.app/badge.svg",
    },
  },
  datePublished: "2026-05-12",
  dateModified: "2026-05-12",
  inLanguage: "en",
  isAccessibleForFree: true,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://nexgen-connect.vercel.app/stories/founding",
  },
  articleSection: "Founder letters",
  keywords:
    "NexGen Connect, verified arrival corridor, Indian student migration, founder letter, Aayush Shah",
};

export default function FoundingLetterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Article schema — see ARTICLE_LD above. Inline to keep this
        // page server-rendered and crawler-visible without a separate
        // request. Trusted source (no user input) so dangerouslySet is
        // safe here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_LD) }}
      />
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Masthead */}
        <article className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px]">
              {/* Breadcrumb back to Stories */}
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                <Link
                  href="/stories"
                  className="transition-colors hover:text-[color:var(--color-fg)]"
                >
                  ← Stories
                </Link>
              </p>

              {/* Issue / number / date — feels like a journal masthead */}
              <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                Letter № 01 · Founder · {PUBLISHED}
              </p>

              <h1 className="mt-6 display-xl text-[color:var(--color-fg)]">
                Why we built{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  the corridor.
                </span>
              </h1>

              <p className="mt-7 font-serif italic text-[20px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[22px]">
                A letter from Aayush, on the first day of publishing.
              </p>
            </div>
          </div>

          {/* Body. Long-form, editorial. Drop caps optional but skipping
              them — they read as design-school rather than journal. */}
          <div className="mt-16 sm:mt-20">
            <div className="container-narrow">
              <div className="mx-auto max-w-[680px]">
                <div className="space-y-7 text-[17px] leading-[1.7] tracking-[-0.002em] text-[color:var(--color-fg)] sm:text-[18px] sm:leading-[1.72]">
                  <p>
                    Three friends from my degree got scammed at the airport
                    on the way to Ireland. Different scams. One bought a
                    SIM card from a man in a Dublin Airport bathroom for
                    €40 and got a card that worked for nine days. One paid
                    a deposit on a room she never saw and never found the
                    person who took her €600. One handed his passport to a
                    self-styled &ldquo;migration helper&rdquo; outside Terminal 1 and
                    spent the first 36 hours of his life in Europe at the
                    Garda station.
                  </p>

                  <p>
                    All three things happened in 2024. All three things
                    were predictable. All three people had been in
                    WhatsApp groups of 400 strangers for months — groups
                    where, on paper, they had a community. In practice
                    they had a feed of forwarded messages, half of which
                    were trying to take their money.
                  </p>

                  <p>
                    There is a name for what these three did not have on
                    the day they landed: <em>verified arrival</em>.
                    Verified, in the sense that the people around them
                    had passed through the same checks. Arrival, in the
                    sense that the community wasn&apos;t a queue or a
                    feed — it was a small, known group of people who had
                    flown in for the same reason, in the same week, from
                    the same kind of life.
                  </p>

                  <p>
                    NexGen Connect is the company we built so that
                    everyone after them doesn&apos;t walk through that
                    door alone.
                  </p>

                  <h2 className="!mt-12 font-heading text-[24px] font-semibold tracking-[-0.018em] text-[color:var(--color-fg)] sm:text-[28px]">
                    The mechanic, plainly.
                  </h2>

                  <p>
                    A <strong>corridor</strong> is the unit of our product.
                    A corridor is the intersection of three facts: your
                    home city in India, your destination city abroad, and
                    your intake month. <em>Pune → Dublin · Sept 2026</em>{" "}
                    is one corridor. <em>Bengaluru → Munich · Oct 2026</em>{" "}
                    is another. There will be hundreds of them.
                  </p>

                  <p>
                    Every member of a corridor passes three checks before
                    they appear inside it. Phone OTP, which costs ten
                    rupees and twenty seconds. DigiLocker Aadhaar, which
                    hands us a one-way signed token (we never see the
                    twelve-digit number). And a human-reviewed admit
                    letter — a real person, within forty-eight hours,
                    looking at the registrar&apos;s signature and confirming
                    the offer is real.
                  </p>

                  <p>
                    Group chat doesn&apos;t open until sixty members have
                    passed all three checks for the same corridor. Below
                    sixty, the group is not real, and we tell you it
                    isn&apos;t. There is no &ldquo;preview group&rdquo;
                    feature, no &ldquo;join early&rdquo; button, no way to
                    talk to other members until the verification network
                    is dense enough that the group is genuinely a group.
                  </p>

                  <p>
                    That last paragraph is also our pricing logic. The
                    free tier covers all of the above. The ₹999 Premium
                    tier exists for the parent — read-only dashboard,
                    arrival check-in, a one-hour Trust &amp; Safety
                    response on the day something goes wrong. Once.
                    Forever. No renewal.
                  </p>

                  <h2 className="!mt-12 font-heading text-[24px] font-semibold tracking-[-0.018em] text-[color:var(--color-fg)] sm:text-[28px]">
                    What the company is, in one sentence.
                  </h2>

                  <p>
                    NexGen Connect builds verified arrival corridors. We
                    are the trust infrastructure for the largest
                    cross-border student migration in human history.
                  </p>

                  <p>
                    By 2030, two million Indian students will fly out for
                    a degree somewhere they have never been. Almost all
                    of them, if nothing changes, will be in a WhatsApp
                    group with four hundred strangers on the day they
                    land. The trust gap between &ldquo;four hundred
                    strangers&rdquo; and &ldquo;sixty verified
                    classmates&rdquo; is the entire problem we are
                    solving.
                  </p>

                  <h2 className="!mt-12 font-heading text-[24px] font-semibold tracking-[-0.018em] text-[color:var(--color-fg)] sm:text-[28px]">
                    What I am personally committing to.
                  </h2>

                  <p>
                    I will personally call the first five verified
                    students in every corridor. Not a customer success
                    person. Not a chatbot. Me, by phone, within
                    forty-eight hours of admit-letter approval. If you
                    are number one through five in your corridor, you
                    will get a number to save in your phone, and that
                    number is mine.
                  </p>

                  <p>
                    I will reply to every email that reaches{" "}
                    <a
                      href="mailto:hello@nexgenconnect.com"
                      className="underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      hello@nexgenconnect.com
                    </a>{" "}
                    in the first year. If we get big enough that
                    I cannot, I will say so publicly, on this page, and
                    name the person taking over.
                  </p>

                  <p>
                    Once a quarter, I will write one of these letters.
                    What worked. What did not. What we got wrong. What
                    we are doing next. The next letter lands in August.
                    If something serious happens between now and then —
                    an incident, a scam we did not catch, a regulatory
                    change — there will be an out-of-cycle letter.
                  </p>

                  <p>
                    The five things we will never do are written on{" "}
                    <Link
                      href="/promises"
                      className="underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      our promises page
                    </Link>
                    . If we ever break one, the page tells you we did,
                    and what we did to make it right.
                  </p>

                  <h2 className="!mt-12 font-heading text-[24px] font-semibold tracking-[-0.018em] text-[color:var(--color-fg)] sm:text-[28px]">
                    What comes next.
                  </h2>

                  <p>
                    Two corridors open this year. Ireland in September —
                    UCD, Trinity, UCC. Germany in October — TUM, LMU,
                    RWTH, Humboldt. The first sixty verified students in
                    each corridor are our founding class. Their names go
                    on a permanent record, with their consent. They will
                    be the people future students see when they ask
                    &ldquo;is this real?&rdquo; A year from now, when
                    Trinity &apos;26 is on the ground in Dublin, we will
                    publish a follow-up to this letter that names them
                    and where they are now.
                  </p>

                  <p>
                    After Ireland and Germany: the UK, Canada,
                    Australia, the Netherlands, Singapore. Same
                    mechanic, same three checks, same sixty-verified
                    unlock. Different paperwork.
                  </p>

                  <p>
                    By year three, we will publish{" "}
                    <em>The Migration Report</em> — an annual,
                    open-licensed dataset on cross-border Indian
                    student migration, drawn from the corpus we are
                    building now. Every verified student is a row in
                    that corpus. We anonymise it, we aggregate it, and
                    we make it free, because the conversation about
                    Indian student migration deserves better data than
                    it currently has.
                  </p>

                  <h2 className="!mt-12 font-heading text-[24px] font-semibold tracking-[-0.018em] text-[color:var(--color-fg)] sm:text-[28px]">
                    A note on writing this.
                  </h2>

                  <p>
                    I sat down to write this letter the morning we
                    launched the press room. I had a draft that
                    explained the architecture, the verification stack,
                    the unit economics. I deleted it. The only thing
                    that matters in the first letter is why we are
                    doing this, who I am, and what I personally
                    promise. Everything else is on the rest of the
                    site. If you want to read it, the{" "}
                    <Link
                      href="/how"
                      className="underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      how-it-works
                    </Link>{" "}
                    page is thorough. If you want to talk, the email
                    above goes to me.
                  </p>

                  <p>
                    Thanks for being here at the start.
                  </p>
                </div>

                {/* Sign-off — name + role + email, separated by a hairline
                    so it reads as a letter, not a blog post tail. */}
                <div className="mt-14 border-t border-[color:var(--color-border)] pt-8">
                  <p className="font-serif italic text-[18px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg)]">
                    Yours,
                  </p>
                  <p className="mt-4 title-md text-[color:var(--color-fg)]">
                    Aayush Shah
                  </p>
                  <p className="mt-1 body-sm text-[color:var(--color-fg-muted)]">
                    Founder · NexGen Connect
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                    Mumbai · {PUBLISHED}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Forward — the "what to read next" pattern. Points readers at
            the promises page (the institutional artifact this letter
            references) and the signup flow (the action). */}
        <aside className="mt-20">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px] border-t border-[color:var(--color-border)] pt-10">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Forward
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/promises"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] px-5 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/55"
                >
                  Read the five promises
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-5 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
                >
                  Join the corridor
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
