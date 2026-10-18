import { recordEvent, randomEvent } from "@/server/events";
import { HttpError, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

export const POST = route<{ id: string }>(async ({ params, user }) => {
  const workspace = await getWorkspace(user.id, params.id);
  if (!workspace.receivers.some((r) => r.is_active)) {
    throw new HttpError(400, "Connect at least one destination first.");
  }

  const event = await recordEvent(workspace, { ...randomEvent(), event_name: "TestEvent" });
  return { success: true, event_id: event.event_id };
});
