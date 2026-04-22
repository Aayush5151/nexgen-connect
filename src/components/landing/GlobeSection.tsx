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
      className="relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px]"
      style={{
        background:
          "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 70%)",
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
            className="mx-auto mt-3 max-w-[420px] text-[13.5px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[14.5px]"
          >
            Ireland first &middot; September 2026.
          </motion.p>
        </div>

        {/* Centered globe - full visual weight, decorative altitude rings
            behind it, subtle inner bloom. No adjacent column of copy so
            the globe reads as a hero object, not a thumbnail next to a
            list. */}
        <div className="relative mx-auto mt-6 sm:mt-8">
          <div className="relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px]">
            {/* Decorative concentric rings - radar-style, suggest altitude
                and reach without adding copy. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute inset-[-6%] rounded-full border border-[color:var(--color-border)]/40" />
              <div className="absolute inset-[-14%] rounded-full border border-[color:var(--color-border)]/25" />
              <div className="absolute inset-[-24%] rounded-full border border-[color:var(--color-border)]/15" />
              <div className="absolute inset-[-36%] rounded-full border border-[color:var(--color-border)]/10" />
            </div>

            {/* Primary bloom tucked just behind the sphere so it feels
                lit from within, not floating in a void. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-8%] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 72%)",
              }}
            />

            <GlobeInner lat={IRELAND_LAT} lng={IRELAND_LNG} />

            {/* Floating "Dublin · Live" pin next to the globe so there's
                always a clear anchor even before the 3D scene loads. */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-full z-10 -translate-x-1/2 translate-y-[-10%] whitespace-nowrap rounded-full border border-[color:var(--color-primary)]/50 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)] shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
            >
              <span className="relative mr-1.5 inline-flex h-1.5 w-1.5 align-middle">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              </span>
              Dublin &middot; Live
            </div>
          </div>
        </div>

        {/* Corridor chip strip - one horizontal row of 5 chips. Accessible
            ordered list; visually tight; replaces the previous 5-card
            grid that was pushing the section past a single fold. */}
        <motion.ol
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
          className="mx-auto mt-8 flex max-w-[820px] flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-2.5"
        >
          {CORRIDORS.map((c) => {
            const isLive = c.status === "live";
            return (
              <li
                key={c.country}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                  isLive
                    ? "border-[color:var(--color-primary)]/55 bg-[color:color-mix(in_srgb,var(--color-primary)_9%,transparent)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-1.5 w-1.5"
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
                <span
                  className={`font-heading text-[12.5px] font-semibold leading-none ${
                    isLive
                      ? "text-[color:var(--color-primary)]"
                      : "text-[color:var(--color-fg)]"
                  }`}
                >
                  {c.country}
                </span>
                <span
                  className={`font-mono text-[9.5px] uppercase tracking-[0.1em] ${
                    isLive
                      ? "text-[color:var(--color-primary)]/75"
                      : "text-[color:var(--color-fg-subtle)]"
                  }`}
                >
                  {STATUS_LABEL[c.status]}
                </span>
              </li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
