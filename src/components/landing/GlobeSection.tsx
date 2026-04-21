"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { GlobeMethods } from "react-globe.gl";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * GlobeSection. A photorealistic 3D Earth - NASA Blue Marble satellite
 * imagery, topology bump-mapping, an atmospheric halo, and a single
 * pulsing primary-green ring over Dublin. Built on react-globe.gl
 * (three.js under the hood) and dynamically imported so none of the
 * WebGL bundle is shipped in the initial payload.
 *
 * Behaviour:
 *   - auto-rotates slowly clockwise
 *   - drag to spin, release to resume auto-rotate
 *   - zoom/pan disabled so the section stays on-rail
 *   - initial camera pointed at Ireland, so first paint frames Europe
 *
 * Textures are pulled from unpkg's three-globe mirror - the same CDN
 * used by the official react-globe.gl examples. Long-term we may want
 * to self-host these for cache control, but unpkg is stable enough for
 * the launch window.
 */

// Dublin - our one visible marker.
const IRELAND_LAT = 53.35;
const IRELAND_LNG = -6.26;

// Brand primary - tinted green that pulses over Ireland.
const PRIMARY_HEX = "#00DC82";
const EASE = [0.2, 0.8, 0.2, 1] as const;

// react-globe.gl uses WebGL and a bunch of three.js internals that touch
// `window`, so we must defer the import to the client.
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export function GlobeSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  // Size the globe to its square wrapper. ResizeObserver so rotating a
  // phone or resizing a desktop window keeps the globe crisp.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const size = Math.floor(Math.min(el.clientWidth, el.clientHeight));
      setDimensions({ width: size, height: size });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleGlobeReady = () => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    // Slow, meditative spin - fast rotation feels like a toy.
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.55;

    // Land the camera framed on Ireland with a slight pull-back so the
    // Atlantic and part of Europe are visible on first paint.
    globe.pointOfView(
      { lat: IRELAND_LAT, lng: IRELAND_LNG, altitude: 2.2 },
      0,
    );

    // Fade the canvas in after the first textured frame.
    window.setTimeout(() => setReady(true), 220);
  };

  const markerData = [{ lat: IRELAND_LAT, lng: IRELAND_LNG, size: 0.55 }];
  const ringData = [{ lat: IRELAND_LAT, lng: IRELAND_LNG }];

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-40">
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

        {/* Globe + stamp */}
        <div className="relative mx-auto mt-12 sm:mt-16 md:mt-20">
          <div
            ref={wrapperRef}
            aria-label="An interactive 3D globe with Ireland highlighted"
            role="img"
            className="relative mx-auto aspect-square w-full max-w-[360px] sm:max-w-[480px] md:max-w-[640px]"
            style={{
              opacity: ready ? 1 : 0,
              transition: "opacity 1.1s ease",
            }}
          >
            {dimensions.width > 0 && (
              <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                showAtmosphere
                atmosphereColor="#7ab8ff"
                atmosphereAltitude={0.2}
                onGlobeReady={handleGlobeReady}
                pointsData={markerData}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => PRIMARY_HEX}
                pointAltitude={0.03}
                pointRadius={0.55}
                pointResolution={24}
                ringsData={ringData}
                ringLat="lat"
                ringLng="lng"
                ringColor={() => PRIMARY_HEX}
                ringMaxRadius={5}
                ringPropagationSpeed={1.6}
                ringRepeatPeriod={1200}
                ringAltitude={0.012}
                animateIn={false}
              />
            )}
          </div>

          {/* Coordinates stamp */}
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

          {/* Closing thought */}
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
