"use client";

import { UserPlus, Users, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlowCard } from "@/components/shared/GlowCard";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up & Verify",
    description: "Create your profile in 90 seconds and verify with your government ID. Real people only, no exceptions.",
    step: 1,
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: Users,
    title: "Get Matched With Your City",
    description: "We auto-place you with verified students from your city heading to the same destination. Mumbai to Germany. Delhi to UK. Automatic.",
    step: 2,
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: MessageCircle,
    title: "Connect for Real",
    description: "Swipe through profiles one at a time. When you match, Instagram and LinkedIn are revealed. Build friendships before the flight.",
    step: 3,
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#020617] border-t border-white/[0.03] py-16 md:py-24">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#0F172A] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
              How It Works
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.02em] text-[#F8FAFC] text-balance sm:text-4xl lg:text-5xl">
              Three Steps.{" "}
              <span className="text-[#F8FAFC] italic">That&apos;s It.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#94A3B8] md:text-lg">
              From sign-up to real connections — all before you board your flight.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className="mt-12 md:mt-16">
          {/* Desktop horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative flex items-start justify-between">
              {/* Connecting line */}
              <div className="absolute left-[10%] right-[10%] top-10 h-[3px] rounded-full bg-white/[0.06]" />

              {steps.map((step, i) => (
                <ScrollReveal key={step.step} delay={i * 0.12} direction="up" className="relative flex-1 px-3">
                  <div className="flex flex-col items-center text-center">
                    {/* Step number ring */}
                    <div className="relative z-10">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg shadow-[#3B82F6]/5`}>
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      {/* Floating step number */}
                      <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0F172A] text-xs font-extrabold text-[#F8FAFC] shadow-md ring-2 ring-white/[0.06]">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[#F8FAFC]">{step.title}</h3>
                    <p className="mt-2 max-w-[180px] text-sm font-medium leading-relaxed text-[#94A3B8]">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Mobile vertical timeline */}
          <div className="space-y-3 md:hidden">
            {steps.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 0.08}>
                <GlowCard glowColor="rgba(59, 130, 246, 0.08)" className="border-white/[0.06] bg-[#0F172A]">
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} shadow-md`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-extrabold text-[#F8FAFC]">
                          {step.step}
                        </span>
                        <h3 className="text-base font-bold text-[#F8FAFC]">{step.title}</h3>
                      </div>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#94A3B8]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
