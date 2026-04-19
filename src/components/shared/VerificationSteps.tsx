import { Phone, FileCheck, ShieldCheck, Users } from "lucide-react";

const STEPS = [
  {
    idx: "01",
    icon: Phone,
    duration: "30 seconds",
    title: "Phone OTP",
    body: "We text a six-digit code via MSG91. Your number is hashed on arrival. Never stored in plain text.",
    caveat: "Sent to your phone in India or Ireland.",
    status: null as string | null,
  },
  {
    idx: "02",
    icon: FileCheck,
    duration: "48 hours",
    title: "Admit letter",
    body: "Upload the PDF from UCD, Trinity, or UCC. A real human (me) reviews it. No bots.",
    caveat: "If I am travelling it can take 72 hours. I will email you if so.",
    status: null,
  },
  {
    idx: "03",
    icon: ShieldCheck,
    duration: "2 minutes",
    title: "DigiLocker Aadhaar",
    body: "Government consent flow. We only receive a verification token. Your Aadhaar number never touches our servers.",
    caveat: "Live after August 2026. Until then we verify a passport or PAN manually.",
    status: "Coming Aug 2026",
  },
  {
    idx: "04",
    icon: Users,
    duration: "Rolling",
    title: "Group unlocks",
    body: "When your city × university × intake passes ten verified students, DMs enable and the group directory goes live.",
    caveat: "If your group does not hit ten by flight-date we merge you into the all-university fallback.",
    status: null,
  },
];

export function VerificationSteps() {
  return (
    <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
      {STEPS.map((s) => {
        const Icon = s.icon;
        return (
          <li
            key={s.idx}
            className="relative rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10">
                <Icon
                  className="h-4 w-4 text-[color:var(--color-primary)]"
                  strokeWidth={2}
                />
              </div>
              {s.status && (
                <span className="rounded-full border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-warning)]">
                  {s.status}
                </span>
              )}
            </div>

            <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              Step {s.idx}
            </p>
            <h3 className="mt-1 font-heading text-[18px] font-semibold leading-tight text-[color:var(--color-fg)]">
              {s.title}
            </h3>
            <p className="mt-1 font-mono text-[12px] text-[color:var(--color-primary)]">
              {s.duration}
            </p>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              {s.body}
            </p>
            <p className="mt-4 border-t border-[color:var(--color-border)] pt-3 text-[12px] leading-[1.5] text-[color:var(--color-fg-subtle)]">
              {s.caveat}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
