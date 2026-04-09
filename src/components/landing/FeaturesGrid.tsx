"use client";

import { MapPin, ShieldCheck, Heart, AtSign, Ban, CreditCard } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlowCard } from "@/components/shared/GlowCard";

const features = [
  {
    icon: MapPin,
    title: "Origin-Based Cohorts",
    description:
      "We match you with students from your city heading to your destination. Mumbai to Munich, Pune to Paris -- not random strangers, but neighbours going the same way.",
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
    badge: "Core Feature",
  },
  {
    icon: ShieldCheck,
    title: "Government ID Verified",
    description:
      "Every user verifies with Aadhaar, PAN, DL, Voter ID, or Passport. No fakes, no catfish, no bots. You know exactly who you are connecting with.",
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
    badge: "Unique to NexGen",
  },
  {
    icon: Heart,
    title: "Swipe, Don't Scroll",
    description:
      "Intentional discovery, one profile at a time. No noisy group chats with 500 unread messages. Just you and the people who matter.",
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: AtSign,
    title: "Connect on Instagram",
    description:
      "Matches reveal real social profiles -- Instagram and LinkedIn. Get to know each other authentically before you meet in person.",
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: Ban,
    title: "No Spam, No Agents",
    description:
      "This is a students-only zone. No immigration agents, no ads, no noise. Just real students helping each other navigate the journey abroad.",
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: CreditCard,
    title: "One-Time Payment",
    description:
      "Pay once, access forever. No subscriptions draining your account, no hidden fees, no upsells. Your cohort is yours for life.",
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    glowColor: "rgba(59, 130, 246, 0.08)",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-20 md:py-28">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#0F172A] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
              Features
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.02em] text-[#F8FAFC] sm:text-4xl lg:text-5xl">
              Built <span className="text-[#F8FAFC] italic">Different</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#94A3B8] md:text-lg">
              Not another WhatsApp group. Not another Reddit thread.
              <br />
              <span className="font-bold text-[#F8FAFC]">A verified, intentional network.</span>
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08} variant="scaleUp">
              <GlowCard glowColor={feature.glowColor} className="h-full border-white/[0.06] bg-[#0F172A]">
                <div className="flex h-full flex-col p-7 transition-all duration-300 group-hover:-translate-y-1.5">
                  {/* Icon container */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1E293B] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} shadow-sm`}>
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    {feature.badge && (
                      <span className="rounded-full bg-[#3B82F6]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">{feature.title}</h3>
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
