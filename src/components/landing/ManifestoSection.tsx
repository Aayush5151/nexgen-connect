import { SectionLabel } from "@/components/ui/SectionLabel";

const BEATS = [
  {
    label: "01 / NOT A DIRECTORY",
    body: "A directory gives you four hundred names. We give you nine. The difference is the difference between landing and arriving.",
  },
  {
    label: "02 / NOT A DATING APP",
    body: "A mutual match is how Instagram unlocks, not how anything else does. This isn\u2019t about chemistry. It\u2019s about the first person you sit next to on the bus from the airport.",
  },
  {
    label: "03 / NOT A NETWORKING LOUNGE",
    body: "Nobody moves countries for a networking opportunity. You move because of a program, a fee, a visa, a family decision. We start where the move starts: your home city going to your campus.",
  },
];

export function ManifestoSection() {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-32 md:py-48">
      <div className="container-narrow">
        <SectionLabel>Manifesto</SectionLabel>
        <h2 className="mt-4 font-heading text-[40px] font-semibold leading-[1.03] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[72px]">
          Familiarity before foreignness.
        </h2>
        <p className="mt-8 max-w-[620px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
          Moving abroad is hard. Not because the weather&apos;s different.
          Because on day one you know nobody, and the apps that promised to
          fix that were run by people selling things you hadn&apos;t asked
          for.
        </p>

        <div className="mt-20 max-w-[620px] space-y-12">
          {BEATS.map((beat) => (
            <div key={beat.label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                {beat.label}
              </p>
              <p className="mt-4 text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                {beat.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
