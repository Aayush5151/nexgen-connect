import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin surfaces are never statically cached.
export const dynamic = "force-dynamic";

/**
 * Outer admin layout.
 *
 * Intentionally chrome-free. Both /admin/login (unauthed) and the protected
 * routes render their own header - splitting here keeps the outer shell from
 * leaking "you're signed in" state to the login page and avoids two visible
 * top bars on the dashboard.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-bg)]">
      {children}
    </div>
  );
}
