(() => {
  // a refresh must never restore a mid-page scroll position underneath the preloader
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const EASE = "expo.out";

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!RM) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.stop();
  }
  const scrollTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView();
    if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
  };
  function initPage() {
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      if (a.hasAttribute("data-m")) closeMenu(() => scrollTo(id));
      else scrollTo(id);
    })
  );

  /* ---------- splitting ----------
     "words": flat <span class="w"> (no overflow mask, so ink can never be clipped).
     "chars": <span class="rww"> word wrapper (never breaks mid-word) holding one <span class="rw"> per letter. */
  function splitWords(root, mode) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) return frag.appendChild(document.createTextNode(" "));
            if (mode === "chars") {
              const ww = document.createElement("span"); ww.className = "rww";
              [...p].forEach((ch) => { const c = document.createElement("span"); c.className = "rw"; c.textContent = ch; ww.appendChild(c); });
              frag.appendChild(ww);
            } else { const w = document.createElement("span"); w.className = "w"; w.textContent = p; frag.appendChild(w); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
  }
  const word = $("#wchars");
  word.innerHTML = [...word.textContent].map((c) => `<span class="ch">${c}</span>`).join("");
  $$("[data-split]").forEach((el) => splitWords(el));
  $$(".stmt").forEach((el) => splitWords(el, "chars"));

  /* ---------- ticker ---------- */
  const caps = ["Editorial websites","AI automation","Performance marketing","Lifecycle CRM","Analytics engineering","Paid media","SEO systems","Motion & interaction","Design systems","Conversion optimization"];
  const group = caps.map((c) => `<span>${c}</span><i></i>`).join("");
  $("#track").innerHTML = [0, 1].map(() => `<div class="item">${group}</div>`).join("");

  /* ---------- clock (IST) ---------- */
  const clock = $("#clock"), fclock = $("#fclock");
  const tick = () => {
    const tm = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()) + " IST";
    clock.textContent = tm;
    if (fclock) fclock.textContent = "Surat, IN, " + tm;
  };
  tick(); setInterval(tick, 1000);

  /* ---------- initial states ---------- */
  const heroFade = $$("#hero [data-fade]");
  const chars = $$(".ch", word);
  if (!RM) {
    gsap.set(chars, { yPercent: 105, filter: "blur(18px)", opacity: 0 });
    gsap.set(heroFade, { y: 20, opacity: 0, filter: "blur(6px)" });
    gsap.set($("#nav"), { yPercent: -100 });
    gsap.set($("#fcta"), { yPercent: 160 });
    gsap.set("#wa", { scale: 0, opacity: 0 });
  }
  gsap.set(".menu .mring", { opacity: 0, scale: 0.9 });
  gsap.set("#mstage", { opacity: 0, scale: 0.86 });
  gsap.set("#mcta", { y: 20, opacity: 0 });

  /* ---------- shared: particle globe + comet satellite (used by the hero and the menu icon) ---------- */
  const GOLD = [210, 161, 79], NAVY = [9, 45, 63], rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const makeGlobe = (cv, N) => {   // backing store is >= 2x (up to 3x) the CSS size so the particles render crisp on 4K / retina
    const ctx = cv.getContext("2d"), dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1)), pts = [], ga = Math.PI * (3 - Math.sqrt(5));
    let w = 0, h = 0, mx = 0, my = 0, rot = 0;
    const size = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = ga * i; pts.push({ x: Math.cos(th) * rad, y, z: Math.sin(th) * rad }); }
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.15);
      g.addColorStop(0, rgba(GOLD, 0.07)); g.addColorStop(0.55, rgba(GOLD, 0.03)); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fill();
      const a = rot + mx * 0.3, t = -0.35 + my * 0.18, ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(t), st = Math.sin(t), P = [];
      for (let i = 0; i < N; i++) {
        const p = pts[i], x1 = p.x * ca + p.z * sa, z1 = -p.x * sa + p.z * ca, y2 = p.y * ct - z1 * st, z2 = p.y * st + z1 * ct, k = 1 / (1.6 - z2 * 0.5);
        P.push({ sx: cx + x1 * R * k, sy: cy + y2 * R * k, d: z2, s: 0.5 + k * 0.95 });
      }
      P.sort((u, v) => u.d - v.d);
      for (let i = 0; i < P.length; i++) {
        const p = P[i], n = (p.d + 1) / 2, al = 0.18 + n * 0.75, front = n > 0.55;
        ctx.fillStyle = rgba(front ? GOLD : NAVY, al * (front ? 1 : 0.38));
        ctx.beginPath(); ctx.arc(p.sx, p.sy, p.s * (front ? 1 : 0.85), 0, Math.PI * 2); ctx.fill();
      }
    };
    size(); draw();
    new ResizeObserver(() => { size(); draw(); }).observe(cv);
    if (!RM) addEventListener("mousemove", (e) => { const r = cv.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - 0.5) * 2; my = ((e.clientY - r.top) / r.height - 0.5) * 2; }, { passive: true });
    return { draw, step: (dt) => { rot += 0.16 * (dt / 1000); draw(); } };   // 0.0035 rad/frame @60fps, frame-rate independent
  };
  // satellite on a tilted ellipse with a comet trail; it passes behind the mark on the far side and in front on the near side
  const makeSat = (back, front, show0) => {
    const cx = 120, cy = 125, rx = 108, ry = 34, tilt = (-24 * Math.PI) / 180, N = back.length, sat = { a: -0.6, show: show0 };
    const place = () => {
      for (let i = 0; i < N; i++) {
        const th = sat.a - i * 0.13, ex = rx * Math.cos(th), ey = ry * Math.sin(th);
        const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
        const fr = Math.sin(th) > 0, k = (1 - i / N) * sat.show;
        front[i].setAttribute("cx", x); front[i].setAttribute("cy", y); front[i].setAttribute("opacity", fr ? k : 0);
        back[i].setAttribute("cx", x); back[i].setAttribute("cy", y); back[i].setAttribute("opacity", fr ? 0 : k * 0.55);
      }
    };
    place();
    return { sat, place };
  };

  /* ---------- preloader + intro ---------- */
  let startPre = () => {};
  let orbitIn = () => {};
  const startIntro = () => {
    document.body.classList.remove("is-loading");
    if (lenis) lenis.start();
    if (RM) return;
    const t = gsap.timeline({ defaults: { ease: EASE } });
    t.to(chars, { yPercent: 0, filter: "blur(0px)", opacity: 1, duration: 1.6, stagger: 0.09 }, 0)
     .to($("#tagline"), { clipPath: "inset(-45% -8% -45% -12%)", duration: 1.8, ease: "power3.inOut" }, 0.55)
     .to(heroFade, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.08 }, 0.7)
     .add(() => orbitIn(), 0.5)
     .to($("#nav"), { yPercent: 0, duration: 1.1 }, 0.6)
     .to($("#fcta"), { yPercent: 0, duration: 1.1 }, 1.0)
     .to("#wa", { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.7)", clearProps: "transform" }, 1.3);
  };
  if (RM) { $("#pre").remove(); gsap.ticker.lagSmoothing(0); startIntro(); }
  else {
    const pre = $("#pre"), vid = $("#pvid"), cnt = $("#cnt"), pbar = $("#pbar");
    const seen = false; // the full preloader plays on every load and refresh
    const D = seen ? 2.4 : 4.4;

    // generated video = ambient backdrop only; the orbit itself is live SVG so it never depends on autoplay
    const showVid = () => { if (vid.currentTime > 0 || !vid.paused) gsap.to(vid, { opacity: 0.9, duration: 1.4 }); };
    if (!seen) { vid.addEventListener("playing", showVid, { once: true }); vid.play().catch(() => {}); } else vid.remove();

    const { sat, place } = makeSat($$("#pBack .sb"), $$("#pFront .sf"), 0);
    gsap.set($("#pNode"), { scale: 0, transformOrigin: "50% 50%" });

    const o = { v: 0 };
    const tl = gsap.timeline({ paused: true, onComplete: () => { pre.remove(); gsap.ticker.lagSmoothing(0); } });
    tl.to($("#pGuide"), { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0.1)
      .to($("#pRing"), { strokeDashoffset: 0, duration: seen ? 0.9 : 1.5, ease: "power2.inOut", onComplete: () => $("#pRing").setAttribute("stroke-dasharray", "none") }, 0.2)
      .to($("#pArc"), { strokeDashoffset: 0, duration: seen ? 0.5 : 0.8, ease: "power2.out" }, seen ? 0.8 : 1.3)
      .to($("#pNode"), { scale: 1, duration: 0.6, ease: "back.out(2.4)" }, seen ? 1.2 : 1.95)
      .to(sat, { show: 1, duration: 0.5, ease: "none" }, seen ? 1.0 : 1.6)
      .to(sat, { a: Math.PI * (seen ? 3.2 : 6.4) - 0.6, duration: D - 0.9, ease: "power1.inOut", onUpdate: place }, 0.9)
      .to(o, { v: 100, duration: D, ease: "power2.inOut", onUpdate: () => { cnt.textContent = String(Math.round(o.v)).padStart(3, "0"); gsap.set(pbar, { scaleX: o.v / 100 }); } }, 0)
      .to($("#pre .orb"), { scale: 1.08, duration: D, ease: "none" }, 0)
      .add(startIntro, D - 0.1)
      .to(pre, { yPercent: -100, duration: 1.15, ease: "power4.inOut" }, D)
      .to($("#pre .stage"), { yPercent: 18, scale: 0.9, duration: 1.15, ease: "power4.inOut" }, D);
    startPre = () => { window.scrollTo(0, 0); tl.play(0); };
  }

  /* hero orbit — particle globe ported from orbitstudio.co.in (rings + icons are pure CSS, see .orbit in style.css) */
  {
    const box = $("#orbit"), globe = makeGlobe($("#globeCv"), 1200);
    if (!RM) {
      let vis = true;
      new IntersectionObserver((en) => { vis = en[0].isIntersecting; }).observe($("#hero"));
      gsap.ticker.add((_, dt) => { if (vis) globe.step(dt); });
      gsap.set(box, { opacity: 0, scale: 0.92 });
      orbitIn = () => gsap.to(box, { opacity: 1, scale: 1, duration: 1.8, ease: EASE });
    }
  }

  /* hero scroll motion */
  if (!RM) {

    gsap.to("#orbit", { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(word, { yPercent: 14, opacity: 0.4, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- scroll reveals ----------
     Values measured on neiden.framer.media (hidden state, trigger point, duration, stagger) and applied to Orbit content:
       head  : words rise 20px, ~140ms apart, settle ~0.4s, start when the top reaches 90% of the viewport
       title : words rise 50px, ~110ms apart, settle ~0.3s, start at 98%
       text  : paragraphs rise 30px, ~0.7s, start at 85%      block: rise 40px, ~0.7s      card: rise 70px
       label : each bracket/word rises 10px while un-blurring from 10px
       blur  : opacity + blur(8px) -> sharp      zoom: images scale 1.3 + blur(8px) -> 1, 1s on cubic-bezier(.74,.03,.44,.95)
       stmt  : every letter fills 8% -> 100% opacity, scrubbed by scroll
       odo   : counters roll like an odometer (digit strips 0..n)
     Springs are critically damped (bounce 0) like the reference's "spring" transitions. */
  const spring = (() => { const k = 6.64, n = 1 - (1 + k) * Math.exp(-k); return (t) => (1 - (1 + k * t) * Math.exp(-k * t)) / n; })();
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => { let t = x; for (let i = 0; i < 8; i++) { const e = X(t) - x; if (Math.abs(e) < 1e-5) break; const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= e / d; } return Y(Math.min(1, Math.max(0, t))); };
  };
  const IMG_EASE = bezier(0.74, 0.03, 0.44, 0.95);
  const RV = {
    head: { from: { y: 20 }, dur: 0.41, stag: 0.14, start: "top 90%", split: true },
    title: { from: { y: 50 }, dur: 0.3, stag: 0.11, start: "top 98%", split: true },
    text: { from: { y: 30 }, dur: 0.68, start: "top 85%" },
    block: { from: { y: 40 }, dur: 0.68, start: "top 92%" },
    card: { from: { y: 70 }, dur: 0.75, start: "top 92%" },
    label: { from: { y: 10, filter: "blur(10px)" }, dur: 0.64, stag: 0.08, start: "top 98%", kids: true },
    fade: { from: {}, dur: 0.5, start: "top 95%" },
    blur: { from: { filter: "blur(8px)" }, dur: 0.8, start: "top 90%" },
    zoom: { from: { scale: 1.3, filter: "blur(8px)" }, dur: 1, ease: IMG_EASE, start: "top 92%" },
  };
  const to0 = (from) => { const o = {}; for (const k in from) o[k] = k === "filter" ? "blur(0px)" : k === "scale" ? 1 : 0; return o; };
  const reveal = (el, type, opts = {}) => {
    const c = RV[type]; if (!c || !el) return;
    const targets = c.split ? $$(".w", el) : c.kids ? $$(":scope > span", el) : [el];
    if (!targets.length) return;
    gsap.set(targets, { opacity: 0.001, ...c.from });
    ScrollTrigger.create({ trigger: opts.trigger || el, start: c.start, once: true, onEnter: () =>
      gsap.to(targets, { ...to0(c.from), opacity: 1, duration: c.dur, ease: c.ease || spring, stagger: c.stag || 0,
        onComplete: () => gsap.set(targets, { clearProps: opts.keepTransform ? "opacity,filter" : "opacity,transform,filter" }) }) });
  };
  // odometer counters: one column per digit, strip 0..n, rolling to n (like the reference's stat counters)
  const buildOdo = (el) => {
    const dec = +(el.dataset.dec || 0), val = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", str = val.toFixed(dec), cols = [];
    el.setAttribute("aria-label", str + suf); el.textContent = "";
    [...str].forEach((ch) => {
      if (/\d/.test(ch)) {
        const d = +ch, od = document.createElement("span"); od.className = "od"; od.setAttribute("aria-hidden", "true");
        const ph = document.createElement("span"); ph.className = "ph0"; ph.textContent = ch;             // in-flow placeholder: width + baseline
        const strip = document.createElement("span"); strip.className = "dc";
        for (let k = 0; k <= d; k++) { const i = document.createElement("i"); i.textContent = k; strip.appendChild(i); }
        od.append(ph, strip); el.appendChild(od); cols.push({ strip, d });
      } else { const s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.textContent = ch; el.appendChild(s); }
    });
    if (suf) { const em = document.createElement("em"); em.setAttribute("aria-hidden", "true"); em.textContent = suf; el.appendChild(em); }
    return cols;
  };
  const odoShow = (cols) => cols.forEach(({ strip, d }) => gsap.set(strip, { yPercent: d ? -(100 * d) / (d + 1) : 0 }));
  if (!RM) {
    $$("[data-split]").forEach((el) => reveal(el, el.dataset.rv || (parseFloat(getComputedStyle(el).fontSize) >= 56 ? "head" : "title")));
    $$("[data-fade]").filter((el) => !el.closest("#hero")).forEach((el) => reveal(el, el.dataset.rv || (el.matches(".label") ? "label" : el.matches(".btn,.link,.totop,.tags,.chip") ? "fade" : "text")));
    $$("[data-rv]:not([data-split]):not([data-fade])").forEach((el) => reveal(el, el.dataset.rv));
    // statements: every letter fills 8% -> 100% as you scroll
    $$(".stmt").forEach((st) => { const rw = $$(".rw", st); if (rw.length) gsap.to(rw, { opacity: 1, ease: "none", duration: 0.5, stagger: { each: 0.5 / rw.length }, scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 45%", scrub: true } }); });
    // counters
    $$("[data-count]").forEach((el) => {
      const cols = buildOdo(el); gsap.set(cols.map((c) => c.strip), { yPercent: 0 });
      ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => cols.forEach(({ strip, d }, i) => d && gsap.to(strip, { yPercent: -(100 * d) / (d + 1), duration: 1.5, ease: spring, delay: i * 0.1 })) });
    });
    // "Build" tile: a cursor assembles the page block by block, holds, then clears and starts again
    const buildLoop = (art) => {
      const svg = $("svg", art), frame = $("svg > rect", art), line = $("svg > path:not(#bcur)", art), dots = $$("svg > circle", art);
      const [b1, b2, b3, b4, b5, b6] = [".b1", ".b2", ".b3", ".b4", ".b5", ".b6"].map((s) => $(s, art)), cur = $("#bcur", art);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: art, start: "top 92%", end: "bottom 8%", toggleActions: "play pause resume pause" } });
      const grow = (el, x, y, x2, y2, at, d) => {   // cursor drags a corner; the block scales with it
        tl.fromTo(cur, { x, y, opacity: 1 }, { x: x2, y: y2, duration: d, ease: "power2.inOut" }, at)
          .fromTo(el, { scaleX: 0, scaleY: 0.02, opacity: 1, transformOrigin: "0% 0%" }, { scaleX: 1, scaleY: 1, duration: d, ease: "power2.inOut" }, at);
      };
      tl.fromTo([frame, line, ...dots], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05 }, 0)
        .fromTo(cur, { opacity: 0, x: 40, y: 60 }, { opacity: 1, duration: 0.3 }, 0.5);
      grow(b1, 60, 92, 210, 178, 0.9, 1.0);
      grow(b2, 226, 92, 340, 130, 2.1, 0.7);
      grow(b3, 226, 140, 340, 178, 2.9, 0.7);
      [b4, b5, b6].forEach((el, i) => {
        const x = [60, 150, 240][i], w = [80, 80, 100][i];
        tl.to(cur, { x: x + w, y: 216, duration: 0.55, ease: "power2.inOut" }, 3.8 + i * 0.5)
          .fromTo(el, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7 }, 3.9 + i * 0.5);
      });
      tl.to(cur, { x: 300, y: 262, opacity: 0, duration: 0.6, ease: "power2.inOut" }, 5.5)
        .to([frame, line, ...dots, b1, b2, b3, b4, b5, b6], { opacity: 0, duration: 0.6, ease: "power2.in" }, 7.4);
    };

    // service art
    $$("[data-art]").forEach((art, i) => {
      const parts = $$("svg > *", art).filter((n) => n.tagName !== "defs");
      gsap.set(art, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(art.firstElementChild, { scale: 1.25, transformOrigin: "50% 50%" });
      ScrollTrigger.create({ trigger: art, start: "top 85%", once: true, onEnter: () => {
        gsap.to(art, { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power4.inOut" });
        gsap.to(art.firstElementChild, { scale: 1, duration: 2, ease: EASE });
        if (i === 0) buildLoop(art);
        if (i === 2) gsap.from($$("#bars rect", art), { scaleY: 0, transformOrigin: "50% 100%", duration: 1.3, stagger: 0.12, delay: 0.5, ease: EASE });
      } });
      gsap.to(art.firstElementChild, { yPercent: -5, ease: "none", scrollTrigger: { trigger: art, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.to("#sc", { rotation: 360, svgOrigin: "280 96", duration: 16, ease: "none", repeat: -1 });

    // work: stacked cards + parallax
    const cases = $$("[data-case]");
    cases.forEach((c, i) => {
      const img = $("img", c), box = $(".box", c), info = $$(".info > div", c), idx = $(".idx", c);
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.set(info, { y: 40, opacity: 0 });
      ScrollTrigger.create({ trigger: c, start: "top 55%", once: true, onEnter: () => gsap.to(info, { y: 0, opacity: 1, duration: 1.2, ease: EASE, stagger: 0.1 }) });
      gsap.set(img, { opacity: 0.001, scale: 1.3, filter: "blur(8px)" });
      ScrollTrigger.create({ trigger: c, start: "top 85%", once: true, onEnter: () => gsap.to(img, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: IMG_EASE, onComplete: () => gsap.set(img, { clearProps: "opacity,filter" }) }) });
      const next = cases[i + 1];
      if (next) gsap.to(box, { scale: 0.93, opacity: 0.3, ease: "none", transformOrigin: "50% 100%", scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true } });
    });

    // steps slider
    const grid = $("#sgrid"), slider = $("#slider"), cells = $$(".cell", grid);
    const move = (cell, instant) => {
      cells.forEach((c) => c.classList.toggle("is-on", c === cell));
      const set = () => { slider.style.width = cell.offsetWidth + "px"; slider.style.height = cell.offsetHeight + "px"; slider.style.transform = `translate(${cell.offsetLeft}px,${cell.offsetTop}px)`; };
      if (instant) { slider.style.transition = "none"; set(); slider.offsetHeight; slider.style.transition = ""; } else set();
    };
    if (matchMedia("(min-width:901px)").matches) {
      move(cells[0], true);
      cells.forEach((c) => c.addEventListener("mouseenter", () => move(c)));
      addEventListener("resize", () => move($(".cell.is-on", grid) || cells[0], true));
    } else cells[0].classList.remove("is-on");
    cells.forEach((c, i) => { gsap.from(c, { y: 50, opacity: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: c, start: "top 92%", once: true } }); });
  } else {
    $$(".stmt .rw").forEach((w) => (w.style.opacity = 1));
    $$("[data-count]").forEach((el) => odoShow(buildOdo(el)));
  }

    /* ---------- founder portrait ---------- */
    {
      const frame = $("#fframe"), img = $("#fimg"), file = $("#ffile");
      const setPhoto = (src, local) => {
        img.onload = () => { img.hidden = false; frame.dataset.state = "photo"; if (local) frame.dataset.local = "1"; ScrollTrigger.refresh(); };
        img.src = src;
      };
      // 1) a real file the owner dropped into assets/  2) a browser-only preview upload
      const probe = new Image();
      probe.onload = () => setPhoto(probe.src, false);
      probe.onerror = () => { try { const d = localStorage.getItem("orbit-founder"); if (d) setPhoto(d, true); } catch (e) {} };
      probe.src = "assets/founder.jpg";
      const handle = (f) => {
        if (!f || !/^image\//.test(f.type)) return;
        const r = new FileReader();
        r.onload = () => {
          const im = new Image();
          im.onload = () => {
            const k = Math.min(1, 1400 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
            cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
            cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
            const url = cv.toDataURL("image/jpeg", 0.88);
            try { localStorage.setItem("orbit-founder", url); } catch (e) {}
            setPhoto(url, true);
          };
          im.src = r.result;
        };
        r.readAsDataURL(f);
      };
      $("#fup").addEventListener("click", () => file.click());
      file.addEventListener("change", () => handle(file.files[0]));
      ["dragenter", "dragover"].forEach((ev) => frame.addEventListener(ev, (e) => { e.preventDefault(); frame.classList.add("drag"); }));
      ["dragleave", "drop"].forEach((ev) => frame.addEventListener(ev, (e) => { e.preventDefault(); frame.classList.remove("drag"); }));
      frame.addEventListener("drop", (e) => handle(e.dataTransfer.files[0]));
      frame.addEventListener("dblclick", () => { if (frame.dataset.local === "1") file.click(); });

      if (!RM) {
        // reveal (reference image effect: scale 1.3 + blur 8px -> sharp) + parallax
        gsap.set($(".fcorner", frame), { scaleX: 0 });
        gsap.set(img, { opacity: 0.001, scale: 1.3, filter: "blur(8px)" });
        gsap.set($(".empty > svg", frame), { scale: 1.2 });
        ScrollTrigger.create({ trigger: "#portrait", start: "top 88%", once: true, onEnter: () => {
          gsap.to(img, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: IMG_EASE });
          gsap.to($(".empty > svg", frame), { scale: 1, duration: 1.4, ease: IMG_EASE });
          gsap.to($(".fcorner", frame), { scaleX: 1, duration: 0.9, ease: spring, delay: 0.5 });
          gsap.from("#frot", { scale: 0, rotation: -120, duration: 1.2, ease: spring, delay: 0.7 });
        } });
        gsap.fromTo(img, { yPercent: 0 }, { yPercent: -4, ease: "none", scrollTrigger: { trigger: "#portrait", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.to("#frot", { rotation: "+=360", duration: 22, ease: "none", repeat: -1 });
        // satellite orbiting the frame: behind the photo on the far side, in front on the near side
        const cx = 50, cy = 62, rx = 44, ry = 13, tilt = (-16 * Math.PI) / 180, N = 6, sat = { a: 0.4 };
        const fb = $$("#fBack .fsb"), ff = $$("#fFront .fsf");
        const place = () => {
          for (let i = 0; i < N; i++) {
            const th = sat.a - i * 0.1, ex = rx * Math.cos(th), ey = ry * Math.sin(th);
            const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
            const fr = Math.sin(th) > 0, k = 1 - i / N;
            ff[i].setAttribute("cx", x); ff[i].setAttribute("cy", y); ff[i].setAttribute("opacity", fr ? k : 0);
            fb[i].setAttribute("cx", x); fb[i].setAttribute("cy", y); fb[i].setAttribute("opacity", fr ? 0 : k * 0.6);
          }
        };
        place();
        gsap.to(sat, { a: Math.PI * 2 + 0.4, duration: 11, ease: "none", repeat: -1, onUpdate: place, scrollTrigger: { trigger: "#portrait", start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" } });
      }
    }

  /* ---------- footer outlined wordmark ---------- */
  {
    const wo = $("#bwo"), ws = $("#bws");
    wo.innerHTML = [...wo.textContent].map((ch) => `<span class="ch">${ch}</span>`).join("");
    if (!RM) {
      const chars = $$(".ch", wo);
      gsap.set(chars, { yPercent: 105 });
      gsap.set(ws, { clipPath: "inset(-30% 100% -30% -10%)" });
      ScrollTrigger.create({ trigger: ".foot .bw", start: "top 96%", once: true, onEnter: () => {
        gsap.to(chars, { yPercent: 0, duration: 1.5, ease: EASE, stagger: 0.07 });
        gsap.to(ws, { clipPath: "inset(-30% -12% -30% -10%)", duration: 1.8, ease: "power3.inOut", delay: 0.35 });
      } });
    }
  }

  /* ---------- nav behaviour ---------- */
  const nav = $("#nav"), fcta = $("#fcta");
  ScrollTrigger.create({ start: 40, end: "max", onUpdate: (s) => {
    nav.classList.toggle("is-solid", s.scroll() > 40);
    if (!RM) nav.classList.toggle("is-hidden", s.direction === 1 && s.scroll() > 500);
  } });
  nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));
  $$(".dark, .foot").forEach((sec) => {
    ScrollTrigger.create({ trigger: sec, start: "top 32px", end: "bottom 32px", onToggle: (s) => nav.classList.toggle("is-dark", s.isActive) });
    ScrollTrigger.create({ trigger: sec, start: "top bottom-=40px", end: "bottom bottom-=40px", onToggle: (s) => fcta.classList.toggle("on-dark", s.isActive) });
  });

  if (!RM) ScrollTrigger.create({ trigger: ".foot", start: "top bottom-=120px", onToggle: (s) => gsap.to(fcta, { yPercent: s.isActive ? 140 : 0, autoAlpha: s.isActive ? 0 : 1, duration: 0.8, ease: EASE, overwrite: true }) });

  const navLinks = $$(".nav li a");
  [["#services", "#services"], ["#work", "#work"], ["#about", "#about"], ["#founder", "#about"], ["#contact", "#contact"]].forEach(([sec, link]) => {
    const a = navLinks.find((x) => x.getAttribute("href") === link);
    if (!a || !$(sec)) return;
    ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) { navLinks.forEach((x) => x.removeAttribute("aria-current")); a.setAttribute("aria-current", "true"); } else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current"); } });
  });

  /* ---------- menu ----------
     Centre icon = the preloader mark, already fully drawn (no counter, no progress bar, no draw-in).
     Its satellite and the dotted planet keep moving for as long as the menu is open, and pause when it is closed. */
  const menu = $("#menu"), burger = $("#burger");
  let menuTl, menuOpen = false;
  const msat = makeSat($$("#mBack .mb"), $$("#mFront .mf"), 1), mglobe = makeGlobe($("#mGlobe"), 1000);
  if (!RM) gsap.ticker.add((_, dt) => { if (!menuOpen) return; msat.sat.a += 1.1 * (dt / 1000); msat.place(); mglobe.step(dt); });
  const setInert = (on) => $$("main,.foot,.nav,.fixed-cta,.wa,.skip").forEach((el) => (el.inert = on));
  const openMenu = () => {
    burger.setAttribute("aria-expanded", "true");
    setInert(true);
    menuOpen = true;
    if (lenis) lenis.stop();
    menuTl && menuTl.kill();
    menuTl = gsap.timeline();
    menuTl.set(menu, { visibility: "visible" })
      .to(menu, { clipPath: "inset(0 0 0% 0)", duration: 1, ease: "expo.inOut" })
      .to("#mstage", { opacity: 1, scale: 1, duration: 1.2, ease: EASE }, 0.3)
      .to(".menu .mring", { opacity: 1, scale: 1, duration: 1.3, ease: EASE, stagger: 0.1 }, 0.4)
      .to("#mcta", { y: 0, opacity: 1, duration: 0.9, ease: EASE }, 0.7);
    $("#mclose").focus({ preventScroll: true });
  };
  function closeMenu(cb) {
    burger.setAttribute("aria-expanded", "false");
    menuTl && menuTl.kill();
    menuTl = gsap.timeline({ onComplete: () => { menuOpen = false; gsap.set(menu, { visibility: "hidden" }); gsap.set(".menu .mring", { opacity: 0, scale: 0.9 }); gsap.set("#mstage", { opacity: 0, scale: 0.86 }); gsap.set("#mcta", { y: 20, opacity: 0 }); if (lenis) lenis.start(); setInert(false); burger.focus({ preventScroll: true }); cb && cb(); } });
    menuTl.to(menu, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.inOut" });
  }
  burger.addEventListener("click", openMenu);
  $("#mclose").addEventListener("click", () => closeMenu());
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.style.visibility === "visible") closeMenu(); });

  /* ---------- testimonials ---------- */
  const qs = $$(".q"), qn = $("#qn"), bar = $("#qbar");
  let qi = 0, qTl, busy = false;
  const dur = 7;
  const autoplay = () => {
    qTl && qTl.kill();
    if (RM) return;
    gsap.set(bar, { scaleX: 0 });
    qTl = gsap.to(bar, { scaleX: 1, duration: dur, ease: "none", onComplete: () => show(qi + 1) });
  };
  function show(n) {
    if (busy) return;
    const to = (n + qs.length) % qs.length;
    if (to === qi) return;
    busy = true;
    const out = qs[qi], inn = qs[to];
    const parts = (q) => [$(".mark", q), $("blockquote", q), $(".who", q)];
    if (RM) { out.classList.remove("on"); inn.classList.add("on"); qi = to; qn.textContent = String(qi + 1).padStart(2, "0"); busy = false; return; }
    gsap.to(parts(out), { y: -30, opacity: 0, filter: "blur(8px)", duration: 0.6, ease: "power3.in", stagger: 0.04, onComplete: () => {
      out.classList.remove("on"); inn.classList.add("on"); qi = to; qn.textContent = String(qi + 1).padStart(2, "0");
      gsap.fromTo(parts(inn), { y: 44, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.1, ease: EASE, stagger: 0.08, onComplete: () => { busy = false; autoplay(); } });
    } });
  }
  $("#next").addEventListener("click", () => show(qi + 1));
  $("#prev").addEventListener("click", () => show(qi - 1));
  const qw = $("#qwrap");
  qw.addEventListener("mouseenter", () => qTl && qTl.pause());
  qw.addEventListener("mouseleave", () => qTl && qTl.play());
  ScrollTrigger.create({ trigger: qw, start: "top 80%", once: true, onEnter: autoplay });

  /* ---------- cursor + hover thumbnails ----------
     Hover state is derived from what is actually under the pointer (elementFromPoint) on every
     mouse move AND every scroll tick, so nothing can stay "stuck" when the page scrolls under a still mouse. */
  if (fine && !RM) {
    const cur = $("#cursor"), lab = $("span", cur), thumb = $("#thumb");
    const cx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" }), cy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    const tx = gsap.quickTo(thumb, "x", { duration: 0.6, ease: "power3" }), ty = gsap.quickTo(thumb, "y", { duration: 0.6, ease: "power3" });
    $$("#index .irow").forEach((r) => { const im = new Image(); im.src = r.dataset.thumb; im.alt = ""; thumb.appendChild(im); r._im = im; });
    gsap.set(thumb, { autoAlpha: 0, scale: 0.7 });
    const big = (w, text) => { gsap.to(cur, { width: w, height: w, margin: -w / 2, duration: 0.5, ease: EASE, overwrite: "auto" }); gsap.to(lab, { opacity: text ? 1 : 0, scale: text ? 1 : 0.6, duration: 0.4 }); };
    let lx = -1, ly = -1, row = null, view = null, link = null, raf = 0, seen = false;
    const sync = () => {
      raf = 0;
      if (lx < 0) return;
      const el = document.elementFromPoint(lx, ly);
      const r = el && el.closest("#index .irow"), v = el && el.closest("[data-view]");
      const l = !v && el && el.closest("[data-cursor-hover],a,button");
      if (r !== row) {
        row = r;
        if (r) { $$("img", thumb).forEach((i) => i.classList.toggle("on", i === r._im)); gsap.to(thumb, { autoAlpha: 1, scale: 1, duration: 0.6, ease: EASE, overwrite: "auto" }); }
        else gsap.to(thumb, { autoAlpha: 0, scale: 0.7, duration: 0.4, ease: EASE, overwrite: "auto" });
      }
      if (v !== view) { view = v; big(v ? 92 : 12, !!v); }
      if (l !== link) { link = l; gsap.to(cur, { scale: l ? 2.4 : 1, opacity: l ? 0.45 : 1, duration: 0.4, ease: EASE, overwrite: "auto" }); }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(sync); };
    const reset = () => { lx = ly = -1; row = view = link = null; gsap.to(cur, { opacity: 0, duration: 0.3 }); gsap.to(thumb, { autoAlpha: 0, scale: 0.7, duration: 0.3, overwrite: "auto" }); seen = false; };
    addEventListener("mousemove", (e) => {
      lx = e.clientX; ly = e.clientY;
      if (!seen) { seen = true; gsap.to(cur, { opacity: 1, duration: 0.4 }); }
      cx(lx); cy(ly); tx(lx + 30); ty(ly - 110); req();
    }, { passive: true });
    if (lenis) lenis.on("scroll", req);
    addEventListener("resize", req);
    document.addEventListener("mouseleave", reset);
    addEventListener("blur", reset);
    document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });
  }

  /* magnetic buttons */
  if (fine && !RM) $$(".btn,.fixed-cta,.totop").forEach((b) => {
    const mx = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" }), my = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
    b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.18); my((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener("mouseleave", () => { mx(0); my(0); });
  });

    ScrollTrigger.refresh();
    // start the preloader on a fresh clock only after all heavy setup is done
    requestAnimationFrame(() => requestAnimationFrame(() => startPre()));
  }

  /* ---------- boot: load first, init, then run the preloader ---------- */
  const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([Promise.all([loaded, fonts]), new Promise((r) => setTimeout(r, 6000))]).then(() => requestAnimationFrame(initPage));
})();
