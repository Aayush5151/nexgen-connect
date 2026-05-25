"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TurnstileWidget — Cloudflare Turnstile placeholder.
 *
 * v16 web pivot §3.5 + §Bucket 4. When NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set, mounts the real Turnstile widget. When unset (dev), returns
 * a dev-bypass token immediately so signup flows aren't blocked
 * locally.
 *
 * Real Turnstile script load: only loads when the site key is set,
 * so production gets the bot-protection hit and dev doesn't have to
 * add the key to /.env.local.
 *
 * Fail-closed: when site key IS set, the widget MUST render before
 * the parent form's submit button is enabled. The parent should treat
 * `token == null` as "submit disabled".
 *
 * Usage:
 *   <TurnstileWidget onToken={(token) => setTurnstileToken(token)} />
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const DEV_BYPASS_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

type Props = {
  onToken: (token: string | null) => void;
};

export function TurnstileWidget({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // M13 fix: stash onToken in a ref so the effect doesn't tear down
  // and re-render the Turnstile widget whenever a consumer passes an
  // inline lambda (the widget would otherwise reset its Cloudflare
  // challenge on every parent re-render). The effect now only depends
  // on siteKey; onTokenRef.current is read at call time.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    // Dev path: no site key configured. Return the dev bypass token
    // so the parent form's submit isn't blocked. Server-side
    // verifyTurnstileToken accepts this token only when
    // TURNSTILE_DEV_BYPASS=true is set in server env (per
    // packages/server/src/server/lib/turnstile.ts).
    if (!siteKey) {
      onTokenRef.current(DEV_BYPASS_TOKEN);
      return;
    }

    let cancelled = false;

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (typeof window === "undefined") {
          reject(new Error("no-window"));
          return;
        }
        if (window.turnstile) {
          resolve();
          return;
        }
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("script-error")), {
            once: true,
          });
          return;
        }
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        s.addEventListener("load", () => resolve(), { once: true });
        s.addEventListener("error", () => reject(new Error("script-error")), { once: true });
        document.head.appendChild(s);
      });

    ensureScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => {
            setError("Verification failed. Refresh and try again.");
            onTokenRef.current(null);
          },
          "expired-callback": () => onTokenRef.current(null),
        });
      })
      .catch((e) => {
        setError(`Couldn't load bot-protection (${e instanceof Error ? e.message : "unknown"}).`);
        onTokenRef.current(null);
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetId.current);
        } catch {
          // best-effort cleanup
        }
      }
    };
    // onToken intentionally omitted — accessed via onTokenRef.current.
  }, [siteKey]);

  if (!siteKey) {
    // Dev / launch state: site key not configured. Don't show the
    // "Bot-check skipped (dev mode)" label to real visitors — it
    // looks unfinished and exposes that the bot gate isn't live yet.
    // Form still submits because we've already pushed the
    // DEV_BYPASS_TOKEN via onToken() in the effect above.
    if (process.env.NODE_ENV !== "production") {
      return (
        <p className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Bot-check skipped (dev mode)
        </p>
      );
    }
    return null;
  }
  return (
    <div>
      <div ref={ref} />
      {error && (
        <p className="mt-2 text-[12px] text-[color:var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}
