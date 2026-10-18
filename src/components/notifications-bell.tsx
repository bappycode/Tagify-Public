"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Zap,
  AlertTriangle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Ban,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Notification {
  id: string;
  workspace_id?: number | null;
  container_id?: number | string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotifResp {
  notifications: Notification[];
  unread: number;
}

const typeStyle = (type: string): { Icon: typeof Bell; tone: string } => {
  switch (type) {
    case "quota_75":
      return { Icon: Zap, tone: "text-yellow-600 bg-yellow-500/10" };
    case "quota_85":
      return { Icon: AlertTriangle, tone: "text-orange-600 bg-orange-500/10" };
    case "quota_95":
      return { Icon: AlertCircle, tone: "text-red-600 bg-red-500/10" };
    case "quota_95_upgrade":
      return { Icon: ArrowUp, tone: "text-blue-600 bg-blue-500/10" };
    case "plan_fallback":
      return { Icon: ArrowDown, tone: "text-red-600 bg-red-500/10" };
    case "plan_disabled":
      return { Icon: Ban, tone: "text-red-600 bg-red-500/10" };
    case "plan_restored":
      return { Icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-500/10" };
    default:
      return { Icon: Bell, tone: "text-ink/60 bg-cream" };
  }
};

const relTime = (iso: string) => {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return `${days}d ago`;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<NotifResp>({
    queryKey: ["notifications"],
    queryFn: () => api<NotifResp>({ path: "/api/notifications" }),
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (ids?: string[]) =>
      api({ path: "/api/notifications/read", method: "PATCH", body: ids ? { ids } : {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const notifs = (data?.notifications ?? []).slice(0, 50);
  const unread = data?.unread ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-md border border-ink/10 text-ink/70 hover:bg-cream hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[360px] max-w-[92vw] overflow-hidden rounded-xl border border-ink/10 bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => markRead.mutate(undefined)}
                disabled={markRead.isPending}
                className="text-xs font-medium text-coral hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-ink/55">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : notifs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-ink/20" />
                <p className="mt-2 text-sm text-ink/55">You&apos;re all caught up.</p>
              </div>
            ) : (
              <ul className="divide-y divide-ink/5">
                {notifs.map((n) => {
                  const { Icon, tone } = typeStyle(n.type);
                  return (
                    <li
                      key={n.id}
                      onClick={() => !n.read && markRead.mutate([n.id])}
                      className={`flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-cream/60 ${n.read ? "" : "bg-coral/5"}`}
                    >
                      <span
                        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${tone}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-ink">{n.title}</p>
                          {!n.read && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-ink/65 leading-snug">{n.message}</p>
                        <p className="mt-1 text-[10px] text-ink/45">{relTime(n.created_at)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
