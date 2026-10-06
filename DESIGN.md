# Orbit Studio — design system notes

**World:** warm ivory paper, deep navy ink, one gold accent. Neiden-style hairline 3-column grid, film grain, `[OS® — SECTION]` labels, giant ghost wordmark, orbit motif (ring, arc, node, satellite).

## Tokens
| Role | Value |
|---|---|
| Paper / surfaces | `--ivory #F6F2EA`, `--warm-white #FCFAF6`, `--cream #EDE6DA` |
| Ink | `--navy #092D3F`, `--navy-deep #061F2C` |
| Gold — fills, dots, text on navy | `--gold #D2A14F` |
| Gold — text on light | `--gold-text #8A5A14` (5.3:1 on ivory) |
| Secondary text | `--muted #3F5969` on ivory (6.6:1); ivory @ ≥.62 on navy (≥5.8:1) |

## Type
- Satoshi 400 / 500 / 700 (no 600 exists). Instrument Serif Italic for accent words only.
- Display ≤ 6rem, tracking ≥ −0.04em (graphic wordmarks `.word` / `.bw` use −0.05em), body measure ≤ 38ch, min text 12px.
- Headings `text-wrap: balance`, paragraphs `text-wrap: pretty`, numerals tabular.

## Motion
- One authored moment: preloader → hero wordmark. Word-by-word heading reveals are the section voice; supporting text only fades/rises 18px (no blur).
- Ease `expo.out` / `cubic-bezier(.16,1,.3,1)`. Infinite loops pause off-screen. `prefers-reduced-motion` removes preloader, smooth scroll, and all scroll motion.
- Hover state is derived from `elementFromPoint` on mouse move **and** scroll, never from enter/leave alone (prevents stuck thumbnails/cursor states under smooth scroll).

## Deliberate exceptions to generic rules
- Section labels (`[OS® — …]`) and numbered services/steps are the template's signature and the owner's brief; kept.
- Film grain overlay is part of the template look; paused during loading.
- Highlights keeps big numerals because the figures are the content (and appear only once on the page).

## Type must never be clipped (taste-skill pass)
- Every word-reveal mask (`.w`) carries real ink room: `padding:.18em .08em .3em` with the same negative margin, so layout is unchanged but ascenders, descenders and italic overhang are never cut. `.accent .w` gets an extra bottom reserve (italic descenders: g, y, f).
- Never animate text sideways inside a clipping parent (the hero tagline has no horizontal parallax). Clip-path boxes on text use generous negative insets (`inset(-45% -8% -45% -12%)`).
- Giant outlined/ghost wordmarks keep padding above and below inside their `overflow:hidden` box.
- Verification: render each heading normally and again with all clips removed; any pixel difference = clipped ink. Run at 1440 / 1024 / 768 / 390 / 320.

## Other taste-skill rules applied
- No em dashes anywhere (copy, labels, alt text, title); middle-dots replaced by periods/commas.
- One CTA label per intent: "Start a project".
- `100dvh` for full-height stacks; CTAs never wrap; z-index scale tokens (`--z-*`); no window scroll listeners; nav shows the current section (`aria-current`).

## Deliberate exceptions to taste-skill (owner decision: keep the brand look)
Serif italic accent words (Instrument Serif), `[OS® / Section]` labels, hairline 3-column grid, custom gold cursor, ivory/cream/navy/gold palette. These come from the Neiden-style brief and the Orbit brand kit.

## Fullscreen menu
- The Orbit mark stays the focal point at the centre, fully drawn (no counter, progress bar or draw-in). Its own comet satellite and the dotted planet inside the O keep moving while the menu is open and pause when it closes.
- The four links are small chips, each travelling its own orbit around the logo. Orbits are differentiated by radius, line style, speed and direction: Services (inner, solid gold, 30s clockwise), Work (dashed, 40s counter-clockwise), About (dotted, 52s clockwise), Contact (outer, double line, 66s counter-clockwise). Chips counter-rotate so the text always stays upright.
- Hover or keyboard focus on a chip pauses that orbit (`animation-play-state:paused!important` is required because the animation is set inline) and turns the chip gold. Rings must be `pointer-events:none`: stacked ring circles otherwise swallow the mouse and inner chips become unclickable.
- "Start a project" (gold) sits under the system and goes to `#contact`. Contact details are not in the menu (they are in the footer).
- Reduced motion: no animation; chips are placed statically at their start angles.
- Sizing: the whole system scales from one variable (`--os: min(78vh, 60vw)`, mobile `min(94vw, 58vh)`); rings are 50 / 66 / 82 / 100 % of it, the logo 32 % (mobile 28 %).

## Scroll reveals (measured on neiden.framer.media, applied to Orbit content)
| Type | Hidden state | Settle | Stagger | Starts when top reaches |
|---|---|---|---|---|
| `head` (big headings, per word) | rise 20px | ~0.4s | 140ms | 90% of viewport |
| `title` (small titles, per word) | rise 50px | ~0.3s | 110ms | 98% |
| `text` (paragraphs) | rise 30px | ~0.7s | - | 85% |
| `block` / `card` | rise 40px / 70px | ~0.7s | - | 92% |
| `label` (`[OS® / ...]`, per bracket/word) | rise 10px + blur 10px | ~0.65s | 80ms | 98% |
| `fade` / `blur` | opacity / blur 8px | 0.5 / 0.8s | - | 95 / 90% |
| `zoom` (images) | scale 1.3 + blur 8px | 1s, cubic-bezier(.74,.03,.44,.95) | - | 92% |
| `.stmt` (statements) | every letter 8% opacity | scrubbed by scroll | per letter | 80% -> 45% |
| `[data-count]` (odometer) | digit strips 0..n | 1.5s spring | 100ms per digit | 92% |
- Springs are critically damped (bounce 0) like the reference. Reveal words are never masked (no overflow), so ink cannot be clipped.
- Classification is automatic (`[data-split]` by font size, `[data-fade]` by element), or explicit via `data-rv="type"`.
- Not measured on the reference (approximated): odometer roll duration/stagger, statement scroll range.

## Founder chapter (profile pattern from the reference)
Existing section kept as is; added below it: "What we believe" statement filling letter by letter + author line, three expertise tiles (odometer). No pricing / packages.

## Floating WhatsApp
`.wa` fixed bottom-right, stacked above the "Start a project" button (no overlap at any scroll position, including the footer). Links to `https://wa.me/917984430672` with a prefilled message ("Hi Orbit Studio, I'd like to start a project."), opens in a new tab (`rel=noopener`). WhatsApp green is the one deliberate exception to the palette (recognition). Tooltip on hover/focus, soft ping ring every ~3s (off under reduced motion), inert while the menu is open.

## 4K clarity (preloader, hero, menu)
The animations are the original ones; only their sharpness was raised. The preloader backdrop video (`assets/preloader.mp4`) is the original Higgsfield orbit clip upscaled to 3840x2160 with Higgsfield (Topaz Video 2160p) and re-encoded for the web (about 2.9 MB). The particle globes (hero and menu planet) now render into a canvas backing store of 2x to 3x the CSS size, so they stay razor sharp on 4K and retina screens. The mark, rings, comet and menu orbits are vector (SVG/CSS) and are resolution independent.
