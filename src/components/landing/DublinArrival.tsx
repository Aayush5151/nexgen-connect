"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * DublinArrival. A short, cinematic &ldquo;Day 1&rdquo; moment visualised as a
 * simulated arrivals board: flight status, gate, and a waving emoji
 * counter for the group. Sits after the VerificationTimeline to mark
 * the before/after of verification with a single concrete moment:
 * you walk out of customs and your group is already there.
 *
 * Personalisation:
 * If the visitor has already used FlightPreview or BoardingPass, we
 * pull their city + flight from localStorage and light up THAT row
 * specifically. Otherwise, a plausible default (EK 049 Delhi) plays
 * the role. The effect is a gentle, unmistakable &ldquo;this is you&rdquo;.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const STORAGE_KEY = "nx-flight-plan";

// Flight-code map for the most common cities - mirrors BoardingPass so
// the arrivals row and the ticket the visitor minted stay in sync.
const CITY_FLIGHT: Record<string, { iata: string; flight: string; time: string }> = {
  Mumbai: { iata: "BOM", flight: "EK 049", time: "06:20" },
  Delhi: { iata: "DEL", flight: "AI 111", time: "06:40" },
  Bangalore: { iata: "BLR", flight: "QR 601", time: "07:05" },
  Hyderabad: { iata: "HYD", flight: "EK 525", time: "07:20" },
  Chennai: { iata: "MAA", flight: "QR 531", time: "07:45" },
  Pune: { iata: "PNQ", flight: "LH 764", time: "08:05" },
  Kolkata: { iata: "CCU", flight: "QR 541", time: "08:25" },
  Ahmedabad: { iata: "AMD", flight: "EK 537", time: "08:40" },
  Chandigarh: { iata: "IXC", flight: "AI 149", time: "09:00" },
};

type Row = {
  code: string;
  from: string;
  gate: string;
  time: string;
  status: "boarding" | "arrived" | "scheduled";
  group?: number;
  highlight?: boolean;
  you?: boolean;
};

const DEFAULT_ROWS: Row[] = [
  { code: "EK 123", from: "Mumbai BOM", gate: "B12", time: "05:30", status: "scheduled" },
  {
    code: "AI 111",
    from: "Delhi DEL",
    gate: "42",
    time: "06:40",
    status: "arrived",
    group: 9,
    highlight: true,
  },
  { code: "LH 8826", from: "Frankfurt FRA", gate: "A17", time: "07:10", status: "boarding" },
  { code: "QR 017", from: "Bangalore BLR", gate: "B04", time: "08:45", status: "scheduled" },
];

type FlightPlan = {
  city?: string;
  iata?: string;
  intake?: string;
  flight?: string;
  gate?: string;
  group?: number;
  name?: string;
  ts?: number;
};

function buildPersonalizedRows(plan: FlightPlan): Row[] {
  const city = plan.city;
  if (!city) return DEFAULT_ROWS;
  const mapped = CITY_FLIGHT[city];
  if (!mapped) return DEFAULT_ROWS;

  const iata = plan.iata ?? mapped.iata;
  const code = plan.flight ?? mapped.flight;
  const gate = plan.gate ?? "42";
  const group = plan.group ?? 9;
  const time = mapped.time;

  // Keep one filler before and two after so the list still reads as a board.
  return [
    { code: "EK 123", from: "Mumbai BOM", gate: "B12", time: "05:30", status: "scheduled" },
    {
      code,
      from: `${city} ${iata}`,
      gate,
      time,
      status: "arrived",
      group,
      highlight: true,
      you: true,
    },
    { code: "LH 8826", from: "Frankfurt FRA", gate: "A17", time: "07:10", status: "boarding" },
    { code: "QR 017", from: "Bangalore BLR", gate: "B04", time: "08:45", status: "scheduled" },
  ];
}

export function DublinArrival() {
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [personalized, setPersonalized] = useState(false);

  // Pick up the visitor's flight plan if they made one earlier on the page.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const plan = JSON.parse(raw) as FlightPlan;
      const next = buildPersonalizedRows(plan);
      // Only flip to personalized if the plan actually resolved to a
      // real row - keeps the default board alive for visitors who
      // haven't touched FlightPreview or BoardingPass yet.
      if (next !== DEFAULT_ROWS) {
        setRows(next);
        setPersonalized(true);
      }
    } catch {
      // Malformed JSON - ignore, use defaults.
    }
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 55% at 50% 45%, color-mix(in srgb, var(--color-primary) 7%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">Day 1 · Dublin Airport</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            You land{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              into a group.
            </span>
          </motion.h2>
          {personalized && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
              className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]"
            >
              ✦ Showing your flight
            </motion.p>
          )}
        </div>

        {/* The board */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mx-auto mt-6 max-w-[920px] overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)] sm:mt-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              <Plane
                className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                strokeWidth={2}
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] sm:text-[11px]">
                DUB Arrivals · Terminal 1
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
              06:22 IST · Live
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[color:var(--color-border)] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:grid-cols-[1.3fr_1fr_auto_auto] sm:px-5 sm:text-[10px]">
            <p>Flight · From</p>
            <p className="hidden sm:block">Status</p>
            <p className="text-right">Gate</p>
            <p className="text-right">Group</p>
          </div>

          {/* Rows */}
          <ul>
            {rows.map((r, i) => (
              <motion.li
                key={`${r.code}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.1 + i * 0.08 }}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[color:var(--color-border)] px-4 py-3 sm:grid-cols-[1.3fr_1fr_auto_auto] sm:px-5 sm:py-4 ${
                  r.highlight
                    ? "bg-[color:color-mix(in_srgb,var(--color-primary)_6%,transparent)]"
                    : ""
                } ${i === rows.length - 1 ? "border-b-0" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <p
                      className={`font-heading text-[14px] font-semibold sm:text-[16px] ${
                        r.highlight
                          ? "text-[color:var(--color-primary)]"
                          : "text-[color:var(--color-fg)]"
                      }`}
                    >
                      {r.code}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)] sm:text-[11px]">
                      {r.from} · {r.time}
                    </p>
                  </div>
                  {r.you && (
                    <span className="rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                      You
                    </span>
                  )}
                </div>
                <p
                  className={`hidden font-mono text-[10px] uppercase tracking-[0.08em] sm:block sm:text-[11px] ${
                    r.status === "arrived"
                      ? "text-[color:var(--color-primary)]"
                      : r.status === "boarding"
                        ? "text-[color:var(--color-fg)]"
                        : "text-[color:var(--color-fg-muted)]"
                  }`}
                >
                  {r.status === "arrived" && (
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-primary)]" />
                  )}
                  {r.status}
                </p>
                <p
                  className={`text-right font-mono text-[13px] font-semibold tabular-nums sm:text-[14px] ${
                    r.highlight
                      ? "text-[color:var(--color-primary)]"
                      : "text-[color:var(--color-fg-muted)]"
                  }`}
                >
                  {r.gate}
                </p>
                <p className="text-right font-mono text-[12px] text-[color:var(--color-fg-muted)] sm:text-[13px]">
                  {r.group ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[color:var(--color-primary)] sm:text-[11px]">
                      <span className="text-[10px]">👋</span>
                      {r.group} waiting
                    </span>
                  ) : (
                    <span className="text-[color:var(--color-fg-subtle)]">—</span>
                  )}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
          className="mx-auto mt-6 max-w-[440px] text-center font-serif italic text-[15px] leading-[1.45] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-8 sm:text-[18px]"
        >
          Nobody should walk out of baggage claim alone.
        </motion.p>
      </div>
    </section>
  );
}
