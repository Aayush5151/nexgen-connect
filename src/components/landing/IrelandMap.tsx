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

/* Map palette. Emulates Google Maps "terrain" style. */
const MAP = {
  sea: "#AADAF0",
  seaDeep: "#8FC8E0",
  land: "#D6EBC9",
  landDark: "#B8DCA6",
  lake: "#A8D6EE",
  coastline: "#C73E2A",
  niBorder: "#8E2418",
  road: "#F7F3E8",
  roadStroke: "#D5CFB8",
  motorway: "#E8C978",
  motorwayStroke: "#B89C4E",
  text: "#1E3A2B",
  textMuted: "#4F6B58",
  park: "#A8D098",
  pin: "#2F5F1E",
  pinRing: "#F2F7EC",
};

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

/** Major inter-city roads. Drawn as soft curves under labels. */
const ROADS = [
  // Dublin → Belfast (M1)
  "M 250 270 Q 255 230 260 195 Q 265 160 267 130",
  // Dublin → Cork (M8/M7)
  "M 250 275 Q 220 305 200 340 Q 175 395 140 438",
  // Dublin → Galway (M6)
  "M 248 275 Q 200 275 160 278 Q 130 281 108 281",
  // Dublin → Waterford (M9)
  "M 252 280 Q 225 330 210 395",
  // Cork → Limerick (M20)
  "M 138 438 Q 132 395 128 352",
  // Galway → Limerick (M18)
  "M 108 285 Q 118 320 128 350",
  // Belfast → Derry (A6)
  "M 267 128 Q 235 110 200 88",
];

/** Motorway pills. Google Maps style gold badges. */
const MOTORWAYS = [
  { id: "M1",  cx: 259, cy: 235 },
  { id: "M7",  cx: 218, cy: 308 },
  { id: "M8",  cx: 158, cy: 408 },
  { id: "M6",  cx: 175, cy: 272 },
  { id: "M9",  cx: 230, cy: 360 },
  { id: "M18", cx: 108, cy: 318 },
];

/** Small darker-green "park/forest" patches for texture. */
const PARKS = [
  { cx: 70, cy: 435, rx: 14, ry: 10 },   // Killarney NP
  { cx: 260, cy: 300, rx: 10, ry: 12 },  // Wicklow Mts
  { cx: 135, cy: 215, rx: 10, ry: 8 },   // Ox Mountains
  { cx: 58, cy: 395, rx: 11, ry: 9 },    // Dingle
];

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
            <h2 className="mt-4 font-serif text-[48px] font-normal leading-[0.98] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[64px]">
              Why Ireland
              <br />
              <em className="italic text-[color:var(--color-fg-muted)]">first.</em>
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
              Next: UK · Canada · Australia · Germany · US.
            </p>

            <ul className="mt-8 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
              {PINS.map((p) => (
                <li
                  key={p.name}
                  onMouseEnter={() => setActive(p.name)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(p.name)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  aria-label={`${p.name}, ${p.city}. ${
                    loaded
                      ? counts[p.name] === 0
                        ? "Be the first to join"
                        : `${counts[p.name]} joined`
                      : "Loading"
                  }.`}
                  className={`flex cursor-default items-baseline justify-between py-4 outline-none transition-colors ${
                    active === p.name ? "text-[color:var(--color-fg)]" : ""
                  }`}
                >
                  <div>
                    <p className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[color:var(--color-fg-subtle)]">
                      {p.city} · {p.indianStudents}
                    </p>
                  </div>
                  <p className="font-mono text-[13px] tabular-nums text-[color:var(--color-fg-muted)]">
                    {loaded
                      ? counts[p.name] === 0
                        ? "Be the first"
                        : `${counts[p.name]} joined`
                      : "…"}
                  </p>
                </li>
              ))}
            </ul>

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

              <div className="relative aspect-[4/5] w-full md:aspect-[3/4]">
                <svg
                  viewBox="0 0 320 520"
                  className="h-full w-full"
                  role="img"
                  aria-label="Map of Ireland showing UCD, Trinity College Dublin, and University College Cork"
                >
                  <title>Ireland. UCD · Trinity · UCC</title>

                  <defs>
                    <linearGradient id="sea-g" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor={MAP.sea} />
                      <stop offset="1" stopColor={MAP.seaDeep} />
                    </linearGradient>
                    <clipPath id="land-clip">
                      <path d={IRELAND_PATH} />
                    </clipPath>
                  </defs>

                  {/* Sea */}
                  <rect width="320" height="520" fill="url(#sea-g)" />

                  {/* Land fill */}
                  <path d={IRELAND_PATH} fill={MAP.land} />

                  {/* Parks / forests. Clipped to land. */}
                  <g clipPath="url(#land-clip)" opacity="0.55">
                    {PARKS.map((p, i) => (
                      <ellipse
                        key={i}
                        cx={p.cx}
                        cy={p.cy}
                        rx={p.rx}
                        ry={p.ry}
                        fill={MAP.park}
                      />
                    ))}
                  </g>

                  {/* Roads. Clipped to land so they don't bleed into sea. */}
                  <g clipPath="url(#land-clip)" fill="none">
                    {ROADS.map((d, i) => (
                      <g key={i}>
                        <path d={d} stroke={MAP.roadStroke} strokeWidth="2.4" strokeLinecap="round" />
                        <path d={d} stroke={MAP.road} strokeWidth="1.6" strokeLinecap="round" />
                      </g>
                    ))}
                  </g>

                  {/* Lakes */}
                  <g aria-hidden="true">
                    {LAKES.map((l, i) => (
                      <ellipse
                        key={i}
                        cx={l.cx}
                        cy={l.cy}
                        rx={l.rx}
                        ry={l.ry}
                        fill={MAP.lake}
                        stroke={MAP.seaDeep}
                        strokeWidth="0.5"
                      />
                    ))}
                  </g>

                  {/* Country label. Big, centered. */}
                  <text
                    aria-hidden="true"
                    x="150"
                    y="320"
                    fontSize="20"
                    fontWeight="700"
                    fontFamily="var(--font-heading-family)"
                    fill={MAP.textMuted}
                    letterSpacing="3"
                    opacity="0.7"
                  >
                    IRELAND
                  </text>
                  <text
                    aria-hidden="true"
                    x="225"
                    y="148"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="var(--font-heading-family)"
                    fill={MAP.niBorder}
                    letterSpacing="1.4"
                    opacity="0.8"
                    textAnchor="middle"
                  >
                    NORTHERN
                  </text>
                  <text
                    aria-hidden="true"
                    x="225"
                    y="158"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="var(--font-heading-family)"
                    fill={MAP.niBorder}
                    letterSpacing="1.4"
                    opacity="0.8"
                    textAnchor="middle"
                  >
                    IRELAND
                  </text>

                  {/* Red-dotted coastline border (Google Maps country border style) */}
                  <path
                    d={IRELAND_PATH}
                    fill="none"
                    stroke={MAP.coastline}
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                    strokeDasharray="1.6 1.4"
                  />

                  {/* Northern Ireland border */}
                  <path
                    aria-hidden="true"
                    d={NI_BORDER}
                    fill="none"
                    stroke={MAP.niBorder}
                    strokeWidth="1.1"
                    strokeDasharray="2.4 1.6"
                    strokeLinecap="round"
                  />

                  {/* Motorway pills */}
                  <g aria-hidden="true">
                    {MOTORWAYS.map((m) => {
                      const w = m.id.length >= 3 ? 17 : 13;
                      return (
                        <g key={m.id}>
                          <rect
                            x={m.cx - w / 2}
                            y={m.cy - 5.5}
                            width={w}
                            height="10"
                            rx="5"
                            fill={MAP.motorway}
                            stroke={MAP.motorwayStroke}
                            strokeWidth="0.6"
                          />
                          <text
                            x={m.cx}
                            y={m.cy + 2.2}
                            fontSize="6.5"
                            fontWeight="700"
                            fontFamily="var(--font-mono-family)"
                            fill={MAP.text}
                            textAnchor="middle"
                          >
                            {m.id}
                          </text>
                        </g>
                      );
                    })}
                  </g>

                  {/* City dots + labels */}
                  <g aria-hidden="true">
                    {CITIES.map((c) => (
                      <g key={c.name}>
                        <circle cx={c.cx} cy={c.cy} r="1.7" fill={MAP.text} />
                        <circle cx={c.cx} cy={c.cy} r="0.8" fill={MAP.pinRing} />
                        <text
                          x={c.cx + (c.dx ?? 0)}
                          y={c.cy + (c.dy ?? 0)}
                          fontSize={c.size ?? 8}
                          fontWeight={c.weight ?? 500}
                          fontFamily="var(--font-body)"
                          fill={MAP.text}
                          textAnchor={c.anchor}
                        >
                          {c.name}
                        </text>
                      </g>
                    ))}
                  </g>

                  {/* Campus pins. Site's primary green, ring to pop on light-green land. */}
                  {PINS.map((p) => (
                    <circle
                      key={`halo-${p.name}`}
                      aria-hidden="true"
                      cx={p.cx}
                      cy={p.cy}
                      r={active === p.name ? 14 : 9}
                      fill={MAP.pin}
                      fillOpacity={active === p.name ? 0.22 : 0.14}
                      style={{ transition: "r 200ms ease-out, fill-opacity 200ms ease-out" }}
                    />
                  ))}
                  {PINS.map((p) => (
                    <g key={p.name} aria-hidden="true">
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={active === p.name ? 5.5 : 4.2}
                        fill={MAP.pin}
                        stroke={MAP.pinRing}
                        strokeWidth="1.6"
                        style={{ transition: "r 200ms ease-out" }}
                      />
                    </g>
                  ))}

                  {/* Dublin. Bold label anchored east of the pin cluster. */}
                  <g aria-hidden="true">
                    <text
                      x="268"
                      y="260"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="var(--font-body)"
                      fill={MAP.text}
                    >
                      Dublin
                    </text>
                  </g>

                  {/* Cork. Bold label south-east of its pin. */}
                  <g aria-hidden="true">
                    <text
                      x="152"
                      y="447"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="var(--font-body)"
                      fill={MAP.text}
                    >
                      Cork
                    </text>
                  </g>

                  {/* Campus callout labels. Thin leader lines, placed in the sea to avoid overlap. */}
                  <g aria-hidden="true" fontFamily="var(--font-mono-family)" fontSize="8" fill={MAP.pin}>
                    {/* Trinity → east into Irish Sea */}
                    <line x1="252" y1="265" x2="296" y2="245" stroke={MAP.pin} strokeWidth="0.6" opacity="0.6" />
                    <text x="296" y="242" fontWeight="700" textAnchor="start">
                      Trinity
                    </text>
                    {/* UCD → east into Irish Sea */}
                    <line x1="254" y1="279" x2="298" y2="285" stroke={MAP.pin} strokeWidth="0.6" opacity="0.6" />
                    <text x="298" y="282" fontWeight="700" textAnchor="start">
                      UCD
                    </text>
                    {/* UCC → south-west into Atlantic */}
                    <line x1="136" y1="442" x2="108" y2="478" stroke={MAP.pin} strokeWidth="0.6" opacity="0.6" />
                    <text x="108" y="488" fontWeight="700" textAnchor="start">
                      UCC
                    </text>
                  </g>
                </svg>

                {activePin && (
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-elevated)] p-4 shadow-[var(--shadow-md)]">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                      {activePin.name === "Trinity"
                        ? "Trinity College Dublin"
                        : activePin.name === "UCD"
                          ? "University College Dublin"
                          : "University College Cork"}
                    </p>
                    <p className="mt-1 font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
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

              {/* Map footer. Subtle attribution / scale info. */}
              <div className="flex items-center justify-between border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
                    Your campus
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <span className="inline-block h-0 w-3 border-t-[1.5px] border-dashed border-[#C73E2A]" />
                    Coastline
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <span className="inline-block h-0 w-3 border-t-[1.5px] border-dashed border-[#8E2418]" />
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
