import { Hairline } from "@/components/ui/Hairline";
import { SectionLabel } from "@/components/ui/SectionLabel";

const PRINCIPLES = [
  {
    number: "01",
    title: "Students only.",
    body: "No immigration agents. No ads. No recruiters. The only people on NexGen are students going where you're going.",
  },
  {
    number: "02",
    title: "Verified, not assumed.",
    body: "Every profile is checked against a government ID and an admit letter before it's visible to anyone else.",
  },
  {
    number: "03",
    title: "One profile at a time.",
    body: "No groups with 500 unread messages. We surface one verified match a day from your city, heading to your university.",
  },
  {
    number: "04",
    title: "Safety by default.",
    body: "Instagram reveals only after a mutual match. Report anyone in one tap. Your phone number is stored as a hash, never in plain text.",
  },
];

export function ManifestoSection() {
  return (
    <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="container-narrow">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <SectionLabel>Principles</SectionLabel>
            <h2 className="mt-4 font-heading text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[44px]">
              What we will never be.
            </h2>
            <p className="mt-4 max-w-[360px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              A lot of moving-abroad apps are quietly run by agents. NexGen is
              built so that can&apos;t happen here.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
              {PRINCIPLES.map((p) => (
                <li
                  key={p.number}
                  className="grid gap-4 py-6 md:grid-cols-[auto_1fr] md:gap-8"
                >
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    {p.number}
                  </span>
                  <div>
                    <h3 className="font-heading text-[20px] font-semibold leading-tight text-[color:var(--color-fg)]">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Hairline className="mt-16 opacity-0" />
      </div>
    </section>
  );
}
