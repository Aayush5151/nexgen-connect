"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getMapBreakdownAction } from "@/app/actions/waitlist";
import type { MapCohortRow, University } from "@/lib/supabase/schema";

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
    name: "UCD",
    city: "Dublin",
    cx: 152,
    cy: 118,
    indianStudents: "~1,800/year",
    note: "Broadest city-of-origin mix in Ireland.",
  },
  {
    name: "Trinity",
    city: "Dublin",
    cx: 158,
    cy: 126,
    indianStudents: "~1,000/year",
    note: "Strongest Delhi and Bangalore pipeline.",
  },
  {
    name: "UCC",
    city: "Cork",
    cx: 98,
    cy: 220,
    indianStudents: "~500/year",
    note: "Fastest-growing CS and biotech intake.",
  },
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
            <SectionLabel>Three universities</SectionLabel>
            <h2 className="mt-4 font-heading text-[36px] font-semibold leading-[1.0] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[44px]">
              Three universities.
              <br />
              One island.
              <br />
              One intake.
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              We launch with UCD, Trinity, and UCC for September 2026. No
              fifty-country noise. Just Ireland. Just a cohort you will
              actually meet.
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
                  className={`flex cursor-default items-baseline justify-between py-4 outline-none transition-colors ${
                    active === p.name
                      ? "text-[color:var(--color-fg)]"
                      : ""
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
                        : `${counts[p.name]} reserved`
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
            <div className="relative flex aspect-[4/5] items-center justify-center rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:aspect-auto md:h-[560px]">
              <svg
                viewBox="0 0 240 300"
                className="h-full w-full"
                aria-label="Map of Ireland showing UCD, Trinity and UCC"
              >
                <title>Ireland — UCD · Trinity · UCC</title>

                <path
                  d="
                    M 80 18
                    C 100 10, 130 10, 155 18
                    C 175 26, 186 42, 192 62
                    C 198 78, 196 95, 200 112
                    C 206 126, 218 136, 216 152
                    C 214 172, 198 186, 194 206
                    C 190 222, 180 236, 170 252
                    C 158 268, 140 278, 118 282
                    C 96 286, 74 280, 56 270
                    C 38 258, 28 238, 24 218
                    C 20 194, 30 170, 28 148
                    C 26 128, 16 110, 22 92
                    C 28 72, 44 56, 58 42
                    C 66 32, 72 24, 80 18 Z
                  "
                  fill="color-mix(in oklch, var(--color-primary) 6%, transparent)"
                  stroke="var(--color-border-strong)"
                  strokeWidth="1.2"
                />

                {/* Animated flight paths from India (right edge) to each uni */}
                <g stroke="var(--color-border-strong)" strokeWidth="0.8" fill="none" opacity="0.55">
                  <path d="M 240 160 Q 200 150 158 126" strokeDasharray="2 3" />
                  <path d="M 240 190 Q 200 175 152 118" strokeDasharray="2 3" />
                  <path d="M 240 230 Q 190 225 98 220" strokeDasharray="2 3" />
                </g>

                {/* Pin halos */}
                {PINS.map((p) => (
                  <circle
                    key={`halo-${p.name}`}
                    cx={p.cx}
                    cy={p.cy}
                    r={active === p.name ? 18 : 12}
                    fill="color-mix(in oklch, var(--color-primary) 18%, transparent)"
                    style={{ transition: "r 200ms ease-out" }}
                  />
                ))}

                {/* Pin dots */}
                {PINS.map((p) => (
                  <g key={p.name}>
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={active === p.name ? 6 : 4.5}
                      fill="var(--color-primary)"
                      stroke="var(--color-bg)"
                      strokeWidth="2"
                      style={{ transition: "r 200ms ease-out" }}
                    />
                  </g>
                ))}

                <g>
                  <text
                    x="175"
                    y="110"
                    fontSize="10"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg)"
                    fontWeight="600"
                  >
                    DUBLIN
                  </text>
                  <text
                    x="175"
                    y="124"
                    fontSize="9"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg-muted)"
                  >
                    UCD · Trinity
                  </text>
                </g>
                <g>
                  <text
                    x="116"
                    y="226"
                    fontSize="10"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg)"
                    fontWeight="600"
                  >
                    CORK
                  </text>
                  <text
                    x="116"
                    y="240"
                    fontSize="9"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg-muted)"
                  >
                    UCC
                  </text>
                </g>
              </svg>

              {activePin && (
                <div className="pointer-events-none absolute bottom-6 left-6 right-6 rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-elevated)] p-4">
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
                        ? "Be the first to reserve"
                        : `${counts[activePin.name]} reserved for Sept 2026`
                      : "Loading cohort…"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
