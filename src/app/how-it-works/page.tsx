"use client";

import {
  UserPlus,
  ShieldCheck,
  Users,
  Heart,
  MessageCircle,
  Fingerprint,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { LinkButton } from "@/components/ui/link-button";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    time: "90 seconds",
    description:
      "Add your name, photo, and a one-line bio. Tell us where you're from and where you're headed.",
  },
  {
    icon: Fingerprint,
    title: "Verify Your Identity",
    time: "2-5 minutes",
    description:
      "Complete phone, email, and government ID verification. This is what makes NexGen Connect different — every user is real.",
  },
  {
    icon: Users,
    title: "Join Your Cohort",
    time: "Automatic",
    description:
      "You're automatically placed into origin-based cohorts. Mumbai → Germany. Delhi → UK. Your city, your destination.",
  },
  {
    icon: Heart,
    title: "Swipe & Match",
    time: "Paid feature",
    description:
      "Browse full profiles one at a time. Swipe right on students you'd like to connect with. When both swipe right — it's a match!",
  },
  {
    icon: MessageCircle,
    title: "Connect on Instagram & LinkedIn",
    time: "Instant",
    description:
      "When you match, Instagram and LinkedIn handles are revealed. No in-app chat needed — connect where you already are.",
  },
];

const freeVsPaid = [
  {
    feature: "See your cohort exists",
    free: true,
    paid: true,
  },
  {
    feature: "Browse blurred profiles",
    free: true,
    paid: true,
  },
  {
    feature: "See full profiles (names, photos, bios)",
    free: false,
    paid: true,
  },
  {
    feature: "Swipe & match",
    free: false,
    paid: true,
  },
  {
    feature: "Instagram & LinkedIn revealed on match",
    free: false,
    paid: true,
  },
  {
    feature: "All cohort levels",
    free: false,
    paid: true,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#020617] py-16 md:py-20">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#3B82F6]/[0.04] blur-3xl" />
          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-[#F8FAFC] sm:text-5xl md:text-6xl">
                How It Works
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[#94A3B8]">
                From signup to your first connection — here&apos;s exactly what happens.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Steps */}
        <section className="py-12 md:py-16 bg-[#020617]">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl space-y-10">
              {steps.map((step, i) => (
                <ScrollReveal key={step.title} delay={0.05}>
                  <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                    {/* Icon + number */}
                    <div className="flex shrink-0 items-start gap-4 sm:flex-col sm:items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] text-white shadow-none">
                        <step.icon className="h-7 w-7" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] sm:mt-2">
                        Step {i + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-[#F8FAFC] sm:text-2xl">{step.title}</h3>
                        <span className="rounded-full bg-[#0F172A] border border-white/[0.06] px-3 py-0.5 text-xs font-medium text-[#94A3B8]">
                          {step.time}
                        </span>
                      </div>
                      <p className="mt-2 text-[#94A3B8]">{step.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Free vs Paid comparison */}
        <section className="py-12 md:py-16 bg-[#020617]">
          <div className="container-narrow">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#F8FAFC] sm:text-4xl">
                  Free vs Unlocked
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[#94A3B8]">
                  Browse for free. Pay once to unlock everything.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0F172A] shadow-none">
                <div className="grid grid-cols-3 border-b border-white/[0.06] bg-[#0F172A] px-4 py-3 text-center text-sm font-semibold">
                  <span className="text-left text-[#94A3B8]">Feature</span>
                  <span className="text-[#F8FAFC]">Free</span>
                  <span className="text-[#F8FAFC]">Unlocked</span>
                </div>
                {freeVsPaid.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-3 border-b border-white/[0.06] px-4 py-3 text-center text-sm last:border-0"
                  >
                    <span className="text-left text-[#F8FAFC]">{row.feature}</span>
                    <span className="text-[#F8FAFC]">{row.free ? "\u2713" : <span className="text-[#94A3B8]">{"\u2014"}</span>}</span>
                    <span className="text-[#F8FAFC]">{row.paid ? "\u2713" : <span className="text-[#94A3B8]">{"\u2014"}</span>}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-[#0F172A] text-center">
          <div className="container-narrow">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-[#F8FAFC] sm:text-4xl">Ready to Find Your People?</h2>
              <p className="mx-auto mt-3 max-w-xl text-[#94A3B8]">
                Join thousands of verified Indian students who connected before they landed.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <LinkButton
                href="#download"
                className="btn-shimmer mt-8 h-14 rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-none hover:bg-[#2563EB] active:scale-[0.98] will-change-transform"
              >
                Download the App
              </LinkButton>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
