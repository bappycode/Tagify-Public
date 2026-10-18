"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  Briefcase,
  Clock,
  Globe2,
  BookOpen,
  HelpCircle,
  CreditCard,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

const info = [
  { icon: Mail, title: "General", line: "hello@tagify.top", href: "mailto:hello@tagify.top" },
  { icon: Briefcase, title: "Sales", line: "sales@tagify.top", href: "mailto:sales@tagify.top" },
  { icon: Clock, title: "Support hours", line: "Mon–Fri, 9am–9pm UTC" },
  { icon: Globe2, title: "HQ region", line: "Distributed · 4 time zones" },
];

const help = [
  {
    icon: BookOpen,
    title: "Documentation",
    desc: "Setup guides + API reference",
    to: "/instructions" as const,
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    desc: "Quick answers to common questions",
    to: "/faq" as const,
  },
  {
    icon: CreditCard,
    title: "Pricing",
    desc: "Plans, limits, what's included",
    to: "/pricing" as const,
  },
  {
    icon: Users,
    title: "Affiliate Program",
    desc: "Earn recurring commission",
    to: "/affiliate-program" as const,
  },
];

export function ContactView() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 10) {
      toast.error("Please fill all required fields (message ≥ 10 chars).");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Message sent — we'll reply within one business day.");
    setForm({ name: "", email: "", company: "", message: "" });
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <span className="inline-block rounded-full border border-ink/15 bg-cream px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/60">
            Contact
          </span>
          <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 text-lg text-ink/65">
            Questions about setup, pricing, or whether Tagify fits your stack? Drop us a line — a
            real human replies.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-6 lg:grid-cols-5">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-ink/10 bg-background p-6 md:p-8 lg:col-span-3"
            >
              <h2 className="font-display text-2xl font-medium">Send us a message</h2>
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="Jane Doe"
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    placeholder="jane@brand.com"
                    required
                  />
                </div>
                <Field
                  label="Company"
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  placeholder="Your brand"
                  optional
                />
                <div>
                  <label className="text-xs font-medium text-ink/70">
                    Message <span className="text-coral">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us a bit about your store and what you're trying to track…"
                    maxLength={1000}
                    rows={5}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-coral"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background hover:bg-coral disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send message"} <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="space-y-3 lg:col-span-2">
              {info.map((c) => {
                const inner = (
                  <div className="flex items-start gap-3 rounded-xl border border-ink/10 bg-background p-4 transition hover:border-coral/40">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-coral-soft text-coral">
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-ink/60">{c.line}</div>
                    </div>
                  </div>
                );
                return c.href ? (
                  <a key={c.title} href={c.href}>
                    {inner}
                  </a>
                ) : (
                  <div key={c.title}>{inner}</div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-ink/10 bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <div className="text-center">
              <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                Looking for something specific?
              </h2>
              <p className="mt-2 text-ink/60">You might find a faster answer here.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {help.map((q) => (
                <Link
                  key={q.title}
                  href={q.to}
                  className="group rounded-2xl border border-ink/10 bg-background p-5 transition hover:border-coral/40"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-coral-soft text-coral">
                    <q.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 font-medium transition group-hover:text-coral">
                    {q.title}
                  </div>
                  <div className="mt-1 text-sm text-ink/60">{q.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink/70">
        {label} {required && <span className="text-coral">*</span>}
        {optional && <span className="ml-1 font-normal text-ink/45">(optional)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-coral"
      />
    </div>
  );
}
