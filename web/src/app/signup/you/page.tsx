"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";

/**
 * /signup/you — name + email + home city + DOB month. Step 3 of 7.
 * v16 web pivot §Bucket 4.
 */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SignupYouPage() {
  const router = useRouter();
  const sessionToken = useSignup((s) => s.sessionToken);
  const setProfile = useSignup((s) => s.setProfile);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [dobMonth, setDobMonth] = useState<number | "">("");

  useEffect(() => {
    if (!sessionToken) router.replace("/signup");
  }, [sessionToken, router]);

  const canSubmit =
    firstName.trim().length >= 1 &&
    homeCity.trim().length >= 1 &&
    typeof dobMonth === "number";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setProfile({
      firstName: firstName.trim(),
      email: email.trim() || null,
      homeCity: homeCity.trim(),
      dobMonth: dobMonth as number,
    });
    router.push("/signup/corridor");
  }

  return (
    <SignupShell step={3}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Quick hello.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        Three things. None of these are advertised back to anyone.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field label="First name">
          <input
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={baseInput}
          />
        </Field>
        <Field label="Email (optional)" hint="Backup if SMS fails. We don't market.">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={baseInput}
          />
        </Field>
        <Field label="Home city">
          <input
            type="text"
            autoComplete="address-level2"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
            placeholder="Mumbai, Pune, Aizawl…"
            className={baseInput}
          />
        </Field>
        <Field label="Birth month" hint="Year-month only — never the day.">
          <select
            value={dobMonth}
            onChange={(e) => setDobMonth(e.target.value ? parseInt(e.target.value, 10) : "")}
            className={baseInput}
          >
            <option value="">Select…</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue
        </button>
      </form>
    </SignupShell>
  );
}

const baseInput =
  "h-12 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">{hint}</p>}
    </div>
  );
}
