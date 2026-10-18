"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Box, Trash2, Globe, ChevronRight, Loader2, Server } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface DomainEntry {
  domain: string;
  status: string;
}
interface Container {
  id: string;
  name?: string | null;
  status?: string | null;
  container_identifier?: string | null;
  container_url?: string | null;
  url?: string | null;
  subdomain?: string | null;
  server_location?: string | null;
  custom_domain?: string | null;
  domains?: DomainEntry[] | null;
  plan_tier?: string | null;
  requests_sent?: number | null;
}

const REGIONS = ["BD - BDIX", "US East", "US West", "EU West", "Asia Pacific"];

type CreateResp = Partial<Container> & {
  container?: Partial<Container>;
  data?: Partial<Container>;
};
type ListResp = Container[] | { data?: Container[]; containers?: Container[]; items?: Container[] };
function pickList(d: ListResp | undefined): Container[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return d.containers ?? d.data ?? d.items ?? [];
}

const safeText = (v: unknown, fb = "—") => (typeof v === "string" && v.trim() ? v : fb);

const statusStyle = (s?: string | null) => {
  switch (s) {
    case "running":
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
    case "stopped":
      return { dot: "bg-ink/30", label: "Stopped", chip: "bg-cream text-ink/60 border-ink/10" };
    default:
      return {
        dot: "bg-orange-500 animate-pulse",
        label: "Provisioning",
        chip: "bg-orange-500/10 text-orange-700 border-orange-500/30",
      };
  }
};

const generateSubdomain = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

const getDisplayUrls = (c: Container): string[] => {
  const actives = (c.domains ?? []).filter((d) => d.status === "active").map((d) => d.domain);
  if (actives.length) return actives;
  const fromUrl = safeText(c.url ?? c.container_url, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  if (fromUrl !== "—" && fromUrl) return [fromUrl];
  const sub = safeText(c.subdomain, "");
  if (sub !== "—") return [`${sub}.tagify.top`];
  return ["—"];
};

export default function ContainerList() {
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [configString, setConfigString] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);

  const { data } = useQuery({
    queryKey: ["containers"],
    queryFn: () => api<ListResp>({ path: "/api/containers" }),
    refetchInterval: (q) => {
      const list = pickList(q.state.data as ListResp | undefined);
      return list.some(
        (c) => c.status !== "running" && c.status !== "failed" && c.status !== "disabled",
      )
        ? 5000
        : false;
    },
  });
  const containers = pickList(data);

  const create = useMutation({
    mutationFn: () =>
      api<CreateResp>({
        path: "/api/containers/deploy",
        method: "POST",
        body: {
          name: name.trim(),
          configString: configString.trim(),
          subdomain: generateSubdomain(),
          server_location: region,
        },
      }),
    onSuccess: (res) => {
      const c = res?.container ?? res?.data ?? res;
      const id = c?.container_identifier ?? c?.id;
      toast.success("Container deploying");
      setOpen(false);
      setName("");
      setConfigString("");
      qc.invalidateQueries({ queryKey: ["containers"] });
      if (id) router.push(`/dashboard/containers/${id}`);
    },
    onError: (e: Error) => {
      const msg = e.message || "Failed to deploy container";
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
    mutationFn: (id: string) => api({ path: `/api/containers/${id}`, method: "DELETE" }),
    onSuccess: () => {
      toast.success("Container deleted");
      qc.invalidateQueries({ queryKey: ["containers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">sGTM Containers</h1>
          <p className="mt-1 text-sm text-ink/60">
            Managed server-side Google Tag Manager hosting.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
        >
          <Plus className="h-4 w-4" /> Deploy container
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-ink/15 bg-background p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-coral-soft text-coral">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-medium">Deploy new sGTM container</h3>
              <p className="text-xs text-ink/55">
                A fresh server-side GTM instance, ready in ~30 seconds.
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink/70">Container name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Website"
              className="w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none focus:border-coral"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink/70">sGTM Container Config Key</label>
            <input
              value={configString}
              onChange={(e) => setConfigString(e.target.value)}
              placeholder="aWQ9R1RNLU41OFFXOEdIJmVudj0xJmF1dGg9..."
              className="w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm font-mono outline-none focus:border-coral"
            />
            <p className="text-[11px] text-ink/55">
              GTM → Server Container → Container Settings → Container Config.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink/70">Server region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none focus:border-coral"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => create.mutate()}
              disabled={!name || !configString || create.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {create.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Deploy
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

      {containers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/15 bg-background p-12 text-center">
          <Box className="mx-auto h-10 w-10 text-ink/30" />
          <h3 className="mt-3 font-display font-medium">No containers yet</h3>
          <p className="mt-1 text-sm text-ink/60">
            Deploy your first sGTM container to get started.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
          >
            <Plus className="h-4 w-4" /> Deploy container
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-background">
          <ul className="divide-y divide-ink/10">
            {containers.map((c) => {
              const cid = c.container_identifier ?? c.id;
              const st = statusStyle(c.status);
              const urls = getDisplayUrls(c);
              const activeDomains = (c.domains ?? []).filter((d) => d.status === "active").length;
              return (
                <li
                  key={c.id}
                  className="group flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition hover:bg-cream/40"
                  onClick={() => router.push(`/dashboard/containers/${cid}`)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {safeText(c.name, "Untitled container")}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${st.chip}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink/55">
                        {urls.map((url) => (
                          <span
                            key={url}
                            className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral-soft/40 px-2 py-0.5 font-mono text-coral"
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-coral" />
                            </span>
                            {url}
                          </span>
                        ))}
                        <span>{safeText(c.server_location)}</span>
                        {activeDomains > 0 && (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Globe className="h-3 w-3" /> {activeDomains}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${c.name ?? "container"}?`)) del.mutate(c.id);
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
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
