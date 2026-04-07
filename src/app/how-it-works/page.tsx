"use client";

import {
  UserPlus,
  ShieldCheck,
  Users,
  Heart,
  MessageCircle,
  Fingerprint,
  ArrowRight,
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
    details: [
      "Upload a profile photo",
      "Write a short bio (max 200 characters)",
      "Pick your origin city in India",
      "Select your destination country and intake period",
    ],
  },
  {
    icon: Fingerprint,
    title: "Verify Your Identity",
    time: "2-5 minutes",
    description:
      "Complete phone, email, and government ID verification. This is what makes NexGen Connect different — every user is real.",
    details: [
      "Phone verification via OTP",
      "Email verification via link",
      "Government ID (Aadhaar, PAN, DL, Voter ID, or Passport)",
      "Optional: Connect your LinkedIn for extra trust",
    ],
  },
  {
    icon: Users,
    title: "Join Your Cohort",
    time: "Automatic",
    description:
      "You're automatically placed into origin-based cohorts. Mumbai → Germany. Delhi → UK. Your city, your destination.",
    details: [
      "Level 1: Same city → same country (e.g., Mumbai → Germany)",
      "Level 2: Same state → same country (e.g., Maharashtra → Germany)",
      "Level 3: India → same country",
      "Level 4: Same destination city (cross-origin)",
    ],
  },
  {
    icon: Heart,
    title: "Swipe & Match",
    time: "Paid feature",
    description:
      "Browse full profiles one at a time. Swipe right on students you'd like to connect with. When both swipe right — it's a match!",
    details: [
      "See full profiles with photos, bio, hobbies, and languages",
      "Profiles prioritized by proximity (city first, then state, then country)",
      "One profile at a time — intentional, not overwhelming",
      "Mutual swipe creates an instant match",
    ],
  },
  {
    icon: MessageCircle,
    title: "Connect on Instagram & LinkedIn",
    time: "Instant",
    description:
      "When you match, Instagram and LinkedIn handles are revealed. No in-app chat needed — connect where you already are.",
    details: [
      "Instagram handle revealed on match",
      "LinkedIn profile revealed on match",
      "Tap to open their profile directly",
      "Build real connections before you land",
    ],
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
        <section className="relative overflow-hidden bg-[#081A3A] py-20 md:py-28">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#3B82F6]/[0.04] blur-3xl" />
          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-[#F0F4FF] sm:text-5xl md:text-6xl">
                How It Works
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5B6B8A]">
                From signup to your first connection — here&apos;s exactly what happens.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Steps */}
        <section className="section-padding bg-[#081A3A]">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl space-y-16">
              {steps.map((step, i) => (
                <ScrollReveal key={step.title} delay={0.05}>
                  <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                    {/* Icon + number */}
                    <div className="flex shrink-0 items-start gap-4 sm:flex-col sm:items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] text-white shadow-none">
                        <step.icon className="h-7 w-7" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B8A] sm:mt-2">
                        Step {i + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-[#F0F4FF] sm:text-2xl">{step.title}</h3>
                        <span className="rounded-full bg-[#0A1F44] border border-white/[0.06] px-3 py-0.5 text-xs font-medium text-[#94A3C0]">
                          {step.time}
                        </span>
                      </div>
                      <p className="mt-2 text-[#94A3C0]">{step.description}</p>
                      <ul className="mt-4 space-y-2">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-start gap-2 text-sm text-[#94A3C0]"
                          >
                            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3B82F6]" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Free vs Paid comparison */}
        <section className="section-padding bg-[#0A1F44]/40">
          <div className="container-narrow">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#F0F4FF] sm:text-4xl">
                  Free vs Unlocked
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[#94A3C0]">
                  Browse for free. Pay once to unlock everything.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A1F44] shadow-none">
                <div className="grid grid-cols-3 border-b border-white/[0.06] bg-[#0A1F44] px-4 py-3 text-center text-sm font-semibold">
                  <span className="text-left text-[#94A3C0]">Feature</span>
                  <span className="text-[#F0F4FF]">Free</span>
                  <span className="text-[#F0F4FF]">Unlocked</span>
                </div>
                {freeVsPaid.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-3 border-b border-white/[0.06] px-4 py-3 text-center text-sm last:border-0"
                  >
                    <span className="text-left text-[#F0F4FF]">{row.feature}</span>
                    <span className="text-[#F0F4FF]">{row.free ? "\u2713" : <span className="text-[#5B6B8A]">{"\u2014"}</span>}</span>
                    <span className="text-[#F0F4FF]">{row.paid ? "\u2713" : <span className="text-[#5B6B8A]">{"\u2014"}</span>}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-[#0A1F44] text-center">
          <div className="container-narrow">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-[#F0F4FF] sm:text-4xl">Ready to Find Your People?</h2>
              <p className="mx-auto mt-3 max-w-xl text-[#94A3C0]">
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
