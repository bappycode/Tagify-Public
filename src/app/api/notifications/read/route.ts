import { ObjectId } from "mongodb";
import { z } from "zod";
import { notifications } from "@/server/db";
import { readBody, route } from "@/server/http";

const schema = z.object({
  ids: z.array(z.string().refine(ObjectId.isValid, "Invalid id")).optional(),
});

export const PATCH = route(async ({ req, user }) => {
  const { ids } = await readBody(req, schema);
  const filter = ids
    ? { user_id: user.id, _id: { $in: ids.map((id) => new ObjectId(id)) } }
    : { user_id: user.id };
  await notifications.updateMany(filter, { $set: { read: true } });
});
