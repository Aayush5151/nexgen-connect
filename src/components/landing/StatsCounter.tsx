"use client";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const stats = [
  {
    target: 23847,
    suffix: "+",
    label: "Verified Students",
  },
  {
    target: 18,
    suffix: "",
    label: "Countries Covered",
  },
  {
    target: 65,
    suffix: "+",
    label: "Indian Cities",
  },
  {
    target: 100,
    suffix: "%",
    label: "Government-Verified",
  },
];

export function StatsCounter() {
  return (
    <section className="border-y border-white/[0.06] bg-[#020617] py-14 md:py-20">
      <div className="container-narrow relative">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className={`flex flex-col items-center text-center ${i < stats.length - 1 ? "md:border-r md:border-white/[0.04]" : ""}`}>
                {/* Number */}
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  className="text-4xl font-black text-[#F8FAFC] sm:text-5xl"
                  duration={2}
                />

                {/* Label */}
                <p className="mt-2 text-sm font-semibold text-[#94A3B8]">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
