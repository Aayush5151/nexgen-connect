"use client";

import { Check, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlowCard } from "@/components/shared/GlowCard";
import { PRICING_TIERS } from "@/lib/constants/pricing";

export function PricingPreview() {
  const freeFeatures = PRICING_TIERS.free.features;
  const unlockFeatures = PRICING_TIERS.unlock.features;
  const price = PRICING_TIERS.unlock.pricesByRegion.IN;

  return (
    <section className="relative overflow-hidden bg-[#020617] py-10 md:py-20">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#0F172A] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
              Pricing
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-[#F8FAFC] text-balance sm:text-4xl lg:text-5xl">
              Simple Pricing.{" "}
              <span className="text-[#F8FAFC] italic">Pay Once.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#94A3B8] md:text-lg">
              No subscriptions. No hidden fees. One payment, lifetime access.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide sm:mt-10 sm:grid sm:max-w-3xl sm:grid-cols-2 sm:gap-8 sm:overflow-visible">
          {/* Free Tier */}
          <ScrollReveal delay={0.1} className="min-w-[300px] shrink-0 snap-start sm:min-w-0 sm:shrink">
            <GlowCard glowColor="rgba(59, 130, 246, 0.08)" className="h-full border-white/[0.06] bg-[#0F172A]">
              <div className="flex h-full flex-col p-8">
                <h3 className="text-lg font-bold text-[#CBD5E1]">Free</h3>
                <div className="mt-3">
                  <span className="text-5xl font-extrabold text-[#F8FAFC]">{price.symbol}0</span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#94A3B8]">Browse and explore -- no commitment</p>

                <ul className="mt-8 flex-1 space-y-4">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-[#94A3B8]">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1E293B]">
                        <Check className="h-3 w-3 text-[#94A3B8]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <LinkButton
                  href="#download"
                  variant="outline"
                  className="mt-8 w-full min-h-[44px] rounded-xl border-[#2A2A2E] py-3 font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/30"
                >
                  Get Started in the App
                </LinkButton>
              </div>
            </GlowCard>
          </ScrollReveal>

          {/* Unlock Tier */}
          <ScrollReveal delay={0.2} className="min-w-[300px] shrink-0 snap-start sm:min-w-0 sm:shrink">
            <div className="relative h-full scale-[1.03]">
              {/* Outer white glow ring */}
              <div className="absolute -inset-[1px] rounded-2xl border border-[#3B82F6]/30 bg-gradient-to-b from-[#3B82F6]/30 via-[#3B82F6]/15 to-[#3B82F6]/5 opacity-80 shadow-[0_0_40px_rgba(59,130,246,0.25)]" />

              <div className="relative flex h-full flex-col rounded-2xl bg-[#0F172A] p-8">
                {/* Most Popular badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#3B82F6] px-5 py-1.5 shadow-lg shadow-[#3B82F6]/10">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold tracking-wide text-white">Most Popular</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#F8FAFC]">Unlock</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#F8FAFC]">
                    {price.symbol}
                    {price.amount}
                  </span>
                  <span className="text-sm font-medium text-[#94A3B8]">one-time</span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#94A3B8]">
                  Full access. Forever. No catches.
                </p>

                <ul className="mt-8 flex-1 space-y-4">
                  {unlockFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-[#CBD5E1]">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3B82F6]/10">
                        <Check className="h-3 w-3 text-[#3B82F6]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <LinkButton
                  href="#download"
                  className="mt-8 w-full min-h-[44px] rounded-xl bg-[#3B82F6] py-3 font-bold text-white shadow-lg shadow-[#3B82F6]/10 transition-all hover:bg-[#2563EB] hover:shadow-xl hover:shadow-[#3B82F6]/15 active:scale-[0.98] will-change-transform"
                >
                  Download &amp; Unlock
                </LinkButton>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
