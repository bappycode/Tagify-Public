import { events, workspaces } from "@/server/db";
import { route } from "@/server/http";
import { getWorkspace, serializeWorkspace } from "@/server/resources";

export const GET = route<{ id: string }>(async ({ params, user }) => {
  return serializeWorkspace(await getWorkspace(user.id, params.id));
});

export const DELETE = route<{ id: string }>(async ({ params, user }) => {
  const workspace = await getWorkspace(user.id, params.id);
  await events.deleteMany({ workspace_identifier: workspace.workspace_identifier });
  await workspaces.deleteOne({ _id: workspace._id });
});
