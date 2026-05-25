"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistrar — registers /sw.js on mount under (app)/.
 *
 * Scoped to /app/* via the layout it lives in. Production-only by
 * default; dev mode would interfere with Next's HMR. Override with
 * NEXT_PUBLIC_SW_DEV=true to test locally.
 *
 * v16 web pivot §Bucket 9.
 */

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const isProd = process.env.NODE_ENV === "production";
    if (!isProd && process.env.NEXT_PUBLIC_SW_DEV !== "true") return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // SW failures shouldn't break the page — just log.
          console.warn("[sw] register failed:", err);
        });
    };

    if (document.readyState === "complete") {
      onLoad();
      return;
    }
    window.addEventListener("load", onLoad, { once: true });
    // L6 fix: explicit cleanup. {once:true} mitigates but doesn't
    // eliminate the leak — if the component unmounts before `load`
    // fires (rare on /app/* but possible during fast nav), the
    // listener stays bound to the document until GC.
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
