"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, HelpCircle, MessageCircle, ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

const categories = [
  {
    id: "general",
    label: "General",
    items: [
      {
        q: "What is Tagify?",
        a: "Tagify is a managed server-side tracking platform. We host sGTM containers and forward conversion events to Meta, Google, TikTok and Snapchat so your ads keep performing even when ad blockers and browsers strip client-side pixels.",
      },
      {
        q: "Do I need coding skills?",
        a: "No. The setup wizard configures everything in under 5 minutes. We support no-code installs for Shopify, WooCommerce, and custom sites via GTM.",
      },
      {
        q: "How is Tagify different from Stape?",
        a: "Tagify is built for emerging-market e-commerce: lower pricing, local payment options, Bangla-speaking support, and pre-built recipes for COD and delayed-purchase tracking.",
      },
    ],
  },
  {
    id: "setup",
    label: "Setup & Integration",
    items: [
      {
        q: "How long does setup take?",
        a: "Most stores are live in 5–10 minutes. Connect your domain, paste your GTM container config, and enable the platforms you want to send data to.",
      },
      {
        q: "Can I keep my existing GTM container?",
        a: "Yes. Tagify imports your existing server-side GTM container or provisions a new one. We never overwrite your client-side container.",
      },
      {
        q: "Do you support custom domains?",
        a: "Yes. Custom subdomain (e.g. data.yourstore.com) is included on Pro and above. Setup is a single CNAME record.",
      },
      {
        q: "Multiple domains per Gateway or container?",
        a: "Pro users can attach up to 3 verified custom domains per Gateway workspace or sGTM container. Use different domains for different brands, regions, or storefronts.",
      },
    ],
  },
  {
    id: "tracking",
    label: "Tracking & Events",
    items: [
      {
        q: "Which events does Tagify track?",
        a: "Standard e-commerce events (Page View, View Content, Add to Cart, Initiate Checkout, Purchase, Lead, Complete Registration) plus any custom events you define.",
      },
      {
        q: "Does it bypass iOS 14.5+ restrictions?",
        a: "It significantly improves attribution by sending data through your domain instead of the user's browser. Combined with Meta CAPI and proper deduplication, you typically recover 25–40% of lost conversions.",
      },
      {
        q: "How do you handle delayed COD purchases?",
        a: "Our Delayed Purchase recipe lets you fire the Purchase event when an order moves to confirmed/delivered status — not at checkout — so your ad platform learns from real revenue.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Billing",
    items: [
      {
        q: "Is there a free plan?",
        a: "Yes — 15,000 requests/month, core integrations, no credit card required.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Card, PayPal, and bank transfer for annual plans through Paddle.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel from the dashboard in one click. No questions asked.",
      },
      {
        q: "What if I exceed my monthly request limit?",
        a: "We notify you at 80% and 100%. Excess traffic is throttled rather than billed automatically — you stay in control of costs.",
      },
    ],
  },
  {
    id: "security",
    label: "Security & Privacy",
    items: [
      {
        q: "Where is data hosted?",
        a: "Tier-1 cloud infrastructure with edge locations across 3 continents. Choose your container region during setup.",
      },
      {
        q: "Is Tagify GDPR-compliant?",
        a: "Yes. We sign DPAs, support Consent Mode v2, and provide tools for honoring user opt-outs.",
      },
      {
        q: "Do you store the events you forward?",
        a: "Only short-lived diagnostic logs (up to 30 days) for debugging. Raw event payloads are not retained long-term.",
      },
    ],
  },
];

export function FaqView() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
              <HelpCircle className="h-3 w-3" /> FAQ
            </div>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-lg text-ink/65">
              Everything you need to know about server-side tracking with Tagify.
            </p>
            <div className="relative mt-7">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="w-full rounded-full border border-ink/15 bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-coral"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-14">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-ink/55">No results matched &quot;{query}&quot;.</p>
          ) : (
            <div className="space-y-10">
              {filtered.map((cat) => (
                <div key={cat.id} id={cat.id}>
                  <h2 className="font-mono text-xs uppercase tracking-widest text-coral">
                    {cat.label}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {cat.items.map((item, i) => (
                      <details
                        key={i}
                        className="group rounded-xl border border-ink/10 bg-background p-5"
                      >
                        <summary className="flex cursor-pointer items-center justify-between font-medium">
                          {item.q}
                          <span className="text-ink/40 transition group-open:rotate-45">+</span>
                        </summary>
                        <p className="mt-3 text-sm text-ink/65 leading-relaxed">{item.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-14 rounded-2xl border border-ink/10 bg-cream p-8 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-coral" />
            <h3 className="mt-3 font-display text-xl font-medium">Still have questions?</h3>
            <p className="mt-2 text-ink/65">Our team usually replies within an hour.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
              >
                Contact support <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/instructions"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:border-ink"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
