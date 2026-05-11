"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfettiBurst } from "@/components/shared/ConfettiBurst";

/**
 * CorridorWelcome — one-time onboarding completion celebration.
 *
 * Fires exactly once per browser, the first time a verified user lands
 * on `/app/corridor` after completing signup. Two beats:
 *
 *   1. A subtle confetti burst from the centre of the page (uses the
 *      existing ConfettiBurst primitive — CSS-only, motion-reduce safe).
 *   2. A sonner toast: "You're in. Welcome to your corridor." with the
 *      presence-dot so it reads as part of our trust-signal language.
 *
 * Apple-grade restraint: this happens *once*, then never again. No
 * confetti on every visit. No persistent banner. The moment is the
 * moment.
 *
 * Storage key: `nx_corridor_welcomed`. Versioned so we can re-fire
 * after a meaningful change (e.g. corridor v2 reveal).
 *
 * a11y: ConfettiBurst respects prefers-reduced-motion (renders
 * nothing). The sonner toast announces normally — informational, not
 * critical.
 *
 * v18 trillion-dollar polish.
 */

const STORAGE_KEY = "nx_corridor_welcomed_v1";

export function CorridorWelcome() {
  // null = haven't checked yet; number = trigger value for the burst.
  const [burstTrigger, setBurstTrigger] = useState<number | null>(null);

  useEffect(() => {
    // Defer to a microtask so the page-transition has settled before
    // we fire — otherwise the toast races the corridor data load.
    const timer = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY) === "true") return;
        window.localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // localStorage unavailable (private mode, quota, etc.) — fail
        // closed: don't fire the celebration rather than firing every
        // time. The reverse would be worse.
        return;
      }

      setBurstTrigger(Date.now());
      toast.success("You're in. Welcome to your corridor.", {
        description: "Your group forms here.",
        duration: 4500,
      });
    }, 320);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-1/3 z-10 h-0 w-0"
    >
      <ConfettiBurst trigger={burstTrigger} count={18} radius={140} />
    </div>
  );
}
