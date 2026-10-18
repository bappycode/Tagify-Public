import { workspaces } from "@/server/db";
import { route } from "@/server/http";
import { serializeWorkspace } from "@/server/resources";

export const GET = route(async ({ user }) => {
  const rows = await workspaces.find({ user_id: user.id }).sort({ created_at: -1 }).toArray();
  return { success: true, workspaces: rows.map(serializeWorkspace) };
});
