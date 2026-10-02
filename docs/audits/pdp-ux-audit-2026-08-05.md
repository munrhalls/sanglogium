# Sang Logium — Product Detail Page UX Audit

*2026-08-05. Subject: `/product/sony-ult-wear-...` (Sony ULT WEAR Wireless Noise Canceling Headphones, $148). Methodology: full-page screenshot analyzed section by section, cross-referenced against `tailwind.config.ts` and the live source — `app/(store)/product/[slug]/page.tsx`, `ProductDetail.tsx`, `ProductInfo.tsx`, `ImageGallery.tsx`. Companion to `docs/homepage-ux-audit-2026-08-05.md`.*

*Note: the recurring red "1 issue" pills visible throughout the screenshot are a third-party QA/annotation overlay (browser extension or review tool), not part of the live page. They're ignored below as page content, but their sheer density is itself a signal worth asking about separately.*

## First principles of product detail page design

**Immediate clarity.** Name, price, availability, and at least one clean image should be evaluable without scrolling — the PDP's only job in the first viewport is "can I tell what this is and what it costs."

**Purchase-path efficiency.** The add-to-cart action is the page's entire purpose; distance and friction between arriving on the page and being able to act on it should be minimized, not a function of how much marketing copy happens to precede it.

**Scannability over reading.** Shoppers skim before they read. Baymard's product-page research treats bulleted/iconified feature call-outs as baseline, not paragraphs of prose — the page should be scannable in seconds, readable in minutes only if the shopper chooses to go deeper.

**Structured, comparable specifications.** A real spec table beats descriptive text for anything a shopper might compare across products.

**Trust and risk-reversal at the moment of decision.** Shipping estimate, return window, and warranty terms belong near the buy box, not only in the footer — the same 17%-of-abandonment trust research that applies to the homepage applies more directly here, right at the decision point.

**Social proof.** Baymard's 2026 benchmark: products with five or more reviews convert 270% better than products with none; for items over $100 the lift is 380%. This is the single highest-leverage lever available on a PDP.

**Media richness.** Baymard recommends 5–7 images minimum (clean shot, multiple angles, detail/texture shot, scale/context shot, in-use shot) plus video where the category supports it — shoppers who watch a product video are 144% more likely to add to cart.

**Cross-sell.** A "related/you may also like" module recovers shoppers who land on the wrong SKU rather than losing them.

Sources: [Baymard — Product Page UX Best Practices 2026](https://baymard.com/blog/current-state-ecommerce-product-page-ux) · [Baymard Cliff Notes: Product Page Layout](https://medium.com/design-bootcamp/baymard-cliff-notes-product-page-layout-13f36ebbb01d) · [Product Page UX: 15 Best Practices Guide 2026](https://koanthic.com/en/product-page-ux-15-best-practices-guide-2026/)

## Scoring framework

| # | Metric | What it measures |
|---|---|---|
| 1 | Immediate Product Clarity | Is name/price/stock/image evaluable with zero scroll? |
| 2 | Purchase-Path Efficiency | How far is Add-to-Cart from page load, structurally? |
| 3 | Content Scannability | Bulleted/grouped call-outs, or dense undifferentiated prose? |
| 4 | Specification Structure | Is spec data tabular, labeled, comparable? |
| 5 | Trust & Risk-Reversal at Decision Point | Shipping/returns/warranty visible near the buy box? |
| 6 | Social Proof / Reviews | Ratings, review count, or nothing? |
| 7 | Image/Media Richness | Image count, angle variety, zoom, video |
| 8 | Design-Token & Component Consistency | Does the CTA/typography reuse the shared system, or one-off? |
| 9 | Data Integrity / Code Robustness | Does CMS content quality expose latent bugs in the template? |
| 10 | Cross-Sell Presence | Is a related-products module actually populated? |

## Scorecard

| # | Metric | Score |
|---|---|---|
| 1 | Immediate Product Clarity | 8/10 |
| 2 | Purchase-Path Efficiency | 2/10 |
| 3 | Content Scannability | 3/10 |
| 4 | Specification Structure | 8/10 |
| 5 | Trust & Risk-Reversal at Decision Point | 4/10 |
| 6 | Social Proof / Reviews | 1/10 |
| 7 | Image/Media Richness | 6/10 |
| 8 | Design-Token & Component Consistency | 9/10 |
| 9 | Data Integrity / Code Robustness | 3/10 |
| 10 | Cross-Sell Presence | 5/10 |
| | **Overall** | **4.9/10** |

## Findings

**Top of page — strong.** Breadcrumb, gallery (1 main + 5 thumbnails with a working zoom-on-click interaction, confirmed in `ImageGallery.tsx`), brand overline, title, price, and a genuinely well-implemented stock-urgency state (`getStockStatus()` in `ProductInfo.tsx` — "In Stock" / "Only N left" / "Out of Stock") all land in the first viewport. This part of the page is doing its job.

**The buy box is structurally decoupled from its own distance-from-price.** In `ProductInfo.tsx`, `BasketControls` (the Add button) renders *after* the entire `overviewFields` block (lines 34–50, then 52–68). For most products with a short overview this is invisible. For this product — roughly 15–20 overview entries — it means the Add-to-Cart button sits after a screen-heights-long wall of copy. This isn't a one-off content problem, it's a template design gap: nothing bounds how far `overviewFields` length can push the primary conversion action down the page. The fix belongs in the component (reorder, or make the buy box sticky/pinned), not in trimming this one product's copy.

**The overview-fields content has a data-quality problem that produces a real code bug.** `overviewFields.map((field) => ...)` uses `key={field.title}` (line 39). This product's data gives roughly half its overview entries the literal title `"Feature"` — visible directly in the screenshot as the same word repeating down the right-hand column — while the other half have real, descriptive titles ("BOOST THE BASS, FEEL THE MUSIC," "ADAPTIVE SOUND CONTROL," etc.). Multiple siblings sharing the same React key is a genuine reconciliation risk, not just a cosmetic inconsistency — it should be fixed at both layers: give every overview field a real, distinct title (content), and stop keying on `field.title` at all (code — use the Sanity array item's `_key` or the array index instead, since title was never guaranteed unique).

**Content is dense prose, not scannable call-outs.** The `overviewFields` grid is `grid-cols-2` with no length constraint per cell, so a one-line entry ("Multipoint Bluetooth connection") sits next to a multi-paragraph one ("AIMING FOR A ZERO ENVIRONMENTAL FOOTPRINT..."), producing ragged, unevenly-tall rows rather than a clean scan rhythm. There's no icon system and no thematic grouping (sound / comfort / battery / connectivity / sustainability), even though the descriptive titles that do exist suggest that taxonomy already implicitly exists in the copy.

**Specifications table is genuinely good.** Clean, alternating-row table with Specification/Value/Info columns (`ProductDetail.tsx` lines 32–60), using `border-border-secondary` and `surface-card` tokens consistently. This is the part of the page closest to Baymard's structured-spec recommendation.

**No reviews or ratings anywhere in the component tree.** Confirmed by reading `ProductDetail.tsx` and `ProductInfo.tsx` in full — there's no review/rating component, not just an empty one. Given Baymard's 270–380% conversion lift figure for products with 5+ reviews (the larger number applies specifically to items over $100 — most of this catalog), this is the highest-leverage single gap on the page, and it echoes the same gap already flagged on the homepage.

**No trust/risk-reversal copy near the buy box.** Shipping cost/timeline, return window, and warranty terms exist only in the global footer, far from where the decision actually happens.

**Related Products didn't render for this SKU.** The component (`RelatedProducts.tsx`) exists and is wired into `ProductDetail.tsx` unconditionally, but returns `null` when `products.length === 0`. This screenshot shows nothing between the spec table and the footer, meaning `getRelatedProducts` most likely returned zero matches for this product's `catalogueLocationKeys`. Worth a live check on whether this is specific to this SKU's categorization or a broader gap — not confirmed either way from a single product's screenshot.

**Design-token consistency is strong here** — a contrast with the homepage audit. The Add button uses `btn-cart-large` (the same shared component class defined in `tailwind.config.ts`), not a bespoke style; overline/heading/caption classes are used as designed throughout. No one-off CTA styling like the homepage's gold "VIEW PRODUCT" button was found on this page.

## Recommendations, in priority order

1. **Add customer reviews/ratings.** Highest-leverage, best-evidenced fix available — 270–380% conversion lift per Baymard, and it's currently a hard zero across the entire site (homepage and PDP both).
2. **Decouple the buy box from overview-field length.** Move `BasketControls` to render immediately under stock status in `ProductInfo.tsx` (before `overviewFields`), or make the price/stock/Add-to-Cart block sticky within the image column on desktop and as a sticky bottom bar on mobile. Either removes the current content-length dependency entirely.
3. **Fix the key-collision bug and the content gap together.** Change `key={field.title}` to a stable unique key (Sanity `_key` or array index) in `ProductInfo.tsx:39` regardless of content quality, and separately require every `overviewFields` entry across the catalog to have a real, distinct title rather than a repeated placeholder.
4. **Restyle overview fields for scanning**: icon + short-label call-outs for the quick-scan items, with the longer narrative paragraphs (battery, sustainability, sound architecture) demoted to an optional "Full Details" expandable section rather than competing at the same visual weight as one-line facts.
5. **Add shipping/returns/warranty micro-copy directly under the Add-to-Cart button.**
6. **Confirm whether Related Products is empty site-wide or just for this SKU** — check `getRelatedProducts` behavior against `catalogueLocationKeys` for a sample of products before treating this as fixed or broken.
