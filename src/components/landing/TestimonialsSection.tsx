"use client";

import { Star, Quote } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlowCard } from "@/components/shared/GlowCard";

const testimonials = [
  {
    name: "Priya M.",
    route: "Pune \u2192 Germany",
    quote:
      "I found 3 girls from Pune going to TU Munich in the same intake. We're already planning our apartment together!",
    avatar: "P",
    gradient: "from-[#FF6B35] to-[#FF8F65]",
  },
  {
    name: "Arjun K.",
    route: "Bangalore \u2192 UK",
    quote:
      "The WhatsApp groups were chaos. NexGen Connect showed me people from my city, verified and real. Game changer.",
    avatar: "A",
    gradient: "from-[#FF6B35] to-[#FF8F65]",
  },
  {
    name: "Sneha R.",
    route: "Mumbai \u2192 Canada",
    quote:
      "Knowing someone from Mumbai who's also going to Toronto made me way less anxious about moving. Worth every rupee.",
    avatar: "S",
    gradient: "from-[#FF6B35] to-[#FF8F65]",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0C] py-20 md:py-28">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#141416] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Testimonials
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.02em] text-[#E8E8ED] sm:text-4xl lg:text-5xl">
              Students{" "}
              <span className="text-[#E8E8ED] italic">Love</span>{" "}
              Us
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#9CA3AF] md:text-lg">
              Trusted by students heading to{" "}
              <span className="font-bold text-[#E8E8ED]">18+ countries</span>. Real stories from real connections.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1} variant="scaleUp">
              <GlowCard glowColor="rgba(255, 107, 53, 0.08)" className="h-full border-white/[0.06] bg-[#141416]">
                <div className="flex h-full flex-col p-7">
                  {/* Decorative quote mark */}
                  <div className="mb-2">
                    <Quote className="h-10 w-10 rotate-180 text-[#1E1E22]" strokeWidth={1.5} />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-[#D1D5DB]">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                    {/* Avatar with gradient border */}
                    <div className={`rounded-full bg-gradient-to-br ${t.gradient} p-[2px]`}>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141416] text-sm font-extrabold text-[#E8E8ED]">
                        {t.avatar}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#E8E8ED]">{t.name}</p>
                      <p className="text-xs font-medium text-[#6B7280]">{t.route}</p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
