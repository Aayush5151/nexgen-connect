import { WaitlistForm } from "@/components/shared/WaitlistForm";

export function FinalCTA() {
  return (
    <section id="join" className="border-t border-border py-28 md:py-40">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-left">
          <h2 className="font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-6xl">
            The Winter 2026 cohort is filling.
          </h2>
          <p className="mt-6 max-w-[560px] text-lg leading-[1.55] text-muted-foreground">
            The first 1,000 students join free during beta. Pricing will be
            announced before launch. Until then, real honesty is the only currency.
          </p>

          <div className="mt-10">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
