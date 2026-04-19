import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Four verification checks. Each one real. Each one yours to see.",
};

export default function HowPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 items-center py-32">
        <div className="container-narrow">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            HOW IT WORKS
          </p>
          <h1 className="mt-8 font-heading text-[48px] font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Verified the way your mother would.
          </h1>
          <p className="mt-6 max-w-[460px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            Four checks. Each one real. Each one yours to see.
          </p>
          <p className="mt-12 font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Full page in progress · back in a day
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
