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
    cx: 196,
    cy: 146,
    indianStudents: "~1,800/year",
    note: "Broadest city-of-origin mix in Ireland.",
  },
  {
    name: "Trinity",
    city: "Dublin",
    cx: 198,
    cy: 135,
    indianStudents: "~1,000/year",
    note: "Strongest Delhi and Bangalore pipeline.",
  },
  {
    name: "UCC",
    city: "Cork",
    cx: 92,
    cy: 230,
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
            <div className="relative flex aspect-[4/5] items-center justify-center rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:aspect-auto md:h-[560px]">
              <svg
                viewBox="0 0 240 300"
                className="h-full w-full"
                role="img"
                aria-label="Map of Ireland showing UCD, Trinity College Dublin, and University College Cork with travel paths from India"
              >
                <title>Ireland. UCD · Trinity · UCC</title>

                <path
                  aria-hidden="true"
                  d="
                    M 134 12
                    L 146 20
                    L 166 18
                    L 184 24
                    L 200 34
                    L 208 46
                    L 202 56
                    L 194 64
                    L 198 74
                    L 210 82
                    L 214 96
                    L 214 110
                    L 210 124
                    L 204 138
                    L 206 152
                    L 208 168
                    L 206 184
                    L 200 200
                    L 192 216
                    L 178 228
                    L 160 236
                    L 138 242
                    L 114 244
                    L 90 240
                    L 72 232
                    L 54 222
                    L 38 212
                    L 20 204
                    L 14 198
                    L 22 192
                    L 36 194
                    L 44 200
                    L 34 184
                    L 22 170
                    L 18 158
                    L 28 160
                    L 40 172
                    L 48 178
                    L 38 156
                    L 24 142
                    L 14 128
                    L 22 120
                    L 38 130
                    L 30 114
                    L 16 102
                    L 14 88
                    L 20 72
                    L 28 58
                    L 44 46
                    L 64 38
                    L 84 30
                    L 104 24
                    L 118 20
                    L 128 16
                    L 134 12 Z
                  "
                  fill="color-mix(in oklch, var(--color-primary) 10%, transparent)"
                  stroke="var(--color-border-strong)"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />

                {/* Animated flight paths from India (right edge) to each uni */}
                <g aria-hidden="true" stroke="var(--color-border-strong)" strokeWidth="0.8" fill="none" opacity="0.55">
                  <path d="M 240 150 Q 218 142 198 135" strokeDasharray="2 3" />
                  <path d="M 240 165 Q 218 150 196 146" strokeDasharray="2 3" />
                  <path d="M 240 220 Q 170 232 92 230" strokeDasharray="2 3" />
                </g>

                {/* Pin halos */}
                {PINS.map((p) => (
                  <circle
                    key={`halo-${p.name}`}
                    aria-hidden="true"
                    cx={p.cx}
                    cy={p.cy}
                    r={active === p.name ? 18 : 12}
                    fill="color-mix(in oklch, var(--color-primary) 18%, transparent)"
                    style={{ transition: "r 200ms ease-out" }}
                  />
                ))}

                {/* Pin dots */}
                {PINS.map((p) => (
                  <g key={p.name} aria-hidden="true">
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

                <g aria-hidden="true">
                  <text
                    x="138"
                    y="128"
                    fontSize="10"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg)"
                    fontWeight="600"
                    letterSpacing="0.5"
                  >
                    DUBLIN
                  </text>
                  <text
                    x="138"
                    y="141"
                    fontSize="8.5"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg-muted)"
                  >
                    UCD · Trinity
                  </text>
                </g>
                <g aria-hidden="true">
                  <text
                    x="112"
                    y="212"
                    fontSize="10"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg)"
                    fontWeight="600"
                    letterSpacing="0.5"
                  >
                    CORK
                  </text>
                  <text
                    x="112"
                    y="224"
                    fontSize="8.5"
                    fontFamily="var(--font-mono-family)"
                    fill="var(--color-fg-muted)"
                  >
                    UCC
                  </text>
                </g>

                <g aria-hidden="true" fontFamily="var(--font-mono-family)" fill="var(--color-fg-subtle)" fontSize="7" opacity="0.6">
                  <text x="38" y="32">ATLANTIC</text>
                  <text x="216" y="108">IRISH SEA</text>
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
                        ? "Be the first to join"
                        : `${counts[activePin.name]} joined for Sept 2026`
                      : "Loading group…"}
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
