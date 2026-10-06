# Orbit Studio — Brand & Visual Audit (orbitstudio.co.in)

Audited 4 Oct 2026, desktop + 375px mobile. Note: orbitstudio.in is only a Hostinger parked page; point it (301) to orbitstudio.co.in.

## Findings

### Assets
| # | Issue | Evidence | Fix (in this kit) |
|---|-------|----------|-------------------|
| A1 | Logo is a 1660×417 **raster PNG** with noisy anti-aliasing (thousands of near-identical navy shades) | `orbit-logo.png`, rendered at 175×44 | Clean vector set: `logo/*.svg` + PNG |
| A2 | Logo wordmark is a **different typeface** (geometric, Poppins-like) from the site's Satoshi | nav vs. headline | Wordmark re-set in Satoshi Medium, outlined |
| A3 | Logo navy `#273748` ≠ site navy `#092D3F` | pixel sample | Logo uses `#092D3F` |
| A4 | Logo tagline ≈ 8px at nav size — illegible; its gold "SCALE." is 2.3:1 | 44px-high logo | Nav lockup has no tagline; tagline only in primary lockup, gold-text `#8A5A14` |
| A5 | **Three different logo treatments**: nav raster lockup, footer plain text "Orbit.Studio", OG card "Orbit.Studio" (bold, system font) | nav / footer / og | One lockup system (primary, nav, reversed, mono, mark) |
| A6 | Favicon is a 64×64 raster of the full mark — mush at 16/32px; no `apple-touch-icon`, no SVG favicon, no `theme-color` | `/favicon.png` | `icons/favicon.svg`, 32/180/192/512 PNG, bolder simplified mark on navy |
| A7 | **OG image is a stale Lovable preview** (`…lovable.app….png` on an r2.dev host), rendered in fallback system font, old wordmark, cropped hero. No `twitter:card`. | `og:image` meta | `social/og-image.png` 1200×630 — on brand |
| A8 | Hero orbit icons (Slack, Figma, Gemini, Python, React, Claude, Make, Supabase) are **multicolour third-party logos hot-linked** from `images.shadcnspace.com` (incl. a file called `clude.svg`) — clash with the 3-colour palette, depend on an external host, and imply partnerships | 17 `<img>` tags | Self-host and recolour as single-colour navy/gold glyphs at 60% opacity (or replace with your own service icons) |

### Colour
| # | Issue | Fix |
|---|-------|-----|
| C1 | Gold `#D2A14F` on ivory is **2.1:1** — fails WCAG even for large text. Used for the hero word "scale", eyebrows, "STEP 0x", "LEARN MORE" and footer links | Split gold into roles: `--gold` (fills/dots + text on navy only, 6.1:1), `--gold-dark` `#B77F31` (large text only, 3.1:1), new `--gold-text` `#8A5A14` (small text, 5.3:1) |
| C2 | Body/label text uses alpha tints (0.65–0.8 opacity navy) over textured backgrounds; stat labels ("AVERAGE LAUNCH TIME") are 11px at ~0.6 alpha | Solid `--muted-foreground #3F5969` (6.6:1), min 12px |
| C3 | Hero orb has a **grey/black halo** (blur of the navy dots over gold) — reads as a smudge, off-palette | Remove dark blur; use gold radial gradient + dot texture only |
| C4 | Orb **overlaps the "96% Client retention" stat** and its label | Move the orb behind / clip it to the right column, `z-index:-1` |
| C5 | `--destructive #D40C1A` is the only off-palette hue and is unused in the UI | Warmed to `#B3261E` |

### Typography
| # | Issue | Fix |
|---|-------|-----|
| T1 | **Satoshi has no 600 weight.** Fontshare serves 300/400/500/700/900; the site uses `font-semibold` (600) everywhere (≈50 headline nodes) so browsers fall to 700 inconsistently | Standardise on 400 / 500 / 700 and load only those |
| T2 | Italic accents ("scale", "agency theatre.", "worth scaling.") are **faux-italic** — no italic file is loaded | Use **Instrument Serif Italic** for accent words (real italic; reinforces "editorial") |
| T3 | Testimonial quote marks fall back to `ui-serif` (system-dependent: Times / New York / Georgia) | Same Instrument Serif |
| T4 | Loads 7 weights (≈ 300–900) of which 3 are used | Load 400, 500, 700 + one serif italic; `font-display:swap` |
| T5 | Heading scroll-reveal leaves headings pale grey mid-scroll ("Three disciplines." etc.) — poor contrast whenever the user pauses | Reveal starting colour no lighter than `#5B7383` (4.5:1) or fade opacity only |

### Layout / display
| # | Issue | Fix |
|---|-------|-----|
| L1 | Large empty band (~150–250px) after the Work carousel before the next section | Trim section padding to the 96/128px rhythm |
| L2 | Work-strip cards are cropped screenshots of client sites with inconsistent aspect ratios; collapsed cards show only a rotated name and unreadable crops | Use consistent 4:5 hero crops, same corner radius, caption always visible |
| L3 | Testimonials are generic (Lumen, Aurelia, Northwind — all Western SaaS) while the portfolio is Indian D2C apparel/jewelry | Replace with real client quotes or remove — highest trust risk on the page |
| L4 | Mobile hero: headline sits under the orb/icon cluster; icons float over the empty hero | Stack: headline → CTA → orb below, icons hidden < 640px |

## Scope note
The site is built in Lovable, so I cannot edit its code from here. Everything above is delivered as assets + tokens + a paste-ready prompt (`LOVABLE-PROMPT.md`).
