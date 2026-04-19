import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const NOISE = [
  { from: "Forex Deals", text: "96.5 INR/EUR DM for rate" },
  { from: "Unknown +91", text: "Hi anyone from Indore??" },
  { from: "AgentPro", text: "FREE visa consultation" },
  { from: "Ballsbridge Rent", text: "Studio €1400 from 1 Sept" },
  { from: "Forex Deals", text: "97.1 best rate guaranteed" },
];

const VERIFIED = [
  { initials: "RM", city: "Mumbai" },
  { initials: "KS", city: "Bangalore" },
  { initials: "AP", city: "Pune" },
  { initials: "MD", city: "Delhi" },
  { initials: "PV", city: "Hyderabad" },
  { initials: "IR", city: "Chennai" },
  { initials: "SK", city: "Mumbai" },
  { initials: "RG", city: "Pune" },
  { initials: "NL", city: "Delhi" },
  { initials: "AD", city: "Mumbai" },
];

export function SplitCompare() {
  return (
    <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">The switch</SectionLabel>
          <h2 className="mt-4 font-serif text-[48px] font-normal leading-[1.0] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[72px]">
            Same flight.
            <br />
            <em className="italic text-[color:var(--color-fg-muted)]">Different phone.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            The WhatsApp group you&apos;d join. The NexGen group you will.
            Same flight. Only one has people from your city.
          </p>
        </div>

        <div className="mt-16 grid items-start gap-10 md:mt-20 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <Column
            label="Without NexGen"
            labelTone="muted"
            caption="487 strangers. Agents. Forex spam. Nobody from your city."
          >
            <PhoneFrame tone="muted">
              <NoisePanel />
            </PhoneFrame>
          </Column>

          <div className="flex justify-center" aria-hidden>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">
              <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" strokeWidth={2} />
            </div>
          </div>

          <Column
            label="With NexGen"
            labelTone="primary"
            caption="10 verified classmates. Your city. Your university. Your flight."
          >
            <PhoneFrame tone="primary">
              <GroupPanel />
            </PhoneFrame>
          </Column>
        </div>
      </div>
    </section>
  );
}

function Column({
  label,
  labelTone,
  caption,
  children,
}: {
  label: string;
  labelTone: "muted" | "primary";
  caption: string;
  children: React.ReactNode;
}) {
  const color =
    labelTone === "primary"
      ? "text-[color:var(--color-primary)]"
      : "text-[color:var(--color-fg-subtle)]";
  return (
    <div className="flex flex-col items-center text-center">
      <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${color}`}>
        {label}
      </p>
      <div className="mt-5">{children}</div>
      <p className="mt-6 max-w-[260px] text-[14px] leading-[1.5] text-[color:var(--color-fg-muted)]">
        {caption}
      </p>
    </div>
  );
}

function PhoneFrame({
  tone,
  children,
}: {
  tone: "muted" | "primary";
  children: React.ReactNode;
}) {
  const ring =
    tone === "primary"
      ? "border-[color:var(--color-primary)]/40 shadow-[0_12px_40px_rgba(47,95,30,0.22)]"
      : "border-[color:var(--color-border-strong)] shadow-[0_8px_24px_rgba(0,0,0,0.22)]";
  return (
    <div
      className={`h-[480px] w-[260px] overflow-hidden rounded-[32px] border bg-[color:var(--color-surface)] md:h-[520px] md:w-[280px] ${ring}`}
    >
      <div className="flex items-center justify-between px-6 pt-5 font-mono text-[10px] font-semibold text-[color:var(--color-fg-muted)]">
        <span>9:14</span>
        <span className="h-1.5 w-14 rounded-full bg-[color:var(--color-border-strong)]" />
        <span>•••</span>
      </div>
      <div className="px-4 pb-5 pt-4">{children}</div>
    </div>
  );
}

function NoisePanel() {
  return (
    <div>
      <div className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2">
        <p className="font-heading text-[12px] font-semibold text-[color:var(--color-fg)]">
          India → Ireland Sept 2026
        </p>
        <p className="mt-0.5 text-[10px] text-[color:var(--color-fg-subtle)]">
          487 members · 18 typing…
        </p>
      </div>
      <div className="mt-3 space-y-1.5">
        {NOISE.map((m, i) => (
          <div
            key={i}
            className="rounded-md bg-[color:var(--color-bg)] px-3 py-1.5"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-[color:var(--color-fg-muted)]">
              {m.from}
            </p>
            <p className="mt-0.5 text-[11px] leading-[1.35] text-[color:var(--color-fg)]">
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md bg-[color:var(--color-bg)] px-3 py-1.5 text-center">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
          482 new messages
        </p>
      </div>
    </div>
  );
}

function GroupPanel() {
  return (
    <div>
      <div className="rounded-[10px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 px-3 py-2">
        <p className="font-heading text-[12px] font-semibold text-[color:var(--color-fg)]">
          Mumbai → UCD · Sept 2026
        </p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
          10 DigiLocker verified
        </p>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {VERIFIED.map((a) => (
          <div
            key={`${a.initials}-${a.city}`}
            className="flex flex-col items-center rounded-[6px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-1.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] font-heading text-[10px] font-semibold text-[color:var(--color-primary)]">
              {a.initials}
            </div>
            <p className="mt-1 text-[8px] font-medium text-[color:var(--color-fg-muted)]">
              {a.city}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 px-3 py-1.5 text-center">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
          All 10 from your city
        </p>
      </div>
    </div>
  );
}
