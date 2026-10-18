import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { CurrentYear } from "@/components/current-year";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background bg-grain md:grid-cols-2">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-background">
            <BrandMark className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">tagify</span>
        </Link>
        <div className="mx-auto w-full max-w-sm py-10">
          <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-xs text-ink/45">
          © <CurrentYear /> Tagify
        </p>
      </div>
      <div className="ambient-bg hidden flex-col justify-end bg-ink p-12 text-background md:flex">
        <blockquote className="max-w-md font-display text-2xl font-medium leading-snug">
          &ldquo;We recovered <span className="text-coral">34% of lost purchases</span> in 14 days.
          The math just works.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-background/60">Performance Lead · DTC apparel brand</p>
      </div>
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-ink/15 bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/20";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/55">{label}</span>
      {children}
    </label>
  );
}
