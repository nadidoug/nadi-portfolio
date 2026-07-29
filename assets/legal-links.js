/* ============================================================
   legal-links.js — single source of truth for footer legal links.
   Any element with [data-legal-links] gets the current link set
   rendered into it. Set data-legal-root to the relative path back
   to the repo root ("" for top-level pages, "../" for /policies/).

   Pages keep static fallback links in the HTML so footers still
   work without JavaScript; this script simply overwrites them, so
   future link changes only need to be made in the LINKS array
   below (and will appear everywhere on the next page load).
   ============================================================ */
(function () {
  "use strict";

  var LINKS = [
    { href: "policies/privacy.html",       label: "Privacy Policy" },
    { href: "policies/terms.html",         label: "Terms of Service" },
    { href: "policies/accessibility.html", label: "Accessibility" },
    { href: "policies/disclaimer.html",    label: "Disclaimer" }
  ];

  function render() {
    var targets = document.querySelectorAll("[data-legal-links]");
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      var root = el.getAttribute("data-legal-root") || "";
      el.textContent = "";
      for (var j = 0; j < LINKS.length; j++) {
        var a = document.createElement("a");
        a.href = root + LINKS[j].href;
        a.textContent = LINKS[j].label;
        el.appendChild(a);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
