"use client";

import { useEffect, useRef } from "react";

/**
 * CursorGlow. A soft radial highlight that follows the cursor inside
 * the parent element. Set the parent to `position: relative` and drop
 * this child in; it fills the container and picks up pointer moves on
 * the parent.
 *
 * Renders nothing on touch devices (matchMedia `pointer: fine`) so we
 * don't paint a useless 200KB blur on mobile.
 */
export function CursorGlow({
  size = 420,
  opacity = 0.12,
  color = "var(--color-primary)",
}: {
  size?: number;
  opacity?: number;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    // Only show on devices with a fine pointer.
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(pointer: fine)");
      if (!mq.matches) {
        el.style.display = "none";
        return;
      }
    }

    let rafId = 0;
    let targetX = -1000;
    let targetY = -1000;

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      if (!rafId) {
        rafId = requestAnimationFrame(paint);
      }
    };

    const onLeave = () => {
      targetX = -1000;
      targetY = -1000;
      if (!rafId) rafId = requestAnimationFrame(paint);
    };

    const paint = () => {
      rafId = 0;
      el.style.setProperty("--cursor-x", `${targetX}px`);
      el.style.setProperty("--cursor-y", `${targetY}px`);
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave);

    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(${size}px circle at var(--cursor-x, -1000px) var(--cursor-y, -1000px), color-mix(in srgb, ${color} ${Math.round(
          opacity * 100,
        )}%, transparent), transparent 70%)`,
        transition: "background 120ms linear",
      }}
    />
  );
}
