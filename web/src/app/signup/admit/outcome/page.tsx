"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { verificationStatus } from "@/lib/signup/services";

/**
 * /signup/admit/outcome — terminal state for the funnel.
 *
 * Branches on admit state:
 *   approved  → "You're in." + entry into the product surface (/app)
 *   rejected  → "Almost there." + reviewer note + resubmit option
 *
 * Mock: verificationStatus() always returns "approved" in dev. Dev can
 * force the rejected branch via ?mock=rejected for design review. Real
 * impl reads the state straight off the auth session in Bucket 6.
 *
 * useSearchParams() forces a CSR bailout in Next.js 16, so the inner
 * component is wrapped in <Suspense> to preserve static prerendering
 * of the shell.
 *
 * v16 web pivot §Bucket 4.
 */
export default function SignupAdmitOutcomePage() {
  return (
    <Suspense fallback={<OutcomeLoading />}>
      <SignupAdmitOutcomeInner />
    </Suspense>
  );
}

function OutcomeLoading() {
  return (
    <SignupShell step={7}>
      <p className="text-[15px] text-[color:var(--color-fg-muted)]">
        Loading decision…
      </p>
    </SignupShell>
  );
}

function SignupAdmitOutcomeInner() {
  const router = useRouter();
  const search = useSearchParams();
  const corridorChoice = useSignup((s) => s.corridorChoice);
  const firstName = useSignup((s) => s.firstName);
  const admitState = useSignup((s) => s.admitState);
  const setAdmit = useSignup((s) => s.setAdmit);

  const [resolved, setResolved] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    if (!admitState) {
      router.replace("/signup/admit");
      return;
    }
    let cancelled = false;
    // Resolve via promise chain so the setState calls land asynchronously
    // — keeps React 19's "no setState in effect body" rule satisfied.
    (async () => {
      let next: "approved" | "rejected";
      if (search.get("mock") === "rejected") {
        next = "rejected";
      } else {
        const s = await verificationStatus();
        next = s.admit.state;
      }
      if (cancelled) return;
      setAdmit({ docId: "mock", state: next });
      setResolved(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [admitState, router, search, setAdmit]);

  if (!resolved) {
    return <OutcomeLoading />;
  }

  if (resolved === "rejected") {
    return (
      <SignupShell step={7}>
        <Rejected />
      </SignupShell>
    );
  }

  return (
    <SignupShell step={7}>
      <Approved
        firstName={firstName ?? "there"}
        uni={corridorChoice?.uni ?? "your university"}
        onContinue={() => {
          // Hard navigation to /app/corridor — funnel-exit boundary.
          //
          // Why window.location.assign and not router.push: this page
          // has a useEffect that bounces to /signup/admit when
          // admitState is falsy, and /signup/admit cascades back to
          // /signup/identity (DigiLocker) when identityHashMasked is
          // falsy. If we mutate zustand (e.g. reset()) before the SPA
          // navigation completes, those gates re-fire mid-flight and
          // the user ends up *back* at DigiLocker instead of their
          // corridor. A hard navigation fully unmounts the signup
          // tree first, so no in-flight gate can race the redirect.
          //
          // The /app layout's <FunnelReset /> handles the zustand
          // cleanup once we're safely on the authed surface.
          window.location.assign("/app/corridor");
        }}
      />
    </SignupShell>
  );
}

function Approved({
  firstName,
  uni,
  onContinue,
}: {
  firstName: string;
  uni: string;
  onContinue: () => void;
}) {
  // Verification date in long-form so the certificate moment carries
  // institutional weight. "Wednesday, 14 August 2026" reads as an
  // event; "8/14/2026" reads as a timestamp. We want the event.
  const today = new Date();
  const dateLong = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Founding-class designation. The mock has verifiedCount=47 for UCD
  // Sept '26, so newly-verified users are still inside the First Sixty
  // window. Real impl pulls verifiedCount from the corridor service.
  // For now: render the founding-class line unconditionally — the
  // strategic point is to *create the artifact*, refine the gate later.
  const isFoundingClass = true;

  return (
    <div>
      {/* CERTIFICATE — designed moment, not a status line.

          Layout discipline borrowed from a Y Combinator acceptance
          letter / Apple Card titanium reveal: serif accents, mono
          numbers, generous whitespace, the user's identity carried by
          typography. This is the institutional artifact the user
          remembers a year later. */}
      <div className="relative overflow-hidden rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-6 sm:p-8">
        {/* Soft top wash — "lit from above" treatment we use on Premium
            cards. Marks this as a featured surface, not chrome. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
          style={{
            background:
              "radial-gradient(70% 100% at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 80%)",
          }}
        />

        <p className="relative label-eyebrow text-[color:var(--color-primary)]">
          Verified · NexGen Connect
        </p>

        <h1 className="relative mt-5 font-heading text-[40px] font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)] sm:text-[48px]">
          {firstName},{" "}
          <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
            you&apos;re in.
          </span>
        </h1>

        <p className="relative mt-5 font-serif italic text-[16px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[17px]">
          Three checks. Three real things confirmed about you.
          <br />
          One verified seat in the {uni} corridor.
        </p>

        {/* Inscription — the metadata that turns this into an artifact.
            Date in long-form, founding-class line if applicable. */}
        <dl className="relative mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[color:var(--color-border)] pt-6 text-[13px]">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Corridor
            </dt>
            <dd className="mt-1 text-[color:var(--color-fg)]">{uni}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Verified on
            </dt>
            <dd className="mt-1 text-[color:var(--color-fg)]">{dateLong}</dd>
          </div>
          {isFoundingClass && (
            <div className="col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                Standing
              </dt>
              <dd className="mt-1 font-serif italic text-[15px] tracking-[-0.005em] text-[color:var(--color-fg)] sm:text-[16px]">
                Among the First Sixty of this corridor.
              </dd>
            </div>
          )}
        </dl>

        {/* Founder signature — accountability anchor.
            Personal name + email handle. The "I personally call the
            first five" line surfaces founder-presence at the moment
            of highest emotional weight in the funnel. */}
        <div className="relative mt-7 border-t border-[color:var(--color-border)] pt-6">
          <p className="font-serif italic text-[14px] leading-[1.5] tracking-[-0.005em] text-[color:var(--color-fg-muted)]">
            &ldquo;If you&rsquo;re among the first five verified in your
            corridor, I&rsquo;ll call you personally within 48 hours.&rdquo;
          </p>
          <p className="mt-3 text-[13px] font-semibold text-[color:var(--color-fg)]">
            Aayush Shah
            <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Founder
            </span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98]"
      >
        Open my corridor
        <span aria-hidden="true" className="ml-2">→</span>
      </button>
      <p className="mt-3 text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        Your admit letter auto-deletes from our storage in 60 minutes.
      </p>
    </div>
  );
}

function Rejected() {
  return (
    <div>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-warning,#b45309)]">
        Almost there
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        We need a clearer letter.
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        The reviewer couldn&apos;t confirm your admit from what we received.
        Common reasons: edges cropped, low-resolution scan, conditional offer
        without an unconditional follow-up. We&apos;d like one more upload.
      </p>

      <div className="mt-6 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Reviewer note
        </p>
        <p className="mt-3 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
          &ldquo;Letter image is cropped at the bottom. Please re-upload showing
          the registrar signature and the date of issue.&rdquo;
        </p>
      </div>

      <Link
        href="/signup/admit"
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
      >
        Re-upload admit letter
      </Link>
      <p className="mt-3 text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        Three attempts max. After that, we ask for a brief video call.
      </p>
    </div>
  );
}
