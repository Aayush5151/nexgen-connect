import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerificationSteps } from "@/components/shared/VerificationSteps";

export function VerificationTimeline() {
  return (
    <section className="border-t border-[color:var(--color-border)] py-12 md:py-16">
      <div className="container-narrow">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">Verification</SectionLabel>
          <h2
            className="mt-2 font-heading font-semibold text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(30px, 4.5vw, 52px)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
            }}
          >
            Verified the way{" "}
            <span className="font-serif font-bold italic tracking-[-0.015em] text-[color:var(--color-fg)]">
              your mom
            </span>{" "}
            would.
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-[1.5] text-[color:var(--color-fg-muted)]">
            Four checks. Each one real. Tap a step to see it.
          </p>
        </div>

        <div className="mt-8 md:mt-10">
          <VerificationSteps />
        </div>
      </div>
    </section>
  );
}
