"use client";

interface SectionDividerProps {
  from?: string;
  to?: string;
  variant?: "wave" | "curve" | "slant";
  flip?: boolean;
  className?: string;
}

export function SectionDivider({
  from = "#ffffff",
  to = "#F8FAFC",
  variant = "wave",
  flip = false,
  className = "",
}: SectionDividerProps) {
  const paths = {
    wave: "M0,64 C320,128 640,0 960,64 C1280,128 1440,32 1440,32 L1440,0 L0,0 Z",
    curve: "M0,96 Q720,0 1440,96 L1440,0 L0,0 Z",
    slant: "M0,64 L1440,0 L1440,0 L0,0 Z",
  };

  return (
    <div
      className={`relative -mt-px overflow-hidden ${flip ? "rotate-180" : ""} ${className}`}
      style={{ background: to }}
    >
      <svg
        viewBox="0 0 1440 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        preserveAspectRatio="none"
        style={{ height: "clamp(40px, 6vw, 96px)" }}
      >
        <path d={paths[variant]} fill={from} />
      </svg>
    </div>
  );
}
