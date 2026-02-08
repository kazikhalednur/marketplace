"use client";

import { useAuth, Loader } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-sm font-medium ${
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === "development";
  const { user, isAuthenticated, showLoader } = useAuth();

  if (!isDev) {
    if (showLoader) return <Loader />;
    if (!isAuthenticated || user.role !== "admin") {
      return (
        <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
            <p className="text-muted-foreground">You do not have permission to access the admin panel.</p>
            <div className="mt-6">
              <Link href="/" className="underline text-primary">Go back home</Link>
            </div>
          </div>
        </main>
      );
    }
  }
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      <aside className="w-64 border-r border-border p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-bold">Admin</h2>
          <p className="text-xs text-muted-foreground">Control center</p>
        </div>
        <nav className="space-y-1">
          <NavLink href="/admin" label="Dashboard" />
          <NavLink href="/admin/users" label="Users" />
          <NavLink href="/admin/jobs" label="Jobs" />
          {/* <NavLink href="/admin/taxonomy" label="Taxonomy" /> */}
          <NavLink href="/admin/bids" label="Bids" />
          <NavLink href="/admin/contracts" label="Contracts" />
          <NavLink href="/admin/milestones" label="Milestones" />
          {/* <NavLink href="/admin/messages" label="Messages" /> */}
          {/* <NavLink href="/admin/notifications" label="Notifications" /> */}
          {/* <NavLink href="/admin/reports" label="Reports" /> */}
          {/* <NavLink href="/admin/audit-logs" label="Audit Logs" /> */}
          {/* <NavLink href="/admin/settings" label="Settings" /> */}
        </nav>
      </aside>
      <main className="flex-1 p-4">
        <div className="md:hidden mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <NavLink href="/admin" label="Dashboard" />
            <NavLink href="/admin/users" label="Users" />
            <NavLink href="/admin/jobs" label="Jobs" />
            <NavLink href="/admin/taxonomy" label="Taxonomy" />
            <NavLink href="/admin/bids" label="Bids" />
            <NavLink href="/admin/contracts" label="Contracts" />
            <NavLink href="/admin/milestones" label="Milestones" />
            <NavLink href="/admin/messages" label="Messages" />
            <NavLink href="/admin/notifications" label="Notifications" />
            <NavLink href="/admin/reports" label="Reports" />
            <NavLink href="/admin/audit-logs" label="Audit Logs" />
            <NavLink href="/admin/settings" label="Settings" />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}


