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
 * The thread is scripted: Priya (newly admitted to Trinity) and her
 * friend Aditya. Short, real-feeling, not marketing copy. When the
 * user dismisses, we remember forever.
 *
 * Rules:
 *   - Hidden on mobile (md: breakpoint and up only)
 *   - Appears after ~12% scroll depth
 *   - New messages unfurl at 25%, 40%, 60%, 78%
 *   - Fades out past 92% (we're near the CTA, don't compete)
 *   - Dismiss button hides it forever via localStorage
 */

const STORAGE_KEY = "nx-sms-dismissed";

type Message = {
  from: "priya" | "aditya";
  text: string;
  at: number; // scroll fraction threshold 0..1
};

const THREAD: Message[] = [
  { from: "priya", at: 0.12, text: "i got trinity 😭" },
  { from: "aditya", at: 0.25, text: "omg congrats. when do u fly?" },
  { from: "priya", at: 0.4, text: "sept. but idk a single person going" },
  { from: "aditya", at: 0.6, text: "nexgen. i swear. verified people. same month." },
  { from: "priya", at: 0.78, text: "found 7 from mumbai 🙂" },
];

export function SmsThread() {
  const [scrollPct, setScrollPct] = useState(0);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  // Read dismissal state post-mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
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

  const visibleMessages = THREAD.filter((m) => scrollPct >= m.at);
  const showThread = scrollPct >= 0.1 && scrollPct < 0.92;

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
                P
              </span>
              <div className="leading-tight">
                <p className="font-heading text-[12px] font-semibold text-[color:var(--color-fg)]">
                  Priya
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
                  m.from === "priya" ? "justify-start" : "justify-end"
                }`}
              >
                <span
                  className={`inline-block max-w-[80%] rounded-[14px] px-3 py-1.5 leading-[1.35] ${
                    m.from === "priya"
                      ? "rounded-bl-[4px] bg-[color:var(--color-border)] text-[color:var(--color-fg)]"
                      : "rounded-br-[4px] bg-[#2c7dfa] text-white"
                  }`}
                >
                  {m.text}
                </span>
                {m.from === "aditya" && i === visibleMessages.length - 1 && (
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
