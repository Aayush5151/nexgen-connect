import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 items-center py-32">
        <div className="container-narrow">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            SEPT 2026 · INDIA → IRELAND · WAITLIST OPEN
          </p>
          <h1 className="mt-8 font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[64px]">
            Land in Dublin.
            <br />
            Know 9 people.
          </h1>
          <p className="mt-6 max-w-[460px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            Meet verified students from your city going to UCD, Trinity, or UCC —
            before your September 2026 flight.
          </p>
          <p className="mt-16 font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Site rebuild in progress · back in a day
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
