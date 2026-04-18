"use client";

import { useReducedMotion } from "framer-motion";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 30,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  const prefersReducedMotion = useReducedMotion();
  const duration = `${speed}s`;

  return (
    <div
      className={`group relative flex overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className={`flex min-w-full shrink-0 items-center gap-6 ${
          prefersReducedMotion ? "" : "animate-marquee"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: duration }}
      >
        {children}
      </div>
      <div
        className={`flex min-w-full shrink-0 items-center gap-6 ${
          prefersReducedMotion ? "hidden" : "animate-marquee"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: duration }}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
