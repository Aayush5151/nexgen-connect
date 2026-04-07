"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function InsightSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0C] py-20 md:py-32">
      {/* Decorative glow orbs - extremely subtle white */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B5BDB]/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 top-20 h-[300px] w-[300px] rounded-full bg-[#3B5BDB]/[0.04] blur-[80px]" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-[300px] w-[300px] rounded-full bg-[#3B5BDB]/[0.04] blur-[80px]" />

      <div className="container-narrow relative text-center">
        {/* Manifesto label */}
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#141416] px-5 py-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9CA3AF]">
              Our Manifesto
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="mx-auto mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#6B7280]">
            Familiarity Before Foreignness
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15} variant="blurIn">
          <blockquote className="mx-auto mt-8 max-w-4xl text-3xl font-black leading-snug text-[#E8E8ED] sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-tight">
            &ldquo;You don&apos;t just want to know people at your destination. You want to find
            people{" "}
            <span className="text-[#E8E8ED] italic underline decoration-[#3B5BDB]/40 underline-offset-4">
              from your city
            </span>{" "}
            going to the same place.&rdquo;
          </blockquote>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-xl text-lg font-medium text-[#9CA3AF] sm:text-xl">
            That&apos;s why we group by origin first.{" "}
            <span className="font-bold text-[#E8E8ED]">Mumbai &rarr; Germany.</span>{" "}
            <span className="text-[#6B7280]">Not just Germany.</span>
          </p>
        </ScrollReveal>

        {/* Concentric circles visualization */}
        <ScrollReveal delay={0.35}>
          <div className="mx-auto mt-16 flex items-center justify-center md:mt-20">
            <div className="relative h-72 w-72 sm:h-96 sm:w-96">
              {/* Level 4 - Outermost */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="group absolute inset-0 rounded-full border border-white/[0.06] transition-all duration-500 hover:border-[#3B5BDB]/40"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.06] bg-[#0A0A0C] px-3 py-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] sm:text-xs">
                  Destination City
                </span>
              </motion.div>

              {/* Level 3 */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="group absolute inset-[15%] rounded-full border border-white/[0.06] transition-all duration-500 hover:border-[#3B5BDB]/40"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.06] bg-[#0A0A0C] px-3 py-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] sm:text-xs">
                  India &rarr; Country
                </span>
              </motion.div>

              {/* Level 2 */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="group absolute inset-[30%] rounded-full border-2 border-[#3B5BDB]/20 transition-all duration-500 hover:border-[#3B5BDB]/40"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.06] bg-[#0A0A0C] px-3 py-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] sm:text-xs">
                  State &rarr; Country
                </span>
              </motion.div>

              {/* Level 1 - Innermost (the core) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="absolute inset-[42%] flex items-center justify-center rounded-full bg-[#3B5BDB] shadow-lg shadow-[#3B5BDB]/20"
              >
                <span className="relative text-xs font-extrabold tracking-wide text-white sm:text-sm">
                  City
                </span>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
