"use client";

import { useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/lib/app/use-reduced-motion";

/**
 * /app/profile/settings — preferences + data + delete.
 *
 * Sections:
 *   - Preferences (notifications, language, reduce-motion)
 *   - Data (export, see what we hold)
 *   - Delete account (60-min ACK / 30-day cascade — GDPR Art. 17 + DPDP §13)
 *
 * Delete is a hard surface: confirms with the exact SLA copy. Real wiring
 * lives in `account.requestErasure` from Bucket 3.
 *
 * v16 web pivot §Bucket 5.
 */
export default function SettingsPage() {
  const reducedMotion = useReducedMotion();
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  return (
    <div className="space-y-8 pt-2">
      <header>
        <Link
          href="/app/profile"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Profile
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          Settings
        </h1>
      </header>

      <section className="space-y-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Preferences
        </p>
        <Toggle
          label="Email notifications"
          sub="Verification updates, T&S replies, parent-link confirmations."
          checked={emailNotif}
          onChange={setEmailNotif}
        />
        <Toggle
          label="Push notifications"
          sub="Browser push — only when the tab is open."
          checked={pushNotif}
          onChange={setPushNotif}
        />
        <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">Language</p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
            className="mt-2 h-10 w-full rounded-[8px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 text-[14px] text-[color:var(--color-fg)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
          <p className="mt-2 text-[12px] text-[color:var(--color-fg-muted)]">
            Hindi is partial — core flows complete, marketing pages still English.
          </p>
        </div>
        <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">Reduce motion</p>
          <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">
            Honored automatically from your OS setting:{" "}
            <span className="font-mono text-[color:var(--color-fg)]">
              {reducedMotion ? "ON" : "OFF"}
            </span>
            . Turn it on in System Settings → Accessibility.
          </p>
        </div>
      </section>

      <section id="data" className="space-y-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Your data
        </p>
        <Action
          title="Export my data"
          sub="JSON file, every record we hold about you. Delivered by email."
          cta="Request export"
        />
        <Link
          href="/privacy"
          className="block rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:bg-[color:var(--color-bg)]"
        >
          <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">
            See our Privacy Policy
          </p>
          <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">
            What we collect, why, who we share with, and your rights under GDPR + DPDP.
          </p>
        </Link>
      </section>

      <section id="delete" className="space-y-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-danger)]">
          Delete account
        </p>
        <div className="rounded-[14px] border border-[color:var(--color-danger)]/30 bg-[color:var(--color-surface)] p-5">
          <p className="text-[14px] leading-[1.6] text-[color:var(--color-fg)]">
            We acknowledge in 60 minutes. The cascade completes in 30 days.
            That&apos;s the SLA — not a guideline.
          </p>
          <p className="mt-2 text-[12px] text-[color:var(--color-fg-muted)]">
            We hold a banned-identity-hash so a deleted account can&apos;t
            re-verify under the same Aadhaar. The hash itself is non-reversible.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex h-11 items-center rounded-[10px] bg-[color:var(--color-danger)] px-4 text-[13px] font-semibold text-white transition-[background-color] hover:bg-[color:var(--color-danger)]/90"
          >
            Delete my account
          </button>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <span className="flex-1">
        <span className="block text-[14px] font-semibold text-[color:var(--color-fg)]">{label}</span>
        <span className="mt-1 block text-[12px] text-[color:var(--color-fg-muted)]">{sub}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-[color:var(--color-primary)]"
      />
    </label>
  );
}

function Action({ title, sub, cta }: { title: string; sub: string; cta: string }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">{title}</p>
      <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">{sub}</p>
      <button
        type="button"
        className="mt-3 inline-flex h-9 items-center rounded-md bg-[color:var(--color-fg)] px-3 text-[12px] font-semibold text-[color:var(--color-bg)] hover:bg-[color:var(--color-fg-muted)]"
      >
        {cta}
      </button>
    </div>
  );
}
