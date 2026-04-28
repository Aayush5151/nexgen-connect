"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * SocialChips. Every chip has a proper aria-label so screen readers
 * do not announce "# link". Until we spin up real handles, clicking
 * a chip fires a sonner toast explaining the status plus a soft scroll
 * to the download block so the tap still feels like it did something.
 */

type Social = {
  label: string;
  href: string;
  path: string;
  /**
   * Short one-liner shown in the toast when the real handle is live
   * and the user taps the chip. Keeps the toast specific per-network.
   */
  comingSoon: string;
};

// SVG `path` strings for each logo. All viewBox 0 0 24 24.
const SOCIALS: Social[] = [
  {
    label: "Instagram",
    href: "#",
    comingSoon: "Instagram opens with the app. Tap Download to be first in line.",
    path:
      "M12 2.2c3.2 0 3.6 0 4.8.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.4 1 .5.4.8.8 1 1.4.1.4.3 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c0 1.2-.3 1.8-.4 2.2-.2.6-.5 1-1 1.4-.4.5-.8.8-1.4 1-.4.1-1 .3-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2 0-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-1-.5-.4-.8-.8-1-1.4-.1-.4-.3-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c0-1.2.3-1.8.4-2.2.2-.6.5-1 1-1.4.4-.5.8-.8 1.4-1 .4-.1 1-.3 2.2-.4 1.2-.1 1.6-.1 4.8-.1M12 0C8.7 0 8.3 0 7.1.1 5.8.1 5 .3 4.2.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2c-.3.8-.5 1.6-.5 2.9C0 8.3 0 8.7 0 12s0 3.7.1 4.9c0 1.3.2 2.1.5 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.5C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c1.3 0 2.1-.2 2.9-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.5-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c0-1.3-.2-2.1-.5-2.9-.3-.8-.7-1.5-1.4-2.2C21.3 1.3 20.6.9 19.8.6c-.8-.3-1.6-.5-2.9-.5C15.7 0 15.3 0 12 0zm0 5.8A6.2 6.2 0 105.8 12 6.2 6.2 0 0012 5.8zm0 10.2A4 4 0 1116 12a4 4 0 01-4 4zm7.9-10.4a1.4 1.4 0 11-1.4-1.5 1.4 1.4 0 011.4 1.4z",
  },
  {
    label: "X",
    href: "#",
    comingSoon: "Our X handle lands with launch. Grab a seat on the waitlist.",
    path: "M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.9L4.8 22H1.6l8-9.2L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.7L6.4 3.9H4.6L17.7 20z",
  },
  {
    label: "LinkedIn",
    href: "#",
    comingSoon: "Company page goes live with launch. Join the waitlist meanwhile.",
    path:
      "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.75 1.75 0 01-1.75 1.75zM19 19h-3v-4.7c0-1.1-.4-1.8-1.4-1.8A1.55 1.55 0 0013.15 14V19h-3v-9h3v1.3a3 3 0 012.7-1.5c2 0 3.15 1.35 3.15 3.65z",
  },
  {
    label: "WhatsApp",
    href: "#",
    comingSoon: "WhatsApp support opens once the app ships. Waitlist gets priority.",
    path:
      "M17.6 14c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.2.3-.4.4-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4 0-.2-.2-.2-.5-.4zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.8L2 22l5.3-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.1c-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.1.8.8-3.1-.2-.3c-.7-1.2-1.2-2.7-1.2-4.2 0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2c0 4.6-3.7 8.1-8.2 8.1z",
  },
  {
    label: "YouTube",
    href: "#",
    comingSoon: "Videos drop closer to launch. Get on the list to see them first.",
    path:
      "M23.5 6.5a3 3 0 00-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 00.5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 002.1 2.1C4.4 20 12 20 12 20s7.6 0 9.4-.4a3 3 0 002.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5zM9.8 15.5v-7l6.2 3.5-6.2 3.5z",
  },
];

type Props = {
  className?: string;
  size?: "sm" | "md";
  tone?: "default" | "subtle";
};

function scrollToDownload() {
  if (typeof window === "undefined") return;
  const el = document.getElementById("download");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
}

export function SocialChips({
  className,
  size = "md",
  tone = "default",
}: Props) {
  const dim = size === "md" ? 40 : 34;
  const icon = size === "md" ? 18 : 15;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, s: Social) => {
      if (s.href === "#") {
        e.preventDefault();
        toast(`${s.label} is coming soon`, {
          description: s.comingSoon,
          action: {
            label: "Join waitlist",
            onClick: scrollToDownload,
          },
        });
      }
    },
    [],
  );

  return (
    <ul
      className={cn(
        "flex items-center gap-2",
        className,
      )}
    >
      {SOCIALS.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            onClick={(e) => handleClick(e, s)}
            aria-label={`${s.label} - coming soon, tap to join waitlist`}
            target={s.href === "#" ? undefined : "_blank"}
            rel={s.href === "#" ? undefined : "noreferrer noopener"}
            className={cn(
              "group inline-flex items-center justify-center rounded-full border transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]",
              tone === "default"
                ? "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-primary)]/50 hover:bg-[color:color-mix(in_srgb,var(--color-primary)_6%,transparent)] hover:text-[color:var(--color-fg)] hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                : "border-transparent text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]",
            )}
            style={{ height: dim, width: dim }}
          >
            <svg
              width={icon}
              height={icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:scale-110"
            >
              <path d={s.path} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
