"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * AppStoreBadge. Black pill with the Apple logo and two lines of copy,
 * matching the visual shape of the official "Download on the App Store"
 * badge without using the proprietary asset. Until we have a real App
 * Store URL, clicking fires a toast with an email-waitlist action so
 * the tap never feels dead.
 */
type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
};

function scrollToWaitlist() {
  if (typeof window === "undefined") return;
  const el = document.getElementById("download");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (href === "#") {
        e.preventDefault();
        toast("iOS app ships September 2026", {
          description:
            "We'll email you the App Store link the second it's live.",
          action: {
            label: "Join waitlist",
            onClick: scrollToWaitlist,
          },
        });
      }
      onClick?.();
    },
    [href, onClick],
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label="Download on the App Store - shipping September 2026"
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noreferrer noopener"}
      className={cn(
        "group inline-flex items-center rounded-[12px] border border-[color:var(--color-border-strong)] bg-black text-white transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform hover:-translate-y-0.5 hover:border-white/40 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]",
        className,
      )}
      style={{
        height: sizes.height,
        paddingLeft: sizes.padX,
        paddingRight: sizes.padX,
        gap: sizes.gap,
      }}
    >
      {/* Apple logo - manually-drawn approximation. */}
      <svg
        width={sizes.iconSize}
        height={sizes.iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
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
    </a>
  );
}
