import { SectionLabel } from "@/components/ui/SectionLabel";

const STEPS = [
  {
    idx: "01",
    duration: "Under a minute",
    title: "Your admit letter",
    body: "Drop the PDF from UCD, Trinity, or UCC. We only accept the three. It's encrypted the moment it leaves your phone.",
  },
  {
    idx: "02",
    duration: "Under a minute",
    title: "A government ID",
    body: "Aadhaar, PAN, driver's licence, or passport. DigiLocker auto-fetch lands August 2026 — until then you upload the image yourself.",
  },
  {
    idx: "03",
    duration: "Within 48 hours",
    title: "A human review",
    body: "A real person on our team cross-checks your admit letter and ID before anything goes live. No bots.",
  },
  {
    idx: "04",
    duration: "The moment it's done",
    title: "Your cohort unlocks",
    body: "You see the other verified students from your city heading to your university — and they see you.",
  },
];

export function VerificationTimeline() {
  return (
    <section className="section-y border-t border-[color:var(--color-border)]">
      <div className="container-narrow">
        <div className="max-w-[680px]">
          <SectionLabel>Verification</SectionLabel>
          <h2 className="mt-4 font-heading text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[44px]">
            Verified the way your mother would.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            Four checks. Roughly forty-eight hours. No shortcuts.
          </p>
        </div>

        <ol className="mt-16 grid gap-8 md:grid-cols-4 md:gap-6">
          {STEPS.map((s) => (
            <li
              key={s.idx}
              className="relative border-l border-[color:var(--color-border)] pl-6 md:border-l-0 md:border-t md:pl-0 md:pt-6"
            >
              <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-[color:var(--color-primary)] md:-left-0 md:-top-[5px]" />
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                {s.idx} · {s.duration}
              </p>
              <h3 className="mt-3 font-heading text-[18px] font-semibold leading-tight text-[color:var(--color-fg)]">
                {s.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
