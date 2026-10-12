/* Portfolio browser: filter chips + search + one-screen preview panel (mobile: bottom sheet). No dependencies. */
(function () {
  "use strict";
  var D = window.PF || [], $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cards = $$(".pf-card"), grid = $("#pfgrid"), cnt = $("#pfcount"), empty = $("#pfempty"), q = $("#pfq"), sheet = $("#pfsheet"), sbody = $("#pfsheetbody");
  var filter = "all", cur = 0, mobile = function () { return matchMedia("(max-width:1000px)").matches; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var host = function (u) { return u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); };

  function fill(p, root) {
    var off = p.s === "offline", soon = p.s === "soon";
    $("[data-r=img]", root).src = "../assets/portfolio/" + p.k + ".jpg"; $("[data-r=img]", root).alt = p.n + " website preview";
    $("[data-r=url]", root).textContent = host(p.u);
    $("[data-r=cat]", root).textContent = p.c + " / " + p.t;
    $("[data-r=year]", root).textContent = p.y ? p.y : (off ? "Site offline" : soon ? "Coming soon" : "Live site");
    $("[data-r=name]", root).textContent = p.n; $("[data-r=desc]", root).textContent = p.d;
    $("[data-r=hl]", root).innerHTML = p.h.map(function (h) { return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' + esc(h) + "</li>"; }).join("");
    $("[data-r=chips]", root).innerHTML = p.ch.map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join("");
    var v = $("[data-r=visit]", root), il = $("[data-r=imglink]", root);
    if (off) { v.removeAttribute("href"); v.setAttribute("aria-disabled", "true"); v.classList.add("dis"); v.firstChild.nodeValue = "Site offline "; il.removeAttribute("href"); }
    else { v.href = p.u; v.removeAttribute("aria-disabled"); v.classList.remove("dis"); v.firstChild.nodeValue = "Visit live site "; il.href = p.u; }
  }
  var panel = $("#pfpanel");
  [["pfimg", "img"], ["pfurl", "url"], ["pfcat", "cat"], ["pfyear", "year"], ["pfname", "name"], ["pfdesc", "desc"], ["pfhl", "hl"], ["pfchips", "chips"], ["pfvisit", "visit"], ["pfimglink", "imglink"]].forEach(function (a) { var el = $("#" + a[0]); if (el) el.setAttribute("data-r", a[1]); });

  function visible() { return cards.filter(function (c) { return !c.parentNode.hidden; }); }
  function select(i, scroll) {
    cur = i; cards.forEach(function (c) { var on = +c.getAttribute("data-i") === i; c.classList.toggle("on", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
    fill(D[i], panel);
    var v = visible(), pos = v.findIndex(function (c) { return +c.getAttribute("data-i") === i; });
    $("#pfpos").textContent = (pos + 1) + " / " + v.length;
    if (scroll) { var c = cards[i]; if (c) c.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  }
  function apply() {
    var term = q.value.trim().toLowerCase(), n = 0;
    cards.forEach(function (c) {
      var ok = (filter === "all" || c.getAttribute("data-cat") === filter) && (!term || (c.getAttribute("data-name") + " " + c.getAttribute("data-tags")).indexOf(term) >= 0);
      c.parentNode.hidden = !ok; if (ok) n++;
    });
    cnt.textContent = "Showing " + n + " of " + cards.length + " projects"; empty.hidden = n > 0; panel.style.visibility = n ? "" : "hidden";
    var v = visible(); if (v.length && !v.some(function (c) { return +c.getAttribute("data-i") === cur; })) select(+v[0].getAttribute("data-i"));
    else if (v.length) select(cur);
  }
  $$(".pf-chip").forEach(function (b) { b.addEventListener("click", function () { filter = b.getAttribute("data-f"); $$(".pf-chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); apply(); }); });
  q.addEventListener("input", apply);
  $("#pfreset").addEventListener("click", function () { q.value = ""; $$(".pf-chip")[0].click(); });
  cards.forEach(function (c) { c.addEventListener("click", function () { var i = +c.getAttribute("data-i"); select(i); if (mobile()) openSheet(i); }); });
  function step(d) { var v = visible(); if (!v.length) return; var pos = v.findIndex(function (c) { return +c.getAttribute("data-i") === cur; }); var nx = v[(pos + d + v.length) % v.length]; select(+nx.getAttribute("data-i"), true); }
  $("#pfprev").addEventListener("click", function () { step(-1); }); $("#pfnext").addEventListener("click", function () { step(1); });
  grid.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); cards[cur].focus(); } if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); cards[cur].focus(); } });

  /* mobile: bottom sheet reuses the same markup */
  function openSheet(i) {
    var clone = panel.cloneNode(true); clone.removeAttribute("id"); clone.className = "pf-panel in-sheet";
    $$("[id]", clone).forEach(function (n) { n.removeAttribute("id"); });
    var nav = $(".pf-nav", clone); if (nav) nav.remove();
    sbody.innerHTML = ""; sbody.appendChild(clone); fill(D[i], clone);
    sheet.hidden = false; document.body.style.overflow = "hidden"; $("#pfclose").focus();
  }
  function closeSheet() { sheet.hidden = true; document.body.style.overflow = ""; var c = cards[cur]; if (c) c.focus(); }
  $("#pfclose").addEventListener("click", closeSheet); sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
  addEventListener("resize", function () { if (!mobile() && !sheet.hidden) closeSheet(); });
  apply(); select(0);
})();
