/* =========================================================
   CHULAPAT_OFFICIAL — Our Post feed
   Self-hosted post cards. No Instagram embed, no third-party script, no
   iframe — the official embed renders inside a cross-origin frame whose white
   chrome cannot be styled from out here, and it forced a relaxed CSP on this
   one page. These are our own dark cards, and ourpost.html now runs the same
   strict CSP as every other page.

   👉 HOW TO ADD A POST — one line:

        { url: "https://www.instagram.com/p/XXXXXXXXX/" },

      Add the rest as you get it. All optional:

        {
          url:     "https://www.instagram.com/p/XXXXXXXXX/",
          image:   "assets/posts/XXXXXXXXX.jpg",  // square crops look best
          alt:     "What the photo shows",
          caption: "The line that runs under the card",
          date:    "12 Mar 2026"
        }

   Until `image` is filled in, the card shows a dark contact-sheet plate — the
   ghosted emblem plus the post's shortcode as a frame number. It still links
   to the real post, so nothing is broken while the images are pending.

   Images must live under public/assets/ — the CSP is `img-src 'self'`, so
   hotlinking Instagram's CDN will be blocked.
   ========================================================= */
(function () {
  "use strict";

  var IG_POSTS = [
    { url: "https://www.instagram.com/p/DZkvA2Mkt0W/" },
    { url: "https://www.instagram.com/p/DZckLLskvcC/" },
    { url: "https://www.instagram.com/p/DZZMVW_yE9e/" },
    { url: "https://www.instagram.com/p/DZZLobdS8zC/" },
    { url: "https://www.instagram.com/p/DZWi0qaSq6-/" },
    { url: "https://www.instagram.com/p/DZWiWW-ywkC/" },
    { url: "https://www.instagram.com/p/DZWhv4Ty6X-/" },
    { url: "https://www.instagram.com/p/DZTohTHyIGO/" },
    { url: "https://www.instagram.com/p/DZTn72vSuGu/" },
    { url: "https://www.instagram.com/p/DZTnuGDSkAe/" },
    { url: "https://www.instagram.com/p/DZRaYKJyrrR/" },
    { url: "https://www.instagram.com/p/DZRaRk5Suy4/" },
    { url: "https://www.instagram.com/p/DZRaGjHSJb-/" },
    { url: "https://www.instagram.com/p/DYloB3fklcV/" }
  ];

  var VALID = /^https:\/\/www\.instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?/;

  /* ---------- safe DOM building (no innerHTML from data) ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function shortcodeOf(url) {
    var m = VALID.exec(url);
    return m ? m[2] : "";
  }

  function buildCard(post) {
    var url = post.url.trim();
    var code = shortcodeOf(url);
    var caption = (post.caption || "").trim();
    var date = (post.date || "").trim();

    /* Distinct label per card — six identical "View post" links in a row is
       exactly what a screen-reader user cannot navigate. */
    var label = (caption || "Instagram post " + code) +
      " — opens on Instagram in a new tab";

    // The plate sits underneath always, so a missing or failed image reveals a
    // dark frame rather than a broken-image glyph or a blank white box.
    var plate = el("span", { class: "ig-post__plate", "aria-hidden": "true" }, [
      el("span", { class: "ig-post__frame" }, [code]),
      el("span", { class: "ig-post__cue" }, ["View on Instagram"])
    ]);

    var media = el("span", { class: "ig-post__media" }, [plate]);

    if (post.image) {
      var img = el("img", {
        src: post.image,
        // The link already carries a descriptive label, so an undescribed
        // image is decorative rather than unlabelled.
        alt: post.alt || "",
        loading: "lazy",
        decoding: "async"
      });
      img.addEventListener("error", function () {
        if (img.parentNode) img.parentNode.removeChild(img);
      });
      media.appendChild(img);
    }

    /* The body only earns its place when it has something to say. With no
       caption, no date and no image, the plate already shows the frame number
       and the "View on Instagram" cue, so a body strip would just repeat it —
       and at 360px in a two-up grid there is not room for the repeat anyway. */
    var body = null;
    if (caption || date || post.image) {
      body = el("span", { class: "ig-post__body" });
      if (caption) body.appendChild(el("span", { class: "ig-post__caption" }, [caption]));
      body.appendChild(el("span", { class: "ig-post__meta" }, [
        el("span", { class: "ig-post__when" }, [date || ""]),
        el("span", { class: "ig-post__go" }, ["View ↗"])
      ]));
    }

    return el("a", {
      class: "ig-post",
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": label
    }, body ? [media, body] : [media]);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var feed = document.getElementById("ig-feed");
    var empty = document.getElementById("ig-empty");
    if (!feed) return;

    var posts = IG_POSTS.filter(function (p) {
      return p && typeof p.url === "string" && VALID.test(p.url.trim());
    });

    if (!posts.length) {
      if (empty) empty.classList.add("is-visible");
      return;
    }
    if (empty) empty.classList.remove("is-visible");

    var frag = document.createDocumentFragment();
    posts.forEach(function (p) { frag.appendChild(buildCard(p)); });
    feed.appendChild(frag);
  });
})();
