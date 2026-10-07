# Orbit Studio, Meta ads landing page (`/start/`)

Live path once deployed: `https://orbitstudio.co.in/start/` (privacy policy at `/start/privacy.html`).
Files: `index.html`, `style.css`, `main.js`, `privacy.html`. It reuses `../assets` (fonts, logos, work images, founder photo).

## Before running ads: edit the CONFIG block at the top of `main.js`
- `FORM_ENDPOINT`: where each lead is POSTed as JSON (Formspree, Make/Zapier webhook, Google Apps Script web app).
  While empty, a submit opens WhatsApp with the lead's details pre-filled (the lead must press Send), so you may miss leads.
- `PIXEL_ID`: your Meta Pixel ID. Fires PageView on load, Lead on a successful submit, InitiateCheckout on CTA clicks, Contact on WhatsApp clicks.
- `WHATSAPP`: number that receives messages (already 917984430672).

## Ad setup
- Destination URL: `https://orbitstudio.co.in/start/?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
- UTMs and fbclid are saved and sent with every lead.
- In Meta Events Manager, optimise the campaign for the Lead event.
- Page is `noindex` so it never competes with the main site in Google.

## Review before launch
The three testimonials and the stats (120+ sites, 3.4x ROAS, 96% retention) are copied from the main site. Make sure they are true and that you can back them up, because Meta policy and Indian ad rules require ad claims to be accurate.
