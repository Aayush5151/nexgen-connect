"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Navbar. Sticky, transparent at the top, switches to a blurred pane
 * once the user scrolls. In the mobile app-marketing era, the primary
 * CTA is a download link - we anchor it to #download so clicking from
 * any page jumps to the closing app-badge block.
 *
 * v12.2 nav trim:
 *   - Removed the CorridorClock pill. The live-time-and-weather widget
 *     next to "How it works" was reading as a loading artefact, not as
 *     a product signal - reviewers kept stalling on it. The corridor
 *     clock still exists as a shared component in case we want to use
 *     it elsewhere, but it is no longer part of the nav chrome.
 *   - Removed the "Founder" link. FounderSnippet lives near the foot
 *     of the landing page and the /founder route is still reachable
 *     from there, so the nav was double-promoting a single surface.
 *
 * v10 discoverability (kept): the "Campuses" flyout exposes the 7
 * university landing pages and both pre-arrival checklists so they are
 * not orphaned.
 *
 * Extras:
 *   - ESC closes both the mobile sheet and the Campuses flyout.
 *   - Click-outside closes the flyout.
 *   - On the landing page, an underline indicator slides under the
 *     currently-visible section link (IntersectionObserver).
 *   - Body scroll is locked while the mobile sheet is open.
 */

const NAV_LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/#parents", label: "For parents" },
] as const;

const IRELAND_CAMPUSES = [
  { href: "/trinity", label: "Trinity", sub: "Dublin" },
  { href: "/ucd", label: "UCD", sub: "Dublin" },
  { href: "/ucc", label: "UCC", sub: "Cork" },
] as const;

const GERMANY_CAMPUSES = [
  { href: "/tum", label: "TUM", sub: "Munich" },
  { href: "/lmu", label: "LMU", sub: "Munich" },
  { href: "/rwth-aachen", label: "RWTH", sub: "Aachen" },
  { href: "/humboldt", label: "Humboldt", sub: "Berlin" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [campusesOpen, setCampusesOpen] = useState(false);
  const pathname = usePathname();
  const flyoutRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet + flyout on route change + ESC. Lock body
  // scroll while the mobile sheet is open.
  useEffect(() => {
    setOpen(false);
    setCampusesOpen(false);
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

  // Flyout: ESC + click-outside close.
  useEffect(() => {
    if (!campusesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCampusesOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!flyoutRef.current) return;
      if (!flyoutRef.current.contains(e.target as Node)) setCampusesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [campusesOpen]);

  // Hover-intent: opens on mouseenter, closes 160ms after mouseleave so
  // diagonal travel from trigger to flyout doesn't accidentally close.
  const cancelHoverClose = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };
  const scheduleHoverClose = () => {
    cancelHoverClose();
    hoverTimeout.current = setTimeout(() => setCampusesOpen(false), 160);
  };

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
          {/* "How it works" first */}
          <Link
            href={NAV_LINKS[0].href}
            className={cn(
              "relative rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
              pathname === NAV_LINKS[0].href
                ? "text-[color:var(--color-fg)]"
                : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
            )}
          >
            {NAV_LINKS[0].label}
          </Link>

          {/* Campuses flyout trigger */}
          <div
            ref={flyoutRef}
            className="relative"
            onMouseEnter={() => {
              cancelHoverClose();
              setCampusesOpen(true);
            }}
            onMouseLeave={scheduleHoverClose}
          >
            <button
              type="button"
              aria-expanded={campusesOpen}
              aria-haspopup="menu"
              onClick={() => setCampusesOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                campusesOpen
                  ? "text-[color:var(--color-fg)]"
                  : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
              )}
            >
              Campuses
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  campusesOpen && "rotate-180",
                )}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {campusesOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                  className="absolute left-1/2 top-[calc(100%+8px)] z-50 w-[460px] -translate-x-1/2 overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45),0_0_0_1px_color-mix(in_srgb,var(--color-border)_40%,transparent)]"
                >
                  <div className="grid grid-cols-2 gap-0 divide-x divide-[color:var(--color-border)]">
                    <CampusColumn
                      label="Ireland · Sept 2026"
                      accent="live"
                      items={IRELAND_CAMPUSES}
                    />
                    <CampusColumn
                      label="Germany · Oct 2026"
                      accent="live"
                      items={GERMANY_CAMPUSES}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/40 px-4 py-3">
                    <Link
                      href="/checklist"
                      className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      Checklist · Ireland
                    </Link>
                    <Link
                      href="/checklist-germany"
                      className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      Checklist · Germany
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Remaining main links */}
          {NAV_LINKS.slice(1).map((link) => {
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

        {/* Mobile cluster: a compact download CTA + hamburger. The
            conversion brief requires a sticky header with a download
            button always visible; previously the CTA was only inside
            the collapsed menu, so on first paint a mobile visitor had
            to tap twice to reach a download path. The pill below trims
            "Get the app" to "Get app" so it fits beside the menu
            toggle at 375px without crowding the logo. */}
        <div className="flex items-center gap-1.5 md:hidden">
          <Link
            href={ctaHref}
            className="group inline-flex h-9 items-center justify-center overflow-hidden rounded-md bg-[color:var(--color-primary)] px-3 text-[12.5px] font-semibold text-[color:var(--color-primary-fg)] transition-[transform,background-color] duration-200 active:translate-y-px active:bg-[color:var(--color-primary-hover)]"
          >
            <span className="relative z-10">Get app</span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] md:hidden"
          >
            <div className="container-narrow flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto py-4">
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

              {/* Campuses section in mobile sheet - flat list, no nested
                  collapse, because the sheet is already scrollable. */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="mt-2 border-t border-[color:var(--color-border)] pt-3"
              >
                <p className="px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  Ireland · Sept 2026
                </p>
                <div className="mt-1 flex flex-col">
                  {IRELAND_CAMPUSES.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-[14px] text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
                    >
                      <span>{c.label}</span>
                      <span className="font-mono text-[10px] text-[color:var(--color-fg-subtle)]">
                        {c.sub}
                      </span>
                    </Link>
                  ))}
                </div>

                <p className="mt-3 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  Germany · Oct 2026
                </p>
                <div className="mt-1 flex flex-col">
                  {GERMANY_CAMPUSES.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-[14px] text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
                    >
                      <span>{c.label}</span>
                      <span className="font-mono text-[10px] text-[color:var(--color-fg-subtle)]">
                        {c.sub}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-1 border-t border-[color:var(--color-border)] pt-3">
                  <Link
                    href="/checklist"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-[14px] text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
                  >
                    Pre-arrival checklist · Ireland
                  </Link>
                  <Link
                    href="/checklist-germany"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-[14px] text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
                  >
                    Pre-arrival checklist · Germany
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-4"
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

/* ------------------------------------------------------------------ */
/* Internal component: one column of university links inside the      */
/* desktop Campuses flyout. Kept in this file (not exported) because  */
/* it only makes sense in the Navbar context.                         */
/* ------------------------------------------------------------------ */
function CampusColumn({
  label,
  accent,
  items,
}: {
  label: string;
  accent: "live" | "next";
  items: readonly { href: string; label: string; sub: string }[];
}) {
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-2 px-1">
        <span
          aria-hidden="true"
          className="relative inline-flex h-1.5 w-1.5"
        >
          {accent === "live" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)] opacity-70" />
          )}
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              accent === "live"
                ? "bg-[color:var(--color-primary)]"
                : "bg-[color:var(--color-fg-subtle)]",
            )}
          />
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
          {label}
        </p>
      </div>
      <ul className="mt-2 flex flex-col">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              role="menuitem"
              className="group/link flex flex-col rounded-md px-2 py-1.5 transition-colors hover:bg-[color:var(--color-surface-elevated)]"
            >
              <span className="text-[13px] font-semibold text-[color:var(--color-fg)] transition-colors group-hover/link:text-[color:var(--color-primary)]">
                {item.label}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                {item.sub}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
