"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgressBar. Thin 2px electric-green line at the very top of the
 * viewport that grows left-to-right as the page scrolls. Uses framer's
 * `useScroll` + a spring so the motion feels *smooth* rather than linear.
 *
 * Appearance:
 *   - 2px tall, fixed at the very top
 *   - Sits above the sticky Navbar (z-index 60)
 *   - Transform origin left so it scales from 0 → 1 without a snap
 *   - Matches the primary accent so it reads as intentional, not chrome
 *
 * Performance:
 *   - Single motion.div subscribed to one spring. No scroll listeners in
 *     userland; framer pipes through rAF.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[color:var(--color-primary)] shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]"
    />
  );
}
