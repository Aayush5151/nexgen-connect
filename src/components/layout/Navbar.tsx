"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadModal } from "@/components/shared/DownloadModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020617]/80 backdrop-blur-xl border-b border-white/[0.04] shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <nav className="container-narrow flex h-[72px] items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex min-h-[44px] items-center gap-2.5" aria-label="NexGen Connect Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            N
          </div>
          <span className="text-[17px] font-bold tracking-tight text-[#F8FAFC]">
            NexGen <span className="font-extrabold">Connect</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-[#F8FAFC]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-[#3B82F6]"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center md:flex">
          <button
            onClick={() => {
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              if (isMobile) {
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                window.location.href = isIOS ? "https://apps.apple.com" : "https://play.google.com";
              } else {
                setDownloadOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:shadow-lg hover:shadow-[#3B82F6]/30 active:scale-[0.97] will-change-transform"
          >
            <Smartphone className="h-4 w-4" />
            Get the App
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-[#94A3B8] hover:text-[#F8FAFC] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/[0.04] bg-[#020617]/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-narrow flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-white"
                      : "text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-white/[0.04] pt-4">
                <a
                  href="#download"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Smartphone className="h-4 w-4" />
                  Get the App
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </header>
  );
}
