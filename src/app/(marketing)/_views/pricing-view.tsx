"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles, ArrowUpRight, Server, Boxes } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

type Currency = "USD" | "BDT";
const rates: Record<Currency, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: "$", rate: 1, label: "USD" },
  BDT: { symbol: "৳", rate: 110, label: "BDT" },
};

type TierKey =
  "free" | "pro" | "pro_plus" | "business" | "business_plus" | "enterprise" | "enterprise_plus";

const REQUESTS: Record<TierKey, string> = {
  free: "10,000 requests / month",
  pro: "500,000 requests / month",
  pro_plus: "2,000,000 requests / month",
  business: "5,000,000 requests / month",
  business_plus: "10,000,000 requests / month",
  enterprise: "20,000,000 requests / month",
  enterprise_plus: "50,000,000 requests / month",
};

const PRICES_SGTM: Record<TierKey, number> = {
  free: 0,
  pro: 20,
  pro_plus: 50,
  business: 100,
  business_plus: 150,
  enterprise: 200,
  enterprise_plus: 300,
};
const PRICES_GW: Record<TierKey, number> = {
  free: 0,
  pro: 25,
  pro_plus: 55,
  business: 105,
  business_plus: 155,
  enterprise: 205,
  enterprise_plus: 305,
};

const TIER_LABELS: Record<TierKey, string> = {
  free: "Free",
  pro: "Pro",
  pro_plus: "Pro+",
  business: "Business",
  business_plus: "Business+",
  enterprise: "Enterprise",
  enterprise_plus: "Enterprise+",
};

const FEATURE_MAP: Record<TierKey, string[]> = {
  free: [
    "10k requests / month",
    "3-day inactivity auto-disable",
    "7-day analytics retention",
    "Email support",
  ],
  pro: [
    "500k requests / month",
    "30-day analytics retention",
    "Custom domains",
    "Bot & traffic filtering",
    "Chat support",
  ],
  pro_plus: ["2M requests / month", "Everything in Pro", "Priority queue", "Higher rate limits"],
  business: [
    "5M requests / month",
    "Priority support",
    "Advanced filtering",
    "SLA on response time",
  ],
  business_plus: ["10M requests / month", "Everything in Business", "Account manager"],
  enterprise: ["20M requests / month", "Dedicated infrastructure", "Custom SLA", "SSO"],
  enterprise_plus: [
    "50M requests / month",
    "Dedicated infrastructure",
    "White-glove migration",
    "Custom contracts",
  ],
};

const RECOMMENDED: TierKey = "pro";

type Plan = {
  name: string;
  tier: TierKey;
  price: number;
  requests: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
};

type Product = {
  key: string;
  icon: typeof Server;
  name: string;
  tagline: string;
  unit: string;
  plans: Plan[];
};

const TIER_KEYS: TierKey[] = [
  "free",
  "pro",
  "pro_plus",
  "business",
  "business_plus",
  "enterprise",
  "enterprise_plus",
];

const buildPlans = (prices: Record<TierKey, number>): Plan[] =>
  TIER_KEYS.map((tier) => ({
    name: TIER_LABELS[tier],
    tier,
    price: prices[tier],
    requests: REQUESTS[tier],
    highlighted: tier === RECOMMENDED,
    features: FEATURE_MAP[tier],
    cta: prices[tier] === 0 ? "Start free" : `Get ${TIER_LABELS[tier]}`,
  }));

const products: Product[] = [
  {
    key: "sgtm",
    icon: Server,
    name: "sGTM Container",
    tagline: "Managed Google Server-Side GTM hosting. Spin up a container in 60 seconds.",
    unit: "per container",
    plans: buildPlans(PRICES_SGTM),
  },
  {
    key: "gateway",
    icon: Boxes,
    name: "Tagify Gateway",
    tagline: "Receive one pixel, fan out clean server-side events to every ad platform.",
    unit: "per gateway",
    plans: buildPlans(PRICES_GW),
  },
];

const faqs = [
  {
    q: "How is pricing structured?",
    a: "Per resource, not per account. Each sGTM container and each Tagify Gateway is billed independently. Add a second container or gateway and you simply add another plan to that resource.",
  },
  {
    q: "What counts as a request?",
    a: "Any tracking call hitting that specific container or gateway — page views, add-to-carts, purchases, custom events. Free tier and Pro quotas are scoped to the single resource.",
  },
  {
    q: "Can I mix Free and Pro?",
    a: "Yes. You can run a Pro sGTM container next to a Free Gateway, or vice versa. Each resource has its own tier.",
  },
  {
    q: "What happens if I exceed the quota?",
    a: "We notify you as you approach the limit. Events are queued, never silently dropped, until you upgrade or the cycle resets.",
  },
  {
    q: "Are higher tiers coming?",
    a: "Yes. Higher request bands and enterprise options are being finalized. Reach out if you need volume today.",
  },
];

const fmt = (usd: number, c: Currency) =>
  usd === 0 ? "Free" : `${rates[c].symbol}${Math.round(usd * rates[c].rate).toLocaleString()}`;

export function PricingView() {
  const [currency, setCurrency] = useState<Currency>("USD");

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center md:py-20">
            <span className="inline-block rounded-full border border-ink/15 bg-background px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
              Pricing
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
              Pay per container.
              <br />
              <span className="text-coral">Not per account.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/65">
              Both products start free. Upgrade only the resources that need volume — your sGTM
              container and your Gateway each have their own tier.
            </p>

            <div className="mt-8 inline-flex rounded-full border border-ink/15 bg-background p-1">
              {(Object.keys(rates) as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${currency === c ? "bg-ink text-background" : "text-ink/60 hover:text-ink"}`}
                >
                  {rates[c].label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 space-y-14">
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.key}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-background">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                      {p.name}
                    </h2>
                    <p className="text-sm text-ink/60">{p.tagline}</p>
                  </div>
                  <span className="ml-auto hidden rounded-full border border-ink/15 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink/55 md:inline">
                    Billed {p.unit}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-background">
                  <table className="min-w-[720px] w-full text-left text-sm">
                    <thead className="bg-cream/60 text-[11px] uppercase tracking-widest text-ink/55">
                      <tr>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium">Requests / mo</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Highlights</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {p.plans.map((plan) => (
                        <tr key={plan.tier} className={plan.highlighted ? "bg-coral/5" : ""}>
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-base font-medium">
                                {plan.name}
                              </span>
                              {plan.highlighted && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-[10px] font-medium text-white">
                                  <Sparkles className="h-2.5 w-2.5" /> Popular
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top font-mono text-xs text-ink/75">
                            {plan.requests.replace(" / month", "").replace(" requests", "")}
                          </td>
                          <td className="px-4 py-4 align-top">
                            {plan.price === 0 ? (
                              <span className="font-display text-lg font-medium">Free</span>
                            ) : (
                              <span>
                                <span className="font-display text-lg font-medium">
                                  {fmt(plan.price, currency)}
                                </span>
                                <span className="text-xs text-ink/55">/mo</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <ul className="space-y-1 text-xs text-ink/70">
                              {plan.features.slice(0, 3).map((f) => (
                                <li key={f} className="flex items-start gap-1.5">
                                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-coral" /> {f}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <Link
                              href="/signup"
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${plan.highlighted ? "bg-ink text-background hover:bg-coral" : "border border-ink/15 text-ink hover:border-ink"}`}
                            >
                              {plan.cta} <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <p className="text-center text-sm text-ink/55">
            Need custom volume or a private deployment?{" "}
            <Link href="/contact" className="text-ink underline-offset-4 hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </section>

        <section className="border-t border-ink/10 bg-cream">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="text-center font-display text-3xl font-medium tracking-tight md:text-4xl">
              Pricing questions
            </h2>
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-ink/10 bg-background p-5"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-medium">
                    {f.q}
                    <span className="text-ink/40 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-ink/65 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-ink/10 bg-ink text-background">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Be live in 5 minutes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-background/70">
              Generous free tier on every product. No credit card required.
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
