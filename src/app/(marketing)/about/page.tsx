import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Gauge, Lock, HeartHandshake, Users, ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description: "The team and principles behind Tagify's server-side tracking platform.",
};

const stats = [
  { v: "1,200+", l: "Brands tracked" },
  { v: "4.8B", l: "Events processed" },
  { v: "31%", l: "Avg. conversions recovered" },
  { v: "47", l: "Countries served" },
];

const values = [
  {
    icon: Eye,
    title: "Transparency",
    desc: "Every event, every payload, every retry — visible in your dashboard. No black boxes.",
  },
  {
    icon: Gauge,
    title: "Performance",
    desc: "Sub-50ms edge processing. Zero impact on Core Web Vitals. Built for scale.",
  },
  {
    icon: Lock,
    title: "Privacy-first",
    desc: "PII hashed before it leaves your domain. Consent Mode v2 native. GDPR + CCPA compliant.",
  },
  {
    icon: HeartHandshake,
    title: "Customer obsession",
    desc: "We answer in hours, not days. Founders are in the support inbox. Your wins shape the roadmap.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:py-20">
          <span className="inline-block rounded-full border border-ink/15 bg-cream px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
            About Tagify
          </span>
          <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
            Server-side tracking, made simple — for the brands the big players forgot
          </h1>
          <p className="mt-5 text-lg text-ink/65">
            We help DTC brands recover the conversion data they&apos;re losing to ad blockers, iOS
            restrictions, and broken pixels — without a 50-page setup guide.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-14">
          <div className="space-y-5 text-base text-ink/70 leading-relaxed md:text-lg">
            <p>
              Tagify was built out of frustration. After watching DTC brands in Bangladesh, India,
              the Middle East and Southeast Asia lose 30–50% of their Facebook ad signal to ad
              blockers, slow scripts, and COD checkout flows that pixels never understood, we knew
              the existing tools — GTM Server, Stape, custom Cloud Run setups — were too expensive
              and complex for the brands that needed them most.
            </p>
            <p>
              So we built the opposite: a server-side tracking platform that sets up in 5 minutes,
              costs less than a single Facebook ad campaign, and ships with native support for COD
              orders, delayed purchases, and the realities of running a real e-commerce business in
              2026. Today, brands across 47 countries trust Tagify with billions of events — and
              recover, on average, 31% more conversions in their ad platforms.
            </p>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-ink text-background">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 py-14 text-center md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl font-medium text-coral md:text-5xl">
                  {s.v}
                </div>
                <div className="mt-2 text-sm text-background/65">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              What we believe
            </h2>
            <p className="mt-2 text-ink/60">
              The principles that shape every line of code we ship.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-ink/10 bg-background p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-coral-soft text-coral">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium">{v.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-20">
          <div className="rounded-2xl border border-ink/10 bg-cream p-8 text-center md:p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-coral-soft text-coral">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-medium">A small, distributed team</h3>
            <p className="mt-3 text-ink/65">
              A tight-knit group of engineers, marketers and ex-DTC operators across four time
              zones. No big sales org, no inflated headcount — just builders who answer your
              questions and ship fixes the same week.
            </p>
          </div>
        </section>

        <section className="border-t border-ink/10 bg-ink text-background">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Better data starts in 5 minutes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-background/70">
              No credit card. Generous free tier. Recover the conversions you&apos;ve been missing.
            </p>
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
