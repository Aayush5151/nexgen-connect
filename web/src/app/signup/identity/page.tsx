"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { verificationStartDigiLocker, verificationCompleteDigiLocker } from "@/lib/signup/services";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * /signup/identity — DigiLocker handoff. Step 6 of 7.
 *
 * Mount-gated: bounces to /signup if the visitor has no Supabase session
 * AND no zustand session marker. Without this gate, anyone landing here
 * could click "Open DigiLocker" and start a real OAuth handoff under our
 * partner credentials. The downstream API routes refuse unauthed requests,
 * but the wasted DigiLocker session + confusing UX is itself a leak.
 *
 * Aadhaar is never read here. We get a signed token; the composite
 * hash is computed server-side. Per Privacy Policy §1 + §3.1.
 *
 * v16 web pivot §Bucket 4 / security hardening §May2026.
 */
export default function SignupIdentityPage() {
  const router = useRouter();
  const setIdentity = useSignup((s) => s.setIdentity);
  const setIdentityFailure = useSignup((s) => s.setIdentityFailure);
  const zustandSession = useSignup((s) => s.sessionToken);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateReady, setGateReady] = useState(false);

  // Mount auth gate. Accept either: (a) Supabase SSR session, or (b)
  // zustand sessionToken (covers phone-OTP funnel where the SSR cookie
  // is set asynchronously). Refuses everyone else by bouncing to /signup.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (zustandSession) {
        if (!cancelled) setGateReady(true);
        return;
      }
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data?.user) {
          setGateReady(true);
        } else {
          router.replace("/signup");
        }
      } catch {
        if (!cancelled) router.replace("/signup");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, zustandSession]);

  async function onClick() {
    setSubmitting(true);
    setError(null);
    try {
      const start = await verificationStartDigiLocker();
      // Mock: simulate the round-trip in-place. Real impl redirects to
      // start.authUrl and DigiLocker hits our /signup/identity/callback.
      const res = await verificationCompleteDigiLocker({ state: start.state, code: "mock-code" });
      setIdentity(res.maskedHash);
      router.push("/signup/admit");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error.";
      const reason = msg.includes("aadhaar_not_linked")
        ? "aadhaar_not_linked"
        : msg.includes("mobile_changed")
          ? "mobile_changed"
          : msg.includes("deactivated")
            ? "deactivated"
            : msg.includes("invisible_character")
              ? "invisible_character"
              : null;
      if (reason) setIdentityFailure(reason);
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <SignupShell step={6}>
      {!gateReady && (
        <p className="font-mono text-[11px] text-[color:var(--color-fg-muted)]">
          Checking your session…
        </p>
      )}
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        Identity, anchored
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Not your Aadhaar.
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        DigiLocker confirms you own a valid Aadhaar via a signed token.
        The 12-digit number itself never reaches our servers.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Cell title="WE SEE" lines={["Name + DOB-month", "Verification token", "Last-4 of identity hash"]} />
        <Cell title="WE NEVER SEE" lines={["Aadhaar number", "Date of birth (day)", "Address"]} />
      </div>

      {error && (
        <p className="mt-4 text-[12px] text-[color:var(--color-danger)]">
          {error.includes("E03") ? "Verification didn't go through. We'll send you to the manual fallback." : error}
        </p>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={submitting}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Verifying…" : "Open DigiLocker"}
      </button>
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-3 text-center text-[11px] text-[color:var(--color-fg-subtle)]">
          Mock dev: this simulates the OAuth round-trip in-place.
        </p>
      )}
    </SignupShell>
  );
}

function Cell({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {title}
      </p>
      <ul className="mt-3 space-y-1 text-[12px] text-[color:var(--color-fg-muted)]">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
