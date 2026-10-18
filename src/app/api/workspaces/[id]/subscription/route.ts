import { z } from "zod";
import { workspaces } from "@/server/db";
import { readBody, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const schema = z.object({
  auto_upgrade: z.boolean().optional(),
  auto_payment: z.boolean().optional(),
});

export const PATCH = route<{ id: string }>(async ({ req, params, user }) => {
  const body = await readBody(req, schema);
  const owner = await getWorkspace(user.id, params.id);
  await workspaces.updateOne({ _id: owner._id }, { $set: body });
});
