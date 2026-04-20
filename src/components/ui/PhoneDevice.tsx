import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PhoneDevice. A CSS-drawn iPhone 15 Pro frame that accepts any HTML
 * content as the "screen". Used by every phone mockup on the site so
 * bezel, corner radius, and Dynamic Island stay consistent.
 *
 * Rendering strategy:
 * - Outer frame is a div with a brushed-titanium feel (linear-gradient
 *   border + inner surface). No raster textures - everything scales.
 * - Dynamic Island is a pill positioned absolute at the top.
 * - The "screen" is a clipped container that parents render into. It
 *   has black background by default so any content reads crisp.
 *
 * Scale is controlled by the `width` prop. Height follows the real
 * iPhone aspect ratio (~19.5:9 ≈ 2.165:1). Pass `glow` for a soft
 * accent halo behind the device used in hero compositions.
 */
type Props = {
  children: ReactNode;
  width?: number;
  className?: string;
  glow?: boolean;
  /** When true, adds a faint reflection gradient on the glass. */
  reflection?: boolean;
};

export function PhoneDevice({
  children,
  width = 320,
  className,
  glow = false,
  reflection = true,
}: Props) {
  // 19.5:9 aspect ratio - matches iPhone 15 Pro hardware.
  const height = Math.round(width * 2.165);
  // Frame thickness and radii scale with width so the device looks
  // proportional at any size.
  const frameRadius = Math.round(width * 0.135);
  const screenRadius = Math.round(width * 0.11);
  const framePadding = Math.max(4, Math.round(width * 0.018));
  const islandWidth = Math.round(width * 0.34);
  const islandHeight = Math.round(width * 0.075);
  const islandTop = Math.round(width * 0.03);

  return (
    <div
      className={cn("relative inline-block", className)}
      style={{ width, height }}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-10 opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 30%, transparent) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Frame. Subtle metallic gradient for titanium feel. */}
      <div
        className="relative h-full w-full"
        style={{
          background:
            "linear-gradient(160deg, #2A2A2A 0%, #1A1A1A 40%, #0F0F0F 60%, #2A2A2A 100%)",
          borderRadius: frameRadius,
          padding: framePadding,
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.02) inset, 0 30px 60px -20px rgba(0,0,0,0.7)",
        }}
      >
        {/* Inner frame - deeper black to simulate the bezel shadow. */}
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{ borderRadius: screenRadius }}
        >
          {/* Screen content slot */}
          <div className="absolute inset-0">{children}</div>

          {/* Dynamic Island - always on top. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-black"
            style={{
              top: islandTop,
              width: islandWidth,
              height: islandHeight,
            }}
          />

          {/* Glass reflection - very subtle diagonal highlight. */}
          {reflection && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.03) 100%)",
              }}
            />
          )}
        </div>

        {/* Side buttons - right ring-silence, volume up/down, power. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[-3px] top-[22%] h-[48px] w-[3px] rounded-l-[2px]"
          style={{ background: "linear-gradient(to right, #0A0A0A, #2A2A2A)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[-3px] top-[34%] h-[70px] w-[3px] rounded-l-[2px]"
          style={{ background: "linear-gradient(to right, #0A0A0A, #2A2A2A)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[-3px] top-[46%] h-[70px] w-[3px] rounded-l-[2px]"
          style={{ background: "linear-gradient(to right, #0A0A0A, #2A2A2A)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-3px] top-[32%] h-[96px] w-[3px] rounded-r-[2px]"
          style={{ background: "linear-gradient(to left, #0A0A0A, #2A2A2A)" }}
        />
      </div>
    </div>
  );
}

/**
 * PhoneStatusBar. The tiny status row at the top of every mock screen:
 * time on the left, signal + wifi + battery on the right. Positioned
 * under the Dynamic Island with enough clearance that nothing overlaps.
 */
export function PhoneStatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-white">
      <span className="font-mono tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="currentColor" />
          <rect x="9" y="3" width="3" height="8" rx="0.5" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="currentColor" />
        </svg>
        {/* Wifi icon */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path
            d="M7.5 10.5L9 8.5C8.6 8.1 8.1 7.9 7.5 7.9C6.9 7.9 6.4 8.1 6 8.5L7.5 10.5Z"
            fill="currentColor"
          />
          <path
            d="M4.5 7C5.3 6.2 6.4 5.7 7.5 5.7C8.6 5.7 9.7 6.2 10.5 7L11.8 5.6C10.7 4.6 9.2 4 7.5 4C5.8 4 4.3 4.6 3.2 5.6L4.5 7Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M1.5 4C3.1 2.5 5.2 1.6 7.5 1.6C9.8 1.6 11.9 2.5 13.5 4L14.8 2.6C12.9 0.9 10.3 0 7.5 0C4.7 0 2.1 0.9 0.2 2.6L1.5 4Z"
            fill="currentColor"
            opacity="0.85"
          />
        </svg>
        {/* Battery */}
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="10"
            rx="2.5"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="19" height="7" rx="1.2" fill="currentColor" />
          <rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
