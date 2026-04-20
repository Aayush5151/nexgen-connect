import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin surfaces are never statically cached.
export const dynamic = "force-dynamic";

/**
 * Outer admin layout.
 *
 * Chrome-only. Wraps both /admin/login (unauthed) and the protected routes
 * under src/app/admin/(protected)/. The auth gate lives one level down so
 * /admin/login never risks redirect-looping.
 */
export default function AdminLayout({
  children,
}: {
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
          <Link
            href="/"
            className="text-[12px] text-[color:var(--color-fg-muted)] underline-offset-2 hover:underline"
          >
            ← Site
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
