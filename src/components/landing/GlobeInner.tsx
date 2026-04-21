"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";

/**
 * GlobeInner. The actual three.js/WebGL surface. Lives in its own file
 * so GlobeSection can `next/dynamic` it behind `ssr: false`, which also
 * means ref-forwarding stays inside a single client boundary. Next.js 16
 * + Turbopack has been flaky about forwarding refs through a `dynamic()`
 * wrapped vendor component - wrapping our own component instead sidesteps
 * the problem entirely.
 */

const PRIMARY_HEX = "#00DC82";

type Props = {
  lat: number;
  lng: number;
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

  const markerData = [{ lat, lng, size: 0.55 }];
  const ringData = [{ lat, lng }];

  return (
    <div
      ref={wrapperRef}
      aria-label="An interactive 3D globe with Ireland highlighted"
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
    </div>
  );
}
