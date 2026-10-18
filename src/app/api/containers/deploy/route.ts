import { z } from "zod";
import { containers } from "@/server/db";
import { readBody, route } from "@/server/http";
import {
  assertFreeSlot,
  getContainer,
  PROVISION_DELAY_MS,
  randomHex,
  serializeContainer,
} from "@/server/resources";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  configString: z.string().trim().min(1),
  server_location: z.string().max(50).optional(),
});

export const POST = route(async ({ req, user }) => {
  const body = await readBody(req, schema);
  await assertFreeSlot(user.id, "container");

  const identifier = randomHex(6);
  const now = new Date();
  await containers.insertOne({
    user_id: user.id,
    loader_identifier: identifier,
    subdomain: randomHex(4),
    name: body.name,
    config_string: body.configString,
    server_location: body.server_location ?? null,
    ready_at: new Date(now.getTime() + PROVISION_DELAY_MS),
    plan_tier: "free",
    plan_fallback: false,
    status: "active",
    requests_sent: 0,
    custom_loader_status: "inactive",
    adblock_bypass: false,
    web_gtm_id: null,
    auto_upgrade: false,
    auto_payment: false,
    billing_cycle_start: now,
    created_at: now,
    domains: [],
  });

  return {
    success: true,
    message: "Container deploying",
    container: serializeContainer(await getContainer(user.id, identifier)),
  };
});
