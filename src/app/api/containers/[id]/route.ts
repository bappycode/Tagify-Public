import { containers } from "@/server/db";
import { route } from "@/server/http";
import { getContainer, serializeContainer } from "@/server/resources";

export const GET = route<{ id: string }>(async ({ params, user }) => {
  return serializeContainer(await getContainer(user.id, params.id));
});

export const DELETE = route<{ id: string }>(async ({ params, user }) => {
  const container = await getContainer(user.id, params.id);
  await containers.deleteOne({ _id: container._id });
});
