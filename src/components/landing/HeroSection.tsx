"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Users } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { DownloadModal } from "@/components/shared/DownloadModal";
import {
  wordRevealContainer,
  wordRevealChild,
  heroTimeline,
} from "@/lib/motion";

/* ───── Custom easing ──────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

/* ───── "Before You Land" variant with scale emphasis ──────────── */
const line2WordChild = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)", scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ───── Trust badges ────────────────────────────────────────────── */
const trustBadges = [
  { icon: ShieldCheck, label: "Government ID Verified" },
  { icon: Smartphone, label: "Phone Verified" },
  { icon: Users, label: "100% Real Students" },
];

/* ───── Headline words ──────────────────────────────────────────── */
const line1Words = ["Find", "Your", "People"];
const line2Words = ["Before", "You", "Land"];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [ctaGlow, setCtaGlow] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    const glowTimer = setTimeout(() => setCtaGlow(true), heroTimeline.cta * 1000 + 400);
    const fadeTimer = setTimeout(() => setCtaGlow(false), heroTimeline.cta * 1000 + 1200);
    return () => { clearTimeout(glowTimer); clearTimeout(fadeTimer); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-[72px] min-h-screen bg-[#020617]"
    >
      {/* ── Background ────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {/* Very subtle white glow */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.05] blur-[150px]" />
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="container-narrow relative flex min-h-screen flex-col items-center justify-center pb-28 pt-36 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease, delay: heroTimeline.badge }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#0F172A] px-4 py-1.5 text-xs font-medium text-[#94A3B8] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            23,000+ students already found their people
          </span>
        </motion.div>

        {/* SEO H1 — keyword-rich, visually hidden */}
        <h1 className="sr-only">
          NexGen Connect: Verified Student Network for Indians Moving Abroad. Find Roommates From Your City.
        </h1>

        {/* ── Visual headline (H2 for display) ───────────────────── */}
        <motion.h2
          role="presentation"
          variants={wordRevealContainer}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: heroTimeline.headline }}
          className="mt-8 max-w-5xl py-2 text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.2] tracking-[-0.03em] text-[#F8FAFC]"
        >
          {/* Line 1: "Find Your People" */}
          {line1Words.map((word) => (
            <motion.span
              key={word}
              variants={wordRevealChild}
              className="mr-[0.25em] inline-block"
            >
              {word}
            </motion.span>
          ))}

          <br />

          {/* Line 2: "Before You Land" -- white italic + scale emphasis */}
          {line2Words.map((word) => (
            <motion.span
              key={word}
              variants={line2WordChild}
              className="mr-[0.25em] inline-block px-[0.05em] text-gradient-coral italic"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease, delay: heroTimeline.subtext }}
          className="mt-6 max-w-[600px] text-center text-base leading-relaxed text-[#94A3B8] text-balance sm:text-lg"
        >
          Moving to a new country is terrifying
          <br className="hidden sm:inline" />
          {" "}when you don&apos;t know anyone.
          <br />
          We make sure you never have to do it alone.
        </motion.p>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease, delay: heroTimeline.cta }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton
            onClick={() => {
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              if (isMobile) {
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                window.location.href = isIOS ? "https://apps.apple.com" : "https://play.google.com";
              } else {
                setDownloadOpen(true);
              }
            }}
            className={`btn-shimmer group h-14 gap-2 bg-[#3B82F6] px-8 text-[15px] text-white shadow-xl shadow-[#3B82F6]/10 hover:scale-[1.04] active:scale-[0.97] transition-transform will-change-transform ${ctaGlow ? "shadow-[0_0_30px_rgba(59,130,246,0.5)]" : ""}`}
          >
            <Smartphone className="h-4 w-4" />
            Find Your People, Free
          </MagneticButton>

          <a href="#how-it-works" className="mt-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC] underline-offset-4 hover:underline">
            See how it works ↓
          </a>
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease, delay: heroTimeline.counter }}
          className="mt-8 text-sm text-[#94A3B8]"
        >
          <AnimatedCounter
            target={23000}
            suffix="+"
            className="font-semibold text-[#F8FAFC] tabular-nums"
            duration={2.5}
          />{" "}
          verified students across 65+ cities
        </motion.div>

        {/* Decorative line */}
        <div className="mx-auto mt-12 h-px w-32 bg-gradient-to-r from-transparent via-[#2A2A2E] to-transparent" />

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease, delay: heroTimeline.trustBadges }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
        >
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease, delay: heroTimeline.trustBadges + i * 0.09 }}
              className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#0F172A] px-4 py-2 text-[11px] font-medium text-[#94A3B8] backdrop-blur-sm sm:text-xs"
            >
              <badge.icon className="h-3.5 w-3.5 text-[#3B82F6]" />
              {badge.label}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: heroTimeline.trustBadges + 0.3, duration: 0.5 }}
          className="mt-6 text-[12px] text-[#94A3B8]"
        >
          Free to join. Your city &rarr; your destination &rarr; your people. &middot;{" "}
          <span className="text-[#94A3B8]">Already joined? Continue on your phone</span>
        </motion.p>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />

      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </section>
  );
}
