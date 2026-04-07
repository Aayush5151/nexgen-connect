"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Users } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import {
  wordRevealContainer,
  wordRevealChild,
  heroTimeline,
  springBouncy,
} from "@/lib/motion";

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

  return (
    <section
      ref={sectionRef}
      className="relative -mt-[72px] min-h-screen overflow-hidden bg-[#0A0A0C]"
    >
      {/* ── Background ────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {/* Very subtle white glow */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6B35]/[0.05] blur-[150px]" />
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="container-narrow relative flex min-h-screen flex-col items-center justify-center pb-28 pt-36 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: heroTimeline.badge }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#141416] px-4 py-1.5 text-xs font-medium text-[#9CA3AF] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
            Trusted by 23,000+ verified students
          </span>
        </motion.div>

        {/* ── Headline (word-by-word reveal) ───────────────────── */}
        <motion.h1
          variants={wordRevealContainer}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: heroTimeline.headline }}
          className="mt-8 max-w-5xl text-[clamp(2.5rem,7vw,6rem)] font-black leading-[1.05] tracking-[-0.04em] text-[#E8E8ED]"
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

          {/* Line 2: "Before You Land" -- white italic */}
          {line2Words.map((word) => (
            <motion.span
              key={word}
              variants={wordRevealChild}
              className="mr-[0.25em] inline-block text-gradient-coral italic"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: heroTimeline.subtext, ease: "easeOut" }}
          className="mt-6 max-w-xl text-base leading-relaxed text-[#6B7280] sm:text-lg"
        >
          Show up to a new city with friends already waiting.
          Never land alone.
        </motion.p>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springBouncy, delay: heroTimeline.cta }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton
            href="#download"
            className="btn-shimmer group h-14 gap-2 bg-[#FF6B35] px-8 text-[15px] text-white shadow-xl shadow-[#FF6B35]/10 hover:shadow-2xl hover:shadow-[#FF6B35]/15"
          >
            <Smartphone className="h-4 w-4" />
            Download the App
          </MagneticButton>

          <MagneticButton
            href="/how-it-works"
            className="h-14 gap-2 border border-white/[0.08] bg-white/[0.03] px-8 text-[15px] text-[#9CA3AF] backdrop-blur-sm hover:border-[#FF6B35]/40 hover:text-[#E8E8ED] hover:bg-white/[0.06]"
            strength={0.2}
          >
            See How It Works
          </MagneticButton>
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: heroTimeline.counter }}
          className="mt-8 text-sm text-[#6B7280]"
        >
          <AnimatedCounter
            target={23847}
            suffix="+"
            className="font-semibold text-[#E8E8ED] tabular-nums"
            duration={2.5}
          />{" "}
          verified students and counting
        </motion.div>

        {/* Decorative line */}
        <div className="mx-auto mt-12 h-px w-32 bg-gradient-to-r from-transparent via-[#2A2A2E] to-transparent" />

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: heroTimeline.trustBadges }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
        >
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: heroTimeline.trustBadges + i * 0.1 }}
              className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#141416] px-4 py-2 text-[11px] font-medium text-[#9CA3AF] backdrop-blur-sm sm:text-xs"
            >
              <badge.icon className="h-3.5 w-3.5 text-[#FF6B35]" />
              {badge.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0C] to-transparent" />
    </section>
  );
}
