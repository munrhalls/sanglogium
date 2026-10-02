# Sang Logium — Homepage UX Audit

*2026-08-05. Methodology: full-page screenshot of the live homepage (13,405px scroll depth) analyzed section by section, cross-referenced against `tailwind.config.ts` (design tokens) and homepage source in `app/components/features/homepage/**`. Structural facts confirmed against `docs/homepage-structure.md`.*

## First principles of e-commerce homepage design

Homepage UX research converges on a small set of fundamentals, independent of vertical:

**Clarity of value proposition.** The visitor should know within seconds what you sell, who it's for, and why to buy here rather than elsewhere — not just a product category restated as a slogan.

**Visual hierarchy.** Eyes scan in predictable patterns (F/Z). Typography scale, whitespace, and color must direct attention to the next decision, not distribute attention evenly across everything on screen.

**Trust and credibility.** Baymard's abandonment research attributes roughly 17% of checkout abandonment to low trust/credibility — reviews, guarantees, and policy transparency are homepage-relevant, not just checkout-relevant.

**Findability.** Search prominence and shallow, low-friction navigation (Hick's Law: fewer, clearer choices convert better than exhaustive menus) determine whether a visitor with intent can act quickly.

**Product photography consistency.** Baymard's product-page research and general merchandising practice agree that inconsistent image scale/cropping across a grid reads as unprofessional and slows comparison — even when the underlying photos are individually high quality.

**Catalog breadth vs. scroll cost.** Baymard recommends surfacing roughly 40% of a store's product-type breadth on the homepage — but breadth has to be traded off against scroll fatigue; showing everything at full carousel weight is not the same as showing it efficiently.

**CTA and button-system consistency.** One visual language for "act now," reused everywhere, so the eye doesn't have to re-learn what a clickable, high-priority action looks like in each new section.

Sources: [Baymard Cliff Notes: Homepage UX Best Practices](https://sam-saenz.medium.com/baymard-cliff-notes-homepage-ux-best-practices-92d15a0b0cb3) · [Baymard — 10 UX Requirements for Homepage Carousels](https://www.linkedin.com/posts/baymard-institute_10-ux-requirements-for-homepage-carousels-activity-7313554355993939969-dSXW) · [Baymard Product Page UX 2026](https://baymard.com/blog/current-state-ecommerce-product-page-ux) · [Ecommerce UX Best Practices 2026 — Instinctools](https://www.instinctools.com/blog/ecommerce-ux-best-practices/)

## Scoring framework

Ten metrics, each 1–10, derived directly from the principles above so the score is traceable to a specific fundamental rather than a vibe.

| # | Metric | What it measures |
|---|---|---|
| 1 | Value Proposition Clarity | Does the hero say what makes *this* store worth buying from, not just what category it sells? |
| 2 | Visual Hierarchy & Scannability | Does typography/whitespace direct the eye, section to section? |
| 3 | Navigation & Findability | Can intent-driven visitors act fast (search, shallow menu)? |
| 4 | Product Photography Consistency | Is product-to-frame ratio consistent across cards in the same grid? |
| 5 | Trust & Credibility Signals | Reviews, guarantees, policy visibility, social proof |
| 6 | CTA System Consistency | One reusable visual language for actionable buttons, or several competing ones? |
| 7 | Design-Token Adherence | Does the UI actually use the color/type/spacing tokens defined in `tailwind.config.ts`, or has it drifted into one-offs? |
| 8 | Scroll Depth / Content-Density Efficiency | Is catalog breadth shown at a scroll cost proportionate to its value? |
| 9 | Grid & Card Rhythm Consistency | Do repeated card grids hold a consistent rhythm (equal control widths, alignment)? |
| 10 | Color Contrast & Legibility | Text-to-background contrast, especially on photographic vs. flat surfaces |

## Scorecard

| # | Metric | Score |
|---|---|---|
| 1 | Value Proposition Clarity | 5/10 |
| 2 | Visual Hierarchy & Scannability | 7/10 |
| 3 | Navigation & Findability | 8/10 |
| 4 | Product Photography Consistency | 3/10 |
| 5 | Trust & Credibility Signals | 5/10 |
| 6 | CTA System Consistency | 4/10 |
| 7 | Design-Token Adherence | 7/10 |
| 8 | Scroll Depth / Content-Density Efficiency | 3/10 |
| 9 | Grid & Card Rhythm Consistency | 6/10 |
| 10 | Color Contrast & Legibility | 7/10 |
| | **Overall** | **5.5/10** |

## Findings by section

**Header + Hero.** Search is centered and prominent, cart/sign-in/sign-up are clear, nav is a lean 3-item mega-menu (Headphones, Audio Electronics, Accessories) — good adherence to Hick's Law. The hero itself ("SOUND REDEFINED / Hear the difference.") is a generic audio-brand slogan; it doesn't tell a first-time visitor why Sang Logium specifically, versus any other audio retailer. There is exactly one CTA ("Explore"), and it's non-specific about destination. The micro-copy trust line ("Handcrafted · Precision Engineered · Absolute Purity") describes products, not the store; the second line ("Domestic Multi-Carrier Shipping · 2-Year Warranty · Expert Support") is the actual differentiation and is under-weighted relative to the vague headline above it.

**Best Sellers, Amplifiers & DACs carousels.** Consistent card chrome (brand label, product name, price, cart-icon "Add" button) matches the `.btn-cart` component defined in `tailwind.config.ts`. Carousel pattern (dots + arrows) is reused identically across sections per `docs/homepage-structure.md`'s note that `CarouselControls` is a single shared component — correctly avoids the classic "every carousel behaves slightly differently" bug.

**Editorial spotlight blocks (Kinetic Edge / Carbon Flow / Zenith Core).** Well-typeset (overline + h1 + subhead + body, alternating image side) and internally consistent. But each block is a near-full-viewport single-product story; three of them back-to-back before any second product grid is a lot of scroll for a homepage whose job is orientation, not storytelling. The "SEE MORE" buttons correctly use the shared `.btn-secondary` class (confirmed in `CardDetails.tsx`) — genuinely good token reuse here.

**In-Ear Monitors grid.** Product photography inconsistency is most visible here: some cards (Sennheiser Momentum Sport, Noble Audio) show the product filling a reasonable portion of the frame; others (JBL Tour Pro 2, Moondrop Alice) show a tiny product floating in a mostly-empty cream square. Root cause, confirmed in `IemCard.tsx`: the image container uses `object-contain` with fixed `p-6` padding — correct CSS, but it faithfully preserves whatever crop/margin exists in the *source* image asset. The fix is an asset-pipeline standard (crop vendor photos to a consistent fill ratio before they reach Sanity), not a CSS change. Also noted: one card ("PI5 True Wireless Earbuds") renders a quantity stepper (`− 5 +`) instead of the "Add" button because it's already in the basket — functionally correct, but the variable control width breaks the row's visual rhythm.

**New Release banner (Weiss DAC204).** Clean half-image/half-copy layout. The gold "VIEW PRODUCT" button, however, is a hand-rolled Tailwind string in `NewestRelease.tsx` (`border-accent-600 bg-accent-600 …`) rather than one of the design system's reusable button classes (`.btn-primary`, `.btn-secondary`, `.btn-ghost`). It duplicates most of what `.btn-primary` already provides but hardcodes a fourth, one-off visual treatment for "the single most important purchase action on the page." This is the clearest concrete example of the CTA-consistency and token-drift scores above.

**Accessories (7 category carousels: Cables, Interconnects, Adapters, Earpads, Eartips, Care & Cleaning, Storage).** Same card chrome as the rest of the site — consistent — but this is also where photography inconsistency is worst: interconnect cables and ear tips are photographed at such a small scale relative to the card that the product is barely legible without zooming. Seven full carousel sections back-to-back, each with its own header/arrows/dots, is a large amount of homepage real estate spent on long-tail accessory browsing that a category/filter page would normally own.

**Footer.** Standard, complete: policy links, brand list, payment-method icons, social icons, copyright. No issues.

**Recurring circular "N" badge.** A small black circular badge appears at the same right-edge x-position roughly every 800–1000px down the entire page, overlapping carousel arrows and card corners in several places. The near-uniform spacing strongly suggests this is a fixed-position element (chat widget, notification bubble, or similar) that got duplicated once per viewport segment during full-page screenshot stitching — not an intentional repeating design element. Worth a 30-second check in a live browser tab to confirm it's a single fixed widget and, if so, to verify its z-index doesn't actually sit on top of interactive controls at any scroll position.

## Recommendations, in priority order

1. **Standardize product photography fill ratio** before assets reach Sanity (target: product occupies ~70–80% of the card's image area). This single fix would move the lowest score (Photography Consistency, 3/10) the most, since the current CSS (`object-contain` + fixed padding) is already correct and just needs consistent input.
2. **Consolidate the fourth CTA style.** Replace the hand-rolled className in `NewestRelease.tsx` with either `.btn-primary` or a new named `.btn-accent` added alongside the other button components in `tailwind.config.ts`'s `uiComponentsPlugin`, so the gold treatment is reusable and won't silently diverge from future button updates.
3. **Sharpen the hero value proposition.** Replace the generic slogan with a specific differentiator, and split the single "Explore" CTA into a primary (e.g. "Shop Best Sellers") and secondary (e.g. "Explore All") action so the highest-traffic click target on the page has a concrete destination.
4. **Add a lightweight trust signal to product cards or a homepage strip** (star rating, review count, or "Trusted by" element) — currently there is no social proof anywhere on the homepage, which is a real gap for a premium/"handcrafted precision" positioning.
5. **Reduce accessory-section scroll cost.** Collapse the seven full carousels into a single "Shop Accessories" category collage (one image + link per category) that routes to the existing filtered listing pages, rather than rendering a full product carousel per subcategory. This preserves catalog-breadth visibility (the Baymard "40%" guidance) at a fraction of the scroll cost.
6. **Verify the floating circular badge** in a live browser session — confirm it's a single fixed element, not a repeating one, and check it doesn't overlap carousel controls at any scroll position.

*Note: this audit is based on a static full-page capture. Verifying viewport-specific behavior (e.g. the `lg-touch` laptop-height breakpoint documented in `docs/vertical-space-lg-touch.md`) would need a live browser check at ~1024×800 and is out of scope here.*
