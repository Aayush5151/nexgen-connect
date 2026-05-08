/**
 * Client-side Web Push subscription helpers.
 *
 * Browser → SW.pushManager → POST /api/push/subscribe.
 *
 * Three things matter:
 *
 *   1. NEVER auto-prompt for notifications. The browser shows a hostile
 *      "do you want notifications" toast that, when triggered without
 *      a user gesture, is a known cause of permanent denials. Always
 *      gate behind a click handler in a UI control.
 *
 *   2. The VAPID public key has to be in URL-safe base64 → Uint8Array
 *      form for `pushManager.subscribe`. Helper below does that
 *      conversion.
 *
 *   3. The /api/push/subscribe endpoint upserts on (user_id, endpoint),
 *      so re-subscribing after a permission flip-flop is idempotent.
 *
 * v16 web pivot Bucket 4 follow-up.
 */

export type PushSupport =
  | { ok: true }
  | { ok: false; reason: "no-window" | "no-sw" | "no-push" | "no-vapid" };

export function checkPushSupport(): PushSupport {
  if (typeof window === "undefined") return { ok: false, reason: "no-window" };
  if (!("serviceWorker" in navigator)) return { ok: false, reason: "no-sw" };
  if (!("PushManager" in window)) return { ok: false, reason: "no-push" };
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return { ok: false, reason: "no-vapid" };
  }
  return { ok: true };
}

export type SubscribeResult =
  | { ok: true; endpoint: string }
  | { ok: false; reason: string };

/**
 * Run the full subscribe flow inside the user's click handler.
 *
 *   1. Permission ask (browser native, blocking the user-gesture).
 *   2. Wait for the SW to be ready.
 *   3. pushManager.subscribe with VAPID key.
 *   4. POST the subscription to our server for persistence.
 */
export async function subscribeToPush(): Promise<SubscribeResult> {
  const support = checkPushSupport();
  if (!support.ok) return { ok: false, reason: support.reason };

  // 1. Permission. `Notification.requestPermission()` MUST be called
  //    inside a user gesture — caller is responsible for that, this
  //    function is invoked from a click handler.
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: `permission-${permission}` };
  }

  // 2. SW ready (registered + activated). The (app) layout's
  //    ServiceWorkerRegistrar already kicked off `register('/sw.js')`,
  //    so this typically resolves immediately.
  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.ready;
  } catch (err) {
    return { ok: false, reason: `sw-ready: ${stringifyErr(err)}` };
  }

  // 3. Subscribe. If a subscription already exists (re-subscribe),
  //    the browser returns the existing one with the same endpoint.
  let subscription: PushSubscription;
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
  } catch (err) {
    return { ok: false, reason: `subscribe: ${stringifyErr(err)}` };
  }

  // 4. POST to server. The endpoint upserts on (user_id, endpoint),
  //    so duplicates resolve cleanly.
  try {
    const json = subscription.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, reason: `server-${res.status}: ${text.slice(0, 80)}` };
    }
  } catch (err) {
    return { ok: false, reason: `post: ${stringifyErr(err)}` };
  }

  return { ok: true, endpoint: subscription.endpoint };
}

/**
 * Returns the current PushSubscription if one exists in the SW
 * registration. Used by UI to render "you're subscribed" vs "enable".
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!checkPushSupport().ok) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * Unsubscribe from web-push. Removes the browser-side subscription;
 * the server-side row is left behind and gets soft-marked the next
 * time the fan-out job tries to deliver to it (web-push returns 410).
 * The expired-cleanup cron then hard-deletes it on its next run.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  const sub = await getCurrentPushSubscription();
  if (!sub) return true;
  try {
    return await sub.unsubscribe();
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  // Returns a fresh ArrayBuffer (not Uint8Array<ArrayBufferLike>) so the
  // result lands in a type the PushManager spec accepts as
  // `BufferSource` without a TS cast — the wider Uint8Array generic
  // includes SharedArrayBuffer which the spec rejects.
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return buf;
}

function stringifyErr(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
