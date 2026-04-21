"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Heart, Lock, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * SafetyParents. A section aimed at the most skeptical reader on the
 * site: the Indian parent weighing whether a daughter or son should
 * trust an app full of strangers. Fourth wall broken - copy speaks
 * directly to &ldquo;mum and dad&rdquo; and lists the safeguards in plain
 * English. Four pillars, one closing line.
 *
 * Intentionally quiet, no imagery. This is the &ldquo;we see you&rdquo;
 * section, and it works precisely because it doesn&rsquo;t oversell.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Pillar = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    icon: Lock,
    title: "Verified-only walls",
    body: "Nobody enters a group until Aadhaar or passport is checked by DigiLocker. No bots, no agents, no impostors.",
  },
  {
    icon: Users,
    title: "Women-only groups",
    body: "Opt in and you match only with other verified women from your city and campus. Nobody else can see you.",
  },
  {
    icon: AlertTriangle,
    title: "One-tap report",
    body: "Every profile, chat, and group has a single red flag. We pause the account the moment a report is filed.",
  },
  {
    icon: Heart,
    title: "Parents can check",
    body: "Share a read-only link with your parents. They see the group you are part of. No chats, no personal data.",
  },
];

export function SafetyParents() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">
            For the most skeptical reader
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            If you&rsquo;re a parent{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              reading this.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]"
          >
            Your daughter, son, your only child. We know what&rsquo;s at stake.
            Four things we built in from day one, so you can breathe.
          </motion.p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-[960px] grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.06 * i }}
                className="flex gap-4 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                >
                  <Icon
                    className="h-4.5 w-4.5 text-[color:var(--color-primary)]"
                    strokeWidth={1.8}
                  />
                </span>
                <div>
                  <h3 className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)] sm:text-[17px]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[14px]">
                    {p.body}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-12 max-w-[520px] text-center font-serif italic text-[17px] leading-[1.45] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-14 sm:text-[20px]"
        >
          Your job is to worry. Ours is to make it stop.
        </motion.p>
      </div>
    </section>
  );
}
