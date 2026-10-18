import { HttpError, route } from "@/server/http";
import { getContainer } from "@/server/resources";

function encode(gtmId: string, key: string) {
  const message = Buffer.from(gtmId);
  const secret = Buffer.from(key);
  return Buffer.from(message.map((byte, i) => byte ^ secret[i % secret.length])).toString(
    "base64url",
  );
}

export const POST = route<{ id: string }>(async ({ params, user }) => {
  const container = await getContainer(user.id, params.id);
  if (!container.web_gtm_id) throw new HttpError(400, "Activate the custom loader first.");

  return {
    success: true,
    encodedId: encode(`GTM-${container.web_gtm_id}`, container.loader_identifier),
  };
});
