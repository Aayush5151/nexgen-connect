"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { updateProfileAction } from "@/app/actions/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * /signup/you, name + email + home city + DOB month. Step 3 of 7.
 *
 * Two entry paths converge here and both go straight to /signup/corridor:
 *
 *   1. Phone-OTP: zustand sessionToken is set by /signup/otp. The
 *      phone is the identity anchor.
 *
 *   2. OAuth (Google) / email magic-link: a Supabase Auth session
 *      exists. user_metadata.signup_method is "google" or "email".
 *      The OAuth identity IS the anchor — no second phone-OTP gate.
 *      Phone can be added later as opt-in SMS notification contact
 *      from /app/profile/settings.
 *
 * Mount gate accepts EITHER signal as "you belong in the funnel."
 *
 * The verified-trust chain (DigiLocker Aadhaar + admit-letter human
 * review) is what actually proves identity — phone OTP was only ever
 * a friction layer for the phone-only path. Asking OAuth users to
 * also phone-verify is double auth with no security upside.
 *
 * v17 one-flow / v16 web pivot §Bucket 4.
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
  const [submitting, setSubmitting] = useState(false);

  // Gate: accept either zustand phone-OTP state OR a Supabase Auth
  // session (OAuth / email). If neither, bounce to /signup.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (sessionToken) {
        // Phone-OTP entry. Profile is persisted by the submit handler
        // below — nothing to do at mount.
        return;
      }
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const user = data?.user;
        if (!user) {
          router.replace("/signup");
          return;
        }
        // Prefill email from the OAuth provider so the user doesn't
        // re-type something we already have.
        if (user.email && !email) setEmail(user.email);
        const meta = (user.user_metadata ?? {}) as {
          phone_verified_at?: string;
          first_name?: string;
          home_city?: string;
          dob_month?: number;
        };
        // Prefill any fields they've already filled (so a half-submitted
        // session resumes cleanly).
        if (meta.first_name && !firstName) setFirstName(meta.first_name);
        if (meta.home_city && !homeCity) setHomeCity(meta.home_city);
        if (typeof meta.dob_month === "number" && dobMonth === "") {
          setDobMonth(meta.dob_month);
        }
      } catch {
        router.replace("/signup");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit =
    firstName.trim().length >= 1 &&
    homeCity.trim().length >= 1 &&
    typeof dobMonth === "number" &&
    !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const profile = {
      firstName: firstName.trim(),
      email: email.trim() || null,
      homeCity: homeCity.trim(),
      dobMonth: dobMonth as number,
    };
    setProfile(profile);

    // Persist to auth.users.user_metadata so the /admin dashboard sees
    // the row at "profile" stage. SSR session was set up at /signup/otp.
    // Failure is logged but doesn't block forward navigation — local
    // zustand state remains the in-flight source of truth, and the
    // background welcome-email Inngest job will still fire because
    // phone_verified_at metadata was already stamped.
    try {
      const res = await updateProfileAction({
        first_name: profile.firstName,
        email: profile.email,
        home_city: profile.homeCity,
        dob_month: profile.dobMonth,
      });
      if (!res.ok) {
        console.warn("[signup/you] profile persist failed:", res.error);
      }
    } catch (err) {
      console.warn("[signup/you] profile action threw:", err);
    }

    // All entry paths converge here. Whichever method the user picked
    // (phone-OTP, Google OAuth, or email magic link) is their identity
    // anchor — we don't make OAuth users do a second phone OTP. The
    // verified-trust chain still tightens at the DigiLocker (Aadhaar)
    // + admit-letter steps further down the funnel, which is where the
    // real identity proof happens.
    router.push("/signup/corridor");
  }

  return (
    <SignupShell step={3}>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Quick hello.
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        Three quick things and you&apos;re in.
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
        <Field label="Email (optional)" hint="Backup if SMS fails.">
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
        <Field label="Birth month" hint="Year-month only, never the day.">
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
  // Using <label> as the wrapper implicitly associates every form
  // control inside it with the label text — no id/htmlFor plumbing,
  // axe-clean. Keeps screen-reader announcement consistent across
  // input + select + textarea variants of `children`.
  return (
    <label className="block">
      <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
      {hint && (
        <span className="mt-1 block text-[11px] text-[color:var(--color-fg-subtle)]">
          {hint}
        </span>
      )}
    </label>
  );
}
