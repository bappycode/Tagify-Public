"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Info,
  XCircle,
  Lock,
  AlertCircle,
  BarChart3,
  Settings as SettingsIcon,
  CalendarIcon,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { errorMessage } from "@/lib/utils";
import {
  MetaLogo,
  GoogleAnalyticsLogo,
  GoogleAdsLogo,
  TikTokLogo,
  SnapchatLogo,
} from "@/components/logos";
import { api, apiUrl } from "@/lib/api";

const PLATFORM_META: Record<
  string,
  { name: string; Logo: (p: { size?: number }) => React.ReactElement }
> = {
  meta: { name: "Meta CAPI", Logo: MetaLogo },
  tiktok: { name: "TikTok Events", Logo: TikTokLogo },
  snapchat: { name: "Snapchat CAPI", Logo: SnapchatLogo },
  google_analytics: { name: "Google Analytics", Logo: GoogleAnalyticsLogo },
  google_ads: { name: "Google Ads", Logo: GoogleAdsLogo },
};

interface SummaryResp {
  enabled: boolean;
  total_events?: number;
  success_rate?: number;
  unique_events?: number;
  avg_emq?: number;
  total_revenue?: number;
  total_users?: number;
  active_users?: number;
  history_days?: number;
  vs_previous?: {
    total_events?: number | null;
    success_rate?: number | null;
    total_users?: number | null;
  };
}

const HISTORY_LABELS: Record<number, string> = {
  7: "7-day history",
  30: "30-day history",
  60: "60-day history",
  90: "90-day history",
  180: "180-day history",
  365: "1-year history",
  730: "2-year history",
};
const historyLabel = (d?: number) =>
  d ? (HISTORY_LABELS[d] ?? `${d}-day history`) : "7-day history";
interface TimeseriesPoint {
  bucket: string;
  success: number;
  error: number;
}
interface TimeseriesResp {
  enabled: boolean;
  granularity?: "hour" | "day";
  data?: TimeseriesPoint[];
}
interface ReceiverRow {
  platform: string;
  sent: number;
  delivered: number;
  failed: number;
  avg_emq: number;
  delivery_rate: number;
}
interface ReceiversResp {
  enabled: boolean;
  data?: ReceiverRow[];
}
interface EventRow {
  event_name: string;
  count: number;
}
interface EventsResp {
  enabled: boolean;
  data?: EventRow[];
}

interface GatewayMeta {
  plan_tier?: string;
  analytics_enabled?: boolean;
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`);
const fmtFull = (n: number) => Math.round(n).toLocaleString();

const DAY_MS = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * DAY_MS);
}
function startOfWeekMon(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(x, diff);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

interface Preset {
  key: string;
  label: string;
  minDays: number;
  build: () => { from: Date; to: Date };
}
const ALL_PRESETS: Preset[] = [
  {
    key: "today",
    label: "Today",
    minDays: 0,
    build: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    key: "yesterday",
    label: "Yesterday",
    minDays: 1,
    build: () => ({
      from: startOfDay(addDays(new Date(), -1)),
      to: endOfDay(addDays(new Date(), -1)),
    }),
  },
  {
    key: "last3",
    label: "Last 3 days",
    minDays: 2,
    build: () => ({ from: startOfDay(addDays(new Date(), -2)), to: endOfDay(new Date()) }),
  },
  {
    key: "last7",
    label: "Last 7 days",
    minDays: 6,
    build: () => ({ from: startOfDay(addDays(new Date(), -6)), to: endOfDay(new Date()) }),
  },
  {
    key: "last14",
    label: "Last 14 days",
    minDays: 13,
    build: () => ({ from: startOfDay(addDays(new Date(), -13)), to: endOfDay(new Date()) }),
  },
  {
    key: "last30",
    label: "Last 30 days",
    minDays: 29,
    build: () => ({ from: startOfDay(addDays(new Date(), -29)), to: endOfDay(new Date()) }),
  },
  {
    key: "thisWeek",
    label: "This week",
    minDays: 6,
    build: () => ({ from: startOfWeekMon(new Date()), to: endOfDay(new Date()) }),
  },
  {
    key: "lastWeek",
    label: "Last week",
    minDays: 13,
    build: () => {
      const s = addDays(startOfWeekMon(new Date()), -7);
      return { from: s, to: endOfDay(addDays(s, 6)) };
    },
  },
  {
    key: "thisMonth",
    label: "This month",
    minDays: 29,
    build: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }),
  },
  {
    key: "lastMonth",
    label: "Last month",
    minDays: 29,
    build: () => {
      const s = startOfMonth(addDays(startOfMonth(new Date()), -1));
      return { from: s, to: endOfMonth(s) };
    },
  },
];

function formatBucket(b: string, granularity: "hour" | "day") {
  const d = new Date(b);
  if (Number.isNaN(d.getTime())) return b;
  return granularity === "hour"
    ? d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function GatewayAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<GatewayMeta | null>(null);

  const [from, setFrom] = useState<Date>(() => startOfDay(addDays(new Date(), -6)));
  const [to, setTo] = useState<Date>(() => endOfDay(new Date()));

  const analytics = useQuery({
    queryKey: ["analytics", id, from.toISOString(), to.toISOString()],
    enabled: !!id,
    queryFn: async () => {
      const query = { from: from.toISOString(), to: to.toISOString() };
      const [summary, timeseries, receivers, events] = await Promise.all([
        api<SummaryResp>({ path: `/api/workspaces/${id}/analytics/summary`, query }),
        api<TimeseriesResp>({ path: `/api/workspaces/${id}/analytics/timeseries`, query }),
        api<ReceiversResp>({ path: `/api/workspaces/${id}/analytics/receivers`, query }),
        api<EventsResp>({ path: `/api/workspaces/${id}/analytics/events`, query }),
      ]);
      return summary.enabled === false
        ? { enabled: false as const }
        : {
            enabled: true as const,
            summary,
            timeseries,
            receivers: receivers.data ?? [],
            events: events.data ?? [],
          };
    },
  });
  const loading = analytics.isPending;
  const error = analytics.error ? errorMessage(analytics.error, "Failed to load analytics") : null;
  const enabled = analytics.data?.enabled ?? null;
  const loaded = analytics.data?.enabled ? analytics.data : null;
  const summary = loaded?.summary ?? null;
  const timeseries = loaded?.timeseries ?? null;
  const receivers = loaded?.receivers ?? [];
  const events = loaded?.events ?? [];
  const load = () => {
    analytics.refetch();
  };

  const tier = (meta?.plan_tier ?? "free").toLowerCase();
  const isFree = tier === "free";
  const tierDefaultDays = isFree ? 7 : 30;
  const planMaxDays = summary?.history_days ?? tierDefaultDays;
  const minDate = useMemo(() => startOfDay(addDays(new Date(), -(planMaxDays - 1))), [planMaxDays]);
  const maxDate = useMemo(() => endOfDay(new Date()), []);

  if (meta && from < minDate) setFrom(minDate);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const json = await api<
          { workspace?: Record<string, unknown>; data?: Record<string, unknown> } & Record<
            string,
            unknown
          >
        >({
          path: `/api/workspaces/${id}`,
        });
        const raw = (json.workspace ?? json.data ?? json) as Record<string, unknown>;
        if (cancelled) return;
        setMeta({
          plan_tier: String(raw?.plan_tier ?? "free").toLowerCase(),
          analytics_enabled: Boolean(raw?.analytics_enabled ?? false),
        });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const presets = useMemo(
    () => ALL_PRESETS.filter((p) => p.minDays <= planMaxDays - 1),
    [planMaxDays],
  );

  const applyPreset = (key: string) => {
    const p = ALL_PRESETS.find((x) => x.key === key);
    if (!p) return;
    const r = p.build();
    setFrom(r.from < minDate ? minDate : r.from);
    setTo(r.to > maxDate ? maxDate : r.to);
  };

  const exportCsv = async () => {
    if (!id) return;
    try {
      const url = apiUrl(`/api/workspaces/${id}/analytics/export`, {
        from: from.toISOString(),
        to: to.toISOString(),
      });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = `tagify-analytics-${id}-${format(from, "yyyyMMdd")}-${format(to, "yyyyMMdd")}.csv`;
      a.click();
      URL.revokeObjectURL(dl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  const seriesChartData = useMemo(() => {
    const granularity = timeseries?.granularity ?? "day";
    return (timeseries?.data ?? []).map((p) => ({
      label: formatBucket(p.bucket, granularity),
      success: p.success,
      failed: p.error,
    }));
  }, [timeseries]);

  const maxEvent = events[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/gateway/${id}`}
            className="grid h-9 w-9 place-items-center rounded-md border border-ink/10 bg-background hover:bg-cream"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-xs text-ink/60">
              Historical event volume, destinations & match quality.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/gateway/${id}/events`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-cream"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <Activity className="h-3.5 w-3.5" /> Live events
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={exportCsv}
            disabled={!enabled}
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              Quick range <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-1">
            <div className="flex flex-col">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  className="rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-cream"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DateField
          label="From"
          value={from}
          onChange={(d) => setFrom(startOfDay(d))}
          minDate={minDate}
          maxDate={to}
        />
        <span className="text-xs text-ink/50">→</span>
        <DateField
          label="To"
          value={to}
          onChange={(d) => setTo(endOfDay(d))}
          minDate={from}
          maxDate={maxDate}
        />

        <span className="ml-1 text-xs text-ink/60">
          {format(from, "MMM d")} – {format(to, "MMM d, yyyy")}
        </span>

        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-ink/55">
          {isFree && <Lock className="h-3 w-3" />}
          {historyLabel(summary?.history_days ?? (isFree ? 7 : undefined))}
          {isFree && (
            <>
              {" "}
              —{" "}
              <Link href="/pricing" className="underline hover:text-ink">
                Upgrade for more
              </Link>
            </>
          )}
        </span>
      </div>

      {enabled === false ? (
        <DisabledState gatewayId={id ?? ""} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi
              label="Total events"
              value={fmtFull(summary?.total_events ?? 0)}
              trend={summary?.vs_previous?.total_events ?? null}
            />
            <Kpi
              label="Total users"
              value={fmtFull(summary?.total_users ?? 0)}
              trend={summary?.vs_previous?.total_users ?? null}
            />
            <Kpi label="Active users" value={fmtFull(summary?.active_users ?? 0)} hint="last 24h" />
            <Kpi
              label="Success rate"
              value={`${(summary?.success_rate ?? 0).toFixed(1)}%`}
              trend={summary?.vs_previous?.success_rate ?? null}
              accent={
                (summary?.success_rate ?? 0) > 95
                  ? "good"
                  : (summary?.success_rate ?? 0) > 90
                    ? "warn"
                    : "bad"
              }
            />
            <Kpi label="Unique events" value={fmtFull(summary?.unique_events ?? 0)} />
            <Kpi
              label="Avg EMQ"
              value={(summary?.avg_emq ?? 0).toFixed(1)}
              accent={
                (summary?.avg_emq ?? 0) >= 8
                  ? "good"
                  : (summary?.avg_emq ?? 0) >= 6
                    ? "warn"
                    : "bad"
              }
              hint="Event Match Quality (0–10)"
            />
          </div>

          <div className="rounded-xl border border-ink/10 bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Events over time</h2>
                <p className="text-xs text-ink/60">Successful vs failed deliveries.</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink/70">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Success
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-rose-500" /> Failed
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              {seriesChartData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={seriesChartData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ok" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="bad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "rgba(0,0,0,0.55)" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "rgba(0,0,0,0.55)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={fmt}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.1)",
                        fontSize: 12,
                      }}
                      formatter={(v: number, name) => [
                        fmtFull(v),
                        String(name).replace(/^\w/, (c) => c.toUpperCase()),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="success"
                      stackId="1"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#ok)"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="1"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fill="url(#bad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-background p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Events by receiver</h2>
              <p className="text-xs text-ink/60">Where your gateway forwarded events.</p>
            </div>
            {receivers.length === 0 ? (
              <p className="text-sm text-ink/60">No destination data in this period.</p>
            ) : (
              <div className="space-y-3">
                {receivers.map((d) => {
                  const m = PLATFORM_META[d.platform] ?? {
                    name: d.platform,
                    Logo: () => <span className="h-4 w-4 rounded-full bg-ink/30" />,
                  };
                  return (
                    <div key={d.platform} className="rounded-lg border border-ink/10 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-md bg-cream">
                            <m.Logo size={18} />
                          </span>
                          <div>
                            <p className="text-sm font-medium leading-tight">{m.name}</p>
                            <p className="text-xs text-ink/55">
                              {d.delivery_rate.toFixed(1)}% delivery rate
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <Stat label="Sent" value={fmtFull(d.sent)} />
                          <Stat
                            label="Delivered"
                            value={fmtFull(d.delivered)}
                            className="text-emerald-700"
                          />
                          <Stat
                            label="Failed"
                            value={fmtFull(d.failed)}
                            className={d.failed > 0 ? "text-rose-700" : "text-ink/70"}
                          />
                          <Stat label="EMQ" value={d.avg_emq.toFixed(1)} />
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cream">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, d.delivery_rate)}%` }}
                        />
                      </div>
                      {d.failed > 0 && (
                        <div className="mt-1 flex items-center justify-end text-[11px] text-rose-700">
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> {fmtFull(d.failed)} failed
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-ink/10 bg-background p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Events by name</h2>
              <p className="text-xs text-ink/60">Most fired event types in this period.</p>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-ink/60">No events in this period.</p>
            ) : (
              <div className="space-y-2">
                {events.map((e) => {
                  const pct = (e.count / maxEvent) * 100;
                  return (
                    <div
                      key={e.event_name}
                      className="grid grid-cols-[140px_1fr_70px] items-center gap-3 text-xs md:grid-cols-[180px_1fr_90px]"
                    >
                      <span className="font-mono truncate text-ink/80">{e.event_name}</span>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
                        <div
                          className="h-full rounded-full bg-ink/80"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-right tabular-nums text-ink/70">
                        {fmtFull(e.count)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-ink/50">
            <Info className="h-3 w-3" />{" "}
            {historyLabel(summary?.history_days ?? (isFree ? 7 : undefined))}
            {isFree && " · Upgrade for more retention."}
          </p>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  trend,
  accent,
  hint,
}: {
  label: string;
  value: string;
  trend?: number | null;
  accent?: "good" | "warn" | "bad";
  hint?: string;
}) {
  const accentCls =
    accent === "good"
      ? "text-emerald-700"
      : accent === "warn"
        ? "text-amber-700"
        : accent === "bad"
          ? "text-rose-700"
          : "text-ink";
  return (
    <div className="rounded-xl border border-ink/10 bg-background p-4">
      <p className="text-xs text-ink/60">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold tracking-tight ${accentCls}`}>
        {value}
      </p>
      {typeof trend === "number" && (
        <p
          className={`mt-1 inline-flex items-center gap-1 text-[11px] ${trend >= 0 ? "text-emerald-700" : "text-rose-700"}`}
        >
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}% vs previous
        </p>
      )}
      {hint && <p className="mt-1 text-[11px] text-ink/50">{hint}</p>}
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`tabular-nums font-medium ${className}`}>{value}</p>
    </div>
  );
}

function DisabledState({ gatewayId }: { gatewayId: string }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/15 bg-background p-12 text-center">
      <BarChart3 className="mx-auto h-8 w-8 text-ink/30" />
      <p className="mt-3 text-sm font-medium">Analytics is disabled</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-ink/55">
        Enable it in your workspace settings to start recording event history.
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link href={`/dashboard/gateway/${gatewayId}`}>
          <SettingsIcon className="mr-1.5 h-3.5 w-3.5" /> Go to settings
        </Link>
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
      <AlertCircle className="mx-auto h-6 w-6 text-rose-600" />
      <p className="mt-2 text-sm font-medium text-rose-700">Failed to load.</p>
      <p className="mt-1 text-xs text-ink/55">{message}</p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-background p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-ink/10 bg-background p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-64 w-full" />
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full w-full place-items-center text-xs text-ink/50">
      No data in this period.
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  minDate: Date;
  maxDate: Date;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span className="text-ink/60">{label}:</span>
          <span>{format(value, "MMM d, yyyy")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          disabled={(d: Date) => d < startOfDay(minDate) || d > endOfDay(maxDate)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
