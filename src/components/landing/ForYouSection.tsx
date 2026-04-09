"use client";

import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Check } from "lucide-react";

const scenarios = [
  "You got your admit letter but don't know a single person at your university",
  "You're in 15 WhatsApp groups and still feel completely alone",
  "Your parents keep asking 'do you know anyone there?' and you don't",
  "You're googling 'how to make friends abroad' at 2am",
  "You want a roommate from your city — not a random stranger from the internet",
  "You're leaving in 3 months and the anxiety is real",
];

export function ForYouSection() {
  return (
    <section className="bg-[#020617] py-10 md:py-24">
      <div className="container-narrow">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-2xl font-black text-[#F8FAFC] sm:text-3xl md:text-4xl">
              This is for you if...
            </h2>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-6 sm:mt-10 max-w-2xl space-y-2.5 sm:space-y-4">
          {scenarios.map((line, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="flex items-start gap-4 rounded-xl border border-white/[0.04] bg-[#0F172A]/50 px-5 py-4 transition-colors hover:border-[#3B82F6]/15">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]" />
                <p className="text-[15px] font-medium leading-relaxed text-[#CBD5E1]">
                  {line}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.6}>
          <p className="mt-6 sm:mt-10 text-center text-lg font-bold text-[#F8FAFC]">
            If any of that hit home — we built this for you.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
