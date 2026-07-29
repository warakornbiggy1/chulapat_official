/* =========================================================
   CHULAPAT_OFFICIAL — main.js
   Shared nav/footer injection + interactions (no dependencies)
   ========================================================= */
(function () {
  "use strict";

  var NAV_LINKS = [
    { href: "index.html",    label: "Home" },
    { href: "about.html",    label: "About" },
    { href: "members.html",  label: "Members" },
    { href: "jersey.html",   label: "Jersey" },
    { href: "ourpost.html",  label: "Our Post" },
    { href: "history.html",  label: "History" },
    { href: "contact.html",  label: "Contact" }
  ];

  var IG_URL = "https://www.instagram.com/chulapat_official?igsh=MTFkbWNmbHZudmo4aQ%3D%3D&utm_source=qr";

  // Current page filename (default to index.html)
  var current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (current === "") current = "index.html";

  /* ---------- helpers (safe DOM building, no innerHTML from data) ---------- */
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

  /* ---------- Build navbar ---------- */
  function buildNav() {
    var mount = document.querySelector("[data-nav]");
    if (!mount) return;

    var bulbs = el("div", { class: "bulbs", "aria-hidden": "true" });

    var brand = el("a", { href: "index.html", class: "brand", "aria-label": "CHULAPAT_OFFICIAL home" }, [
      el("img", { src: "assets/logo-mark.png", alt: "CHULAPAT logo", class: "brand__logo", width: "42", height: "42", loading: "eager" }),
      el("span", { class: "brand__text" }, [
        (function () { var b = document.createElement("b"); b.textContent = "CHULAPAT"; return b; })(),
        document.createTextNode("_OFFICIAL"),
        el("small", null, ["ORANGE · BLACK"])
      ])
    ]);

    var ul = el("ul", { class: "nav__links", id: "primary-menu" });
    NAV_LINKS.forEach(function (l) {
      var a = el("a", { href: l.href }, [l.label]);
      if (l.href.toLowerCase() === current) {
        a.className = "is-active";
        a.setAttribute("aria-current", "page");
      }
      ul.appendChild(el("li", null, [a]));
    });

    var toggle = el("button", {
      class: "nav__toggle", type: "button",
      "aria-label": "เปิด/ปิดเมนู", "aria-expanded": "false", "aria-controls": "primary-menu"
    }, [ el("span"), el("span"), el("span") ]);

    toggle.addEventListener("click", function () {
      var open = ul.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu on link click (mobile)
    ul.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        ul.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    var inner = el("div", { class: "nav__inner" }, [brand, ul, toggle]);
    var nav = el("nav", { class: "nav", "aria-label": "เมนูหลัก" }, [inner]);

    mount.appendChild(bulbs);
    mount.appendChild(nav);
  }

  /* ---------- Build footer ---------- */
  function buildFooter() {
    var mount = document.querySelector("[data-footer]");
    if (!mount) return;

    var colBrand = el("div", null, [
      el("div", { class: "footer__brand" }, [
        el("img", { src: "assets/logo-mark.png", alt: "CHULAPAT logo", width: "46", height: "46", loading: "lazy" }),
        el("h4", { style: "margin:0" }, ["CHULAPAT_OFFICIAL"])
      ]),
      el("p", { class: "card__text" }, ["Sports color squad in a dark circus theme — orange & black."]),
      el("p", { class: "thai", style: "color:var(--gold);margin-top:10px;font-weight:600" }, ["เราคือแสดดำ"])
    ]);

    var colLinks = el("div", null, [ el("h4", null, ["Menu"]) ]);
    NAV_LINKS.forEach(function (l) { colLinks.appendChild(el("a", { href: l.href }, [l.label])); });

    var colContact = el("div", null, [
      el("h4", null, ["Connect"]),
      el("a", { href: IG_URL, target: "_blank", rel: "noopener noreferrer" }, ["Instagram @chulapat_official"]),
      el("a", { href: "contact.html" }, ["Contact form"]),
      el("a", { href: "ourpost.html" }, ["Our Post"])
    ]);

    var grid = el("div", { class: "footer__grid container" }, [colBrand, colLinks, colContact]);

    var bottom = el("div", { class: "footer__bottom container" }, [
      el("span", null, ["© " + new Date().getFullYear() + " CHULAPAT_OFFICIAL. All rights reserved."]),
      el("span", null, ["Dark Circus · Orange & Black 🎪"])
    ]);

    var footer = el("footer", { class: "footer" }, [grid, bottom]);
    mount.appendChild(footer);
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    var run = function (node) {
      var target = parseInt(node.getAttribute("data-count"), 10) || 0;
      var suffix = node.getAttribute("data-suffix") || "";
      var dur = 1400, start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Filter chips (members / jersey) ---------- */
  function initFilters() {
    var groups = document.querySelectorAll("[data-filter-group]");
    groups.forEach(function (group) {
      var chips = group.querySelectorAll(".chip");
      var targetSel = group.getAttribute("data-target");
      var items = document.querySelectorAll(targetSel + " [data-cat]");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.classList.remove("is-active"); });
          chip.classList.add("is-active");
          var cat = chip.getAttribute("data-cat");
          items.forEach(function (it) {
            var show = cat === "all" || it.getAttribute("data-cat") === cat;
            it.style.display = show ? "" : "none";
          });
        });
      });
    });
  }

  /* ---------- Contact form (client-side validation only) ---------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var note = form.querySelector(".form-note");

    var setError = function (name, msg) {
      var box = form.querySelector('[data-error="' + name + '"]');
      if (box) box.textContent = msg || "";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.elements["name"];
      var email = form.elements["email"];
      var message = form.elements["message"];

      setError("name", ""); setError("email", ""); setError("message", "");

      if (!name.value.trim()) { setError("name", "Please enter your name."); ok = false; }
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) { setError("email", "Invalid email address."); ok = false; }
      if (message.value.trim().length < 10) { setError("message", "Message must be at least 10 characters."); ok = false; }

      if (!ok) return;

      // Static demo: no data leaves the browser. Wire to a backend/form service later.
      note.classList.add("is-visible");
      note.textContent = "Thanks " + name.value.trim() + "! We got your message and will get back to you soon. 🎪";
      form.reset();
      note.focus && note.focus();
    });

    // clear error on input
    ["name", "email", "message"].forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener("input", function () { setError(n, ""); });
    });
  }

  /* ---------- Year in footer already handled; init all ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildNav();
    buildFooter();
    initReveal();
    initCounters();
    initFilters();
    initContactForm();
  });
})();
