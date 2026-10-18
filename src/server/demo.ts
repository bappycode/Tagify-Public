import "server-only";
import {
  containers,
  ensureIndexes,
  events,
  notifications,
  workspaces,
  type TrackedEvent,
} from "./db";
import { deliver, matchQuality, randomEvent } from "./events";
import { randomHex } from "./resources";

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_EVENTS = 1500;
const PLATFORMS = ["meta", "google_analytics", "tiktok"];

const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

function historicalEvents(workspaceIdentifier: string): TrackedEvent[] {
  return Array.from({ length: HISTORY_EVENTS }, () => {
    const input = randomEvent();
    return {
      workspace_identifier: workspaceIdentifier,
      event_id: randomHex(12),
      event_name: input.event_name,
      event_source_url: input.event_source_url ?? null,
      page_title: input.page_title ?? null,
      client_id: input.client_id ?? null,
      revenue: input.revenue ?? null,
      emq: matchQuality(input.user_data),
      platforms: deliver(PLATFORMS),
      user_data: input.user_data ?? {},
      created_at: daysAgo(Math.random() ** 1.4 * 30),
    };
  });
}

export async function seedDemoAccount(userId: string) {
  await ensureIndexes();

  const workspaceIdentifier = randomHex(5);
  const containerIdentifier = randomHex(6);
  const now = new Date();

  await workspaces.insertOne({
    user_id: userId,
    workspace_identifier: workspaceIdentifier,
    name: "Demo Store",
    pixel_key: `tg_live_${randomHex(4)}`,
    generic_domain: `demo-store-${randomHex(2)}.tagify.top`,
    plan_tier: "pro",
    plan_fallback: false,
    status: "active",
    requests_count: 128_450,
    analytics_enabled: true,
    auto_upgrade: false,
    auto_payment: true,
    salla_connected: false,
    google_ads_connected: false,
    billing_cycle_start: daysAgo(12),
    created_at: daysAgo(30),
    domains: [
      {
        domain: `track-${workspaceIdentifier}.demo-store.com`,
        status: "active",
        created_at: daysAgo(29),
      },
    ],
    receivers: [
      { platform_name: "meta", pixel_id: "1234567890123456", api_token: "demo-token" },
      { platform_name: "google_analytics", pixel_id: "G-DEMO12345", api_token: "demo-secret" },
      { platform_name: "tiktok", pixel_id: "CDEMO1234567890", api_token: "demo-token" },
    ].map((r) => ({
      ...r,
      test_event_code: null,
      is_active: true,
      debug_mode: false,
      created_at: daysAgo(29),
    })),
  });

  await events.insertMany(historicalEvents(workspaceIdentifier));

  await containers.insertOne({
    user_id: userId,
    loader_identifier: containerIdentifier,
    subdomain: `sgtm-${randomHex(4)}`,
    name: "Demo Store sGTM",
    config_string: Buffer.from(`demo-config-${containerIdentifier}`).toString("base64"),
    server_location: "eu-central",
    ready_at: daysAgo(20),
    plan_tier: "pro",
    plan_fallback: false,
    status: "active",
    requests_sent: 386_200,
    custom_loader_status: "active",
    adblock_bypass: true,
    web_gtm_id: "KN8Z5BBJ",
    auto_upgrade: false,
    auto_payment: true,
    billing_cycle_start: daysAgo(12),
    created_at: daysAgo(20),
    domains: [
      {
        domain: `sgtm-${containerIdentifier}.demo-store.com`,
        status: "active",
        created_at: daysAgo(20),
      },
    ],
  });

  await notifications.insertMany([
    {
      user_id: userId,
      type: "plan_restored",
      title: "Welcome to the Tagify demo",
      message:
        "Your account comes with a sample Gateway and sGTM container so you can explore every screen.",
      read: false,
      created_at: now,
    },
    {
      user_id: userId,
      type: "quota_75",
      title: "sGTM container at 77% of plan",
      message: "Demo Store sGTM has used 77% of its monthly Pro quota.",
      read: false,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  ]);
}
