"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Server,
  Database,
  Plus,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Globe,
  BookOpen,
  Sparkles,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { getLimit } from "@/lib/plans";
import { useSession } from "@/lib/auth-client";

type ListResp<T> = T[] | { data?: T[]; items?: T[]; workspaces?: T[]; containers?: T[] };
function pickArr<T>(d: ListResp<T> | undefined): T[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return d.data ?? d.items ?? d.workspaces ?? d.containers ?? [];
}

interface Container {
  id: string;
  name?: string;
  status?: string;
  container_identifier?: string;
  server_location?: string;
  plan_tier?: string;
  requests_sent?: number;
  domains?: { domain: string; status: string }[];
}
interface Workspace {
  id: string;
  name: string;
  workspace_identifier?: string;
  pixel_key?: string;
  plan_tier?: string;
  requests_count?: number;
  status?: string;
  domains?: { domain: string; status: string }[];
}

const statusPill = (s?: string) => {
  switch (s) {
    case "running":
    case "active":
      return {
        dot: "bg-emerald-500",
        label: "Active",
        chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      };
    case "failed":
      return {
        dot: "bg-red-500",
        label: "Failed",
        chip: "bg-red-500/10 text-red-700 border-red-500/20",
      };
    case "disabled":
      return {
        dot: "bg-orange-500",
        label: "Paused",
        chip: "bg-orange-500/10 text-orange-700 border-orange-500/30",
      };
    default:
      return {
        dot: "bg-orange-500 animate-pulse",
        label: "Provisioning",
        chip: "bg-orange-500/10 text-orange-700 border-orange-500/30",
      };
  }
};

export default function Overview() {
  const user = useSession().data?.user;
  const { data: workspaces } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<ListResp<Workspace>>({ path: "/api/workspaces" }),
  });
  const { data: containers } = useQuery({
    queryKey: ["containers"],
    queryFn: () => api<ListResp<Container>>({ path: "/api/containers" }),
  });

  const gws = pickArr(workspaces) as Workspace[];
  const cts = pickArr(containers) as Container[];

  const totalRequests =
    gws.reduce((s, g) => s + (Number(g.requests_count) || 0), 0) +
    cts.reduce((s, c) => s + (Number(c.requests_sent) || 0), 0);

  const activeDomains =
    gws.reduce((s, g) => s + (g.domains?.filter((d) => d.status === "active").length ?? 0), 0) +
    cts.reduce((s, c) => s + (c.domains?.filter((d) => d.status === "active").length ?? 0), 0);

  const firstName =
    user?.name?.split(" ")[0] || (user?.email ?? "").split("@")[0]?.split(/[.\-_]/)[0] || "there";
  const greeting = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const empty = gws.length === 0 && cts.length === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink/10 bg-gradient-to-br from-background to-cream p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink/55">Welcome back</p>
            <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">
              Hi {greeting} 👋
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-ink/65">
              {empty
                ? "Let's get your first-party tracking live. Spin up a Tagify Gateway or sGTM container in under a minute."
                : "Here's a snapshot of your tracking infrastructure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/gateway"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
            >
              <Plus className="h-3.5 w-3.5" /> New Gateway
            </Link>
            <Link
              href="/dashboard/containers"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-4 py-2 text-sm font-medium hover:border-ink/30"
            >
              <Plus className="h-3.5 w-3.5" /> New sGTM
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Tagify Gateways"
          value={gws.length.toString()}
          hint={gws.length === 1 ? "workspace" : "workspaces"}
          Icon={Database}
          to="/dashboard/gateway"
        />
        <KpiCard
          label="sGTM Containers"
          value={cts.length.toString()}
          hint={cts.length === 1 ? "container" : "containers"}
          Icon={Server}
          to="/dashboard/containers"
        />
        <KpiCard
          label="Requests this cycle"
          value={totalRequests.toLocaleString()}
          hint="across all resources"
          Icon={Activity}
        />
        <KpiCard
          label="Custom domains"
          value={activeDomains.toString()}
          hint="verified & live"
          Icon={Globe}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResourceCard
          title="Recent sGTM containers"
          empty={cts.length === 0}
          emptyLabel="No containers yet"
          emptyCta={{ to: "/dashboard/containers", label: "Deploy container" }}
          viewAll={{ to: "/dashboard/containers", label: "View all" }}
          rows={cts.slice(0, 4).map((c) => {
            const cid = c.container_identifier ?? c.id;
            const tier = (c.plan_tier ?? "free").toLowerCase();
            const limit = getLimit(tier);
            const used = Number(c.requests_sent) || 0;
            const pct = Math.min(100, Math.round((used / limit) * 100));
            const st = statusPill(c.status ?? "");
            return {
              key: c.id,
              to: { to: "/dashboard/containers/$id" as const, params: { id: cid } },
              name: c.name || "Untitled container",
              sub: c.server_location || "—",
              status: st,
              tier,
              used,
              limit,
              pct,
            };
          })}
        />
        <ResourceCard
          title="Recent Tagify Gateways"
          empty={gws.length === 0}
          emptyLabel="No gateways yet"
          emptyCta={{ to: "/dashboard/gateway", label: "Create gateway" }}
          viewAll={{ to: "/dashboard/gateway", label: "View all" }}
          rows={gws.slice(0, 4).map((g) => {
            const wid = g.workspace_identifier ?? g.id;
            const tier = (g.plan_tier ?? "free").toLowerCase();
            const limit = getLimit(tier);
            const used = Number(g.requests_count) || 0;
            const pct = Math.min(100, Math.round((used / limit) * 100));
            const st = statusPill(g.status ?? "active");
            const firstDomain = g.domains?.find((d) => d.status === "active")?.domain;
            return {
              key: g.id,
              to: { to: "/dashboard/gateway/$id" as const, params: { id: wid } },
              name: g.name,
              sub: firstDomain || "Default tagify.top domain",
              status: st,
              tier,
              used,
              limit,
              pct,
            };
          })}
        />
      </div>

      {empty && (
        <div className="rounded-2xl border border-ink/10 bg-background p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-coral" />
            <h2 className="font-display text-lg font-medium">Quick start</h2>
          </div>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Create a Gateway",
                d: "Set up one pixel for Meta, GA4, TikTok, Snapchat & Google Ads.",
              },
              {
                n: "02",
                t: "Install on your site",
                d: "Drop the snippet on any platform — Shopify, WordPress, custom.",
              },
              {
                n: "03",
                t: "Watch events flow",
                d: "Live event stream + EMQ insights in real-time.",
              },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border border-ink/10 bg-cream/40 p-4">
                <span className="font-mono text-xs text-coral">{s.n}</span>
                <p className="mt-1 font-medium">{s.t}</p>
                <p className="mt-1 text-xs text-ink/60">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <HelpCard
          Icon={BookOpen}
          title="Docs & integration guides"
          desc="Shopify, WooCommerce, Salla, Klaviyo and more."
          cta="Read the docs"
          to="/instructions"
        />
        <HelpCard
          Icon={Zap}
          title="Need help connecting?"
          desc="Our team can wire your stack end-to-end. Free 30-min call."
          cta="Get expert help"
          to="/contact"
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  Icon,
  to,
}: {
  label: string;
  value: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
  to?: "/dashboard/gateway" | "/dashboard/containers";
}) {
  const inner = (
    <div
      className={`group rounded-xl border border-ink/10 bg-background p-4 ${to ? "transition hover:border-ink/30 hover:shadow-sm" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-ink/55">{label}</p>
        <Icon className="h-3.5 w-3.5 text-coral" />
      </div>
      <p className="mt-3 font-display text-2xl font-medium">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink/55">{hint}</p>
    </div>
  );
  return to ? (
    <Link href={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

type Row = {
  key: string;
  to: { to: "/dashboard/gateway/$id" | "/dashboard/containers/$id"; params: { id: string } };
  name: string;
  sub: string;
  status: { dot: string; label: string; chip: string };
  tier: string;
  used: number;
  limit: number;
  pct: number;
};

function ResourceCard({
  title,
  rows,
  empty,
  emptyLabel,
  emptyCta,
  viewAll,
}: {
  title: string;
  rows: Row[];
  empty: boolean;
  emptyLabel: string;
  emptyCta: { to: "/dashboard/gateway" | "/dashboard/containers"; label: string };
  viewAll: { to: "/dashboard/gateway" | "/dashboard/containers"; label: string };
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-ink/10 bg-background">
      <header className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
        <h2 className="font-display text-sm font-medium">{title}</h2>
        {!empty && (
          <Link
            href={viewAll.to}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink/60 hover:text-coral"
          >
            {viewAll.label} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </header>
      {empty ? (
        <div className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-ink/20" />
          <p className="mt-2 text-sm text-ink/60">{emptyLabel}</p>
          <Link
            href={emptyCta.to}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-background hover:bg-coral"
          >
            <Plus className="h-3 w-3" /> {emptyCta.label}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10">
          {rows.map((r) => (
            <li key={r.key}>
              <Link
                href={r.to.to.replace("$id", r.to.params.id)}
                className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-cream/40"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${r.status.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <span
                      className={`hidden rounded-full border px-1.5 text-[9px] font-medium sm:inline-flex ${r.status.chip}`}
                    >
                      {r.status.label}
                    </span>
                    <span className="rounded-full border border-ink/15 px-1.5 text-[9px] font-medium capitalize text-ink/60">
                      {r.tier}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-ink/55">{r.sub}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full bg-coral transition-all"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                    <p className="shrink-0 font-mono text-[10px] text-ink/55">
                      {r.used.toLocaleString()} / {r.limit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink/30 opacity-0 transition group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HelpCard({
  Icon,
  title,
  desc,
  cta,
  to,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  cta: string;
  to?: string;
}) {
  return (
    <Link
      href={to ?? "#"}
      className="flex items-start gap-3 rounded-xl border border-ink/10 bg-background p-4 transition hover:border-ink/30 hover:shadow-sm"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-coral-soft text-coral">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-ink/60">{desc}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline">
          {cta} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
