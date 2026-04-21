"use client";

import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

/**
 * LocaleToggle. Pill-shaped EN / हिं switch for the navbar. Uses the
 * same &ldquo;floating active&rdquo; pattern as the campus selector so the motion
 * language stays consistent.
 */

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        className,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={locale === "en"}
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "en"
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
        )}
      >
        EN
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={locale === "hi"}
        onClick={() => setLocale("hi")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "hi"
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
        )}
      >
        हिं
      </button>
    </div>
  );
}
