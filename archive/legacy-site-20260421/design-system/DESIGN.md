# Yancy Garcia — Design System

## Brand Direction
Editorial car culture meets Mountain West grit.
Personal brand backed by Stone's Auto Group.
Not a dealership website. A personal conversion system.

## Visual Rules
- Accent `#E8FF00` used max 3x per viewport
- Every page has ONE primary CTA above fold
- All CTAs open SMS or link to /deal
- Phone always displayed: (307) 699-3743
- No stock photography — real photos only
- No dealership branding in hero — Stone's in trust bar only
- Grain texture overlay on every page
- Mobile-first: test at 375px before any other width

## Typography
- Display: Bebas Neue — headlines, CTAs, stats, labels
- Body: Instrument Serif — descriptions, testimonials, subtitles
- Never mix more than these two

## Color
- Background: #0a0a0b
- Surface: #111113
- Border: #1e1e22
- Text: #f0f0f2
- Muted: #6b6b75
- Accent: #E8FF00 (caution yellow — sparingly)

## Components
- `btn-primary` — yellow bg, black text, shimmer hover
- `btn-secondary` — yellow outline, fill on hover
- `card-vehicle` — dark surface, image top, lift on hover
- `trust-badge` — pill with accent dim bg
- `ticker` — infinite horizontal scroll, CSS only
- `sticky-cta` — fixed bottom bar, mobile only
- `divider-down/up` — diagonal clip-path separators
- `rv` — scroll-triggered reveal animation

## CTA Copy Rules
- Primary: "TEXT ME NOW →"
- Secondary: "CHECK AVAILABILITY" or "SEE OPTIONS"
- Form: "SEND IT →"
- Never: "Learn More", "Submit", "Contact Us", "Request Quote"

## Headline Formula
- Lead with outcome: "Skip the dealership games."
- Follow with action: "I'll get you into this [Vehicle] today."
- Never: "Welcome to...", "About us...", "Our services..."

## Section Order (Master Funnel)
1. Hero (photo + headline + CTA)
2. Trust ticker
3. Why Yancy (3 bullets)
4. Proof (real testimonials)
5. Featured inventory (3 vehicles from API)
6. Friction reducers (financing, speed, trades)
7. CTA repeat
8. Form (Name + Phone only)
9. Footer

## Performance
- Target: <1.5s on mobile 5G
- Google Fonts via preconnect
- Hero image: fetchpriority="high"
- Below-fold: loading="lazy"
- No WebGL, no parallax, no full-screen video
- CSS-only animations, respect prefers-reduced-motion
