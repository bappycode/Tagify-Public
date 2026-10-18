import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main className="mx-auto grid max-w-3xl place-items-center px-5 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-coral">404</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">
          Page not found
        </h1>
        <p className="mt-3 text-ink/60">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background transition hover:bg-coral"
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
