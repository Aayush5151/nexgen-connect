import Link from "next/link";

/**
 * /app/help/scams — the 5 patterns we've actually seen.
 *
 * No filler, no general "be safe online" advice. Real patterns, real
 * details, real countermeasures. T&S advisors update this when they
 * see a sixth pattern.
 *
 * v16 web pivot §Bucket 5.
 */
export default function HelpScamsPage() {
  return (
    <div className="space-y-6 pt-2">
      <header>
        <Link
          href="/app/help"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Help
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          5 scams we&apos;ve actually seen.
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          T&amp;S advisors update this when a sixth shows up. No filler.
        </p>
      </header>

      <ol className="space-y-4">
        <Pattern
          n={1}
          title="Deposit before tour"
          tell="A landlord (or agent) asks for €500–€1,500 to &lsquo;hold&rsquo; the room before you can see it."
          do="No deposit before a tour. Ever. If they refuse a tour, walk."
        />
        <Pattern
          n={2}
          title="Fake university listings"
          tell="A spreadsheet circulating in WhatsApp groups, names a real uni, but the rooms don&apos;t exist."
          do="Cross-check on the uni&apos;s official accommodation portal. If it&apos;s not there, it&apos;s not real."
        />
        <Pattern
          n={3}
          title="Ride-share spoof at the airport"
          tell="Someone with a sign matching your name, no app, no receipt, quotes 3× the meter."
          do="Use Free Now / Bolt only. Verify plate matches the app screen before you sit in."
        />
        <Pattern
          n={4}
          title="Visa-forwarder calls"
          tell="A call claiming to be from VFS or the embassy, asking for fees in INR via UPI."
          do="VFS never calls. Hang up. Walk in to the office or use vfsglobal.com only."
        />
        <Pattern
          n={5}
          title="Group-apply impersonation"
          tell="A &lsquo;rep&rsquo; offers to handle your group&apos;s housing application for a flat fee."
          do="Only apply via /app/profile/group-apply. We work directly with verified PBSA partners."
        />
      </ol>

      <section className="rounded-[14px] border border-[color:var(--color-warning,#b45309)]/30 bg-[color:var(--color-warning,#b45309)]/[0.08] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-warning,#b45309)]">
          Saw a new one?
        </p>
        <p className="mt-2 text-[13px] leading-[1.5] text-[color:var(--color-fg)]">
          Tell us. A reviewer adds it here within 24 hours and we DM the corridor.
        </p>
        <Link
          href="/app/help#triage-other"
          className="mt-3 inline-flex h-9 items-center rounded-md bg-[color:var(--color-fg)] px-3 text-[12px] font-semibold text-[color:var(--color-bg)] hover:bg-[color:var(--color-fg-muted)]"
        >
          Report a scam
        </Link>
      </section>
    </div>
  );
}

function Pattern({
  n,
  title,
  tell,
  do: doText,
}: {
  n: number;
  title: string;
  tell: string;
  do: string;
}) {
  return (
    <li className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Pattern {n}
      </p>
      <h2 className="mt-2 font-heading text-xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        {title}
      </h2>
      <p className="mt-3 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
        <span className="font-semibold text-[color:var(--color-fg)]">Tell,</span> {tell}
      </p>
      <p className="mt-2 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
        <span className="font-semibold text-[color:var(--color-fg)]">Do,</span> {doText}
      </p>
    </li>
  );
}
