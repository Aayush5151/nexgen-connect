import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAdminAction } from "@/app/actions/admin";
import { readAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Protected admin layout.
 *
 * Runs on every request inside /admin/(protected)/... — everything EXCEPT
 * /admin/login. Two gates, then renders the single admin chrome bar:
 *
 *   1. Valid signed ngc_admin cookie.
 *   2. Fresh DB read of waitlist.is_admin + verification_status='verified'
 *      for the session's waitlist_id (covers demotion / row deletion).
 *
 * Any failure → redirect to /admin/login. No pathname sniffing, no loop risk.
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
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-surface)]/70">
        <div className="container-narrow flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-heading text-[15px] font-semibold tracking-tight text-[color:var(--color-fg)]"
            >
              NexGen · Admin
            </Link>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] md:inline">
              Founder review
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[12px] text-[color:var(--color-fg-muted)] md:inline">
              Signed in as{" "}
              <span className="font-medium text-[color:var(--color-fg)]">
                {data.first_name}
              </span>
            </span>
            <Link
              href="/"
              className="hidden text-[12px] text-[color:var(--color-fg-muted)] underline-offset-2 hover:underline md:inline"
            >
              ← Site
            </Link>
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
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
