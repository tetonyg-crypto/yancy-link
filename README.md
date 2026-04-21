# yancygarcia.com

Founder landing page for Yancy Garcia — points to Brevmont Labs (brevmont.com) and a Cal.com demo booking link.

## Stack

- Static HTML + vanilla CSS (no framework)
- Deployed on Vercel
- Fonts: Inter (400/600) via Google Fonts
- OG image: SVG source rendered to PNG via `sharp`

## Structure

- `index.html` — the entire page
- `og-yancygarcia.png` / `og-yancygarcia.svg` — Open Graph card (1200x630)
- `favicon.svg`
- `404.html` — redirects to `/`
- `vercel.json` — legacy-route 301s and cache headers
- `archive/legacy-site-20260421/` — snapshot of the prior inventory-era site, preserved for reference

## Design tokens (matches Brevmont visual system)

- Charcoal `#0F1419` (bg)
- Bone `#F8F6F1` (fg)
- Deep Teal `#0D6E6E` (accent, reserved for future use)
- Inter 600 headings, Inter 400 body
- Max content width 720px

## Regenerate OG PNG from SVG

```
node -e "require('sharp')('og-yancygarcia.svg').png().toFile('og-yancygarcia.png')"
```

## Deploy

Pushes to `main` auto-deploy to production at `https://yancygarcia.com`.
