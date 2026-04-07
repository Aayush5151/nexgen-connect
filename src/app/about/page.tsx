"use client";

import { ShieldCheck, Users, Sparkles, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust First",
    description:
      "Every user is government-verified. We don't compromise on this.",
  },
  {
    icon: Users,
    title: "Familiarity Before Foreignness",
    description:
      "We connect you with people from your city, not strangers from everywhere.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    description:
      "No noise. No feeds. No clutter. Just the connections that matter.",
  },
  {
    icon: GraduationCap,
    title: "Students Only",
    description:
      "No agents. No advertisers. No service providers. This is your space.",
  },
];

const stats = [
  { target: 23847, suffix: "+", label: "Verified Students" },
  { target: 18, suffix: "", label: "Countries Covered" },
  { target: 65, suffix: "+", label: "Indian Cities" },
  { target: 100, suffix: "%", label: "Government-Verified" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#081A3A] py-20 md:py-28">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#3B82F6]/[0.04] blur-3xl" />
          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-[#F0F4FF] sm:text-5xl md:text-6xl">
                Our Story
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5B6B8A]">
                We&apos;re building the connection layer that should have existed years ago.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding bg-[#081A3A]">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl">
              <ScrollReveal>
                <h2 className="text-3xl font-bold text-[#F0F4FF] sm:text-4xl">Our Mission</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-6 text-lg leading-relaxed text-[#94A3C0]">
                  Every year, a million Indian students make the brave decision to study abroad.
                  They face months of anxiety, uncertainty, and loneliness before they even leave
                  home. We believe no student should feel alone during this transition. NexGen
                  Connect exists to ensure that by the time you board your flight, you already have
                  your people waiting.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="section-padding bg-[#0A1F44]/40">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl">
              <ScrollReveal>
                <h2 className="text-3xl font-bold text-[#F0F4FF] sm:text-4xl">Our Vision</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-6 text-lg leading-relaxed text-[#94A3C0]">
                  To become the default first app every Indian student downloads when they decide to
                  study abroad — not for information, not for admissions, but for finding their
                  people.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-[#081A3A]">
          <div className="container-narrow">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#F0F4FF] sm:text-4xl">What We Stand For</h2>
                <p className="mx-auto mt-3 max-w-xl text-[#94A3C0]">
                  The principles that guide everything we build.
                </p>
              </div>
            </ScrollReveal>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
              {values.map((value, i) => (
                <ScrollReveal key={value.title} delay={i * 0.1}>
                  <div className="group h-full rounded-2xl border border-white/[0.06] bg-[#0A1F44] p-6 shadow-none transition-all duration-200 hover:-translate-y-0.5">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6] text-white">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#F0F4FF]">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#94A3C0]">
                      {value.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-white/[0.04] bg-[#0A1F44]/40 py-12 md:py-16">
          <div className="container-narrow">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.label} delay={i * 0.1}>
                  <div className="text-center">
                    <AnimatedCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      className="text-3xl font-black text-[#F0F4FF] sm:text-4xl"
                      duration={2}
                    />
                    <p className="mt-1 text-sm text-[#5B6B8A]">{stat.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
