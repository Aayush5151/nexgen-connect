"use client";

import { ScrollReveal } from "@/components/shared/ScrollReveal";

const lines = [
  "You got your admit.",
  "Then reality hit.",
  "You don\u2019t know anyone there.",
  "So you try WhatsApp groups.",
  "500 strangers.\nSpam. Agents.",
  "Still alone.",
];

export function ProblemSection() {
  return (
    <section className="relative bg-[#020617] py-10 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          {lines.map((line, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <p
                className={`${
                  i === lines.length - 1
                    ? "text-xl font-bold text-[#F8FAFC] sm:text-2xl md:text-3xl"
                    : "text-lg text-[#94A3B8] sm:text-xl md:text-2xl"
                } ${i > 0 ? "mt-5" : ""} whitespace-pre-line leading-relaxed`}
              >
                {line}
              </p>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0.5}>
            <p className="mt-10 text-xl font-bold text-[#F8FAFC] sm:text-2xl">
              That&apos;s the problem.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
