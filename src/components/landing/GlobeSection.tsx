"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import createGlobe from "cobe";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * GlobeSection. A 3D interactive globe - the planet seen from space - with
 * a single pulsing marker over Dublin, Ireland. Built on `cobe` because it
 * renders dotted landmasses in pure canvas/WebGL, which matches our minimal
 * Linear-style design tokens better than a photorealistic satellite texture.
 *
 * Rotation spins slowly west-to-east. Users can drag to spin manually;
 * letting go resumes the auto-rotate.
 *
 * Marker colour is hard-coded to the site primary (#00DC82 → [0, 0.86, 0.51]
 * in 0-1 RGB) so the green pulse reads as "Ireland, next, now" without any
 * further styling on top.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

// Dublin - the singular marker on the globe.
const IRELAND_COORDS: [number, number] = [53.35, -6.26];

// Convert Ireland's longitude (-6.26°W) to radians and flip the sign so the
// globe lands with Ireland facing the camera on first paint.
const IRELAND_PHI = (-IRELAND_COORDS[1] * Math.PI) / 180;

export function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(IRELAND_PHI);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    const onResize = () => {
      if (canvasRef.current) width = canvasRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: IRELAND_PHI,
      theta: 0.28,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 16000,
      mapBrightness: 3.6,
      baseColor: [0.32, 0.32, 0.34],
      markerColor: [0, 0.86, 0.51],
      glowColor: [0.06, 0.26, 0.17],
      opacity: 0.96,
      markers: [{ location: IRELAND_COORDS, size: 0.12 }],
    });

    // Cobe v2 dropped the onRender callback - we drive frames ourselves.
    let rafId = 0;
    const tick = () => {
      if (pointerInteracting.current === null) {
        phiRef.current += 0.0016;
      }
      globe.update({
        phi: phiRef.current + pointerInteractionMovement.current,
        width: width * 2,
        height: width * 2,
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Small delay so the canvas fades in once the first frame is painted,
    // avoiding a harsh black square → dotted globe pop.
    const fadeTimer = window.setTimeout(() => setCanvasReady(true), 140);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(fadeTimer);
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-40">
      {/* Ambient radial glow - soft primary bleed behind the globe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 55% at 50% 58%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="container-narrow relative">
        {/* Heading block */}
        <div className="mx-auto max-w-[640px] text-center">
          <SectionLabel className="mx-auto">Phase 01 · The first corridor</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(32px, 7vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Starting with{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
              Ireland.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px] md:text-[17px]"
          >
            Every corridor, eventually. But we open one door at a time -
            because a verified group is only verified if it actually works,
            on the ground, on day one.
          </motion.p>
        </div>

        {/* Globe canvas wrapper */}
        <div className="relative mx-auto mt-12 sm:mt-16 md:mt-20">
          <div className="relative mx-auto aspect-square w-full max-w-[360px] sm:max-w-[480px] md:max-w-[600px]">
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                pointerInteracting.current =
                  e.clientX - pointerInteractionMovement.current;
                if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
              }}
              onPointerUp={() => {
                pointerInteracting.current = null;
                if (canvasRef.current) canvasRef.current.style.cursor = "grab";
              }}
              onPointerOut={() => {
                pointerInteracting.current = null;
                if (canvasRef.current) canvasRef.current.style.cursor = "grab";
              }}
              onMouseMove={(e) => {
                if (pointerInteracting.current !== null) {
                  const delta = e.clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta / 200;
                }
              }}
              onTouchMove={(e) => {
                if (pointerInteracting.current !== null && e.touches[0]) {
                  const delta = e.touches[0].clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta / 100;
                }
              }}
              style={{
                width: "100%",
                height: "100%",
                cursor: "grab",
                contain: "layout paint size",
                opacity: canvasReady ? 1 : 0,
                transition: "opacity 1s ease",
              }}
            />
          </div>

          {/* Coordinates stamp under the globe - reads as "this is real geography" */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:mt-8 sm:text-[11px]"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              </span>
              <span className="text-[color:var(--color-primary)]">Dublin</span>
            </span>
            <span aria-hidden="true" className="h-[1px] w-5 bg-[color:var(--color-border-strong)]" />
            <span>53.35°N</span>
            <span aria-hidden="true" className="h-[1px] w-5 bg-[color:var(--color-border-strong)]" />
            <span>6.26°W</span>
          </motion.div>

          {/* Quiet footnote - a single line that closes the section */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
            className="mx-auto mt-8 max-w-[460px] text-center font-serif italic text-[15px] leading-[1.45] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-10 sm:text-[17px]"
          >
            One small island. Ten verified friends. Then we spin it again.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
