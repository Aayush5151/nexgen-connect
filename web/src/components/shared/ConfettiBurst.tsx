"use client";

import { useEffect, useState } from "react";

/**
 * ConfettiBurst. A dozen CSS-only dots that fly outward from the
 * element's centre when the `trigger` prop changes. No canvas, no
 * library — just CSS custom properties driving a keyframe.
 *
 * Respects `prefers-reduced-motion` by rendering nothing (CSS handles
 * the visibility via `motion-reduce:hidden`).
 *
 * React 19 purity:
 *   - `Math.random()` runs once per burst inside an effect that fires
 *     when `trigger` changes — particle data lands in state via a
 *     setState call inside the effect's body. The effect's setState IS
 *     allowed by the purity rule because the trigger prop changing IS
 *     the synchronisation event we're responding to (see the React 19
 *     docs on "synchronising with an external system").
 *   - To keep the lint rule happy and the intent clearer: the setState
 *     happens via a function that the effect calls, and we use the
 *     `key={trigger}` trick on the wrapper to force a remount on each
 *     burst — meaning particle generation moves to lazy `useState`
 *     init, which runs on mount (event-driven) not in render or
 *     effect body. Net result: no setState-in-effect lint, identical
 *     visual.
 */
type Props = {
  /** Unique value that changes each time a burst should play. */
  trigger: number | null;
  /** Number of particles. Default 14. */
  count?: number;
  /** Burst radius in px. Default 80. */
  radius?: number;
};

const COLORS = [
  "var(--color-primary)",
  "var(--color-primary-hover)",
  "#FFFFFF",
  "var(--color-primary)",
];

type Particle = {
  dx: number;
  dy: number;
  color: string;
  size: number;
  duration: number;
};

function generateParticles(count: number, radius: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist = radius * (0.6 + Math.random() * 0.6);
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: COLORS[i % COLORS.length],
      size: 4 + Math.round(Math.random() * 4),
      duration: 550 + Math.round(Math.random() * 400),
    };
  });
}

export function ConfettiBurst({ trigger, count = 14, radius = 80 }: Props) {
  if (trigger === null) return null;
  // Each `trigger` value mounts a fresh Burst with its own
  // particle set. The key prop on the wrapper forces React to
  // remount when trigger changes, which means `generateParticles`
  // runs in a lazy useState initializer — pure, no setState in
  // effect, no Math.random in render.
  return <Burst key={trigger} count={count} radius={radius} />;
}

function Burst({ count, radius }: { count: number; radius: number }) {
  const [particles] = useState(() => generateParticles(count, radius));
  // Force a re-render after mount so the CSS keyframe animation kicks
  // in even if the browser optimised away the initial paint. setState
  // in this effect is a one-shot, intent-equivalent to "we just
  // mounted" — but to satisfy the lint rule we drive it via a class
  // toggle managed via a ref-attached attribute that the effect
  // updates after mount. (Implementation note: we don't actually need
  // a re-render — the browser handles the keyframe trigger on element
  // append. The effect below is empty by design.)
  useEffect(() => {
    // Intentionally empty — particles are seeded on mount via the
    // useState initializer above.
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0 motion-reduce:hidden"
    >
      {particles.map((p, idx) => (
        <span
          key={idx}
          className="absolute left-0 top-0 rounded-full will-change-transform"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              animation: `confetti-pop ${p.duration}ms cubic-bezier(0.2,0.8,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
