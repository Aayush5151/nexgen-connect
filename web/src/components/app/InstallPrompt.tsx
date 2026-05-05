"use client";

import { useEffect, useState } from "react";

/**
 * InstallPrompt — Android Chrome / Edge "Add to Home Screen".
 *
 * Listens for `beforeinstallprompt`, suppresses Chrome's default mini
 * banner, and shows our own dismissible card on the SECOND visit (we
 * don't pester first-time users on /app/corridor).
 *
 * iOS Safari has no `beforeinstallprompt`; users do "Add to Home
 * Screen" manually via the share sheet — out of scope here.
 *
 * v16 web pivot §Bucket 9.
 */

const STORAGE_KEY = "nx-pwa-install-prompt";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      setDeferred(ev);

      // Show on second visit, not the first. Tracks via localStorage.
      try {
        const visits = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
        if (visits === 1) setShow(true);
        localStorage.setItem(STORAGE_KEY, String(visits + 1));
      } catch {
        // localStorage blocked / private mode — fall back to "show".
        setShow(true);
      }
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setShow(false);
    setDeferred(null);
  }

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "999");
    } catch {
      /* noop */
    }
  }

  if (!show || !deferred) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="fixed inset-x-3 bottom-[88px] z-40 mx-auto max-w-[480px] rounded-[14px] border border-[color:var(--color-primary)]/40 bg-[color:var(--color-surface)] p-4 shadow-lg"
    >
      <p
        id="install-title"
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]"
      >
        Install NexGen
      </p>
      <p className="mt-2 text-[13px] leading-[1.4] text-[color:var(--color-fg)]">
        Add it to your home screen — opens like an app, gets push notifications,
        works offline-ish.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-9 items-center rounded-md border border-[color:var(--color-border)] px-3 text-[12px] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg)]"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={install}
          className="inline-flex h-9 items-center rounded-md bg-[color:var(--color-primary)] px-3 text-[12px] font-semibold text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]"
        >
          Install
        </button>
      </div>
    </div>
  );
}
