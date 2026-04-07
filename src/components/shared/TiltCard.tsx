"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltStrength?: number;
  glowColor?: string;
}

export function TiltCard({
  children,
  className,
  tiltStrength = 5,
  glowColor = "rgba(249, 97, 103, 0.12)",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setTilt({
      rotateX: (0.5 - y) * tiltStrength,
      rotateY: (x - 0.5) * tiltStrength,
    });
    setGlow({ x: x * 100, y: y * 100, opacity: 1 });
  }

  function handleMouseLeave() {
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlow((g) => ({ ...g, opacity: 0 }));
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={tilt}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-white transition-shadow duration-300 hover:shadow-premium-hover",
        className
      )}
    >
      {/* Spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(350px circle at ${glow.x}% ${glow.y}%, ${glowColor}, transparent 60%)`,
        }}
      />
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
}
