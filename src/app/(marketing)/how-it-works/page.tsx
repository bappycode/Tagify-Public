import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Plug,
  Settings2,
  ServerCog,
  Send,
  Zap,
  Target,
  ShieldCheck,
  Globe,
  Database,
  Code2,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const metadata: Metadata = {
  title: "How it works",
  description: "From browser event to ad platform: how Tagify's server-side pipeline works.",
};

const products = [
  {
    icon: Database,
    badge: "Recommended for stores",
    title: "Tagify Gateway",
    desc: "Drop one script, call Tagify('track', …), and we fan events out to Meta CAPI, TikTok Events, Snapchat CAPI and GA4 from your first-party domain — no GTM required.",
    bullets: [
      "Custom website, Shopify pixel, or WooCommerce",
      "Hashing, enrichment & deduplication included",
      "Obscure first-party subdomain like c.yourdomain.com",
    ],
    cta: { label: "Set up a Gateway", to: "/signup" as const },
  },
  {
    icon: ServerCog,
    badge: "For GTM power users",
    title: "Tagify sGTM",
    desc: "Fully managed Google Server-Side GTM. Paste your container config, get a tagging server in 30–60 seconds, attach a custom domain, and enable the Stealth Custom Loader.",
    bullets: [
      "One-click container provisioning",
      "Obscure custom domain like s.yourdomain.com",
      "Stealth loader survives Brave, uBlock & ITP",
    ],
    cta: { label: "Deploy a container", to: "/signup" as const },
  },
];

const gwSteps = [
  {
    icon: Plug,
    title: "Create a Gateway workspace",
    desc: "Spin up a workspace in the dashboard. You'll get a Pixel Key and tracking endpoint.",
  },
  {
    icon: Code2,
    title: "Install the snippet",
    desc: "Paste the generated <script> in your <head>. Works on custom sites, Shopify, WooCommerce.",
  },
  {
    icon: Settings2,
    title: "Configure receivers",
    desc: "Toggle on Meta CAPI, TikTok Events, Snapchat CAPI, and GA4. Paste pixel IDs + tokens.",
  },
  {
    icon: Globe,
    title: "Attach your custom domain",
    desc: "Point an obscure subdomain (e.g. c.yourdomain.com) via CNAME. We auto-verify and issue TLS for you.",
  },
];

const sgtmSteps = [
  {
    icon: Layers,
    title: "Paste your container config",
    desc: "Copy the Base64 config from GTM Admin, pick a region, click Deploy.",
  },
  {
    icon: ServerCog,
    title: "Tagging server goes live",
    desc: "Status flips from Provisioning to Active in ~30–60s. You get a tagging URL.",
  },
  {
    icon: Globe,
    title: "Attach your custom domain",
    desc: "Add an obscure subdomain (e.g. s.yourdomain.com) as CNAME. DNS is auto-polled every 30s.",
  },
  {
    icon: Zap,
    title: "Enable Stealth Custom Loader",
    desc: "Replace the default GTM snippet so Brave, uBlock and Safari ITP don't strip tagging.",
  },
];

const timeline = [
  { ms: "0ms", text: "Customer clicks 'Place Order' on your store" },
  { ms: "12ms", text: "Browser fires purchase event to your first-party Gateway endpoint" },
  { ms: "18ms", text: "Edge worker receives request, validates schema and pixel key" },
  { ms: "24ms", text: "User data hashed (SHA-256): email, phone, name, address" },
  { ms: "31ms", text: "Event enriched with IP, user agent, fbp, fbc, ttclid, gclid" },
  { ms: "38ms", text: "Deduplication ID generated and matched against browser-side pixel" },
  {
    ms: "46ms",
    text: "Fan-out: parallel POSTs to Meta CAPI, GA4 MP, TikTok Events, Snapchat CAPI",
  },
  { ms: "120ms", text: "All platforms confirm receipt — event visible in Events Manager" },
];

const benefits = [
  {
    icon: Zap,
    title: "Speed",
    desc: "Sub-50ms processing at the edge. Zero impact on page load. Async by default.",
  },
  {
    icon: Target,
    title: "Accuracy",
    desc: "Recover up to 30% of lost conversions. Higher EMQ means smarter bidding and lower CPAs.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance",
    desc: "Consent Mode v2, GDPR, CCPA. PII hashed before it leaves your domain.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-5 py-14 text-center md:py-20">
          <span className="inline-block rounded-full border border-ink/15 bg-cream px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
            How it works
          </span>
          <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
            Two products. One dashboard. Every event delivered.
          </h1>
          <p className="mt-5 text-lg text-ink/65">
            Tagify ships two complementary products —{" "}
            <strong className="text-ink">Tagify Gateway</strong> for a turnkey server-side pipeline,
            and <strong className="text-ink">Tagify sGTM</strong> for fully managed Google
            Server-Side GTM. Pick one, or run both side by side.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background hover:bg-coral"
            >
              Start free <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/instructions"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium hover:border-ink"
            >
              Read the docs
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-10">
          <div className="grid gap-5 md:grid-cols-2">
            {products.map((p) => (
              <div key={p.title} className="rounded-2xl border border-ink/10 bg-background p-8">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-background">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-coral">
                    {p.badge}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-medium">{p.title}</h3>
                <p className="mt-2 text-ink/65">{p.desc}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-coral">→</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.cta.to}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:border-ink"
                >
                  {p.cta.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink/10 bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-coral">
                <Database className="h-3.5 w-3.5" /> Tagify Gateway
              </div>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
                From your store to every platform
              </h2>
              <p className="mt-3 text-ink/60">
                Four steps. ~5 minutes. Works on custom sites, Shopify and WooCommerce.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {gwSteps.map((s, i) => (
                <div
                  key={s.title}
                  className="relative rounded-2xl border border-ink/10 bg-background p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-background text-sm font-medium">
                      {i + 1}
                    </div>
                    <s.icon className="h-4 w-4 text-coral" />
                  </div>
                  <h3 className="mt-4 font-display font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink/65">{s.desc}</p>
                  {i < gwSteps.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink/25 md:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 grid items-stretch gap-3 md:grid-cols-5">
              <ArchCard icon={ShoppingBag} title="Your store" sub="Shopify · Woo · Custom" />
              <Arrow />
              <ArchCard icon={Plug} title="c.yourdomain.com" sub="First-party endpoint" />
              <Arrow />
              <ArchCard
                icon={ServerCog}
                title="Tagify edge"
                sub="Hash · enrich · dedupe · fan-out"
                highlighted
              />
            </div>
            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-background p-5 text-center">
                <Send className="mx-auto h-6 w-6 text-coral" />
                <div className="mt-2 font-medium">Ad platforms</div>
                <p className="mt-1 text-xs text-ink/60">
                  Meta CAPI · GA4 · TikTok Events · Snapchat CAPI
                </p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-ink/60">
              End-to-end latency: <span className="font-medium text-ink">~120ms</span> · zero impact
              on Core Web Vitals
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-coral">
              <ServerCog className="h-3.5 w-3.5" /> Tagify sGTM
            </div>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
              A managed tagging server in minutes
            </h2>
            <p className="mt-3 text-ink/60">
              No GCP project. No App Engine bills. Paste your container config — we handle the rest.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {sgtmSteps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-ink/10 bg-background p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-background text-sm font-medium">
                    {i + 1}
                  </div>
                  <s.icon className="h-4 w-4 text-coral" />
                </div>
                <h3 className="mt-4 font-display font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{s.desc}</p>
                {i < sgtmSteps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink/25 md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink/10 bg-cream">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <div className="text-center">
              <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                What happens to a Purchase event
              </h2>
              <p className="mt-3 text-ink/60">Millisecond-by-millisecond — Tagify Gateway.</p>
            </div>
            <ol className="mt-10 space-y-3">
              {timeline.map((t) => (
                <li
                  key={t.ms}
                  className="flex gap-4 rounded-xl border border-ink/10 bg-background p-4"
                >
                  <span className="shrink-0 rounded-full bg-coral-soft px-3 py-1 font-mono text-xs font-medium text-coral">
                    {t.ms}
                  </span>
                  <p className="text-sm text-ink/80">{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Why brands choose Tagify
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-ink/10 bg-background p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-coral-soft text-coral">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium">{b.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink/10 bg-ink text-background">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Ready to ship better data?
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

function ArchCard({
  icon: Icon,
  title,
  sub,
  highlighted,
}: {
  icon: typeof ShoppingBag;
  title: string;
  sub: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 text-center ${highlighted ? "bg-ink text-background" : "border border-ink/10 bg-background"}`}
    >
      <Icon className={`mx-auto h-7 w-7 ${highlighted ? "text-coral" : "text-coral"}`} />
      <div className="mt-2 font-medium text-sm">{title}</div>
      <p className={`mt-1 text-xs ${highlighted ? "text-background/65" : "text-ink/60"}`}>{sub}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <ArrowRight className="h-5 w-5 text-ink/25" />
    </div>
  );
}
