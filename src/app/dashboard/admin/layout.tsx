import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };

export default function AdminLayout({ children }: LayoutProps<"/dashboard/admin">) {
  return (
    <Suspense>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return children;
}
