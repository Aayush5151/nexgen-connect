"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getTotalWaitlistAction } from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";

export function FinalCTA() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTotalWaitlistAction().then((res) => {
      if (cancelled) return;
      if (res.ok) setTotal(res.total);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const counterText = (() => {
    if (total === null) return "Sept 2026 · Ireland";
    if (total === 0) return "Be the first on the list.";
    if (total === 1) return "1 student reserved. Yours is next.";
    return `${total} students reserved. Yours is next.`;
  })();

  return (
    <section className="section-y border-t border-[color:var(--color-border)]">
      <div className="container-narrow text-center">
        <SectionLabel className="mx-auto">The cohort closes when it closes</SectionLabel>
        <h2 className="mx-auto mt-4 max-w-[680px] font-heading text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[56px]">
          Your cohort starts with you.
        </h2>
        <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          Every verified student makes the next person&apos;s landing easier.
          Reserve your spot — we&apos;ll text you when another student from your
          city reserves theirs.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5">
          <Link
            href="/#reserve"
            onClick={() => track("CTA_Clicked", { location: "final" })}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
          >
            Reserve my spot — free
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>

          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            {counterText}
          </p>
        </div>
      </div>
    </section>
  );
}
