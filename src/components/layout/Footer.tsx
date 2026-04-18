import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <div className="container-narrow">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start md:gap-20">
          <div className="max-w-md">
            <p className="font-heading text-[17px] font-semibold text-foreground">
              NexGen
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Mumbai → Munich. Delhi → Aachen. Your city, verified. No agents, ever.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
              Winter 2026 · India → Germany
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px]">
            <Link href="/why" className="text-muted-foreground hover:text-foreground">Why</Link>
            <Link href="/process" className="text-muted-foreground hover:text-foreground">Process</Link>
            <Link href="/founder" className="text-muted-foreground hover:text-foreground">Founder</Link>
            <a href="mailto:aayush@nexgenconnect.com" className="text-muted-foreground hover:text-foreground">Email</a>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 text-[12px] text-subtle md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} NexGen Connect. Built in Ahmedabad.</p>
          <p className="font-mono uppercase tracking-[0.14em]">Pre-launch · Beta opens WS26</p>
        </div>
      </div>
    </footer>
  );
}
