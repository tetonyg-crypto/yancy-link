# yancy-link — CLAUDE.md

## Repo purpose

yancygarcia.com. Static founder landing page. Positions Yancy Garcia as Founder, Brevmont Labs — not as a car salesperson. The timeline on this page is a strategic asset. It is the primary counterweight to any stale search-snippet that still positions Yancy as an automotive salesperson.

## Stack

- Vanilla HTML (no framework)
- Single CSS file (`styles.css`, ~805 lines)
- Vercel deploy
- Sharp (npm) used only for OG image conversion via `npm run og`

## Architectural patterns

- No JS framework. No build step for the HTML itself.
- All content lives in `index.html` — sections are hero, founder photo, experience timeline, "What I do" capability grid, "Now" close.
- Progressive enhancement via a small vanilla JS IntersectionObserver for `data-reveal` fade-in animations.
- Schema.org Person JSON-LD is embedded in `<head>`. It is intentional and load-bearing for search-result replacement. **Do not remove it.**

## Deploy pipeline

- Push to `main` → Vercel auto-deploys.
- OG image regeneration runs locally via `npm run og` when `og-yancygarcia.svg` changes.

## Environment variables

None. Site is fully static.

## Known pitfalls

- Any copy change to the experience timeline should be mirrored in the JSON-LD `knowsLanguage` / `jobTitle` / `worksFor` fields so Google's cached snippet gets the right signal.
- Photography: `founder-yancy.jpg` + `.webp` have sibling `-sm` variants for mobile. Update all four in tandem — do not update only the large variant.
- Hero photo `<img>` has `loading="eager"` and `fetchpriority="high"`. Leave those alone — changing to `lazy` slows first paint on mobile where the founder photo is nearly above-the-fold.
- Cal.com URL `https://cal.com/brevmont/demo` appears twice in `index.html`. Update both if the URL ever changes.

## Status

Active. Primary public surface for Yancy Garcia as of April 2026.

## Capability-inventory linkage

Every claim made in the "What I do" block and the timeline must have a receipt. See `ops/capability_inventory_2026-04-21.md` in the main Brevmont workspace for the live audit and flagged items.

## Naming-policy linkage

This page is one of the few surfaces in the Brevmont workspace that is allowed to name real individuals — but only Yancy himself. Never insert third-party names without explicit approval. The project CLAUDE.md naming policy locked 2026-04-12 applies.

## Read-before-touch protocol

Before editing this repo in any Atlas session:
1. Read this file.
2. Read `ops/capability_inventory_2026-04-21.md` if touching the "What I do" block or the timeline.
3. Confirm every copy change matches a receipt that can be defended on a cold call.

## Changelog

- 2026-04-21: CLAUDE.md created as part of tightening sprint P3-4. Hero photo loading attribute switched from `lazy` to `eager` + `fetchpriority="high"` as P3-5.
- 2026-04-23: Chapter copy rewrite (all 5 chapters rewritten to operator-voice; Chapter 4 renamed `Back on the floor` → `Testing on the floor` and role suffix stripped; RADM reframed from founder to business consultant; removed `multifamily` + `medical aesthetics` references). Added interactive horizontal timeline component (`.exp-timeline` / `.exp-bar`) with overlapping bars 2019→Present. Converted each chapter into an accordion card (`.t-toggle` + `.t-body`) — strict single-open, clickable from timeline bar or card header, with 16:9 image slot (`/artifacts/chapter-{n}.jpg` auto-swap via probe image), italic insight callout, and uppercase metadata. "What I do" section renamed to "Specialized in" with all 6 tiles rewritten. CTA underline animation added. Section CSS file grew to ~1080 lines.
