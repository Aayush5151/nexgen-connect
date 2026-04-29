import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

import { getIdentityStatusAction } from "@/app/actions/digilocker";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Identity verified · NexGen Connect",
  robots: { index: false, follow: false },
};

export default async function DigiLockerSuccessPage() {
  const status = await getIdentityStatusAction();

  if (!status.ok) {
    return (
      <ResultShell
        icon="warn"
        label="Something's off"
        title="We couldn't read your status"
        body={status.error}
        ctaHref="/verify/digilocker"
        ctaText="Try again"
      />
    );
  }

  // Name didn't match the waitlist first_name. Treat as a soft failure.
  if (status.identity_status !== "verified") {
    return (
      <ResultShell
        icon="warn"
        label="Name mismatch"
        title="That Aadhaar doesn't match your name"
        body="The name on your Aadhaar didn't match the first name you gave us. If you signed up with a nickname, update it and try again, or reach out and we'll sort it."
        ctaHref="/verify/digilocker"
        ctaText="Try again"
        secondary={{ href: "mailto:hello@nexgenconnect.com", text: "Email support" }}
      />
    );
  }

  return (
    <ResultShell
      icon="ok"
      label="Identity verified"
      title="You're in the real-students-only lane"
      body={
        status.aadhaar_last4
          ? `Your Aadhaar ending in ${status.aadhaar_last4} is linked. Full number was never shared with us.`
          : "Your DigiLocker identity is now linked to this seat."
      }
      ctaHref="/"
      ctaText="Back to home"
    />
  );
}

function ResultShell({
  icon,
  label,
  title,
  body,
  ctaHref,
  ctaText,
  secondary,
}: {
  icon: "ok" | "warn";
  label: string;
  title: string;
  body: string;
  ctaHref: string;
  ctaText: string;
  secondary?: { href: string; text: string };
}) {
  const Icon = icon === "ok" ? CheckCircle2 : AlertCircle;
  const ring =
    icon === "ok"
      ? "border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
      : "border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10";
  const iconClass =
    icon === "ok"
      ? "text-[color:var(--color-primary)]"
      : "text-[color:var(--color-warning)]";

  return (
    <main className="min-h-dvh border-t border-[color:var(--color-border)] py-16 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-[520px] text-center">
          <span
            aria-hidden="true"
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${ring}`}
          >
            <Icon className={`h-8 w-8 ${iconClass}`} strokeWidth={1.8} />
          </span>
          <SectionLabel className="mx-auto mt-6">{label}</SectionLabel>
          <h1 className="mt-3 font-serif text-[32px] font-normal leading-[1.1] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[42px]">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            {body}
          </p>

          {icon === "ok" && (
            <div className="mx-auto mt-8 flex max-w-[360px] items-center justify-center gap-3 rounded-[10px] border border-[color:var(--color-primary)]/20 bg-[color:var(--color-surface)] px-4 py-3 text-left">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-[color:var(--color-primary)]"
                strokeWidth={1.8}
              />
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)]">
                Aadhaar name matches your profile
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="text-[13px] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg-muted)]"
              >
                {secondary.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
