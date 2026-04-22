"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import { CAMPUS_PINS, CORRIDORS } from "@/lib/corridors";

/**
 * GlobeInner. The actual three.js/WebGL surface. Lives in its own file
 * so GlobeSection can `next/dynamic` it behind `ssr: false`, which also
 * means ref-forwarding stays inside a single client boundary. Next.js 16
 * + Turbopack has been flaky about forwarding refs through a `dynamic()`
 * wrapped vendor component - wrapping our own component instead sidesteps
 * the problem entirely.
 *
 * v10: the globe now renders every live campus, not just one pin per
 * country. Dublin + Cork both show for Ireland; Munich + Aachen + Berlin
 * all show for Germany. The "primary" campus in each corridor keeps the
 * bright pulsing ring (so the viewer still has an obvious anchor); the
 * secondary campuses are quieter dots with their own labels so the map
 * reads as "Ireland (two cities) + Germany (three cities)", not a single
 * capital per corridor.
 *
 * Upcoming corridors (Netherlands, UK, Australia) continue to appear as
 * dim country-level dots so the reader sees where we're heading.
 *
 * Corridor data lives in `@/lib/corridors` (a plain TS file) so the
 * HTML roadmap list can import it without pulling react-globe.gl
 * into the server bundle (which touches `window` at module load time).
 */

const PRIMARY_HEX = "#00DC82";
const UPCOMING_HEX = "#8aa0b5";

type Props = {
  lat: number;
  lng: number;
};

type PointData = {
  lat: number;
  lng: number;
  size: number;
  tier: "anchor" | "secondary" | "upcoming";
};

type LabelData = {
  lat: number;
  lng: number;
  text: string;
  tier: "anchor" | "secondary" | "upcoming";
};

export default function GlobeInner({ lat, lng }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Observe the wrapper so the canvas follows the container on resize.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const size = Math.floor(Math.min(el.clientWidth, el.clientHeight));
      if (size > 0) setDimensions({ width: size, height: size });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Configure the globe once the ref populates. Poll because react-globe.gl
  // assigns the ref *after* the first paint.
  useEffect(() => {
    let stopped = false;
    const attempt = (): boolean => {
      const globe = globeRef.current;
      if (!globe) return false;
      try {
        const controls = globe.controls();
        if (!controls) return false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.rotateSpeed = 0.55;
        globe.pointOfView({ lat, lng, altitude: 2.2 }, 0);
        return true;
      } catch {
        return false;
      }
    };
    if (attempt()) return;
    const interval = window.setInterval(() => {
      if (stopped || attempt()) window.clearInterval(interval);
    }, 120);
    const timeout = window.setTimeout(() => {
      stopped = true;
      window.clearInterval(interval);
    }, 12000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [lat, lng]);

  // Rings only on the anchor city of each live corridor so the globe
  // doesn't over-pulse. Every other live campus is a bright dot without
  // a ring; upcoming corridors are dim dots with labels.
  const anchorPoints = CAMPUS_PINS.filter((c) => c.primary);
  const ringData = anchorPoints.map((c) => ({ lat: c.lat, lng: c.lng }));

  const livePoints: PointData[] = CAMPUS_PINS.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    size: c.primary ? 0.62 : 0.42,
    tier: c.primary ? "anchor" : "secondary",
  }));
  const upcomingPoints: PointData[] = CORRIDORS.filter(
    (c) => c.status !== "live",
  ).map((c) => ({
    lat: c.lat,
    lng: c.lng,
    size: 0.3,
    tier: "upcoming",
  }));
  const allPoints: PointData[] = [...livePoints, ...upcomingPoints];

  const liveLabels: LabelData[] = CAMPUS_PINS.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    text: c.city,
    tier: c.primary ? "anchor" : "secondary",
  }));
  const upcomingLabels: LabelData[] = CORRIDORS.filter(
    (c) => c.status !== "live",
  ).map((c) => ({
    lat: c.lat,
    lng: c.lng,
    text: c.country,
    tier: "upcoming",
  }));
  const labels: LabelData[] = [...liveLabels, ...upcomingLabels];

  return (
    <div
      ref={wrapperRef}
      aria-label="A 3D globe with five live launch campuses highlighted in Ireland (Dublin + Cork) and Germany (Munich + Aachen + Berlin), plus dimmer markers for upcoming corridors in the Netherlands, UK, and Australia"
      role="img"
      data-globe-cursor
      data-globe-lat={lat}
      data-globe-lng={lng}
      className="relative mx-auto aspect-square w-full max-w-[360px] sm:max-w-[480px] md:max-w-[640px] [&_canvas]:cursor-none"
      style={{ minHeight: 320 }}
    >
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/globe/earth-blue-marble.jpg"
        bumpImageUrl="/globe/earth-topology.png"
        showAtmosphere
        atmosphereColor="#7ab8ff"
        atmosphereAltitude={0.2}
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) =>
          (d as PointData).tier === "upcoming" ? UPCOMING_HEX : PRIMARY_HEX
        }
        pointAltitude={0.03}
        pointRadius={(d) => (d as PointData).size}
        pointResolution={24}
        ringsData={ringData}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => PRIMARY_HEX}
        ringMaxRadius={5}
        ringPropagationSpeed={1.6}
        ringRepeatPeriod={1200}
        ringAltitude={0.012}
        labelsData={labels}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelSize={(d) => {
          const t = (d as LabelData).tier;
          if (t === "anchor") return 0.9;
          if (t === "secondary") return 0.65;
          return 0.55;
        }}
        labelDotRadius={0}
        labelColor={(d) => {
          const t = (d as LabelData).tier;
          if (t === "anchor") return "#ffffff";
          if (t === "secondary") return "rgba(230,240,250,0.85)";
          return "rgba(220,230,240,0.55)";
        }}
        labelResolution={2}
        labelAltitude={0.015}
        labelIncludeDot={false}
        animateIn={false}
      />
    </div>
  );
}

// Color helpers reused by consumers that need to match the globe.
export { PRIMARY_HEX, UPCOMING_HEX };
