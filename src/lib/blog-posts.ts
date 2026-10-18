export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  body: { type: "p" | "h2" | "ul" | "quote"; text?: string; items?: string[] }[];
};

export const posts: BlogPost[] = [
  {
    slug: "beating-ad-blockers-server-side",
    title: "Beating ad-blockers without breaking trust",
    description:
      "Why client-side pixels lose up to 30% of conversions and how a server-side gateway quietly fixes the gap — without dark patterns.",
    category: "Tracking",
    readTime: "6 min",
    date: "2026-05-12",
    body: [
      {
        type: "p",
        text: "Ad-blockers, browser tracking protection and tightened cookie lifetimes now eat between 15% and 35% of every advertiser's signal. Meta's CAPI and GA4's Measurement Protocol exist because the browser is no longer a reliable shipping lane.",
      },
      { type: "h2", text: "What actually gets blocked" },
      {
        type: "ul",
        items: [
          "Outbound requests to known ad domains (facebook.com, doubleclick.net, analytics.tiktok.com).",
          "Third-party cookies — already gone in Safari and Firefox, sunsetting in Chrome.",
          "Script tags loaded from non-first-party origins, even with consent.",
        ],
      },
      { type: "h2", text: "Why a server-side gateway works" },
      {
        type: "p",
        text: "Tagify Gateway moves the receive step from the browser to a first-party endpoint on your own domain. The browser sends one request to events.yourstore.com, the gateway authenticates it server-side and fans the event out to every ad platform using the official server APIs.",
      },
      { type: "quote", text: "The pixel doesn't disappear — it just stops looking like a pixel." },
      { type: "h2", text: "Doing it the honest way" },
      {
        type: "p",
        text: "Server-side does not mean 'bypass consent'. Tagify Gateway respects Consent Mode v2 signals end-to-end: if the user declines marketing cookies, that flag travels with the event and platforms receive it in the correct state. You recover lost signal from blockers, not from people who said no.",
      },
    ],
  },
  {
    slug: "client-side-vs-server-side-tracking",
    title: "Client-side vs server-side tracking, explained without the buzzwords",
    description:
      "A practical breakdown of where each model wins, where they break, and why most serious advertisers end up running both.",
    category: "Fundamentals",
    readTime: "8 min",
    date: "2026-04-28",
    body: [
      {
        type: "p",
        text: "Almost every tracking debate online collapses into 'server-side good, client-side bad'. Reality is messier. Here is how the two actually compare in production.",
      },
      { type: "h2", text: "Client-side: fast to ship, slow to trust" },
      {
        type: "p",
        text: "Pixels fire from the user's browser directly to the ad platform. Setup is a script tag. The trade-off: any blocker, ITP rule or flaky network kills the event before it leaves the device, and you never know it happened.",
      },
      { type: "h2", text: "Server-side: trust, but you own the plumbing" },
      {
        type: "p",
        text: "The browser sends events to your server (or a managed one like Tagify), which forwards to ad platforms using their server APIs. You see every event, you can enrich it, you can replay failures. The trade-off: you need a server, and someone has to keep it running.",
      },
      { type: "h2", text: "When to use which" },
      {
        type: "ul",
        items: [
          "Client-side only: tiny sites, prototypes, content where ad budget is negligible.",
          "Server-side only: backend-heavy products (SaaS signups, COD orders) where the conversion happens off-browser anyway.",
          "Both (the realistic answer): a thin client pixel for instant attribution + a server gateway for the events that actually pay the bills.",
        ],
      },
      {
        type: "p",
        text: "Tagify is designed for the third case. The Gateway accepts both browser and server events, deduplicates them with event IDs and ships one clean stream to each ad platform.",
      },
    ],
  },
  {
    slug: "cod-delayed-purchase-tracking",
    title: "Tracking COD and delayed-purchase orders the right way",
    description:
      "Cash-on-delivery breaks the standard purchase event. Here's the pattern Tagify uses to keep attribution intact across confirmation, fulfilment and refund.",
    category: "E-commerce",
    readTime: "5 min",
    date: "2026-04-10",
    body: [
      {
        type: "p",
        text: "If you run COD in South Asia, the Middle East or LATAM, you already know the pain: 30–50% of placed orders never get fulfilled, but every platform's pixel fires a Purchase event the moment checkout completes. You end up training Meta and TikTok to optimise for orders that won't pay.",
      },
      { type: "h2", text: "The three-step pattern" },
      {
        type: "ul",
        items: [
          "Fire an InitiateCheckout server event at order placement — counted, not optimised on.",
          "Fire the Purchase event only after the order is confirmed (call centre, WhatsApp confirmation or webhook from your shipping partner).",
          "Fire a Refund / value-correction event when the order is returned or rejected, so platforms learn the real revenue.",
        ],
      },
      { type: "h2", text: "How Tagify Gateway does it" },
      {
        type: "p",
        text: "The Gateway exposes a single endpoint that accepts state transitions: placed, confirmed, shipped, delivered, returned. Each transition maps to the correct ad-platform event with the right monetary value. You wire it once at the warehouse or call-centre system — no front-end changes needed.",
      },
      {
        type: "p",
        text: "Result: ROAS numbers that actually match your bank account, and ad platforms that finally learn which audiences pay versus which audiences just click 'order'.",
      },
    ],
  },
  {
    slug: "sgtm-in-60-seconds",
    title: "Spinning up server-side GTM in 60 seconds (no GCP bill)",
    description:
      "A walkthrough of deploying a managed sGTM container with Tagify — custom domain, edge cache and Consent Mode v2 included.",
    category: "sGTM",
    readTime: "4 min",
    date: "2026-03-22",
    body: [
      {
        type: "p",
        text: "Google's documentation will happily walk you through deploying server-side GTM on Google Cloud Run. By step four you're picking a region, a load balancer and a billing alert. By step ten you're wondering why this used to be a script tag.",
      },
      { type: "h2", text: "The shorter path" },
      {
        type: "ul",
        items: [
          "Sign in to Tagify and click New sGTM Container.",
          "Paste your GTM container config string from tagmanager.google.com.",
          "Point your custom subdomain (e.g. sgtm.yourstore.com) at the CNAME we show you.",
        ],
      },
      {
        type: "p",
        text: "That's it. Container is live across 300+ edge locations in under a minute, with TLS, Consent Mode v2 forwarding and bot filtering on by default. No Google Cloud account, no Terraform, no surprise bill at the end of the month.",
      },
      { type: "h2", text: "When sGTM alone isn't enough" },
      {
        type: "p",
        text: "sGTM is great for shipping events to Google products (GA4, Google Ads, Floodlight). For Meta, TikTok, Snapchat and Pinterest you want Tagify Gateway sitting next to it — same dashboard, one event stream, every platform fed.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
