import { Hairline } from "@/components/ui/Hairline";

export function Manifesto() {
  return (
    <section className="border-t border-border section-y">
      <div className="container-narrow">
        <div className="max-w-[720px]">
          <Hairline short className="mb-8" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Familiarity Before Foreignness
          </p>

          <p className="mt-8 font-heading text-[28px] leading-[1.35] tracking-[-0.01em] text-foreground">
            You don&apos;t need more connections.
          </p>
          <p className="mt-6 font-heading text-[28px] leading-[1.35] tracking-[-0.01em] text-foreground">
            You need something familiar.
          </p>
          <p className="mt-6 font-heading text-[28px] leading-[1.35] tracking-[-0.01em] text-foreground">
            Someone who feels like home,{" "}
            <span className="italic text-muted-foreground">
              in a place that doesn&apos;t.
            </span>
          </p>

          <p className="mt-10 text-[17px] leading-[1.6] text-muted-foreground">
            That&apos;s why we start with where you&apos;re from. Mumbai → Munich. Delhi → Aachen.
            Pune → Berlin. Not just Germany. Not just &ldquo;international students.&rdquo; The person
            who grew up in the same traffic, ate at the same paav bhaji joint, took the
            same train. They&apos;re already moving. We just introduce you before you both land.
          </p>
        </div>
      </div>
    </section>
  );
}
