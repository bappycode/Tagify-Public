import { z } from "zod";
import { workspaces } from "@/server/db";
import { readBody, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const schema = z.object({ enabled: z.boolean() });

export const PATCH = route<{ id: string }>(async ({ req, params, user }) => {
  const { enabled } = await readBody(req, schema);
  const workspace = await getWorkspace(user.id, params.id);
  await workspaces.updateOne({ _id: workspace._id }, { $set: { analytics_enabled: enabled } });
  return { success: true, analytics_enabled: enabled };
});
