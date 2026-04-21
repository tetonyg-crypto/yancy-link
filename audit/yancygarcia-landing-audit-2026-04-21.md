# yancygarcia.com Landing Audit
Date: 2026-04-21
Auditor: BREZ, acting as senior landing-page designer

## Executive Rating
Overall: 6.4 / 10
Top strength: Type-system discipline — one font, three weights, three-color palette, held throughout without drift.
Top weakness: The page is about the founder, not about the product. A cold-email GM has to scroll to Background card 4 before learning what Brevmont is — that's the wrong information geometry for the primary visitor.
One change that would lift the page by 2 points: Add a single product sentence beneath the "Founder, Brevmont Labs" subtitle — e.g. "An AI layer for auto dealerships. In rollout." — so the what-we-do answer exists in the first three seconds instead of requiring a scroll.

---

## Dimension Scores

### 1. First-impression clarity — 6/10
The hero chain (FOUNDER label → YANCY GARCIA → "Founder, Brevmont Labs" → body → CTA) reads cleanly and names the person and company in under a second. What is missing is the product: a visitor learns who Yancy is, but not what Brevmont does until they reach the last card of the Background section.
- **Suggestion:** Insert one product line under the subtitle in the hero: `An AI layer for auto dealerships.` — 9 words, no new image, resolves the "what" gap without changing the visual system.

### 2. Hero hierarchy — 7/10
Eye travel is correct: label → name → subtitle → promise → CTA. The stacked YANCY / GARCIA reads with real weight and the yellow FOUNDER label anchors the top-left. However, the "Bilingual EN/ES." line in uppercase yellow sits between the body paragraph and the CTAs and reads louder than the CTAs themselves — it peaks the hierarchy in the wrong place.
- **Suggestion:** Demote the bilingual line to Inter 500 / muted color (not yellow), OR move it into the `hero-body` paragraph as a closing clause — `"…retail execution — now channeled into Brevmont Labs. Bilingual EN/ES."` Keeps the signal, removes the false peak.

### 3. Typographic discipline — 7/10
One font, four weights, clear scale from 12px label through 140px display, consistent letter-spacing on meta-labels, tabular-nums on capability numbers. That's real discipline. The weakness is an empty middle of the scale — the jump from the 32px section-header to the 140px hero display has nothing between it, which leaves the section headers looking small rather than editorial.
- **Suggestion:** Introduce one mid-scale marker at ~56px for the Now-section statement ("Running Brevmont Labs. Jackson, Wyoming.") already uses clamp(32–48px). Bump it to clamp(40, 5vw, 64px) so the page has a second display moment, not just the hero.

### 4. Color and restraint — 7/10
Three-color system (charcoal + bone + yellow) held without slippage. Yellow is used sparingly and consistently — label, mark, capability numbers, section rules, focus rings, selection. The muted tiers are subtle but earn their place. The gap: `--teal: #0D6E6E` is declared in `:root` but never used on the live page, which is dead weight in the design system.
- **Suggestion:** Either delete the teal declaration, OR use it once on the LinkedIn/email contact links in the Now section to create a second accent moment distinct from the yellow action color. Two-accent systems (yellow for attention, teal for reference) would enrich the palette without breaking it.

### 5. Narrative arc through Background — 6/10
The chaptering (01 — VENTURE / 02 — CONSULTING / 03 — SALES / 04 — NOW) is a light editorial touch that implies chronology and does real work. The RADM card is the strongest — it explicitly bridges sales to building. Two weaknesses: (a) the chronology is misleading — YRS, RADM, and sales overlap in reality, but the numbered sequence suggests a linear arc; (b) all four cards are the same size and weight, so Brevmont (the card that matters) is visually equal to the others instead of dominant.
- **Suggestion:** Keep the chaptering but give the Brevmont (04 — NOW) card a different treatment — full-width below the 2×2 grid, or a bone-on-charcoal reverse color block — so the narrative visually lands on the current work instead of ending with equal-weight résumé cards.

### 6. Capability framing in What I do — 6/10
Clean numbered grid, six capabilities, each with specific tooling named ("SMTP, Apollo, ringless voicemail"). Visual architecture is good. The problem is the copy reads as a services menu any freelance consultant could paste in — "Cold email, LinkedIn outbound, inbound funnel design" would fit on an agency site verbatim. There is no artifact, no proof, no tie back to Brevmont as the thing these capabilities produced.
- **Suggestion:** Replace the last capability block (06 Automations) with a single "What I've shipped" block that names one concrete artifact — "Brevmont: AI layer in 34 Supabase migrations + live Stripe + Chrome extension in distribution." Trades a capability abstraction for a receipt. Same real-estate, different signal.

### 7. CTA clarity and placement — 7/10
Two CTAs appear twice (hero + Now), destinations resolve correctly, primary/secondary styling is clear, hover states are defined. The arrow on "See Brevmont →" correctly flags it as the forward action. The flaw: a cold-email GM arrives on this page with time-bounded attention, and the page gives them the same two buttons regardless of where they came from — there is no inline CTA between the Background and What I do sections, so a visitor who's sold after reading Background card 4 has to scroll past all six capability blocks to click.
- **Suggestion:** Insert a single-line mid-page CTA between the Background and What I do sections — a hairline-framed statement like `Running this already? See Brevmont →` with one button. Adds one conversion surface on the fastest visitor path.

### 8. Conversion logic — 5/10
This is the lowest score and the one worth fixing first. For the designed primary visitor (GM from a cold email), the highest-value action is "Book a demo" — direct calendar contact. The page primes "See Brevmont →" as the primary button (bone-filled) and demotes "Book a demo" to secondary (outlined). That's backwards for the target visitor. Additionally, the page carries zero proof markers — no dealer logo, no testimonial quote, no single factual credibility anchor ("Wyoming LLC · April 2026" would work). A GM with 30 seconds of attention needs one thing to believe this isn't a student project, and the page provides none.
- **Suggestion:** Flip the button styling — "Book a demo" becomes the bone-filled primary, "See Brevmont →" becomes the outlined secondary. AND add one factual line above the Now-section CTAs: `Brevmont Labs LLC · Wyoming · EIN issued April 2026`. Muted color, meta style. One line, two adjustments, real lift on the highest-value action.

### 9. Mobile rendering — 7/10
At 375px the hero stacks cleanly (no horizontal scroll verified via `body { overflow-x: hidden }` and clamp-controlled display), cards collapse to single-column, cap-grid collapses, buttons go full-width under 380px. Typography holds. The imperfections: the yellow hero-mark at `top: 40px / right: 24px / 36×36px` floats near the top-right thumb zone and adds decoration without adding information; and the display clamp on mobile evaluates to ~67px which is smaller than the hero deserves given it's the only visual anchor.
- **Suggestion:** Bump the mobile display to `clamp(64px, 22vw, 104px)` so "YANCY / GARCIA" stacked reads as a true hero at 375px. Consider removing or shrinking the hero-mark on mobile — it's a desktop accent that doesn't earn its thumb-zone footprint.

### 10. Gap to reference-tier — 6/10
Against linear.app / vercel.com / railway.com / anthropic.com, the page holds on restraint and single-font discipline. It falls short on four specific things:
  - **Wordmark/logo top-left.** All four references anchor the viewport with a wordmark in the upper-left; this page has nothing there, which reads as a preview deploy, not a production site.
  - **Product surface in hero.** Linear shows the app. Vercel shows a deploy preview. Railway shows a service graph. Anthropic shows a document frame. Yancygarcia.com shows the founder only — defensible on a personal page, but removes the "I can see it work" signal.
  - **One proof/social-marker.** All four references carry at least one trust anchor in or near the hero (customer logos, funding line, "trusted by" strip). This page has zero.
  - **Interaction density.** Ref-tier pages reward scroll with small discoveries (animations, screenshots, sub-nav highlights); this page rewards scroll with prose cards and a capability list. Reading, not exploring.
- **Suggestion:** Add a thin wordmark top-left (`YG` or `YANCY GARCIA` in small-caps) fixed-positioned during scroll. Adds viewport anchor without adding navigation. 20-minute change, meaningful category-lift toward reference tier.

---

## Recommended next iterations

Three changes, ranked by impact-per-minute.

### 1. Add product sentence to hero — 15 min — highest impact
Insert one line beneath the "Founder, Brevmont Labs" subtitle: `An AI layer for auto dealerships.`

Why it matters: A visitor currently has to reach card 4 of the Background section before learning what Brevmont does. Adding one sentence (no new images, no restructure) moves that answer into the first 3 seconds. Fixes dimension 1 (first-impression clarity), dimension 2 (hierarchy), and dimension 8 (conversion logic) simultaneously. Estimated effect: +2 overall points.

### 2. Flip CTA primacy — 10 min — high impact
Primary button becomes "Book a demo" (bone-filled). Secondary becomes "See Brevmont →" (outlined).

Why it matters: The page is designed for a cold-email GM audience. For that visitor, booking direct calendar time is the higher-value conversion than clicking through to a second landing page. The current primary/secondary flip primes the lower-intent action. Fixes dimension 8 and touches dimension 7. Estimated effect: +1 overall point.

### 3. Add one proof line above the Now CTAs — 45 min — meaningful credibility lift
One muted meta-label line above the Now-section CTAs: `Brevmont Labs LLC · Wyoming · EIN issued April 2026`.

Why it matters: The page currently carries no proof markers at all. A cold visitor has no factual anchor to distinguish "operator with receipts" from "student project." One line of verifiable receipts (LLC status, jurisdiction, EIN year) establishes that without feeling like a trust badge. Fixes dimension 8 and touches dimension 10. Estimated effect: +1 overall point.

Running all three gets the page from 6.4 → ~8.5 in roughly 70 minutes of focused work.

---

## What this page does well

Three specific design decisions that are working.

### 1. The numbered capability grid (Section 6)
The 01–06 yellow numbers set in a two-column grid separate the capability names from a generic bolded-list treatment and give the section real visual architecture without icons, illustrations, or stock graphics. The number does the structural work an icon would, at lower cost, and reads as editorial rather than template.

### 2. Type-system restraint
One font family (Inter) at four weights (400/500/600/700), one vertical rhythm (8px base multiplied up), consistent meta-label treatment (12px 500 uppercase 0.12em letter-spacing) applied identically across hero, cards, Now section, and footer. Most founder landing pages fight themselves with multiple type systems trying to establish "tone" — this page picks one system and commits.

### 3. Card chaptering (Section 5)
The "01 — VENTURE" / "02 — CONSULTING" / "03 — SALES" / "04 — NOW" labels above each Background card are a light editorial device that implies chronology without demanding it, frames the four entries as a sequence rather than a list, and creates a second anchor for yellow inside the section so the color feels systemic rather than decorative. Small move, outsized effect.

---

*Audit evaluated the live page at `https://yancygarcia.com/` as of 2026-04-21 after Task 1 deploy completed (main commit `823acb1`). No positioning recommendations beyond the three iterations listed. Scores reflect the page as shipped, not the page as intended.*
