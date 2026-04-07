/**
 * Central animation configuration for NexGen Connect.
 * All Framer Motion variants, transitions, and timing constants live here.
 */

// ─── Spring physics ──────────────────────────────────────────────
export const spring = { type: "spring" as const, damping: 25, stiffness: 120 };
export const springBouncy = { type: "spring" as const, damping: 15, stiffness: 200 };
export const springStiff = { type: "spring" as const, damping: 30, stiffness: 400 };

// ─── Reusable variants ──────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: spring },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: spring },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: spring },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: spring },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: springBouncy },
};

export const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.6 } },
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring },
};

// ─── Stagger containers ─────────────────────────────────────────
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerContainerFast = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

export const staggerContainerSlow = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// ─── Hero orchestration delays ──────────────────────────────────
export const heroTimeline = {
  badge: 2.1,
  headline: 2.3,
  subtext: 2.7,
  cta: 2.9,
  counter: 3.1,
  trustBadges: 3.3,
};

// ─── Viewport config ────────────────────────────────────────────
export const viewportOnce = { once: true, amount: 0.15 as const };
export const viewportHalf = { once: true, amount: 0.3 as const };

// ─── Word-by-word animation helper ──────────────────────────────
export const wordRevealContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export const wordRevealChild = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};
