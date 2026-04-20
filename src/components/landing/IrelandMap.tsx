"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getMapBreakdownAction } from "@/app/actions/waitlist";
import type { MapCohortRow, University } from "@/lib/supabase/schema";

/**
 * Ireland map. Google-Maps-style palette.
 * viewBox 0 0 320 520
 * Equirectangular projection:
 *   lon range: -10.6 to -5.4  (usable x: 25..295)
 *   lat range: 51.4 to 55.5   (usable y: 25..495)
 *   x(lon) = 25 + (lon + 10.6) * 51.92
 *   y(lat) = 25 + (55.5 - lat) * 114.63
 * All coords pre-computed; no runtime math.
 */

/**
 * Map palette. Dark + minimal. Pins are the only accent color.
 * Every color references a design token - no raw hex.
 */
const MAP = {
  sea: "var(--color-bg)",
  land: "var(--color-surface)",
  lake: "var(--color-bg)",
  coastline: "var(--color-border-strong)",
  niBorder: "var(--color-border-strong)",
  text: "var(--color-fg-muted)",
  textMuted: "var(--color-fg-subtle)",
  textSubtle: "var(--color-border-strong)",
  park: "var(--color-surface-elevated)",
  pin: "var(--color-primary)",
  pinCore: "var(--color-primary-fg)",
  pinRing: "var(--color-bg)",
} as const;

type Pin = {
  name: University;
  city: "Dublin" | "Cork";
  cx: number;
  cy: number;
  indianStudents: string;
  note: string;
};

const PINS: Pin[] = [
  {
    name: "Trinity",
    city: "Dublin",
    cx: 249,
    cy: 265,
    indianStudents: "~1,000/year",
    note: "Strongest Delhi and Bangalore pipeline.",
  },
  {
    name: "UCD",
    city: "Dublin",
    cx: 252,
    cy: 279,
    indianStudents: "~1,800/year",
    note: "Broadest city-of-origin mix in Ireland.",
  },
  {
    name: "UCC",
    city: "Cork",
    cx: 138,
    cy: 440,
    indianStudents: "~500/year",
    note: "Fastest-growing CS and biotech intake.",
  },
];

type CityLabel = {
  name: string;
  cx: number;
  cy: number;
  anchor: "start" | "end" | "middle";
  dx?: number;
  dy?: number;
  size?: number;
  weight?: number;
};

const CITIES: CityLabel[] = [
  { name: "Letterkenny",  cx: 170, cy: 72,  anchor: "end",    dx: -6, dy: 3, size: 8 },
  { name: "Derry",        cx: 195, cy: 83,  anchor: "start",  dx: 6,  dy: 3, size: 8 },
  { name: "Belfast",      cx: 267, cy: 128, anchor: "start",  dx: 7,  dy: 3, size: 9, weight: 600 },
  { name: "Belmullet",    cx: 48,  cy: 180, anchor: "end",    dx: -6, dy: 3, size: 7 },
  { name: "Sligo",        cx: 135, cy: 166, anchor: "end",    dx: -6, dy: 3, size: 8 },
  { name: "Ballina",      cx: 112, cy: 178, anchor: "end",    dx: -6, dy: 3, size: 7 },
  { name: "Newry",        cx: 255, cy: 186, anchor: "start",  dx: 7,  dy: 3, size: 7 },
  { name: "Dundalk",      cx: 247, cy: 205, anchor: "start",  dx: 7,  dy: 3, size: 8 },
  { name: "Drogheda",     cx: 244, cy: 225, anchor: "start",  dx: 7,  dy: 3, size: 7 },
  { name: "Castlebar",    cx: 90,  cy: 225, anchor: "middle", dx: 0,  dy: -6, size: 7 },
  { name: "Clifden",      cx: 54,  cy: 264, anchor: "end",    dx: -6, dy: 3, size: 7 },
  { name: "Athlone",      cx: 164, cy: 263, anchor: "end",    dx: -6, dy: 3, size: 8 },
  { name: "Tuam",         cx: 130, cy: 258, anchor: "middle", dx: 0,  dy: 12, size: 7 },
  { name: "Galway",       cx: 105, cy: 281, anchor: "end",    dx: -6, dy: 3, size: 9, weight: 600 },
  { name: "Mullingar",    cx: 195, cy: 246, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Tullamore",    cx: 190, cy: 290, anchor: "middle", dx: 0,  dy: 12, size: 7 },
  { name: "Bray",         cx: 260, cy: 295, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Ennis",        cx: 118, cy: 335, anchor: "end",    dx: -6, dy: 3, size: 7 },
  { name: "Limerick",     cx: 128, cy: 351, anchor: "end",    dx: -6, dy: 3, size: 9, weight: 600 },
  { name: "Portlaoise",   cx: 200, cy: 325, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Carlow",       cx: 215, cy: 348, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Kilkenny",     cx: 205, cy: 370, anchor: "start",  dx: 6,  dy: 3, size: 8 },
  { name: "Tralee",       cx: 68,  cy: 388, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Dingle",       cx: 38,  cy: 408, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Clonmel",      cx: 178, cy: 392, anchor: "start",  dx: 6,  dy: 3, size: 7 },
  { name: "Waterford",    cx: 208, cy: 402, anchor: "start",  dx: 6,  dy: 3, size: 8 },
  { name: "Killarney",    cx: 81,  cy: 422, anchor: "start",  dx: 6,  dy: 3, size: 8 },
];

/** Ireland coastline. Clockwise from Malin Head. */
const IRELAND_PATH =
  "M 193 39 L 210 56 L 220 62 L 234 58 L 245 54 L 256 57 L 264 74 L 271 92 " +
  "L 274 100 L 272 118 L 284 125 L 288 138 L 291 151 L 289 162 L 285 166 " +
  "L 283 170 L 275 180 L 262 188 L 250 193 L 246 200 L 248 211 L 253 222 " +
  "L 249 240 L 252 258 L 248 270 L 252 284 L 252 302 L 253 316 L 248 345 " +
  "L 240 372 L 237 397 L 234 408 L 215 411 L 203 413 L 196 410 L 188 418 " +
  "L 174 421 L 158 428 L 140 438 L 130 452 L 118 462 L 98 472 L 82 478 " +
  "L 72 487 L 65 494 L 58 484 L 66 472 L 55 462 L 42 460 L 40 446 L 38 435 " +
  "L 44 424 L 36 415 L 32 406 L 28 400 L 38 392 L 52 385 L 58 382 L 68 378 " +
  "L 74 378 L 80 378 L 82 372 L 82 362 L 60 358 L 70 354 L 78 340 L 84 324 " +
  "L 85 308 L 90 292 L 100 283 L 106 278 L 95 282 L 82 281 L 72 278 L 62 273 " +
  "L 50 272 L 38 268 L 45 256 L 52 246 L 66 236 L 78 228 L 70 224 L 58 222 " +
  "L 50 220 L 40 210 L 30 200 L 38 190 L 48 180 L 52 168 L 70 170 L 88 170 " +
  "L 108 168 L 124 172 L 138 170 L 148 158 L 154 146 L 148 132 L 138 125 " +
  "L 128 118 L 124 106 L 134 98 L 132 88 L 140 78 L 144 68 L 142 60 L 154 56 " +
  "L 165 52 L 170 48 L 178 52 L 183 46 Z";

/** NI border. Follows historic line NW→NE→E→SE toward Newry. */
const NI_BORDER =
  "M 204 72 L 210 88 L 200 100 L 196 116 L 202 128 L 215 138 " +
  "L 228 148 L 242 152 L 252 164 L 258 178 L 253 192";

/** Lakes. Cheap visual but strong "this is a map" signal. */
const LAKES = [
  { cx: 232, cy: 132, rx: 11, ry: 9, name: "Lough Neagh" },
  { cx: 115, cy: 245, rx: 8, ry: 4,  name: "Lough Corrib" },
  { cx: 155, cy: 295, rx: 4, ry: 6,  name: "Lough Derg" },
  { cx: 168, cy: 240, rx: 3, ry: 5,  name: "Lough Ree" },
];

/**
 * Major inter-city roads used to be drawn here as Google-Maps-style coloured
 * lines. Removed in the dark-minimal pass - they added visual clutter without
 * information the reader cares about at this point in the page.
 */

export function IrelandMap() {
  const [counts, setCounts] = useState<Record<University, number>>({
    UCD: 0,
    Trinity: 0,
    UCC: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<University | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMapBreakdownAction().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        const next: Record<University, number> = { UCD: 0, Trinity: 0, UCC: 0 };
        (res.rows as MapCohortRow[]).forEach((r) => {
          next[r.destination_university] = r.cohort_size;
        });
        setCounts(next);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activePin = active ? PINS.find((p) => p.name === active) ?? null : null;

  return (
    <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="container-narrow">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <SectionLabel>Phase 01 · Ireland</SectionLabel>
            <h2
              className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
              }}
            >
              Why Ireland
              <br />
              <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                first.
              </span>
            </h2>

            <dl className="mt-8 grid grid-cols-3 gap-2 border-y border-[color:var(--color-border)] py-5">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  Indian students
                </dt>
                <dd className="mt-1 font-heading text-[22px] font-semibold tabular-nums text-[color:var(--color-primary)] md:text-[26px]">
                  30k+
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  Universities
                </dt>
                <dd className="mt-1 font-heading text-[22px] font-semibold tabular-nums text-[color:var(--color-primary)] md:text-[26px]">
                  3
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  Spots
                </dt>
                <dd className="mt-1 font-heading text-[22px] font-semibold tabular-nums text-[color:var(--color-primary)] md:text-[26px]">
                  100
                </dd>
              </div>
            </dl>

            <p className="mt-6 max-w-[420px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              One island. One September. A group you will actually meet.
            </p>
            <p className="mt-3 max-w-[420px] text-[13px] leading-[1.55] text-[color:var(--color-fg-subtle)]">
              Next corridor. Announced when the first one ships.
            </p>

            <ul className="mt-8 flex flex-col gap-2">
              {PINS.map((p) => {
                const isActive = active === p.name;
                return (
                  <li key={p.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(p.name)}
                      onMouseLeave={() =>
                        setActive((cur) => (cur === p.name ? null : cur))
                      }
                      onFocus={() => setActive(p.name)}
                      onClick={() =>
                        setActive((cur) => (cur === p.name ? null : p.name))
                      }
                      aria-pressed={isActive}
                      aria-label={`${p.name}, ${p.city}. ${
                        loaded
                          ? counts[p.name] === 0
                            ? "Be the first to join"
                            : `${counts[p.name]} joined`
                          : "Loading"
                      }. Focus on map.`}
                      className={`group flex w-full items-center justify-between gap-3 rounded-[12px] border p-4 text-left transition-[border-color,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                        isActive
                          ? "border-[color:var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                          : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Mini electric-green pin mirrors the map marker so the
                            connection between card and pin is obvious. */}
                        <span
                          aria-hidden="true"
                          className={`relative flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-primary)] transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                            isActive ? "scale-110" : ""
                          }`}
                        >
                          <span className="block h-2 w-2 rounded-full bg-[color:var(--color-primary-fg)]" />
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-35"
                            />
                          )}
                        </span>
                        <div>
                          <p className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
                            {p.name}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[color:var(--color-fg-subtle)]">
                            {p.city} · {p.indianStudents}
                          </p>
                        </div>
                      </div>
                      <p className="font-mono text-[12px] tabular-nums text-[color:var(--color-fg-muted)]">
                        {loaded
                          ? counts[p.name] === 0
                            ? "Be the first"
                            : `${counts[p.name]} joined`
                          : "…"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              Tap a campus to focus the map →
            </p>

            <Link
              href="/how"
              className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]"
            >
              How verification works
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="md:col-span-7">
            <div className="relative overflow-hidden rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
              {/* Map header strip */}
              <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
                  />
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">
                    Ireland · Sept 2026
                  </p>
                </div>
                <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  53.4°N · 8.2°W
                </p>
              </div>

              <div className="relative h-[400px] w-full sm:h-[440px] md:h-[500px]">
                <svg
                  viewBox="10 25 300 470"
                  preserveAspectRatio="xMidYMid meet"
                  className="h-full w-full"
                  role="img"
                  aria-label="Map of Ireland showing UCD, Trinity College Dublin, and University College Cork"
                >
                  <title>Ireland. UCD · Trinity · UCC</title>

                  <defs>
                    <clipPath id="land-clip">
                      <path d={IRELAND_PATH} />
                    </clipPath>
                  </defs>

                  {/* Sea (board). Matches the site background so the map
                      reads as part of the surface, not a postcard. */}
                  <rect width="320" height="520" fill={MAP.sea} />

                  {/* Land fill - one shade lifted off the page. */}
                  <path d={IRELAND_PATH} fill={MAP.land} />

                  {/* Lakes - holes in the land. */}
                  <g aria-hidden="true" clipPath="url(#land-clip)">
                    {LAKES.map((l, i) => (
                      <ellipse
                        key={i}
                        cx={l.cx}
                        cy={l.cy}
                        rx={l.rx}
                        ry={l.ry}
                        fill={MAP.lake}
                      />
                    ))}
                  </g>

                  {/* Country label. Hairline wordmark behind everything. */}
                  <text
                    aria-hidden="true"
                    x="150"
                    y="320"
                    fontSize="22"
                    fontWeight="600"
                    fontFamily="var(--font-heading-family)"
                    fill={MAP.textSubtle}
                    letterSpacing="4"
                    opacity="0.6"
                  >
                    IRELAND
                  </text>

                  {/* Coastline - hairline outline, not dashed red. */}
                  <path
                    d={IRELAND_PATH}
                    fill="none"
                    stroke={MAP.coastline}
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />

                  {/* Northern Ireland border - kept as dashed hairline for
                      geographic correctness, but visually quiet. */}
                  <path
                    aria-hidden="true"
                    d={NI_BORDER}
                    fill="none"
                    stroke={MAP.niBorder}
                    strokeWidth="0.8"
                    strokeDasharray="2.4 1.8"
                    strokeLinecap="round"
                    opacity="0.7"
                  />

                  {/* City dots + labels. Tiny, subtle - context not content. */}
                  <g aria-hidden="true">
                    {CITIES.map((c) => (
                      <g key={c.name}>
                        <circle cx={c.cx} cy={c.cy} r="1.2" fill={MAP.textMuted} />
                        <text
                          x={c.cx + (c.dx ?? 0)}
                          y={c.cy + (c.dy ?? 0)}
                          fontSize={c.size ?? 8}
                          fontWeight={c.weight ?? 500}
                          fontFamily="var(--font-body)"
                          fill={MAP.textMuted}
                          textAnchor={c.anchor}
                        >
                          {c.name}
                        </text>
                      </g>
                    ))}
                  </g>

                  {/* Campus pins - two-layer: slow halo pulse + solid electric-green
                      pin. The only colour on the map. Tap/click toggles active. */}
                  {PINS.map((p, i) => {
                    const isActive = active === p.name;
                    /* Stagger pulse phase so the three pins don't strobe in sync. */
                    const pulseDelay = `${i * 0.8}s`;
                    return (
                      <g
                        key={`pulse-${p.name}`}
                        aria-hidden="true"
                        style={{ pointerEvents: "none" }}
                      >
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r="10"
                          fill={MAP.pin}
                          fillOpacity="0.22"
                        >
                          <animate
                            attributeName="r"
                            values="8;20;8"
                            dur="3s"
                            begin={pulseDelay}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="fill-opacity"
                            values="0.22;0;0.22"
                            dur="3s"
                            begin={pulseDelay}
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r={isActive ? 18 : 12}
                          fill={MAP.pin}
                          fillOpacity={isActive ? 0.18 : 0.1}
                          style={{
                            transition:
                              "r 220ms cubic-bezier(0.2,0.8,0.2,1), fill-opacity 220ms cubic-bezier(0.2,0.8,0.2,1)",
                          }}
                        />
                      </g>
                    );
                  })}
                  {PINS.map((p) => {
                    const isActive = active === p.name;
                    return (
                      <g
                        key={p.name}
                        role="button"
                        tabIndex={0}
                        aria-label={`${p.name} in ${p.city}`}
                        onClick={() =>
                          setActive((cur) => (cur === p.name ? null : p.name))
                        }
                        onMouseEnter={() => setActive(p.name)}
                        onFocus={() => setActive(p.name)}
                        style={{ cursor: "pointer", outline: "none" }}
                      >
                        {/* Outer electric-green ring (pin body) */}
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r={isActive ? 9 : 7}
                          fill={MAP.pin}
                          stroke={MAP.pinRing}
                          strokeWidth="2"
                          style={{
                            transition: "r 220ms cubic-bezier(0.2,0.8,0.2,1)",
                          }}
                        />
                        {/* Black inner dot */}
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r={isActive ? 3 : 2.4}
                          fill={MAP.pinCore}
                          style={{
                            transition: "r 220ms cubic-bezier(0.2,0.8,0.2,1)",
                          }}
                        />
                      </g>
                    );
                  })}

                  {/* Dublin. Neutral foreground label. */}
                  <g aria-hidden="true">
                    <text
                      x="268"
                      y="260"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="var(--font-body)"
                      fill="var(--color-fg)"
                    >
                      Dublin
                    </text>
                  </g>

                  {/* Cork. Neutral foreground label. */}
                  <g aria-hidden="true">
                    <text
                      x="152"
                      y="447"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="var(--font-body)"
                      fill="var(--color-fg)"
                    >
                      Cork
                    </text>
                  </g>

                  {/* Campus callout pill-labels. Hairline pill on the dark board
                      with electric-green text. No shadows - that fights minimal. */}
                  {(() => {
                    const LABELS = [
                      { pin: "Trinity", x: 288, y: 242, w: 32, lx1: 252, ly1: 265, lx2: 286, ly2: 242 },
                      { pin: "UCD",     x: 288, y: 282, w: 28, lx1: 254, ly1: 279, lx2: 286, ly2: 282 },
                      { pin: "UCC",     x: 104, y: 472, w: 28, lx1: 136, ly1: 442, lx2: 112, ly2: 470 },
                    ];
                    return (
                      <g aria-hidden="true">
                        {LABELS.map((l) => {
                          const isActive = active === l.pin;
                          return (
                            <g key={l.pin}>
                              {/* Leader line from pin to pill */}
                              <line
                                x1={l.lx1}
                                y1={l.ly1}
                                x2={l.lx2}
                                y2={l.ly2}
                                stroke={MAP.pin}
                                strokeWidth={isActive ? 1.2 : 0.8}
                                strokeLinecap="round"
                                opacity={isActive ? 0.9 : 0.55}
                                style={{
                                  transition:
                                    "stroke-width 200ms cubic-bezier(0.2,0.8,0.2,1), opacity 200ms cubic-bezier(0.2,0.8,0.2,1)",
                                }}
                              />
                              {/* Pill body - hairline on surface */}
                              <rect
                                x={l.x - l.w / 2}
                                y={l.y - 7}
                                width={l.w}
                                height="14"
                                rx="7"
                                fill={MAP.land}
                                stroke={MAP.pin}
                                strokeWidth={isActive ? 1.3 : 0.9}
                                style={{
                                  transition:
                                    "stroke-width 200ms cubic-bezier(0.2,0.8,0.2,1)",
                                }}
                              />
                              <text
                                x={l.x}
                                y={l.y + 3.2}
                                fontSize="9"
                                fontWeight="700"
                                fontFamily="var(--font-mono-family)"
                                fill={MAP.pin}
                                textAnchor="middle"
                                letterSpacing="0.4"
                              >
                                {l.pin}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>

                {activePin && (
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-elevated)] p-4 shadow-[var(--shadow-md)]">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)]"
                      >
                        <span className="block h-1 w-1 rounded-full bg-[color:var(--color-primary-fg)]" />
                      </span>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                        {activePin.name === "Trinity"
                          ? "Trinity College Dublin"
                          : activePin.name === "UCD"
                            ? "University College Dublin"
                            : "University College Cork"}
                      </p>
                    </div>
                    <p className="mt-2 font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
                      {activePin.indianStudents} Indian students
                    </p>
                    <p className="mt-1 text-[13px] text-[color:var(--color-fg-muted)]">
                      {activePin.note}
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                      {loaded
                        ? counts[activePin.name] === 0
                          ? "Be the first to join"
                          : `${counts[activePin.name]} joined for Sept 2026`
                        : "Loading group…"}
                    </p>
                  </div>
                )}
              </div>

              {/* Map footer. Minimal legend - pin + border only. */}
              <div className="flex items-center justify-between border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
                    Your campus
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <span className="inline-block h-0 w-3 border-t-[1px] border-[color:var(--color-border-strong)]" />
                    Coastline
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <span className="inline-block h-0 w-3 border-t-[1px] border-dashed border-[color:var(--color-border-strong)]" />
                    NI border
                  </span>
                </div>
                <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  Scale · 1:1,400k
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
