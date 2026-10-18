import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
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
    <div className="ambient-bg flex min-h-screen flex-col overflow-hidden bg-background bg-grain">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-background">
            <BrandMark className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">tagify</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink/60 transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-ink/10 bg-card p-7 shadow-[0_24px_60px_-30px_oklch(0.16_0.005_60/0.35)] sm:p-9">
            <div className="text-center">
              <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
            </div>
            <div className="mt-8">{children}</div>
          </div>
          <p className="mt-6 text-center text-xs text-ink/50">
            By continuing you agree to our{" "}
            <Link href="/terms-of-service" className="underline underline-offset-2 hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-ink/45">
        © <CurrentYear /> Tagify
      </footer>
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-ink/15 bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink/35 focus:border-coral focus:bg-card focus:ring-2 focus:ring-coral/20";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/55">{label}</span>
      {children}
    </label>
  );
}
