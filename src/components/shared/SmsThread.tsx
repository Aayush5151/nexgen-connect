"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * SmsThread. A scroll-driven iMessage thread that floats on the right
 * edge of the viewport (desktop only). Messages reveal as the visitor
 * scrolls deeper through the page - the feeling is &ldquo;you are sitting
 * next to someone having this exact conversation right now.&rdquo;
 *
 * Two scripted conversations - one Ireland-bound (Priya to Trinity) and
 * one Germany-bound (Meher to TUM). Which one a visitor sees is
 * randomised once on mount and persisted so they never flip mid-session.
 * This is how both launch corridors surface at the scroll-driven
 * &ldquo;live proof&rdquo; layer of the page, not just in the testimonial wall.
 *
 * Rules:
 *   - Hidden on mobile (md: breakpoint and up only)
 *   - Appears only during the mid-funnel window (15% - 60% scroll) so
 *     the card never overlaps Pricing, FAQ, or FinalCTA on desktop.
 *     The right column of those sections holds real content; the SMS
 *     card would sit on top of it at the lg breakpoint and up.
 *   - New messages unfurl at 12%, 25%, 40%, 60% scroll thresholds
 *   - Dismiss button hides it forever via localStorage
 */

const STORAGE_KEY = "nx-sms-dismissed";
const VARIANT_KEY = "nx-sms-variant";

type Sender = "a" | "b";

type Message = {
  from: Sender;
  text: string;
  at: number; // scroll fraction threshold 0..1
};

type Variant = {
  // Name and initial shown in the chat header
  contactName: string;
  contactInitial: string;
  // The five scripted lines that unfurl as the visitor scrolls
  messages: readonly Message[];
};

const VARIANTS: readonly Variant[] = [
  // Ireland · Trinity · September 2026
  {
    contactName: "Priya",
    contactInitial: "P",
    messages: [
      { from: "a", at: 0.12, text: "i got trinity 😭" },
      { from: "b", at: 0.25, text: "omg congrats. when do u fly?" },
      { from: "a", at: 0.4, text: "sept. but idk a single person going" },
      { from: "b", at: 0.6, text: "nexgen. i swear. verified people. same month." },
      { from: "a", at: 0.78, text: "found 7 from mumbai 🙂" },
    ],
  },
  // Germany · TUM · October 2026
  {
    contactName: "Meher",
    contactInitial: "M",
    messages: [
      { from: "a", at: 0.12, text: "tum ms informatics 😭" },
      { from: "b", at: 0.25, text: "wait no way. when do u land?" },
      { from: "a", at: 0.4, text: "oct. flying into munich solo scares me tbh" },
      { from: "b", at: 0.6, text: "check nexgen - all verified, same month, same uni." },
      { from: "a", at: 0.78, text: "8 from bangalore going to tum 🫠" },
    ],
  },
] as const;

function pickVariantIndex(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = window.localStorage.getItem(VARIANT_KEY);
    if (stored === "0" || stored === "1") return Number(stored);
    const pick = Math.random() < 0.5 ? 0 : 1;
    window.localStorage.setItem(VARIANT_KEY, String(pick));
    return pick;
  } catch {
    // Safari private mode etc. - fall back to a deterministic variant
    // (date-based) so the same visitor sees the same thread within a day
    // without storage.
    return new Date().getUTCDate() % 2;
  }
}

export function SmsThread() {
  const [scrollPct, setScrollPct] = useState(0);
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  // variant is null pre-mount so SSR renders nothing (hydration-safe) and
  // the random pick happens only once client-side.
  const [variantIndex, setVariantIndex] = useState<number | null>(null);

  // Read dismissal + variant pick post-mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setVariantIndex(pickVariantIndex());
  }, []);

  // Throttled scroll tracking via rAF
  useEffect(() => {
    if (dismissed !== false) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? window.scrollY / total : 0;
        setScrollPct(pct);
        rafId = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  if (dismissed === null || dismissed) return null;
  if (variantIndex === null) return null;

  const variant = VARIANTS[variantIndex];
  const visibleMessages = variant.messages.filter((m) => scrollPct >= m.at);
  // Mid-funnel only - the card must clear before TestimonialWall (65%),
  // PricingTiers (72-82%), FAQSection (82-92%), and FinalCTA (92-100%)
  // so it never overlaps their right-column content on desktop.
  const showThread = scrollPct >= 0.15 && scrollPct < 0.6;

  return (
    <AnimatePresence>
      {showThread && visibleMessages.length > 0 && (
        <motion.aside
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.94 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          aria-label="Scripted conversation"
          className="pointer-events-auto fixed bottom-5 right-5 z-[40] hidden w-[300px] select-none rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-2xl md:block"
          style={{
            boxShadow:
              "0 24px 48px -12px rgba(0,0,0,0.4), 0 0 0 1px color-mix(in srgb, var(--color-fg-subtle) 12%, transparent)",
          }}
        >
          <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary)]/15 text-[10px] font-bold text-[color:var(--color-primary)]">
                {variant.contactInitial}
              </span>
              <div className="leading-tight">
                <p className="font-heading text-[12px] font-semibold text-[color:var(--color-fg)]">
                  {variant.contactName}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  iMessage · now
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss conversation"
              className="text-[color:var(--color-fg-subtle)] transition-colors hover:text-[color:var(--color-fg)]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </header>

          <div className="flex flex-col gap-1.5 px-3 py-3 text-[13px]">
            {visibleMessages.map((m, i) => (
              <motion.div
                key={`${m.at}-${m.from}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                className={`flex ${
                  m.from === "a" ? "justify-start" : "justify-end"
                }`}
              >
                <span
                  className={`inline-block max-w-[80%] rounded-[14px] px-3 py-1.5 leading-[1.35] ${
                    m.from === "a"
                      ? "rounded-bl-[4px] bg-[color:var(--color-border)] text-[color:var(--color-fg)]"
                      : "rounded-br-[4px] bg-[#2c7dfa] text-white"
                  }`}
                >
                  {m.text}
                </span>
                {m.from === "b" && i === visibleMessages.length - 1 && (
                  <span className="sr-only">sent</span>
                )}
              </motion.div>
            ))}
          </div>

          <footer className="border-t border-[color:var(--color-border)] px-3 py-1.5">
            <p className="text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Scripted · based on actual messages
            </p>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
