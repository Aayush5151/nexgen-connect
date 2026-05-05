"use client";

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
 * Implementation:
 *   - framer-motion's `whileInView` + `viewport={{ once: true }}` replaces
 *     the previous IntersectionObserver + useState + useEffect dance.
 *     Same trigger semantics — the section animates exactly once when
 *     any pixel crosses into the top 85% of the viewport — but no React
 *     state and no manual observer disconnect. Net-negative LOC and
 *     satisfies React 19's "no setState in effect body" purity rule.
 *   - Respects `prefers-reduced-motion` via `useReducedMotion()`: renders
 *     children in final state immediately, zero animation.
 *   - No `will-change` on the long-lived wrapper; framer-motion handles
 *     it internally only during the animation window.
 *
 * Usage:
 *   <SectionReveal>
 *     <MySection />
 *   </SectionReveal>
 */
type Props = {
  children: React.ReactNode;
  /**
   * Viewport amount threshold passed to framer-motion. Default 0 means
   * "fire as soon as any pixel intersects." Ratio-based thresholds are
   * unreliable for tall sections (a 2000px scrollytelling block on an
   * 812px viewport can never reach 15% self-visibility).
   */
  amount?: number | "some" | "all";
  /**
   * Viewport margin passed straight to framer-motion. Default
   * "0px 0px -15% 0px" shrinks the effective viewport by 15% at the
   * bottom, so the reveal fires when the section is properly on-screen,
   * not when only its very top is peeking above the fold.
   */
  margin?: string;
  /** Delay before the animation begins, in seconds. Default 0. */
  delay?: number;
  /** Disable blur (cheaper on weaker GPUs). Default false. */
  noBlur?: boolean;
  /** Translate distance in pixels. Default 24. */
  lift?: number;
};

export function SectionReveal({
  children,
  amount = 0,
  margin = "0px 0px -15% 0px",
  delay = 0,
  noBlur = false,
  lift = 24,
}: Props) {
  const reduced = useReducedMotion();

  // Reduced-motion path: no animation, pure content.
  if (reduced) return <div>{children}</div>;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: lift,
        filter: noBlur ? "none" : "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: noBlur ? "none" : "blur(0px)",
      }}
      viewport={{ once: true, amount, margin }}
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
