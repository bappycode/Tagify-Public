/**
 * Tagify Browser Tracking for Salla Stores
 * Loaded via App Snippets — do not edit directly
 */
(function () {
  "use strict";

  var CONFIG_URL = "https://app.tagify.top/v1/salla/config";
  var EVENT_URL = "https://app.tagify.top/v1/e";
  var SESSION_KEY = "_tg_pk";
  var CLIENT_KEY = "_tg_cid";

  var state = { pixelKey: null, started: false, pageViewSent: false };

  // ── Persistent client ID ────────────────────────────────────────────────────
  function getClientId() {
    try {
      var id = localStorage.getItem(CLIENT_KEY);
      if (!id) {
        id = "sc_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        localStorage.setItem(CLIENT_KEY, id);
      }
      return id;
    } catch (e) {
      return "sc_" + Math.random().toString(36).slice(2);
    }
  }

  // ── Customer data injected by Salla Liquid template ─────────────────────────
  // window._tg_salla_user = { em, ph, name } — set by App Snippet
  // Empty strings mean the customer is not logged in — filter them out.
  function getUserData() {
    var ud = { client_id: getClientId() };
    var su = window._tg_salla_user;
    if (!su) return ud;

    if (su.em && su.em.indexOf("@") !== -1) ud.em = su.em.trim().toLowerCase();
    if (su.ph && su.ph.length > 3) ud.ph = su.ph.trim();
    if (su.name && su.name.trim().length > 0) {
      var parts = su.name.trim().split(/\s+/);
      ud.fn = parts[0];
      if (parts.length > 1) ud.ln = parts.slice(1).join(" ");
    }
    return ud;
  }

  // ── Merchant ID detection ───────────────────────────────────────────────────
  function getMerchantId() {
    // Set by App Snippet template variable
    if (window._tg_salla_merchant) return String(window._tg_salla_merchant);
    // Salla SDK globals
    if (window.salla) {
      var s = window.salla;
      if (s.config) {
        if (s.config.merchant_id) return String(s.config.merchant_id);
        if (s.config.store && s.config.store.id) return String(s.config.store.id);
      }
      if (s.store && s.store.id) return String(s.store.id);
    }
    return null;
  }

  // ── Event sender ────────────────────────────────────────────────────────────
  function send(eventName, extra) {
    if (!state.pixelKey) return;
    var payload = {
      pixel_key: state.pixelKey,
      event_name: eventName,
      event_id: "sc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: location.href,
      page_title: document.title,
      page_referrer: document.referrer || undefined,
      user_data: getUserData(),
    };
    if (extra) {
      if (extra.ecommerce) payload.ecommerce = extra.ecommerce;
      if (extra.search_term) payload.custom_data = { search_term: extra.search_term };
    }
    try {
      var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(EVENT_URL, blob);
      } else {
        fetch(EVENT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch (e) {}
  }

  // ── Product data from page ──────────────────────────────────────────────────
  function getProductFromPage() {
    // Try JSON-LD structured data first
    try {
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < scripts.length; i++) {
        var data = JSON.parse(scripts[i].textContent);
        if (data["@type"] === "Product") {
          var offer = Array.isArray(data.offers) ? data.offers[0] : data.offers || {};
          return {
            item_id: String(data.productID || data.sku || data.identifier || ""),
            price: Number(offer.price || 0),
            name: data.name || "",
          };
        }
      }
    } catch (e) {}
    // Fallback: data attributes on product components
    var el =
      document.querySelector("[data-product-id]") ||
      document.querySelector("[data-id][data-price]");
    if (el) {
      return {
        item_id: String(el.dataset.productId || el.dataset.id || ""),
        price: Number(el.dataset.price || el.dataset.productPrice || 0),
        name: el.dataset.productName || el.dataset.name || "",
      };
    }
    return null;
  }

  // ── URL-based page detection ────────────────────────────────────────────────
  var path = location.pathname;

  function isProductPage() {
    return /\/(products?|p)\//i.test(path);
  }
  function isCartPage() {
    return /\/(cart|bag|سلة)\/?$/i.test(path);
  }
  function isCheckoutPage() {
    return /\/(checkout|pay|order|طلب)/i.test(path);
  }

  // ── Salla SDK event listeners ───────────────────────────────────────────────
  function on(names, handler) {
    if (!window.salla || !salla.event || typeof salla.event.on !== "function") return;
    names.forEach(function (name) {
      try {
        salla.event.on(name, handler);
      } catch (e) {}
    });
  }

  function attachSallaEvents() {
    // Add to cart
    on(["cart:item.add", "cart.item.add", "cart:add", "cart.add", "addToCart"], function (res) {
      var item = (res && res.data) || res || {};
      send("add_to_cart", {
        ecommerce: {
          value: Number(item.price || 0),
          currency: item.currency || "SAR",
          items: [
            {
              item_id: String(item.product_id || item.id || ""),
              price: Number(item.price || 0),
              quantity: parseInt(item.quantity) || 1,
            },
          ],
        },
      });
    });

    // Remove from cart
    on(["cart:item.remove", "cart.item.remove", "cart:remove", "cart.remove"], function (res) {
      var item = (res && res.data) || res || {};
      send("remove_from_cart", {
        ecommerce: {
          items: [
            {
              item_id: String(item.product_id || item.id || ""),
              price: Number(item.price || 0),
              quantity: parseInt(item.quantity) || 1,
            },
          ],
        },
      });
    });

    // View cart (drawer opened)
    on(
      ["cart:show", "cart.show", "cart:open", "cart.open", "cart:fetch", "cart.fetch"],
      function () {
        send("view_cart");
      },
    );

    // Begin checkout
    on(
      ["checkout:start", "checkout.start", "order:checkout", "order.checkout", "checkout:load"],
      function () {
        send("begin_checkout");
      },
    );

    // Search
    on(
      [
        "search:result",
        "search.result",
        "search:query",
        "search.query",
        "search:perform",
        "search.perform",
      ],
      function (res) {
        var q =
          res && (res.query || res.keyword || (res.data && (res.data.query || res.data.keyword)));
        if (q) send("search", { search_term: String(q) });
      },
    );

    // Product view via Salla event (fires on some themes)
    on(["product:view", "product.view", "product:fetched", "product.fetched"], function (res) {
      var p = (res && res.data) || res || {};
      send("view_item", {
        ecommerce: {
          items: [{ item_id: String(p.id || ""), price: Number(p.price || 0), quantity: 1 }],
        },
      });
    });
  }

  // ── Main tracking logic ─────────────────────────────────────────────────────
  function startTracking() {
    if (state.started) return;
    state.started = true;

    // page_view — always
    if (!state.pageViewSent) {
      state.pageViewSent = true;
      send("page_view");
    }

    // view_item — product pages
    if (isProductPage()) {
      var product = getProductFromPage();
      send("view_item", {
        ecommerce: product
          ? {
              items: [{ item_id: product.item_id, price: product.price, quantity: 1 }],
            }
          : {},
      });
    }

    // view_cart — cart page
    if (isCartPage()) send("view_cart");

    // begin_checkout — checkout page
    if (isCheckoutPage()) send("begin_checkout");

    // search — URL query string
    var params = new URLSearchParams(location.search);
    var q = params.get("q") || params.get("search") || params.get("keyword") || params.get("s");
    if (q) send("search", { search_term: q });

    // Attach Salla SDK event listeners
    attachSallaEvents();
  }

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  function fetchConfigAndStart(merchantId) {
    try {
      var cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        state.pixelKey = cached;
        startTracking();
        return;
      }
    } catch (e) {}

    fetch(CONFIG_URL + "?merchant=" + encodeURIComponent(merchantId))
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (data && data.pixel_key) {
          try {
            sessionStorage.setItem(SESSION_KEY, data.pixel_key);
          } catch (e) {}
          state.pixelKey = data.pixel_key;
          startTracking();
        }
      })
      .catch(function () {});
  }

  function boot() {
    var merchantId = getMerchantId();
    if (merchantId) {
      fetchConfigAndStart(merchantId);
    } else {
      // Salla SDK may not be ready yet — retry once after 800ms
      setTimeout(function () {
        merchantId = getMerchantId();
        if (merchantId) fetchConfigAndStart(merchantId);
      }, 800);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
