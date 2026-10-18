"use client";

import { useState } from "react";
import { CreditCard, Zap, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Scope = "workspaces" | "containers";

interface Props {
  identifier: string;
  scope: Scope;
  autoPayment: boolean;
  autoUpgrade: boolean;
  onChange: (next: { auto_payment: boolean; auto_upgrade: boolean }) => void;
}

export function SubscriptionCard({ identifier, scope, autoPayment, autoUpgrade, onChange }: Props) {
  const [saving, setSaving] = useState<"payment" | "upgrade" | null>(null);

  const patch = async (field: "auto_payment" | "auto_upgrade", value: boolean) => {
    const next = { auto_payment: autoPayment, auto_upgrade: autoUpgrade, [field]: value };
    if (field === "auto_payment" && !value) next.auto_upgrade = false;

    setSaving(field === "auto_payment" ? "payment" : "upgrade");
    const prev = { auto_payment: autoPayment, auto_upgrade: autoUpgrade };
    onChange(next);
    try {
      await api({
        path: `/api/${scope}/${identifier}/subscription`,
        method: "PATCH",
        body: { auto_upgrade: next.auto_upgrade, auto_payment: next.auto_payment },
      });
      toast.success("Subscription updated");
    } catch (e) {
      onChange(prev);
      toast.error(`Failed to update: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="rounded-xl border border-ink/10 bg-background">
      <header className="flex items-center gap-2 border-b border-ink/10 p-4">
        <CreditCard className="h-4 w-4 text-ink/60" />
        <h2 className="font-display text-base font-medium">Subscription</h2>
      </header>
      <div className="divide-y divide-ink/10">
        <Row
          icon={<CreditCard className="h-4 w-4 text-ink/55" />}
          title="Auto Payment"
          desc="Automatically charge your saved payment method on billing cycle renewal."
          checked={autoPayment}
          loading={saving === "payment"}
          onChange={(v) => patch("auto_payment", v)}
        />
        <Row
          icon={<Zap className="h-4 w-4 text-ink/55" />}
          title="Auto Container Update"
          desc="Automatically upgrade to the next plan tier at 95% usage. Requires Auto Payment."
          checked={autoUpgrade}
          loading={saving === "upgrade"}
          disabled={!autoPayment}
          onChange={(v) => patch("auto_upgrade", v)}
        />
      </div>
    </section>
  );
}

function Row({
  icon,
  title,
  desc,
  checked,
  onChange,
  loading,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 p-4 ${disabled ? "opacity-55" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-ink/60">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink/50" />}
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled || loading} />
      </div>
    </div>
  );
}
