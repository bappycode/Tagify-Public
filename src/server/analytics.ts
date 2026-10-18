import "server-only";
import { events, type Workspace } from "./db";
import { HttpError } from "./http";

const DAY_MS = 24 * 60 * 60 * 1000;

const RETENTION_DAYS: Record<string, number> = {
  free: 7,
  pro: 30,
  pro_plus: 60,
  business: 90,
  business_plus: 180,
  enterprise: 365,
  enterprise_plus: 730,
};

export interface Range {
  start: Date;
  end: Date;
  retention: number;
}

export function parseRange(req: Request, workspace: Workspace): Range {
  const params = new URL(req.url).searchParams;
  const retention = RETENTION_DAYS[workspace.plan_tier] ?? 7;
  const now = Date.now();
  const earliest = now - retention * DAY_MS;

  const from = params.get("from") ? Date.parse(params.get("from")!) : earliest;
  const to = params.get("to") ? Date.parse(params.get("to")!) : now;
  if (Number.isNaN(from) || Number.isNaN(to)) throw new HttpError(400, "Invalid date range");

  return {
    start: new Date(Math.max(from, earliest)),
    end: new Date(Math.min(to, now)),
    retention,
  };
}

const inRange = (workspace: Workspace, start: Date, end: Date) => ({
  workspace_identifier: workspace.workspace_identifier,
  created_at: { $gte: start, $lte: end },
});

interface Totals {
  deliveries: number;
  delivered: number;
  events: number;
  revenue: number;
  emq: number;
  users: string[];
}

async function totals(workspace: Workspace, start: Date, end: Date): Promise<Totals> {
  const [row] = await events
    .aggregate<Totals>([
      { $match: inRange(workspace, start, end) },
      {
        $group: {
          _id: null,
          events: { $sum: 1 },
          deliveries: { $sum: { $size: "$platforms" } },
          delivered: {
            $sum: {
              $size: {
                $filter: { input: "$platforms", cond: { $eq: ["$$this.status", "success"] } },
              },
            },
          },
          revenue: { $sum: { $ifNull: ["$revenue", 0] } },
          emq: { $avg: "$emq" },
          users: { $addToSet: "$client_id" },
        },
      },
    ])
    .toArray();
  return row ?? { deliveries: 0, delivered: 0, events: 0, revenue: 0, emq: 0, users: [] };
}

const rate = (t: Totals) =>
  t.deliveries ? Math.round((t.delivered / t.deliveries) * 1000) / 10 : 0;
const change = (current: number, previous: number) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

export async function summary(workspace: Workspace, { start, end, retention }: Range) {
  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
  const [current, previous, active] = await Promise.all([
    totals(workspace, start, end),
    totals(workspace, previousStart, start),
    events.distinct("client_id", inRange(workspace, new Date(Date.now() - DAY_MS), new Date())),
  ]);

  return {
    enabled: true,
    history_days: retention,
    total_events: current.deliveries,
    success_rate: rate(current),
    unique_events: current.events,
    avg_emq: Math.round(current.emq * 10) / 10,
    total_revenue: Math.round(current.revenue * 100) / 100,
    total_users: current.users.length,
    active_users: active.length,
    vs_previous: {
      total_events: change(current.deliveries, previous.deliveries),
      success_rate: change(rate(current), rate(previous)),
      total_users: change(current.users.length, previous.users.length),
    },
  };
}

export async function timeseries(workspace: Workspace, { start, end }: Range) {
  const granularity = end.getTime() - start.getTime() <= 2 * DAY_MS ? "hour" : "day";
  const data = await events
    .aggregate([
      { $match: inRange(workspace, start, end) },
      { $unwind: "$platforms" },
      {
        $group: {
          _id: { $dateTrunc: { date: "$created_at", unit: granularity } },
          success: { $sum: { $cond: [{ $eq: ["$platforms.status", "success"] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ["$platforms.status", "error"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, bucket: "$_id", success: 1, error: 1 } },
    ])
    .toArray();
  return { enabled: true, granularity, data };
}

export async function receivers(workspace: Workspace, { start, end }: Range) {
  const rows = await events
    .aggregate<{ platform: string; sent: number; delivered: number; avg_emq: number }>([
      { $match: inRange(workspace, start, end) },
      { $unwind: "$platforms" },
      {
        $group: {
          _id: "$platforms.name",
          sent: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$platforms.status", "success"] }, 1, 0] } },
          avg_emq: { $avg: "$emq" },
        },
      },
      { $sort: { sent: -1 } },
      { $project: { _id: 0, platform: "$_id", sent: 1, delivered: 1, avg_emq: 1 } },
    ])
    .toArray();

  return {
    enabled: true,
    data: rows.map((r) => ({
      ...r,
      failed: r.sent - r.delivered,
      avg_emq: Math.round(r.avg_emq * 10) / 10,
      delivery_rate: r.sent ? Math.round((r.delivered / r.sent) * 1000) / 10 : 0,
    })),
  };
}

export async function topEvents(workspace: Workspace, { start, end }: Range) {
  const data = await events
    .aggregate([
      { $match: inRange(workspace, start, end) },
      { $group: { _id: "$event_name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { _id: 0, event_name: "$_id", count: 1 } },
    ])
    .toArray();
  return { enabled: true, data };
}

const csvCell = (value: unknown) => {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export async function exportCsv(workspace: Workspace, { start, end }: Range) {
  const header = [
    "event_id",
    "event_name",
    "platform",
    "status",
    "emq",
    "revenue",
    "client_id",
    "created_at",
  ];
  const rows = await events
    .find(inRange(workspace, start, end))
    .sort({ created_at: -1 })
    .toArray();

  const lines = rows.flatMap((e) =>
    e.platforms.map((p) =>
      [e.event_id, e.event_name, p.name, p.status, e.emq, e.revenue, e.client_id, e.created_at]
        .map(csvCell)
        .join(","),
    ),
  );
  return [header.join(","), ...lines].join("\n");
}
