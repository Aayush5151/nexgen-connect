import { SectionLabel } from "@/components/ui/SectionLabel";

const cohort = Array.from({ length: 10 }, (_, i) => ({
  initials: ["MR", "AP", "SK", "VJ", "NR", "KD", "TS", "HB", "RD", "AG"][i],
  city: ["Mumbai", "Mumbai", "Mumbai", "Mumbai", "Mumbai", "Mumbai", "Mumbai", "Mumbai", "Mumbai", "Mumbai"][i],
  program: ["MSc Informatics", "MSc Mech Eng", "MSc Data Eng", "MSc Robotics", "MSc Electrical", "MSc Informatics", "MSc Computational Sci", "MSc Finance & Info", "MSc Informatics", "MSc Management"][i],
}));

export function CohortSection() {
  return (
    <section className="border-t border-border section-y">
      <div className="container-narrow">
        <div className="max-w-[720px]">
          <SectionLabel>Who you&apos;ll actually match with</SectionLabel>
          <h2 className="mt-5 font-heading text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
            Not a feed. A cohort of ten.
          </h2>
          <p className="mt-6 max-w-[620px] text-lg leading-[1.55] text-muted-foreground">
            When your cohort fills, we introduce you to the 9 other verified students
            from your city going to your university in your intake. Not 500 strangers.
            Not an algorithm that guesses. Ten real people. Their names. Their photos.
            Their LinkedIn. Your first WhatsApp group that isn&apos;t spam.
          </p>
        </div>

        <div className="relative mt-14">
          {/* Unlock overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gradient-to-b from-transparent via-[#0B0B0F]/50 to-[#0B0B0F]/90">
            <div className="rounded-full border border-border bg-[#121217]/90 px-5 py-2 backdrop-blur-sm">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Unlocks when your cohort fills
              </p>
            </div>
          </div>

          {/* Blurred cohort grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4" aria-hidden="true">
            {cohort.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-[#121217] p-4 blur-[2px] opacity-60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1C22] font-mono text-[13px] font-medium text-muted-foreground">
                  {p.initials}
                </div>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {p.city} → TUM
                </p>
                <p className="mt-1 text-[13px] text-foreground">
                  {p.program}
                </p>
                <p className="mt-1 font-mono text-[10px] text-subtle">
                  WS26
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
