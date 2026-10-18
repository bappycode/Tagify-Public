import "server-only";
import { randomBytes } from "node:crypto";
import type { WithId } from "mongodb";
import { containers, workspaces, type Container, type Domain, type Workspace } from "./db";
import { HttpError, notFound } from "./http";

export const PROVISION_DELAY_MS = 10_000;

export const randomHex = (bytes: number) => randomBytes(bytes).toString("hex");

export async function getWorkspace(userId: string, identifier: string) {
  const workspace = await workspaces.findOne({ user_id: userId, workspace_identifier: identifier });
  if (!workspace) throw notFound("Workspace");
  return workspace;
}

export async function getContainer(userId: string, identifier: string) {
  const container = await containers.findOne({ user_id: userId, loader_identifier: identifier });
  if (!container) throw notFound("Container");
  return container;
}

const publicDomains = (domains: Domain[]) =>
  domains.map(({ domain, status }) => ({ domain, status }));

export function serializeWorkspace(workspace: WithId<Workspace>) {
  const { _id, user_id, receivers, ...rest } = workspace;
  return {
    ...rest,
    id: workspace.workspace_identifier,
    domains: publicDomains(workspace.domains),
  };
}

export function serializeContainer(container: WithId<Container>) {
  const { _id, user_id, ready_at, ...rest } = container;
  const running = ready_at.getTime() <= Date.now();
  return {
    ...rest,
    id: container.loader_identifier,
    container_identifier: container.loader_identifier,
    container_config: container.config_string,
    url: `https://${container.subdomain}.tagify.top`,
    domains: publicDomains(container.domains),
    status: container.status === "disabled" ? "disabled" : running ? "running" : "provisioning",
  };
}

export async function assertFreeSlot(userId: string, kind: "workspace" | "container") {
  const filter = {
    user_id: userId,
    plan_tier: "free" as const,
    plan_fallback: false,
    status: "active" as const,
  };
  const count =
    kind === "workspace"
      ? await workspaces.countDocuments(filter)
      : await containers.countDocuments(filter);

  if (count > 0) {
    const product = kind === "workspace" ? "Gateway workspace" : "sGTM container";
    throw new HttpError(
      403,
      `Free limit reached. You already have a free ${product}. Delete it or upgrade to Pro to create another.`,
    );
  }
}
