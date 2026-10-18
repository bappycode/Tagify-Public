"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Server,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  Cookie,
  GitMerge,
  Eye,
  Lock,
  Clock,
  Star,
  Plus,
  Database,
  ShieldOff,
  Fingerprint,
  Gauge,
  Bot,
  ShoppingBag,
  TrendingDown,
  AlertTriangle,
  X,
  Code2,
  DollarSign,
  Rocket,
  Activity,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  MetaLogo,
  GoogleAnalyticsLogo,
  GoogleAdsLogo,
  TikTokLogo,
  SnapchatLogo,
} from "@/components/logos";
import { BrandMark } from "@/components/brand-mark";
import { SiteHeader, SiteFooter } from "@/components/site-header";

const customers = [
  "DAZA",
  "OLLO",
  "RIMAC",
  "ACTION",
  "RADO",
  "CASIO",
  "UNIVERSAL",
  "LEGO",
  "ARAMEX",
  "PATHAO",
];

const receivers = [
  { name: "Meta", note: "Conversions API", Logo: MetaLogo },
  { name: "GA4", note: "Measurement Protocol", Logo: GoogleAnalyticsLogo },
  { name: "Google Ads", note: "Enhanced Conversions", Logo: GoogleAdsLogo },
  { name: "TikTok", note: "Events API", Logo: TikTokLogo },
  { name: "Snapchat", note: "Conversions API", Logo: SnapchatLogo },
];

const trust = [
  { k: "99.9%", v: "Delivery SLA" },
  { k: "42ms", v: "Median latency" },
  { k: "300+", v: "Edge locations" },
  { k: "SOC2", v: "Type II in flight" },
];

const reasons = [
  {
    icon: BarChart3,
    title: "Built for scale",
    body: "Engineered for advertisers running six- and seven-figure monthly media budgets.",
  },
  {
    icon: Cookie,
    title: "Durable attribution",
    body: "First-party server-set cookies link the journey across visits and devices.",
  },
  {
    icon: Globe,
    title: "First-party data",
    body: "Web, CRM, POS and offline — unified in an environment you own.",
  },
  {
    icon: Zap,
    title: "Unblockable signal",
    body: "Server-to-server delivery from your own domain. Unaffected by iOS, ITP or ad blockers.",
  },
  {
    icon: GitMerge,
    title: "Browser + server dedupe",
    body: "Deduplication across the full pipeline. EMQ holds at 9+.",
  },
  {
    icon: Eye,
    title: "Maximum match quality",
    body: "Email, phone, FBP/FBC and click IDs hashed and forwarded automatically.",
  },
  {
    icon: Lock,
    title: "Compliance built in",
    body: "Consent Mode v2, GDPR-aligned PII handling, SOC 2 Type II in progress.",
  },
  {
    icon: Clock,
    title: "Offline & COD ready",
    body: "Fire events on confirmed orders — COD, BNPL, subscriptions and delayed checkouts.",
  },
];

type Tier = {
  name: string;
  desc: string;
  monthly: number;
  yearly: number;
  events: string;
  highlight?: boolean;
  perks: string[];
};

const tiers: Tier[] = [
  {
    name: "Free",
    desc: "Try Tagify with zero risk. No card required.",
    monthly: 0,
    yearly: 0,
    events: "15,000 events / mo",
    perks: [
      "1 domain · 2 containers",
      "5 receivers / container",
      "1 sGTM container",
      "Email support · 7d logs",
      "Consent Mode v2 · Custom domain",
    ],
  },
  {
    name: "Starter",
    desc: "For small stores ready to scale tracking.",
    monthly: 15,
    yearly: 13,
    events: "500,000 events / mo",
    perks: [
      "1 domain · 5 containers",
      "Live chat support",
      "Bot detection & filtering",
      "WordPress plugin",
      "300+ CDN locations",
    ],
  },
  {
    name: "Pro",
    desc: "Most popular for scaling DTC brands.",
    monthly: 30,
    yearly: 24,
    events: "2,000,000 events / mo",
    highlight: true,
    perks: [
      "2 domains · 15 containers · 3 sGTM",
      "Chat, call & Meet support",
      "30 days log retention",
      "Advanced reports · Click ID restorer",
      "Delay purchase system",
    ],
  },
  {
    name: "Enterprise",
    desc: "For agencies and high-volume operations.",
    monthly: 50,
    yearly: 42,
    events: "5,000,000 events / mo",
    perks: [
      "10 domains · 100 containers · 10 sGTM",
      "Priority support",
      "90 days log retention",
      "Free migration & onboarding",
      "Multi-domain support",
    ],
  },
];

const faqs = [
  {
    q: "What counts as an event?",
    a: "Any tracking request sent to Tagify — page views, add to carts, purchases, custom events. Each one counts against your monthly quota.",
  },
  {
    q: "What is Tagify sGTM?",
    a: "Google's Server-Side Tag Manager on managed cloud, fully handled by Tagify. Supports every GTM template including Google Ads Enhanced Conversions.",
  },
  {
    q: "How is Tagify Gateway different from sGTM?",
    a: "Tagify Gateway is our own gateway — one pixel installs on your site, sends every event to the Tagify server, and we forward clean payloads to your receivers. sGTM is for teams who already live inside Google Tag Manager.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. Upgrades apply immediately; downgrades take effect at the next billing cycle.",
  },
];

export function LandingView() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-background bg-grain text-ink">
      <SiteHeader />

      <section className="ambient-bg relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-12 md:pt-24">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-ink/10 bg-background px-3 py-1 text-xs text-ink/70 md:bg-background/70 md:backdrop-blur">
            <span className="relative h-1.5 w-1.5 rounded-full bg-coral dot-pulse" />
            Trusted by 140+ growth teams · SOC2 Type II in progress
          </div>

          <h1
            className="reveal mt-7 max-w-5xl font-display text-[2.25rem] font-medium leading-[1.05] tracking-tight md:text-[4.25rem] lg:text-[5rem]"
            style={{ animationDelay: "60ms" }}
          >
            Server-side tracking,
            <br />
            <span className="text-ink/35">engineered for </span>
            <span className="underline-doodle">serious</span> advertisers.
          </h1>

          <div className="mt-8 grid items-end gap-8 md:grid-cols-12 md:gap-10">
            <p
              className="reveal md:col-span-7 text-base text-ink/65 md:text-[15px] md:leading-[1.55]"
              style={{ animationDelay: "140ms" }}
            >
              <span className="font-medium text-ink">Tagify Gateway</span> is your gateway — one
              pixel installs on your site, sends every event to our server, and we forward clean
              payloads to your receivers. <span className="font-medium text-ink">Tagify sGTM</span>{" "}
              covers teams already living in Google Tag Manager.
            </p>

            <div
              className="reveal md:col-span-5 flex flex-col items-stretch gap-3"
              style={{ animationDelay: "220ms" }}
            >
              <div className="flex w-full items-center gap-2 rounded-full border border-ink/15 bg-background p-1.5 shadow-[0_1px_0_oklch(0.16_0.005_60/0.04)]">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-ink/40"
                />
                <Link
                  href="/dashboard"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink"
                >
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs text-ink/55">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-coral" /> 5-min setup
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-coral" /> No code
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-coral" /> Free forever plan
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16">
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            <div className="bento fade-up col-span-12 row-span-2 rounded-2xl border border-ink/10 bg-ink p-7 text-background md:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                Live · last 24h
              </p>
              <p className="mt-6 font-display text-6xl font-medium leading-none md:text-7xl">
                9.4<span className="text-coral">.</span>
              </p>
              <p className="mt-2 text-sm text-background/65">
                Avg Event Match Quality across customers
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-background/15 pt-5 text-xs">
                {trust.slice(0, 3).map((s) => (
                  <div key={s.v}>
                    <p className="font-mono text-xl">{s.k}</p>
                    <p className="text-background/55">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="bento fade-up col-span-12 rounded-2xl border border-ink/10 bg-card p-5 font-mono text-[12px] leading-relaxed md:col-span-7"
              style={{ animationDelay: "80ms" }}
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-ink/50">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral dot-pulse" /> POST /e · 200 OK
                </span>
                <span>+ 14,302 events / min</span>
              </div>
              <pre className="overflow-x-auto text-ink">
                <span className="text-ink/40">{"// tagify server → meta receiver"}</span>
                {`
{
  `}
                <span className="text-coral">&quot;event_name&quot;</span>
                {`: `}
                <span className="text-ink">&quot;Purchase&quot;</span>
                {`,
  `}
                <span className="text-coral">&quot;event_time&quot;</span>
                {`: `}
                <span className="text-ink">1703851200</span>
                {`,
  `}
                <span className="text-coral">&quot;user_data&quot;</span>
                {`: { `}
                <span className="text-coral">&quot;em&quot;</span>
                {`: `}
                <span className="text-ink/70">&quot;hashed&quot;</span>
                {`, `}
                <span className="text-coral">&quot;ph&quot;</span>
                {`: `}
                <span className="text-ink/70">&quot;hashed&quot;</span>
                {`, `}
                <span className="text-coral">&quot;fbp&quot;</span>
                {`: `}
                <span className="text-ink/70">&quot;fb.1.xxx&quot;</span>
                {` },
  `}
                <span className="text-coral">&quot;custom_data&quot;</span>
                {`: { `}
                <span className="text-coral">&quot;currency&quot;</span>
                {`: `}
                <span className="text-ink">&quot;BDT&quot;</span>
                {`, `}
                <span className="text-coral">&quot;value&quot;</span>
                {`: `}
                <span className="text-ink">1500.00</span>
                {` }
}`}
              </pre>
            </div>

            <div
              className="bento fade-up col-span-6 rounded-2xl border border-ink/10 bg-card p-5 md:col-span-4"
              style={{ animationDelay: "140ms" }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
                Receivers
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[MetaLogo, GoogleAdsLogo, TikTokLogo, SnapchatLogo].map((Logo, i) => (
                  <div
                    key={i}
                    className="grid aspect-[2/1] place-items-center rounded-lg bg-background"
                  >
                    <Logo size={26} />
                  </div>
                ))}
              </div>
            </div>

            <div
              className="bento fade-up col-span-6 rounded-2xl border border-coral bg-coral p-5 text-white md:col-span-3"
              style={{ animationDelay: "200ms" }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/75">
                avg ROAS lift
              </p>
              <p className="mt-3 font-display text-5xl font-medium">+34%</p>
              <p className="mt-2 text-xs text-white/80">first 30 days, DTC cohort</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-y border-ink/10 bg-background/40 py-5 fade-x">
          <p className="px-5 pb-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink/45">
            Trusted by growth teams
          </p>
          <div className="flex animate-ticker gap-12 whitespace-nowrap">
            {[...customers, ...customers, ...customers].map((c, i) => (
              <span
                key={i}
                className="font-display text-xl font-medium tracking-widest text-ink/35"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-ink py-24 text-background md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-end gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
                § the problem
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                Your pixel is <span className="text-coral">leaking budget</span>.
              </h2>
            </div>
            <p className="md:col-span-5 text-background/65">
              A third of every event is suppressed before it leaves the browser. At enterprise
              spend, that gap is paid in media — every day, in seven figures a year.
            </p>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {[
              {
                icon: ShieldOff,
                stat: "~35%",
                title: "Events suppressed in-browser",
                body: "iOS, Safari ITP and ad blockers wipe out a third of pixel fires before they ever reach a platform.",
              },
              {
                icon: TrendingDown,
                stat: "CPA drift",
                title: "Auctions trained on noise",
                body: "Meta, TikTok and Google bid on what they receive. Incomplete data quietly trains the auction against you.",
              },
              {
                icon: AlertTriangle,
                stat: "Wrong calls",
                title: "Decisions on partial truth",
                body: "Missing conversions distort channel credit — you scale the wrong creatives and kill the winners.",
              },
              {
                icon: Code2,
                stat: "Sprint cost",
                title: "Tracking gated by engineering",
                body: "Every new pixel, fix and receiver sits in the dev backlog while the market moves on without you.",
              },
            ].map((p, i) => (
              <div
                key={p.title}
                className="bento fade-up rounded-2xl border border-background/10 bg-background/[0.04] p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <p.icon className="h-5 w-5 text-coral" />
                  <span className="font-mono text-xs text-coral">{p.stat}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-medium">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/65">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-cream py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
              § the shift
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
              Same spend. <span className="underline-doodle">Sharper return</span>.
            </h2>
            <p className="mt-4 text-ink/65">
              What changes the week tracking moves server-side — and your algorithms finally see the
              full picture.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="bento fade-up rounded-3xl border border-ink/10 bg-background p-7 md:p-9">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink/55">
                  <X className="h-3 w-3" /> before
                </span>
                <span className="font-mono text-xs text-ink/40">browser-side</span>
              </div>
              <h3 className="mt-7 font-display text-2xl font-medium text-ink/55">
                Partial signal.
              </h3>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "A fraction of conversions tracked",
                  "Platforms optimize on incomplete data",
                  "Attribution drifts across reports",
                  "Every pixel change waits on engineering",
                  "Consent and PII handled ad-hoc",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-ink/55">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-ink/35" />
                    <span className="line-through decoration-ink/20">{x}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="bento fade-up rounded-3xl border border-coral bg-ink p-7 text-background md:p-9"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-coral px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                  <Check className="h-3 w-3" /> with tagify
                </span>
                <span className="font-mono text-xs text-background/40">server-side</span>
              </div>
              <h3 className="mt-7 font-display text-2xl font-medium">
                One source of <span className="text-coral">truth</span>.
              </h3>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Events captured server-side from your own domain",
                  "Platforms optimize on complete signal",
                  "Attribution reconciles across receivers",
                  "Marketing ships receivers without engineering",
                  "Consent Mode v2 and PII hashing handled",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                    <span className="text-background/90">{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink"
            >
              Try for free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-xs text-ink/55">White-glove onboarding · Migration handled</span>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-end gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
                § the payoff
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                Built for the brands that{" "}
                <span className="underline-doodle">can&apos;t afford to guess</span>.
              </h2>
            </div>
            <p className="md:col-span-5 text-ink/65">
              Not a cheaper pixel. A premium data spine — engineered so the advertisers spending the
              most get the most out of every dollar.
            </p>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {[
              {
                icon: Rocket,
                title: "Complete conversion signal",
                body: "Events captured server-side and forwarded to every receiver.",
                proof: "EMQ 9.4 average",
              },
              {
                icon: DollarSign,
                title: "More efficient media spend",
                body: "Cleaner input, sharper bidding. Efficiency compounds at scale.",
                proof: "Lower blended CPA",
              },
              {
                icon: BarChart3,
                title: "Reporting that reconciles",
                body: "One pipeline feeding Meta, TikTok, Google and GA4 in sync.",
                proof: "Single source of truth",
              },
              {
                icon: Zap,
                title: "Ship without engineering",
                body: "Receivers configured from a dashboard. No tickets, no waits.",
                proof: "Minutes, not sprints",
              },
              {
                icon: Gauge,
                title: "Enterprise infrastructure",
                body: "300+ edge PoPs, 42ms median latency, 99.9% delivery SLA.",
                proof: "99.9% delivery SLA",
              },
              {
                icon: ShieldCheck,
                title: "Compliance, handled",
                body: "Consent Mode v2, PII hashing, GDPR-aligned defaults.",
                proof: "SOC 2 Type II in progress",
              },
            ].map((b, i) => (
              <div
                key={b.title}
                className="bento fade-up flex flex-col rounded-2xl border border-ink/10 bg-card p-6"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft">
                  <b.icon className="h-5 w-5 text-coral" />
                </div>
                <h3 className="mt-5 font-display text-lg font-medium leading-snug">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{b.body}</p>
                <p className="mt-4 border-t border-ink/10 pt-3 font-mono text-[11px] uppercase tracking-widest text-coral">
                  {b.proof}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="analytics" className="border-t border-ink/10 bg-cream py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-end gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
                § live events &amp; analytics
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] md:text-5xl">
                Every event, <span className="underline-doodle">live</span> — and the analytics to
                prove it.
              </h2>
            </div>
            <p className="md:col-span-5 text-ink/65 md:text-[15px] md:leading-[1.6]">
              Watch events land the moment they fire. See receivers, EMQ, revenue and active users —
              in one dashboard, refreshed in real time.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <div className="bento fade-up lg:col-span-7 overflow-hidden rounded-3xl border border-ink/10 bg-background">
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-coral" />
                  <p className="text-sm font-medium">Live events</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                  </span>
                </div>
                <span className="font-mono text-[10px] text-ink/50">+ 14,302 / min</span>
              </div>
              <ul>
                {[
                  {
                    name: "Purchase",
                    emq: 9.6,
                    rev: "$248.50",
                    ago: "2s ago",
                    ok: ["meta", "google_ads", "tiktok", "ga4"],
                    fail: [],
                  },
                  {
                    name: "AddToCart",
                    emq: 9.2,
                    rev: "$89.00",
                    ago: "4s ago",
                    ok: ["meta", "tiktok", "snapchat", "ga4"],
                    fail: [],
                  },
                  {
                    name: "InitiateCheckout",
                    emq: 8.9,
                    rev: "$312.00",
                    ago: "7s ago",
                    ok: ["meta", "google_ads", "ga4"],
                    fail: ["snapchat"],
                  },
                  {
                    name: "ViewContent",
                    emq: 9.4,
                    rev: undefined,
                    ago: "11s ago",
                    ok: ["meta", "tiktok", "ga4"],
                    fail: [],
                  },
                  {
                    name: "Purchase",
                    emq: 9.7,
                    rev: "$1,420.00",
                    ago: "18s ago",
                    ok: ["meta", "google_ads", "tiktok", "snapchat", "ga4"],
                    fail: [],
                  },
                  {
                    name: "Lead",
                    emq: 9.1,
                    rev: undefined,
                    ago: "31s ago",
                    ok: ["meta", "tiktok", "ga4"],
                    fail: [],
                  },
                ].map((e, i) => {
                  const status = e.fail.length === 0 ? "bg-emerald-500" : "bg-amber-500";
                  const emqCls =
                    e.emq >= 9
                      ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
                      : "text-amber-700 bg-amber-500/10 border-amber-500/20";
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-3 border-b border-ink/5 px-5 py-3 last:border-0"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${status}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="font-mono text-xs font-medium">{e.name}</code>
                          <span
                            className={`rounded-full border px-1.5 py-px text-[10px] font-medium ${emqCls}`}
                          >
                            EMQ {e.emq}
                          </span>
                          {e.rev && (
                            <span className="text-[10px] font-medium text-ink/55">{e.rev}</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {e.ok.map((p) => {
                            const Logo = (
                              {
                                meta: MetaLogo,
                                google_ads: GoogleAdsLogo,
                                tiktok: TikTokLogo,
                                snapchat: SnapchatLogo,
                                ga4: GoogleAnalyticsLogo,
                              } as Record<string, (p: { size?: number }) => React.ReactElement>
                            )[p];
                            return (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1 rounded bg-cream px-1.5 py-0.5 text-[10px] text-ink/70"
                              >
                                <Logo size={10} /> <CheckCircle2 className="h-2.5 w-2.5" />
                              </span>
                            );
                          })}
                          {e.fail.map((p) => {
                            const Logo = (
                              {
                                meta: MetaLogo,
                                google_ads: GoogleAdsLogo,
                                tiktok: TikTokLogo,
                                snapchat: SnapchatLogo,
                                ga4: GoogleAnalyticsLogo,
                              } as Record<string, (p: { size?: number }) => React.ReactElement>
                            )[p];
                            return (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-700"
                              >
                                <Logo size={10} /> <X className="h-2.5 w-2.5" />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[10px] tabular-nums text-ink/50">
                        <time>{e.ago}</time>
                        <ChevronRight className="h-3.5 w-3.5 text-ink/30" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div
                className="bento fade-up rounded-3xl border border-ink/10 bg-ink p-6 text-background md:p-7"
                style={{ animationDelay: "60ms" }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                  Last 24h
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-display text-3xl font-medium">2.41M</p>
                    <p className="mt-1 text-xs text-background/55">Events forwarded</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-medium">99.4%</p>
                    <p className="mt-1 text-xs text-background/55">Success rate</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-medium text-coral">9.4</p>
                    <p className="mt-1 text-xs text-background/55">Avg EMQ</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-medium">$184K</p>
                    <p className="mt-1 text-xs text-background/55">Attributed revenue</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-background/15 pt-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-background/45">
                    Events / hour
                  </p>
                  <svg viewBox="0 0 300 70" className="block h-20 w-full">
                    <defs>
                      <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--coral)" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="var(--coral)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,55 L20,48 L40,52 L60,40 L80,42 L100,30 L120,35 L140,22 L160,28 L180,18 L200,24 L220,12 L240,20 L260,8 L280,14 L300,4 L300,70 L0,70 Z"
                      fill="url(#spark)"
                    />
                    <path
                      d="M0,55 L20,48 L40,52 L60,40 L80,42 L100,30 L120,35 L140,22 L160,28 L180,18 L200,24 L220,12 L240,20 L260,8 L280,14 L300,4"
                      stroke="var(--coral)"
                      strokeWidth="1.6"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              <div
                className="bento fade-up rounded-3xl border border-ink/10 bg-background p-6 md:p-7"
                style={{ animationDelay: "120ms" }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
                  Top receivers · 24h
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    { name: "Meta", Logo: MetaLogo, pct: 100, val: "812K" },
                    { name: "Google Ads", Logo: GoogleAdsLogo, pct: 86, val: "698K" },
                    { name: "GA4", Logo: GoogleAnalyticsLogo, pct: 74, val: "601K" },
                    { name: "TikTok", Logo: TikTokLogo, pct: 52, val: "423K" },
                    { name: "Snapchat", Logo: SnapchatLogo, pct: 28, val: "228K" },
                  ].map((r) => (
                    <li key={r.name} className="flex items-center gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-cream">
                        <r.Logo size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-ink">{r.name}</span>
                          <span className="font-mono text-ink/55">{r.val}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
                          <div
                            className="h-full rounded-full bg-coral"
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {[
              {
                icon: Activity,
                title: "Real-time live events",
                body: "Watch events arrive and route to every destination as they fire.",
              },
              {
                icon: Fingerprint,
                title: "Active user tracking",
                body: "Concurrent users on your site, server-side — accurate where GA4 can't be.",
              },
              {
                icon: BarChart3,
                title: "Per-platform breakdown",
                body: "Sent, delivered, failed — per receiver, per event, per campaign.",
              },
              {
                icon: Star,
                title: "EMQ scoring",
                body: "Every event scored 0–10 so you always know your signal quality.",
              },
              {
                icon: DollarSign,
                title: "Revenue attribution",
                body: "Revenue per receiver and event type, reconciled in one view.",
              },
              {
                icon: ArrowUpRight,
                title: "Full data export",
                body: "CSV export and raw event streams to BigQuery / Snowflake (Pro).",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="bento fade-up rounded-2xl border border-ink/10 bg-background p-5"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-soft">
                  <f.icon className="h-5 w-5 text-coral" />
                </div>
                <h3 className="mt-4 font-display text-base font-medium leading-snug">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-ink/10 bg-background">
            <div className="grid gap-0 md:grid-cols-12">
              <div className="md:col-span-4 border-b border-ink/10 bg-ink p-6 text-background md:border-b-0 md:border-r md:border-ink/10 md:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                  Data retention
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium leading-tight">
                  History that grows with your plan.
                </h3>
                <p className="mt-2 text-sm text-background/65">
                  Your data is yours. Every plan includes analytics — more history as you grow.
                </p>
                <a
                  href="#pricing"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-coral hover:text-background"
                >
                  Upgrade for more history <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="md:col-span-8 p-2 md:p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink/50">
                      <th className="px-3 py-2 font-normal">Plan</th>
                      <th className="px-3 py-2 text-right font-normal">History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_HISTORY.map((p) => {
                      const highlighted = p.key === "pro";
                      return (
                        <tr
                          key={p.key}
                          className={`border-t border-ink/5 ${highlighted ? "bg-coral-soft/60" : ""}`}
                        >
                          <td className="px-3 py-2.5">
                            <span className="font-medium text-ink/85">{p.name}</span>
                            {highlighted && (
                              <span className="ml-2 rounded-full bg-coral px-1.5 py-px font-mono text-[9px] uppercase tracking-widest text-white">
                                popular
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                            {p.history}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink"
            >
              See it on your own data <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-xs text-ink/55">Free forever plan · No credit card</span>
          </div>
        </div>
      </section>

      <section id="products" className="py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-end gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
                § 01 — products
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                Two products. <span className="underline-doodle">One data spine.</span>
              </h2>
            </div>
            <p className="md:col-span-5 text-ink/65">
              Pick the entry point that fits your stack. Same Tagify edge, same receivers, same
              auditable pipeline behind both.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-12 gap-4">
            <article className="bento fade-up relative col-span-12 overflow-hidden rounded-3xl border border-ink bg-ink p-8 text-background md:col-span-7 md:p-12">
              <div className="pointer-events-none absolute -right-24 -top-24 hidden h-72 w-72 rounded-full bg-coral/20 blur-3xl md:block" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-background/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-background/70">
                    <Database className="h-3 w-3" /> our own gateway
                  </span>
                  <span className="font-mono text-xs text-background/40">/gateway</span>
                </div>
                <h3 className="mt-8 font-display text-4xl font-medium leading-[1.05] md:text-6xl">
                  Tagify <span className="text-coral">Gateway</span>
                </h3>
                <p className="mt-4 max-w-lg text-background/70">
                  One pixel on your site. Every event flows into the Tagify server, is enriched,
                  hashed, deduped — then forwarded to your receivers. No middlemen, no third-party
                  gateway, no glue code.
                </p>
                <ul className="mt-7 grid gap-2 text-sm sm:grid-cols-2">
                  {[
                    "One pixel · every receiver",
                    "PII hashing built-in",
                    "Bot detection & filtering",
                    "Shopify · Woo · Salla",
                  ].map((x) => (
                    <li key={x} className="flex items-center gap-2 text-background/85">
                      <Check className="h-4 w-4 text-coral" /> {x}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="mt-9 inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-background hover:text-ink"
                >
                  Deploy Gateway <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            <article
              className="bento fade-up col-span-12 rounded-3xl border border-ink/15 bg-card p-8 md:col-span-5 md:p-10"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink/65">
                  <Server className="h-3 w-3" /> managed sgtm
                </span>
                <span className="font-mono text-xs text-ink/40">/sgtm</span>
              </div>
              <h3 className="mt-8 font-display text-4xl font-medium leading-[1.05]">
                Tagify <span className="text-coral">sGTM</span>
              </h3>
              <p className="mt-4 text-ink/70">
                Google&apos;s Server-Side Tag Manager, fully managed. Every GTM template,
                preview/debug, custom domain — without touching Google Cloud.
              </p>
              <ul className="mt-7 grid gap-2 text-sm">
                {[
                  "Custom domain & SSL",
                  "300+ edge PoPs",
                  "Preview & debug mode",
                  "Auto-scaling containers",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-ink/80">
                    <Check className="h-4 w-4 text-coral" /> {x}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="mt-9 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background transition hover:bg-coral"
              >
                Deploy sGTM <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </article>

            <div className="col-span-12 mt-2 rounded-2xl border border-ink/10 bg-cream p-6 md:p-8">
              <p className="text-sm text-ink/70 md:text-base">
                <span className="font-medium text-ink">Receivers we ship to today —</span> all
                routed through the Tagify server, never via third parties.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {receivers.map((g) => (
                  <span
                    key={g.name}
                    className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-background px-3.5 py-2 text-sm"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-cream">
                      <g.Logo size={16} />
                    </span>
                    <span className="font-medium text-ink">{g.name}</span>
                    <span className="hidden text-ink/50 sm:inline">· {g.note}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-ink/10 bg-cream py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
            § 02 — pipeline
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
            Tagify is the <span className="underline-doodle">transport layer</span>.
          </h2>
          <p className="mt-4 max-w-2xl text-ink/65">
            Your sources hand events to Tagify. We clean, hash, dedupe and forward — in parallel —
            to every receiver. No third-party gateways, no ad-blocker losses.
          </p>

          <div className="relative mt-12 overflow-hidden rounded-3xl border border-ink/10 bg-background p-5 md:p-10">
            <div className="grid grid-cols-5 gap-0">
              {[
                { l: "Website", I: Globe },
                { l: "sGTM", I: Server },
                { l: "Shopify", I: ShoppingBag },
                { l: "Woo / Salla", I: ShoppingBag },
                { l: "CRM / POS", I: Database },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center px-1">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-ink/15 bg-background shadow-[0_2px_8px_-4px_oklch(0.16_0.005_60/0.25)] transition hover:-translate-y-0.5 md:h-14 md:w-14">
                    <s.I className="h-5 w-5 text-ink md:h-6 md:w-6" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-center text-[10px] font-medium leading-tight text-ink/65 md:text-xs">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative mt-2">
              <svg
                className="block w-full"
                viewBox="0 0 1000 180"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                {[100, 300, 500, 700, 900].map((x, i) => {
                  const d = `M${x},0 C${x},100 500,80 500,180`;
                  return (
                    <g key={x}>
                      <path
                        d={d}
                        stroke="var(--coral)"
                        strokeWidth="1.4"
                        fill="none"
                        opacity="0.3"
                      />
                      <circle r="4" fill="var(--coral)">
                        <animateMotion
                          dur="2.6s"
                          repeatCount="indefinite"
                          begin={`${i * 0.28}s`}
                          path={d}
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative h-20 w-20 md:h-24 md:w-24">
                <span className="pointer-events-none absolute inset-0 hidden rounded-2xl bg-coral/40 blur-2xl md:block md:animate-pulse" />
                <div className="relative grid h-full w-full place-items-center rounded-2xl bg-ink text-background shadow-[0_12px_40px_-12px_oklch(0.68_0.21_35/0.55)]">
                  <BrandMark className="h-10 w-10 md:h-12 md:w-12" />
                </div>
              </div>
              <p className="mt-2 text-center font-display text-sm font-medium">Tagify server</p>
              <p className="text-center font-mono text-[10px] uppercase tracking-widest text-ink/50">
                300+ PoPs · 42ms
              </p>
            </div>

            <div className="relative mt-2">
              <svg
                className="block w-full"
                viewBox="0 0 1000 180"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                {[100, 300, 500, 700, 900].map((x, i) => {
                  const d = `M500,0 C500,100 ${x},80 ${x},180`;
                  return (
                    <g key={x}>
                      <path
                        d={d}
                        stroke="var(--coral)"
                        strokeWidth="1.4"
                        fill="none"
                        opacity="0.3"
                      />
                      <circle r="4" fill="var(--coral)">
                        <animateMotion
                          dur="2.6s"
                          repeatCount="indefinite"
                          begin={`${0.7 + i * 0.28}s`}
                          path={d}
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-5 gap-0">
              {receivers.map((r) => (
                <div key={r.name} className="flex flex-col items-center px-1">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-ink/15 bg-background shadow-[0_2px_8px_-4px_oklch(0.16_0.005_60/0.25)] transition hover:-translate-y-0.5 md:h-14 md:w-14">
                    <r.Logo size={22} />
                  </div>
                  <p className="mt-2 text-center text-[10px] font-medium leading-tight text-ink/65 md:text-xs">
                    {r.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5 text-xs text-ink/55">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-coral dot-pulse" /> Events in from your
                stack
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-coral dot-pulse" /> Clean payloads out,
                in parallel
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {[
              { i: ShieldOff, t: "Ad-blocker free" },
              { i: Fingerprint, t: "PII auto-hashing" },
              { i: Bot, t: "Bot filtering" },
              { i: ShieldCheck, t: "Consent Mode v2" },
              { i: Gauge, t: "42ms median" },
            ].map((f) => (
              <div
                key={f.t}
                className="flex items-center gap-2 rounded-xl border border-ink/10 bg-background px-3 py-2.5 text-xs"
              >
                <f.i className="h-3.5 w-3.5 shrink-0 text-coral" />
                <span className="font-medium text-ink">{f.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
                § 03 — why tagify
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
                Cleaner data. Better performance.{" "}
                <span className="circle-doodle">Less hassle.</span>
              </h2>
            </div>
            <a
              href="#pricing"
              className="hidden font-mono text-xs uppercase tracking-widest text-ink/55 transition hover:text-ink md:inline"
            >
              → see pricing
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className={`bento fade-up rounded-2xl border p-5 ${i === 0 ? "md:col-span-2 md:row-span-2 border-coral bg-coral text-white" : "border-ink/10 bg-card"}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <r.icon className={`h-5 w-5 ${i === 0 ? "text-white" : "text-coral"}`} />
                <h3
                  className={`mt-4 font-display font-medium ${i === 0 ? "text-lg md:text-3xl" : "text-lg"}`}
                >
                  {r.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${i === 0 ? "text-white/85 md:text-base" : "text-ink/65"}`}
                >
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-cream py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 md:grid-cols-4">
          {trust.map((t) => (
            <div key={t.v}>
              <p className="font-display text-3xl font-medium text-ink md:text-4xl">{t.k}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-ink/55">{t.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
                § 04 — pricing
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                Simple, <span className="underline-doodle">transparent</span> pricing.
              </h2>
              <p className="mt-3 text-ink/65">Start free. Scale as you grow. No hidden fees.</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-background p-1">
              <button
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!yearly ? "bg-ink text-background" : "text-ink/55"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${yearly ? "bg-ink text-background" : "text-ink/55"}`}
              >
                Yearly{" "}
                <span className="ml-1 rounded-full bg-coral px-1.5 py-0.5 text-[10px] text-white">
                  −19%
                </span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((t, i) => {
              const price = yearly ? t.yearly : t.monthly;
              return (
                <div
                  key={t.name}
                  className={`bento fade-up flex flex-col rounded-2xl border p-7 ${t.highlight ? "border-ink bg-ink text-background lg:-translate-y-3" : "border-ink/10 bg-card"}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {t.highlight && (
                    <p className="mb-3 inline-block w-fit rounded-full bg-coral px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                      Most popular
                    </p>
                  )}
                  <h3 className="font-display text-xl font-medium">{t.name}</h3>
                  <p
                    className={`mt-1 text-xs ${t.highlight ? "text-background/60" : "text-ink/55"}`}
                  >
                    {t.desc}
                  </p>
                  <p className="mt-5 flex items-baseline gap-1">
                    {price === 0 ? (
                      <span className="font-display text-4xl font-medium">Free</span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-medium">${price}</span>
                        <span
                          className={`text-sm ${t.highlight ? "text-background/60" : "text-ink/55"}`}
                        >
                          /mo
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-coral">{t.events}</p>
                  <Link
                    href="/dashboard"
                    className={`mt-5 block rounded-full px-4 py-2.5 text-center text-sm font-medium transition ${t.highlight ? "bg-coral text-white hover:bg-background hover:text-ink" : "bg-ink text-background hover:bg-coral"}`}
                  >
                    {t.name === "Free" ? "Start free" : "Get started"}
                  </Link>
                  <ul
                    className={`mt-6 space-y-2 border-t pt-5 ${t.highlight ? "border-background/15" : "border-ink/10"}`}
                  >
                    {t.perks.map((p) => (
                      <li
                        key={p}
                        className={`flex gap-2 text-sm ${t.highlight ? "text-background/80" : "text-ink/75"}`}
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-widest text-ink/45">
            Paddle secure checkout · Credit card · PayPal · BDT supported · Cancel anytime
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-cream py-24">
        <div className="mx-auto max-w-4xl px-5">
          <div className="rounded-3xl border border-ink/10 bg-background p-10 md:p-14">
            <div className="flex gap-0.5 text-coral">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-6 font-display text-2xl font-medium leading-snug md:text-3xl">
              &quot;We switched from native Meta Pixel to Tagify.{" "}
              <span className="text-coral">EMQ jumped from 5.8 to 9.2</span> and cost per purchase
              dropped 23% in the first month.&quot;
            </p>
            <div className="mt-7 flex items-center gap-3 text-sm text-ink/60">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-coral-soft font-mono text-xs font-semibold text-coral">
                PL
              </span>
              <span>
                <span className="font-medium text-ink">Performance Lead</span> · DTC fashion brand,
                Dhaka
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-coral">
              § 05 — faq
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight">
              Questions, answered.
            </h2>
            <p className="mt-3 text-ink/65">
              Can&apos;t find what you need?{" "}
              <a href="#" className="text-ink underline decoration-coral underline-offset-4">
                Talk to us →
              </a>
            </p>
          </div>
          <div className="md:col-span-8 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-medium">
                  {f.q}
                  <Plus className="h-4 w-4 text-coral transition group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="ambient-bg relative overflow-hidden rounded-3xl bg-ink p-10 text-background md:p-16">
            <div className="grid items-end gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <h2 className="font-display text-4xl font-medium leading-[1.05] md:text-6xl">
                  Make every ad dollar <span className="underline-doodle">work harder</span>.
                </h2>
                <p className="mt-4 max-w-xl text-background/65">
                  A 20-minute call. We&apos;ll map your current pipeline and the signal it&apos;s
                  leaving on the table.
                </p>
              </div>
              <div className="md:col-span-4 flex flex-col gap-3 md:items-end">
                <Link
                  href="/dashboard"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-coral px-6 py-3 text-sm font-medium text-white transition hover:bg-background hover:text-ink"
                >
                  Try for free <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="text-xs text-background/60">
                  White-glove onboarding · Migration handled
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const PLAN_HISTORY: Array<{ key: string; name: string; history: string; days: number }> = [
  { key: "free", name: "Free", history: "7 days", days: 7 },
  { key: "pro", name: "Pro", history: "30 days", days: 30 },
  { key: "pro_plus", name: "Pro+", history: "60 days", days: 60 },
  { key: "business", name: "Business", history: "90 days", days: 90 },
  { key: "business_plus", name: "Business+", history: "180 days", days: 180 },
  { key: "enterprise", name: "Enterprise", history: "1 year", days: 365 },
  { key: "enterprise_plus", name: "Enterprise+", history: "2 years", days: 730 },
];
