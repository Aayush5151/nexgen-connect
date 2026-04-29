import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { readVerificationSession } from "@/lib/session";
import { isDigiLockerEnabled } from "@/lib/digilocker";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DigiLockerConsent } from "@/components/verify/DigiLockerConsent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DigiLocker verification · NexGen Connect",
  description:
    "Confirm your identity via DigiLocker. Your full Aadhaar is never stored.",
  robots: { index: false, follow: false },
};

export default async function DigiLockerConsentPage() {
  if (!isDigiLockerEnabled()) {
    return <DisabledState />;
  }

  const session = await readVerificationSession();
  if (!session) {
    return <NoSessionState />;
  }

  const db = getSupabaseAdmin();
  const { data: row } = await db
    .from("waitlist")
    .select("first_name, identity_status")
    .eq("id", session.waitlist_id)
    .maybeSingle();

  // Already verified - punt to success instead of re-running the flow.
  if (row?.identity_status === "verified") {
    return <AlreadyVerifiedState firstName={row.first_name} />;
  }

  return (
    <main className="min-h-dvh border-t border-[color:var(--color-border)] py-16 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-[560px] text-center">
          <SectionLabel className="mx-auto">Step 2 of 3</SectionLabel>
          <h1 className="mx-auto mt-3 max-w-[480px] font-serif text-[36px] font-normal leading-[1.05] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[48px]">
            One consent, and{" "}
            <em className="italic text-[color:var(--color-fg-muted)]">
              you&rsquo;re in.
            </em>
          </h1>
        </div>

        <div className="mt-12">
          <DigiLockerConsent firstName={row?.first_name ?? ""} />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg-muted)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

function DisabledState() {
  return (
    <StateShell title="DigiLocker isn’t live yet">
      <p>
        Identity verification via DigiLocker is coming soon. Your phone OTP
        already holds your seat. You&rsquo;ll get an email when this step
        opens.
      </p>
    </StateShell>
  );
}

function NoSessionState() {
  return (
    <StateShell title="Start at the beginning">
      <p>
        Your verification session expired. Re-enter your phone number on
        the home page to continue.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]"
      >
        Back to home
      </Link>
    </StateShell>
  );
}

function AlreadyVerifiedState({ firstName }: { firstName: string }) {
  return (
    <StateShell title={`You’re already verified, ${firstName}.`}>
      <p>Nothing more to do here. Your group fills as others join.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-border-strong)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface)]"
      >
        Back to home
      </Link>
    </StateShell>
  );
}

function StateShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh border-t border-[color:var(--color-border)] py-16 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-[520px] text-center">
          <h1 className="font-serif text-[32px] font-normal leading-[1.1] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[40px]">
            {title}
          </h1>
          <div className="mt-4 text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
