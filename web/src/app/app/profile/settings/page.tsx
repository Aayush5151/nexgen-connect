"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { useReducedMotion } from "@/lib/app/use-reduced-motion";
import {
  checkPushSupport,
  getCurrentPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import { getSoundEnabled, setSoundEnabled, playSound } from "@/lib/app/sound";

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
  const pushState = usePushSubscription();
  // Sound preference — opt-in, persists to localStorage. Default off
  // (false) per our trillion-dollar sound discipline: sound is a
  // privilege, not a default. useSyncExternalStore subscribes to the
  // `nx-sound-preference-changed` custom event dispatched by
  // setSoundEnabled, plus the cross-tab `storage` event — same-tab
  // and other-tab updates both flow through.
  const soundOn = useSyncExternalStore(
    subscribeSoundPreference,
    getSoundEnabled,
    () => false,
  );
  function onSoundChange(next: boolean) {
    setSoundEnabled(next);
    if (next) {
      // Preview the sound the moment the user turns it on — this
      // doubles as feedback ("yes it's working") and as informed-
      // consent ("this is what we'll play").
      playSound("join");
      toast.success("Sound on.", { description: "Subtle cues only — one chime, once." });
    } else {
      toast.message("Sound off.");
    }
  }

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
        <PushToggle state={pushState} />
        <Toggle
          label="Sound"
          sub="A single soft chime when you first land on your corridor. Off by default."
          checked={soundOn}
          onChange={onSoundChange}
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
            Hindi is partial, core flows complete, marketing pages still English.
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
            That&apos;s the SLA, not a guideline.
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

/**
 * Push-subscription wiring. Three observable states (after the initial
 * "checking" tick), driven by the SW + Notification API:
 *
 *   - unsupported : browser / build doesn't carry SW + push + VAPID.
 *                   Render the toggle as disabled with a brief
 *                   explanation; no point asking the user.
 *   - subscribed  : a current PushSubscription exists. Toggle ON.
 *   - prompt      : supported but no current subscription. Toggle OFF
 *                   until the user clicks (per push-client.ts: never
 *                   auto-prompt).
 *   - denied      : the OS / browser permission is set to "denied".
 *                   Show the toggle as off with a one-line nudge to
 *                   re-allow in browser settings (we cannot un-deny
 *                   from JS).
 */
type PushState =
  | { kind: "checking" }
  | { kind: "unsupported"; reason: string }
  | { kind: "subscribed" }
  | { kind: "prompt" }
  | { kind: "denied" };

function usePushSubscription(): {
  state: PushState;
  pending: boolean;
  enable: () => void;
  disable: () => void;
} {
  const [state, setState] = useState<PushState>({ kind: "checking" });
  const [pending, startTransition] = useTransition();

  // Initial probe + reactive resync when permissions change in a
  // sibling tab. The PermissionStatus event lets us catch a user who
  // re-allows from browser settings without us having to refresh.
  useEffect(() => {
    let cancelled = false;
    let permStatus: PermissionStatus | null = null;
    const onPermChange = () => {
      if (!cancelled) void resync();
    };

    async function resync() {
      const support = checkPushSupport();
      if (!support.ok) {
        setState({ kind: "unsupported", reason: support.reason });
        return;
      }
      if (Notification.permission === "denied") {
        setState({ kind: "denied" });
        return;
      }
      const sub = await getCurrentPushSubscription();
      setState({ kind: sub ? "subscribed" : "prompt" });
    }

    void resync();

    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          permStatus = status;
          status.addEventListener("change", onPermChange);
        })
        .catch(() => {
          // Some browsers (older Safari) don't support querying — fine, we
          // just won't auto-resync on a sibling-tab change.
        });
    }

    return () => {
      cancelled = true;
      if (permStatus) permStatus.removeEventListener("change", onPermChange);
    };
  }, []);

  function enable() {
    startTransition(async () => {
      const res = await subscribeToPush();
      if (!res.ok) {
        if (res.reason === "permission-denied") {
          toast.error("Permission blocked. Allow notifications in browser settings.");
          setState({ kind: "denied" });
        } else if (res.reason === "permission-default") {
          toast.message("Permission dismissed.");
        } else if (res.reason === "no-vapid") {
          toast.error("Push isn't configured on this build.");
        } else {
          toast.error(`Couldn't enable push: ${res.reason}`);
        }
        return;
      }
      toast.success("Push notifications on.");
      setState({ kind: "subscribed" });
    });
  }

  function disable() {
    startTransition(async () => {
      const ok = await unsubscribeFromPush();
      if (!ok) {
        toast.error("Couldn't unsubscribe. Try again.");
        return;
      }
      toast.message("Push notifications off.");
      setState({ kind: "prompt" });
    });
  }

  return { state, pending, enable, disable };
}

function PushToggle({
  state,
}: {
  state: ReturnType<typeof usePushSubscription>;
}) {
  const checked = state.state.kind === "subscribed";
  const disabled =
    state.state.kind === "checking" ||
    state.state.kind === "unsupported" ||
    state.state.kind === "denied" ||
    state.pending;

  const sub = (() => {
    switch (state.state.kind) {
      case "checking":
        return "Checking…";
      case "unsupported":
        return "Your browser doesn't support push notifications.";
      case "denied":
        return "Blocked by browser. Allow notifications in site settings to re-enable.";
      case "subscribed":
        return "On, we'll ping you when something needs your eyes.";
      case "prompt":
        return "Browser push for chat replies, parent-link confirmations, T&S responses.";
    }
  })();

  function onChange(next: boolean) {
    if (next) state.enable();
    else state.disable();
  }

  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 ${
        disabled ? "opacity-70" : "cursor-pointer"
      }`}
    >
      <span className="flex-1">
        <span className="block text-[14px] font-semibold text-[color:var(--color-fg)]">
          Push notifications
        </span>
        <span className="mt-1 block text-[12px] text-[color:var(--color-fg-muted)]">
          {sub}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-[color:var(--color-primary)]"
      />
    </label>
  );
}

/**
 * useSyncExternalStore subscriber for the sound preference. Listens
 * for both same-tab (custom event dispatched by setSoundEnabled) and
 * cross-tab (storage event) updates so the toggle reflects reality
 * regardless of which window made the change.
 */
function subscribeSoundPreference(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("nx-sound-preference-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nx-sound-preference-changed", callback);
  };
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
