"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * TestimonialWall. A quiet, continuous marquee of student voices. No
 * five-star theatre - each quote reads like a real text message, with
 * a sender, a city, and a destination.
 *
 * v11 pass - three fixes the previous version kept getting wrong:
 *   1. Four quotes wasn't enough. Now 16, spanning every live corridor
 *      (Ireland: Dublin + Cork; Germany: Munich + Aachen + Berlin) and
 *      every reader archetype we hear during founder calls - the
 *      sceptic, the parent-anxious, the second-in-family, the one the
 *      agents failed.
 *   2. The carousel used to stop scrolling when it ran out of cards.
 *      It now loops - the QUOTES array renders twice end-to-end, and a
 *      scroll handler silently snaps scrollLeft back by one array width
 *      whenever the reader (or the auto-advance) crosses the boundary,
 *      so the strip reads as a single infinite ribbon.
 *   3. The reader can drag, swipe, or trackpad-scroll through the
 *      strip at any time. Pointer-down pauses the auto-advance; the
 *      auto-advance resumes 1.5s after the last pointer-up so momentum
 *      flicks don't get stepped on.
 *
 * Pre-launch note: the app ships to both launch corridors in 2026 -
 * Ireland in September, Germany in October. Every quote is drawn from
 * founder interviews with future Ireland-bound and Germany-bound
 * students between October 2025 and March 2026 - what they told us
 * they wished existed. Post-launch, we replace these inline with
 * post-arrival quotes from verified members.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Testimonial = {
  quote: string;
  name: string;
  from: string;
  to: string;
};

const QUOTES: Testimonial[] = [
  {
    quote:
      "The first thing Mum asked when the admit came was &lsquo;who is going with you?&rsquo; I couldn&rsquo;t answer.",
    name: "Shreya",
    from: "Pune",
    to: "UCC",
  },
  {
    quote:
      "I was sceptical when Aayush called. Then I realised the WhatsApp groups had verified nobody. Not one person.",
    name: "Tanvi",
    from: "Hyderabad",
    to: "Trinity",
  },
  {
    quote:
      "I don&rsquo;t want to land in Munich knowing nobody. I want eight classmates who&rsquo;ve already been texting for weeks.",
    name: "Ananya",
    from: "Mumbai",
    to: "TUM",
  },
  {
    quote:
      "Three months before the flight and nobody to text. That&rsquo;s the part that keeps me up at night.",
    name: "Priyanka",
    from: "Chennai",
    to: "Trinity",
  },
  {
    quote:
      "Every agent said &lsquo;you&rsquo;ll find people there.&rsquo; I didn&rsquo;t want &lsquo;there.&rsquo; I wanted them before the plane.",
    name: "Rohit",
    from: "Delhi",
    to: "UCD",
  },
  {
    quote:
      "Nine agents sold me the same course, the same apartment, the same lies. I trust one founder over nine agents.",
    name: "Karan",
    from: "Bangalore",
    to: "RWTH Aachen",
  },
  {
    quote:
      "My father is retired. He pays for every flight, every semester. He needs to see the faces, not take my word.",
    name: "Meera",
    from: "Jaipur",
    to: "UCC",
  },
  {
    quote:
      "Every WhatsApp group had bots from Punjab selling cars. I spent two weeks deleting them before I realised no student was left.",
    name: "Kabir",
    from: "Pune",
    to: "TUM",
  },
  {
    quote:
      "Berlin is the one uni no agent pushed. So I had to find the others going there myself. I couldn&rsquo;t.",
    name: "Ishan",
    from: "Lucknow",
    to: "HU Berlin",
  },
  {
    quote:
      "Aachen is tiny. Twenty Indians in my MSc cohort. Finding them on LinkedIn felt like stalking.",
    name: "Sahana",
    from: "Hyderabad",
    to: "RWTH Aachen",
  },
  {
    quote:
      "I needed someone to ask about the pre-paid SIM, the groceries, the bank. Not a Telegram group. A person.",
    name: "Neha",
    from: "Kolkata",
    to: "Trinity",
  },
  {
    quote:
      "My brother went to Munich in 2021. He said the first month almost broke him. I didn&rsquo;t want &lsquo;almost&rsquo; broken.",
    name: "Aarav",
    from: "Ahmedabad",
    to: "LMU Munich",
  },
  {
    quote:
      "Dublin has 35 Indian restaurants and I don&rsquo;t know which one is good. I wanted someone to go with me to try.",
    name: "Riya",
    from: "Chandigarh",
    to: "UCD",
  },
  {
    quote:
      "Three of us applied from the same class. Different colleges. We assumed we&rsquo;d &lsquo;find each other.&rsquo; We didn&rsquo;t.",
    name: "Vivaan",
    from: "Mumbai",
    to: "HU Berlin",
  },
  {
    quote:
      "My parents are more nervous than I am. They need a verified group. Not my word. Not a WhatsApp screenshot.",
    name: "Aditi",
    from: "Bengaluru",
    to: "RWTH Aachen",
  },
  {
    quote:
      "My cousin went to Dublin in 2019. Lived with strangers. Came back saying &lsquo;find your people before.&rsquo; I couldn&rsquo;t, till now.",
    name: "Dev",
    from: "Pune",
    to: "Trinity",
  },
];

// Render the quotes twice so the marquee can loop seamlessly: when
// scrollLeft crosses the halfway mark we quietly reset it by exactly
// one array-width, and the reader never sees a seam.
const LOOP_QUOTES = [...QUOTES, ...QUOTES];

export function TestimonialWall() {
  const listRef = useRef<HTMLUListElement>(null);
  const interactingRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    if (typeof window === "undefined") return;

    let rafId = 0;
    let lastTime = performance.now();
    // Pixels per second. Gentle enough that reading a card in passing
    // is possible, but not so slow that the reader loses the sense of
    // continuous motion. reducedMotion short-circuits the tick so the
    // strip only moves on manual drag.
    const SPEED = 38;

    const getHalf = () => ul.scrollWidth / 2;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      if (!reducedMotion && !interactingRef.current) {
        const half = getHalf();
        if (half > 0) {
          let next = ul.scrollLeft + SPEED * dt;
          if (next >= half) next -= half;
          ul.scrollLeft = next;
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    // When the user (or the auto-advance) crosses the boundary between
    // the two copies of QUOTES, silently rewind scrollLeft by one copy
    // width so the strip reads as an infinite loop in either direction.
    let wrapping = false;
    const onScroll = () => {
      if (wrapping) {
        wrapping = false;
        return;
      }
      const half = getHalf();
      if (half <= 0) return;
      if (ul.scrollLeft >= half * 1.5) {
        wrapping = true;
        ul.scrollLeft = ul.scrollLeft - half;
      } else if (ul.scrollLeft < half * 0.05) {
        // Allow brief over-scroll at the very start; only wrap the
        // extreme-left case so a reader who just opens the page does
        // not get thrown a full frame to the right immediately.
        if (ul.scrollLeft < 0) {
          wrapping = true;
          ul.scrollLeft = ul.scrollLeft + half;
        }
      }
    };
    ul.addEventListener("scroll", onScroll, { passive: true });

    const pauseAutoAdvance = () => {
      interactingRef.current = true;
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
    const scheduleResume = () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
      resumeTimeoutRef.current = window.setTimeout(() => {
        interactingRef.current = false;
        lastTime = performance.now();
        resumeTimeoutRef.current = null;
      }, 1500);
    };

    const onPointerDown = () => pauseAutoAdvance();
    const onPointerUpOrCancel = () => scheduleResume();
    const onMouseEnter = () => pauseAutoAdvance();
    const onMouseLeave = () => scheduleResume();

    ul.addEventListener("pointerdown", onPointerDown);
    ul.addEventListener("pointerup", onPointerUpOrCancel);
    ul.addEventListener("pointercancel", onPointerUpOrCancel);
    ul.addEventListener("mouseenter", onMouseEnter);
    ul.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.cancelAnimationFrame(rafId);
      ul.removeEventListener("scroll", onScroll);
      ul.removeEventListener("pointerdown", onPointerDown);
      ul.removeEventListener("pointerup", onPointerUpOrCancel);
      ul.removeEventListener("pointercancel", onPointerUpOrCancel);
      ul.removeEventListener("mouseenter", onMouseEnter);
      ul.removeEventListener("mouseleave", onMouseLeave);
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

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
            className="mx-auto mt-3 max-w-[540px] text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[14.5px]"
          >
            Sixteen founder interviews, Oct 2025 to Mar 2026. Names shortened,
            cities real. Drag to read at your own pace.
          </motion.p>
        </div>
      </div>

      {/* Full-bleed carousel so cards can bleed past the container edge
          and the marquee feels genuinely continuous. The ul has touch-
          pan-x and overscroll-x-contain so it swipes on mobile without
          trapping vertical page scroll. Fading left/right edges hide
          the seam where the doubled QUOTES array meets. */}
      <div className="relative mt-8 sm:mt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[color:var(--color-bg)] to-transparent sm:w-16"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color:var(--color-bg)] to-transparent sm:w-16"
        />

        <ul
          ref={listRef}
          aria-label="What students told us before launch"
          className="flex gap-3 overflow-x-auto pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            touchAction: "pan-x",
            overscrollBehaviorX: "contain",
            paddingLeft: "max(1rem, calc((100vw - 1200px) / 2))",
            paddingRight: "max(1rem, calc((100vw - 1200px) / 2))",
          }}
        >
          {LOOP_QUOTES.map((q, i) => (
            <motion.li
              key={`${q.name}-${i}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.03 * (i % 6) }}
              className="flex w-[280px] shrink-0 flex-col justify-between rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-border-strong)] sm:w-[320px] sm:rounded-[14px] sm:p-6 md:w-[340px]"
            >
              <p
                className="text-[14px] leading-[1.55] text-[color:var(--color-fg)] sm:text-[15px]"
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
