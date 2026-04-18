import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FounderPhoto } from "@/components/shared/FounderPhoto";

export function FounderBlock() {
  return (
    <section className="border-t border-border section-y">
      <div className="container-narrow">
        <div className="mx-auto flex max-w-[720px] flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
          <FounderPhoto
            src="/images/aayush.jpg"
            alt="Aayush Shah — Founder, NexGen Connect"
            initials="AS"
            size={160}
            className="shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[17px] leading-[1.55] text-foreground">
              I&apos;m Aayush. I&apos;m building this from Ahmedabad because I watched
              too many friends land in Germany alone and crash emotionally in week
              three. I wanted something better for the next one.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                Aayush Shah · Founder · Ahmedabad
              </span>
              <a
                href="mailto:aayush@nexgenconnect.com"
                className="text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
              >
                aayush@nexgenconnect.com
              </a>
              <Link
                href="/founder"
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover"
              >
                Read the full story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
