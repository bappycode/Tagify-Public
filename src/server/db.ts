import "server-only";
import { db } from "@/lib/db";

export type PlanTier =
  "free" | "pro" | "pro_plus" | "business" | "business_plus" | "enterprise" | "enterprise_plus";

export interface Domain {
  domain: string;
  status: "pending" | "active";
  created_at: Date;
}

export interface Receiver {
  platform_name: string;
  pixel_id: string | null;
  api_token: string | null;
  test_event_code: string | null;
  is_active: boolean;
  debug_mode: boolean;
  created_at: Date;
}

interface Billing {
  plan_tier: PlanTier;
  plan_fallback: boolean;
  status: "active" | "disabled";
  auto_upgrade: boolean;
  auto_payment: boolean;
  billing_cycle_start: Date;
  created_at: Date;
}

export interface Workspace extends Billing {
  user_id: string;
  workspace_identifier: string;
  name: string;
  pixel_key: string;
  generic_domain: string;
  requests_count: number;
  analytics_enabled: boolean;
  salla_connected: boolean;
  google_ads_connected: boolean;
  domains: Domain[];
  receivers: Receiver[];
}

export interface Container extends Billing {
  user_id: string;
  loader_identifier: string;
  subdomain: string;
  name: string;
  config_string: string;
  server_location: string | null;
  ready_at: Date;
  requests_sent: number;
  custom_loader_status: "active" | "inactive";
  adblock_bypass: boolean;
  web_gtm_id: string | null;
  domains: Domain[];
}

export interface PlatformResult {
  name: string;
  status: "success" | "error";
}

export interface TrackedEvent {
  workspace_identifier: string;
  event_id: string;
  event_name: string;
  event_source_url: string | null;
  page_title: string | null;
  client_id: string | null;
  revenue: number | null;
  emq: number;
  platforms: PlatformResult[];
  user_data: Record<string, unknown>;
  created_at: Date;
}

export interface Notification {
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
}

export const workspaces = db.collection<Workspace>("workspaces");
export const containers = db.collection<Container>("containers");
export const events = db.collection<TrackedEvent>("events");
export const notifications = db.collection<Notification>("notifications");

let indexed: Promise<unknown> | null = null;

export function ensureIndexes() {
  indexed ??= Promise.all([
    workspaces.createIndex({ workspace_identifier: 1 }, { unique: true }),
    workspaces.createIndex({ user_id: 1 }),
    containers.createIndex({ loader_identifier: 1 }, { unique: true }),
    containers.createIndex({ user_id: 1 }),
    events.createIndex({ workspace_identifier: 1, created_at: -1 }),
    notifications.createIndex({ user_id: 1, created_at: -1 }),
  ]);
  return indexed;
}
