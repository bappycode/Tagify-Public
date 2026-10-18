import "server-only";
import type { ObjectId } from "mongodb";
import { db } from "@/lib/db";
import { containers, workspaces, type Domain } from "./db";
import { HttpError, notFound } from "./http";

const DNS_PROPAGATION_MS = 15_000;

type Kind = "workspaces" | "containers";
type Owner = { _id: ObjectId; domains: Domain[] };

const owners = (kind: Kind) => db.collection<{ domains: Domain[] }>(kind);

export function normalizeDomain(input: string) {
  const domain = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) {
    throw new HttpError(400, "Enter a valid domain, e.g. track.example.com");
  }
  return domain;
}

export async function addDomain(kind: Kind, owner: Owner, input: string) {
  const domain = normalizeDomain(input);
  const [inWorkspaces, inContainers] = await Promise.all([
    workspaces.countDocuments({ "domains.domain": domain }),
    containers.countDocuments({ "domains.domain": domain }),
  ]);
  if (inWorkspaces + inContainers > 0) throw new HttpError(400, "Domain is already in use.");

  await owners(kind).updateOne(
    { _id: owner._id },
    { $push: { domains: { domain, status: "pending", created_at: new Date() } } },
  );
  return { success: true };
}

export async function verifyDomain(kind: Kind, owner: Owner, input: string) {
  const domain = normalizeDomain(input);
  const entry = owner.domains.find((d) => d.domain === domain);
  if (!entry) throw notFound("Domain");

  if (Date.now() - entry.created_at.getTime() < DNS_PROPAGATION_MS) {
    return { success: false, verified: false, error: "DNS not pointing to Tagify yet." };
  }

  await owners(kind).updateOne(
    { _id: owner._id, "domains.domain": domain },
    { $set: { "domains.$.status": "active" } },
  );
  return { success: true, verified: true };
}

export async function removeDomain(kind: Kind, owner: Owner, input: string) {
  const domain = normalizeDomain(input);
  await owners(kind).updateOne({ _id: owner._id }, { $pull: { domains: { domain } } });
  return { success: true };
}
