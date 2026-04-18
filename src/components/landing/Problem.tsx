"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

const lines = [
  "387 strangers.",
  "14 of them are agents.",
  "6 are parents of other students.",
  "2 are bots selling SIM cards.",
  "Not one is from your city.",
  "Not one is in your intake.",
];

export function Problem() {
  return (
    <section className="border-t border-border section-y">
      <div className="container-narrow">
        <div className="max-w-[720px]">
          <SectionLabel>The real problem</SectionLabel>
          <h2 className="mt-5 font-heading text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
            You got the admit.{" "}
            <span className="text-muted-foreground">Then the group chat hit.</span>
          </h2>

          <div className="mt-10 space-y-4">
            {lines.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl leading-snug text-foreground md:text-2xl"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 text-2xl font-medium text-foreground md:text-3xl"
          >
            You&apos;re still alone. You just have notifications now.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
