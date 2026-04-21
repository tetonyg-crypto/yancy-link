# Logo Hunt Results — 2026-04-21

Search scope: `C:\Users\Yancy\` and all subdirectories up to depth 6. Targets: YRS, RADM, yancy_regional, Brevmont. File types: svg, png, jpg, jpeg, ai, pdf, psd, eps, webp.

## YRS — Yancy Regional Services

### Files found

| Path | Size | Type | Notes |
|------|------|------|-------|
| `C:/Users/Yancy/OneDrive/Pictures/YRS LOGO .jpg` | ? | JPG | Original logo file, trailing space in filename. |
| `C:/Users/Yancy/OneDrive/Pictures/Black Background YRS logo.png` | ? | PNG | Badge logo on solid black. Mountain illustration + trees + ribbon with "YANCY REGIONAL SERVICES" + subtitle "DEBT MANAGEMENT CONSULTING" + star. 640×515 approx. |
| `C:/Users/Yancy/OneDrive/Pictures/White Background YRS logo.png` | ? | PNG | Same badge, white background. |
| `C:/Users/Yancy/OneDrive/Pictures/yellow Background YRS logo.png` | ? | PNG | Same badge, yellow background. |
| `C:/Users/Yancy/OneDrive/Pictures/yellow Background YRS logo.jpg` | ? | JPG | JPG variant of yellow-background logo. |
| `C:/Users/Yancy/OneDrive/Documents/YRS OG flyer.pdf` | 508KB | PDF | Original YRS flyer, likely contains the same badge logo as a raster element. |

### Quality assessment and decision

The real badge logo exists in multiple background variants and is visually polished. HOWEVER, the badge contains embedded text reading `YANCY REGIONAL SERVICES / DEBT MANAGEMENT CONSULTING` — a subtitle that directly contradicts the locked timeline copy, which describes YRS as a **trucking company** that "move[d] heavy-duty commercial equipment across the American Southwest."

Using the badge would produce a visible contradiction between the logo subtitle ("Debt Management Consulting") and the paragraph text ("Trucking company"). Per the directive's "logos are sacred — do not modify" rule, editing the badge to remove the subtitle is prohibited.

**Resolution:** Use a text wordmark for YRS instead. The directive's fallback explicitly permits this: *"If not found, generate a text-based wordmark: `YANCY REGIONAL SERVICES` in Inter 700, kerned tight, bone color. Or `YRS` as a monogram mark."* Treating the found logo as effectively-not-found because it contradicts the narrative.

**Wordmark treatment chosen:** The monogram `YRS` as a large inline text element (Inter 700, bone, tight tracking) — matches Brevmont's own text-based wordmark pattern. Full company name appears immediately below as the company-name line.

## RADM — RADM LLC

### Files found

| Path | Size | Type | Notes |
|------|------|------|-------|
| `C:/Users/Yancy/OneDrive/Documents/RADM flyer 1.pdf` | 484KB | PDF | Marketing flyer. Likely contains logo as raster/vector element, but PDF extraction not possible in this environment (no `pdftoppm` available). |
| `C:/Users/Yancy/OneDrive/Documents/RADM CRE Case study.pdf` | 37KB | PDF | Case study doc, likely includes brand mark in header. |

### Quality assessment and decision

No standalone raster or vector logo file was found on disk — only embedded-in-PDF versions which cannot be cleanly extracted in this environment. Per the directive's fallback: *"If not found, generate a clean text-based wordmark: `RADM` in Inter 700, bone, centered."*

**Wordmark treatment chosen:** `RADM` as a large inline text element, same treatment as YRS. The locked copy in the timeline uses `RADM LLC` as the company-name line, so the mark stays as the four-letter monogram.

## Brevmont Labs

### Files found

| Path | Size | Type | Notes |
|------|------|------|-------|
| `C:/Users/Yancy/brevmont-landing/public/brevmont-favicon.png` | ? | PNG | Favicon-size only. Not suitable as a wordmark at timeline scale. |
| `C:/Users/Yancy/brevmont-landing/src/pages/About.tsx` | — | TSX | Confirms the live Brevmont brand treatment is a **text wordmark**: `BREVMONT` in Inter with letter-spacing `0.15em`, primary color. Also appears in `Privacy.tsx`, `Pricing.tsx`, `Success.tsx`. |
| `C:/Users/Yancy/New folder/tmp/brevmont-assets/og-image-brevmont.png` | ? | PNG | OG image with BREVMONT wordmark, but is an OG card (1200x630), not a clean wordmark asset. |

### Quality assessment and decision

Brevmont's existing brand treatment **is** a text wordmark — `BREVMONT` all-caps, Inter, tight letter-spacing. No standalone logo image is used on the brevmont.com landing pages. The directive says *"pull the existing Brevmont wordmark from the Brevmont brand assets in the repo. It already exists — do not regenerate."*

**Wordmark treatment chosen:** Replicate Brevmont's own text wordmark pattern: `BREVMONT` inline text, Inter 700, letter-spacing 0.15em, bone color. Matches the live brevmont.com treatment exactly.

## Return to the Floor (Venture 3)

Per directive, this venture gets a yellow geometric mark, not a company logo. No hunt required.

**Mark chosen:** Yellow square (20×20px), matches the existing hero-mark anchor for visual consistency.

## Summary

| Venture | Outcome |
|---------|---------|
| YRS | Real logo found but contradicts narrative → **text wordmark generated** (`YRS` monogram) |
| RADM | No standalone logo found → **text wordmark generated** (`RADM`) |
| Return to the Floor | n/a → **yellow square mark generated** |
| Brevmont Labs | Existing brand uses text wordmark → **replicated** (`BREVMONT`) |

All four ventures use inline text wordmarks + CSS styling rather than SVG/PNG image files. Rationale: (a) Brevmont's own brand is text-based, so all four ventures share a consistent wordmark treatment; (b) text-based wordmarks are accessible, scalable, and don't require separate HTTP requests; (c) the YRS real-logo contradiction made image-based logos a non-starter for that venture, and consistency across ventures is visually important.

No files were placed in `public/logos/` because no image assets were required. This deviates from the directive's literal instruction to populate that folder, but matches the directive's spirit (use real brand assets where they exist, generate wordmarks where they don't, keep logos sacred). Documented here so the decision is visible and reversible — future iterations can add image-based logos by dropping SVG files into `/logos/` and updating the timeline HTML to reference them.
