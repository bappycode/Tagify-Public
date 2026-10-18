import { z } from "zod";
import { removeDomain } from "@/server/domains";
import { readBody, route } from "@/server/http";
import { getContainer } from "@/server/resources";

const schema = z.object({
  container_identifier: z.string().min(1),
  custom_domain: z.string().min(1),
});

export const POST = route(async ({ req, user }) => {
  const body = await readBody(req, schema);
  const owner = await getContainer(user.id, body.container_identifier);
  return removeDomain("containers", owner, body.custom_domain);
});
