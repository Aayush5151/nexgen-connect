"use client";

import { Check, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { LinkButton } from "@/components/ui/link-button";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import { useState } from "react";

const faqs = [
  {
    q: "Is this a subscription?",
    a: "No. One payment, forever access to your intake cohort. No recurring charges.",
  },
  {
    q: "What if I change my destination?",
    a: "You can update your destination anytime. Your payment carries over to whatever cohort you join.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer a full refund within 7 days of payment if you haven't used the swipe feature. After that, all sales are final.",
  },
  {
    q: "How is my ID verified?",
    a: "We use a government-approved KYC API. Your ID number is never stored — only the verification status is retained. The ID photo is deleted immediately after verification.",
  },
  {
    q: "Who can see my Instagram?",
    a: "Only users you match with (mutual swipe right). Your Instagram handle is hidden from everyone else.",
  },
  {
    q: "What happens after my intake period ends?",
    a: "Your cohort remains active for 3 months after the intake date. After that, it's archived — but your matches and connections remain forever.",
  },
  {
    q: "How does the verification process work?",
    a: "You verify through three steps: phone number via OTP, email via a confirmation link, and identity via a live face selfie matched against your profile photos. The entire process takes about 5 minutes.",
  },
  {
    q: "What happens after I pay?",
    a: "Instantly. Your cohort unlocks immediately — you can see full profiles, start swiping, and begin matching with verified students from your city heading to the same destination.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We never store your ID numbers. Your selfie is deleted immediately after verification. Only your verification status is retained. All data is encrypted and we follow industry-standard security practices.",
  },
  {
    q: "Can I use NexGen Connect from outside India?",
    a: "Currently, NexGen Connect is designed for Indian students planning to study abroad. You can sign up from anywhere, but the origin-based cohort system works best when you select an Indian city as your origin.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[#F8FAFC] transition-colors hover:text-[#CBD5E1] sm:text-base"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-[#94A3B8]">{a}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const freeFeatures = PRICING_TIERS.free.features;
  const unlockFeatures = PRICING_TIERS.unlock.features;
  const price = PRICING_TIERS.unlock.pricesByRegion.IN;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#020617] py-16 md:py-20">
          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-[#F8FAFC] sm:text-5xl md:text-6xl">
                Simple Pricing
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[#94A3B8]">
                One payment. Lifetime access. No surprises.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 md:py-16 bg-[#020617]">
          <div className="container-narrow">
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Free */}
              <ScrollReveal>
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#0F172A] p-8 shadow-none">
                  <h3 className="text-xl font-bold text-[#F8FAFC]">Free</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-[#F8FAFC]">{price.symbol}0</span>
                  </div>
                  <p className="mt-2 text-sm text-[#94A3B8]">Browse &amp; explore</p>

                  <ul className="mt-8 flex-1 space-y-4">
                    {freeFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <LinkButton
                    href="#download"
                    variant="outline"
                    className="mt-8 w-full rounded-lg border-[#2A2A2E] py-3 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/30"
                  >
                    Get Started in the App
                  </LinkButton>
                </div>
              </ScrollReveal>

              {/* Unlock */}
              <ScrollReveal delay={0.1}>
                <div className="relative flex h-full flex-col rounded-2xl border-2 border-[#3B82F6]/30 bg-[#0F172A] p-8 shadow-none">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#3B82F6] px-5 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>

                  <h3 className="text-xl font-bold text-[#F8FAFC]">Unlock</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-[#F8FAFC]">
                      {price.symbol}{price.amount}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#94A3B8]">One-time payment</p>

                  <ul className="mt-8 flex-1 space-y-4">
                    {unlockFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-[#CBD5E1]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <LinkButton
                    href="#download"
                    className="mt-8 w-full rounded-lg bg-[#3B82F6] py-3 text-white hover:bg-[#2563EB] active:scale-[0.98] will-change-transform"
                  >
                    Download & Unlock
                  </LinkButton>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-[#020617]">
          <div className="container-narrow">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#F8FAFC] sm:text-4xl">
                  Frequently Asked Questions
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/[0.06] bg-[#0F172A] px-6">
                {faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
