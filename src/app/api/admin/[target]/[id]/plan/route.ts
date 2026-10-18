import { z } from "zod";
import { containers, notifications, workspaces } from "@/server/db";
import { notFound, readBody, route } from "@/server/http";

const schema = z.object({
  plan_tier: z.enum([
    "free",
    "pro",
    "pro_plus",
    "business",
    "business_plus",
    "enterprise",
    "enterprise_plus",
  ]),
  requests_count: z.number().int().min(0).optional(),
  reset_billing: z.boolean().default(false),
  reset_notifications: z.boolean().default(false),
});

export const PATCH = route<{ target: string; id: string }>(
  async ({ req, params }) => {
    const body = await readBody(req, schema);
    const billing = {
      plan_tier: body.plan_tier,
      plan_fallback: false,
      ...(body.reset_billing && { billing_cycle_start: new Date() }),
    };

    const result =
      params.target === "workspaces"
        ? await workspaces.findOneAndUpdate(
            { workspace_identifier: params.id },
            {
              $set: {
                ...billing,
                ...(body.requests_count !== undefined && { requests_count: body.requests_count }),
              },
            },
          )
        : params.target === "containers"
          ? await containers.findOneAndUpdate(
              { loader_identifier: params.id },
              {
                $set: {
                  ...billing,
                  ...(body.requests_count !== undefined && { requests_sent: body.requests_count }),
                },
              },
            )
          : null;

    if (!result) throw notFound("Resource");
    if (body.reset_notifications) {
      await notifications.deleteMany({ user_id: result.user_id, type: /^quota_/ });
    }
  },
  { admin: true },
);
