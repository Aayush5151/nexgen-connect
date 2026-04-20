import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AppStoreBadge. Black pill with the Apple logo and two lines of copy,
 * matching the visual shape of the official "Download on the App Store"
 * badge without using the proprietary asset. Links to `#` until the
 * real App Store URL is swapped in.
 */
type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
};

export function AppStoreBadge({
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
      aria-label="Download on the App Store"
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
      {/* Apple logo — manually-drawn approximation. */}
      <svg
        width={sizes.iconSize}
        height={sizes.iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <span className="flex flex-col items-start leading-none">
        <span
          className="font-medium opacity-80"
          style={{ fontSize: sizes.small }}
        >
          Download on the
        </span>
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: sizes.big, marginTop: 2 }}
        >
          App Store
        </span>
      </span>
    </Link>
  );
}
