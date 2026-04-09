"use client";

import { ScrollReveal } from "@/components/shared/ScrollReveal";

const lines = [
  "You got your admit letter. Exciting, right?",
  "Then the reality hits.",
  "You don\u2019t know a single person where you\u2019re going.",
  "You joined WhatsApp groups. 500 strangers. Immigration agents. Spam.",
  "You scrolled Reddit. Anonymous. Unhelpful. Lonely.",
];

export function ProblemSection() {
  return (
    <section className="relative bg-[#020617] py-16 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          {lines.map((line, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <p
                className={`${
                  i === lines.length - 1
                    ? "text-xl font-bold text-[#F8FAFC] sm:text-2xl md:text-3xl"
                    : "text-lg text-[#94A3B8] sm:text-xl md:text-2xl"
                } ${i > 0 ? "mt-5" : ""} leading-relaxed`}
              >
                {line}
              </p>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0.5}>
            <p className="mt-10 text-xl font-bold text-[#3B82F6] sm:text-2xl">
              You shouldn&apos;t have to figure this out alone.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
