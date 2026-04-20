import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * PlayStoreBadge. Matches AppStoreBadge dimensions and shape so the two
 * sit equal-weighted side by side. The play triangle is a 4-colour
 * approximation of the Google Play logo.
 */
type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
};

export function PlayStoreBadge({
  href = "#",
  onClick,
  className,
  size = "md",
}: Props) {
  const sizes = {
    sm: { height: 44, padX: 14, gap: 10, iconSize: 20, small: 9, big: 15 },
    md: { height: 54, padX: 18, gap: 12, iconSize: 26, small: 10, big: 18 },
  }[size];

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Get it on Google Play"
      className={cn(
        "group inline-flex items-center rounded-[12px] border border-[color:var(--color-border-strong)] bg-black text-white transition-[transform,border-color] duration-[150ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-px hover:border-white/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]",
        className,
      )}
      style={{
        height: sizes.height,
        paddingLeft: sizes.padX,
        paddingRight: sizes.padX,
        gap: sizes.gap,
      }}
    >
      {/* Google Play 4-triangle approximation. */}
      <svg
        width={sizes.iconSize}
        height={sizes.iconSize}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="playTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00C4CC" />
            <stop offset="1" stopColor="#0085A1" />
          </linearGradient>
          <linearGradient id="playRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFD900" />
            <stop offset="1" stopColor="#FFB400" />
          </linearGradient>
          <linearGradient id="playBottom" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF3A2E" />
            <stop offset="1" stopColor="#E02E25" />
          </linearGradient>
          <linearGradient id="playLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00F076" />
            <stop offset="1" stopColor="#00B360" />
          </linearGradient>
        </defs>
        <path d="M3 2.5V21.5L13 12L3 2.5Z" fill="url(#playLeft)" />
        <path d="M3 2.5L13 12L17.2 7.9L5.6 1.4C4.8 0.95 3.8 1.5 3 2.5Z" fill="url(#playTop)" />
        <path d="M3 21.5L13 12L17.2 16.1L5.6 22.6C4.8 23.05 3.8 22.5 3 21.5Z" fill="url(#playBottom)" />
        <path d="M17.2 7.9L13 12L17.2 16.1L21.5 13.6C22.6 13 22.6 11 21.5 10.4L17.2 7.9Z" fill="url(#playRight)" />
      </svg>
      <span className="flex flex-col items-start leading-none">
        <span
          className="font-medium opacity-80"
          style={{ fontSize: sizes.small }}
        >
          GET IT ON
        </span>
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: sizes.big, marginTop: 2 }}
        >
          Google Play
        </span>
      </span>
    </Link>
  );
}
