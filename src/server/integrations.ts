import "server-only";
import { workspaces } from "./db";
import { HttpError, route } from "./http";
import { getWorkspace } from "./resources";

type Flag = "google_ads_connected" | "salla_connected";

export function connect(flag: Flag) {
  return route(async ({ req, user }) => {
    const identifier = new URL(req.url).searchParams.get("workspace_identifier");
    if (!identifier) throw new HttpError(400, "Missing workspace_identifier");

    const workspace = await getWorkspace(user.id, identifier);
    await workspaces.updateOne({ _id: workspace._id }, { $set: { [flag]: true } });
    return Response.redirect(new URL(`/dashboard/gateway/${identifier}?success=${flag}`, req.url));
  });
}

export function status(flag: Flag) {
  return route<{ id: string }>(async ({ params, user }) => {
    const workspace = await getWorkspace(user.id, params.id);
    return { connected: workspace[flag] };
  });
}

export function disconnect(flag: Flag) {
  return route<{ id: string }>(async ({ params, user }) => {
    const workspace = await getWorkspace(user.id, params.id);
    await workspaces.updateOne({ _id: workspace._id }, { $set: { [flag]: false } });
  });
}
