"use client";

import { MapPin, ShieldCheck, Heart, AtSign, Ban, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlowCard } from "@/components/shared/GlowCard";

const features = [
  {
    icon: MapPin,
    title: "People From Your City",
    description:
      "We match you with students from your exact city heading to your exact destination. Mumbai to Munich, Pune to Paris \u2014 your neighbours, going the same way.",
    badge: "Core Feature",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: ShieldCheck,
    title: "Every Person Is Verified",
    description:
      "Aadhaar, PAN, DL, Voter ID, or Passport. No fakes. No catfish. No bots. You know exactly who you\u2019re connecting with.",
    badge: "Trust",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: Heart,
    title: "One Profile at a Time",
    description:
      "No noisy group chats with 500 unread messages. Discover profiles intentionally, one at a time. Just you and the people who matter.",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: AtSign,
    title: "Real Social Profiles",
    description:
      "When you match, Instagram and LinkedIn handles are revealed. Get to know each other authentically before you meet in person.",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: Ban,
    title: "Students Only. Zero Agents.",
    description:
      "No immigration consultants. No ads. No service providers trying to sell you something. This is a students-only space.",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: Shield,
    title: "Built With Safety First",
    description:
      "Every user is government-verified. Your Instagram is only revealed to mutual matches. Report anyone in one tap.",
    badge: "Safety",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-12 md:py-28">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#0F172A] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
              Features
            </span>
            <h2 className="mt-3 sm:mt-5 text-3xl font-black tracking-[-0.02em] text-[#F8FAFC] text-balance sm:text-4xl lg:text-5xl">
              Why Verified Students <span className="text-[#F8FAFC] italic">Choose Us</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#94A3B8] md:text-lg">
              Unlike other international student networks, we match you with verified people from your exact city.
              <br />
              <span className="font-bold text-[#F8FAFC]">Not a WhatsApp group. A pre-departure community built for Indian students abroad.</span>
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08} variant="scaleUp" className="min-w-[280px] shrink-0 snap-start sm:min-w-0 sm:shrink">
              <GlowCard glowColor={feature.glowColor} gradientBorder className="h-full border-white/[0.06] bg-[#0F172A]">
                <div className="flex h-full flex-col p-7">
                  {/* Icon container */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1E293B] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-[#3B82F6]/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] shadow-sm transition-shadow duration-300 group-hover:shadow-md group-hover:shadow-[#3B82F6]/30">
                        <feature.icon className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    {feature.badge && (
                      <span className="rounded-full bg-[#3B82F6]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6] transition-colors duration-300 group-hover:bg-[#3B82F6]/20">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#F8FAFC] transition-colors duration-300 group-hover:text-[#60A5FA]">{feature.title}</h3>
                  <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-[#94A3B8]">
                    {feature.description}
                  </p>
                </div>
              </GlowCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
