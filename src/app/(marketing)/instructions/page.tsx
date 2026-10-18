import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Database,
  ServerCog,
  Globe,
  ArrowUpRight,
  Zap,
  MessageCircle,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = {
  title: "Instructions",
  description: "Step-by-step setup guides for Tagify Gateway, sGTM containers and custom domains.",
};

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "choose", label: "Which one should I use?" },
  { id: "account", label: "Create an account" },
  { id: "gateway", label: "Tagify Gateway" },
  { id: "gw-create", label: "— Create a workspace" },
  { id: "gw-install", label: "— Install on custom website" },
  { id: "gw-shopify", label: "— Shopify pixel" },
  { id: "gw-wordpress", label: "— WordPress / WooCommerce" },
  { id: "gw-events", label: "— Track events" },
  { id: "gw-custom-events", label: "— Custom events" },
  { id: "gw-receivers", label: "— Configure receivers" },
  { id: "gw-domain", label: "— Custom domain & DNS" },
  { id: "sgtm", label: "Tagify sGTM" },
  { id: "sgtm-deploy", label: "— Deploy a container" },
  { id: "sgtm-settings", label: "— Container settings" },
  { id: "sgtm-domain", label: "— Custom domain & DNS" },
  { id: "sgtm-loader", label: "— Stealth Custom Loader" },
  { id: "dns", label: "DNS reference" },
  { id: "dns-multi-domain", label: "— Multi-domain (Pro)" },
  { id: "dns-troubleshoot", label: "— Troubleshooting" },
  { id: "event-reference", label: "Event reference" },
];

const installSnippet = `<script>
(function(w, d, s, src, config) {
  w.TagifyConfig = config;
  w.Tagify = w.Tagify || function() { (w.Tagify.q = w.Tagify.q || []).push(arguments) };
  var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
  j.async = true; j.src = src; f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'https://{trackingDomain}/tagify.js', {
  pixelKey: '{pixelKey}',
  endpoint: 'https://{trackingDomain}/v1/e'
});
Tagify('track', 'page_view');
</script>`;

const purchaseSnippet = `Tagify('track', 'purchase', {
  user_data: {
    em: 'customer@example.com',
    ph: '1234567890',
    fn: 'John', ln: 'Doe',
    ct: 'New York', st: 'NY',
    zp: '10001', country: 'US'
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

const leadSnippet = `Tagify('track', 'generate_lead', {
  user_data: { em: 'lead@example.com', ph: '1234567890' },
  custom_data: { lead_type: 'newsletter', source: 'footer' }
});`;

const customSnippet = `Tagify('track', 'watched_video', {
  custom_data: {
    video_title: 'Product Demo',
    watch_percent: 75,
    player_type: 'youtube'
  }
});`;

const sgtmHead = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://{taggingDomain}/{loaderIdentifier}.min.js?'+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','tgfy={encodedId}');</script>`;

const sgtmBody = `<noscript>
  <iframe src="https://{taggingDomain}/ns.html?id=GTM-XXXXXXX"
    height="0" width="0"
    style="display:none;visibility:hidden"></iframe>
</noscript>`;

const EVENTS: [string, string][] = [
  ["page_view", "Default page load"],
  ["view_item", "Product page view"],
  ["add_to_cart", "Item added"],
  ["view_cart", "Cart page"],
  ["begin_checkout", "Checkout started"],
  ["add_shipping_info", "Shipping submitted"],
  ["add_payment_info", "Payment submitted"],
  ["purchase", "Order placed"],
  ["search", "On-site search submitted"],
  ["sign_up", "Account created"],
  ["generate_lead", "Form / lead capture"],
];

function CodeBlock({ code, lang = "html" }: { code: string; lang?: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-ink/15 bg-ink text-background">
      <div className="flex items-center justify-between border-b border-background/10 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-background/55">
          {lang}
        </span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function H2({
  id,
  icon: Icon,
  children,
}: {
  id: string;
  icon?: typeof Database;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 flex items-center gap-3 pt-8 font-display text-2xl font-medium tracking-tight md:text-3xl"
    >
      {Icon && (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral-soft text-coral">
          <Icon className="h-4 w-4" />
        </span>
      )}
      {children}
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24 pt-6 font-display text-lg font-medium md:text-xl">
      {children}
    </h3>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-cream px-1.5 py-0.5 text-xs">{children}</code>;
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-1 border-l border-ink/10 pl-4">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-ink/45">
                On this page
              </div>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1 text-sm text-ink/65 transition hover:text-coral"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink/60">
              <BookOpen className="h-3 w-3" /> Documentation
            </div>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-5xl">
              Tagify Documentation
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink/65">
              Everything you need to set up a Tagify Gateway workspace, deploy an sGTM container,
              point your custom domain, and start streaming first-party events to Meta, GA4, TikTok
              and Snapchat.
            </p>

            <section className="mt-10 space-y-4 text-ink/75 leading-relaxed">
              <H2 id="intro">Introduction</H2>
              <p>Tagify gives you two complementary products under one dashboard:</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink/10 bg-background p-5">
                  <Database className="h-5 w-5 text-coral" />
                  <h4 className="mt-3 font-display font-medium">Tagify Gateway</h4>
                  <p className="mt-2 text-sm text-ink/65">
                    Drop in one script, fire <Code>Tagify(&apos;track&apos;, …)</Code> calls — we
                    fan events out to Meta CAPI, TikTok, Snapchat and GA4 from your first-party
                    domain.
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-background p-5">
                  <ServerCog className="h-5 w-5 text-coral" />
                  <h4 className="mt-3 font-display font-medium">Tagify sGTM</h4>
                  <p className="mt-2 text-sm text-ink/65">
                    Fully managed Google Server-Side GTM. Paste your container config, attach a
                    custom domain, enable the stealth Custom Loader.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <H2 id="choose">Which one should I use?</H2>
              <ul className="list-disc space-y-2 pl-6 text-ink/70">
                <li>
                  <strong>Gateway</strong> — fastest path. No GTM knowledge needed. Best for stores
                  that want Meta/TikTok/Snapchat/GA4 server-side without learning sGTM.
                </li>
                <li>
                  <strong>sGTM</strong> — full control with Google Tag Manager templates. Best if
                  you already work in GTM web + server containers.
                </li>
                <li>
                  You can run both at the same time — for example, Gateway for ad platforms and sGTM
                  for your GA4 / Google Ads tagging.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <H2 id="account">Create an account</H2>
              <p className="text-ink/70">
                Sign up at{" "}
                <Link href="/signup" className="text-coral underline">
                  /signup
                </Link>
                , verify your email, then open the dashboard. From the left nav you&apos;ll see{" "}
                <em>Gateway</em> and <em>Containers</em> — the two flows the rest of these docs
                cover.
              </p>
            </section>

            <H2 id="gateway" icon={Database}>
              Tagify Gateway
            </H2>

            <H3 id="gw-create">1. Create a Gateway workspace</H3>
            <p className="mt-2 text-ink/70">
              In the dashboard go to <strong>Gateway → New Gateway</strong>. Give it a name (e.g.{" "}
              <em>main-store</em>). When it&apos;s created you&apos;ll see two values you&apos;ll
              need:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-ink/70">
              <li>
                <strong>Pixel Key</strong> — identifies your workspace
              </li>
              <li>
                <strong>Tracking Domain</strong> — defaults to <Code>app.tagify.top</Code> until you
                attach your own custom domain
              </li>
            </ul>

            <H3 id="gw-install">2. Install on a custom website</H3>
            <p className="mt-2 text-ink/70">
              Open your Gateway and click <em>Install → Custom Website</em>. The snippet has your
              real <Code>pixelKey</Code> and <Code>trackingDomain</Code> pre-filled. Paste it into{" "}
              <Code>&lt;head&gt;</Code> on every page (or in GTM as a Custom HTML tag firing on All
              Pages).
            </p>
            <CodeBlock code={installSnippet} />
            <p className="mt-2 text-sm text-ink/65">
              This loads <Code>tagify.js</Code>, initialises the queue, and fires{" "}
              <Code>page_view</Code> on every page. Any <Code>Tagify(&apos;track&apos;, …)</Code>{" "}
              calls made before the script finishes loading are queued and replayed.
            </p>

            <H3 id="gw-shopify">3. Shopify pixel install</H3>
            <p className="mt-2 text-ink/70">
              For Shopify, open your Gateway and click <em>Install → Shopify Pixel</em>. Copy the
              full pixel script and paste it into{" "}
              <em>Shopify Admin → Customer events → Add custom pixel</em>. The script subscribes to{" "}
              <Code>checkout_completed</Code>, <Code>product_added_to_cart</Code> and the other
              standard Shopify Analytics events automatically. Klaviyo lead capture is included as
              an optional block at the bottom.
            </p>

            <H3 id="gw-wordpress">3b. WordPress &amp; WooCommerce install</H3>
            <p className="mt-2 text-ink/70">
              We ship an official <strong>Tagify WordPress plugin</strong> that installs the Gateway
              snippet and auto-tracks WooCommerce events — no theme edits, no code.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-ink/70">
              <li>
                Open your Gateway and click <em>Install → WordPress</em>. Download the{" "}
                <Code>tagify.zip</Code> plugin file.
              </li>
              <li>
                In WP Admin go to <em>Plugins → Add New → Upload Plugin</em>, choose the zip,
                install and activate.
              </li>
              <li>
                Open <em>Settings → Tagify</em>, paste your <strong>Pixel Key</strong> and{" "}
                <strong>Tracking Domain</strong> (both shown in your Gateway workspace), then save.
              </li>
            </ol>
            <p className="mt-3 text-ink/70">
              That&apos;s it. The plugin injects the Gateway loader site-wide and, if WooCommerce is
              detected, automatically fires <Code>view_item</Code>, <Code>add_to_cart</Code>,{" "}
              <Code>begin_checkout</Code> and <Code>purchase</Code> with the right{" "}
              <Code>user_data</Code> and <Code>ecommerce</Code> payload.
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Need a custom event from a WordPress page or block? Just call{" "}
              <Code>Tagify(&apos;track&apos;, &apos;&lt;event_name&gt;&apos;, {`{ … }`})</Code> from
              any Custom HTML block — the loader is already on the page.
            </p>

            <H3 id="gw-events">4. Track events</H3>
            <p className="mt-2 text-ink/70">
              Once the snippet is loaded, fire events with{" "}
              <Code>Tagify(&apos;track&apos;, &apos;&lt;event_name&gt;&apos;, payload)</Code>. The
              same payload is forwarded to every configured receiver. Payload shape:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-ink/70">
              <li>
                <Code>user_data</Code> — identifiers (email, phone, name, address, click IDs).
                Hashed automatically before send.
              </li>
              <li>
                <Code>ecommerce</Code> — transaction-level fields (<Code>transaction_id</Code>,{" "}
                <Code>value</Code>, <Code>currency</Code>, <Code>items[]</Code>).
              </li>
              <li>
                <Code>custom_data</Code> — anything else you want to forward (search term, video
                title, plan name…).
              </li>
            </ul>
            <p className="mt-4 text-sm font-medium">Purchase</p>
            <CodeBlock lang="js" code={purchaseSnippet} />
            <p className="mt-4 text-sm font-medium">Lead</p>
            <CodeBlock lang="js" code={leadSnippet} />

            <H3 id="gw-custom-events">Custom events</H3>
            <p className="mt-2 text-sm text-ink/70">
              Anything that isn&apos;t a standard event becomes a custom event — pass your own{" "}
              <Code>event_name</Code> (lowercase, <Code>snake_case</Code>) and put your fields under{" "}
              <Code>custom_data</Code>. You can mix <Code>user_data</Code> in to keep match quality
              high.
            </p>
            <CodeBlock lang="js" code={customSnippet} />
            <p className="mt-2 text-sm text-ink/65">
              Custom events are forwarded to every receiver that accepts them (Meta CAPI &amp;
              TikTok Events API map them as <em>Custom</em> events; GA4 receives them as regular
              events with the same name). For the full list of standard event names, see the{" "}
              <a href="#event-reference" className="text-coral underline">
                event reference
              </a>{" "}
              below.
            </p>

            <H3 id="gw-receivers">5. Configure receivers</H3>
            <p className="mt-2 text-ink/70">
              Inside your Gateway, open the <em>Receivers</em> section and toggle on the
              destinations you want. For each one provide:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-ink/70">
              <li>
                <strong>Meta Conversions API</strong> — Pixel ID + Access Token (+ optional Test
                Event Code)
              </li>
              <li>
                <strong>TikTok Events API</strong> — Pixel ID + Access Token (+ optional Test Event
                Code)
              </li>
              <li>
                <strong>Snapchat Conversions API</strong> — Pixel ID + Access Token
              </li>
              <li>
                <strong>Google Analytics 4</strong> — Measurement ID + API Secret
              </li>
            </ul>
            <p className="mt-2 text-ink/70">
              Click <em>Save</em>. Events fired by your snippet immediately start fanning out to
              every saved receiver.
            </p>

            <H3 id="gw-domain">6. Custom domain &amp; DNS (Gateway)</H3>
            <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-ink/80">
              <strong>Pick an obscure subdomain.</strong> Browsers and ad-blockers (uBlock, Brave,
              AdGuard) actively block hosts with tracking-related words. Avoid <Code>track</Code>,{" "}
              <Code>sgtm</Code>, <Code>gtm</Code>, <Code>gtag</Code>, <Code>analytics</Code>,{" "}
              <Code>metrics</Code>, <Code>pixel</Code>, <Code>ads</Code>, <Code>tracking</Code>.
              Prefer short, neutral hosts like <Code>c.yourdomain.com</Code>,{" "}
              <Code>s.yourdomain.com</Code>, <Code>link.yourdomain.com</Code>,{" "}
              <Code>hub.yourdomain.com</Code> or <Code>edge.yourdomain.com</Code>.
            </div>
            <p className="mt-3 text-ink/70">
              In your Gateway settings, enter a subdomain like <Code>c.yourdomain.com</Code> and
              save. Then create the DNS record:
            </p>
            <CodeBlock lang="text" code={`CNAME  c.yourdomain.com  →  app.tagify.top`} />
            <p className="mt-2 text-ink/70">
              Click <em>Verify DNS</em>. Verification typically completes in 1–5 minutes; the
              dashboard polls automatically. Once verified, swap the <Code>trackingDomain</Code> in
              your install snippet to your new custom domain. TLS is issued automatically.
            </p>

            <H2 id="sgtm" icon={ServerCog}>
              Tagify sGTM
            </H2>

            <H3 id="sgtm-deploy">1. Deploy a container</H3>
            <p className="mt-2 text-ink/70">
              Go to <strong>Containers → New Container</strong> and fill in:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-ink/70">
              <li>
                <strong>Name</strong> — any friendly label
              </li>
              <li>
                <strong>Container Config String</strong> — the Base64 config from your GTM Server
                container (<em>GTM web UI → Admin → Container Settings</em>)
              </li>
              <li>
                <strong>Region</strong> — US East, US West, EU West, or Asia Pacific
              </li>
            </ul>
            <p className="mt-2 text-ink/70">
              Click <em>Deploy</em>. The status starts as{" "}
              <span className="font-medium text-amber-600">Provisioning</span> and flips to{" "}
              <span className="font-medium text-emerald-600">Active</span> automatically when the
              tagging server is ready — usually within 30–60 seconds.
            </p>

            <H3 id="sgtm-settings">2. Container settings</H3>
            <p className="mt-2 text-ink/70">Open the container to see:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-ink/70">
              <li>
                <strong>Container Identifier</strong> — your unique random subdomain
              </li>
              <li>
                <strong>Tagging Server URL</strong> —{" "}
                <Code>https://&lt;identifier&gt;.tagify.top</Code> (or your custom domain once
                active)
              </li>
              <li>
                <strong>API Key</strong> — used by the GTM Server preview/debug mode
              </li>
              <li>
                <strong>Requests Used / Limit</strong> — your plan&apos;s monthly quota
              </li>
            </ul>

            <H3 id="sgtm-domain">3. Custom domain &amp; DNS (sGTM)</H3>
            <p className="mt-2 text-ink/70">
              In the container&apos;s <em>Custom Domain</em> card, enter an obscure subdomain like{" "}
              <Code>s.yourdomain.com</Code> (avoid <Code>sgtm</Code>, <Code>gtm</Code>,{" "}
              <Code>analytics</Code> — they get blocked) and save. Then create:
            </p>
            <CodeBlock
              lang="text"
              code={`CNAME  s.yourdomain.com  →  <your-container-identifier>.tagify.top`}
            />
            <p className="mt-2 text-ink/70">
              The dashboard auto-polls DNS every 30 seconds (5 attempts). You can also press{" "}
              <em>Check DNS</em> to verify manually. When the badge turns{" "}
              <span className="font-medium text-emerald-600">Active</span>, set this domain as the{" "}
              <em>Server container URL</em> inside your GTM web container so your tags start using
              it.
            </p>

            <H3 id="sgtm-loader">4. Power-Ups — Stealth Custom Loader</H3>
            <p className="mt-2 text-ink/70">
              Inside the container, switch to the <em>Power-Ups</em> tab and open{" "}
              <strong>Custom Loader</strong>. This serves a stealth, first-party loader file (
              <Code>&lt;random&gt;.min.js</Code>) so that GTM survives Brave, uBlock and Safari ITP.
              Paste your GTM Web Container ID (format <Code>GTM-XXXXXXX</Code>) and click{" "}
              <em>Save &amp; Generate Code</em>.
            </p>
            <p className="mt-2 text-ink/70">
              Replace your existing Google Tag Manager snippet on every page with the two snippets
              below (your saved version inside the dashboard already has the placeholders filled
              in).
            </p>
            <p className="mt-4 text-sm font-medium">Head snippet</p>
            <CodeBlock code={sgtmHead} />
            <p className="mt-4 text-sm font-medium">
              Body snippet (right after <Code>&lt;body&gt;</Code>)
            </p>
            <CodeBlock code={sgtmBody} />

            <H2 id="dns" icon={Globe}>
              Custom Domains — DNS reference
            </H2>

            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-ink/80">
              <p className="font-medium">Choosing a subdomain</p>
              <p className="mt-1">
                Use short, obscure hostnames so browsers and ad-blockers don&apos;t filter your
                traffic. Avoid <Code>track</Code>, <Code>sgtm</Code>, <Code>gtm</Code>,{" "}
                <Code>gtag</Code>, <Code>analytics</Code>, <Code>metrics</Code>, <Code>pixel</Code>,{" "}
                <Code>ads</Code>, <Code>tracking</Code>, <Code>tag</Code>. Good examples:{" "}
                <Code>c</Code>, <Code>s</Code>, <Code>e</Code>, <Code>link</Code>, <Code>hub</Code>,{" "}
                <Code>edge</Code>, <Code>api</Code>.
              </p>
            </div>

            <H3 id="dns-gateway">CNAME for Gateway</H3>
            <CodeBlock
              lang="text"
              code={`Type   Host                Target
CNAME  c.yourdomain.com    app.tagify.top`}
            />

            <H3 id="dns-sgtm">CNAME for sGTM</H3>
            <CodeBlock
              lang="text"
              code={`Type   Host                Target
CNAME  s.yourdomain.com    <your-container-identifier>.tagify.top`}
            />

            <H3 id="dns-multi-domain">
              Multi-domain system{" "}
              <span className="ml-2 rounded-full bg-coral-soft px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-widest text-coral">
                Pro
              </span>
            </H3>
            <p className="mt-2 text-ink/70">
              Pro plans can attach up to <strong>3 verified custom domains</strong> to a single
              Gateway or sGTM container. Each domain points at the same workspace, so events from{" "}
              <Code>c.brandA.com</Code>, <Code>c.brandB.com</Code> and <Code>c.brandC.com</Code> all
              land in one place — perfect for multi-brand, multi-region, or staging-vs-production
              setups.
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-ink/70">
              <li>
                Add each domain in <em>Gateway → Tracking Domain</em> or{" "}
                <em>Container → Custom Domain</em>, one CNAME each.
              </li>
              <li>
                In the Custom Loader install snippet you can switch which verified domain is used
                per website.
              </li>
              <li>
                All verified domains stay active simultaneously — no need to choose a primary.
              </li>
            </ul>

            <H3 id="dns-troubleshoot">Troubleshooting</H3>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-ink/70">
              <li>
                Use a &quot;host-only&quot; CNAME (e.g. <Code>c</Code>), not the apex of your
                domain.
              </li>
              <li>
                Disable proxying (orange cloud) in Cloudflare during verification, then re-enable
                after Active.
              </li>
              <li>
                DNS can take up to 30 minutes globally. If <em>Check DNS</em> fails, wait and retry.
              </li>
              <li>
                Quick test from your terminal: <Code>dig CNAME c.yourdomain.com +short</Code>.
              </li>
            </ul>

            <H2 id="event-reference" icon={Zap}>
              Gateway event reference
            </H2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-sm">
                <thead className="bg-cream text-left font-mono text-[11px] uppercase tracking-widest text-ink/55">
                  <tr>
                    <th className="p-3">Event name</th>
                    <th className="p-3">Use case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {EVENTS.map(([e, u]) => (
                    <tr key={e}>
                      <td className="p-3 font-mono text-ink">{e}</td>
                      <td className="p-3 text-ink/65">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-ink/10 bg-cream p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-coral-soft text-coral">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium">Need help?</h3>
                  <p className="text-sm text-ink/65">
                    Our team replies within a few hours, every business day.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-4 py-2 text-sm font-medium text-ink hover:border-ink/30"
                >
                  Read FAQ
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:bg-coral"
                >
                  Contact support <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
