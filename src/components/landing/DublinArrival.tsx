"use client";

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
 * No real flight data. The board is a pure typographic stage.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Row = {
  code: string;
  from: string;
  gate: string;
  time: string;
  status: "boarding" | "arrived" | "scheduled";
  group?: number;
  highlight?: boolean;
};

const ROWS: Row[] = [
  { code: "EK 123", from: "Mumbai BOM", gate: "B12", time: "05:30", status: "scheduled" },
  {
    code: "EK 049",
    from: "Delhi DEL",
    gate: "42",
    time: "06:20",
    status: "arrived",
    group: 9,
    highlight: true,
  },
  { code: "LH 8826", from: "Frankfurt FRA", gate: "A17", time: "07:10", status: "boarding" },
  { code: "QR 017", from: "Bangalore BLR", gate: "B04", time: "08:45", status: "scheduled" },
];

export function DublinArrival() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
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
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            You land{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              into a group.
            </span>
          </motion.h2>
        </div>

        {/* The board */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mx-auto mt-10 max-w-[920px] overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)] sm:mt-12"
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
            {ROWS.map((r, i) => (
              <motion.li
                key={r.code}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.1 + i * 0.08 }}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[color:var(--color-border)] px-4 py-3 sm:grid-cols-[1.3fr_1fr_auto_auto] sm:px-5 sm:py-4 ${
                  r.highlight
                    ? "bg-[color:color-mix(in_srgb,var(--color-primary)_6%,transparent)]"
                    : ""
                } ${i === ROWS.length - 1 ? "border-b-0" : ""}`}
              >
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
          className="mx-auto mt-10 max-w-[440px] text-center font-serif italic text-[17px] leading-[1.45] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-12 sm:text-[20px]"
        >
          Nobody should walk out of baggage claim alone.
        </motion.p>
      </div>
    </section>
  );
}
