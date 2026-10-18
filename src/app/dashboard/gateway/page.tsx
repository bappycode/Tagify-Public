"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, Trash2, ChevronRight, Loader2, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { getLimit, getPlanLabel, usageColor, usagePercent, normalizeTier } from "@/lib/plans";

interface Workspace {
  id: string;
  workspace_identifier?: string;
  name: string;
  pixel_key?: string;
  custom_domain?: string | null;
  domains?: { domain: string; status: string }[] | null;
  destinations?: Record<string, { enabled?: boolean }>;
  receivers?: Record<string, { enabled?: boolean }>;
  plan_tier?: string;
  requests_count?: number;
  status?: string;
}

type CreateResp = Partial<Workspace> & {
  workspace?: Partial<Workspace>;
  data?: Partial<Workspace>;
};
type ListResp = Workspace[] | { data?: Workspace[]; workspaces?: Workspace[]; items?: Workspace[] };
function pickList(d: ListResp | undefined): Workspace[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return d.workspaces ?? d.data ?? d.items ?? [];
}

const statusStyle = (s?: string) => {
  switch (s) {
    case "active":
    case "running":
      return {
        dot: "bg-emerald-500",
        label: "Active",
        chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      };
    case "disabled":
      return {
        dot: "bg-orange-500",
        label: "Paused",
        chip: "bg-orange-500/10 text-orange-700 border-orange-500/30",
      };
    case "failed":
      return {
        dot: "bg-red-500",
        label: "Failed",
        chip: "bg-red-500/10 text-red-700 border-red-500/20",
      };
    default:
      return {
        dot: "bg-emerald-500",
        label: "Active",
        chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      };
  }
};

export default function GatewayList() {
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const { data } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<ListResp>({ path: "/api/workspaces" }),
  });
  const workspaces = pickList(data);

  const createWs = useMutation({
    mutationFn: (n: string) =>
      api<CreateResp>({ path: "/api/workspaces/create", method: "POST", body: { name: n } }),
    onSuccess: (res) => {
      const w = res?.workspace ?? res?.data ?? res;
      const wid = w?.workspace_identifier ?? w?.id;
      toast.success("Gateway created");
      setOpen(false);
      setName("");
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      if (wid) router.push(`/dashboard/gateway/${wid}`);
    },
    onError: (e: Error) => {
      const msg = e.message || "Failed to create gateway";
      if (/free.*limit|already have a free/i.test(msg)) {
        toast.error(msg, {
          action: { label: "Upgrade to Pro", onClick: () => router.push("/pricing") },
        });
      } else {
        toast.error(msg);
      }
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => api({ path: `/api/workspaces/${id}`, method: "DELETE" }),
    onSuccess: () => {
      toast.success("Gateway deleted");
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Tagify Gateway</h1>
          <p className="mt-1 text-sm text-ink/60">
            One pixel, every receiver — first-party event collection at scale.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
        >
          <Plus className="h-4 w-4" /> New gateway
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-ink/15 bg-background p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-coral-soft text-coral">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-medium">Create Gateway workspace</h3>
              <p className="text-xs text-ink/55">Spin up a fresh pixel + receivers in seconds.</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink/70">Workspace name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. shop.example.com"
              className="w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none focus:border-coral"
            />
            <p className="text-[11px] text-ink/55">
              Use your store name or domain — easy to recognize later.
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => createWs.mutate(name)}
              disabled={!name.trim() || createWs.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {createWs.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {workspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/15 bg-background p-12 text-center">
          <Database className="mx-auto h-10 w-10 text-ink/30" />
          <h3 className="mt-3 font-display font-medium">No gateways yet</h3>
          <p className="mt-1 text-sm text-ink/60">
            Create your first workspace and connect receivers in minutes.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
          >
            <Plus className="h-4 w-4" /> New gateway
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-background">
          <ul className="divide-y divide-ink/10">
            {workspaces.map((w) => {
              const wid = w.workspace_identifier ?? w.id;
              const st = statusStyle(w.status);

              const tier = normalizeTier(w.plan_tier);
              const limit = getLimit(tier);
              const used = Number(w.requests_count) || 0;
              const pct = usagePercent(used, limit);
              const uc = usageColor(pct);
              const activeDomains = (w.domains ?? [])
                .filter((d) => d.status === "active")
                .map((d) => d.domain);

              return (
                <li
                  key={w.id}
                  className="group cursor-pointer px-5 py-4 transition hover:bg-cream/40"
                  onClick={() => router.push(`/dashboard/gateway/${wid}`)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {w.name || "Untitled gateway"}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${st.chip}`}
                        >
                          {st.label}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${uc.chip}`}
                        >
                          {getPlanLabel(tier)}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink/55">
                        {w.pixel_key && (
                          <span className="rounded-full border border-ink/15 bg-cream px-2 py-0.5 font-mono text-ink/65 break-all">
                            {w.pixel_key}
                          </span>
                        )}
                        {activeDomains.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral-soft/40 px-2 py-0.5 font-mono text-coral"
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-coral" />
                            </span>
                            {d}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-1 max-w-[200px] flex-1 overflow-hidden rounded-full bg-cream">
                          <div
                            className={`h-full ${uc.bar} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className={`shrink-0 font-mono text-[10px] ${uc.text}`}>
                          {used.toLocaleString()} / {limit.toLocaleString()} ({pct}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {w.pixel_key && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(w.pixel_key!);
                            toast.success("Pixel key copied");
                          }}
                          className="rounded-md p-2 text-ink/40 hover:bg-cream hover:text-ink"
                          aria-label="Copy pixel key"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${w.name}?`)) del.mutate(w.id);
                        }}
                        disabled={del.isPending}
                        className="rounded-md p-2 text-ink/40 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        {del.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      <ChevronRight className="h-4 w-4 text-ink/30 opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
