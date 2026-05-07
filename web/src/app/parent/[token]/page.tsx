/**
 * /parent/[token] — read-only dashboard the parent opens from the email.
 *
 * Server Component. Validates the token via /api/parent-link/verify
 * (uses HMAC + DB lookup). Single-use: a successful render marks the
 * row consumed.
 *
 * v16 web pivot §Bucket 8.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

// Magic-link tokens land in the URL path — keep search engines (and
// archive scrapers) away so they never consume a link the parent
// hasn't opened yet. robots.txt also Disallows /parent/ as a
// belt-and-braces second layer.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

type VerifyResult = {
  ok: true;
  studentFirstName: string;
  studentUni: string;
  groupSize: number;
  verified: boolean;
  arrival: { airport: string | null; scheduledAt: string | null; status: string } | null;
} | { ok: false; reason: string };

async function verifyToken(token: string): Promise<VerifyResult> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/parent-link/verify`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      return { ok: false, reason: body.error ?? `HTTP ${res.status}` };
    }
    return (await res.json()) as VerifyResult;
  } catch {
    return { ok: false, reason: "network_error" };
  }
}

export default async function ParentLandingPage({ params }: Props) {
  const { token } = await params;
  const result = await verifyToken(token);

  if (!result.ok) {
    return <ExpiredOrInvalid reason={result.reason} />;
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          NexGen Connect · parent view
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          {result.studentFirstName} is set.
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          {result.studentUni}. This page is read-only and closes the moment you leave.
          Ask {result.studentFirstName} for a fresh link any time.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3">
        <Card label="Verified" value={result.verified ? "Yes" : "Pending"} />
        <Card label="Group size" value={`${result.groupSize}`} />
      </section>

      <section className="mt-6 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Arrival
        </p>
        {result.arrival ? (
          <>
            <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
              {result.arrival.airport
                ? `Landing at ${result.arrival.airport}`
                : "Landing time set"}
              {" · "}
              {result.arrival.scheduledAt
                ? new Date(result.arrival.scheduledAt).toLocaleString()
                : "TBA"}
            </p>
            <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">
              Status: {result.arrival.status}
            </p>
          </>
        ) : (
          <p className="mt-3 text-[14px] text-[color:var(--color-fg-muted)]">
            {result.studentFirstName} hasn&apos;t set an arrival check-in yet.
          </p>
        )}
      </section>

      <p className="mt-10 text-center text-[12px] text-[color:var(--color-fg-subtle)]">
        We don&apos;t share chats. We don&apos;t share location. This view is the
        whole product — the rest is between {result.studentFirstName} and their
        verified circle.
      </p>

      <p className="mt-3 text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        <Link href="/" className="underline decoration-dotted underline-offset-4">
          NexGen Connect
        </Link>
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl font-semibold text-[color:var(--color-fg)]">{value}</p>
    </div>
  );
}

function ExpiredOrInvalid({ reason }: { reason: string }) {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-16 text-center">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-warning,#b45309)]">
        Link expired
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Ask for a fresh link.
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        Parent links work once and expire after an hour. Your child can send
        a new one from their NexGen Connect profile in seconds.
      </p>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        ref: {reason}
      </p>
    </div>
  );
}
