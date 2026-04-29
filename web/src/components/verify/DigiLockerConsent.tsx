"use client";

import { useState, useTransition } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { startDigiLockerAction } from "@/app/actions/digilocker";

/**
 * DigiLocker consent + CTA. Two required checkboxes enable the button;
 * the button calls startDigiLockerAction() and redirects to the returned
 * authorize URL (mock mode short-circuits to our own callback).
 */

export function DigiLockerConsent({
  firstName,
}: {
  firstName: string;
}) {
  const [receiveOk, setReceiveOk] = useState(false);
  const [storeOk, setStoreOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const ready = receiveOk && storeOk;

  const onContinue = () => {
    setError(null);
    startTransition(async () => {
      const result = await startDigiLockerAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Full-page redirect - the government (or mock) expects a browser
      // navigation, not fetch(). router.push() would stay within the SPA.
      window.location.href = result.authorizeUrl;
    });
  };

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-8">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
          >
            <ShieldCheck
              className="h-5 w-5 text-[color:var(--color-primary)]"
              strokeWidth={1.8}
            />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Step 02 &middot; Identity
            </p>
            <h2 className="mt-1 font-serif text-[28px] font-normal leading-[1.1] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[32px]">
              {firstName ? `Ready, ${firstName}?` : "Verify your identity"}
            </h2>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              DigiLocker will ask you to sign in with your Aadhaar-linked
              phone and confirm consent. We receive{" "}
              <strong className="text-[color:var(--color-fg)]">
                only your name and last-4 digits
              </strong>
              . The full number never reaches our servers.
            </p>
          </div>
        </div>

        <hr className="my-6 border-[color:var(--color-border)]" />

        <div className="space-y-4">
          <ConsentCheckbox
            checked={receiveOk}
            onChange={setReceiveOk}
            label="I consent to NexGen Connect receiving my Aadhaar name and last-4 digits via DigiLocker."
          />
          <ConsentCheckbox
            checked={storeOk}
            onChange={setStoreOk}
            label="I understand my full Aadhaar number is never stored or shared by NexGen Connect."
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-[8px] border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 px-3 py-2 text-[13px] text-[color:var(--color-warning)]"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!ready || isPending}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-6 text-[15px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Opening DigiLocker…" : "Continue to DigiLocker"}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>

        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          You&rsquo;ll return here automatically
        </p>
      </div>

      <details className="mt-6 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)]">
        <summary className="cursor-pointer font-heading text-[14px] font-semibold text-[color:var(--color-fg)]">
          What exactly is shared?
        </summary>
        <ul className="mt-3 space-y-2 pl-5 [list-style-type:disc]">
          <li>
            <strong className="text-[color:var(--color-fg)]">From DigiLocker to us:</strong>{" "}
            your legal name (as on Aadhaar) and the last 4 digits.
          </li>
          <li>
            <strong className="text-[color:var(--color-fg)]">Never shared:</strong>{" "}
            full Aadhaar number, date of birth, address, photo, biometrics.
          </li>
          <li>
            <strong className="text-[color:var(--color-fg)]">How it&rsquo;s stored:</strong>{" "}
            the last-4 digits (plain) plus a one-way hash of DigiLocker&rsquo;s
            reference token. The reference token is never recoverable from the
            hash.
          </li>
          <li>
            <strong className="text-[color:var(--color-fg)]">Why:</strong>{" "}
            so your city-and-university group is full of real verified
            students, not agents or bots.
          </li>
        </ul>
      </details>
    </div>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.5] text-[color:var(--color-fg)]">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          checked
            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]"
            : "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]"
        }`}
      >
        {checked && (
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 text-[color:var(--color-primary-fg)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5l3 3 7-7" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
