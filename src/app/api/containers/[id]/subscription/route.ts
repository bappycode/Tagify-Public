import { z } from "zod";
import { containers } from "@/server/db";
import { readBody, route } from "@/server/http";
import { getContainer } from "@/server/resources";

const schema = z.object({
  auto_upgrade: z.boolean().optional(),
  auto_payment: z.boolean().optional(),
});

export const PATCH = route<{ id: string }>(async ({ req, params, user }) => {
  const body = await readBody(req, schema);
  const owner = await getContainer(user.id, params.id);
  await containers.updateOne({ _id: owner._id }, { $set: body });
});
