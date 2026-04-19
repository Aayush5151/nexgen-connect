"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fixed right-edge progress rail. Desktop-only (hidden below lg).
 * Uses IntersectionObserver to detect which landmark section is centered
 * and highlights the matching dot. Clicking a dot scrolls to that section.
 *
 * Hoisted constants so the landmark array isn't recreated per render.
 */

type Landmark = { id: string; label: string };

const LANDMARKS: Landmark[] = [
  { id: "reserve",  label: "Reserve" },
  { id: "matching", label: "Matching" },
  { id: "ireland",  label: "Ireland" },
  { id: "verify",   label: "Verify" },
  { id: "close",    label: "Close" },
];

export function ProgressRail() {
  const [active, setActive] = useState<string>(LANDMARKS[0].id);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const els = LANDMARKS
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    // Track which sections are currently visible; pick the one whose top
    // is closest to the viewport's 1/3 mark (feels most "in focus").
    const visible = new Map<string, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visible.set(e.target.id, e.intersectionRatio);
          } else {
            visible.delete(e.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick the visible section whose bounding box top is nearest to
        // viewport.height * 0.33 (reading-focus zone).
        const focusY = window.innerHeight * 0.33;
        let bestId: string | null = null;
        let bestDist = Infinity;
        for (const id of visible.keys()) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top - focusY);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = id;
          }
        }
        if (bestId && bestId !== activeRef.current) setActive(bestId);
      },
      {
        // Trigger when any part enters the middle 60% of the viewport.
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section progress"
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-5">
        {LANDMARKS.map((l) => {
          const isActive = active === l.id;
          return (
            <li key={l.id} className="group relative flex items-center justify-end">
              <a
                href={`#${l.id}`}
                aria-label={`Jump to ${l.label}`}
                aria-current={isActive ? "location" : undefined}
                className="flex items-center gap-3"
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity ${
                    isActive
                      ? "opacity-100 text-[color:var(--color-primary)]"
                      : "opacity-0 group-hover:opacity-80 text-[color:var(--color-fg-muted)]"
                  }`}
                >
                  {l.label}
                </span>
                <span
                  className={`block rounded-full transition-all ${
                    isActive
                      ? "h-2 w-2 bg-[color:var(--color-primary)]"
                      : "h-1.5 w-1.5 bg-[color:var(--color-border-strong)] group-hover:bg-[color:var(--color-fg-muted)]"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
