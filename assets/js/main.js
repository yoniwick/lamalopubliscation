/* Lamalo Publication — site behaviour: language switching, header, reveal, hero dust */
(function () {
  "use strict";

  /* -----------------------------------------------------------
   * Site settings — fill these in when links are ready.
   * Empty values keep the "coming soon" state on the page.
   * --------------------------------------------------------- */
  var SITE_CONFIG = {
    buyLinks: {
      zh: "", // e.g. "https://www.example.com/two-messiahs-zh"
      en: "",
      he: ""
    },
    contactEmail: "" // e.g. "hello@lamalo.example"
  };

  var LANGS = ["zh-Hant", "zh-Hans", "en", "he"];
  var FALLBACK = { "zh-Hans": "zh-Hant", en: "zh-Hant", he: "en" };
  var STORAGE_KEY = "lamalo-lang";
  var root = document.documentElement;
  var dicts = window.LAMALO_I18N || {};

  /* ---------- i18n ---------- */
  function attrPairs(el) {
    return el.getAttribute("data-i18n-attr").split(";").map(function (pair) {
      var i = pair.indexOf(":");
      return [pair.slice(0, i).trim(), pair.slice(i + 1).trim()];
    });
  }

  // The HTML ships in Traditional Chinese; harvest it as the zh-Hant dictionary.
  var base = {};
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    base[el.getAttribute("data-i18n")] = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
    attrPairs(el).forEach(function (p) { base[p[1]] = el.getAttribute(p[0]); });
  });
  dicts["zh-Hant"] = base;

  function lookup(lang, key) {
    var l = lang;
    while (l) {
      var d = dicts[l];
      if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
      l = FALLBACK[l];
    }
    return null;
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "zh-Hant";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = lookup(lang, el.getAttribute("data-i18n"));
      if (v !== null && el.innerHTML !== v) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      attrPairs(el).forEach(function (p) {
        var v = lookup(lang, p[1]);
        if (v !== null) el.setAttribute(p[0], v);
      });
    });
    root.lang = lang;
    root.dir = lang === "he" ? "rtl" : "ltr";
    root.setAttribute("data-lang", lang);
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try {
      var url = new URL(location.href);
      if (lang === "zh-Hant") url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
      history.replaceState(null, "", url.toString());
    } catch (e) {}
    root.classList.remove("i18n-pending");
  }

  document.querySelectorAll(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ---------- Purchase links & contact ---------- */
  Object.keys(SITE_CONFIG.buyLinks).forEach(function (code) {
    var href = SITE_CONFIG.buyLinks[code];
    if (!href) return;
    var buy = document.querySelector('[data-buy="' + code + '"]');
    var soon = document.querySelector('[data-buy-soon="' + code + '"]');
    if (buy) { buy.href = href; buy.target = "_blank"; buy.rel = "noopener"; buy.hidden = false; }
    if (soon) soon.hidden = true;
  });
  if (SITE_CONFIG.contactEmail) {
    var box = document.querySelector("[data-contact]");
    var link = document.querySelector("[data-contact-link]");
    if (box && link) { link.href = "mailto:" + SITE_CONFIG.contactEmail; box.hidden = false; }
  }

  applyLang(root.getAttribute("data-lang") || "zh-Hant");

  /* ---------- Header state & mobile menu ---------- */
  var header = document.getElementById("siteHeader");
  var toggle = header.querySelector(".menu-toggle");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", function () { setMenu(!header.classList.contains("nav-open")); });
  header.querySelectorAll(".site-nav a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) { if (!header.contains(e.target)) setMenu(false); });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  if ("IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) sectionIO.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); revealIO.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero: gold dust drifting toward the sunrise ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.querySelector(".hero__dust");
  var art = document.querySelector(".hero__art");
  if (canvas && art && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1, sun = { x: 0, y: 0 }, specks = [], running = false, rafId = 0;
    var SUN_IN_ART = { x: 1780 / 2000, y: 250 / 1116 }; // the sunrise in the cover painting

    function locateSun() {
      // Mirror object-fit: cover + object-position to find the painted sun on screen
      var pos = getComputedStyle(art).objectPosition.split(" ");
      var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || "50") / 100;
      var cr = canvas.getBoundingClientRect(), ar = art.getBoundingClientRect();
      var scale = Math.max(ar.width / 2000, ar.height / 1116);
      var dw = 2000 * scale, dh = 1116 * scale;
      sun.x = ar.left - cr.left + (ar.width - dw) * px + SUN_IN_ART.x * dw;
      sun.y = ar.top - cr.top + (ar.height - dh) * py + SUN_IN_ART.y * dh;
    }

    function spawn(s, fresh) {
      // Start along the light beam that falls from the sun toward the lower left
      var t = Math.random();
      s.x = sun.x - (0.15 + t * 0.75) * W * 0.6 + (Math.random() - 0.5) * W * 0.18;
      s.y = sun.y + (0.15 + t * 0.75) * H * 0.55 + (Math.random() - 0.5) * H * 0.2;
      s.r = 0.6 + Math.random() * 1.8;
      s.life = 0;
      s.max = 380 + Math.random() * 520;
      s.speed = 0.12 + Math.random() * 0.32;
      s.wobble = Math.random() * Math.PI * 2;
      s.hue = Math.random() < 0.12 ? "violet" : "gold";
      if (fresh) s.life = Math.random() * s.max;
      return s;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      locateSun();
      var n = Math.round(Math.min(90, Math.max(36, W / 16)));
      specks = [];
      for (var i = 0; i < n; i++) specks.push(spawn({}, true));
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < specks.length; i++) {
        var s = specks[i];
        s.life++;
        if (s.life > s.max) { spawn(s, false); continue; }
        var dx = sun.x - s.x, dy = sun.y - s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        s.wobble += 0.02;
        s.x += (dx / d) * s.speed + Math.cos(s.wobble) * 0.15;
        s.y += (dy / d) * s.speed + Math.sin(s.wobble * 0.8) * 0.12;
        var p = s.life / s.max;
        var a = Math.sin(p * Math.PI) * 0.85;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.hue === "gold"
          ? "rgba(236, 202, 120," + a.toFixed(3) + ")"
          : "rgba(176, 150, 230," + (a * 0.8).toFixed(3) + ")";
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }

    var onScreen = true;
    function start() { if (!running && onScreen && !document.hidden) { running = true; rafId = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    resize();
    window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        onScreen ? start() : stop();
      }).observe(canvas);
    } else {
      start();
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }
})();
