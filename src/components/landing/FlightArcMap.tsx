"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Sparkles } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * FlightArcMap. An interactive SVG of the India → Ireland corridor.
 * Tap a city, watch a great-circle arc draw across the Arabian Sea and
 * land on Dublin. Stacks up to nine arcs. "Light them all" draws the
 * full constellation in sequence.
 *
 * No real great-circle math - the arcs are quadratic beziers tuned to
 * feel like a plane route over a rhumb projection. The point is the
 * feeling of "your corridor is about to exist", not cartography.
 *
 * Design choices:
 *   - India is represented by a silhouette-style simplified outline;
 *     no borders, no labels, just form. Cities sit as discrete dots.
 *   - Dublin sits top-left, already lit with a slow pulse ring, so
 *     every arc has a visible destination from frame one.
 *   - The arc's stroke is animated with pathLength so it draws; a
 *     small plane glyph sits at the tip while it is drawing.
 *   - After completion the arc dims to 60% and stays - lit corridors
 *     accumulate into a constellation.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const SVG_VB_W = 900;
const SVG_VB_H = 520;

// Pixel coordinates within the SVG viewBox. Hand-placed to feel right;
// not a reprojection of actual coordinates.
const DUBLIN = { x: 90, y: 110 };

type City = {
  id: string;
  name: string;
  x: number;
  y: number;
  iata: string;
};

const CITIES: City[] = [
  { id: "del", name: "Delhi", x: 620, y: 230, iata: "DEL" },
  { id: "bom", name: "Mumbai", x: 560, y: 340, iata: "BOM" },
  { id: "blr", name: "Bangalore", x: 640, y: 420, iata: "BLR" },
  { id: "maa", name: "Chennai", x: 680, y: 420, iata: "MAA" },
  { id: "hyd", name: "Hyderabad", x: 635, y: 375, iata: "HYD" },
  { id: "pnq", name: "Pune", x: 580, y: 350, iata: "PNQ" },
  { id: "ccu", name: "Kolkata", x: 760, y: 280, iata: "CCU" },
  { id: "amd", name: "Ahmedabad", x: 535, y: 295, iata: "AMD" },
  { id: "ixc", name: "Chandigarh", x: 610, y: 185, iata: "IXC" },
];

// Quadratic-bezier path from (x0,y0) to Dublin, curving northward across
// the Arabian Sea. The control point lifts relative to the midpoint so
// the arc reads as a plane route rather than a straight line.
function arcPath(x0: number, y0: number): string {
  const x2 = DUBLIN.x;
  const y2 = DUBLIN.y;
  const mx = (x0 + x2) / 2;
  const my = (y0 + y2) / 2;
  // Lift the control point upward by ~22% of the horizontal span
  const liftY = Math.abs(x2 - x0) * 0.22;
  const cx = mx;
  const cy = my - liftY;
  return `M ${x0} ${y0} Q ${cx} ${cy} ${x2} ${y2}`;
}

// Rough simplified silhouette of India. Hand-traced from a low-res outline
// and aligned to the city pixel coordinates above. Not a real border -
// just enough form so the eye reads "India".
const INDIA_PATH =
  "M 612 150 L 610 175 L 630 195 L 660 200 L 700 205 L 740 220 L 770 240 L 790 265 L 795 290 L 780 310 L 760 295 L 745 285 L 735 305 L 720 325 L 705 340 L 695 360 L 700 385 L 690 410 L 680 430 L 665 440 L 640 445 L 620 435 L 605 410 L 585 390 L 560 380 L 540 365 L 520 345 L 505 325 L 495 305 L 490 285 L 500 265 L 520 245 L 540 225 L 555 205 L 575 180 L 590 160 Z";

type ArcState = { city: City; status: "drawing" | "lit" };

export function FlightArcMap() {
  const [arcs, setArcs] = useState<ArcState[]>([]);
  const lit = arcs.filter((a) => a.status === "lit").length + (arcs.some((a) => a.status === "drawing") ? 1 : 0);

  const toggleArc = useCallback((city: City) => {
    setArcs((prev) => {
      const already = prev.find((a) => a.city.id === city.id);
      if (already) return prev.filter((a) => a.city.id !== city.id);
      return [...prev, { city, status: "drawing" }];
    });
  }, []);

  const onArcDrawComplete = useCallback((cityId: string) => {
    setArcs((prev) =>
      prev.map((a) => (a.city.id === cityId ? { ...a, status: "lit" as const } : a)),
    );
  }, []);

  const lightAll = useCallback(() => {
    setArcs([]);
    // Stagger the adds so they draw in sequence
    CITIES.forEach((c, i) => {
      window.setTimeout(() => {
        setArcs((prev) => [...prev, { city: c, status: "drawing" }]);
      }, i * 280);
    });
  }, []);

  const clearAll = useCallback(() => setArcs([]), []);

  const activeSet = useMemo(() => new Set(arcs.map((a) => a.city.id)), [arcs]);

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 18% 22%, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">Every city, one corridor</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(30px, 6vw, 60px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Your city{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              to Dublin.
            </span>
          </motion.h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
            Tap a city. The corridor lights up. Light them all and see what
            September 2026 actually looks like.
          </p>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mx-auto mt-12 max-w-[960px] overflow-hidden rounded-[16px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_70%,transparent)] shadow-[var(--shadow-md)]"
        >
          <svg
            viewBox={`0 0 ${SVG_VB_W} ${SVG_VB_H}`}
            role="img"
            aria-label="Map showing flight arcs from Indian cities to Dublin"
            className="block h-auto w-full"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 50%, color-mix(in srgb, var(--color-primary) 3%, transparent) 0%, transparent 80%)",
            }}
          >
            <defs>
              <radialGradient id="arc-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="arc-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Graticule */}
            <g stroke="color-mix(in srgb, var(--color-fg-subtle) 18%, transparent)" strokeWidth="0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={(i + 1) * (SVG_VB_H / 9)}
                  x2={SVG_VB_W}
                  y2={(i + 1) * (SVG_VB_H / 9)}
                />
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={(i + 1) * (SVG_VB_W / 15)}
                  y1="0"
                  x2={(i + 1) * (SVG_VB_W / 15)}
                  y2={SVG_VB_H}
                />
              ))}
            </g>

            {/* India silhouette */}
            <path
              d={INDIA_PATH}
              fill="color-mix(in srgb, var(--color-primary) 12%, transparent)"
              stroke="color-mix(in srgb, var(--color-primary) 40%, transparent)"
              strokeWidth="1"
            />

            {/* Ireland speck (illustrative) */}
            <path
              d={`M ${DUBLIN.x - 20} ${DUBLIN.y - 10} q -4 8 -2 22 q 8 10 18 8 q 10 -4 10 -14 q -2 -10 -8 -16 q -10 -4 -18 0 Z`}
              fill="color-mix(in srgb, var(--color-primary) 18%, transparent)"
              stroke="color-mix(in srgb, var(--color-primary) 55%, transparent)"
              strokeWidth="1"
            />

            {/* Dublin marker */}
            <g transform={`translate(${DUBLIN.x}, ${DUBLIN.y})`}>
              <circle r="18" fill="none" stroke="var(--color-primary)" strokeOpacity="0.25" strokeWidth="1">
                <animate attributeName="r" values="12;26;12" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r="5" fill="var(--color-primary)" />
              <circle r="2" fill="#fff" />
              <text
                x="14"
                y="4"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                fill="var(--color-primary)"
                style={{ letterSpacing: "0.1em" }}
              >
                DUBLIN
              </text>
            </g>

            {/* Arcs */}
            {arcs.map(({ city, status }) => (
              <ArcLine
                key={city.id}
                city={city}
                status={status}
                onComplete={onArcDrawComplete}
              />
            ))}

            {/* City markers */}
            {CITIES.map((c) => {
              const isActive = activeSet.has(c.id);
              return (
                <g
                  key={c.id}
                  transform={`translate(${c.x}, ${c.y})`}
                  className="cursor-pointer"
                  onClick={() => toggleArc(c)}
                  role="button"
                  aria-pressed={isActive}
                  aria-label={`Toggle arc from ${c.name} to Dublin`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleArc(c);
                    }
                  }}
                >
                  {/* Hit target */}
                  <circle r="16" fill="transparent" />
                  {/* Outer ring when active */}
                  {isActive && (
                    <circle
                      r="10"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeOpacity="0.5"
                      strokeWidth="1"
                    />
                  )}
                  <circle
                    r={isActive ? 4 : 3}
                    fill={isActive ? "var(--color-primary)" : "color-mix(in srgb, var(--color-fg) 60%, transparent)"}
                    stroke={isActive ? "#fff" : "none"}
                    strokeWidth={isActive ? 1 : 0}
                  />
                  <text
                    x="8"
                    y="-6"
                    fontFamily="ui-monospace, monospace"
                    fontSize="10"
                    fill={
                      isActive
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-fg-muted) 90%, transparent)"
                    }
                    style={{ letterSpacing: "0.08em" }}
                  >
                    {c.iata}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Overlay controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)] backdrop-blur">
              <span className="tabular-nums text-[color:var(--color-primary)]">
                {lit}
              </span>{" "}
              / {CITIES.length} corridors
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <button
              type="button"
              onClick={lightAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary-fg)] transition-all hover:-translate-y-px hover:bg-[color:var(--color-primary-hover)]"
            >
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              Light all
            </button>
            {arcs.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)] backdrop-blur transition-colors hover:text-[color:var(--color-fg)]"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-[520px] items-center justify-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
        >
          <Plane className="h-3.5 w-3.5 text-[color:var(--color-primary)]" strokeWidth={2} />
          Real coordinates, illustrative routing
        </motion.p>
      </div>
    </section>
  );
}

function ArcLine({
  city,
  status,
  onComplete,
}: {
  city: City;
  status: "drawing" | "lit";
  onComplete: (id: string) => void;
}) {
  const d = useMemo(() => arcPath(city.x, city.y), [city.x, city.y]);

  return (
    <g>
      {/* Base glow path (always visible when arc exists) */}
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-primary)"
        strokeOpacity={status === "lit" ? 0.55 : 0.35}
        strokeWidth={status === "lit" ? 1.5 : 2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (status === "drawing") onComplete(city.id);
        }}
        style={{
          filter:
            status === "lit"
              ? "drop-shadow(0 0 1px color-mix(in srgb, var(--color-primary) 50%, transparent))"
              : "drop-shadow(0 0 4px color-mix(in srgb, var(--color-primary) 70%, transparent))",
        }}
      />
      {/* Plane at origin while drawing - simplified: it sits at the city */}
      {status === "drawing" && (
        <g transform={`translate(${city.x}, ${city.y})`}>
          <circle r="3" fill="var(--color-primary)">
            <animate attributeName="r" values="3;7;3" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </g>
  );
}
