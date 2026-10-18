import { z } from "zod";
import { containers } from "@/server/db";
import { HttpError, readBody, route } from "@/server/http";
import { getContainer } from "@/server/resources";

const schema = z.object({
  web_gtm_id: z.string().regex(/^[A-Z0-9]+$/i, "Invalid GTM ID"),
  adblock_bypass: z.boolean().default(false),
});

export const POST = route<{ id: string }>(async ({ req, params, user }) => {
  const body = await readBody(req, schema);
  const container = await getContainer(user.id, params.id);
  if (container.plan_tier === "free")
    throw new HttpError(403, "Custom loader requires a paid plan.");

  const update = {
    custom_loader_status: "active" as const,
    adblock_bypass: body.adblock_bypass,
    web_gtm_id: body.web_gtm_id.toUpperCase(),
  };
  await containers.updateOne({ _id: container._id }, { $set: update });
  return { success: true, ...update };
});

export const DELETE = route<{ id: string }>(async ({ params, user }) => {
  const container = await getContainer(user.id, params.id);
  const update = {
    custom_loader_status: "inactive" as const,
    adblock_bypass: false,
    web_gtm_id: null,
  };
  await containers.updateOne({ _id: container._id }, { $set: update });
  return { success: true, ...update };
});
