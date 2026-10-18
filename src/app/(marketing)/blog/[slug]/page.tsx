import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getPost, posts, type BlogPost } from "@/lib/blog-posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-3xl px-5 py-14" />}>
          <BlogPostContent params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function BlogPostContent({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-ink/55 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All posts
        </Link>
        <div className="mt-6 flex items-center gap-3 text-xs text-ink/55">
          <span className="rounded-full bg-cream px-2.5 py-0.5 font-mono uppercase tracking-widest">
            {post.category}
          </span>
          <span>{post.readTime}</span>
          <span>·</span>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-ink/65">{post.description}</p>

        <div className="mt-10 space-y-6 text-ink/80 leading-relaxed">
          {post.body.map((b: BlogPost["body"][number], i: number) => {
            if (b.type === "h2")
              return (
                <h2 key={i} className="font-display text-2xl font-medium tracking-tight text-ink">
                  {b.text}
                </h2>
              );
            if (b.type === "ul")
              return (
                <ul key={i} className="space-y-2 pl-5 list-disc marker:text-coral">
                  {b.items?.map((it: string) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              );
            if (b.type === "quote")
              return (
                <blockquote key={i} className="border-l-2 border-coral pl-4 italic text-ink/70">
                  {b.text}
                </blockquote>
              );
            return <p key={i}>{b.text}</p>;
          })}
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-ink/10 bg-cream">
          <div className="mx-auto max-w-5xl px-5 py-14">
            <h3 className="font-display text-2xl font-medium tracking-tight">Keep reading</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-ink/10 bg-background p-6 transition hover:border-ink/30"
                >
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
                    {p.category}
                  </span>
                  <h4 className="mt-2 font-display text-lg font-medium group-hover:text-coral">
                    {p.title}
                  </h4>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink">
                    Read <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
