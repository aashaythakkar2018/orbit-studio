# Orbit Studio — site (Neiden-style layout, Orbit brand)

Static site: `index.html` + `assets/`. No build step needed.
- Run locally: `python3 -m http.server 5177` in this folder, open http://localhost:5177
- Deploy: upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, Hostinger).
- Edit content in `index.src.html`, then `python3 build.py` regenerates `index.html` (inlines the logo).
- Motion: GSAP + ScrollTrigger + Lenis (vendored in assets/vendor). Respects prefers-reduced-motion.
- Fonts: Satoshi (Fontshare, free commercial) + Instrument Serif Italic (OFL), self-hosted.
- Before launch: replace placeholder testimonials, add og-image.png at the site root, verify client links.
