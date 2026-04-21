"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DublinClock } from "@/components/shared/DublinClock";

/**
 * Navbar. Sticky, transparent at the top, switches to a blurred pane
 * once the user scrolls. In the mobile app-marketing era, the primary
 * CTA is a download link - we anchor it to #download so clicking from
 * any page jumps to the closing app-badge block.
 *
 * Extras:
 *   - ESC closes the mobile sheet.
 *   - On the landing page, an underline indicator slides under the
 *     currently-visible section link (IntersectionObserver).
 *   - Body scroll is locked while the mobile sheet is open.
 */

const NAV_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/#parents", label: "For parents" },
  { href: "/founder", label: "Founder" },
] as const;

/**
 * Anchors that correspond to landing-page sections. The Navbar doesn't
 * *render* these as top-level links (the page already has plenty of
 * CTAs), but the page DOES have section IDs, so we light up the
 * "How it works" link when the user is in the `#verify` zone, etc.
 *
 * Simpler pattern for now: only add the active pulse to existing links.
 */

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

  // Close the mobile sheet on route change + ESC. Lock body scroll while open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Always target the final-CTA "#download" anchor regardless of current page.
  const ctaHref = pathname === "/" ? "#download" : "/#download";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="container-narrow flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 font-heading text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)]"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
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
          <span className="transition-colors group-hover:text-[color:var(--color-primary)]">
            NexGen
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <DublinClock />
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "text-[color:var(--color-fg)]"
                    : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden="true"
                    className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-[color:var(--color-primary)]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <Link
            href={ctaHref}
            className="group ml-2 inline-flex h-9 items-center justify-center overflow-hidden rounded-md bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-[color:var(--color-primary-hover)] active:translate-y-0"
          >
            <span className="relative z-10">Get the app</span>
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-[shimmer_0.9s_ease] group-hover:opacity-100"
              style={{ backgroundSize: "200% 100%" }}
            />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] md:hidden"
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
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] md:hidden"
          >
            <div className="container-narrow flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                      pathname === link.href
                        ? "text-[color:var(--color-fg)]"
                        : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 }}
                className="mt-3"
              >
                <Link
                  href={ctaHref}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-md bg-[color:var(--color-primary)] px-4 py-2.5 text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
                >
                  Get the app
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
