import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verification failed · NexGen Connect",
  robots: { index: false, follow: false },
};

/**
 * Reason codes are intentionally opaque to the user. We never leak which
 * internal stage failed (token vs PKCE vs signature) since that helps
 * attackers. All reasons map to 2 or 3 friendly buckets.
 */
const REASONS: Record<string, { title: string; body: string }> = {
  denied: {
    title: "You declined the consent",
    body: "No problem. DigiLocker only shares what you approve. You can retry any time.",
  },
  malformed: {
    title: "The redirect looked wrong",
    body: "DigiLocker didn't send the usual query parameters. Try starting again.",
  },
  session_expired: {
    title: "Your session timed out",
    body: "The verification session is good for 15 minutes. Start again from the home page.",
  },
  expired: {
    title: "The DigiLocker window expired",
    body: "You have 10 minutes from clicking Continue. Start again to get a fresh link.",
  },
  state: {
    title: "Safety check blocked this",
    body: "The callback didn't match the session we issued. This is usually benign. Please retry.",
  },
  pkce: {
    title: "Safety check blocked this",
    body: "A security token from your browser didn't reach our server. Disable aggressive cookie blockers and retry.",
  },
  token: {
    title: "DigiLocker couldn't issue a token",
    body: "The government server returned an error during exchange. Often transient. Retry in a minute.",
  },
  fetch: {
    title: "Aadhaar couldn't be fetched",
    body: "DigiLocker authorised us but couldn't deliver the eAadhaar document. Retry, or check your DigiLocker account.",
  },
  persist: {
    title: "Our database hiccupped",
    body: "We got your verification but couldn't save it. Retry once. If it keeps failing, email us.",
  },
  unexpected: {
    title: "Something went wrong",
    body: "We logged the error and will look into it. Retry, or email us if this keeps happening.",
  },
};

export default async function DigiLockerErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason ?? "unexpected";
  const info = REASONS[reason] ?? REASONS.unexpected;

  return (
    <main className="min-h-dvh border-t border-[color:var(--color-border)] py-16 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-[520px] text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10"
          >
            <AlertCircle
              className="h-8 w-8 text-[color:var(--color-warning)]"
              strokeWidth={1.8}
            />
          </span>
          <SectionLabel className="mx-auto mt-6">
            Verification didn&rsquo;t finish
          </SectionLabel>
          <h1 className="mt-3 font-serif text-[32px] font-normal leading-[1.1] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[42px]">
            {info.title}
          </h1>
          <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            {info.body}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href="/verify/digilocker"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]"
            >
              Try again
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="mailto:hello@nexgenconnect.com"
              className="text-[13px] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg-muted)]"
            >
              Email support
            </Link>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Error code: {reason}
          </p>
        </div>
      </div>
    </main>
  );
}
