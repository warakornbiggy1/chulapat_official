/* =========================================================
   CHULAPAT_OFFICIAL — Instagram post embeds (Our Post page)
   Uses Instagram's OFFICIAL embed (embed.js). No backend, no API key.

   👉 HOW TO ADD A POST:
      1. Open the post/reel on Instagram.
      2. Tap the "⋯" (or "Share") menu → "Copy link".
      3. Paste the link as a new line inside IG_POSTS below (keep the quotes + comma).
      4. Save. That's it — the post renders automatically on ourpost.html.

   Accepts links like:
      https://www.instagram.com/p/XXXXXXXXX/
      https://www.instagram.com/reel/XXXXXXXXX/
      https://www.instagram.com/tv/XXXXXXXXX/
   ========================================================= */
(function () {
  "use strict";

  var IG_POSTS = [
    "https://www.instagram.com/p/DZkvA2Mkt0W/",
    "https://www.instagram.com/p/DZckLLskvcC/",
    "https://www.instagram.com/p/DZZMVW_yE9e/",
    "https://www.instagram.com/p/DZZLobdS8zC/",
    "https://www.instagram.com/p/DZWi0qaSq6-/",
    "https://www.instagram.com/p/DZWiWW-ywkC/",
    "https://www.instagram.com/p/DZWhv4Ty6X-/",
    "https://www.instagram.com/p/DZTohTHyIGO/",
    "https://www.instagram.com/p/DZTn72vSuGu/",
    "https://www.instagram.com/p/DZTnuGDSkAe/",
    "https://www.instagram.com/p/DZRaYKJyrrR/",
    "https://www.instagram.com/p/DZRaRk5Suy4/",
    "https://www.instagram.com/p/DZRaGjHSJb-/",
    "https://www.instagram.com/p/DYloB3fklcV/",
  ];

  var VALID = /^https:\/\/www\.instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/;

  function buildEmbed(url) {
    var bq = document.createElement("blockquote");
    bq.className = "instagram-media";
    bq.setAttribute("data-instgrm-permalink", url);
    bq.setAttribute("data-instgrm-version", "14");
    bq.style.background = "#000";
    bq.style.border = "0";
    bq.style.borderRadius = "16px";
    bq.style.margin = "0";
    bq.style.width = "100%";
    bq.style.maxWidth = "540px";

    // Graceful fallback link (shown before embed.js upgrades it)
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "View this post on Instagram";
    a.style.color = "#FFB84D";
    a.style.display = "block";
    a.style.padding = "20px";
    bq.appendChild(a);
    return bq;
  }

  function processEmbeds() {
    if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
      window.instgrm.Embeds.process();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var feed = document.getElementById("ig-feed");
    var empty = document.getElementById("ig-empty");
    if (!feed) return;

    var urls = IG_POSTS.filter(function (u) { return typeof u === "string" && VALID.test(u.trim()); });

    if (!urls.length) {
      if (empty) empty.style.display = "block";
      return;
    }
    if (empty) empty.style.display = "none";

    urls.forEach(function (u) {
      var card = document.createElement("div");
      card.className = "ig-card";
      card.appendChild(buildEmbed(u.trim()));
      feed.appendChild(card);
    });

    // Process now if embed.js already loaded, and again once it finishes loading.
    processEmbeds();
    window.addEventListener("load", processEmbeds);
  });
})();
