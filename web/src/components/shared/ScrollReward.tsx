"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * ScrollReward. A small delight for the one reader who actually hit
 * the bottom of the page: a confetti burst and a one-line toast that
 * says &ldquo;You made it. Founders notice.&rdquo; Fires once per session so
 * it never becomes spam.
 *
 * The confetti is pure CSS + a fixed-size particle grid - no canvas,
 * no extra bundle. Respects prefers-reduced-motion.
 */

const PARTICLES = 32;
const TOAST_LIFETIME_MS = 5200;
const STORAGE_KEY = "nx-scroll-reward-fired";

export function ScrollReward() {
  const [visible, setVisible] = useState(false);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setFired(true);
      return;
    }

    const onScroll = () => {
      if (fired) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      // Fire when we're within 32px of the true end.
      if (total - scrolled <= 32) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setFired(true);
        setVisible(true);
        window.setTimeout(() => setVisible(false), TOAST_LIFETIME_MS);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Check once in case the page is already scrolled.
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [fired]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Confetti particles */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
          >
            {Array.from({ length: PARTICLES }).map((_, i) => {
              const left = (i / PARTICLES) * 100 + (Math.random() * 4 - 2);
              const delay = Math.random() * 0.6;
              const duration = 2 + Math.random() * 1.4;
              const size = 6 + Math.random() * 6;
              const isPrimary = i % 3 !== 0;
              return (
                <span
                  key={i}
                  className="confetti"
                  style={{
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size * 0.4}px`,
                    background: isPrimary
                      ? "var(--color-primary)"
                      : "var(--color-fg)",
                    animation: `confetti-fall ${duration}s cubic-bezier(0.2,0.8,0.2,1) ${delay}s forwards`,
                  }}
                />
              );
            })}
          </div>

          {/* Toast */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="pointer-events-auto fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 sm:bottom-10"
          >
            <div className="flex items-center gap-3 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-surface-elevated)] px-4 py-2.5 shadow-[var(--shadow-lg)] backdrop-blur sm:px-5 sm:py-3">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              </span>
              <div className="text-left">
                <p className="font-heading text-[13px] font-semibold text-[color:var(--color-fg)] sm:text-[14px]">
                  You made it to the end.
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)]">
                  Email us &ldquo;priority&rdquo; for a first-20 slot.
                </p>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            .confetti {
              position: absolute;
              top: -10vh;
              border-radius: 2px;
              opacity: 0;
            }
            @keyframes confetti-fall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
              }
              8% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(110vh) rotate(540deg);
                opacity: 0;
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
