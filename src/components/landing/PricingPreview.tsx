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
    <section className="relative overflow-hidden bg-[#141416]/40 py-20 md:py-28">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#141416] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Pricing
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-[#E8E8ED] sm:text-4xl lg:text-5xl">
              Simple Pricing.{" "}
              <span className="text-[#E8E8ED] italic">Pay Once.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#9CA3AF] md:text-lg">
              No subscriptions. No hidden fees. One payment, lifetime access to your cohort.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 md:grid-cols-2">
          {/* Free Tier */}
          <ScrollReveal delay={0.1}>
            <GlowCard glowColor="rgba(43, 63, 199, 0.08)" className="h-full border-white/[0.06] bg-[#141416]">
              <div className="flex h-full flex-col p-8">
                <h3 className="text-lg font-bold text-[#D1D5DB]">Free</h3>
                <div className="mt-3">
                  <span className="text-5xl font-extrabold text-[#E8E8ED]">{price.symbol}0</span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#9CA3AF]">Browse and explore -- no commitment</p>

                <ul className="mt-8 flex-1 space-y-4">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-[#9CA3AF]">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1E1E22]">
                        <Check className="h-3 w-3 text-[#6B7280]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <LinkButton
                  href="#download"
                  variant="outline"
                  className="mt-8 w-full min-h-[44px] rounded-xl border-[#2A2A2E] py-3 font-semibold text-[#9CA3AF] hover:text-[#E8E8ED] hover:border-[#2B3FC7]/30"
                >
                  Get Started in the App
                </LinkButton>
              </div>
            </GlowCard>
          </ScrollReveal>

          {/* Unlock Tier */}
          <ScrollReveal delay={0.2}>
            <div className="relative h-full">
              {/* Outer white glow ring */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#2B3FC7]/30 via-[#2B3FC7]/15 to-[#2B3FC7]/5 opacity-80" />

              <div className="relative flex h-full flex-col rounded-2xl bg-[#141416] p-8">
                {/* Most Popular badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#2B3FC7] px-5 py-1.5 shadow-lg shadow-[#2B3FC7]/10">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold tracking-wide text-white">Most Popular</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#E8E8ED]">Unlock</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#E8E8ED]">
                    {price.symbol}
                    {price.amount}
                  </span>
                  <span className="text-sm font-medium text-[#6B7280]">one-time</span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#9CA3AF]">
                  Full access. Forever. No catches.
                </p>

                <ul className="mt-8 flex-1 space-y-4">
                  {unlockFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-[#D1D5DB]">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2B3FC7]/10">
                        <Check className="h-3 w-3 text-[#2B3FC7]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <LinkButton
                  href="#download"
                  className="mt-8 w-full min-h-[44px] rounded-xl bg-[#2B3FC7] py-3 font-bold text-white shadow-lg shadow-[#2B3FC7]/10 transition-all hover:bg-[#2435B0] hover:shadow-xl hover:shadow-[#2B3FC7]/15 active:scale-[0.98]"
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
