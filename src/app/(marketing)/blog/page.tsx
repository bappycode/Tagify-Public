import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { posts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides and deep dives on server-side tracking, sGTM and conversion APIs.",
};

export default function BlogIndex() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center md:py-20">
            <span className="inline-block rounded-full border border-ink/15 bg-background px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
              Journal
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
              Notes from the gateway.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/65">
              Long-form, no fluff. Server-side tracking, sGTM, attribution math and the messy parts
              of running ads at scale.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14">
          <div className="grid gap-5 md:grid-cols-2">
            {sorted.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-ink/10 bg-background p-6 transition hover:border-ink/30"
              >
                <div className="flex items-center gap-3 text-xs text-ink/55">
                  <span className="rounded-full bg-cream px-2.5 py-0.5 font-mono uppercase tracking-widest">
                    {p.category}
                  </span>
                  <span>{p.readTime}</span>
                  <span>·</span>
                  <span>
                    {new Date(p.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-medium tracking-tight group-hover:text-coral">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-ink/65">{p.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-ink">
                  Read post{" "}
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
