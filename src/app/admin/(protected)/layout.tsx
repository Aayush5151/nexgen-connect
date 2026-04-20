import { redirect } from "next/navigation";

import { logoutAdminAction } from "@/app/actions/admin";
import { readAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Protected admin layout.
 *
 * Runs on every request inside /admin/(protected)/... — that is, everything
 * EXCEPT /admin/login. Two gates:
 *
 *   1. A valid signed session cookie (ngc_admin).
 *   2. A fresh DB read of waitlist.is_admin for the session's waitlist_id.
 *      Covers "admin got demoted since last login" and "row deleted."
 *
 * Any failure redirects to /admin/login. No pathname sniffing, no loop risk.
 * /admin/login lives outside this group and never hits these checks.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  const db = getSupabaseAdmin();
  const { data } = await db
    .from("waitlist")
    .select("id, is_admin, first_name, verification_status")
    .eq("id", session.waitlist_id)
    .maybeSingle();

  if (!data || !data.is_admin || data.verification_status !== "verified") {
    redirect("/admin/login");
  }

  return (
    <>
      <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/60">
        <div className="container-narrow flex h-10 items-center justify-end gap-4">
          <span className="hidden text-[12px] text-[color:var(--color-fg-muted)] md:inline">
            Signed in as {data.first_name}
          </span>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </>
  );
}
