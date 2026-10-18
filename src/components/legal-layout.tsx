import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-4xl px-5 py-14 md:py-16">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-widest text-ink/55 hover:text-coral"
            >
              ← Back to home
            </Link>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-ink/55">Last updated: {updated}</p>
            <p className="mt-4 max-w-2xl text-lg text-ink/65">{intro}</p>
          </div>
        </section>
        <article className="mx-auto max-w-3xl px-5 py-14 prose prose-sm md:prose-base">
          <div className="space-y-10 text-ink/75 leading-relaxed">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-ink/70">{children}</div>
    </section>
  );
}
