# YENES Link — Yancy Garcia

Personal lead-capture landing page. Replaces Linktree.

## Setup

1. Replace all placeholder URLs in `index.html` (search for `<!-- REPLACE`)
2. Replace `REPLACE_WITH_FORMSPREE_ID` in `script.js` with your Formspree form ID
3. Add your headshot as `assets/avatar.jpg`
4. Optionally add `assets/og-image.jpg` for social sharing preview (1200x630px)
5. Push to GitHub
6. Import into Vercel
7. Use the Vercel URL as your bio link on Instagram, TikTok, and Facebook

## Updating Featured Vehicles

Edit `data/inventory.json`. Each vehicle needs:
- `title` — Year Make Model Trim
- `price` — number (no dollar sign, no commas)
- `image` — URL to vehicle photo (leave empty string for emoji fallback)
- `smsBody` — pre-filled text message body

Push to GitHub. Vercel auto-deploys within 60 seconds.

## File Structure

- `index.html` — Page markup
- `styles.css` — All styles
- `script.js` — Inventory loading from JSON, form submission via Formspree
- `data/inventory.json` — Featured vehicles (edit this to update inventory)
- `vcard/yancy.vcf` — Downloadable contact card
- `assets/` — Avatar photo, Open Graph image

## Deployment

1. Create a GitHub repository named `yancy-link`
2. Push this project to GitHub
3. Go to vercel.com
4. Click "Import Project"
5. Select the repository
6. Deploy

## Powered by YENES AI
