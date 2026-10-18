import { workspaces } from "@/server/db";
import { route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

export const POST = route<{ id: string }>(async ({ params, user }) => {
  const workspace = await getWorkspace(user.id, params.id);
  await workspaces.updateOne({ _id: workspace._id }, { $set: { status: "active" } });
  return { success: true, message: "Gateway workspace reactivated." };
});
