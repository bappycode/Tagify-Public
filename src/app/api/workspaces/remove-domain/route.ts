import { z } from "zod";
import { removeDomain } from "@/server/domains";
import { readBody, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const schema = z.object({
  workspace_identifier: z.string().min(1),
  custom_domain: z.string().min(1),
});

export const POST = route(async ({ req, user }) => {
  const body = await readBody(req, schema);
  const owner = await getWorkspace(user.id, body.workspace_identifier);
  return removeDomain("workspaces", owner, body.custom_domain);
});
