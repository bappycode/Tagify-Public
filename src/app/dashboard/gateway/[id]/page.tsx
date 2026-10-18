"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  MetaLogo,
  GoogleAnalyticsLogo,
  GoogleAdsLogo,
  TikTokLogo,
  SnapchatLogo,
} from "@/components/logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Save,
  Trash2,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Plug,
  ShoppingBag,
  Store,
  Package,
  Code2,
  Download,
  ExternalLink,
  ChevronDown,
  Activity,
  BarChart3,
  Clock,
  Info,
  HelpCircle,
} from "lucide-react";
import { getLimit, normalizeTier } from "@/lib/plans";
import { UsageCard, PlanFallbackBanner } from "@/components/usage-overview";
import { SubscriptionCard } from "@/components/subscription-card";

const DNS_CNAME_TARGET = "app.tagify.top";
const DOMAIN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 3,
  pro_plus: 5,
  business: 10,
  business_plus: 20,
  enterprise: 50,
  enterprise_plus: 100,
};

type PlatformKey = "meta" | "tiktok" | "snapchat" | "google_analytics" | "google_ads";

const PLATFORMS_WITH_TEST_CODE = new Set<PlatformKey>(["meta", "tiktok"]);

const GOOGLE_ADS_EVENTS: { key: string; label: string }[] = [
  { key: "page_view", label: "Page View" },
  { key: "view_item", label: "View Item" },
  { key: "add_to_cart", label: "Add to Cart" },
  { key: "begin_checkout", label: "Begin Checkout" },
  { key: "purchase", label: "Purchase" },
  { key: "generate_lead", label: "Generate Lead" },
  { key: "sign_up", label: "Sign Up" },
  { key: "add_payment_info", label: "Add Payment Info" },
];

interface Destination {
  key: PlatformKey;
  name: string;
  pixelLabel: string;
  tokenLabel: string;
  Logo: (props: { size?: number }) => React.ReactElement;
}

const DESTINATIONS: Destination[] = [
  {
    key: "meta",
    name: "Meta Conversions API",
    pixelLabel: "Pixel ID",
    tokenLabel: "Access Token",
    Logo: MetaLogo,
  },
  {
    key: "tiktok",
    name: "TikTok Events API",
    pixelLabel: "Pixel ID",
    tokenLabel: "Access Token",
    Logo: TikTokLogo,
  },
  {
    key: "snapchat",
    name: "Snapchat CAPI",
    pixelLabel: "Pixel ID",
    tokenLabel: "Access Token",
    Logo: SnapchatLogo,
  },
  {
    key: "google_analytics",
    name: "Google Analytics 4",
    pixelLabel: "Measurement ID",
    tokenLabel: "API Secret",
    Logo: GoogleAnalyticsLogo,
  },
  {
    key: "google_ads",
    name: "Google Ads",
    pixelLabel: "Customer ID",
    tokenLabel: "Conversion Labels",
    Logo: GoogleAdsLogo,
  },
];

type FormState = {
  pixel_id: string;
  api_token: string;
  test_event_code: string;
  debug_mode: boolean;
  ga_labels: Record<string, string>;
};
const emptyForm: FormState = {
  pixel_id: "",
  api_token: "",
  test_event_code: "",
  debug_mode: false,
  ga_labels: {},
};

type DestState = {
  configured: boolean;
  form: FormState;
  draft: FormState;
  saving: boolean;
  deleting: boolean;
};

const makeInitialDest = (): Record<PlatformKey, DestState> => {
  const base = {} as Record<PlatformKey, DestState>;
  for (const d of DESTINATIONS) {
    base[d.key] = {
      configured: false,
      form: { ...emptyForm, ga_labels: {} },
      draft: { ...emptyForm, ga_labels: {} },
      saving: false,
      deleting: false,
    };
  }
  return base;
};

interface GatewayDomain {
  domain: string;
  status: string;
}
interface Gateway {
  workspace_id: number;
  workspace_identifier: string;
  name: string;
  pixel_key: string;
  custom_domain?: string;
  generic_domain?: string;
  domains?: GatewayDomain[];
  plan_tier?: string;
  requests_count?: number;
  billing_cycle_start?: string | null;
  status?: string;
  analytics_enabled?: boolean;
  auto_payment?: boolean;
  auto_upgrade?: boolean;
  plan_fallback?: boolean;
}

const addMonth = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + 1);
  return d;
};

const buildCustomSnippet = (pixelKey: string, domain: string) => `<script>
(function(w, d, s, src, config) {
    w.TagifyConfig = config;
    w.Tagify = w.Tagify || function() { (w.Tagify.q = w.Tagify.q || []).push(arguments) };
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
    j.async = true; j.src = src; f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'https://${domain}/tagify.js', {
    pixelKey: '${pixelKey}',
    endpoint: 'https://${domain}/v1/e'
});
// Initialize and fire Page View
Tagify('track', 'page_view');
</script>`;

const PURCHASE_SNIPPET = `Tagify('track', 'purchase', {
    user_data: {
        em: 'customer@example.com', // Email
        ph: '1234567890',           // Phone number
        fn: 'John', ln: 'Doe',      // Name
        ct: 'New York', st: 'NY',   // City, State
        zp: '10001', country: 'US'  // Zip, 2-Letter Country Code
    },
    ecommerce: {
        transaction_id: 'ORDER_98765',
        value: 99.98,
        currency: 'USD',
        items: [
            { item_id: 'PROD_001', price: 49.99, quantity: 1 },
            { item_id: 'PROD_002', price: 49.99, quantity: 1 }
        ]
    }
});`;

const SEARCH_SNIPPET = `Tagify('track', 'search', {
    custom_data: { search_term: 'wireless headphones' }
});`;

const SIGNUP_SNIPPET = `Tagify('track', 'sign_up', {
    user_data: { em: 'newuser@example.com' },
    custom_data: { method: 'google_oauth' }
});`;

const LEAD_SNIPPET = `Tagify('track', 'generate_lead', {
    user_data: {
        em: 'lead@example.com',
        ph: '1234567890'
    },
    custom_data: { lead_type: 'newsletter', source: 'footer' }
});`;

const CUSTOM_EVENT_SNIPPET = `Tagify('track', 'watched_video', {
    custom_data: {
        video_title: 'Product Demo',
        watch_percent: 75,
        player_type: 'youtube'
    }
});`;

const buildShopifySnippet = (
  pixelKey: string,
  trackingDomain: string,
) => `const ENDPOINT = "https://${trackingDomain}/v1/e";
const PIXEL_KEY = "${pixelKey}";

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function extractCustomerData(event) {
    const ud = {};
    const c = event?.data?.checkout || {};
    const init = window.initContext?.data?.customer || {};

    ud.em = c.email || init.email || null;
    ud.ph = c.billingAddress?.phone || c.shippingAddress?.phone || init.phone || null;
    ud.fn = c.billingAddress?.firstName || c.shippingAddress?.firstName || init.firstName || null;
    ud.ln = c.billingAddress?.lastName || c.shippingAddress?.lastName || init.lastName || null;

    ud.ct = c.billingAddress?.city || c.shippingAddress?.city || null;
    ud.st = c.billingAddress?.provinceCode || c.shippingAddress?.provinceCode || null;
    ud.zp = c.billingAddress?.zip || c.shippingAddress?.zip || null;
    ud.country = c.billingAddress?.countryCode || c.shippingAddress?.countryCode || null;

    return Object.fromEntries(Object.entries(ud).filter(([_, v]) => v != null && v !== ''));
}

async function getGlobalUser(initEvent) {
    const ud = {};
    const urlObj = new URL(initEvent.context.document.location.href);
    const params = urlObj.searchParams;

    try {
        const stored = await browser.localStorage.getItem('_tg_user_data');
        if (stored) Object.assign(ud, JSON.parse(stored));
    } catch (e) {}

    if (params.has('ttclid')) ud.ttclid = params.get('ttclid');
    if (params.has('ScCid') || params.has('sccid') || params.has('ScClid')) ud.sccid = params.get('ScCid') || params.get('sccid') || params.get('ScClid');
    if (params.has('gclid')) ud.gclid = params.get('gclid');
    if (params.has('fbclid')) ud.fbc = 'fb.1.' + Date.now() + '.' + params.get('fbclid');

    if (!ud.fbp) ud.fbp = 'fb.1.' + Date.now() + '.' + Math.round(Math.random() * 2147483647);
    if (!ud.ttp) ud.ttp = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (!ud.scid) ud.scid = generateUUID();
    if (!ud.client_id) ud.client_id = generateUUID();

    try {
        await browser.localStorage.setItem('_tg_user_data', JSON.stringify(ud));
        await browser.cookie.set('_tg_fbp', ud.fbp);
        await browser.cookie.set('_tg_ttp', ud.ttp);
        if (ud.fbc) await browser.cookie.set('_tg_fbc', ud.fbc);
        if (ud.ttclid) await browser.cookie.set('_tg_ttclid', ud.ttclid);
        if (ud.sccid) await browser.cookie.set('_tg_sccid', ud.sccid);
        if (ud.gclid) await browser.cookie.set('_tg_gclid', ud.gclid);
    } catch (e) {}

    return ud;
}

async function sendEvent(eventName, event, data = {}) {
    const globalUser = await getGlobalUser(event);

    if (data.extractedUser) {
        Object.assign(globalUser, data.extractedUser);
        try {
            await browser.localStorage.setItem('_tg_user_data', JSON.stringify(globalUser));
        } catch (e) {}
        delete data.extractedUser;
    }

    const payload = {
        event_name: eventName,
        event_id: event.id || generateUUID(),
        event_time: Math.floor(new Date(event.timestamp || Date.now()).getTime() / 1000),
        event_source_url: event.context.document.location.href,
        user_data: globalUser
    };

    if (data.custom_data) {
        payload.custom_data = data.custom_data;
        delete data.custom_data;
    }
    if (Object.keys(data).length > 0) {
        payload.ecommerce = data;
    }

    fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tg-key': PIXEL_KEY },
        body: JSON.stringify(payload),
        keepalive: true
    }).catch(err => {});
}

// --- 1. CORE EVENTS ---
analytics.subscribe('page_viewed', async (event) => {
    const extractedUser = extractCustomerData(event);
    await sendEvent('page_view', event, { extractedUser });
});

analytics.subscribe('search_submitted', async (event) => {
    await sendEvent('search', event, {
        custom_data: { search_term: event.data?.searchResult?.query || '' }
    });
});

// --- 2. PRODUCT & CART EVENTS ---
analytics.subscribe('product_viewed', async (event) => {
    const p = event.data.productVariant || event.data.product;
    await sendEvent('view_item', event, {
        value: p?.price?.amount || 0,
        currency: p?.price?.currencyCode || 'USD',
        items: [{ item_id: p?.sku || p?.id, price: p?.price?.amount, quantity: 1 }]
    });
});

analytics.subscribe('product_added_to_cart', async (event) => {
    const p = event.data.cartLine.merchandise;
    await sendEvent('add_to_cart', event, {
        value: event.data.cartLine.cost.totalAmount.amount || 0,
        currency: event.data.cartLine.cost.totalAmount.currencyCode || 'USD',
        items: [{ item_id: p?.sku || p?.id, price: p?.price?.amount, quantity: event.data.cartLine.quantity }]
    });
});

analytics.subscribe('product_removed_from_cart', async (event) => {
    const p = event.data.cartLine.merchandise;
    await sendEvent('remove_from_cart', event, {
        value: event.data.cartLine.cost.totalAmount.amount || 0,
        currency: event.data.cartLine.cost.totalAmount.currencyCode || 'USD',
        items: [{ item_id: p?.sku || p?.id, price: p?.price?.amount, quantity: event.data.cartLine.quantity }]
    });
});

analytics.subscribe('cart_viewed', async (event) => {
    const cart = event.data.cart;
    if (!cart) return;
    const items = cart.lines.map(i => ({ item_id: i.merchandise?.sku || i.merchandise?.id, price: i.cost?.totalAmount?.amount, quantity: i.quantity }));
    await sendEvent('view_cart', event, {
        value: cart.cost?.totalAmount?.amount || 0,
        currency: cart.cost?.totalAmount?.currencyCode || 'USD',
        items: items
    });
});

// --- 3. CHECKOUT & PURCHASE EVENTS ---
analytics.subscribe('checkout_started', async (event) => {
    const c = event.data.checkout;
    if (!c) return;
    const items = c.lineItems.map(i => ({ item_id: i.variant?.sku || i.variant?.id, price: i.variant?.price?.amount, quantity: i.quantity }));
    await sendEvent('begin_checkout', event, {
        value: c.subtotalPrice?.amount || 0,
        currency: c.subtotalPrice?.currencyCode || 'USD',
        items: items,
        extractedUser: extractCustomerData(event)
    });
});

analytics.subscribe('checkout_shipping_info_submitted', async (event) => {
    const c = event.data.checkout;
    if (!c) return;
    const items = c.lineItems.map(i => ({ item_id: i.variant?.sku || i.variant?.id, price: i.variant?.price?.amount, quantity: i.quantity }));
    await sendEvent('add_shipping_info', event, {
        value: c.subtotalPrice?.amount || 0,
        currency: c.subtotalPrice?.currencyCode || 'USD',
        items: items,
        extractedUser: extractCustomerData(event)
    });
});

analytics.subscribe('payment_info_submitted', async (event) => {
    const c = event.data.checkout;
    if (!c) return;
    const items = c.lineItems.map(i => ({ item_id: i.variant?.sku || i.variant?.id, price: i.variant?.price?.amount, quantity: i.quantity }));
    await sendEvent('add_payment_info', event, {
        value: c.subtotalPrice?.amount || 0,
        currency: c.subtotalPrice?.currencyCode || 'USD',
        items: items,
        extractedUser: extractCustomerData(event)
    });
});

analytics.subscribe('checkout_completed', async (event) => {
    const c = event.data.checkout;
    if (!c) return;
    const items = c.lineItems.map(i => ({ item_id: i.variant?.sku || i.variant?.id, price: i.variant?.price?.amount, quantity: i.quantity }));
    await sendEvent('purchase', event, {
        transaction_id: c.order?.id || event.id,
        value: c.totalPrice?.amount || 0,
        currency: c.totalPrice?.currencyCode || 'USD',
        items: items,
        extractedUser: extractCustomerData(event)
    });
});

// --- 4. ENGAGEMENT EVENTS ---
analytics.subscribe('customer_registered', async (event) => {
    await sendEvent('sign_up', event, {
        extractedUser: extractCustomerData(event),
        custom_data: { method: 'shopify_storefront' }
    });
});
`;

const KLAVIYO_PIXEL_SNIPPET = `// Optional: Generate Lead from Klaviyo form submissions
// Requires the theme snippet (below) to be installed in theme.liquid
analytics.subscribe('klaviyo_submit', async (event) => {
    await sendEvent('generate_lead', event, {
        extractedUser: {
            em: event.customData?.formEmail || null,
            ph: event.customData?.formPhone || null
        },
        custom_data: {
            form_id: event.customData?.formId,
            form_title: event.customData?.formTitle,
            source: 'klaviyo'
        }
    });
});`;

const KLAVIYO_THEME_SNIPPET = `<script>
window.addEventListener("klaviyoForms", function(e) {
  if (e.detail && e.detail.type === 'submit') {
    Shopify.analytics.publish('klaviyo_submit', {
      formId: e.detail.formId,
      formTitle: e.detail.metaData?.$source,
      formEmail: e.detail.metaData?.$email,
      formPhone: e.detail.metaData?.$phone_number
    });
  }
});
</script>`;

function SnippetBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="max-h-80 overflow-auto rounded-lg bg-cream p-3 sm:p-4 pr-20 sm:pr-24 text-[11px] sm:text-xs font-mono whitespace-pre-wrap break-all">
        {code}
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          toast.success("Copied");
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? (
          <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="mr-1.5 h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export default function GatewayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [gw, setGw] = useState<Gateway | null>(null);
  const [loading, setLoading] = useState(true);
  const [dest, setDest] = useState<Record<PlatformKey, DestState>>(makeInitialDest);

  const [pixelCopied, setPixelCopied] = useState(false);
  const [domainDraft, setDomainDraft] = useState("");
  const [savingDomain, setSavingDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [verifyAttempts, setVerifyAttempts] = useState<Record<string, number>>({});
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);
  const [reactivating, setReactivating] = useState(false);

  const searchParams = useSearchParams();
  const googleAdsReturn = searchParams.get("success") === "google_ads_connected";
  const [configDialog, setConfigDialog] = useState<PlatformKey | null>(
    googleAdsReturn ? "google_ads" : null,
  );
  const [googleAdsOAuth, setGoogleAdsOAuth] = useState(googleAdsReturn);
  const [sallaConnected, setSallaConnected] = useState(
    searchParams.get("success") === "salla_connected",
  );
  const [disconnectingSalla, setDisconnectingSalla] = useState(false);
  const pathname = usePathname();
  const setSearchParams = (next: URLSearchParams) => {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const [confirmDisconnect, setConfirmDisconnect] = useState<PlatformKey | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [shopifyOpen, setShopifyOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [wooOpen, setWooOpen] = useState(false);
  const [downloadingPlugin, setDownloadingPlugin] = useState(false);
  const [togglingAnalytics, setTogglingAnalytics] = useState(false);

  const toggleAnalytics = async (next: boolean) => {
    if (!id) return;
    setTogglingAnalytics(true);
    setGw((g) => (g ? { ...g, analytics_enabled: next } : g));
    try {
      await api<{ success: boolean; analytics_enabled: boolean }>({
        path: `/api/workspaces/${id}/analytics`,
        method: "PATCH",
        body: { enabled: next },
      });
      toast.success(next ? "Event analytics enabled" : "Event analytics disabled");
    } catch (e) {
      setGw((g) => (g ? { ...g, analytics_enabled: !next } : g));
      toast.error(`Failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setTogglingAnalytics(false);
    }
  };

  const reload = async () => {
    if (!id) return;
    try {
      const json = await api<{ workspace?: Gateway; data?: Gateway } & Gateway>({
        path: `/api/workspaces/${id}`,
      });
      const raw =
        (json as { workspace?: Gateway; data?: Gateway }).workspace ??
        (json as { workspace?: Gateway; data?: Gateway }).data ??
        (json as Gateway);
      const next: Gateway = {
        workspace_id: Number(raw?.workspace_id ?? 0),
        workspace_identifier: String(raw?.workspace_identifier ?? id),
        name: String(raw?.name ?? ""),
        pixel_key: String(raw?.pixel_key ?? ""),
        custom_domain: raw?.custom_domain ?? "",
        generic_domain: raw?.generic_domain ?? "app.tagify.top",
        domains: Array.isArray(raw?.domains)
          ? raw.domains
              .map((d) => ({
                domain: String(d?.domain ?? ""),
                status: String(d?.status ?? "pending"),
              }))
              .filter((d) => d.domain)
          : [],
        plan_tier: String(raw?.plan_tier ?? "free").toLowerCase(),
        requests_count: Number(raw?.requests_count ?? 0),
        billing_cycle_start: raw?.billing_cycle_start ?? null,
        status: String(raw?.status ?? "active"),
        analytics_enabled: Boolean(raw?.analytics_enabled ?? false),
        auto_payment: Boolean(raw?.auto_payment ?? false),
        auto_upgrade: Boolean(raw?.auto_upgrade ?? false),
        plan_fallback: Boolean(raw?.plan_fallback ?? false),
      };

      setGw(next);
    } catch (e) {
      toast.error(`Failed to load gateway: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const json = await api<{ data?: { receivers?: unknown[] }; receivers?: unknown[] }>({
          path: `/api/receivers/${id}`,
        });
        const receivers = (json?.data?.receivers ?? json?.receivers ?? []) as Array<
          Record<string, unknown>
        >;
        if (cancelled) return;
        const base = makeInitialDest();
        receivers.forEach((r) => {
          const key = r?.platform_name as PlatformKey;
          if (!key || !(key in base)) return;
          const rawToken = String(r?.api_token ?? "");
          let gaLabels: Record<string, string> = {};
          if (key === "google_ads" && rawToken) {
            try {
              const parsed = JSON.parse(rawToken) as { labels?: Record<string, string> };
              if (parsed?.labels && typeof parsed.labels === "object") {
                gaLabels = Object.fromEntries(
                  Object.entries(parsed.labels).map(([k, v]) => [k, String(v ?? "")]),
                );
              }
            } catch {}
          }
          const f: FormState = {
            pixel_id: String(r?.pixel_id ?? ""),
            api_token: rawToken,
            test_event_code: String(r?.test_event_code ?? ""),
            debug_mode: Boolean(r?.debug_mode ?? false),
            ga_labels: gaLabels,
          };
          base[key] = { ...base[key], configured: true, form: f, draft: f };
          if (key === "google_ads") setGoogleAdsOAuth(true);
        });
        setDest(base);
      } catch (e) {
        console.error("Failed to load receivers:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const json = await api<{ connected?: boolean; data?: { connected?: boolean } }>({
          path: `/api/google-ads/status/${id}`,
        });
        if (cancelled) return;
        const connected = Boolean(json?.connected ?? json?.data?.connected);
        if (connected) setGoogleAdsOAuth(true);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (googleAdsReturn) {
      toast.success("Google Ads connected — add your Customer ID and conversion labels");
      const next = new URLSearchParams(searchParams);
      next.delete("success");
      setSearchParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const json = await api<{ connected?: boolean; data?: { connected?: boolean } }>({
          path: `/api/salla/status/${id}`,
        });
        if (cancelled) return;
        setSallaConnected(Boolean(json?.connected ?? json?.data?.connected));
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "salla_connected") {
      toast.success("Salla store connected successfully");
      const next = new URLSearchParams(searchParams);
      next.delete("success");
      setSearchParams(next);
    } else if (error === "salla_failed") {
      toast.error("Failed to connect Salla. Please try again.");
      const next = new URLSearchParams(searchParams);
      next.delete("error");
      setSearchParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnectSalla = async () => {
    if (!id) return;
    setDisconnectingSalla(true);
    try {
      await api({ path: `/api/salla/${id}`, method: "DELETE" });
      setSallaConnected(false);
      toast.success("Salla disconnected");
    } catch (e) {
      toast.error(`Disconnect failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setDisconnectingSalla(false);
    }
  };

  const downloadWooPlugin = () => {
    setDownloadingPlugin(true);
    try {
      const anchor = document.createElement("a");
      anchor.href = "/downloads/tagify-pixel.zip";
      anchor.download = "tagify-pixel.zip";
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download plugin");
    } finally {
      setTimeout(() => setDownloadingPlugin(false), 800);
    }
  };

  useEffect(() => {
    if (!id || !gw) return;
    const pending = (gw.domains ?? []).filter((d) => d.status !== "active").map((d) => d.domain);
    if (pending.length === 0) return;
    const attempts: Record<string, number> = {};
    let cancelled = false;
    const interval = setInterval(async () => {
      const exhausted = pending.every((d) => (attempts[d] ?? 0) >= 5);
      if (exhausted) {
        clearInterval(interval);
        return;
      }
      for (const domain of pending) {
        if (cancelled) return;
        if ((attempts[domain] ?? 0) >= 5) continue;
        attempts[domain] = (attempts[domain] ?? 0) + 1;
        setVerifyAttempts((prev) => ({ ...prev, [domain]: attempts[domain] }));
        try {
          const json = await api<{ verified?: boolean; success?: boolean }>({
            path: "/api/workspaces/verify-domain",
            method: "POST",
            body: { workspace_identifier: id, custom_domain: domain },
          });
          if (json?.verified || json?.success) {
            await reload();
            return;
          }
        } catch {}
      }
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, JSON.stringify((gw?.domains ?? []).map((d) => `${d.domain}:${d.status}`))]);

  const computed = useMemo(() => {
    if (!gw) return null;
    const planTier = normalizeTier(gw.plan_tier);
    const isPro = planTier !== "free";
    const requestsLimit = getLimit(planTier);

    const requestsCount = gw.requests_count ?? 0;
    const usagePercent =
      requestsLimit > 0 ? Math.min(100, Math.round((requestsCount / requestsLimit) * 100)) : 0;
    const cycleRenew = addMonth(gw.billing_cycle_start);
    const domainLimit = DOMAIN_LIMITS[planTier] ?? DOMAIN_LIMITS.free;
    const gatewayDomains = gw.domains ?? [];
    const activeCustomDomains = gatewayDomains.filter((d) => d.status === "active");
    const firstActive = activeCustomDomains[0]?.domain ?? "";
    const genericDomain = gw.generic_domain ?? "app.tagify.top";
    const trackingDomain = firstActive || genericDomain;
    const activeTrackingUrls =
      activeCustomDomains.length > 0
        ? activeCustomDomains.map((d) => `https://${d.domain}`)
        : [`https://${genericDomain}`];
    return {
      planTier,
      isPro,
      requestsLimit,
      requestsCount,
      usagePercent,
      cycleRenew,
      domainLimit,
      domainLimitReached: gatewayDomains.length >= domainLimit,
      gatewayDomains,
      activeCustomDomains,
      firstActive,
      genericDomain,
      trackingDomain,
      activeTrackingUrls,
      isDisabled: (gw.status || "active") === "disabled",
    };
  }, [gw]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-ink/60">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading gateway…
      </div>
    );
  }
  if (!gw || !computed) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/gateway"
          className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-coral"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="rounded-xl border border-ink/10 bg-background p-10 text-center text-sm text-ink/60">
          Gateway not found.{" "}
          <Link href="/dashboard/gateway" className="text-coral underline">
            Go back
          </Link>
          .
        </div>
      </div>
    );
  }

  const labelFor = (key: PlatformKey) => DESTINATIONS.find((d) => d.key === key)?.name ?? key;

  const handleToggleClick = (key: PlatformKey, next: boolean) => {
    const d = dest[key];
    if (d.configured && !next) setConfirmDisconnect(key);
    else if (!d.configured && next) setConfigDialog(key);
  };

  const saveDestination = async (key: PlatformKey) => {
    const f = dest[key].draft;

    const pixelId = f.pixel_id.trim();
    let apiToken = f.api_token.trim();

    if (key === "google_ads") {
      if (!googleAdsOAuth) {
        toast.error("Connect Google Ads with OAuth first");
        return;
      }
      if (!pixelId) {
        toast.error("Customer ID is required");
        return;
      }
      const labels: Record<string, string> = {};
      for (const ev of GOOGLE_ADS_EVENTS) {
        const v = (f.ga_labels?.[ev.key] ?? "").trim();
        if (v) labels[ev.key] = v;
      }
      apiToken = JSON.stringify({ labels });
    } else if (!pixelId || !apiToken) {
      toast.error("Pixel ID and API token are required");
      return;
    }

    setDest((s) => ({ ...s, [key]: { ...s[key], saving: true } }));
    try {
      await api({
        path: "/api/receivers/save",
        method: "POST",
        body: {
          workspace_identifier: id,
          platform_name: key,
          pixel_id: pixelId,
          api_token: apiToken,
          test_event_code: PLATFORMS_WITH_TEST_CODE.has(key)
            ? f.test_event_code.trim() || undefined
            : undefined,
          is_active: true,
          ...(key === "google_analytics" ? { debug_mode: !!f.debug_mode } : {}),
        },
      });
      const saved: FormState = {
        pixel_id: pixelId,
        api_token: apiToken,
        test_event_code: PLATFORMS_WITH_TEST_CODE.has(key) ? f.test_event_code.trim() : "",
        debug_mode: key === "google_analytics" ? !!f.debug_mode : false,
        ga_labels: key === "google_ads" ? { ...(f.ga_labels ?? {}) } : {},
      };
      setDest((s) => ({
        ...s,
        [key]: { ...s[key], configured: true, form: saved, draft: saved, saving: false },
      }));
      setConfigDialog(null);
      toast.success(`${labelFor(key)} connection saved`);
    } catch (e) {
      setDest((s) => ({ ...s, [key]: { ...s[key], saving: false } }));
      toast.error(`Failed to save: ${e instanceof Error ? e.message : "unknown error"}`);
    }
  };

  const disconnectNow = async () => {
    const key = confirmDisconnect;
    if (!key) return;
    setConfirmDisconnect(null);
    setDest((s) => ({ ...s, [key]: { ...s[key], deleting: true } }));
    try {
      await api({
        path: "/api/receivers/delete",
        method: "DELETE",
        body: { workspace_identifier: id, platform_name: key },
      });
      setDest((s) => ({
        ...s,
        [key]: {
          configured: false,
          form: { ...emptyForm, ga_labels: {} },
          draft: { ...emptyForm, ga_labels: {} },
          saving: false,
          deleting: false,
        },
      }));
      if (key === "google_ads") setGoogleAdsOAuth(false);
      toast.success(`${labelFor(key)} disconnected`);
    } catch (e) {
      setDest((s) => ({ ...s, [key]: { ...s[key], deleting: false } }));
      toast.error(`Disconnect failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }
  };

  const deleteGateway = async () => {
    setDeleting(true);
    try {
      await api({ path: `/api/workspaces/${id}`, method: "DELETE" });
      toast.success("Gateway deleted");
      router.push("/dashboard/gateway");
    } catch (e) {
      toast.error(`Delete failed: ${e instanceof Error ? e.message : "unknown error"}`);
      setDeleting(false);
    }
  };

  const reactivate = async () => {
    setReactivating(true);
    try {
      await api({ path: `/api/workspaces/${id}/reactivate`, method: "POST" });
      await reload();
      toast.success("Gateway reactivated");
    } catch (e) {
      toast.error(`Reactivate failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setReactivating(false);
    }
  };

  const addDomain = async () => {
    const d = domainDraft
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");
    if (!d || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d)) {
      toast.error("Enter a valid domain (e.g. c.brand.com)");
      return;
    }
    setSavingDomain(true);
    try {
      await api({
        path: "/api/workspaces/domain",
        method: "POST",
        body: { workspace_identifier: id, custom_domain: d },
      });
      setDomainDraft("");
      await reload();
      toast.success("Domain added. Point CNAME, then click Check DNS.");
    } catch (e) {
      toast.error(`Add domain failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setSavingDomain(false);
    }
  };

  const verifyDomain = async (domain: string) => {
    setVerifyingDomain(domain);
    try {
      const json = await api<{ verified?: boolean; success?: boolean }>({
        path: "/api/workspaces/verify-domain",
        method: "POST",
        body: { workspace_identifier: id, custom_domain: domain },
      });
      if (json?.verified || json?.success) {
        await reload();
        toast.success("Domain verified");
      } else toast.error("DNS not propagated yet. Try again in a few minutes.");
    } catch (e) {
      toast.error(`Check failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setVerifyingDomain(null);
    }
  };

  const removeDomain = async (domain: string) => {
    setRemovingDomain(domain);
    try {
      await api({
        path: "/api/workspaces/remove-domain",
        method: "POST",
        body: { workspace_identifier: id, custom_domain: domain },
      });
      await reload();
      toast.success("Domain removed");
    } catch (e) {
      toast.error(`Remove failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setRemovingDomain(null);
    }
  };

  const copyPixelKey = async () => {
    await navigator.clipboard.writeText(gw.pixel_key);
    setPixelCopied(true);
    toast.success("Pixel key copied");
    setTimeout(() => setPixelCopied(false), 1200);
  };

  const customSnippet = buildCustomSnippet(gw.pixel_key, computed.trackingDomain);

  const sources = [
    {
      key: "salla",
      name: "Salla",
      subtitle: sallaConnected ? "Connected" : "OAuth",
      desc: sallaConnected
        ? "Your Salla store is connected — purchase & checkout events flow in automatically."
        : "Connect your Salla store via OAuth — all purchase & checkout events flow in automatically.",
      Icon: Store,
      cta: sallaConnected ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={disconnectSalla}
          disabled={disconnectingSalla}
        >
          {disconnectingSalla ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Disconnecting…
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" /> Disconnect
            </>
          )}
        </Button>
      ) : (
        <Button asChild className="w-full">
          <a href={`/api/salla/auth?workspace_identifier=${gw.workspace_identifier}`}>
            <Plug className="mr-2 h-4 w-4" /> Connect Salla
          </a>
        </Button>
      ),
    },
    {
      key: "shopify",
      name: "Shopify",
      subtitle: "Web Pixel",
      desc: "Paste our Customer Events pixel into Shopify admin.",
      Icon: ShoppingBag,
      cta: (
        <Button variant="outline" className="w-full" onClick={() => setShopifyOpen(true)}>
          <ExternalLink className="mr-2 h-4 w-4" /> Setup guide
        </Button>
      ),
    },
    {
      key: "woocommerce",
      name: "WooCommerce",
      subtitle: "WP Plugin",
      desc: "Download and install our official WordPress plugin.",
      Icon: Package,
      cta: (
        <Button variant="outline" className="w-full" onClick={() => setWooOpen(true)}>
          <ExternalLink className="mr-2 h-4 w-4" /> Setup guide
        </Button>
      ),
    },
    {
      key: "custom",
      name: "Custom Website",
      subtitle: "HTML / JS",
      desc: "Drop one snippet into your &lt;head&gt; — works on any site.",
      Icon: Code2,
      cta: (
        <Button variant="outline" className="w-full" onClick={() => setCustomOpen(true)}>
          <ExternalLink className="mr-2 h-4 w-4" /> Setup guide
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/gateway"
          className="-ml-1 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-coral"
        >
          <ArrowLeft className="h-4 w-4" /> All gateways
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-medium tracking-tight">
              {gw.name || "Untitled gateway"}
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              {computed.firstActive ? (
                <>
                  <span className="font-mono">{computed.firstActive}</span> · routing events to your
                  receivers.
                </>
              ) : (
                <>Connect sources and route events to your ad platforms.</>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/dashboard/gateway/${id}/analytics`}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-4 py-2 text-sm font-medium text-ink hover:bg-cream"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </Link>
            <Link
              href={`/dashboard/gateway/${id}/events`}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <Activity className="h-3.5 w-3.5" /> Live events
            </Link>
          </div>
        </div>
      </div>

      {computed.isDisabled && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-destructive">
              This gateway was paused due to inactivity.
            </p>
            <p className="mt-0.5 text-xs text-destructive/80">
              Reactivate to resume forwarding events.
            </p>
          </div>
          <Button size="sm" variant="destructive" onClick={reactivate} disabled={reactivating}>
            {reactivating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            Reactivate
          </Button>
        </div>
      )}

      {gw.plan_fallback && <PlanFallbackBanner />}

      <div className="grid gap-3 md:grid-cols-2">
        <UsageCard
          planTier={computed.planTier}
          requestsUsed={computed.requestsCount}
          cycleRenewLabel={
            computed.cycleRenew
              ? computed.cycleRenew.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null
          }
          planFallback={gw.plan_fallback}
        />
        <div className="space-y-2 rounded-xl border border-ink/10 bg-background p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-ink/55" />
            <p className="text-xs text-ink/55">Tagging server URLs</p>
          </div>

          {computed.activeCustomDomains.length === 0 && (
            <p className="text-xs text-ink/55">
              Using the default Tagify URL — add a verified custom domain for first-party tracking.
            </p>
          )}
          <div className="space-y-1.5">
            {computed.activeTrackingUrls.map((url) => (
              <div
                key={url}
                className="flex items-center justify-between gap-2 rounded-md border border-ink/10 bg-cream p-2"
              >
                <code className="break-all text-xs text-coral">{url}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={async () => {
                    await navigator.clipboard.writeText(url);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-background p-3">
        <Label className="shrink-0 text-xs text-ink/55">Pixel key</Label>
        <Input value={gw.pixel_key} readOnly className="h-9 max-w-xs font-mono text-sm" />
        <Button size="sm" variant="outline" onClick={copyPixelKey}>
          {pixelCopied ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          {pixelCopied ? "Copied" : "Copy"}
        </Button>
        <div className="ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete gateway
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-ink/10 bg-background p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 h-4 w-4 text-ink/55" />
          <div>
            <p className="text-sm font-medium">Event Analytics</p>
            <p className="mt-0.5 text-xs text-ink/60">
              Record event history for reporting.{" "}
              {computed.isPro ? "Pro plan: 30-day history." : "Free plan: 7-day history."}
            </p>
          </div>
        </div>
        <Switch
          checked={!!gw.analytics_enabled}
          onCheckedChange={toggleAnalytics}
          disabled={togglingAnalytics}
        />
      </div>

      <SubscriptionCard
        identifier={String(id)}
        scope="workspaces"
        autoPayment={!!gw.auto_payment}
        autoUpgrade={!!gw.auto_upgrade}
        onChange={(next) =>
          setGw((g) =>
            g ? { ...g, auto_payment: next.auto_payment, auto_upgrade: next.auto_upgrade } : g,
          )
        }
      />

      <div className="rounded-xl border border-ink/10 bg-background">
        <div className="flex items-center gap-2 p-4 pb-2">
          <Globe className="h-4 w-4 text-ink/55" />
          <h2 className="font-display text-base font-medium">Domains</h2>
        </div>
        <div className="space-y-2.5 p-4 pt-0">
          <div
            className={`rounded-md border p-2.5 ${computed.firstActive ? "border-ink/10 bg-cream" : "border-emerald-500/40 bg-emerald-500/10"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wide text-ink/55">Default</div>
                <code className="block truncate text-sm font-mono">{computed.genericDomain}</code>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {!computed.firstActive && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-700"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Live
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={async () => {
                    await navigator.clipboard.writeText(computed.genericDomain);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {computed.gatewayDomains.map((d) => {
            const active = d.status === "active";
            const isVer = verifyingDomain === d.domain;
            const isRem = removingDomain === d.domain;
            const parts = d.domain.split(".");
            const hostName = parts.length > 2 ? parts.slice(0, -2).join(".") : "@";
            const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : d.domain;
            const attempts = verifyAttempts[d.domain] ?? 0;
            const exhausted = attempts >= 5;

            if (active) {
              return (
                <div
                  key={d.domain}
                  className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-ink/55">
                        Custom domain
                      </div>
                      <code className="block truncate text-sm font-mono">{d.domain}</code>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-700"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Live
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-ink/55 hover:text-destructive"
                        onClick={() => removeDomain(d.domain)}
                        disabled={isRem}
                      >
                        {isRem ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={d.domain}
                className="overflow-hidden rounded-md border border-amber-500/30 bg-amber-500/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                      {exhausted ? (
                        <AlertCircle className="h-4 w-4 text-amber-700" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-coral" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="truncate text-sm font-mono font-medium">{d.domain}</code>
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/15 text-[10px] text-amber-700"
                        >
                          {exhausted ? "Auto-check paused" : `Verifying… (${attempts}/5)`}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                        <Clock className="h-3 w-3" />
                        {exhausted ? (
                          <span>
                            Auto-check paused — use Check DNS to retry. DNS can take up to 72h.
                          </span>
                        ) : (
                          <span>
                            Auto-checking every 30s for ~2½ minutes. DNS can take up to 72h.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {exhausted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setVerifyAttempts((p) => ({ ...p, [d.domain]: 0 }));
                          verifyDomain(d.domain);
                        }}
                        disabled={isVer || isRem}
                      >
                        {isVer ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Check DNS
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-ink/55 hover:text-destructive"
                      onClick={() => removeDomain(d.domain)}
                      disabled={isRem}
                    >
                      {isRem ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-amber-500/20 bg-background p-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Info className="h-4 w-4 text-coral" />
                    Add this CNAME record at your DNS provider
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Cloudflare, GoDaddy, Namecheap, Route 53 — log in wherever you manage{" "}
                    <span className="font-mono">{rootDomain}</span>.
                  </p>

                  <div className="mt-3 overflow-hidden rounded-md border border-ink/10">
                    <div className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-3 bg-cream/60 px-3 py-1.5 text-[10px] uppercase tracking-wide text-ink/55">
                      <div>Type</div>
                      <div>Name / Host</div>
                      <div>Value / Target</div>
                      <div className="w-7" />
                    </div>
                    <div className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-3 px-3 py-2.5">
                      <div>
                        <span className="inline-flex items-center rounded border border-ink/15 bg-background px-2 py-0.5 text-xs font-mono font-medium">
                          CNAME
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-mono text-sm font-medium">{d.domain}</div>
                        <div className="truncate text-[11px] text-ink/55">Host: {hostName}</div>
                      </div>
                      <div className="min-w-0 truncate font-mono text-sm font-medium text-coral">
                        {DNS_CNAME_TARGET}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={async () => {
                          await navigator.clipboard.writeText(DNS_CNAME_TARGET);
                          toast.success("Copied");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-start gap-1.5 rounded-md border border-ink/10 bg-cream/40 p-2 text-xs text-ink/70">
                      <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/55" />
                      <div>
                        <span className="font-medium text-ink">Using Cloudflare?</span> Set proxy to{" "}
                        <span className="font-medium">DNS only</span> (grey cloud).
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 rounded-md border border-ink/10 bg-cream/40 p-2 text-xs text-ink/70">
                      <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/55" />
                      <div>
                        <span className="font-medium text-ink">Root domain?</span> Many registrars
                        use @. Subdomains use the prefix only.
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-ink/55">
                    Verify propagation at{" "}
                    <a
                      href={`https://dnschecker.org/#CNAME/${d.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-coral underline-offset-2 hover:underline"
                    >
                      dnschecker.org
                    </a>
                    .
                  </p>
                </div>
              </div>
            );
          })}

          {computed.domainLimitReached ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-ink/15 p-3">
              <p className="text-sm text-ink/60">
                Domain limit reached ({computed.gatewayDomains.length}/{computed.domainLimit}).
              </p>
              {!computed.isPro && (
                <Badge className="border-coral/30 bg-coral/10 text-coral">
                  <Sparkles className="mr-1 h-3 w-3" /> Upgrade to Pro for 3 domains
                </Badge>
              )}
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <p className="text-sm text-ink/60">
                {computed.gatewayDomains.length > 0 ? (
                  <>
                    Add another tracking domain.{" "}
                    <span className="text-xs">
                      ({computed.gatewayDomains.length}/{computed.domainLimit} used)
                    </span>
                  </>
                ) : (
                  <>
                    Current tracking domain:{" "}
                    <span className="font-mono">{computed.genericDomain}</span>. Add a custom domain
                    to white-label.
                  </>
                )}
              </p>
              <p className="text-xs text-amber-700">
                Tip: pick a short, obscure subdomain like{" "}
                <span className="font-mono">c.yourbrand.com</span> or{" "}
                <span className="font-mono">s.yourbrand.com</span>. Avoid{" "}
                <span className="font-mono">track</span>, <span className="font-mono">sgtm</span>,{" "}
                <span className="font-mono">gtm</span>, <span className="font-mono">analytics</span>
                , <span className="font-mono">metrics</span> — browsers and ad-blockers filter them.
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="e.g. c.yourbrand.com"
                  value={domainDraft}
                  onChange={(e) => setDomainDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !savingDomain) addDomain();
                  }}
                  className="h-9 min-w-[220px] flex-1"
                />
                <Button size="sm" onClick={addDomain} disabled={savingDomain || !id}>
                  {savingDomain ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-4 w-4" />
                  )}
                  Add domain
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-medium">Data sources</h2>
          <p className="text-sm text-ink/60">Where your customer events come from.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {sources.map((s) => (
            <div
              key={s.key}
              className="flex flex-col rounded-xl border border-ink/10 bg-background p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-cream text-ink">
                  <s.Icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {s.subtitle}
                </Badge>
              </div>
              <div className="mt-1 text-sm font-medium">{s.name}</div>
              <p
                className="mt-1 mb-3 flex-1 text-xs leading-relaxed text-ink/60"
                dangerouslySetInnerHTML={{ __html: s.desc }}
              />
              {s.cta}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-medium">Receivers</h2>
          <p className="text-sm text-ink/60">Active receivers — where events are forwarded.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {DESTINATIONS.map((d) => {
            const state = dest[d.key];
            const isOn = state.configured;
            return (
              <div key={d.key} className="rounded-xl border border-ink/10 bg-background">
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md border border-ink/10 bg-cream">
                      <d.Logo size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{d.name}</div>
                      <div className={`text-xs ${isOn ? "text-emerald-600" : "text-ink/55"}`}>
                        {isOn ? "Configured (active)" : "Not configured"}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={isOn}
                    onCheckedChange={(v) => handleToggleClick(d.key, v)}
                    aria-label={`Enable ${d.name}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDest((s) => ({
                      ...s,
                      [d.key]: { ...s[d.key], draft: { ...s[d.key].form } },
                    }));
                    setConfigDialog(d.key);
                  }}
                  className="flex w-full items-center justify-between border-t border-ink/10 px-3 py-2 text-xs text-ink/55 hover:text-ink"
                >
                  <span>{isOn ? "Edit credentials" : "Configure credentials"}</span>
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog open={!!configDialog} onOpenChange={(o) => !o && setConfigDialog(null)}>
        <DialogContent className="max-w-md">
          {configDialog &&
            (() => {
              const d = DESTINATIONS.find((x) => x.key === configDialog)!;
              const state = dest[configDialog];
              const isGoogleAds = d.key === "google_ads";
              const oauthOk = !isGoogleAds || googleAdsOAuth;
              const connectUrl = `/api/google-ads/auth?workspace_identifier=${encodeURIComponent(String(id ?? ""))}`;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 bg-cream">
                        <d.Logo size={18} />
                      </span>
                      {d.name}
                      {isGoogleAds && oauthOk && state.configured && (
                        <Badge className="ml-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      {isGoogleAds
                        ? "Connect Google Ads with OAuth, then add your Customer ID and conversion action IDs."
                        : "Enter your credentials. They are stored securely and used to forward server-side events."}
                    </DialogDescription>
                  </DialogHeader>

                  {isGoogleAds && !oauthOk && (
                    <div className="space-y-3">
                      <div className="rounded-md border border-ink/10 bg-cream p-3 text-xs text-ink/70">
                        You&apos;ll be redirected to Google to authorize Tagify. After you grant
                        access, you&apos;ll come back here to add your Customer ID and conversion
                        labels.
                      </div>
                      <Button
                        asChild
                        className="w-full"
                        style={{ backgroundColor: "#4285F4", color: "#fff" }}
                      >
                        <a href={connectUrl}>
                          <d.Logo size={16} />
                          <span className="ml-1.5">Connect Google Ads</span>
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setConfigDialog(null)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {(!isGoogleAds || oauthOk) && (
                    <div
                      className={`space-y-3 ${isGoogleAds && !oauthOk ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor={`dlg-${d.key}-pixel`}>
                          {d.pixelLabel} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`dlg-${d.key}-pixel`}
                          value={state.draft.pixel_id}
                          onChange={(e) =>
                            setDest((s) => ({
                              ...s,
                              [d.key]: {
                                ...s[d.key],
                                draft: { ...s[d.key].draft, pixel_id: e.target.value },
                              },
                            }))
                          }
                          placeholder={isGoogleAds ? "123-456-7890" : d.pixelLabel}
                        />
                      </div>

                      {!isGoogleAds && (
                        <div className="space-y-1.5">
                          <Label htmlFor={`dlg-${d.key}-token`}>
                            {d.tokenLabel} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`dlg-${d.key}-token`}
                            type="password"
                            value={state.draft.api_token}
                            onChange={(e) =>
                              setDest((s) => ({
                                ...s,
                                [d.key]: {
                                  ...s[d.key],
                                  draft: { ...s[d.key].draft, api_token: e.target.value },
                                },
                              }))
                            }
                            placeholder="••••••••••••"
                            autoComplete="new-password"
                          />
                        </div>
                      )}

                      {isGoogleAds && (
                        <div className="space-y-2">
                          <div>
                            <Label>
                              Conversion Action IDs{" "}
                              <span className="text-xs text-ink/55">
                                (optional — leave blank to skip)
                              </span>
                            </Label>
                            <p className="mt-0.5 text-xs text-ink/60">
                              Numeric IDs from Google Ads → Tools → Conversions → ID column.
                            </p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {GOOGLE_ADS_EVENTS.map((ev) => (
                              <div key={ev.key} className="space-y-1">
                                <Label htmlFor={`dlg-ga-${ev.key}`} className="text-xs text-ink/70">
                                  {ev.label}
                                </Label>
                                <Input
                                  id={`dlg-ga-${ev.key}`}
                                  inputMode="numeric"
                                  value={state.draft.ga_labels?.[ev.key] ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setDest((s) => ({
                                      ...s,
                                      google_ads: {
                                        ...s.google_ads,
                                        draft: {
                                          ...s.google_ads.draft,
                                          ga_labels: {
                                            ...(s.google_ads.draft.ga_labels ?? {}),
                                            [ev.key]: v,
                                          },
                                        },
                                      },
                                    }));
                                  }}
                                  placeholder="e.g. 1234567890"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {PLATFORMS_WITH_TEST_CODE.has(d.key) && (
                        <div className="space-y-1.5">
                          <Label htmlFor={`dlg-${d.key}-test`}>
                            Test event code <span className="text-xs text-ink/55">(optional)</span>
                          </Label>
                          <Input
                            id={`dlg-${d.key}-test`}
                            value={state.draft.test_event_code}
                            onChange={(e) =>
                              setDest((s) => ({
                                ...s,
                                [d.key]: {
                                  ...s[d.key],
                                  draft: { ...s[d.key].draft, test_event_code: e.target.value },
                                },
                              }))
                            }
                            placeholder="TEST12345"
                          />
                        </div>
                      )}
                      {d.key === "google_analytics" && (
                        <div className="flex items-start gap-2 rounded-md border border-ink/10 bg-cream p-3">
                          <Checkbox
                            id={`dlg-${d.key}-debug`}
                            checked={!!state.draft.debug_mode}
                            onCheckedChange={(v) =>
                              setDest((s) => ({
                                ...s,
                                [d.key]: {
                                  ...s[d.key],
                                  draft: { ...s[d.key].draft, debug_mode: v === true },
                                },
                              }))
                            }
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <Label htmlFor={`dlg-${d.key}-debug`} className="cursor-pointer">
                              Enable GA4 Debug Mode
                            </Label>
                            <p className="text-xs text-ink/60">
                              Shows events in GA4 DebugView for troubleshooting.
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setConfigDialog(null)}
                          disabled={state.saving}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => saveDestination(d.key)}
                          disabled={state.saving}
                          className="flex-1"
                        >
                          {state.saving ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-1.5 h-4 w-4" />
                          )}
                          Save connection
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDisconnect}
        onOpenChange={(o) => !o && setConfirmDisconnect(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect this receiver?</AlertDialogTitle>
            <AlertDialogDescription>
              Events will stop being forwarded to{" "}
              <b>{confirmDisconnect ? labelFor(confirmDisconnect) : ""}</b> and saved credentials
              will be removed. You can reconnect anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={disconnectNow}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={(o) => !deleting && setConfirmDelete(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gateway?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes <b>{gw.name || "this gateway"}</b> and all its receivers.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                deleteGateway();
              }}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={shopifyOpen} onOpenChange={setShopifyOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Shopify Customer Events setup</DialogTitle>
            <DialogDescription>
              In Shopify admin go to <b>Settings → Customer Events → Add custom pixel</b>, name it
              &quot;Tagify&quot;, paste the snippet below, then click Save and Connect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 overflow-y-auto pr-1">
            <div>
              <h4 className="mb-2 text-sm font-semibold">1. Customer Events pixel</h4>
              <p className="mb-2 text-xs text-ink/60">
                Paste this into your new custom pixel in <b>Settings → Customer events</b>. It
                subscribes to all standard Shopify events and forwards them to your Gateway with
                pre-filled <code className="font-mono text-xs">pixelKey</code> and{" "}
                <code className="font-mono text-xs">endpoint</code>.
              </p>
              <SnippetBlock code={buildShopifySnippet(gw.pixel_key, computed.trackingDomain)} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">
                2. Lead capture (Klaviyo forms — optional)
              </h4>
              <p className="mb-2 text-xs text-ink/60">
                Only if you want to track <code className="font-mono text-xs">generate_lead</code>{" "}
                from Klaviyo popups/forms. This is <b>not</b> included in snippet 1 — add both
                snippets below.
              </p>
              <p className="mb-2 mt-3 text-xs text-ink/60">
                <b>a)</b> Append this to the bottom of your Customer Events pixel (same place as
                snippet 1):
              </p>
              <SnippetBlock code={KLAVIYO_PIXEL_SNIPPET} />
              <p className="mb-2 mt-3 text-xs text-ink/60">
                <b>b)</b> Add this to your theme — Shopify admin →{" "}
                <b>Online Store → Themes → Edit code → theme.liquid</b>, just before the closing{" "}
                <code className="font-mono text-xs">&lt;/body&gt;</code> tag:
              </p>
              <SnippetBlock code={KLAVIYO_THEME_SNIPPET} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1rem)] max-w-3xl flex-col overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Custom website setup</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Install Tagify on any HTML / JavaScript site. The pixel auto-harvests click IDs (
              <code className="font-mono text-xs">fbclid</code>,{" "}
              <code className="font-mono text-xs">ttclid</code>,{" "}
              <code className="font-mono text-xs">gclid</code>, …) — your job is to pass the{" "}
              <code className="font-mono text-xs">user_data</code> object for{" "}
              <b>90%+ Event Match Quality</b> on Meta, TikTok, Snapchat &amp; GA4.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="base" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="base" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5">
                <span className="sm:hidden">Base</span>
                <span className="hidden sm:inline">1. Base pixel</span>
              </TabsTrigger>
              <TabsTrigger value="ecom" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5">
                <span className="sm:hidden">E-com</span>
                <span className="hidden sm:inline">2. E-commerce</span>
              </TabsTrigger>
              <TabsTrigger value="lead" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5">
                <span className="sm:hidden">Lead</span>
                <span className="hidden sm:inline">3. Lead &amp; engagement</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5">
                <span className="sm:hidden">Custom</span>
                <span className="hidden sm:inline">4. Custom events</span>
              </TabsTrigger>
            </TabsList>
            <div className="mt-4 space-y-4 overflow-y-auto pr-1">
              <TabsContent value="base" className="mt-0 space-y-3">
                <p className="text-sm text-ink/65">
                  Paste this into the <code className="font-mono text-xs">&lt;head&gt;</code> of
                  every page. It initializes the tracker, auto-harvests click IDs, and fires a{" "}
                  <code className="font-mono text-xs">page_view</code>.
                </p>
                <SnippetBlock code={customSnippet} />
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-ink/65">
                  <strong className="text-ink">EMQ tip:</strong> On any logged-in page, also call{" "}
                  <code className="mx-1 font-mono">
                    Tagify(&apos;set&apos;, &apos;user_data&apos;, {`{ em: '…', ph: '…' }`})
                  </code>{" "}
                  so every subsequent event is enriched automatically.
                </div>
              </TabsContent>
              <TabsContent value="ecom" className="mt-0 space-y-3">
                <p className="text-sm text-ink/65">
                  Use these for product funnels. Pass an{" "}
                  <code className="font-mono text-xs">ecommerce</code> object for value, and the{" "}
                  <code className="font-mono text-xs">user_data</code> object on checkout pages for
                  max EMQ.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "view_item",
                    "add_to_cart",
                    "remove_from_cart",
                    "view_cart",
                    "begin_checkout",
                    "add_shipping_info",
                    "add_payment_info",
                    "purchase",
                  ].map((e) => (
                    <Badge key={e} variant="secondary" className="font-mono text-[11px]">
                      {e}
                    </Badge>
                  ))}
                </div>
                <div>
                  <h4 className="mb-1.5 text-sm font-semibold">Purchase event (full example)</h4>
                  <SnippetBlock code={PURCHASE_SNIPPET} />
                </div>
              </TabsContent>
              <TabsContent value="lead" className="mt-0 space-y-4">
                <p className="text-sm text-ink/65">
                  Track high-intent user actions across your marketing funnel.
                </p>
                <div>
                  <h4 className="mb-1.5 text-sm font-semibold">Search</h4>
                  <SnippetBlock code={SEARCH_SNIPPET} />
                </div>
                <div>
                  <h4 className="mb-1.5 text-sm font-semibold">Sign up (account creation)</h4>
                  <SnippetBlock code={SIGNUP_SNIPPET} />
                </div>
                <div>
                  <h4 className="mb-1.5 text-sm font-semibold">Generate lead (form submissions)</h4>
                  <SnippetBlock code={LEAD_SNIPPET} />
                </div>
              </TabsContent>
              <TabsContent value="custom" className="mt-0 space-y-3">
                <p className="text-sm text-ink/65">
                  Tagify natively routes any custom event you invent. Pass parameters inside{" "}
                  <code className="mx-1 font-mono text-xs">custom_data</code> and they&apos;re
                  forwarded to Meta, TikTok, Snapchat, and GA4 automatically.
                </p>
                <SnippetBlock code={CUSTOM_EVENT_SNIPPET} />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={wooOpen} onOpenChange={setWooOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>WooCommerce / WordPress setup</DialogTitle>
            <DialogDescription>
              Install the Tagify plugin in your WordPress dashboard, then paste the credentials
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-ink/55">Your pixel key</Label>
              <div className="flex gap-2">
                <Input value={gw.pixel_key} readOnly className="font-mono text-sm" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(gw.pixel_key);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-ink/55">Your tracking domain</Label>
              <div className="flex gap-2">
                <Input value={computed.trackingDomain} readOnly className="font-mono text-sm" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(computed.trackingDomain);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={downloadWooPlugin} disabled={downloadingPlugin}>
                {downloadingPlugin ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" />
                )}
                Download plugin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
