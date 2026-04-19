import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerificationSteps } from "@/components/shared/VerificationSteps";

export function VerificationTimeline() {
  return (
    <section className="section-y border-t border-[color:var(--color-border)]">
      <div className="container-narrow">
        <div className="max-w-[680px]">
          <SectionLabel>Verification</SectionLabel>
          <h2 className="mt-4 font-serif text-[44px] font-normal leading-[1.0] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[56px]">
            Verified the way <em className="italic text-[color:var(--color-fg-muted)]">your mom</em> would.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            Phone first. Then admit. Then Aadhaar when DigiLocker opens in
            August. Then your group.
          </p>
          <p className="mt-3 text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            Four checks. Each one real. Each one yours to see. If a step is not
            live yet, the card says so.
          </p>
        </div>

        <div className="mt-16">
          <VerificationSteps />
        </div>
      </div>
    </section>
  );
}
