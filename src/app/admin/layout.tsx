"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Flag,
  CreditCard,
  Clock,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/cohorts", label: "Cohorts", icon: FolderKanban },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/waitlist", label: "Waitlist", icon: Clock },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-60 border-r border-border bg-white md:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
            N
          </div>
          <div>
            <span className="text-base font-bold text-navy">NexGen</span>
            <span className="ml-1 text-xs font-medium text-text-muted">
              Admin
            </span>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-coral/10 text-coral"
                    : "text-text-secondary hover:bg-muted hover:text-navy"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <Link
            href="/app/discover"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-muted hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:ml-60">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy text-xs font-bold text-white">
              N
            </div>
            <span className="text-base font-bold text-navy">Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-muted"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-14 z-30 border-b border-border bg-white shadow-lg md:hidden">
            <nav className="space-y-1 px-3 py-3">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-coral/10 text-coral"
                        : "text-text-secondary hover:bg-muted hover:text-navy"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/app/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-muted hover:text-navy"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Link>
            </nav>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
