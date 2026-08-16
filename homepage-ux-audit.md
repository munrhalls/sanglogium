# Sang Logium — Home Page UX Audit

**Audited:** `http://localhost:3000` (existing local server, **no new server started**)
**Date:** 2026-08-16
**Scope:** Home page user experience vs. professional e-commerce standards, first principles and best practices.
**Method:** Live HTML capture (3.5 MB DOM), Lighthouse (mobile emulation) run against the running server, source-code review of the homepage feature components, and automated checks of structure/accessibility/SEO/performance signals.

> ⚠️ **Environment caveat:** the server was running in `next dev` (development) mode, which performs on-the-fly compilation and inflates all timing metrics (TTFB, LCP, TTI). A production build will score better on *timing*, but the **structural** findings (9.2 MB page weight, 7,837 DOM nodes, 3.5 MB HTML, 324 "Add to Cart" buttons, 357 images, no ratings, no structured data, generic metadata) are mode-independent and would persist in production. A previous production Lighthouse run (per `overview-audit.md`) also reported failing Core Web Vitals, corroborating the performance concern.

---

## 1. Executive Summary

**Overall verdict: 5.4 / 10 — "A polished design system carrying an unfinished commerce layer."**

The homepage looks premium and has several genuinely professional e-commerce mechanisms: a full catalogue mega-menu, debounced search with autocomplete, curated "In-Ear Monitors" gallery, inline add-to-cart with quantity steppers, and a coherent dark/editorial visual language. It is undermined by four structural problems:

1. **The homepage is the catalogue.** ~324 add-to-cart controls and 328 product links are rendered in a single document (the Accessories section dumps the entire range). This produces a 3.5 MB HTML document, a 7,837-node DOM, and a 9.2 MB page — the #1 performance and distraction problem.
2. **Zero social proof.** No ratings, reviews, testimonials, press mentions, or "customers also bought" anywhere on the page. Reviews are consistently ranked among the strongest conversion drivers in e-commerce.
3. **No promotion/urgency layer.** No announcement bar, no sale/promo, no stock/low-stock cues, no free-shipping threshold. The only incentive (10% off for email) is buried in the footer.
4. **SEO & metadata are placeholders.** Meta description is literally `"E-commerce store"`; no Open Graph/Twitter tags; no JSON-LD structured data (Organization/WebSite/ItemList/Product); four `<h1>` elements on one page.

Core web metrics are poor on mobile even discounting dev-mode inflation (Lighthouse **Performance 26**, LCP ~51 s with 91% load-delay on the hero image, TBT ~8 s). CLS is excellent (0.002) — the image pipeline (fixed dimensions, aspect ratios, font swap) is best-practice.

---

## 2. Headline Measured Numbers

| Metric | Measured | Professional standard | Verdict |
|---|---:|---:|---|
| Lighthouse Performance (mobile) | **26 / 100** | ≥ 90 | 🔴 Failing |
| Lighthouse Accessibility | **88 / 100** | ≥ 95 | 🟡 Near |
| Lighthouse Best Practices | **96 / 100** | ≥ 95 | 🟢 Good |
| Lighthouse SEO | **85 / 100** | ≥ 95 | 🟡 Gap |
| LCP (largest contentful paint) | **51.5 s** (dev) | ≤ 2.5 s | 🔴 Failing |
| FCP (first contentful paint) | **4.9 s** (dev) | ≤ 1.8 s | 🔴 Failing |
| Speed Index | **18.0 s** (dev) | ≤ 3.4 s | 🔴 Failing |
| Total Blocking Time | **8,050 ms** (dev) | ≤ 200 ms | 🔴 Failing |
| CLS (layout shift) | **0.002** | ≤ 0.1 | 🟢 Excellent |
| Server response (TTFB) | **2,360 ms** (dev) | ≤ 600 ms | 🟡 Dev-inflated |
| Total page weight | **9.2 MB** (9,202 KiB) | ≤ ~2 MB | 🔴 Excessive |
| HTML document size | **3.5 MB** | ≤ ~300 KB | 🔴 Excessive |
| DOM element count | **7,837** | ≤ ~1,500 | 🔴 Excessive |
| Images on page | **357** (347 lazy / 2 eager) | — | 🟡 Heavy |
| "Add to Cart" controls | **324** | ≤ ~12–20 on home | 🔴 Catalogue dump |
| Product links | **328** | ≤ ~12–20 | 🔴 Catalogue dump |
| Rating/review signals | **0** | present | 🔴 Missing |
| `<h1>` count | **4** (3 in mobile nav drawer) | exactly 1 | 🔴 Invalid |
| JSON-LD structured data | **0** blocks | Organization + WebSite + ItemList/Product | 🔴 Missing |
| Open Graph / Twitter meta | **0** | present | 🔴 Missing |
| Cookie consent banner | **0** | present (GA loaded) | 🔴 Compliance risk |
| LCP element | Hero `<img fetchpriority="high">` — **91 % load-delay** | ≤ ~10 % | 🔴 Resource scheduled too late |

---

## 3. Scorecard — 17 Key E-Commerce Homepage UX Metrics (1–10)

| # | Metric | Score | Evidence-based verdict |
|---|--------|:---:|---|
| 1 | **Value proposition & above-the-fold** | **6** | Hero headline "SOUND REDEFINED" is evocative, but subhead "Hear the difference." is generic; single vague CTA "DISCOVER"; no offer, product, or differentiation in the first viewport. |
| 2 | **Trust signals** | **5** | Trust bar exists ("Domestic Multi-Carrier Shipping · 2-Year Warranty · Expert Support") but says "multi-carrier", not *free* shipping; no money-back/returns guarantee, no secure-checkout or payment trustmarks, no link-through to policy pages from the bar. |
| 3 | **Social proof** | **2** | No reviews, ratings, testimonials, press, or "as seen in". Critical — reviews are the strongest conversion lever in commerce. |
| 4 | **Promotions & urgency** | **3** | No announcement bar, no active promo, no countdown, no stock/low-stock scarcity. "New Arrival"/"Bestseller" badges exist but are informational only. |
| 5 | **Product curation & discovery** | **5** | Best Sellers carousel + curated 16-IEM gallery + Newest Release + DAC sections are strong editorial curation — but the Accessories section renders the *entire* catalogue, destroying curation and page focus. |
| 6 | **Product cards** | **7** | Cards include image, brand, model name, price, badge, and inline add-to-cart with a quantity stepper. Missing: rating, review count, stock state, savings/% off, wishlist. |
| 7 | **Navigation & IA** | **7** | Full catalogue mega-menu (Headphones / Audio Electronics / Accessories → subcategories) plus a 4-column footer. Weaknesses: mobile drawer emits its own `<h1>`s (4 H1s total), "Order Status" footer item is a dead `<span>`, some footer brand names are plain text. |
| 8 | **Search & autocomplete** | **8** | Debounced (300 ms) autocomplete with keyboard navigation, ARIA listbox wiring, clear button, mobile expand — genuinely professional. Desktop field visible; mobile behind an icon. |
| 9 | **Add-to-Cart & basket entry** | **6** | Inline ATC + stepper everywhere is convenient; basket indicator persists. Problems: on mobile the ATC button has **no accessible name** (text is CSS-hidden); basket is client-only localStorage (no server/cross-device cart). |
| 10 | **Content & copywriting** | **5** | Section headers are editorial ("Converted Without Compromise", "Carbon Flow") but copy is thin; no benefit-driven subtext, no category descriptions, no brand storytelling on page. |
| 11 | **Visual design & brand consistency** | **7** | Coherent dark/editorial system, consistent cards, branded typography and fractals; spacing system is deliberate. Presentational polish is high. |
| 12 | **Mobile UX & touch targets** | **6** | Grids collapse correctly (2-col cards), bottom action bar, custom scroll container. But documented 32 px touch targets in IEM cards (below WCAG 2.5.5's 44 px), icon-only nav links without labels, and the custom `<main>` scroll architecture risks scroll-restoration/keyboard issues. |
| 13 | **Performance & page weight** | **3** | 9.2 MB total, 3.5 MB HTML, 7,837 DOM nodes, LCP 91 % load-delay on hero. Even in production-build terms the homepage is structurally too heavy and main-thread-bound. |
| 14 | **Accessibility** | **6** | 88/100 Lighthouse. Real defects: unlabeled ATC buttons (mobile), `aria-label` on non-role `<div>`s (social icons), icon-only links with no name, label/content mismatches, duplicate H1s. |
| 15 | **SEO fundamentals** | **4** | Canonical + robots OK, viewport OK, images have alt. But meta description placeholder, no OG/Twitter, **no structured data**, 4 H1s, dead footer text links. |
| 16 | **Email capture / lead gen** | **5** | 10 % first-order incentive + email form is a good mechanic, but it lives only in the footer; no announcement bar, no exit-intent, no post-load nudge. |
| 17 | **Footer utility & policy access** | **6** | Rich footer (Purchases/Support/About/Find Us/Brands/Payments/socials). Dead "Order Status" span, partially-non-clickable brand list, social `<div>`s are not links. |

**Weighted average: ≈ 5.4 / 10**

---

## 4. Detailed Findings

### 4.1 Performance & page weight (🔴 critical)

- **The homepage is a category page in disguise.** The Accessories section (`Accessories.tsx`) loops 7 categories (Cables, Interconnects, Adapters, Pads, Eartips, Care & Cleaning, Storage) and renders **every** item server-side with no pagination, "load more", or view-all gating. Result: **324 add-to-cart controls, 328 product links, 357 images** in one document.
- Lighthouse mobile: **Performance 26**, LCP 51.5 s (score 0), TBT 8,050 ms (score 0), TTI 53.4 s (score 0), DOM 7,837 elements (score 0), total weight **9,202 KiB** (score 0.5). Largest savings: server response (2.26 s) and unused JS (639 KiB / 3 s).
- **LCP element is the hero image** — `fetchpriority="high"` is set correctly, yet **91 % of LCP time is "Load Delay"** (the request didn't start until the main thread was free). Root cause pattern: massive hydration work on the page (439 buttons, all product cards) starves the browser from fetching the hero image sooner. This is a real architectural signal, not just dev noise.
- **Strengths:** CLS 0.002 (excellent — fixed `width/height`, `aspect-ratio`, `display: swap` fonts), images lazy-load below the fold, `preconnect` to `cdn.sanity.io`, blur LQIP placeholders, `sizes` attributes correct on product images.
- **Fix direction:** cap each section (e.g., first 8–12 items + "View all"), make Accessories a proper grid page, virtualize or paginate, reduce per-card JS, and/or make section data cheaper (list only in HTML, hydrate on interaction).

### 4.2 Social proof (🔴 critical)

- **Zero** rating/review/testimonial/press signals on the page. For a specialist audio store selling $1,999 IEMs, the absence of reviews, "what reviewers say", community/award badges (e.g., Head-Fi, What Hi-Fi style mentions) is the single biggest conversion gap. Even star ratings on product cards would materially lift trust.

### 4.3 Promotion, urgency & offer layer (🔴 critical)

- No announcement bar (industry standard for free-shipping thresholds, sales, new arrivals). No sale/% off/savings display on cards (all prices show plain `$x` with no `was` price). No low-stock/urgency cues. The 10 %-off newsletter incentive exists but is only reachable by scrolling to the footer.

### 4.4 Metadata, SEO & structured data (🔴 critical)

- `<title>Sang Logium Audio Shop</title>` — passable but no differentiators.
- `meta description` = **"E-commerce store"** — placeholder copy; loses CTR in search results.
- **No Open Graph / Twitter card tags** — shared links render bare.
- **No JSON-LD** (no `Organization`, `WebSite` + `SearchAction`, `ItemList`, `Product`). This is table-stakes for commerce SEO.
- **Four `<h1>`s:** "Headphones", "Audio Electronics", "Accessories" (rendered by the mobile catalogue drawer, always in the DOM) + the hero "SOUND REDEFINED". One H1 per page is a hard requirement; the nav headers should be `<h2>`/`<span>` or the drawer should be hidden from AT when closed.
- Canonical (`https://sanglogium.com`) and `index, follow` are correct; `robots.txt` is served and well-formed (Lighthouse's robots warning is likely a localhost/canonical-domain mismatch — verify on the real domain).

### 4.5 Accessibility (🟡 88/100 — real defects)

- **Unlabeled primary CTA:** "Add to Cart" buttons render `<span class="hidden xs:inline">Add to Cart</span>` — text is `display:none` on small screens, leaving an icon-only button with **no accessible name** exactly where mobile users tap.
- **`aria-label` on non-role `<div>`s:** social icons (`<div aria-label="Follow us on X">`…) — a div can't be named without a role; Lighthouse `aria-prohibited-attr`.
- **Icon-only links with no name:** mobile bottom action bar (search, sign-in, sign-up, basket) are `<a>`s containing only SVG; also misuse `type="button"` on `<a>`. Lighthouse `link-name`/`link-text`.
- **Touch targets:** documented 32×32 px stepper buttons in IEM cards vs. WCAG 2.5.5 target size (44 px). `BasketControls` defaults to 44 px but `IemCard` passes overrides that shrink it.
- **Architecture risk:** `body` is `overflow-hidden`; the `<main>` element is the scroll container. This breaks browser find/scroll anchoring and can produce keyboard focus-management issues (and contributed to the Lighthouse `bf-cache` failure).
- **Positives:** alt text present on virtually all 357 images, ARIA wiring on search autocomplete, focus-visible rings, meaningful aria-labels on carousel controls.

### 4.6 Trust & compliance

- Trust bar claims are reasonable but not quantified ("Expert Support" — what does that mean? hours? chat?), and no payment security/trustmark row appears on the page body (the footer shows payment icons).
- **No cookie consent banner** while Google Analytics is loaded — a GDPR compliance risk for EU traffic.

### 4.7 What is genuinely good (strengths)

- Coherent premium dark editorial design system with consistent cards and spacing.
- Real autocomplete search (debounce, keyboard, listbox semantics, thumbnails on desktop).
- Mega-menu IA covering the full catalogue tree in 3 top categories.
- Inline add-to-cart with quantity steppers + persistent basket indicator.
- Editorial curation in 4 of 5 main sections (Best Sellers, IEM gallery, Newest Release, DACs).
- Strong CLS discipline: fixed image dimensions, aspect ratios, font `swap`, Sanity CDN preconnect, LQIP blur placeholders.
- `HomePage` is data-driven from Sanity with ISR (`revalidate = 3600`) — content changes don't require redeploys.

---

## 5. Recommendations (priority order)

**P0 — conversion & trust (highest ROI)**
1. **Cap catalogue sections:** render ≤ 8–12 items per homepage section with "View all →"; move the full Accessories range to its own page/`/products/accessories`. This alone cuts HTML/JS/DOM weight by ~70–80 % and directly improves LCP, TBT, and focus.
2. **Add reviews/ratings** to product cards (star + count) and a social-proof section (testimonials or press/editor awards). For a premium audio store, editor/community validation is the #1 trust lever.
3. **Add an announcement/promo bar** (e.g., "Free shipping over $X · 10 % off first order") and surface savings (`was`/`now` prices) where genuine promos exist. Add stock-state cues on cards.

**P1 — fundamentals**
4. **Fix SEO & metadata:** real title + description, OG/Twitter tags, JSON-LD (`Organization`, `WebSite`+`SearchAction`, `ItemList`), exactly one `<h1>`.
5. **Fix the accessibility defects:** visible accessible names on ATC buttons at all breakpoints, remove `aria-label` from non-role divs (make social items real links), label the mobile action bar links, restore 44 px targets in IEM cards.
6. **Re-run Lighthouse against a production build** (`npm run build && npm run start`) to get honest CWV numbers; then optimize the hero image scheduling (e.g., preload hero, de-prioritize below-fold hydration, consider streaming) to kill the LCP load-delay.

**P2 — refinement**
7. **Move the newsletter form up** (announcement bar or a mid-page capture) — the 10 % offer is a strong incentive wasted in the footer.
8. **Fix dead footer elements:** "Order Status" (make a real link), footer brand names (make them all link to `/brand/{slug}`).
9. **Add a cookie-consent banner** (GA is loaded; GDPR exposure).
10. **Rethink the scroll container:** prefer normal document scroll over `body overflow-hidden` + `<main>` scroll to restore bf-cache, scroll anchoring, and find-in-page.
11. **Add `loading="lazy"` + `fetchpriority` tuning and review the mobile drawer's early-DOM weight** (it currently contributes 3 H1s and heavy markup to every page).

---

## 6. Bottom Line

The homepage has a **strong skeleton**: professional search, good IA, disciplined images, coherent branding, and genuinely useful quick-add. It is not yet a **converting** homepage because the social-proof, promotion, performance, and SEO fundamentals are missing or placeholder-level, and the "home page" has been allowed to become the entire catalogue. Fixing curation/performance (P0-1), adding reviews (P0-2), and completing the metadata/structured-data layer (P1-4) would move this page from a 5.4 to a 7.5+ in short order.

---
*Audit produced from live inspection of `http://localhost:3000` on 2026-08-16. Timing metrics were captured against the development server and should be re-validated on a production build; all structural findings are mode-independent.*
