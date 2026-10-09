/* Orbit Studio ad landing page: lead capture, tracking, small motion. No dependencies. */
(function () {
  "use strict";

  /* ============ CONFIG: edit these three values ============ */
  var CONFIG = {
    // 1) Where leads are POSTed as JSON. Paste a Formspree URL (https://formspree.io/f/xxxx), a Make/Zapier webhook,
    //    or a Google Apps Script web-app URL. While this is empty, the form falls back to opening WhatsApp
    //    with the lead's details pre-filled (the lead must press Send).
    FORM_ENDPOINT: "",
    // 2) Meta Pixel ID (Events Manager > Data sources). Leave empty to disable. Fires PageView, Lead, Contact.
    PIXEL_ID: "28537280659269769",
    // 3) WhatsApp number that receives messages (country code, no plus).
    WHATSAPP: "917984430672"
  };
  /* ========================================================== */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Meta Pixel (only when an ID is set) ---------- */
  if (CONFIG.PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.PIXEL_ID); window.fbq("track", "PageView");
  }
  var track = function (name, data) { try { if (window.fbq) window.fbq("track", name, data || {}); } catch (e) {} };

  /* ---------- UTM / click-id capture (kept for the whole session) ---------- */
  var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"], store = {};
  try {
    var q = new URLSearchParams(location.search);
    keys.forEach(function (k) { var v = q.get(k); if (v) sessionStorage.setItem("os_" + k, v); store[k] = sessionStorage.getItem("os_" + k) || ""; });
  } catch (e) { keys.forEach(function (k) { store[k] = ""; }); }

  /* ---------- reveal on scroll ---------- */
  var rvs = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rvs.forEach(function (el) { io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add("in"); });

  /* ---------- sticky mobile bar: shown while no form is on screen ---------- */
  var sticky = $("#sticky"), formsOn = 0;
  if (sticky && "IntersectionObserver" in window) {
    var vis = new Set();
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (x) { x.isIntersecting ? vis.add(x.target) : vis.delete(x.target); });
      sticky.classList.toggle("on", vis.size === 0 && scrollY > 300);
    });
    $$(".card").forEach(function (c) { so.observe(c); });
    addEventListener("scroll", function () { if (scrollY <= 300) sticky.classList.remove("on"); else if (!vis.size) sticky.classList.add("on"); }, { passive: true });
  }

  /* ---------- CTA tracking ---------- */
  $$("[data-cta]").forEach(function (a) { a.addEventListener("click", function () { track("InitiateCheckout", { content_name: a.getAttribute("data-cta") }); }); });
  $$("[data-wa-click]").forEach(function (a) { a.addEventListener("click", function () { track("Contact", { content_name: "whatsapp_sticky" }); }); });

  /* ---------- portfolio filters ---------- */
  var fchips = $$(".fchip");
  if (fchips.length) fchips.forEach(function (b) { b.addEventListener("click", function () {
    var f = b.getAttribute("data-f");
    fchips.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    $$(".pcard").forEach(function (c) { var tags = (c.getAttribute("data-tags") || "").split(" "); c.classList.toggle("hide", f !== "all" && tags.indexOf(f) < 0); });
    var shown = $$(".pcard:not(.hide)"); shown.forEach(function (c) { c.classList.remove("feature"); }); if (f === "all" && shown[0]) shown[0].classList.add("feature");
  }); });

  /* ---------- copy page link (portfolio share button) ---------- */
  $$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () {
    var url = location.href.split("#")[0], label = $("span", b), old = label.textContent;
    var done = function () { label.textContent = "Link copied"; setTimeout(function () { label.textContent = old; }, 2200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copy this link", url); });
    else window.prompt("Copy this link", url);
  }); });

  /* ---------- lead forms ---------- */
  var digits = function (s) { return String(s || "").replace(/\D/g, ""); };
  var normalisePhone = function (s) { var d = digits(s); if (d.length === 10) d = "91" + d; if (d.length === 11 && d.charAt(0) === "0") d = "91" + d.slice(1); return d; };
  var validPhone = function (s) { var d = digits(s); return d.length >= 10 && d.length <= 15; };
  var validEmail = function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); };

  $$(".lead-form").forEach(function (form) {
    var card = form.closest(".card"), btn = $("button[type=submit]", form), errBox = $(".formerr", form), busy = false;
    var set = function (n, v) { var el = form.elements[n]; if (el) el.value = v; };
    keys.forEach(function (k) { set(k, store[k]); });
    set("page_url", location.href.split("#")[0]);

    var flag = function (name, bad) { var f = form.elements[name].closest(".fld"); f.classList.toggle("bad", bad); form.elements[name].setAttribute("aria-invalid", bad ? "true" : "false"); return bad; };
    var check = function () {
      var e = form.elements, bad = false;
      var tests = { name: function (v) { return v.trim().length < 2; }, phone: function (v) { return !validPhone(v); }, email: function (v) { return !validEmail(v.trim()); }, service: function (v) { return !v; } };
      Object.keys(tests).forEach(function (n) { if (e[n] && e[n].required) bad = flag(n, tests[n](e[n].value)) || bad; });   // only validate what this form asks for
      return !bad;
    };
    ["name", "phone", "email", "service"].filter(function (n) { return form.elements[n] && form.elements[n].required; }).forEach(function (n) { form.elements[n].addEventListener("input", function () { if (form.elements[n].closest(".fld").classList.contains("bad")) check(); }); form.elements[n].addEventListener("blur", function () { if (form.elements[n].value) check(); }); });

    var waLink = function (d) {
      var t = "Hi Orbit Studio, I'm " + d.name + ". I'd like a free " + (d.intent || "strategy call") + ".\nNeed: " + d.service + (d.budget ? "\nBudget: " + d.budget : "") + (d.website ? "\nBrand: " + d.website : "") + "\nMy WhatsApp: +" + normalisePhone(d.phone) + (d.email ? "\nEmail: " + d.email : "") + (d.message ? "\nMessage: " + d.message : "");
      return "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(t);
    };
    var success = function (d, via) {
      track("Lead", { content_name: d.service, value: 0, currency: "INR", source: form.getAttribute("data-src") });
      var thanks = $(".thanks", card);
      $("[data-name]", thanks).textContent = d.name.split(" ")[0];
      $("[data-wa]", thanks).href = waLink(d);
      $("[data-wa]", thanks).addEventListener("click", function () { track("Contact", { content_name: "whatsapp_thanks" }); }, { once: true });
      card.classList.add("done");
      thanks.focus({ preventScroll: true });
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      try { sessionStorage.setItem("os_lead", "1"); } catch (e) {}
      if (via === "whatsapp") window.open(waLink(d), "_blank", "noopener");
    };

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (busy) return;
      errBox.classList.remove("on");
      if (form.elements.company.value) { return; }                 // honeypot: bots fill it, people never see it
      if (!check()) { var first = $(".fld.bad input, .fld.bad select", form); if (first) first.focus(); return; }
      set("submitted_at", new Date().toISOString());
      var d = {};
      $$("input,select,textarea", form).forEach(function (el) { if (el.name && el.name !== "company") d[el.name] = el.value.trim(); });
      d.landing = location.pathname;
      d.phone_normalised = "+" + normalisePhone(d.phone);
      d.form = form.getAttribute("data-src");
      busy = true; btn.disabled = true; var label = $("span", btn), old = label.textContent; label.textContent = "Sending...";

      if (!CONFIG.FORM_ENDPOINT) { busy = false; btn.disabled = false; label.textContent = old; success(d, "whatsapp"); return; }

      // Google Apps Script web apps cannot answer a CORS preflight, so they get a plain-text POST (no-cors) and an opaque reply counts as success.
      var gas = /script\.google(usercontent)?\.com/.test(CONFIG.FORM_ENDPOINT);
      var req = gas
        ? fetch(CONFIG.FORM_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) })
        : fetch(CONFIG.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) });
      req
        .then(function (r) { if (!(gas && r.type === "opaque") && !r.ok) throw new Error("HTTP " + r.status); success(d, "api"); })
        .catch(function () {
          // never lose a lead: if the endpoint is unreachable, hand the details to WhatsApp instead
          errBox.textContent = "We couldn't reach our form server, so we opened WhatsApp with your details instead.";
          errBox.classList.add("on");
          success(d, "whatsapp");
        })
        .then(function () { busy = false; btn.disabled = false; label.textContent = old; });
    });
  });
})();
