import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 items-center py-32 md:py-40">
        <div className="container-narrow">
          <div className="max-w-[560px]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              404
            </p>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-6xl">
              This page doesn&apos;t exist.
            </h1>
            <p className="mt-6 text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              Probably a link from the old site. The waitlist is still open.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]"
              >
                Back to home →
              </Link>
              <Link
                href="/how"
                className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
