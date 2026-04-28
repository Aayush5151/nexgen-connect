"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * ConfettiBurst. A dozen CSS-only dots that fly outward from the
 * element's centre when the `trigger` prop changes. No canvas, no
 * library - just CSS custom properties driving a keyframe.
 *
 * Respects `prefers-reduced-motion` by rendering nothing.
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

export function ConfettiBurst({ trigger, count = 14, radius = 80 }: Props) {
  const [key, setKey] = useState<number | null>(trigger);

  useEffect(() => {
    setKey(trigger);
  }, [trigger]);

  const particles = useMemo(() => {
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
  }, [count, radius, key]);

  if (key === null) return null;

  return (
    <div
      key={key}
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
