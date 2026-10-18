import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Activity,
  ServerCog,
  Lock,
  GitMerge,
  Eye,
  ShieldOff,
  Clock,
  ArrowUpRight,
  Check,
  X,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything Tagify Gateway and sGTM hosting do to recover lost conversions.",
};

const items = [
  {
    icon: ServerCog,
    title: "Server-side tracking",
    desc: "Move tracking from the browser to your first-party endpoint. Faster, cleaner, unblockable.",
  },
  {
    icon: ShieldCheck,
    title: "Meta Conversions API",
    desc: "Purchase, AddToCart, ViewContent and custom events server-to-server with full deduplication.",
  },
  {
    icon: Activity,
    title: "Google Analytics 4",
    desc: "Server-side Measurement Protocol for accurate e-commerce, sessions and attribution.",
  },
  {
    icon: Zap,
    title: "TikTok Events API",
    desc: "Native ttclid capture and event mapping for the highest EMQ scores possible.",
  },
  {
    icon: GitMerge,
    title: "Event deduplication",
    desc: "Smart dedupe across browser + server events. Nothing double-fires, nothing gets dropped.",
  },
  {
    icon: Eye,
    title: "EMQ optimization",
    desc: "Auto-hashes email, phone and fbp/fbc parameters to maximize Event Match Quality.",
  },
  {
    icon: Lock,
    title: "Consent Mode v2",
    desc: "Native Google Consent Mode v2 and EU-compliant PII handling out of the box.",
  },
  {
    icon: ShieldOff,
    title: "Ad-blocker bypass",
    desc: "First-party domains and edge proxying recover the 30–50% of events ad blockers kill.",
  },
  {
    icon: Clock,
    title: "COD & delayed purchases",
    desc: "Fire offline conversions when COD orders confirm — built for Bangladesh and emerging markets.",
  },
];

const rows: Array<{
  feature: string;
  tagify: string | boolean;
  gtm: string | boolean;
  stape: string | boolean;
  native: string | boolean;
}> = [
  { feature: "Setup time", tagify: "5 min", gtm: "2–3 days", stape: "1 hour", native: "Instant" },
  { feature: "Ad-blocker bypass", tagify: true, gtm: true, stape: true, native: false },
  { feature: "iOS 14+ recovery", tagify: true, gtm: true, stape: true, native: false },
  { feature: "Requires Google Cloud", tagify: false, gtm: true, stape: false, native: false },
  { feature: "Built-in EMQ optimization", tagify: true, gtm: false, stape: false, native: false },
  { feature: "COD / offline events", tagify: true, gtm: false, stape: false, native: false },
  { feature: "Managed updates", tagify: true, gtm: false, stape: true, native: true },
  {
    feature: "Starting price",
    tagify: "Free / $15/mo",
    gtm: "$120+/mo",
    stape: "$50/mo",
    native: "Free",
  },
];

const Cell = ({ v }: { v: string | boolean }) =>
  v === true ? (
    <Check className="mx-auto h-4 w-4 text-coral" />
  ) : v === false ? (
    <X className="mx-auto h-4 w-4 text-ink/25" />
  ) : (
    <span className="text-sm">{v}</span>
  );

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center md:py-20">
            <span className="inline-block rounded-full border border-ink/15 bg-background px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
              Features
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
              Everything you need for
              <br />
              <span className="text-coral">accurate ad tracking</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/65">
              Server-side tracking, every major ad platform, and the optimization tools to scale
              campaigns with confidence.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background hover:bg-coral"
              >
                Start free <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium hover:border-ink"
              >
                See how it works
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-ink/10 bg-background p-6 transition hover:border-coral/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-coral-soft text-coral">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-ink/65 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink/10 bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="text-center">
              <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                How Tagify compares
              </h2>
              <p className="mt-3 text-ink/60">
                Same server-side power, none of the DevOps headaches.
              </p>
            </div>
            <div className="mt-10 overflow-x-auto rounded-2xl border border-ink/10 bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-cream/60">
                    <th className="p-4 text-left font-medium">Feature</th>
                    <th className="p-4 text-center font-medium text-coral">Tagify</th>
                    <th className="p-4 text-center font-medium text-ink/55">DIY GTM</th>
                    <th className="p-4 text-center font-medium text-ink/55">Stape</th>
                    <th className="p-4 text-center font-medium text-ink/55">Native pixel</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.feature} className={i % 2 ? "bg-cream/30" : ""}>
                      <td className="p-4 font-medium">{r.feature}</td>
                      <td className="p-4 text-center bg-coral-soft/40">
                        <Cell v={r.tagify} />
                      </td>
                      <td className="p-4 text-center">
                        <Cell v={r.gtm} />
                      </td>
                      <td className="p-4 text-center">
                        <Cell v={r.stape} />
                      </td>
                      <td className="p-4 text-center">
                        <Cell v={r.native} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-ink/10 bg-ink text-background">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Ready to recover lost conversions?
            </h2>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white hover:bg-coral/90"
            >
              Start free <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
