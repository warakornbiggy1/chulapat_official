/* =========================================================
   CHULAPAT_OFFICIAL — main.js
   Shared chrome (nav / footer / atmosphere) + interactions.
   Vanilla, no dependencies, CSP-safe (no eval, no inline script,
   no innerHTML from data).
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

  /* The order form. Single source of truth: every [data-buy] link in the HTML
     carries this href already (so Buy still works with JS off), and
     initOrderLinks() re-stamps it at runtime so a typo in markup can't cost an
     order. Change it here and every Buy button follows. */
  var ORDER_FORM_URL = "https://forms.gle/wCzdKGDoCH8tyMch8";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* The identity is one word — BlackOrange — carrying a colour seam rather than
     a space. Split into two spans so CSS can shift colour at the seam; there is
     no whitespace between them, so it still reads as a single word to a screen
     reader. Both halves clear AA on the ink grounds on their own (bone ~15:1,
     flame ~7:1), which a gradient across the whole word would not. */
  function wordmark(extraClass) {
    return el("span", { class: extraClass ? "wordmark " + extraClass : "wordmark" }, [
      el("span", { class: "wordmark__b" }, ["Black"]),
      el("span", { class: "wordmark__o" }, ["Orange"])
    ]);
  }

  /* ---------- Atmosphere layers (embers + foreground vignette) ---------- */
  function buildAtmosphere() {
    document.body.appendChild(el("div", { class: "vignette", "aria-hidden": "true" }));
    if (reduceMotion) return;

    var canvas = el("canvas", { class: "embers", "aria-hidden": "true" });
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, motes = [], raf = null;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      // Density scales with viewport so phones stay cheap.
      var count = Math.round(Math.min(46, Math.max(14, (w * h) / 34000)));
      motes = [];
      for (var i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + Math.random() * 1.5,
          vy: -(0.06 + Math.random() * 0.22),
          drift: (Math.random() - 0.5) * 0.16,
          phase: Math.random() * Math.PI * 2,
          hot: Math.random() > 0.65
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y += m.vy;
        m.x += m.drift + Math.sin(t / 2600 + m.phase) * 0.18;
        if (m.y < -12) { m.y = h + 12; m.x = Math.random() * w; }
        if (m.x < -12) m.x = w + 12;
        if (m.x > w + 12) m.x = -12;

        var flicker = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t / 700 + m.phase * 3));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.hot
          ? "rgba(255, 168, 96, " + (flicker * 0.7).toFixed(3) + ")"
          : "rgba(232, 185, 106, " + (flicker * 0.4).toFixed(3) + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (raf === null) raf = requestAnimationFrame(frame); }
    function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    resize(); seed(); start();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); seed(); }, 180);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
  }

  /* ---------- Scroll progress ---------- */
  function buildProgress() {
    var bar = el("div", { class: "progress", "aria-hidden": "true" });
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Navbar ---------- */
  function buildNav() {
    var mount = document.querySelector("[data-nav]");
    if (!mount) return;

    var brand = el("a", { href: "index.html", class: "brand", "aria-label": "CHULAPAT_OFFICIAL — home" }, [
      el("img", {
        src: "assets/logo-ring.png", alt: "", class: "brand__logo",
        width: "38", height: "38", loading: "eager", "aria-hidden": "true"
      }),
      el("span", { class: "brand__text" }, [
        (function () { var b = document.createElement("b"); b.textContent = "CHULAPAT"; return b; })(),
        document.createTextNode("_OFFICIAL"),
        el("small", null, [wordmark("wordmark--micro")])
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
    }, [el("span"), el("span"), el("span")]);

    function closeMenu() {
      ul.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      var open = ul.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    ul.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ul.classList.contains("is-open")) { closeMenu(); toggle.focus(); }
    });

    var nav = el("nav", { class: "nav", "aria-label": "เมนูหลัก" }, [brand, ul, toggle]);
    var shell = el("div", { class: "nav-shell" }, [nav]);
    mount.appendChild(shell);

    // Condense + gold hairline on scroll
    var stuck = false, ticking = false;
    function onScroll() {
      var should = window.scrollY > 24;
      if (should !== stuck) { stuck = should; shell.classList.toggle("is-stuck", stuck); }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    var mount = document.querySelector("[data-footer]");
    if (!mount) return;

    var colBrand = el("div", null, [
      el("div", { class: "footer__brand" }, [
        el("img", { src: "assets/logo-ring.png", alt: "", "aria-hidden": "true", width: "44", height: "44", loading: "lazy" }),
        el("h4", null, ["CHULAPAT_OFFICIAL"])
      ]),
      el("p", { class: "card__text" }, ["Sports color squad in a dark circus theme — ", wordmark(), "."]),
      el("p", { class: "footer__slogan thai" }, ["เราคือแสดดำ"])
    ]);

    var linkNav = el("nav", { "aria-label": "Footer menu" });
    NAV_LINKS.forEach(function (l) { linkNav.appendChild(el("a", { href: l.href }, [l.label])); });
    var colLinks = el("div", null, [el("h4", null, ["Menu"]), linkNav]);

    var colContact = el("div", { class: "footer__links" }, [
      el("h4", null, ["Connect"]),
      el("a", { href: IG_URL, target: "_blank", rel: "noopener noreferrer" }, ["Instagram @chulapat_official"]),
      el("a", { href: "contact.html" }, ["Contact form"]),
      el("a", { href: "ourpost.html" }, ["Our Post"])
    ]);

    var footer = el("footer", { class: "footer" }, [
      el("div", { class: "bulbs footer__bulbs", "aria-hidden": "true" }),
      el("span", { class: "footer__ghost", "aria-hidden": "true" }, ["CHULAPAT"]),
      el("div", { class: "footer__grid container" }, [colBrand, colLinks, colContact]),
      el("div", { class: "footer__bottom container" }, [
        el("span", null, ["© " + new Date().getFullYear() + " CHULAPAT_OFFICIAL. All rights reserved."]),
        el("span", null, ["Dark Circus · ", wordmark("wordmark--micro")])
      ])
    ]);
    mount.appendChild(footer);
  }

  /* ---------- Reveal on scroll (staggered) ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      // Stagger within a single intersection batch, top-to-bottom.
      var shown = entries.filter(function (e) { return e.isIntersecting; });
      shown.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      shown.forEach(function (e, i) {
        if (!e.target.style.getPropertyValue("--i")) {
          e.target.style.setProperty("--i", String(Math.min(i, 6)));
        }
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------- Counters (eased, never linear) ---------- */
  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    function run(node) {
      var target = parseInt(node.getAttribute("data-count"), 10) || 0;
      var suffix = node.getAttribute("data-suffix") || "";
      if (reduceMotion) { node.textContent = target + suffix; return; }
      var dur = 1800, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        // expo-out: fast lift, long graceful settle
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        node.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Hero parallax (emblem + glow drift with scroll & pointer) ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var stage = document.querySelector(".hero__stage");
    if (!stage) return;
    var emblem = stage.querySelector(".hero__emblem");
    var halo = stage.querySelector(".hero__halo");
    var spot = stage.querySelector(".hero__spot");
    if (!emblem) return;

    var sy = 0, px = 0, py = 0, ticking = false;

    function apply() {
      // Emblem keeps its own rotation animation, so parallax rides the parent.
      stage.style.transform = "translate3d(" + (px * 14).toFixed(2) + "px," +
        (sy * -0.09 + py * 10).toFixed(2) + "px,0)";
      if (halo) halo.style.transform = "translate3d(" + (px * -22).toFixed(2) + "px," + (sy * -0.05).toFixed(2) + "px,0)";
      if (spot) spot.style.transform = "translateX(-50%) translateY(" + (sy * 0.05).toFixed(2) + "px)";
      ticking = false;
    }
    function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }

    window.addEventListener("scroll", function () {
      if (window.scrollY > window.innerHeight * 1.2) return;
      sy = window.scrollY;
      schedule();
    }, { passive: true });

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    }, { passive: true });
  }

  /* ---------- Card rim-light follows the pointer ---------- */
  function initRimLight() {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest ? e.target.closest(".card") : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    var btns = document.querySelectorAll(".btn");
    btns.forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.setProperty("--tx", (dx * 5).toFixed(2) + "px");
        btn.style.setProperty("--ty", (dy * 4).toFixed(2) + "px");
      });
      function release() {
        btn.style.removeProperty("--tx");
        btn.style.removeProperty("--ty");
      }
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("blur", release);
    });
  }

  /* ---------- Filters with FLIP transitions ---------- */
  function initFilters() {
    var groups = document.querySelectorAll("[data-filter-group]");
    groups.forEach(function (group) {
      var chips = group.querySelectorAll(".chip");
      var target = document.querySelector(group.getAttribute("data-target"));
      if (!target) return;
      var items = Array.prototype.slice.call(target.querySelectorAll("[data-cat]"));

      function applyFilter(cat) {
        // FIRST — record current positions of everything still on screen.
        var first = new Map();
        items.forEach(function (it) {
          if (!it.classList.contains("is-filtered-out")) {
            first.set(it, it.getBoundingClientRect());
          }
        });

        // Mutate.
        items.forEach(function (it) {
          var show = cat === "all" || it.getAttribute("data-cat") === cat;
          it.classList.toggle("is-filtered-out", !show);
        });

        if (reduceMotion) return;

        // LAST + INVERT + PLAY.
        items.forEach(function (it) {
          if (it.classList.contains("is-filtered-out")) return;
          var last = it.getBoundingClientRect();
          var prev = first.get(it);
          it.style.transition = "none";
          if (prev) {
            var dx = prev.left - last.left;
            var dy = prev.top - last.top;
            if (!dx && !dy) { it.style.transition = ""; return; }
            it.style.transform = "translate(" + dx + "px," + dy + "px)";
          } else {
            // Newly shown: fade + lift in rather than snapping.
            it.style.transform = "scale(0.94)";
            it.style.opacity = "0";
          }
          requestAnimationFrame(function () {
            it.style.transition = "transform 460ms cubic-bezier(.22,1,.36,1), opacity 320ms cubic-bezier(.22,1,.36,1)";
            it.style.transform = "";
            it.style.opacity = "";
          });
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) {
            c.classList.remove("is-active");
            c.setAttribute("aria-pressed", "false");
          });
          chip.classList.add("is-active");
          chip.setAttribute("aria-pressed", "true");
          applyFilter(chip.getAttribute("data-cat"));
        });
        chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
      });
    });
  }

  /* ---------- Contact form (client-side validation only) ---------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var note = form.querySelector(".form-note");

    function setError(name, msg) {
      var box = form.querySelector('[data-error="' + name + '"]');
      if (box) box.textContent = msg || "";
      var input = form.elements[name];
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.elements["name"];
      var email = form.elements["email"];
      var message = form.elements["message"];

      setError("name", ""); setError("email", ""); setError("message", "");

      if (!name.value.trim()) { setError("name", "Enter your name."); ok = false; }
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) { setError("email", "Enter a valid email address."); ok = false; }
      if (message.value.trim().length < 10) { setError("message", "Write at least 10 characters."); ok = false; }

      if (!ok) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      // Static demo: no data leaves the browser. Wire to a form service later.
      note.classList.add("is-visible");
      note.textContent = "Thanks " + name.value.trim() + " — message received. We'll get back to you soon.";
      form.reset();
      if (note.focus) note.focus();
    });

    ["name", "email", "message"].forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener("input", function () { setError(n, ""); });
    });
  }

  /* ---------- Order links ----------
     Every Buy button ships with the real href in markup so it survives JS being
     off. This re-stamps them from the constant above, so the form URL has
     exactly one source of truth and a mistyped href in HTML self-heals. */
  function initOrderLinks() {
    var links = document.querySelectorAll("[data-buy]");
    Array.prototype.forEach.call(links, function (a) {
      a.href = ORDER_FORM_URL;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }

  /* ---------- Sport selector (jersey page) ----------
     Anchors, not buttons: deep links, native smooth scroll and keyboard
     operation all come free, and the page still navigates with JS off. The
     observer only maintains the active state. */
  function initSportNav() {
    var bar = document.querySelector("[data-sport-nav]");
    if (!bar) return;

    var links = Array.prototype.slice.call(bar.querySelectorAll(".sport-btn"));
    if (!links.length) return;

    var byId = {};
    var sections = [];
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace(/^#/, "");
      var section = id && document.getElementById(id);
      if (!section) return;
      byId[id] = a;
      sections.push(section);
    });
    if (!sections.length) return;

    var activeId = null;
    function setActive(id) {
      if (!id || id === activeId || !byId[id]) return;
      if (activeId && byId[activeId]) {
        byId[activeId].classList.remove("is-active");
        byId[activeId].removeAttribute("aria-current");
      }
      activeId = id;
      byId[id].classList.add("is-active");
      byId[id].setAttribute("aria-current", "true");
      // Keep the active chip in view when the bar scrolls horizontally.
      if (bar.scrollWidth > bar.clientWidth + 4) {
        var chip = byId[id];
        var barBox = bar.getBoundingClientRect();
        var box = chip.getBoundingClientRect();
        if (box.left < barBox.left || box.right > barBox.right) {
          bar.scrollTo({
            left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2,
            behavior: reduceMotion ? "auto" : "smooth"
          });
        }
      }
    }

    // Immediate feedback on click — the observer would otherwise only catch up
    // once the smooth scroll arrives.
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        setActive((a.getAttribute("href") || "").replace(/^#/, ""));
      });
    });

    /* The reading line: just under the sticky bar. The active sport is simply
       the last section whose top edge has scrolled above it — unambiguous even
       when a section is taller than the viewport, and it cannot land in a dead
       zone between two sections the way a narrow activation band can.

       It is measured from the sections' own scroll-margin-top, which is where
       an anchored section comes to rest. Deriving it from the bar's height
       instead put the line 11px above that resting point, so a freshly clicked
       section counted as "not yet reached" and the chip lagged one behind. */
    function lineY() {
      var rest = parseFloat(window.getComputedStyle(sections[0]).scrollMarginTop) || 0;
      if (!rest) rest = (parseFloat(window.getComputedStyle(bar).top) || 0) + bar.offsetHeight;
      /* Slack below the resting point, so nudging back up by a few dozen
         pixels does not immediately flip to the previous sport while its
         heading is still plainly on screen. */
      return rest + 40;
    }

    function pick() {
      var line = lineY();
      var best = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) best = sections[i];
      }
      return best.id;
    }

    if (!("IntersectionObserver" in window)) {
      setActive(location.hash.replace(/^#/, "") || sections[0].id);
      return;
    }

    /* The root is everything ABOVE the reading line — a tall band from the top
       of the viewport down to it. A section starts intersecting that band at
       the exact moment its top edge crosses the line, so the observer fires
       precisely when the answer changes and stays silent in between. No scroll
       handler, so nothing runs on the scroll thread.

       Collapsing the root to a 1px line at the reading line looks equivalent
       and is not: at fractional device pixel ratios it can round away to
       nothing and the observer then never fires at all. */
    var io = null;
    function observe() {
      if (io) io.disconnect();
      var below = Math.max(0, window.innerHeight - lineY());
      io = new IntersectionObserver(function () {
        setActive(pick());
      }, { rootMargin: "0px 0px " + -below + "px 0px", threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
    observe();

    /* The observer covers scrolling, but it is blind to the page changing
       shape underneath a viewport that has not moved — which is exactly what
       happens while webfonts and images land after load. The sections grow,
       a different one ends up under the line, and no intersection state
       changed, so nothing fires. That is what made a deep link to #futsal
       settle on Table Tennis on a narrow screen.

       Watching the document's own box closes that gap, and it doubles as the
       width-change handler: the selector is two rows below 560px, which moves
       the reading line. */
    if ("ResizeObserver" in window) {
      var settleTimer;
      var ro = new ResizeObserver(function () {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () { observe(); setActive(pick()); }, 120);
      });
      ro.observe(document.body);
    }


    // The line moves when the bar reflows (the selector is 2 rows on mobile).
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { observe(); setActive(pick()); }, 180);
    });

    /* Deep link: the browser does the scrolling (scroll-margin-top keeps the
       heading clear of the sticky chrome); we only light the right chip. */
    /* Deep link: the browser does the scrolling (scroll-margin-top keeps the
       heading clear of the sticky chrome). Light the requested chip straight
       away for immediate feedback; the observer and the settle-watcher above
       take it from there. */
    var hash = location.hash.replace(/^#/, "");
    setActive(byId[hash] ? hash : pick());
    window.addEventListener("load", function () {
      requestAnimationFrame(function () { setActive(pick()); });
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildAtmosphere();
    buildProgress();
    buildNav();
    buildFooter();
    initReveal();
    initCounters();
    initParallax();
    initRimLight();
    initMagnetic();
    initFilters();
    initContactForm();
    initOrderLinks();
    initSportNav();
  });
})();
