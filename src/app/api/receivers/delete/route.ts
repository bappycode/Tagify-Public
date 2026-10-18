import { z } from "zod";
import { workspaces } from "@/server/db";
import { readBody, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const schema = z.object({
  workspace_identifier: z.string().min(1),
  platform_name: z.string().min(1),
});

export const DELETE = route(async ({ req, user }) => {
  const body = await readBody(req, schema);
  const workspace = await getWorkspace(user.id, body.workspace_identifier);
  await workspaces.updateOne(
    { _id: workspace._id },
    { $pull: { receivers: { platform_name: body.platform_name } } },
  );
});
