"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Activity,
  Pause,
  Play,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MetaLogo,
  GoogleAnalyticsLogo,
  GoogleAdsLogo,
  TikTokLogo,
  SnapchatLogo,
} from "@/components/logos";
import { api } from "@/lib/api";

type PlatformKey = "meta" | "tiktok" | "snapchat" | "google_analytics" | "google_ads";
type PlatformStatus = "success" | "error";
type EventStatus = "success" | "partial" | "failed";

interface PlatformResult {
  name: PlatformKey | string;
  status: PlatformStatus;
}
interface LiveEvent {
  event_id: string;
  event_name: string;
  event_source_url?: string;
  page_title?: string;
  received_at: number;
  revenue?: number;
  emq: number;
  active_users?: number;
  platforms: PlatformResult[];
  payload: Record<string, unknown>;
}

const PLATFORM_META: Record<
  string,
  { name: string; Logo: (p: { size?: number }) => React.ReactElement }
> = {
  meta: { name: "Meta", Logo: MetaLogo },
  tiktok: { name: "TikTok", Logo: TikTokLogo },
  snapchat: { name: "Snapchat", Logo: SnapchatLogo },
  google_analytics: { name: "GA4", Logo: GoogleAnalyticsLogo },
  google_ads: { name: "Google Ads", Logo: GoogleAdsLogo },
};

const fmtTime = (ts: number) => {
  const d = new Date(ts);
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.max(0, Math.floor(diff))}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return d.toLocaleTimeString();
};

const computeStatus = (platforms: PlatformResult[]): EventStatus => {
  if (platforms.length === 0) return "success";
  const fails = platforms.filter((p) => p.status === "error").length;
  if (fails === 0) return "success";
  if (fails === platforms.length) return "failed";
  return "partial";
};

const statusDot = (s: EventStatus) =>
  s === "success" ? "bg-emerald-500" : s === "partial" ? "bg-amber-500" : "bg-red-500";

const emqColor = (n: number) =>
  n >= 8
    ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    : n >= 5
      ? "text-amber-700 bg-amber-500/10 border-amber-500/20"
      : "text-red-700 bg-red-500/10 border-red-500/20";

export default function GatewayEventsPage() {
  const { id } = useParams<{ id: string }>();
  const [pixelKey, setPixelKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [buffer, setBuffer] = useState<LiveEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState<LiveEvent[]>([]);
  const [filterName, setFilterName] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "failed">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LiveEvent | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const json = await api<{
          workspace?: { pixel_key?: string };
          data?: { pixel_key?: string };
          pixel_key?: string;
        }>({
          path: `/api/workspaces/${id}`,
        });
        const key = json?.workspace?.pixel_key ?? json?.data?.pixel_key ?? json?.pixel_key ?? null;
        if (!cancelled) setPixelKey(key);
      } catch {
        if (!cancelled) toast.error("Failed to load gateway");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!pixelKey) return;
    const source = new EventSource(`/api/workspaces/${id}/live`);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as Partial<LiveEvent> & {
          type?: string;
          active_users?: number;
        };
        if (data && data.type === "heartbeat") {
          if (typeof data.active_users === "number") setActiveUsers(data.active_users);
          return;
        }
        if (!data || !data.event_id) return;
        if (typeof data.active_users === "number") setActiveUsers(data.active_users);
        const normalized: LiveEvent = {
          ...(data as LiveEvent),
          received_at: data.received_at ?? Date.now(),
          emq: typeof data.emq === "number" ? data.emq : 0,
          platforms: Array.isArray(data.platforms) ? data.platforms : [],
        };
        setBuffer((prev) => [normalized, ...prev].slice(0, 500));
        if (!pausedRef.current) {
          setVisible((prev) => [normalized, ...prev].slice(0, 200));
        }
      } catch {}
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [id, pixelKey]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visible.filter((e) => {
      if (filterName !== "all" && e.event_name !== filterName) return false;
      if (filterStatus !== "all") {
        const st = computeStatus(e.platforms);
        if (filterStatus === "success" && st !== "success") return false;
        if (filterStatus === "failed" && st === "success") return false;
      }
      if (q) {
        const hay = `${e.event_name} ${e.event_id} ${e.event_source_url ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [visible, filterName, filterStatus, search]);

  const stats = useMemo(() => {
    const fiveAgo = now - 5 * 60 * 1000;
    const recent = buffer.filter((e) => e.received_at >= fiveAgo);
    let okPlatforms = 0,
      totalPlatforms = 0,
      emqSum = 0;
    const nameCounts: Record<string, number> = {};
    for (const e of recent) {
      nameCounts[e.event_name] = (nameCounts[e.event_name] || 0) + 1;
      emqSum += e.emq || 0;
      for (const p of e.platforms) {
        totalPlatforms++;
        if (p.status === "success") okPlatforms++;
      }
    }
    const topName = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      total: recent.length,
      successRate: totalPlatforms ? Math.round((okPlatforms / totalPlatforms) * 100) : 100,
      topName: topName || "—",
      avgEmq: recent.length ? (emqSum / recent.length).toFixed(1) : "0.0",
    };
  }, [buffer, now]);

  const eventNames = useMemo(() => {
    const set = new Set<string>();
    buffer.forEach((e) => set.add(e.event_name));
    return Array.from(set).sort();
  }, [buffer]);

  const togglePause = () => {
    setPaused((p) => {
      const next = !p;
      if (!next) setVisible(buffer.slice(0, 200));
      return next;
    });
  };

  const clearFeed = () => {
    setBuffer([]);
    setVisible([]);
  };

  const sendTest = async () => {
    if (!id) return;
    try {
      await api({ path: `/api/workspaces/${id}/test-event`, method: "POST" });
      toast.success("Test event sent");
    } catch {
      toast.message("Send a real event from your website to test");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/dashboard/gateway/${id}`}
          className="-ml-1 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-coral"
        >
          <ArrowLeft className="h-4 w-4" /> Back to gateway
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight">Live events</h1>
            <p className="mt-1 text-sm text-ink/60">
              Real-time stream of events arriving at this gateway and forwarded to your
              destinations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-ink/15 bg-cream text-ink/55"}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-emerald-500" : "bg-ink/40"}`}
              />
              {connected ? "Live" : "Offline"}
            </span>
            <Button size="sm" variant="outline" onClick={sendTest}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> Send test
            </Button>
            <Button size="sm" variant={paused ? "default" : "outline"} onClick={togglePause}>
              {paused ? (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5" /> Resume
                </>
              ) : (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Events" value={stats.total.toString()} hint="last 5 min" />
        <Kpi label="Active users" value={activeUsers.toString()} hint="last 5 min" />
        <Kpi
          label="Success rate"
          value={`${stats.successRate}%`}
          hint="last 5 min"
          accent={stats.successRate >= 95 ? "emerald" : stats.successRate >= 80 ? "amber" : "red"}
        />
        <Kpi label="Top event" value={stats.topName} mono hint="last 5 min" />
        <Kpi label="Avg EMQ" value={stats.avgEmq} hint="match quality" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-background p-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event id, name, URL…"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <select
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="h-8 rounded-md border border-ink/15 bg-background px-2 text-xs font-mono"
        >
          <option value="all">All events</option>
          {eventNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "success" | "failed")}
          className="h-8 rounded-md border border-ink/15 bg-background px-2 text-xs"
        >
          <option value="all">Any status</option>
          <option value="success">Success only</option>
          <option value="failed">Failed only</option>
        </select>
        {(search || filterName !== "all" || filterStatus !== "all") && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              setSearch("");
              setFilterName("all");
              setFilterStatus("all");
            }}
          >
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-8" onClick={clearFeed}>
          <Trash2 className="mr-1 h-3 w-3" /> Clear feed
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          onTest={sendTest}
          hasFilter={!!search || filterName !== "all" || filterStatus !== "all"}
          connected={connected}
        />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-ink/10 bg-background">
          {filtered.map((e) => {
            const status = computeStatus(e.platforms);
            return (
              <li key={e.event_id}>
                <button
                  onClick={() => setSelected(e)}
                  className="flex w-full items-center gap-3 border-b border-ink/5 px-3 py-3 text-left transition last:border-0 hover:bg-cream/50"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot(status)}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-xs font-medium">{e.event_name}</code>
                      <span
                        className={`rounded-full border px-1.5 py-px text-[10px] font-medium ${emqColor(e.emq)}`}
                      >
                        EMQ {e.emq}
                      </span>
                      {typeof e.revenue === "number" && (
                        <span className="text-[10px] font-medium text-ink/55">
                          ${e.revenue.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {e.platforms.map((p, idx) => {
                        const M = PLATFORM_META[p.name as string] ?? {
                          name: String(p.name),
                          Logo: () => <span className="h-2.5 w-2.5 rounded-full bg-ink/30" />,
                        };
                        const ok = p.status === "success";
                        return (
                          <span
                            key={`${p.name}-${idx}`}
                            title={`${M.name}: ${ok ? "delivered" : "failed"}`}
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${ok ? "bg-cream text-ink/70" : "bg-red-500/10 text-red-700"}`}
                          >
                            <M.Logo size={10} />
                            {ok ? (
                              <CheckCircle2 className="h-2.5 w-2.5" />
                            ) : (
                              <XCircle className="h-2.5 w-2.5" />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-[10px] tabular-nums text-ink/50">
                    <time>{fmtTime(e.received_at)}</time>
                    <ChevronRight className="h-3.5 w-3.5 text-ink/30" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && <EventDrawer event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  mono,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  mono?: boolean;
  accent?: "emerald" | "amber" | "red";
}) {
  const accentCls =
    accent === "emerald"
      ? "text-emerald-600"
      : accent === "amber"
        ? "text-amber-600"
        : accent === "red"
          ? "text-red-600"
          : "";
  return (
    <div className="rounded-xl border border-ink/10 bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-ink/55">{label}</p>
      <p
        className={`mt-1.5 font-display text-xl font-medium ${mono ? "font-mono text-sm" : ""} ${accentCls}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-ink/50">{hint}</p>
    </div>
  );
}

function EmptyState({
  onTest,
  hasFilter,
  connected,
}: {
  onTest: () => void;
  hasFilter: boolean;
  connected: boolean;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink/15 bg-background p-10 text-center">
      <Activity className="mx-auto h-7 w-7 text-ink/30" />
      <p className="mt-3 text-sm font-medium">
        {hasFilter
          ? "No events match your filters"
          : connected
            ? "Waiting for events"
            : "Reconnecting..."}
      </p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-ink/55">
        {hasFilter
          ? "Try clearing filters or wait for new events to arrive."
          : "Once your pixel fires, events appear here in real-time. Send a test event to try it out."}
      </p>
      {!hasFilter && (
        <Button size="sm" className="mt-4" onClick={onTest}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Send test event
        </Button>
      )}
    </div>
  );
}

function EventDrawer({ event, onClose }: { event: LiveEvent; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status = computeStatus(event.platforms);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink/40" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col overflow-hidden bg-background shadow-xl">
        <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusDot(status)}`} />
              <code className="truncate font-mono text-sm font-medium">{event.event_name}</code>
              <span
                className={`rounded-full border px-1.5 py-px text-[10px] font-medium ${emqColor(event.emq)}`}
              >
                EMQ {event.emq}
              </span>
            </div>
            <p className="mt-0.5 truncate font-mono text-[10px] text-ink/50">{event.event_id}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 space-y-5 overflow-auto p-4">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/55">
              Destinations
            </h3>
            <ul className="space-y-1.5">
              {event.platforms.map((p, idx) => {
                const M = PLATFORM_META[p.name as string] ?? {
                  name: String(p.name),
                  Logo: () => <span className="h-4 w-4 rounded-full bg-ink/30" />,
                };
                const ok = p.status === "success";
                return (
                  <li
                    key={`${p.name}-${idx}`}
                    className="flex items-center gap-2.5 rounded-md border border-ink/10 p-2.5"
                  >
                    <M.Logo size={16} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">{M.name}</p>
                    </div>
                    {ok ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700"
                      >
                        Sent
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-500/30 bg-red-500/10 text-[10px] text-red-700"
                      >
                        Failed
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-1.5 text-xs">
            {event.event_source_url && (
              <Row label="Source URL" value={event.event_source_url} mono />
            )}
            <Row label="Received" value={new Date(event.received_at).toLocaleString()} />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/55">
              Payload
            </h3>
            <pre className="max-h-80 overflow-auto rounded-lg bg-cream p-3 text-[11px] font-mono">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink/5 py-1.5 last:border-0">
      <span className="shrink-0 text-ink/55">{label}</span>
      <span className={`min-w-0 break-all text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
