import type { Metadata } from "next";
import Link from "next/link";
import {
  Coins,
  Users,
  Megaphone,
  BarChart3,
  Check,
  ArrowUpRight,
  Wallet,
  Gift,
  Sparkles,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Affiliate program",
  description: "Earn recurring commission by referring advertisers to Tagify.",
};

const tiers = [
  { name: "Starter", referrals: "1–9 active", commission: "20%" },
  { name: "Growth", referrals: "10–49 active", commission: "30%", featured: true },
  { name: "Partner", referrals: "50+ active", commission: "40%" },
];

const steps = [
  { icon: Users, title: "Sign up", text: "Create your free affiliate account in under a minute." },
  {
    icon: Megaphone,
    title: "Share your link",
    text: "Use your unique referral link or branded coupon.",
  },
  {
    icon: Wallet,
    title: "Get paid",
    text: "Earn recurring commission for the lifetime of every paying customer.",
  },
];

const perks = [
  "Recurring lifetime commission",
  "30-day cookie window",
  "Real-time conversion dashboard",
  "Co-marketing & swipe-file kit",
  "Monthly payouts via card, PayPal or bank",
  "Dedicated affiliate manager (Growth+)",
];

const stats = [
  { icon: BarChart3, n: "$120K+", l: "Paid to partners" },
  { icon: Users, n: "240+", l: "Active affiliates" },
  { icon: Gift, n: "30 days", l: "Cookie window" },
  { icon: Wallet, n: "Monthly", l: "Payouts" },
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-3xl px-5 py-14 text-center md:py-20">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink/60">
              <Coins className="h-3 w-3 text-coral" /> Affiliate Program
            </div>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
              Earn up to <span className="text-coral">40% recurring</span>
            </h1>
            <p className="mt-5 text-lg text-ink/65">
              Refer brands, agencies and freelancers to Tagify and earn commission for every payment
              they make — for as long as they stay subscribed.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background hover:bg-coral"
              >
                Join the program <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium hover:border-ink"
              >
                Talk to a partner manager
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14">
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="rounded-2xl border border-ink/10 bg-background p-6 text-center"
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ink text-background">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-coral">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 font-display text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-ink/10 bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <div className="text-center">
              <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                Commission tiers
              </h2>
              <p className="mt-3 text-ink/60">
                The more brands you bring, the more you earn — automatically.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className={`relative rounded-2xl border bg-background p-8 ${t.featured ? "border-coral shadow-lg shadow-coral/10 md:scale-105" : "border-ink/10"}`}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-[11px] font-medium text-white">
                      Most popular
                    </span>
                  )}
                  <div className="font-mono text-xs uppercase tracking-widest text-ink/55">
                    {t.name}
                  </div>
                  <div className="mt-2 font-display text-5xl font-medium text-ink">
                    {t.commission}
                  </div>
                  <div className="mt-1 text-sm text-ink/60">recurring commission</div>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-ink/70">
                    <Users className="h-4 w-4 text-coral" /> {t.referrals} customers
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14">
          <div className="rounded-2xl border border-ink/10 bg-background p-8 md:p-10">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <Sparkles className="h-7 w-7 text-coral" />
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight">
                  Everything you need to win
                </h2>
                <p className="mt-3 text-ink/65">
                  We treat partners as an extension of our team. Get the assets, data and support
                  you need to promote Tagify with confidence.
                </p>
              </div>
              <ul className="space-y-3">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-coral-soft text-coral">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm text-ink/75">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-14">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-ink/10 bg-background p-6 text-center"
              >
                <s.icon className="mx-auto h-5 w-5 text-coral" />
                <div className="mt-3 font-display text-2xl font-medium">{s.n}</div>
                <div className="mt-1 text-xs text-ink/55">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink/10 bg-ink text-background">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Ready to start earning?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-background/70">
              Join 240+ partners growing with Tagify. No minimums, no quotas — just commissions.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white hover:bg-coral/90"
            >
              Become an affiliate <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
