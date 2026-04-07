"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const testimonials = [
  {
    name: "Priya M.",
    route: "Pune \u2192 Germany",
    quote:
      "I found 3 girls from Pune going to TU Munich in the same intake. We\u2019re already planning our apartment together!",
    avatar: "P",
  },
  {
    name: "Arjun K.",
    route: "Bangalore \u2192 UK",
    quote:
      "The WhatsApp groups were chaos. NexGen Connect showed me people from my city, verified and real. Total game changer.",
    avatar: "A",
  },
  {
    name: "Sneha R.",
    route: "Mumbai \u2192 Canada",
    quote:
      "Knowing someone from Mumbai who\u2019s also going to Toronto made me way less anxious about moving. Worth every rupee.",
    avatar: "S",
  },
  {
    name: "Rohit D.",
    route: "Delhi \u2192 Germany",
    quote:
      "Found my roommate through NexGen Connect. We\u2019re both from South Delhi, both doing Masters in CS at TU Berlin. Couldn\u2019t have planned it better.",
    avatar: "R",
  },
  {
    name: "Ananya S.",
    route: "Chennai \u2192 Australia",
    quote:
      "I was dreading going alone to Melbourne. Now I have a group of 4 girls from Tamil Nadu \u2014 we\u2019ve already made a grocery list together.",
    avatar: "A",
  },
  {
    name: "Karan P.",
    route: "Ahmedabad \u2192 US",
    quote:
      "Every other platform was full of agents trying to sell me something. Here, it\u2019s only verified students. Finally, a clean experience.",
    avatar: "K",
  },
  {
    name: "Meera J.",
    route: "Kolkata \u2192 Ireland",
    quote:
      "My match and I discovered we went to the same school in Kolkata but never met. Now we\u2019re heading to Dublin together. Small world!",
    avatar: "M",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // On mobile we show 1 card, on desktop we show 3
  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    function handleResize() {
      setCardsPerView(window.innerWidth >= 768 ? 3 : 1);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsPerView);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, maxIndex)));
    },
    [maxIndex],
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide: 6s on mobile, disabled on desktop when paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [isPaused, goNext]);

  // Number of dots = maxIndex + 1 (total slide positions)
  const dotCount = maxIndex + 1;

  // Percentage to translate the track per slide
  // Each card occupies (100 / cardsPerView)% of the container, but we also
  // need to account for the gap. We use a calc-based approach: the track items
  // are flex-none with a width set via style, so we translate by index * (cardWidth + gap).
  // However, with CSS percentage transforms on the wrapper this is cleaner:
  // We'll translate the inner flex container.
  // Card width as percentage of container: for 3 cards with gap-6 (24px),
  // each card = calc((100% - 48px) / 3) on desktop, 100% on mobile.

  return (
    <section className="relative overflow-hidden bg-[#020617] py-20 md:py-28">
      <div className="container-narrow relative">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#0F172A] border border-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
              Testimonials
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.02em] text-[#F8FAFC] sm:text-4xl lg:text-5xl">
              Students{" "}
              <span className="text-[#F8FAFC] italic">Love</span> Us
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#94A3B8] md:text-lg">
              Trusted by students heading to{" "}
              <span className="font-bold text-[#F8FAFC]">18+ countries</span>.
              Real stories from real connections.
            </p>
          </div>
        </ScrollReveal>

        {/* Carousel */}
        <div
          className="relative mt-14"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Left arrow — desktop only */}
          <button
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 md:flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-[#0F172A] text-[#94A3B8] transition-colors hover:text-[#F8FAFC] hover:border-white/[0.12]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Track */}
          <div className="overflow-hidden" ref={trackRef}>
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform:
                  cardsPerView === 1
                    ? `translateX(calc(-${activeIndex} * (100% + 24px)))`
                    : `translateX(calc(-${activeIndex} * (calc((100% - 48px) / 3) + 24px)))`,
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="flex-none"
                  style={{
                    width:
                      cardsPerView === 1
                        ? "100%"
                        : "calc((100% - 48px) / 3)",
                  }}
                >
                  <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#0F172A] p-7 hover:-translate-y-1 hover:border-[#3B82F6]/15 transition-all duration-300">
                    {/* Decorative quote mark */}
                    <div className="mb-2">
                      <Quote
                        className="h-10 w-10 rotate-180 text-[#1E293B]"
                        strokeWidth={1.5}
                      />
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
                    <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-[#CBD5E1]">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                      <div className="rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] p-[2px]">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F172A] text-sm font-extrabold text-[#F8FAFC]">
                          {t.avatar}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#F8FAFC]">
                          {t.name}
                        </p>
                        <p className="text-xs font-medium text-[#64748B]">
                          {t.route}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow — desktop only */}
          <button
            onClick={goNext}
            aria-label="Next testimonial"
            className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 md:flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-[#0F172A] text-[#94A3B8] transition-colors hover:text-[#F8FAFC] hover:border-white/[0.12]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 bg-[#3B82F6]"
                  : "w-2 bg-white/[0.12] hover:bg-white/[0.24]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
