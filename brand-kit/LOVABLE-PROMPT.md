Apply a brand refresh to this site. Keep layout, copy and animations; change only the following.

ASSETS (I will upload these files: orbit-logo-nav.svg, orbit-logo-nav-reversed.svg, orbit-logo-primary.svg, orbit-mark.svg, favicon.svg, favicon-32/180/192/512.png, og-image.png)
1. Replace the header logo PNG with orbit-logo-nav.svg (height 36px desktop / 32px mobile, no tagline). Replace the plain-text "Orbit.Studio" in the footer with orbit-logo-nav-reversed.svg.
2. Favicon: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="icon" href="/favicon-32.png" sizes="32x32">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<meta name="theme-color" content="#F6F2EA">`.
3. Replace og:image with /og-image.png (absolute URL on the live domain), add og:image:width 1200 / height 630, og:url, `twitter:card=summary_large_image`, twitter:image.
4. Self-host the hero orbit icons (no hotlinking to images.shadcnspace.com). Render each as a single-colour glyph (navy #092D3F at 60% opacity). Hide the icon orbit below 640px.

COLOUR TOKENS (replace in index.css / tailwind config)
- Add --gold-text: #8A5A14. Use it for every small gold text on light backgrounds (eyebrows, STEP 0x, LEARN MORE, link hovers, "ORBIT STUDIO · EST. 2024").
- Large gold display words on light backgrounds ("scale" in H1, "worth scaling."): #8A5A14 as well (or #B77F31 at ≥48px). On navy sections keep #D2A14F.
- Keep --gold #D2A14F only for dots, rules, buttons on navy, the orb.
- Replace alpha text colours (text-navy-deep/65 etc.) with solid #3F5969. Minimum text size 12px.
- --destructive: #B3261E.

TYPOGRAPHY
- Load only Satoshi 400, 500, 700 (Fontshare). Remove 300/600/800/900 and replace every font-semibold with font-bold (700) — Satoshi has no 600.
- Load Instrument Serif (regular + italic) from Google Fonts. Use it ONLY for accent words ("scale", "agency theatre.", "worth scaling.") as `font-style: italic; font-weight: 400` at 1.08em, and for the testimonial quote marks. Remove the faux italic.
- Headings: H1 clamp(2.5rem,5.2vw,4.5rem) lh 1.04 tracking -0.03em; H2 clamp(2rem,3.6vw,3.25rem) lh 1.08.
- Scroll-reveal headings: start colour no lighter than #5B7383.

HERO / LAYOUT
- Remove the dark/grey blur halo around the gold orb; use a radial gradient (#E3B461 → #D2A14F → #B77F31) + the dot texture.
- Orb must not overlap the stat row: place it behind (z-index -1), clipped to the right column; stats stay fully legible.
- Reduce the empty gap below the Work carousel (section padding py-24 / lg:py-32).
- Mobile (<640px): stack headline → paragraph → CTAs → orb below.
- Redirect orbitstudio.in → https://orbitstudio.co.in (301).
