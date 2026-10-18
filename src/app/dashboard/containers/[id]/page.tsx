"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  Globe,
  Trash2,
  Loader2,
  Info,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  Zap,
  ShieldOff,
  Lock,
  Settings as SettingsIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface DomainEntry {
  domain: string;
  status: string;
}
interface Container {
  id: string;
  name?: string | null;
  subdomain?: string | null;
  container_config?: string | null;
  gtm_container_id?: string | null;
  container_identifier?: string | null;
  loader_identifier?: string | null;
  api_key?: string | null;
  server_location?: string | null;
  container_url?: string | null;
  url?: string | null;
  custom_domain?: string | null;
  domains?: DomainEntry[] | null;
  status?: string | null;
  custom_loader_status?: string | null;
  web_gtm_id?: string | null;
  adblock_bypass?: boolean | null;
  requests_sent?: number | null;
  plan_tier?: string | null;
  billing_cycle_start?: string | null;
  auto_payment?: boolean | null;
  auto_upgrade?: boolean | null;
  plan_fallback?: boolean | null;
}

import { normalizeTier, getLimit } from "@/lib/plans";
import { PlanFallbackBanner } from "@/components/usage-overview";
import { SubscriptionCard } from "@/components/subscription-card";

const DOMAIN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 3,
  pro_plus: 5,
  business: 10,
  business_plus: 20,
  enterprise: 50,
  enterprise_plus: 100,
};

type VerifyResp = { verified?: boolean; success?: boolean; message?: string };

const safeText = (v: unknown, fb = "—") => (typeof v === "string" && v.trim() ? v : fb);
const addMonth = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + 1);
  return d;
};

const statusStyle = (s: string, deleting?: boolean) => {
  if (deleting)
    return {
      dot: "bg-red-500 animate-pulse",
      label: "Deleting…",
      chip: "bg-red-500/10 text-red-700 border-red-500/30",
    };
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

const copyTo = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
};

export default function ContainerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: containerRaw, refetch } = useQuery({
    queryKey: ["container", id],
    queryFn: async () => {
      const d = await api<Container & { container?: Container; data?: Container }>({
        path: `/api/containers/${id}`,
      });
      return d?.container ?? d?.data ?? d;
    },
    refetchInterval: (q) => {
      const c = q.state.data as Container | undefined;
      const s = c?.status ?? "";
      return s && s !== "running" && s !== "failed" && s !== "disabled" ? 5000 : false;
    },
  });
  const container = containerRaw;

  const [deleting, setDeleting] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [tab, setTab] = useState<"settings" | "powerups">("settings");
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);
  const [verifyAttempts, setVerifyAttempts] = useState<Record<string, number>>({});

  const domainsKey = (container?.domains ?? []).map((d) => `${d.domain}:${d.status}`).join("|");
  useEffect(() => {
    if (!container) return;
    const identifier = safeText(container.container_identifier, "");
    if (!identifier) return;
    const pending = (container.domains ?? [])
      .filter((d) => d.status !== "active")
      .map((d) => d.domain);
    if (!pending.length) return;
    let cancelled = false;
    const tick = async () => {
      for (const domain of pending) {
        if (cancelled) return;
        setVerifyAttempts((prev) => ({ ...prev, [domain]: (prev[domain] ?? 0) + 1 }));
        try {
          const data = await api<VerifyResp>({
            path: `/api/containers/verify-domain`,
            method: "POST",
            body: { container_identifier: identifier, custom_domain: domain },
          });
          if (data?.verified || data?.success) {
            await refetch();
            return;
          }
        } catch {}
      }
    };
    const interval = setInterval(() => {
      const exhausted = pending.every((d) => (verifyAttempts[d] ?? 0) >= 5);
      if (exhausted) {
        clearInterval(interval);
        return;
      }
      tick();
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container?.id, domainsKey]);

  if (!container) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
      </div>
    );
  }

  const containerName = safeText(container.name, "Untitled container");
  const serverLocation = safeText(container.server_location);
  const planTier = normalizeTier(container.plan_tier);
  const isPro = planTier !== "free";
  const planLimit = getLimit(planTier);
  const domainLimit = DOMAIN_LIMITS[planTier] ?? DOMAIN_LIMITS.free;

  const requestsSent = container.requests_sent ?? 0;
  const usagePct = planLimit > 0 ? Math.min(100, Math.round((requestsSent / planLimit) * 100)) : 0;
  const cycleRenew = addMonth(container.billing_cycle_start);
  const rawStatus = container.status ?? "";
  const isDisabled = rawStatus === "disabled";
  const st = statusStyle(rawStatus, deleting);
  const domains = container.domains ?? [];
  const activeDomains = domains.filter((d) => d.status === "active");
  const hasVerifiedDomain = activeDomains.length > 0;
  const subdomainHost = safeText(container.subdomain, "");
  const nativeUrl = safeText(
    container.url ?? container.container_url,
    subdomainHost !== "—" ? `https://${subdomainHost}.tagify.top` : "",
  );
  const nativeHost = nativeUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const activeTrackingUrls = hasVerifiedDomain
    ? activeDomains.map((d) => `https://${d.domain}`)
    : nativeUrl !== "—" && nativeUrl
      ? [nativeUrl]
      : [];
  const serverContainerUrl = activeTrackingUrls[0] ?? "";
  const domainLimitReached = domains.length >= domainLimit;
  const rawGtmId = safeText(container.web_gtm_id, "") || safeText(container.gtm_container_id, "");
  const autoGtmId = rawGtmId !== "—" && rawGtmId ? `GTM-${rawGtmId.replace(/^GTM-/i, "")}` : "";
  const decodeSgtmId = (cfg?: string | null): string => {
    if (!cfg) return "";
    const raw = cfg.trim();
    const candidates: string[] = [];

    try {
      let b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      if (typeof atob === "function") {
        candidates.push(atob(b64));
      }
    } catch {}
    candidates.push(raw);

    for (const candidate of candidates) {
      const normalized = candidate.trim().replace(/^\?/, "");
      if (!normalized) continue;
      const match = normalized.match(/(?:^|[?&])(?:id|ctid)=([^&\s]+)/i);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        return val.startsWith("GTM-") ? val : `GTM-${val.replace(/^GTM-/i, "")}`;
      }
    }
    return "";
  };
  const sgtmContainerId = decodeSgtmId(container.container_config);
  const taggingServerUrls = hasVerifiedDomain
    ? activeDomains.map((d) => `https://${d.domain}`)
    : [];
  const defaultServerUrl =
    nativeUrl ||
    (subdomainHost && subdomainHost !== "—" ? `https://${subdomainHost}.tagify.top` : "");
  const details: { label: string; value: string; configured: boolean; glow?: boolean }[] = [
    {
      label: "Container Config",
      value: safeText(container.container_config),
      configured: !!container.container_config,
    },
    {
      label: "sGTM Container ID",
      value: sgtmContainerId || "Not configured yet",
      configured: !!sgtmContainerId,
    },
    {
      label: "Web GTM Container ID",
      value: autoGtmId || "Not configured yet",
      configured: !!autoGtmId,
    },
    {
      label: "Container Identifier",
      value: safeText(container.container_identifier, id),
      configured: true,
    },
    {
      label: "Default Server URL",
      value: defaultServerUrl || "Not configured yet",
      configured: !!defaultServerUrl,
      glow: !!defaultServerUrl,
    },
    ...(taggingServerUrls.length > 0
      ? taggingServerUrls.map((u) => ({
          label: "Tagging Server URL",
          value: u,
          configured: true,
          glow: true,
        }))
      : [
          {
            label: "Tagging Server URL",
            value: "Not configured yet",
            configured: false,
            glow: false,
          },
        ]),
  ];

  const handleDelete = async () => {
    if (!confirm(`Delete ${containerName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api({ path: `/api/containers/${id}`, method: "DELETE" });
      toast.success("Container deleted");
      qc.invalidateQueries({ queryKey: ["containers"] });
      router.push("/dashboard/containers");
    } catch (err) {
      setDeleting(false);
      toast.error(errorMessage(err, "Failed to delete"));
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const res = await api<{ message?: string }>({
        path: `/api/containers/${id}/reactivate`,
        method: "POST",
      });
      toast.success(res?.message || "Reactivating — online in ~30s");
      setTimeout(() => {
        refetch();
        setReactivating(false);
      }, 35000);
    } catch (err) {
      toast.error(errorMessage(err, "Reactivate failed"));
      setReactivating(false);
    }
  };

  const handleAddDomain = async () => {
    const identifier = safeText(container.container_identifier, "");
    if (!customDomainInput.trim() || identifier === "—") return;
    setDomainLoading(true);
    try {
      const domain = customDomainInput
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");
      await api({
        path: `/api/containers/domain`,
        method: "POST",
        body: { container_identifier: identifier, custom_domain: domain },
      });
      setCustomDomainInput("");
      await refetch();
      toast.success("Custom domain added — point CNAME to app.tagify.top");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add domain"));
    }
    setDomainLoading(false);
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!confirm(`Remove ${domain}?`)) return;
    const identifier = safeText(container.container_identifier, "");
    setRemovingDomain(domain);
    try {
      await api({
        path: `/api/containers/remove-domain`,
        method: "POST",
        body: { container_identifier: identifier, custom_domain: domain },
      });
      await refetch();
      toast.success("Domain removed");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to remove"));
    }
    setRemovingDomain(null);
  };

  const handleManualVerify = async (domain: string) => {
    const identifier = safeText(container.container_identifier, "");
    setVerifyingDomain(domain);
    try {
      const data = await api<VerifyResp>({
        path: `/api/containers/verify-domain`,
        method: "POST",
        body: { container_identifier: identifier, custom_domain: domain },
      });
      if (data?.verified || data?.success) {
        await refetch();
        toast.success("Domain verified");
      } else toast.error(data?.message || "DNS not ready yet");
    } catch {
      toast.error("Failed to verify");
    }
    setVerifyingDomain(null);
  };

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/containers"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> All containers
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-medium tracking-tight truncate">
            {containerName}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            {nativeHost || "—"} · {serverLocation}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${st.chip}`}
        >
          <span className={`h-2 w-2 rounded-full ${st.dot}`} /> {st.label}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
          aria-label="Delete container"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {isDisabled && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-300/60 bg-orange-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-700">
              Paused after 3 days of inactivity.
            </p>
            <p className="mt-0.5 text-xs text-orange-700/80">
              Reactivate to resume forwarding events.
            </p>
          </div>
          <button
            onClick={handleReactivate}
            disabled={reactivating}
            className="inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {reactivating && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Reactivate
          </button>
        </div>
      )}

      {container.plan_fallback && <PlanFallbackBanner />}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-ink/10 bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-ink/55">Requests used</p>
            <span className="rounded-full border border-ink/15 px-2 py-0.5 text-[10px] capitalize">
              {planTier.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-medium">{requestsSent.toLocaleString()}</p>
          <p className="text-xs text-ink/55">
            of {planLimit.toLocaleString()} ({usagePct}%)
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream">
            <div
              className={`h-full transition-all ${usagePct >= 95 ? "bg-red-500" : usagePct >= 85 ? "bg-orange-500" : usagePct >= 75 ? "bg-yellow-500" : "bg-emerald-500"}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {cycleRenew && (
            <p className="mt-2 text-[10px] text-ink/50">
              Renews{" "}
              {cycleRenew.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-ink/10 bg-background p-4">
          <p className="text-[11px] uppercase tracking-wider text-ink/55">Plan</p>
          <p className="mt-2 font-display text-2xl font-medium capitalize">
            {planTier.replace("_", " ")}
          </p>
          {!isPro && (
            <p className="mt-1 text-[11px] text-ink/55">
              Upgrade to Pro for 500K requests & 3 domains.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-ink/10 bg-background p-4">
          <p className="text-[11px] uppercase tracking-wider text-ink/55">Server location</p>
          <p className="mt-2 font-display text-2xl font-medium">{serverLocation}</p>
        </div>
      </div>

      <SubscriptionCard
        identifier={safeText(container.container_identifier, String(id))}
        scope="containers"
        autoPayment={!!container.auto_payment}
        autoUpgrade={!!container.auto_upgrade}
        onChange={(next) => {
          qc.setQueryData(["container", id], (prev: Container | undefined) =>
            prev
              ? { ...prev, auto_payment: next.auto_payment, auto_upgrade: next.auto_upgrade }
              : prev,
          );
        }}
      />

      <div className="flex gap-1 border-b border-ink/10">
        {(["settings", "powerups"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2 text-sm font-medium transition ${tab === t ? "text-ink" : "text-ink/55 hover:text-ink"}`}
          >
            {t === "settings" ? "Settings" : "Power Ups"}
            {tab === t && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-coral" />
            )}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="space-y-4">
          <section className="rounded-xl border border-ink/10 bg-background">
            <header className="border-b border-ink/10 p-4">
              <h2 className="font-display text-base font-medium">Container details</h2>
            </header>
            <div className="divide-y divide-ink/10">
              {details.map((d, i) => (
                <div
                  key={`${d.label}-${i}`}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] uppercase tracking-wider text-ink/55">{d.label}</p>
                      {d.configured ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[9px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-2.5 w-2.5" />{" "}
                          {d.label === "Web GTM Container ID" ? "Set" : "Active"}
                        </span>
                      ) : (
                        <span className="rounded-full border border-ink/15 px-1.5 text-[9px] font-medium text-ink/55">
                          Pending
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 truncate font-mono text-xs ${d.glow ? "text-coral font-medium" : d.configured ? "text-ink" : "italic text-ink/45"}`}
                    >
                      {d.value}
                    </p>
                  </div>
                  {d.configured && (
                    <button
                      onClick={() => copyTo(d.value, d.label)}
                      className={`rounded-md p-2 hover:bg-cream ${d.glow ? "text-coral" : "text-ink/50 hover:text-ink"}`}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-ink/10 bg-background">
            <header className="flex items-center gap-2 border-b border-ink/10 p-4">
              <Globe className="h-4 w-4 text-ink/60" />
              <h2 className="font-display text-base font-medium">Custom Domains</h2>
            </header>
            <div className="space-y-3 p-4">
              {domains.map((d) => {
                const active = d.status === "active";
                const isVerifying = verifyingDomain === d.domain;
                const isRemoving = removingDomain === d.domain;
                const attempts = verifyAttempts[d.domain] ?? 0;
                const exhausted = attempts >= 5;

                if (active) {
                  return (
                    <div
                      key={d.domain}
                      className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2"
                    >
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                        <code className="truncate text-xs font-medium text-coral">{d.domain}</code>
                      </div>
                      <button
                        onClick={() => handleRemoveDomain(d.domain)}
                        disabled={isRemoving}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                }

                const parts = d.domain.split(".");
                const host = parts.length > 2 ? parts.slice(0, -2).join(".") : "@";
                const rootDomain = parts.slice(-2).join(".");

                return (
                  <div
                    key={d.domain}
                    className="overflow-hidden rounded-lg border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-yellow-500/15">
                          {exhausted ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-700" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-yellow-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="truncate text-sm font-semibold">{d.domain}</code>
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/15 px-1.5 py-0 text-[10px] font-medium text-yellow-700">
                              {exhausted ? "DNS not detected" : `Verifying… (${attempts}/5)`}
                            </span>
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink/55">
                            <Clock className="h-3 w-3" />
                            {exhausted
                              ? "Couldn't reach the CNAME. Check below and click Check DNS."
                              : "Auto-checking every 30s for ~2½ minutes. DNS can take up to 24h."}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {exhausted && (
                          <button
                            onClick={() => handleManualVerify(d.domain)}
                            disabled={isVerifying || isRemoving}
                            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-background hover:bg-coral disabled:opacity-50"
                          >
                            {isVerifying && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Check
                            DNS
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveDomain(d.domain)}
                          disabled={isRemoving}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                        <div>
                          <p className="text-sm font-semibold">
                            Add this CNAME record at your DNS provider
                          </p>
                          <p className="text-[11px] text-ink/55">
                            Cloudflare, GoDaddy, Namecheap, Route 53 — log in wherever you manage{" "}
                            <code className="rounded bg-cream px-1">{rootDomain}</code>.
                          </p>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-ink/10 bg-background">
                        <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-2 border-b border-ink/10 bg-cream/60 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-ink/55">
                          <div>Type</div>
                          <div className="justify-self-center">Name / Host</div>
                          <div>Value / Target</div>
                          <div className="w-7" />
                        </div>
                        <DnsRow
                          type="CNAME"
                          name={host}
                          nameFull={d.domain}
                          value="app.tagify.top"
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-start gap-2 rounded-md border border-ink/10 bg-cream/40 p-2.5">
                          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/55" />
                          <p className="text-[11px] leading-snug text-ink/65">
                            <span className="font-medium text-ink">Using Cloudflare?</span> Set
                            proxy to <b>DNS only</b> (grey cloud).
                          </p>
                        </div>
                        <div className="flex items-start gap-2 rounded-md border border-ink/10 bg-cream/40 p-2.5">
                          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/55" />
                          <p className="text-[11px] leading-snug text-ink/65">
                            <span className="font-medium text-ink">Root domain?</span> Many
                            registrars use <code>@</code>. Subdomains use the prefix only.
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink/55">
                        Verify propagation at{" "}
                        <a
                          href={`https://dnschecker.org/#CNAME/${d.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-coral hover:underline"
                        >
                          dnschecker.org
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                );
              })}

              {domainLimitReached ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-ink/15 p-3">
                  <p className="text-xs">
                    Domain limit reached ({domains.length}/{domainLimit})
                  </p>
                  {!isPro && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral-soft/40 px-2 py-0.5 text-[10px] text-coral">
                      <Sparkles className="h-3 w-3" /> Upgrade for 3 domains
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2 rounded-md border border-dashed border-ink/15 p-3">
                  <p className="text-[11px] text-ink/65">
                    Add a custom domain — point a <code className="text-ink">CNAME</code> to{" "}
                    <code className="text-coral">app.tagify.top</code>. Auto-verifies for ~2½
                    minutes.
                    <span className="ml-1">
                      ({domains.length}/{domainLimit} used)
                    </span>
                    {isPro && (
                      <span className="mt-1 block text-coral">
                        Pro: attach up to 3 verified domains — all route into this container.
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="s.example.com (avoid sgtm/gtm/analytics)"
                      className="flex-1 rounded-md border border-ink/15 bg-background px-3 py-1.5 text-xs outline-none focus:border-coral"
                    />
                    <button
                      onClick={handleAddDomain}
                      disabled={!customDomainInput.trim() || domainLoading}
                      className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-background hover:bg-coral disabled:opacity-50"
                    >
                      {domainLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "powerups" && (
        <div className="space-y-4">
          <CustomLoader
            containerId={container.id}
            containerIdentifier={safeText(container.container_identifier, id)}
            loaderIdentifier={container.loader_identifier ?? null}
            activeDomains={activeDomains.map((d) => d.domain)}
            webGtmId={container.web_gtm_id ?? container.gtm_container_id ?? null}
            adblockBypass={!!container.adblock_bypass}
            customLoaderStatus={container.custom_loader_status ?? null}
            serverContainerUrl={serverContainerUrl}
            onSaved={() => refetch()}
          />
          <AdBlockBypass
            containerId={container.id}
            isPro={isPro}
            customLoaderActive={(container.custom_loader_status ?? "").toLowerCase() === "active"}
            webGtmId={container.web_gtm_id ?? container.gtm_container_id ?? null}
            adblockBypass={!!container.adblock_bypass}
            onSaved={() => refetch()}
          />
        </div>
      )}

      <section className="rounded-xl border border-red-300/50 bg-background">
        <header className="border-b border-red-300/30 p-4">
          <h2 className="font-display text-base font-medium text-red-600">Danger zone</h2>
        </header>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium">Delete this container</p>
            <p className="text-xs text-ink/55">Once deleted, all data is permanently removed.</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete container"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DnsRow({
  type,
  name,
  nameFull,
  value,
}: {
  type: string;
  name: string;
  nameFull?: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-2 px-3 py-2.5">
      <span className="grid place-items-center rounded-md border border-ink/15 px-1 font-mono text-[10px]">
        {type}
      </span>
      <button
        onClick={() => copyTo(name, "Host")}
        className="group min-w-0 justify-self-center text-center"
      >
        <code className="block truncate font-mono text-xs group-hover:text-coral">{name}</code>
        {nameFull && name !== nameFull && (
          <span className="block truncate text-[10px] text-ink/55">({nameFull})</span>
        )}
      </button>

      <button onClick={() => copyTo(value, "Target")} className="group min-w-0 text-left">
        <code className="block truncate font-mono text-xs text-coral group-hover:underline">
          {value}
        </code>
      </button>
      <button
        onClick={() => copyTo(value, "Target")}
        className="rounded-md p-1.5 text-ink/50 hover:bg-cream hover:text-ink"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CustomLoader(props: {
  containerId: string;
  containerIdentifier: string;
  loaderIdentifier: string | null;
  activeDomains: string[];
  webGtmId: string | null;
  adblockBypass: boolean;
  customLoaderStatus: string | null;
  serverContainerUrl: string;
  onSaved: () => void;
}) {
  const {
    containerId,
    containerIdentifier,
    loaderIdentifier,
    activeDomains,
    webGtmId,
    adblockBypass,
    customLoaderStatus,
    serverContainerUrl,
    onSaved,
  } = props;
  const isActive = (customLoaderStatus ?? "").toLowerCase() === "active";
  const savedGtmId = useMemo(
    () => (webGtmId ? webGtmId.replace(/^GTM-/i, "").toUpperCase() : null),
    [webGtmId],
  );
  const hasVerified = activeDomains.length > 0;
  const locked = !hasVerified && !isActive;

  const [configuring, setConfiguring] = useState(false);
  const [gtmInput, setGtmInput] = useState(savedGtmId ?? "");
  const [domainInput, setDomainInput] = useState(activeDomains[0] ?? "");
  const [domainChoice, setSelectedDomain] = useState(activeDomains[0] ?? "");
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const selectedDomain = activeDomains.includes(domainChoice)
    ? domainChoice
    : (activeDomains[0] ?? "");

  const openConfigure = () => {
    setGtmInput(savedGtmId ?? "");
    setDomainInput(selectedDomain || activeDomains[0] || "");
    setConfiguring(true);
  };

  const handleSave = async () => {
    const gtmId = gtmInput.trim().toUpperCase().replace(/^GTM-/, "");
    if (!gtmId || !/^[A-Z0-9]+$/.test(gtmId)) {
      toast.error("Invalid GTM ID — e.g. KN8Z5BBJ");
      return;
    }
    if (!domainInput) {
      toast.error("Tracking domain required");
      return;
    }
    setSaving(true);
    try {
      await api({
        path: `/api/containers/${containerId}/powerups/custom_loader`,
        method: "POST",
        body: { web_gtm_id: gtmId, adblock_bypass: !!adblockBypass },
      });
      setConfiguring(false);
      setSelectedDomain(domainInput);
      onSaved();
      toast.success("Custom Loader configured");
    } catch (err) {
      toast.error(errorMessage(err, "Save failed"));
    }
    setSaving(false);
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await api({
        path: `/api/containers/${containerId}/powerups/custom_loader`,
        method: "DELETE",
      });
      onSaved();
      toast.success("Custom Loader deactivated");
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
    }
    setDeactivating(false);
  };

  const jsFile = loaderIdentifier ? `${loaderIdentifier}.min.js` : "loader.min.js";
  const tagDomain = selectedDomain || "your-domain.com";
  const fullGtm = savedGtmId ? `GTM-${savedGtmId}` : "";

  const encoded = useQuery({
    queryKey: ["encoded-id", loaderIdentifier, fullGtm],
    queryFn: () =>
      api<{ encodedId: string }>({
        path: `/api/containers/${loaderIdentifier}/encoded-id`,
        method: "POST",
        body: {},
      }),
    enabled: isActive && !!fullGtm && !!loaderIdentifier,
  });
  const encodedId = encoded.data?.encodedId ?? "";
  const encodingError = encoded.error
    ? errorMessage(encoded.error, "Failed to generate snippet")
    : "";

  const headSnippet = encodedId
    ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://${tagDomain}/${loaderIdentifier}.min.js?'+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','tgfy=${encodedId}');</script>`
    : "";
  const bodySnippet = fullGtm
    ? `<noscript><iframe src="https://${tagDomain}/ns.html?id=${fullGtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
    : "";

  return (
    <section className="rounded-xl border border-ink/10 bg-background">
      <header className="flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-coral-soft text-coral">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-medium">Custom Loader</h3>
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Configured
              </span>
            ) : (
              <span className="rounded-full border border-ink/15 px-1.5 py-0.5 text-[10px] text-ink/55">
                Not configured
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink/60">
            Stealth proxy loader that disguises GTM requests under your first-party domain.
          </p>
        </div>
        {!configuring && !locked && (
          <button
            onClick={openConfigure}
            className="inline-flex items-center gap-1 rounded-md border border-ink/15 px-3 py-1.5 text-xs font-medium hover:bg-cream"
          >
            <SettingsIcon className="h-3.5 w-3.5" /> {isActive ? "Edit" : "Configure"}
          </button>
        )}
        {!configuring && locked && (
          <span className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-2 py-0.5 text-[10px] text-ink/55">
            <Lock className="h-3 w-3" /> Locked
          </span>
        )}
      </header>

      {locked && (
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 rounded-md border border-dashed border-ink/15 bg-cream/40 p-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
            <p className="text-xs text-ink/65">
              Add and verify a custom domain first to unlock the Custom Loader.
            </p>
          </div>
        </div>
      )}

      {!locked && configuring && (
        <div className="space-y-3 px-4 pb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">Web GTM ID</label>
            <input
              value={gtmInput}
              onChange={(e) => setGtmInput(e.target.value.toUpperCase())}
              placeholder="e.g. KN8Z5BBJ or GTM-KN8Z5BBJ"
              className="w-full rounded-md border border-ink/15 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-coral"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">Tracking domain</label>
            <select
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full rounded-md border border-ink/15 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-coral"
            >
              {activeDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfiguring(false)}
              className="rounded-md px-3 py-1.5 text-xs text-ink/65 hover:bg-cream"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !gtmInput.trim() || !domainInput}
              className="inline-flex items-center gap-1 rounded-md bg-coral px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save & generate
            </button>
          </div>
        </div>
      )}

      {!locked && !configuring && isActive && (
        <div className="space-y-3 px-4 pb-4">
          {activeDomains.length > 1 && (
            <div className="flex items-start gap-2 rounded-md border border-coral/20 bg-coral-soft/30 p-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
              <p className="text-xs">
                You have {activeDomains.length} verified domains. Switch the dropdown to regenerate
                snippets for any of them.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">Tracking domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full rounded-md border border-ink/15 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-coral"
            >
              {activeDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-ink/60">
              Paste the Head snippet inside{" "}
              <code className="rounded bg-cream px-1">&lt;head&gt;</code> and Body snippet right
              after <code className="rounded bg-cream px-1">&lt;body&gt;</code>. Your GTM ID is
              encoded so it&apos;s not visible in your page source.
            </p>
            {encodingError && (
              <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {encodingError}
              </div>
            )}
            {!encodedId && !encodingError ? (
              <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-cream/40 px-3 py-2 text-xs text-ink/55">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating encoded snippet…
              </div>
            ) : (
              <>
                <Snippet label="Head snippet" code={headSnippet} />
                <Snippet label="Body snippet" code={bodySnippet} />
              </>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-ink/10 pt-2">
            <p className="text-[11px] text-ink/55">
              Serving <code className="rounded bg-cream px-1">{jsFile}</code> from{" "}
              <code className="rounded bg-cream px-1">{tagDomain}</code>
            </p>
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              {deactivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}{" "}
              Deactivate
            </button>
          </div>
          <FieldRow
            label="Server container URL"
            value={serverContainerUrl || `https://${tagDomain}`}
          />
          <FieldRow label="Container identifier" value={containerIdentifier} />
        </div>
      )}
    </section>
  );
}

function Snippet({ code, label }: { code: string; label: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-ink/10 bg-cream/50 p-3 font-mono text-[11px] text-ink">
        {code}
      </pre>
      <button
        onClick={() => copyTo(code, label)}
        className="absolute right-1.5 top-1.5 rounded-md p-1.5 text-ink/55 hover:bg-background hover:text-ink"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-ink/10 bg-cream/30 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-ink/55">{label}</p>
        <p className="truncate font-mono text-sm">{value}</p>
      </div>
      <button
        onClick={() => copyTo(value, label)}
        className="rounded-md p-1.5 text-ink/55 hover:bg-background hover:text-ink"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AdBlockBypass(props: {
  containerId: string;
  isPro: boolean;
  customLoaderActive: boolean;
  webGtmId: string | null;
  adblockBypass: boolean;
  onSaved: () => void;
}) {
  const { containerId, isPro, customLoaderActive, webGtmId, adblockBypass, onSaved } = props;
  const [saving, setSaving] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const checked = optimistic ?? adblockBypass;

  const locked = !isPro || !customLoaderActive;
  const reason = !customLoaderActive
    ? "Configure the Custom Loader first to enable Ad Block Bypass."
    : !isPro
      ? "Ad Block Bypass is available on the Pro plan."
      : "";

  const handleToggle = async (next: boolean) => {
    if (locked) return;
    setOptimistic(next);
    setSaving(true);
    try {
      await api({
        path: `/api/containers/${containerId}/powerups/custom_loader`,
        method: "POST",
        body: { web_gtm_id: webGtmId ?? "", adblock_bypass: next },
      });
      onSaved();
      toast.success(next ? "Ad Block Bypass enabled" : "Ad Block Bypass disabled");
    } catch (err) {
      setOptimistic(null);
      toast.error(errorMessage(err, "Update failed"));
    }
    setSaving(false);
  };

  return (
    <section className="rounded-xl border border-ink/10 bg-background">
      <header className="flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-coral-soft text-coral">
          <ShieldOff className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-medium">Ad Block Bypass</h3>
            {!isPro && (
              <span className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral-soft/40 px-1.5 py-0.5 text-[10px] font-medium text-coral">
                <Sparkles className="h-3 w-3" /> Pro
              </span>
            )}
            {checked && !locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Active
              </span>
            )}
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-1.5 py-0.5 text-[10px] text-ink/55">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink/60">
            Mask collection paths to bypass Brave, uBlock, and other privacy blockers.
          </p>
        </div>
        {!locked && (
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-ink/45" />}
            <button
              onClick={() => handleToggle(!checked)}
              disabled={saving}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? "bg-coral" : "bg-ink/15"}`}
              aria-pressed={checked}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
          </div>
        )}
      </header>
      {locked && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-ink/15 bg-cream/40 p-3">
            <p className="text-xs text-ink/65">{reason}</p>
            {!isPro && (
              <button className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-medium hover:bg-cream">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
