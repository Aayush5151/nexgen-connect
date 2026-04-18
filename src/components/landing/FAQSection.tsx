"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const faqs = [
  {
    q: "How do you verify identities?",
    a: "Every user completes three verification steps: phone number via OTP, email via confirmation link, and government ID (Aadhaar, PAN, Driving License, Voter ID, or Passport). We never store your ID number. Only the verification status is retained.",
  },
  {
    q: "Can I find a roommate for my specific intake?",
    a: "Yes. We match you with verified students from your city heading to the same destination and intake period. Many students use NexGen Connect specifically to find roommates before they move.",
  },
  {
    q: "Is NexGen Connect free?",
    a: "You can browse and explore for free. To see full profiles, swipe, match, and reveal Instagram and LinkedIn handles, there\u2019s a one-time payment of \u20B9999. No subscriptions, no hidden fees.",
  },
  {
    q: "How is this different from WhatsApp groups?",
    a: "WhatsApp groups have 500 strangers, immigration agents, and spam. NexGen Connect matches you only with government-verified students from your specific city heading to your exact destination. Students only, no agents, no noise.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-[15px] font-semibold text-[#F8FAFC] transition-colors hover:text-[#3B82F6]"
        aria-expanded={open}
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? `${height}px` : "0px", opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef}>
          <p className="pb-5 text-sm leading-relaxed text-[#94A3B8]">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="bg-[#020617] py-10 md:py-24">
      <div className="container-narrow">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-2xl font-black text-[#F8FAFC] text-balance sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-6 sm:mt-10 max-w-2xl rounded-2xl border border-white/[0.06] bg-[#0F172A] px-6 sm:px-8">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
