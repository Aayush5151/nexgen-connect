"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const lines = [
  { text: "You got your admit.", emphasis: false },
  { text: "Then reality hit.", emphasis: false },
  { text: "You don\u2019t know anyone there.", emphasis: false },
  { text: "So you try WhatsApp groups.", emphasis: false },
  { text: "500 strangers. Spam. Agents.", emphasis: false },
  { text: "Still alone.", emphasis: true },
];

function TypeLine({ text, emphasis, index }: { text: string; emphasis: boolean; index: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  const chars = text.split("");

  if (prefersReducedMotion) {
    return (
      <p
        ref={ref}
        className={`${
          emphasis
            ? "text-xl font-bold text-[#F8FAFC] sm:text-2xl md:text-3xl"
            : "text-lg text-[#94A3B8] sm:text-xl md:text-2xl"
        } ${index > 0 ? "mt-5" : ""} leading-relaxed`}
      >
        {text}
      </p>
    );
  }

  return (
    <p
      ref={ref}
      className={`${
        emphasis
          ? "text-xl font-bold text-[#F8FAFC] sm:text-2xl md:text-3xl"
          : "text-lg text-[#94A3B8] sm:text-xl md:text-2xl"
      } ${index > 0 ? "mt-5" : ""} leading-relaxed`}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.03,
            delay: i * 0.025,
            ease: "easeOut",
          }}
        >
          {char}
        </motion.span>
      ))}
    </p>
  );
}

export function ProblemSection() {
  return (
    <section className="relative bg-[#020617] py-10 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          {lines.map((line, i) => (
            <TypeLine key={i} text={line.text} emphasis={line.emphasis} index={i} />
          ))}

          <ScrollReveal delay={0.3}>
            <p className="mt-10 text-xl font-bold text-[#F8FAFC] sm:text-2xl">
              That&apos;s the problem.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
