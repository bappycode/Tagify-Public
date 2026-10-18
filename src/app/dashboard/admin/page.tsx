"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Database, Server, Zap, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PLAN_LABELS, PLAN_LIMITS, PLAN_ORDER, type PlanTier } from "@/lib/plans";

type Target = "workspace" | "container";

interface PlanPatchBody {
  plan_tier: PlanTier;
  requests_count?: number;
  reset_billing?: boolean;
  reset_notifications?: boolean;
}

function pathFor(target: Target, identifier: string) {
  return target === "workspace"
    ? `/api/admin/workspaces/${encodeURIComponent(identifier)}/plan`
    : `/api/admin/containers/${encodeURIComponent(identifier)}/plan`;
}

export default function AdminTools() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-background">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Admin tools</h1>
          <p className="mt-1 text-sm text-ink/60">
            Change plan tier, override usage, reset billing or notifications for any workspace or
            container.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlanForm
          title="Tagify Gateway workspace"
          target="workspace"
          icon={<Database className="h-4 w-4" />}
          identifierLabel="Workspace identifier (ID or pixel_key)"
        />
        <PlanForm
          title="sGTM container"
          target="container"
          icon={<Server className="h-4 w-4" />}
          identifierLabel="Container identifier (ID or name)"
        />
      </div>
    </div>
  );
}

function PlanForm({
  title,
  target,
  icon,
  identifierLabel,
}: {
  title: string;
  target: Target;
  icon: React.ReactNode;
  identifierLabel: string;
}) {
  const [identifier, setIdentifier] = useState("");
  const [tier, setTier] = useState<PlanTier>("pro");
  const [overrideUsage, setOverrideUsage] = useState(false);
  const [requestsCount, setRequestsCount] = useState<string>("0");
  const [resetBilling, setResetBilling] = useState(true);
  const [resetNotifications, setResetNotifications] = useState(true);

  const submit = useMutation({
    mutationFn: async () => {
      const id = identifier.trim();
      if (!id) throw new Error("Enter an identifier");
      const body: PlanPatchBody = {
        plan_tier: tier,
        reset_billing: resetBilling,
        reset_notifications: resetNotifications,
      };
      if (overrideUsage) {
        const n = Number(requestsCount);
        if (!Number.isFinite(n) || n < 0) throw new Error("Invalid requests count");
        body.requests_count = Math.floor(n);
      }
      return api({ path: pathFor(target, id), method: "PATCH", body });
    },
    onSuccess: () => toast.success(`${title} updated`),
    onError: (e: Error) => toast.error(e.message),
  });

  const limit = PLAN_LIMITS[tier];

  function applyPreset(pct: number) {
    setOverrideUsage(true);
    setRequestsCount(String(Math.floor((limit * pct) / 100)));
  }

  return (
    <section className="rounded-xl border border-ink/10 bg-background p-6 space-y-5">
      <header className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-cream text-ink">{icon}</span>
        <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
      </header>

      <Field label={identifierLabel}>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="e.g. ws_abc123 or px_xxx"
          className={cls}
        />
      </Field>

      <Field label="Plan tier">
        <div className="flex flex-wrap gap-1.5">
          {PLAN_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                tier === t
                  ? "border-ink bg-ink text-background"
                  : "border-ink/15 bg-background text-ink/70 hover:border-ink/40"
              }`}
            >
              {PLAN_LABELS[t]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-ink/55">
          Quota: {limit.toLocaleString()} requests / month
        </p>
      </Field>

      <Field label="Usage override (optional)">
        <label className="flex items-center gap-2 text-xs text-ink/70">
          <input
            type="checkbox"
            checked={overrideUsage}
            onChange={(e) => setOverrideUsage(e.target.checked)}
          />
          Set <code className="rounded bg-cream px-1">requests_count</code> manually
        </label>
        {overrideUsage && (
          <>
            <input
              type="number"
              min={0}
              value={requestsCount}
              onChange={(e) => setRequestsCount(e.target.value)}
              className={`${cls} mt-2`}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <PresetBtn label="Reset (0)" onClick={() => applyPreset(0)} />
              <PresetBtn label="75%" onClick={() => applyPreset(75)} />
              <PresetBtn label="95%" onClick={() => applyPreset(95)} />
              <PresetBtn label="100%" onClick={() => applyPreset(100)} />
            </div>
          </>
        )}
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Toggle label="Reset billing cycle" checked={resetBilling} onChange={setResetBilling} />
        <Toggle
          label="Reset notifications"
          checked={resetNotifications}
          onChange={setResetNotifications}
        />
      </div>

      <button
        onClick={() => submit.mutate()}
        disabled={submit.isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-ink disabled:opacity-50"
      >
        <Wand2 className="h-3.5 w-3.5" /> {submit.isPending ? "Applying…" : "Apply changes"}
      </button>
    </section>
  );
}

const cls =
  "w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none focus:border-coral";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/55">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-ink/10 bg-cream/50 px-3 py-2 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-coral" : "bg-ink/20"}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

function PresetBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-background px-2.5 py-1 text-[11px] font-medium text-ink/70 hover:border-ink/40"
    >
      <Zap className="h-3 w-3" /> {label}
    </button>
  );
}
