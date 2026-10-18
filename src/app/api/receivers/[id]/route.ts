import { route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

export const GET = route<{ id: string }>(async ({ params, user }) => {
  const workspace = await getWorkspace(user.id, params.id);
  return {
    success: true,
    receivers: workspace.receivers.map((r) => ({ ...r, id: r.platform_name })),
  };
});
