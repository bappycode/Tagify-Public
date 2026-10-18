import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getLimit, getPlanLabel, usageColor, usagePercent, normalizeTier } from "@/lib/plans";

interface Props {
  planTier?: string | null;
  requestsUsed: number;
  cycleRenewLabel?: string | null;
  planFallback?: boolean;
}

export function UsageCard({ planTier, requestsUsed, cycleRenewLabel, planFallback }: Props) {
  const tier = normalizeTier(planTier);
  const limit = getLimit(tier);
  const pct = usagePercent(requestsUsed, limit);
  const c = usageColor(pct);

  return (
    <div className="rounded-xl border border-ink/10 bg-background p-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs text-ink/55">Requests used</p>
        <Badge variant="outline" className={`text-[10px] ${c.chip}`}>
          {getPlanLabel(tier)}
        </Badge>
      </div>
      <p className="font-display text-2xl font-medium">{requestsUsed.toLocaleString()}</p>
      <p className="text-xs text-ink/55">
        of {limit.toLocaleString()} <span className={c.text}>({pct}%)</span>
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
        <div className={`h-full ${c.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {cycleRenewLabel && (
        <p className="mt-2 text-[10px] text-ink/55">Cycle renews {cycleRenewLabel}</p>
      )}
      {planFallback && (
        <p className="mt-2 text-[11px] font-medium text-red-700">
          Plan shifted to Free — usage capped.
        </p>
      )}
    </div>
  );
}

export function PlanFallbackBanner() {
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-700">Your plan has been shifted to Free.</p>
        <p className="mt-0.5 text-xs text-red-700/85">
          Upgrade to restore full access and processing of new events.
        </p>
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
      >
        Upgrade to restore
      </Link>
    </div>
  );
}
