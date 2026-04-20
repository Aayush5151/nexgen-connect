import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { readAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { logoutAdminAction } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Always revalidate — admin data must never be served from a static cache.
export const dynamic = "force-dynamic";

/**
 * Admin layout gate.
 *
 * Runs on every request inside /admin. Redirects to /admin/login if there's
 * no valid cookie OR the cookie's waitlist_id is no longer an admin in the
 * DB (demoted since last login, row deleted, etc.).
 *
 * The /admin/login route is excluded by checking the pathname via headers —
 * Next.js 16 doesn't give us `usePathname` in a server layout, but the
 * `x-invoke-path` / `next-url` headers populated by the framework get us
 * the same info without calling into middleware.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const pathname =
    hdrs.get("x-invoke-path") ??
    hdrs.get("next-url") ??
    hdrs.get("x-pathname") ??
    "";

  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    return <AdminChrome authed={false}>{children}</AdminChrome>;
  }

  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  // DB-side defense in depth: even with a valid signed cookie, a demoted
  // admin must be denied. This is the same check every mutation does.
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
    <AdminChrome authed={true} firstName={data.first_name}>
      {children}
    </AdminChrome>
  );
}

function AdminChrome({
  authed,
  firstName,
  children,
}: {
  authed: boolean;
  firstName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="container-narrow flex h-16 items-center justify-between">
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
          <div className="flex items-center gap-4">
            {authed && firstName && (
              <span className="hidden text-[12px] text-[color:var(--color-fg-muted)] md:inline">
                Signed in as {firstName}
              </span>
            )}
            <Link
              href="/"
              className="text-[12px] text-[color:var(--color-fg-muted)] underline-offset-2 hover:underline"
            >
              ← Site
            </Link>
            {authed && (
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
