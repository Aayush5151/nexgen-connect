"use client";

import { useEffect, useRef, useState } from "react";

/**
 * GlobeCrosshair. Replaces the OS cursor with a small primary-green
 * crosshair + live latitude/longitude readout when the pointer enters
 * the target element. Pure presentation - a love-letter detail for the
 * reader who *is* hovering over the globe or a destination map
 * (Ireland, Germany, or wherever we light up next).
 *
 * How it works:
 *   Wrap the target in a container with `data-globe-cursor` attribute.
 *   This component mounts at the page root, listens for pointer events
 *   globally, and only renders when the pointer is inside an element
 *   carrying that data attribute. No pointer-capture, no cursor
 *   manipulation on children - just a layered HUD.
 *
 * Touch devices never see this - we gate on pointer:fine.
 */

type State = {
  visible: boolean;
  x: number;
  y: number;
  lat: number;
  lng: number;
};

// Rough conversion of viewport-relative position to a "virtual" lat/lng
// inside the target box. The readout is illustrative, not cartographic.
function toLatLng(
  x: number,
  y: number,
  box: DOMRect,
  baseLat: number,
  baseLng: number,
) {
  const nx = Math.max(0, Math.min(1, (x - box.left) / box.width));
  const ny = Math.max(0, Math.min(1, (y - box.top) / box.height));
  // Center is the destination pin (per data-globe-lat/lng on the target);
  // ±8° range in both axes. Default fallback is Dublin for historical reasons.
  const lat = baseLat + (0.5 - ny) * 16;
  const lng = baseLng + (nx - 0.5) * 16;
  return { lat, lng };
}

export function GlobeCrosshair() {
  const [state, setState] = useState<State>({
    visible: false,
    x: 0,
    y: 0,
    lat: 53.35,
    lng: -6.26,
  });
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(
        "[data-globe-cursor]",
      );
      if (!(target instanceof HTMLElement)) {
        if (state.visible)
          setState((s) => ({ ...s, visible: false }));
        targetRef.current = null;
        return;
      }
      targetRef.current = target;
      const box = target.getBoundingClientRect();
      const baseLat = Number(target.dataset.globeLat ?? 53.35);
      const baseLng = Number(target.dataset.globeLng ?? -6.26);
      const { lat, lng } = toLatLng(e.clientX, e.clientY, box, baseLat, baseLng);
      setState({ visible: true, x: e.clientX, y: e.clientY, lat, lng });
    };

    const onLeave = () => {
      setState((s) => ({ ...s, visible: false }));
      targetRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [state.visible]);

  if (!state.visible) return null;

  const sign = (v: number) => (v >= 0 ? "" : "-");
  const abs = (v: number) => Math.abs(v).toFixed(2);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[60]"
      style={{ left: state.x, top: state.y }}
    >
      {/* Crosshair */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <circle
          cx="24"
          cy="24"
          r="14"
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <circle
          cx="24"
          cy="24"
          r="3"
          fill="var(--color-primary)"
          fillOpacity="0.9"
        />
        <line x1="24" y1="4" x2="24" y2="14" stroke="var(--color-primary)" strokeWidth="1" />
        <line x1="24" y1="34" x2="24" y2="44" stroke="var(--color-primary)" strokeWidth="1" />
        <line x1="4" y1="24" x2="14" y2="24" stroke="var(--color-primary)" strokeWidth="1" />
        <line x1="34" y1="24" x2="44" y2="24" stroke="var(--color-primary)" strokeWidth="1" />
      </svg>

      {/* Coordinate readout - offset so it never sits under the pointer */}
      <div
        className="absolute whitespace-nowrap rounded-md border border-[color:var(--color-primary)]/40 bg-black/75 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-primary)] backdrop-blur"
        style={{
          transform: "translate(14px, 14px)",
        }}
      >
        {abs(state.lat)}°{sign(state.lat)}N · {abs(state.lng)}°
        {state.lng < 0 ? "W" : "E"}
      </div>
    </div>
  );
}
