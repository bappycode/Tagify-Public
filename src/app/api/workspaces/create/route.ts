import { z } from "zod";
import { workspaces } from "@/server/db";
import { readBody, route } from "@/server/http";
import { assertFreeSlot, getWorkspace, randomHex, serializeWorkspace } from "@/server/resources";

const schema = z.object({ name: z.string().trim().min(1).max(80) });

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const POST = route(async ({ req, user }) => {
  const { name } = await readBody(req, schema);
  await assertFreeSlot(user.id, "workspace");

  const identifier = randomHex(5);
  const now = new Date();
  await workspaces.insertOne({
    user_id: user.id,
    workspace_identifier: identifier,
    name,
    pixel_key: `tg_live_${randomHex(4)}`,
    generic_domain: `${slugify(name) || "ws"}-${randomHex(2)}.tagify.top`,
    plan_tier: "free",
    plan_fallback: false,
    status: "active",
    requests_count: 0,
    analytics_enabled: false,
    auto_upgrade: false,
    auto_payment: false,
    salla_connected: false,
    google_ads_connected: false,
    billing_cycle_start: now,
    created_at: now,
    domains: [],
    receivers: [],
  });

  return { success: true, workspace: serializeWorkspace(await getWorkspace(user.id, identifier)) };
});
