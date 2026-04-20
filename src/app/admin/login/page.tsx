import { redirect } from "next/navigation";

import { readAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

/**
 * Admin login.
 *
 * Short-circuits to /admin if the cookie is already valid AND the row is
 * still an admin. Otherwise renders the phone → OTP client form.
 */
export default async function AdminLoginPage() {
  const session = await readAdminSession();
  if (session) {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("waitlist")
      .select("id, is_admin, verification_status")
      .eq("id", session.waitlist_id)
      .maybeSingle();
    if (data?.is_admin && data.verification_status === "verified") {
      redirect("/admin");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Admin
            </p>
            <h1 className="mt-3 font-heading text-[24px] font-semibold leading-tight text-[color:var(--color-fg)]">
              Sign in
            </h1>
            <p className="mt-2 text-[13px] text-[color:var(--color-fg-muted)]">
              Use the phone number tied to your founder waitlist row. You&apos;ll
              get a 6-digit SMS code.
            </p>
          </div>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-[color:var(--color-fg-subtle)]">
          Only phone numbers flagged as admins in the database can sign in.
        </p>
      </div>
    </section>
  );
}
