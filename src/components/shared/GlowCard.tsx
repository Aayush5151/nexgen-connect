"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tilt?: boolean;
  tiltStrength?: number;
  gradientBorder?: boolean;
}

export function GlowCard({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.08)",
  tilt = true,
  tiltStrength = 8,
  gradientBorder = false,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 });
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setGlow({ x, y, opacity: 1 });

      if (tilt) {
        setTiltStyle({
          rotateX: ((y - centerY) / centerY) * -tiltStrength,
          rotateY: ((x - centerX) / centerX) * tiltStrength,
        });
      }
    },
    [tilt, tiltStrength],
  );

  const handleMouseLeave = useCallback(() => {
    setGlow((g) => ({ ...g, opacity: 0 }));
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-white transition-all duration-300 hover:shadow-premium-hover",
        gradientBorder && "gradient-border",
        className,
      )}
      style={{
        perspective: "1000px",
        transform: tilt
          ? `perspective(1000px) rotateX(${tiltStyle.rotateX}deg) rotateY(${tiltStyle.rotateY}deg) scale3d(${glow.opacity ? 1.02 : 1}, ${glow.opacity ? 1.02 : 1}, 1)`
          : undefined,
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease",
        willChange: "transform",
      }}
    >
      {/* Glow follow effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(400px circle at ${glow.x}px ${glow.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
      {/* Shine sweep on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(250px circle at ${glow.x}px ${glow.y}px, rgba(255,255,255,0.03), transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
