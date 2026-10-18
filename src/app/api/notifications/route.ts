import { notifications } from "@/server/db";
import { route } from "@/server/http";

export const GET = route(async ({ user }) => {
  const rows = await notifications
    .find({ user_id: user.id })
    .sort({ created_at: -1 })
    .limit(50)
    .toArray();
  return {
    notifications: rows.map(({ _id, type, title, message, read, created_at }) => ({
      id: _id.toString(),
      type,
      title,
      message,
      read,
      created_at,
    })),
    unread: rows.filter((n) => !n.read).length,
  };
});
