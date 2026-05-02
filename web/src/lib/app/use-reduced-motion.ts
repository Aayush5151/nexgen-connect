"use client";

/**
 * useReducedMotion — web equivalent of mobile's hook of the same name.
 *
 * Returns true when the user has requested reduced motion via the OS
 * accessibility setting. Implemented with `useSyncExternalStore` so it
 * subscribes to the matchMedia change events without triggering React
 * 19's "no setState in effect" lint, and is server-safe (the SSR
 * snapshot returns false so the markup doesn't flash).
 *
 * v16 web pivot §Bucket 5.
 */
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
