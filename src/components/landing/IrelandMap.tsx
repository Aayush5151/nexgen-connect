"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getMapBreakdownAction } from "@/app/actions/waitlist";
import type { MapCohortRow, University } from "@/lib/supabase/schema";

type Pin = {
  name: University;
  city: "Dublin" | "Cork";
  cx: number;
  cy: number;
};

const PINS: Pin[] = [
  { name: "UCD", city: "Dublin", cx: 152, cy: 118 },
  { name: "Trinity", city: "Dublin", cx: 158, cy: 126 },
  { name: "UCC", city: "Cork", cx: 98, cy: 220 },
];

export function IrelandMap() {
  const [counts, setCounts] = useState<Record<University, number>>({
    UCD: 0,
    Trinity: 0,
    UCC: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMapBreakdownAction().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        const next: Record<University, number> = {
          UCD: 0,
          Trinity: 0,
          UCC: 0,
        };
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

  const total = counts.UCD + counts.Trinity + counts.UCC;

  return (
    <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="container-narrow">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <SectionLabel>The three campuses</SectionLabel>
            <h2 className="mt-4 font-heading text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[44px]">
              Three universities. <br />
              One launch.
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              For September 2026, NexGen supports University College Dublin,
              Trinity College Dublin, and University College Cork. More
              universities open in summer 2027.
            </p>

            <ul className="mt-8 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
              {PINS.map((p) => (
                <li
                  key={p.name}
                  className="flex items-baseline justify-between py-4"
                >
                  <div>
                    <p className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[color:var(--color-fg-subtle)]">
                      {p.city}
                    </p>
                  </div>
                  <p className="font-mono text-[13px] tabular-nums text-[color:var(--color-fg-muted)]">
                    {loaded
                      ? counts[p.name] === 0
                        ? "Be the first"
                        : `${counts[p.name]} reserving`
                      : "…"}
                  </p>
                </li>
              ))}
            </ul>

            {loaded && total > 0 && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                {total} verified across Ireland
              </p>
            )}
          </div>

          <div className="md:col-span-7">
            <div className="flex aspect-[4/5] items-center justify-center rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:aspect-auto md:h-[520px]">
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

                {PINS.map((p) => (
                  <g key={p.name}>
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r="12"
                      fill="color-mix(in oklch, var(--color-primary) 18%, transparent)"
                    />
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r="4.5"
                      fill="var(--color-primary)"
                      stroke="var(--color-bg)"
                      strokeWidth="2"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
