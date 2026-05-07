import "server-only";

import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * SSR auth helper for /api/* REST routes.
 *
 * Reads the Supabase session from the SSR cookie chain (set by
 * /api/auth/establish-session post-OTP) and returns the authenticated
 * user or a NextResponse the caller should `return` immediately.
 *
 * Usage in a route handler:
 *
 *   const auth = await requireAuthedUser();
 *   if (!auth.user) return auth.response;
 *   // ... use auth.user.id / auth.user.user_metadata
 *
 * Why per-route instead of proxy: the /api surface is mixed —
 * /api/inngest, /api/razorpay/webhook, /api/auth/establish-session,
 * /api/parent-link/verify (token-authed), and /api/trpc all need to
 * be wide open. Per-route opt-in is clearer than a proxy allowlist.
 *
 * v16 web pivot Bucket 7+8 follow-up — closes the
 * `userId = "demo-user-1"` placeholder gap that the original Bucket 6
 * stubs left in /api/admit/*, /api/chat/*, /api/y6/*, /api/group-apply/*,
 * /api/push/*, and /api/parent-link/send.
 */
export type RequireAuthResult =
  | { user: User; response?: never }
  | { user?: never; response: NextResponse };

export async function requireAuthedUser(): Promise<RequireAuthResult> {
  // Supabase env not configured — typically dev/preview without the
  // Mumbai project wired or the web-a11y CI sweep. Reject with 503 so
  // callers know the auth surface is offline (vs. a real 401, which
  // would suggest a fixable session issue).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      response: NextResponse.json(
        { error: "E099:supabase_not_configured" },
        { status: 503 },
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      response: NextResponse.json(
        { error: "E001:auth_required" },
        { status: 401 },
      ),
    };
  }
  return { user };
}
