import { z } from "zod";
import { workspaces } from "@/server/db";
import { HttpError, readBody, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const schema = z.object({
  workspace_identifier: z.string().min(1),
  platform_name: z.enum(["meta", "tiktok", "snapchat", "google_analytics", "google_ads"]),
  pixel_id: z.string().max(255).nullish(),
  api_token: z.string().max(4000).nullish(),
  test_event_code: z.string().max(255).nullish(),
  is_active: z.boolean().default(true),
  debug_mode: z.boolean().default(false),
});

export const POST = route(async ({ req, user }) => {
  const body = await readBody(req, schema);
  const workspace = await getWorkspace(user.id, body.workspace_identifier);
  if (body.platform_name === "google_ads" && !workspace.google_ads_connected) {
    throw new HttpError(400, "Google Ads not connected. Complete OAuth first.");
  }

  const receiver = {
    platform_name: body.platform_name,
    pixel_id: body.pixel_id ?? null,
    api_token: body.api_token ?? null,
    test_event_code: body.test_event_code || null,
    is_active: body.is_active,
    debug_mode: body.debug_mode,
    created_at: new Date(),
  };

  await workspaces.updateOne(
    { _id: workspace._id },
    { $pull: { receivers: { platform_name: body.platform_name } } },
  );
  await workspaces.updateOne({ _id: workspace._id }, { $push: { receivers: receiver } });
  return { success: true, receiver: { ...receiver, id: receiver.platform_name } };
});
