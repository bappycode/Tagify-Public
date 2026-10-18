import { containers } from "@/server/db";
import { route } from "@/server/http";
import { serializeContainer } from "@/server/resources";

export const GET = route(async ({ user }) => {
  const rows = await containers.find({ user_id: user.id }).sort({ created_at: -1 }).toArray();
  return { success: true, containers: rows.map(serializeContainer) };
});
