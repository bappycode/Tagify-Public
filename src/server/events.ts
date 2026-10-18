import "server-only";
import { randomUUID } from "node:crypto";
import { events, workspaces, type PlatformResult, type TrackedEvent, type Workspace } from "./db";

const MATCH_KEYS = ["em", "ph", "fn", "ln", "external_id", "fbp", "fbc", "client_ip_address"];
const STORE_URL = "https://demo-store.tagify.top";

const EVENT_TYPES = [
  { name: "PageView", weight: 0.45, path: "/", title: "Demo Store — Home" },
  { name: "ViewContent", weight: 0.2, path: "/products/linen-shirt", title: "Linen Shirt" },
  { name: "AddToCart", weight: 0.13, path: "/products/linen-shirt", title: "Linen Shirt" },
  { name: "InitiateCheckout", weight: 0.09, path: "/checkout", title: "Checkout" },
  { name: "Lead", weight: 0.06, path: "/newsletter", title: "Newsletter" },
  { name: "Purchase", weight: 0.07, path: "/checkout/thank-you", title: "Order confirmed" },
];

export type EventInput = Pick<TrackedEvent, "event_name"> &
  Partial<Omit<TrackedEvent, "workspace_identifier" | "platforms" | "emq" | "created_at">>;

function pickEventType() {
  let roll = Math.random();
  for (const type of EVENT_TYPES) {
    roll -= type.weight;
    if (roll <= 0) return type;
  }
  return EVENT_TYPES[0];
}

const hashed = () => randomUUID().replaceAll("-", "");

export function randomEvent(): EventInput {
  const type = pickEventType();
  const identified = Math.random() < 0.6;

  return {
    event_name: type.name,
    event_source_url: `${STORE_URL}${type.path}`,
    page_title: type.title,
    client_id: `cid_${Math.floor(Math.random() * 400)}`,
    revenue: type.name === "Purchase" ? Math.round((20 + Math.random() * 180) * 100) / 100 : null,
    user_data: {
      client_ip_address: "203.0.113.24",
      fbp: `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e9)}`,
      ...(identified && { em: hashed(), ph: hashed(), external_id: hashed() }),
    },
  };
}

export function matchQuality(userData: Record<string, unknown> = {}) {
  const matched = MATCH_KEYS.filter((key) => userData[key]).length;
  return Math.max(1, Math.round((matched / MATCH_KEYS.length) * 10));
}

export function deliver(platforms: string[]): PlatformResult[] {
  return platforms.map((name) => ({
    name,
    status: Math.random() < 0.96 ? "success" : "error",
  }));
}

export async function recordEvent(workspace: Workspace, input: EventInput) {
  const platforms = workspace.receivers.filter((r) => r.is_active).map((r) => r.platform_name);

  const event: TrackedEvent = {
    workspace_identifier: workspace.workspace_identifier,
    event_id: input.event_id ?? randomUUID(),
    event_name: input.event_name,
    event_source_url: input.event_source_url ?? null,
    page_title: input.page_title ?? null,
    client_id: input.client_id ?? null,
    revenue: input.revenue ?? null,
    emq: matchQuality(input.user_data),
    platforms: deliver(platforms.length ? platforms : ["meta"]),
    user_data: input.user_data ?? {},
    created_at: new Date(),
  };

  await events.insertOne(event);
  await workspaces.updateOne(
    { workspace_identifier: workspace.workspace_identifier },
    { $inc: { requests_count: 1 } },
  );
  return event;
}

export function toLiveMessage(event: TrackedEvent, activeUsers: number) {
  return {
    event_id: event.event_id,
    event_name: event.event_name,
    event_source_url: event.event_source_url,
    page_title: event.page_title,
    received_at: event.created_at.getTime(),
    revenue: event.revenue,
    emq: event.emq,
    active_users: activeUsers,
    platforms: event.platforms,
    payload: {
      event_name: event.event_name,
      event_id: event.event_id,
      event_time: Math.floor(event.created_at.getTime() / 1000),
      event_source_url: event.event_source_url,
      user_data: event.user_data,
    },
  };
}

export async function activeUsers(workspaceIdentifier: string) {
  const since = new Date(Date.now() - 5 * 60_000);
  const ids = await events.distinct("client_id", {
    workspace_identifier: workspaceIdentifier,
    created_at: { $gte: since },
  });
  return ids.filter(Boolean).length;
}
