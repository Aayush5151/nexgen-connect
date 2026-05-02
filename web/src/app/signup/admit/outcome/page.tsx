"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { verificationStatus } from "@/lib/signup/mock-services";

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
  const reset = useSignup((s) => s.reset);

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
          // The funnel's job ends here. The product surface (/app) lives in
          // Bucket 5. We wipe the funnel state and route there — Bucket 5
          // will land its own gating + onboarding.
          reset();
          router.push("/app/corridor");
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
  return (
    <div>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        You&apos;re in
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Welcome, {firstName}.
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        A reviewer confirmed your admit to {uni}. Your corridor is open.
        From here you&apos;ll meet verified students from your home city
        and arrive with a real circle.
      </p>

      <div className="mt-8 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          What&apos;s next
        </p>
        <ul className="mt-3 space-y-2 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
          <li>1. Open your corridor — see who else is verified for the same intake.</li>
          <li>2. We email you when a hometown crew (Layer 1) reaches you.</li>
          <li>3. Aayush calls if you&apos;re among the first five in this corridor.</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
      >
        Open my corridor
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
