"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Navbar. Sticky, transparent at the top, switches to a blurred pane
 * once the user scrolls. In the mobile app-marketing era, the primary
 * CTA is a download link — we anchor it to #download so clicking from
 * any page jumps to the closing app-badge block.
 */

const NAV_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/founder", label: "Founder" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Always target the final-CTA "#download" anchor regardless of current page.
  const ctaHref = pathname === "/" ? "#download" : "/#download";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="container-narrow flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)]"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 9V3l8 6V3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>NexGen</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "text-[color:var(--color-fg)]"
                    : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={ctaHref}
            className="ml-2 inline-flex h-9 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
          >
            Get the app
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] md:hidden"
          >
            <div className="container-narrow flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-[14px] font-medium",
                    pathname === link.href
                      ? "text-[color:var(--color-fg)]"
                      : "text-[color:var(--color-fg-muted)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="mt-3 flex items-center justify-center rounded-md bg-[color:var(--color-primary)] px-4 py-2.5 text-[14px] font-semibold text-[color:var(--color-primary-fg)]"
              >
                Get the app
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
