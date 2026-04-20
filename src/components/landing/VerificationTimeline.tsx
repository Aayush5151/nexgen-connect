import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerificationSteps } from "@/components/shared/VerificationSteps";

export function VerificationTimeline() {
  return (
    <section className="border-t border-[color:var(--color-border)] py-20 md:py-28">
      <div className="container-narrow">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">Verification</SectionLabel>
          <h2 className="mt-3 font-serif text-[36px] font-normal leading-[1.0] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[56px]">
            Verified the way{" "}
            <em className="italic text-[color:var(--color-fg-muted)]">
              your mom
            </em>{" "}
            would.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            Four checks. Each one real. Tap a step to see it.
          </p>
        </div>

        <div className="mt-12 md:mt-14">
          <VerificationSteps />
        </div>
      </div>
    </section>
  );
}
