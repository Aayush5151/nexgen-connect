"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MagneticButton. Wraps any clickable content (usually a badge or CTA)
 * and applies a subtle "magnet" effect: as the cursor approaches, the
 * wrapped element gently translates toward it, snapping back on leave.
 *
 * Philosophy:
 *   - Motion stays under 8px of displacement so it reads as polish, not
 *     glitch. Rushing CTAs off the cursor looks broken on mobile.
 *   - Pointer events with pointerType !== "mouse" (touch, pen) are
 *     ignored. Magnetism feels wrong without a hovering cursor.
 *   - Spring dampening tuned to avoid overshoot in the resting position.
 *
 * Usage:
 *   <MagneticButton>
 *     <AppStoreBadge />
 *   </MagneticButton>
 */
type Props = {
  children: React.ReactNode;
  className?: string;
  /** Maximum pixel displacement on each axis. Default 8. */
  strength?: number;
  /** Additional scale on hover, default 1 (no scale change). */
  hoverScale?: number;
};

export function MagneticButton({
  children,
  className,
  strength = 8,
  hoverScale = 1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hovering, setHovering] = useState(false);

  const xSpring = useSpring(mouseX, { stiffness: 220, damping: 18, mass: 0.5 });
  const ySpring = useSpring(mouseY, { stiffness: 220, damping: 18, mass: 0.5 });

  const x = useTransform(xSpring, (v) => v * strength);
  const y = useTransform(ySpring, (v) => v * strength);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const relY = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    mouseX.set(Math.max(-1, Math.min(1, relX)));
    mouseY.set(Math.max(-1, Math.min(1, relY)));
  }

  function onPointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setHovering(false);
  }

  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    setHovering(true);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerEnter={onPointerEnter}
      style={{ x, y, scale: hovering ? hoverScale : 1 }}
      transition={{ scale: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
      className={cn("inline-block will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
