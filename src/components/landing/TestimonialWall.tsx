"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * TestimonialWall. A quiet masonry of student voices. No five-star
 * theatre - each quote reads like a real text message, with a sender,
 * a city, and a destination.
 *
 * md:+ renders as a horizontal snap carousel that auto-advances every
 * few seconds so a reader who never touches the track still sees more
 * than the first three cards. Manual swipe/scroll always wins: hovering
 * the track pauses the timer, and native drag/scroll can overtake the
 * auto-advance at any moment. Respects prefers-reduced-motion.
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
  const listRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);

  // Auto-advance the md:+ horizontal carousel. We animate `scrollLeft`
  // by hand via requestAnimationFrame instead of `scrollBy({ behavior:
  // "smooth" })` for two reasons:
  //   1. Some browsers (and background-throttled tabs) silently drop
  //      programmatic smooth scrolls on scroll-snap-mandatory containers.
  //   2. RAF lets us ease the motion ourselves - a gentle easeOutCubic
  //      reads more premium than the browser's default linear-ish ease.
  // The container still has `scroll-snap-type: x mandatory`, which
  // guarantees a clean resting alignment when manual swipes end.
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    if (paused) return;
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const carouselMedia = window.matchMedia("(min-width: 768px)");
    if (!carouselMedia.matches) return;

    // Card is md:w-[340px] + md:gap-4 (16px).
    const STEP = 356;
    const INTERVAL_MS = 4200;
    const ANIM_DURATION = 600;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let rafId = 0;

    const animateTo = (from: number, to: number) => {
      if (reducedMotion) {
        const el = listRef.current;
        if (el) el.scrollLeft = to;
        return;
      }
      const startTime = performance.now();
      const frame = (now: number) => {
        const el = listRef.current;
        if (!el) return;
        const t = Math.min(1, (now - startTime) / ANIM_DURATION);
        el.scrollLeft = from + (to - from) * easeOutCubic(t);
        if (t < 1) rafId = window.requestAnimationFrame(frame);
      };
      rafId = window.requestAnimationFrame(frame);
    };

    const tick = () => {
      const el = listRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const from = el.scrollLeft;
      const nearEnd = from >= maxScroll - 12;
      const to = nearEnd ? 0 : Math.min(from + STEP, maxScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      animateTo(from, to);
    };

    const id = window.setInterval(tick, INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [paused]);

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
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
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(24px, 5vw, 48px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            What students told us{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              before we built this.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-3 max-w-[520px] text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[14.5px]"
          >
            Founder interviews, Oct 2025 to Mar 2026. Names shortened,
            cities real.
          </motion.p>
        </div>

        {/* Horizontal snap carousel on md:+ so 9 cards read as one row
            instead of a 3-row grid. On small screens the cards still stack
            cleanly; ul-level grid kicks in only below md. The carousel has
            scroll-snap enabled so users can swipe/scroll through quotes
            without the section exceeding one viewport. */}
        <ul
          ref={listRef}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          className="mx-auto mt-8 grid max-w-[1100px] grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 md:flex md:max-w-none md:snap-x md:snap-mandatory md:gap-4 md:overflow-x-auto md:px-1 md:pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color:var(--color-border-strong)] [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {QUOTES.map((q, i) => (
            <motion.li
              key={q.name + i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.04 * (i % 6) }}
              className="flex flex-col justify-between rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-border-strong)] sm:rounded-[14px] sm:p-6 md:w-[340px] md:shrink-0 md:snap-start"
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
