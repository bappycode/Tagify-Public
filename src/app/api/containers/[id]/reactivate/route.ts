import { containers } from "@/server/db";
import { route } from "@/server/http";
import { getContainer, PROVISION_DELAY_MS } from "@/server/resources";

export const POST = route<{ id: string }>(async ({ params, user }) => {
  const container = await getContainer(user.id, params.id);
  await containers.updateOne(
    { _id: container._id },
    { $set: { status: "active", ready_at: new Date(Date.now() + PROVISION_DELAY_MS) } },
  );
  return { success: true, message: "Container reactivating. It will be online in a few seconds." };
});
