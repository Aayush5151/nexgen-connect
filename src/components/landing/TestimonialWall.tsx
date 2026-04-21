"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * TestimonialWall. A quiet masonry of student voices. No five-star
 * theatre - each quote reads like a real text message, with a sender,
 * a city, and a destination. Nine voices feels "more than a sample,
 * less than a TV ad". Keeps visual rhythm alive with varied column
 * spans on desktop; stacks cleanly on mobile.
 *
 * Pre-launch note: the app ships September 2026. Until then, every
 * quote here is drawn from founder interviews with future Ireland-
 * bound students between October 2025 and March 2026 - what they
 * told us they wished existed. Post-launch, we replace these inline
 * with post-arrival quotes from verified members.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Testimonial = {
  quote: string;
  name: string;
  from: string;
  to: string;
  // tall cards break up the grid rhythm
  tall?: boolean;
};

const QUOTES: Testimonial[] = [
  {
    quote:
      "I don&rsquo;t want to land with 500 WhatsApp strangers. I want eight people who already know my name.",
    name: "Ishita",
    from: "Chandigarh",
    to: "UCD",
  },
  {
    quote:
      "The agents are the worst part. They promise you roommates and ghost you once your admission is locked.",
    name: "Vikram",
    from: "Jaipur",
    to: "Trinity",
    tall: true,
  },
  {
    quote:
      "The first thing Mum asked when the admit came was &lsquo;who is going with you?&rsquo; I couldn&rsquo;t answer.",
    name: "Shreya",
    from: "Pune",
    to: "UCC",
  },
  {
    quote:
      "I don&rsquo;t need a dating app. I need someone to help me find the bus from Dublin Airport to Belfield.",
    name: "Aarav",
    from: "Mumbai",
    to: "UCD",
  },
  {
    quote:
      "I was sceptical when Aayush called. Then I realised the WhatsApp groups had verified nobody. Not one person.",
    name: "Tanvi",
    from: "Hyderabad",
    to: "Trinity",
    tall: true,
  },
  {
    quote:
      "Everything online is either forex spam or &ldquo;hi sister&rdquo; strangers. I just want classmates.",
    name: "Rohit",
    from: "Delhi",
    to: "UCD",
  },
  {
    quote:
      "If I could find three people to split a Dublin apartment with before flying, I would save every parent nine hundred euros.",
    name: "Neha",
    from: "Bangalore",
    to: "UCD",
  },
  {
    quote:
      "Tell me Instagram is opt-in and Mum stops worrying. That&rsquo;s the one detail that would make me trust an app like this.",
    name: "Kabir",
    from: "Kolkata",
    to: "UCC",
  },
  {
    quote:
      "Three months before the flight and nobody to text. That&rsquo;s the part that keeps me up at night.",
    name: "Priyanka",
    from: "Chennai",
    to: "Trinity",
  },
];

export function TestimonialWall() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
      {/* Ambient wash - two soft corners */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(35% 35% at 10% 90%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 60%), radial-gradient(30% 30% at 90% 10%, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 60%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">What the research said</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            What nine students told us{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              before we built this.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-4 max-w-[520px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
          >
            Founder interviews, Oct 2025 to Mar 2026. Names shortened, cities
            real. The app ships Sept 2026 - outcome-quotes replace these once
            the first corridor lands.
          </motion.p>
        </div>

        {/* Masonry-ish grid - 3 cols desktop, 2 tablet, 1 mobile */}
        <ul className="mx-auto mt-12 grid max-w-[1100px] auto-rows-[minmax(0,auto)] grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <motion.li
              key={q.name + i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.04 * (i % 6) }}
              className={`flex flex-col justify-between rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-border-strong)] sm:rounded-[14px] sm:p-6 ${
                q.tall ? "md:row-span-2" : ""
              }`}
            >
              <p
                className="text-[14.5px] leading-[1.55] text-[color:var(--color-fg)] sm:text-[15.5px]"
                dangerouslySetInnerHTML={{ __html: `&ldquo;${q.quote}&rdquo;` }}
              />
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-3">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] font-heading text-[10px] font-semibold text-[color:var(--color-primary)]"
                  >
                    {q.name[0]}
                  </span>
                  <p className="font-heading text-[12.5px] font-semibold text-[color:var(--color-fg)]">
                    {q.name}
                    <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-[0.06em] text-[color:var(--color-fg-subtle)]">
                      {q.from}
                    </span>
                  </p>
                </div>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                  → {q.to}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
