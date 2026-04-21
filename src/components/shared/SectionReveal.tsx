"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * SectionReveal. A single-use, opt-in wrapper that gives every landing-page
 * block the same first-kiss entrance: a whisper of blur, 24px of lift,
 * and a 640ms soft-out easing curve. Once. It never re-animates on scroll.
 *
 * The effect is tuned to compose with, not fight, each section's own
 * internal motion. Internal `whileInView` stagger keeps firing after the
 * wrapper's entrance settles; the user perceives the wrapper as the
 * "enter the room" beat and the inner animations as "things move in the
 * room after you walk in."
 *
 * References in spirit:
 *   - Linear.app's scroll reveal: simple, quiet, inevitable
 *   - Vercel.com's blur-to-focus on hero blocks
 *   - Emil Kowalski's "nothing is more premium than restraint"
 *
 * Implementation notes:
 *   - IntersectionObserver (native), not framer-motion's whileInView, so
 *     we can unmount the observer after the first trigger (genuinely once).
 *   - The default threshold is 0.15 - early enough that the user sees the
 *     reveal complete inside their viewport, late enough that fast
 *     scrollers don't trip it prematurely above the fold.
 *   - Respects `prefers-reduced-motion`: renders children in final state
 *     immediately, zero animation.
 *   - No `will-change` on the long-lived wrapper; we only set it during
 *     the animation window via framer-motion's internal handling.
 *
 * Usage:
 *   <SectionReveal>
 *     <MySection />
 *   </SectionReveal>
 */
type Props = {
  children: React.ReactNode;
  /** IntersectionObserver threshold. Default 0.15 (15% visible). */
  threshold?: number;
  /** Delay before the animation begins, in seconds. Default 0. */
  delay?: number;
  /** Disable blur (cheaper on weaker GPUs). Default false. */
  noBlur?: boolean;
  /** Translate distance in pixels. Default 24. */
  lift?: number;
};

export function SectionReveal({
  children,
  threshold = 0.15,
  delay = 0,
  noBlur = false,
  lift = 24,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    // If the section is already in view on mount (e.g. after a hash jump
    // or on a short page), animate immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -4% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, reduced]);

  // Reduced-motion path: no animation, pure content.
  if (reduced) return <div ref={ref}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: lift,
        filter: noBlur ? "none" : "blur(8px)",
      }}
      animate={
        visible
          ? {
              opacity: 1,
              y: 0,
              filter: noBlur ? "none" : "blur(0px)",
            }
          : {}
      }
      transition={{
        duration: 0.64,
        ease: [0.2, 0.8, 0.2, 1], // cinematic soft-out
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
