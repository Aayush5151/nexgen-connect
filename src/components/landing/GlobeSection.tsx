"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CORRIDORS } from "@/lib/corridors";

/**
 * GlobeSection. A photorealistic 3D Earth - NASA Blue Marble satellite
 * imagery, topology bump-mapping, an atmospheric halo, and a pulsing
 * primary-green ring over Dublin, the first live corridor. Upcoming
 * corridors (Netherlands, Germany, UK, Australia) show as dim markers
 * on the globe itself.
 *
 * Below the globe, a small roadmap grid repeats the list in plain HTML
 * so readers who can't see the 3D surface (screen readers, motion-
 * reduced users) still understand where we're heading.
 *
 * Why a separate inner component:
 * `react-globe.gl` uses WebGL and a forwarded ref. Next.js 16 + Turbopack
 * has been flaky when `next/dynamic` wraps a third-party forwardRef
 * component directly - refs intermittently don't populate and the
 * underlying canvas never appears. We dodge the class of problems by
 * dynamic-importing our own wrapper (`GlobeInner`) that owns the ref
 * internally. The Globe renders reliably; everything WebGL-touching
 * stays out of the server bundle.
 *
 * Behaviour:
 *   - auto-rotates slowly clockwise
 *   - drag to spin, release to resume auto-rotate
 *   - zoom/pan disabled so the section stays on-rail
 *   - initial camera pointed at Ireland, so first paint frames Europe
 */

const IRELAND_LAT = 53.35;
const IRELAND_LNG = -6.26;
const EASE = [0.2, 0.8, 0.2, 1] as const;

const STATUS_LABEL: Record<(typeof CORRIDORS)[number]["status"], string> = {
  live: "Live",
  next: "Next",
  soon: "Soon",
};

const GlobeInner = dynamic(() => import("./GlobeInner"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[400px] md:max-w-[520px]"
      style={{
        background:
          "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 70%)",
      }}
    />
  ),
});

export function GlobeSection() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
      {/* Ambient primary bloom behind the globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 55% at 50% 60%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />
      {/* Subtle star dust - lets the black bg feel like space, not a void */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.32) 1px, transparent 1.5px), radial-gradient(circle at 78% 22%, rgba(255,255,255,0.24) 1px, transparent 1.5px), radial-gradient(circle at 28% 74%, rgba(255,255,255,0.28) 1px, transparent 1.5px), radial-gradient(circle at 68% 66%, rgba(255,255,255,0.2) 1px, transparent 1.5px), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.14) 1px, transparent 1.5px)",
          backgroundSize: "420px 420px",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[640px] text-center">
          <SectionLabel className="mx-auto">The map</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5vw, 54px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            One corridor live.{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
              Four on the way.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px] md:text-[16px]"
          >
            We open one corridor at a time so each group actually works on
            day one. Ireland ships September 2026 - the rest follow, in
            order.
          </motion.p>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="relative mx-auto lg:col-span-6">
            <div className="mx-auto w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[380px]">
              <GlobeInner lat={IRELAND_LAT} lng={IRELAND_LNG} />
            </div>
          </div>

          {/* Corridor roadmap - same data as the globe pins, rendered as a
              proper accessible list so it reads in screen readers and when
              motion is reduced. On lg:+ it sits to the right of the globe
              as a single-column stack; below lg: it wraps to a 2/3-col
              grid beneath the globe. */}
          <motion.ol
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="mx-auto mt-6 grid max-w-[880px] grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:col-span-6 lg:mt-0 lg:grid-cols-1 lg:gap-2"
          >
          {CORRIDORS.map((c) => {
            const isLive = c.status === "live";
            return (
              <li
                key={c.country}
                className={`relative flex flex-col gap-2 rounded-[14px] border p-4 transition-colors ${
                  isLive
                    ? "border-[color:var(--color-primary)]/45 bg-[color:color-mix(in_srgb,var(--color-primary)_7%,transparent)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] ${
                      isLive
                        ? "text-[color:var(--color-primary)]"
                        : "text-[color:var(--color-fg-subtle)]"
                    }`}
                  >
                    {STATUS_LABEL[c.status]}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative flex h-1.5 w-1.5"
                  >
                    {isLive ? (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)] opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                      </>
                    ) : (
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-fg-subtle)]" />
                    )}
                  </span>
                </div>
                <p className="font-heading text-[15px] font-semibold leading-tight text-[color:var(--color-fg)]">
                  {c.country}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  {c.city} &middot; {c.note}
                </p>
              </li>
            );
          })}
          </motion.ol>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
          className="mx-auto mt-6 max-w-[520px] text-center font-serif italic text-[14px] leading-[1.45] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-8 sm:text-[16px]"
        >
          One island first. The rest when each one is ready to work on
          day one.
        </motion.p>
      </div>
    </section>
  );
}
