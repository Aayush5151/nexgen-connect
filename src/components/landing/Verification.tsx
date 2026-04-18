import { Phone, FileCheck, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const steps = [
  {
    icon: Phone,
    title: "Phone + OTP",
    body: "Your number is verified before you see a single profile. One-time passcode via SMS. Takes 30 seconds.",
    caveat: null,
  },
  {
    icon: FileCheck,
    title: "Admit letter",
    body: "Upload your official admit from TU Munich, RWTH Aachen, TU Berlin, KIT, or TU Darmstadt. A human reads it. Not an AI. Turnaround within 48 hours.",
    caveat: "No MOUs yet. We manually cross-check against the university's admissions office. Partnerships in progress.",
  },
  {
    icon: ShieldCheck,
    title: "DigiLocker Aadhaar",
    body: "We use DigiLocker's official Aadhaar verification flow. Your Aadhaar number is never stored on our servers. We only keep the verification receipt.",
    caveat: null,
  },
];

export function Verification() {
  return (
    <section className="border-t border-border section-y">
      <div className="container-narrow">
        <div className="max-w-[720px]">
          <SectionLabel>How we keep out the 387 strangers</SectionLabel>
          <h2 className="mt-5 font-heading text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
            Three steps.{" "}
            <span className="text-muted-foreground">No shortcuts.</span>
          </h2>
          <p className="mt-6 max-w-[620px] text-lg leading-[1.55] text-muted-foreground">
            Every person you match with has done these three things.
            If a step isn&apos;t ready yet, we say so. Parents read this.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col rounded-2xl border border-border bg-[#121217] p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B0B0F] text-primary">
                  <step.icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              {step.caveat && (
                <p className="mt-4 border-l-2 border-[#E8EC6F]/40 pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
                  {step.caveat}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
