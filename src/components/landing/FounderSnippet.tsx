"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function FounderSnippet() {
  return (
    <section className="bg-[#020617] py-16 md:py-20">
      <div className="container-narrow">
        <ScrollReveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            <div className="shrink-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] p-[2px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F172A] text-lg font-black text-[#F8FAFC]">
                AS
              </div>
            </div>

            {/* Quote */}
            <div>
              <p className="text-base leading-relaxed text-[#94A3B8]">
                &ldquo;I built this because I was tired of WhatsApp groups with 500 strangers
                and zero people from my city. Every student deserves to know someone before
                they land.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-3 sm:justify-start justify-center">
                <span className="text-sm font-bold text-[#F8FAFC]">Aayush Shah</span>
                <span className="text-xs text-[#94A3B8]">Founder</span>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
                >
                  Full story <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
