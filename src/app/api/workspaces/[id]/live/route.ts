import { setTimeout as sleep } from "node:timers/promises";
import { events } from "@/server/db";
import { activeUsers, randomEvent, recordEvent, toLiveMessage } from "@/server/events";
import { route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const TICK_MS = 2500;

export const GET = route<{ id: string }>(async ({ req, params, user }) => {
  const workspace = await getWorkspace(user.id, params.id);
  const encoder = new TextEncoder();
  let cursor = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      while (!req.signal.aborted) {
        if (Math.random() < 0.6) await recordEvent(workspace, randomEvent());

        const fresh = await events
          .find({
            workspace_identifier: workspace.workspace_identifier,
            created_at: { $gt: cursor },
          })
          .sort({ created_at: 1 })
          .toArray();
        const users = await activeUsers(workspace.workspace_identifier);

        if (fresh.length === 0) send({ type: "heartbeat", active_users: users });
        for (const event of fresh) send(toLiveMessage(event, users));
        cursor = fresh.at(-1)?.created_at ?? cursor;

        await sleep(TICK_MS, undefined, { signal: req.signal }).catch(() => undefined);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
});
