import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <AuthGate>
        <DashboardShell>{children}</DashboardShell>
      </AuthGate>
    </Suspense>
  );
}

async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}

function WorkspaceLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-ink/60">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-coral" /> Loading workspace…
      </div>
    </div>
  );
}
