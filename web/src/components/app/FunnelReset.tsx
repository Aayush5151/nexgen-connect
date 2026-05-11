"use client";

import { useEffect } from "react";
import { useSignup } from "@/lib/signup/state";

/**
 * FunnelReset — wipes the signup zustand store once the user lands
 * on any authed `/app/*` route.
 *
 * Why this lives in the layout instead of the click handler that
 * navigates here: the previous arrangement called
 * `useSignup.getState().reset()` synchronously before
 * `router.push("/app/corridor")` from `/signup/admit/outcome`. Zustand
 * notified subscribers, the outcome page re-rendered with
 * `admitState=null`, its own useEffect saw the empty state and
 * `router.replace("/signup/admit")` fired — cascading back through
 * the funnel gates until the user landed on `/signup/identity`
 * (DigiLocker). End result: clicking "Open my corridor" took the user
 * to DigiLocker.
 *
 * Doing the reset *after* the navigation completes — i.e. from the
 * `/app` layout — breaks that race for good. By the time this mounts,
 * the signup tree is fully unmounted and there are no useEffects left
 * to cascade.
 *
 * Renders nothing.
 *
 * v17 one-flow / v16 web pivot §Bucket 5.
 */
export function FunnelReset() {
  useEffect(() => {
    // Imperative reset via getState() so this doesn't subscribe to
    // any zustand slice (no extra re-renders on funnel state changes
    // we don't care about).
    useSignup.getState().reset();
  }, []);
  return null;
}
