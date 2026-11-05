(() => {
  "use strict";
  const notice = document.querySelector("#cookieNotice");
  const dismiss = document.querySelector("#cookieNoticeDismiss");
  const key = "nadi-cookie-notice-v1";
  if (!notice || !dismiss) return;
  let acknowledged = false;
  try { acknowledged = sessionStorage.getItem(key) === "dismissed"; } catch (_) {}
  notice.hidden = acknowledged;
  dismiss.addEventListener("click", () => {
    notice.hidden = true;
    try { sessionStorage.setItem(key, "dismissed"); } catch (_) {}
  });
})();
