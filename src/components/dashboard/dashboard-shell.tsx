"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Server,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { BrandMark } from "@/components/brand-mark";
import { NotificationsBell } from "@/components/notifications-bell";
import { isAdmin, signOut, useSession } from "@/lib/auth-client";

const baseNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/gateway", label: "Tagify Gateway", icon: Database },
  { href: "/dashboard/containers", label: "sGTM Containers", icon: Server },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
const adminNav = { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck };

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [openPath, setOpenPath] = useState<string | null>(null);

  const drawerOpen = openPath === pathname;
  const nav = isAdmin(session?.user) ? [...baseNav, adminNav] : baseNav;

  async function handleSignOut() {
    await signOut();
    queryClient.clear();
    router.push("/");
    router.refresh();
  }

  const sidebar = (
    <>
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-ink/10 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-background">
          <BrandMark className="h-4.5 w-4.5" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">tagify</span>
      </Link>
      <nav className="flex-1 space-y-1 p-3 text-sm">
        {nav.map((it) => {
          const active =
            "exact" in it && it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 font-medium transition ${active ? "bg-ink text-background" : "text-ink/70 hover:bg-cream"}`}
            >
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink/10 p-3">
        <div className="truncate px-3 pb-2 text-xs text-ink/55">{session?.user.email}</div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink/70 hover:bg-cream"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-cream text-ink">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-background md:flex">
        {sidebar}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpenPath(null)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-background shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex h-14 items-center justify-between gap-2 border-b border-ink/10 bg-background px-4 md:hidden">
          <button
            onClick={() => setOpenPath(pathname)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-md border border-ink/10"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-background">
              <BrandMark className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight">tagify</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-md border border-ink/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="hidden h-14 items-center justify-end border-b border-ink/10 bg-background px-6 md:flex">
          <NotificationsBell />
        </div>
        <main className="mx-auto max-w-6xl p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
