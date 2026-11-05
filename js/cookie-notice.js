(() => {
  "use strict";
  const notice = document.querySelector("#cookieNotice");
  if (!notice) return;
  const key = "nadi-cookie-consent-v2";
  const endpoint = "https://yattojbkdupvahegedzv.supabase.co/functions/v1/portfolio-submit";
  const pendingKey = "nadi-cookie-consent-pending-v1";
  const browserKey = "nadi-cookie-browser-id";
  let choice = null;
  let pending = null;
  let syncing = false;
  try { pending = JSON.parse(localStorage.getItem(pendingKey)); } catch (_) {}
  async function syncConsent() {
    if (!pending || syncing) return;
    const record = pending;
    syncing = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record), keepalive: true
      });
      if (!response.ok) return;
      if (pending?.id === record.id) {
        pending = null;
        try { localStorage.removeItem(pendingKey); } catch (_) {}
      }
    } catch (_) {
      // Keep the latest choice for the next visit or network reconnection.
    } finally {
      syncing = false;
      if (pending && pending.id !== record.id) void syncConsent();
    }
  }
  function recordConsent(value) {
    let browserId;
    try { browserId = localStorage.getItem(browserKey); } catch (_) {}
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuid.test(browserId || "")) browserId = crypto.randomUUID();
    try { localStorage.setItem(browserKey, browserId); } catch (_) {}
    pending = {
      type: "cookie-consent", id: crypto.randomUUID(), browser_id: browserId,
      choice: value, policy_version: "2026-11-05", decided_at: new Date().toISOString()
    };
    try { localStorage.setItem(pendingKey, JSON.stringify(pending)); } catch (_) {}
    void syncConsent();
  }
  window.addEventListener("online", syncConsent);
  void syncConsent();
  try {
    const stored = localStorage.getItem(key);
    if (stored === "accepted" || stored === "rejected") choice = stored;
  } catch (_) {}
  const open = () => {
    notice.hidden = false;
    document.querySelector("#cookieAccept").focus();
  };
  window.cookieConsent = { allowsOptional: () => choice === "accepted", open };
  notice.hidden = choice !== null;
  function save(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    notice.hidden = true;
    window.dispatchEvent(new CustomEvent("cookieconsentchange"));
    recordConsent(value);
  }
  document.querySelector("#cookieAccept").addEventListener("click", () => save("accepted"));
  document.querySelector("#cookieReject").addEventListener("click", () => save("rejected"));
  document.querySelectorAll("[data-cookie-settings]").forEach(button => button.addEventListener("click", open));
})();
