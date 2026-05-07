import { redirect } from "next/navigation";

import { readAdminSession } from "@/lib/admin";

/**
 * /dashboard — short, memorable URL that lands the founder where they
 * need to go.
 *
 *   - If a valid admin session is already in the cookie chain, send
 *     them straight to /admin (the queue).
 *   - Otherwise, send them through /admin/login (phone OTP).
 *
 * Bookmark this page once and the round-trip is one tap from anywhere.
 */
export const dynamic = "force-dynamic";

export default async function DashboardRedirect() {
  const session = await readAdminSession();
  redirect(session ? "/admin" : "/admin/login");
}
