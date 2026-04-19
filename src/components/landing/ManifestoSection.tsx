import { SectionLabel } from "@/components/ui/SectionLabel";

const NOT_THIS = [
  { label: "A directory", count: "400 names" },
  { label: "A dating app", count: "Swipes and games" },
  { label: "A networking lounge", count: "Cold DMs" },
];

const BUT_THIS = [
  { label: "A verified group", count: "Up to 100 classmates" },
  { label: "A trust layer", count: "DigiLocker · admit letter" },
  { label: "A landing pad", count: "Your city → your campus" },
];

export function ManifestoSection() {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-28 md:py-40">
      <div className="container-narrow">
        <div className="max-w-[720px]">
          <SectionLabel>Manifesto</SectionLabel>
          <h2 className="mt-4 font-heading text-[44px] font-semibold leading-[1.03] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[72px]">
            Familiarity
            <br />
            <span className="text-[color:var(--color-fg-muted)]">before foreignness.</span>
          </h2>
          <p className="mt-8 max-w-[560px] text-[17px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            Day one abroad is hard. Not because the weather&apos;s different.
            Because you know nobody. We fix the nobody part.
          </p>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              This is not
            </p>
            <ul className="mt-6 space-y-5">
              {NOT_THIS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-border)] pb-5"
                >
                  <span className="font-heading text-[18px] font-semibold text-[color:var(--color-fg-subtle)] line-through decoration-[color:var(--color-fg-subtle)]/50 md:text-[22px]">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
              This is
            </p>
            <ul className="mt-6 space-y-5">
              {BUT_THIS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-primary)]/30 pb-5"
                >
                  <span className="font-heading text-[18px] font-semibold text-[color:var(--color-fg)] md:text-[22px]">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
