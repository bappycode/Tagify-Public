(function (window, document) {
  // 1. Capture the queue if the async HTML snippet loaded before this file
  const existingQueue =
    typeof window.Tagify === "function" && window.Tagify.q ? window.Tagify.q : [];

  // Helper: UUID Generator
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Helper: Session ID — persists for the lifetime of the browser tab, resets on new tab/close
  function getSessionId() {
    try {
      var sid = sessionStorage.getItem("_tg_sid");
      if (!sid) {
        sid = Date.now().toString();
        sessionStorage.setItem("_tg_sid", sid);
      }
      return sid;
    } catch (e) {
      return Date.now().toString();
    }
  }

  // Helper: Cookie & LocalStorage Setter
  function tgSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
    var d = new Date();
    d.setTime(d.getTime() + 90 * 24 * 60 * 60 * 1000);
    document.cookie =
      k + "=" + encodeURIComponent(v) + "; expires=" + d.toUTCString() + "; path=/; SameSite=Lax";
  }

  // Helper: Cookie & LocalStorage Getter
  function tgGet(k) {
    var name = k + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) === 0) return decodeURIComponent(c.substring(name.length, c.length));
    }
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }

  // 2. THE HARVESTER (Extracts URL parameters, cookies, and local storage)
  function getGlobalUser() {
    var ud = {};
    var params = new URLSearchParams(window.location.search);

    try {
      var stored = localStorage.getItem("_tg_user_data");
      if (stored) Object.assign(ud, JSON.parse(stored));
    } catch (e) {}

    if (params.has("ttclid")) tgSet("_tg_ttclid", params.get("ttclid"));
    if (params.has("ScCid") || params.has("sccid"))
      tgSet("_tg_sccid", params.get("ScCid") || params.get("sccid"));
    if (params.has("gclid")) tgSet("_tg_gclid", params.get("gclid"));
    if (params.has("fbclid")) tgSet("_tg_fbc", "fb.1." + Date.now() + "." + params.get("fbclid"));

    if (!tgGet("_tg_fbp"))
      tgSet("_tg_fbp", "fb.1." + Date.now() + "." + Math.round(Math.random() * 2147483647));
    if (!tgGet("_tg_ttp"))
      tgSet(
        "_tg_ttp",
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      );
    if (!tgGet("_tg_scid")) tgSet("_tg_scid", generateUUID());
    if (!tgGet("_tg_client_id")) tgSet("_tg_client_id", generateUUID());

    ud.ttclid = tgGet("_tg_ttclid");
    ud.ttp = tgGet("_tg_ttp");
    ud.fbc = tgGet("_tg_fbc");
    ud.fbp = tgGet("_tg_fbp");
    ud.sccid = tgGet("_tg_sccid");
    ud.scid = tgGet("_tg_scid");
    ud.gclid = tgGet("_tg_gclid");
    ud.client_id = tgGet("_tg_client_id");

    return ud;
  }

  // 3. MASTER TAGIFY OBJECT (Preserves your existing architecture)
  const Tagify = {
    config: { pixelKey: null, endpoint: "" },

    init: function (pixelKey, options = {}) {
      if (!pixelKey) return console.error("Tagify: Pixel Key required.");
      this.config.pixelKey = pixelKey;

      // Auto-detect the custom domain it was loaded from to defeat adblockers
      const scriptSrc = document.currentScript
        ? document.currentScript.src
        : window.location.origin;
      const domain = new URL(scriptSrc).origin;
      this.config.endpoint = options.endpoint || `${domain}/v1/e`;
    },

    track: function (eventName, ecommerceData = {}, explicitUserData = {}) {
      // Fallback for Salla and Async configs
      if (!this.config.pixelKey && window.TagifyConfig) {
        this.config.pixelKey = window.TagifyConfig.pixelKey;
        this.config.endpoint = window.TagifyConfig.endpoint || `${window.location.origin}/v1/e`;
      }

      if (!this.config.pixelKey) return console.warn("Tagify: Not initialized.");

      // Harvest global cookies/localStorage
      const globalUser = getGlobalUser();

      // Merge explicit data (e.g., from WordPress or Salla) securely into the vault
      if (explicitUserData && Object.keys(explicitUserData).length > 0) {
        Object.assign(globalUser, explicitUserData);
        try {
          localStorage.setItem(
            "_tg_user_data",
            JSON.stringify({
              em: globalUser.em,
              ph: globalUser.ph,
              fn: globalUser.fn,
              ln: globalUser.ln,
              ct: globalUser.ct,
              st: globalUser.st,
              zp: globalUser.zp,
              country: globalUser.country,
            }),
          );
        } catch (e) {}
      }

      const payload = {
        event_name: eventName,
        event_id: "tgf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        event_time: Math.floor(Date.now() / 1000),
        session_id: getSessionId(),
        event_source_url: window.location.href,
        user_data: globalUser,
        ecommerce: ecommerceData,
      };

      // Modern Fetch with Keepalive ensures Chrome Extensions can read the payload
      fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tg-key": this.config.pixelKey },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => {});
    },
  };

  // 4. INITIALIZE & EXPOSE
  if (window.TagifyConfig && window.TagifyConfig.pixelKey) {
    Tagify.init(window.TagifyConfig.pixelKey, { endpoint: window.TagifyConfig.endpoint });
  }

  // Expose the real Tagify object, replacing the temporary async queue
  window.Tagify = Tagify;

  // 5. PROCESS THE QUEUE
  if (existingQueue && existingQueue.length > 0) {
    existingQueue.forEach(function (args) {
      if (args[0] === "track") {
        Tagify.track(args[1], args[2], args[3]);
      }
    });
  }
})(window, document);
