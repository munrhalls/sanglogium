# Content & Copy Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code/string inspection only; zero doc reliance._

## Summary
- P0: 3 — sitewide USD/PLN currency split, placeholder sitewide meta description, hardcoded `$` + filler copy on homepage cards.
- P1: 6 — CTA label chaos (Cart vs Basket vs "To cart"), dead footer social icons + dead "Order Status", off-brand/semi-technical error pages, basket line items with no currency unit, `$` in filter chips, over-narrow empty-basket CTA.
- P2: 8 — blunt/duplicated empty states, raw Tailwind link colors, boilerplate test-route metadata, public dev-preview routes, minor casing/loading-label nits.
- Verdict: the seven hand-written static policy pages are genuinely strong (substantive, one consistent voice, real dates). The damage is in **dynamic price rendering** and **microcopy consistency** — the storefront shows `$` while checkout, basket totals, order history and emails show `zł`, and the add-to-cart button has five different labels. A professional evaluator reaches checkout and sees two different currencies for the same order.

## P0 — a professional evaluator would visibly wince

### P0-1 Storefront prices render in US dollars; checkout renders PLN złoty
- **Where:** `app/components/ui/Price.tsx:12-13` (`currency = 'USD'`, `new Intl.NumberFormat('en-US', …)`), called with no `currency` prop by `app/components/features/products/ProductCard.tsx:71`, `app/components/features/products/ProductInfo.tsx:84`, `app/components/features/homepage/iems-gallery/IemCard.tsx:51`, `app/components/features/homepage/accessories/AccessoryCard.tsx:48`.
- **What:** `Price` defaults to `style:'currency', currency:'USD'`, `en-US`, so every catalogue tile, product-detail price and homepage product card prints e.g. `$1,299`. Meanwhile `app/checkout/success/OrderDetails.tsx:11-14`, `app/checkout/payment/_components/CheckoutSummary.tsx:34-37`, `app/(store)/account/orders/[orderNumber]/page.tsx:11-16`, `lib/utils/formatting.ts:6-8` and `lib/email.ts:126,150` all format with `pl-PL` / `currency:'PLN'` → `1 299,00 zł`.
- **User-visible impact:** A shopper browses in `$`, adds to basket, and is charged in `zł` with a złoty total on the confirmation page and the receipt email. Same order, two currencies.
- **2026 standard:** One currency, one locale, one formatter used everywhere. A PLN store shows `1 299,00 zł` (or `1 299 zł`) on every surface including the grid.
- **Fix direction:** Make `Price` default to `pl-PL` / `PLN` (or require the prop) and route all price rendering through one shared `formatPLN` helper; delete the ad-hoc `en-US` formatters.

### P0-2 Sitewide meta description is a placeholder
- **Where:** `app/(store)/configuration.ts:8-10` — `title: "Sang Logium Audio Shop"`, `description: "E-commerce store"`.
- **What:** The store layout exports this as the default `metadata` (`app/(store)/layout.tsx:7,22`). The homepage `app/(store)/page.tsx` defines no `metadata` of its own, so `/` — the primary landing page — inherits the description `"E-commerce store"`, as does every store route without its own metadata (e.g. `/products`, `/search`).
- **User-visible impact:** Google/social snippet for the brand's front door reads "E-commerce store". The `<title>` "Sang Logium Audio Shop" is also generic vs the polished `"… — Sang Logium"` pattern used on the static pages.
- **2026 standard:** A written homepage description (~150 chars) naming the category and positioning, matching the voice already used in `app/(store)/about-us/page.tsx:7-8`.
- **Fix direction:** Replace with a real sentence and add a `metadata` export to the homepage; reuse the About-page copy as a base.

### P0-3 Homepage featured card: hardcoded `$` and filler product copy
- **Where:** `app/components/features/homepage/featured/card/CardDetails.tsx:7` and `:18` and `:42`.
- **What:** Line 42 renders `${formattedPrice}` with a literal dollar sign, from `price?.toLocaleString("en-US")` (line 18). Line 7 sets `description = "Premium acoustic engineering with artisan craftsmanship."` as the default — shown verbatim on any featured product whose description is absent. `app/components/features/homepage/newest-release/NewestRelease.tsx:95-97` similarly formats with `en-US` and a `?? "USD"` fallback.
- **User-visible impact:** Above-the-fold homepage cards can show `$4,999` and an identical one-line marketing sentence under multiple different products.
- **2026 standard:** Real per-product copy (or no description line), PLN formatting.
- **Fix direction:** Remove the hardcoded `$`, use the shared PLN formatter, drop the default description string (render nothing when empty).

## P1 — they would note it

### P1-1 The add-to-cart button has five labels, and "Cart" fights "Basket"
- **Where:** `app/components/features/basket/BasketControls.tsx:34` default `label = "Add to Cart"`; `app/components/features/homepage/featured/card/CardDetails.tsx:49` `"Add"` / `:52` `"Add to cart"`; `app/components/features/homepage/iems-gallery/IemCard.tsx:61` and `app/components/features/homepage/accessories/AccessoryCard.tsx:58` `label="To cart"`; `app/design-system-test/page.tsx:452,580` `"Add to Basket"`.
- **What:** "Add to Cart", "Add to cart", "Add", "To cart", "Add to Basket" across the same action. Separately, the noun is "Basket" almost everywhere else — route `/basket`, `app/(store)/basket/page.tsx:11` `<h1>Basket</h1>`, `app/components/features/basket/EmptyBasket.tsx:9` "Your basket is empty", `app/checkout/error.tsx:10` "return to your basket" — while the button and its `ShoppingCart` icon say "Cart".
- **User-visible impact:** Inconsistent, slightly unprofessional; "To cart" in particular reads as a translation stub.
- **2026 standard:** One verb+noun label ("Add to basket") in one case, used site-wide, matching the page/nav noun.
- **Fix direction:** Pick "basket", set it as the single default in `BasketControls`, delete the per-card `label` overrides.

### P1-2 Footer social icons and "Order Status" are non-functional
- **Where:** `app/components/layout/footer/Footer.tsx:55-73` (`SocialIcon` is a `<div>`, no `href`), rendered at `:199-214`; `:21-23` `PlaceholderItem` (a `<span className="cursor-default">`), rendered at `:138` as "Order Status".
- **What:** Five social icons (X, Facebook, Instagram, Pinterest, YouTube) under a "FIND US" heading that are not links and go nowhere. "Order Status" in the PURCHASES column is plain text — yet `app/(store)/faq/page.tsx:25`, `app/(store)/returns-policy/page.tsx:37` and `app/(store)/shipping-policy/page.tsx:62` all tell users to "follow it from the Order Status section of your account".
- **User-visible impact:** On every page, a shopper clicks the Instagram icon or "Order Status" and nothing happens.
- **2026 standard:** Social icons link to real profiles (or are removed); every footer nav item is a working link.
- **Fix direction:** Wrap `SocialIcon` in real anchors with real URLs or drop the section; point "Order Status" at `/account/orders`.

### P1-3 Error pages are off-brand and semi-technical
- **Where:** `app/error.tsx:14-19`, `app/global-error.tsx:16-19`, `app/(store)/products/[...slug]/error.tsx:18-19`, `app/(store)/product/[slug]/error.tsx:17`, `app/checkout/error.tsx:8-9`.
- **What:** All use raw Tailwind `bg-gray-50 / text-gray-600 / bg-blue-600` instead of the brand token system the rest of the app uses. `app/error.tsx:16` prints raw `{error.message}` to the user; `:19` and `global-error.tsx:18` print `Error ID: {error.digest}`. `products/[...slug]/error.tsx:19` sub-copy is "Failed to load category products". Four pages say the identical bare "Something went wrong".
- **User-visible impact:** A crash drops the shopper onto an unstyled gray page showing an internal error string / hash.
- **2026 standard:** Branded error page, human sentence ("We hit a snag loading this page"), no raw exception text, optional support reference phrased for humans.
- **Fix direction:** One shared branded error component; suppress `error.message`; reword digest as "Reference: …" or hide it.

### P1-4 Basket line items show a number with no currency unit
- **Where:** `app/components/features/basket/BasketItem.tsx:65`, `:86`, `:133`, `:166`.
- **What:** `displayPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` with no `style:'currency'` and no "zł" appended → renders `1 259,65` bare.
- **User-visible impact:** On the basket page, per-item and per-line prices have no currency symbol at all; only the summary (`BasketSummary.tsx`) shows `zł`.
- **2026 standard:** Every monetary figure carries its unit.
- **Fix direction:** Route these through the same `formatPLN` helper used in the summary.

### P1-5 Filter chips and search autocomplete print `$`
- **Where:** `app/components/features/filters/ActiveFilterChips.tsx:47` `` `$${dollars.toLocaleString("en-US")}` ``; `app/components/features/search/AutocompleteItem.tsx:45` `` `…${centsToDisplay(...)...}` `` (leading `$`); `app/components/features/products/RelatedProducts.tsx:89` `` `${centsToDisplay(...).toFixed(2)}` ``.
- **What:** Active price-filter chips ("From $500", "$500 – $2,000"), the search dropdown price line, and the "Related products" price all use a dollar sign.
- **User-visible impact:** Same USD/PLN contradiction as P0-1, in three more places.
- **Fix direction:** Shared PLN formatter.

### P1-6 Empty-basket CTA only mentions headphones
- **Where:** `app/components/features/basket/EmptyBasket.tsx:19` — button text "Browse Headphones", `href="/"` (line 15).
- **What:** The store sells IEMs, DACs, amps and accessories (`app/components/features/search/SearchEmpty.tsx:9-14`), but the empty-basket CTA names only headphones and links to the homepage rather than a listing.
- **Fix direction:** "Browse products" / "Shop all", linking to `/products`.

## P2 — polish

### P2-1 "No products" empty states are three different terse strings
- `app/components/features/products/EmptyResults.tsx:23-24` "No products match the selected filters." / "No products found."; `app/components/features/products/ProductGrid.tsx:27` "No products found in this category."; `app/components/features/search/SearchEmpty.tsx:20` "No products found". Three components, three wordings, all blunt. Consolidate wording and add one helpful line + CTA (SearchEmpty already does this well — use it as the model).

### P2-2 Wishlist page copy and styling are raw
- `app/(store)/account/wishlist/page.tsx:46` "Your wishlist is empty." (blunt, no CTA); `:57` link uses `text-blue-600 underline` (raw Tailwind, not brand tokens — reads as unfinished); `:43` `<h1 className="text-2xl font-bold">` bypasses the `type-*` system used elsewhere.

### P2-3 Test-route metadata is Next.js boilerplate
- `app/(test)/layout.tsx:4-5` — `title: 'Next.js'`, `description: 'Generated by Next.js'`. The `(test)` group is not `robots`-excluded here; if any `(test)` route ships, this is what indexes.

### P2-4 Public routes that render bare dev previews
- `app/(store)/normalization/page.tsx` → `/normalization` and `app/(store)/normalize-accessories-section/page.tsx` → `/normalize-accessories-section` live in the public store group and render a homepage section with no header, intro, or nav context. The second file's own comment calls it a "Dev-only preview page". Reachable by URL, no `noindex`.

### P2-5 Casing inconsistencies in microcopy
- `app/components/features/search/SearchEmpty.tsx:29` "Try Instead" (Title Case) vs `:39` "Browse all products" (sentence case) in the same component. Button labels elsewhere mix Title Case ("Add to Cart", "Clear filters" is sentence, "Remove" ok) — pick one convention for buttons.

### P2-6 Newsletter submit label is "..."
- `app/components/features/newsletter/NewsletterSignup.client.tsx:58` — pending state renders `"..."` instead of a word ("Subscribing…"). Success/error strings ("Thanks for subscribing!", "Something went wrong. Please try again.", "Network error. Please try again.") are fine.

### P2-7 `Price` default variant rounds to whole units
- `app/components/ui/Price.tsx:16-17` — `variant='default'` forces `maximumFractionDigits: 0`, so `99.99` displays as `100`. Grid prices are silently rounded up.

### P2-8 Checkout success fallback wording
- `app/checkout/success/page.tsx:279` "You can try again or return to your basket." after a successful order path reads slightly odd out of context — verify it only shows on the genuine failure branch.

## Checked and OK
- **Static policy/marketing pages** — `about-us`, `contact`, `faq`, `privacy-policy`, `terms-of-service`, `returns-policy`, `shipping-policy` (all under `app/(store)/`): substantive real content, one consistent premium-retail voice, no lorem/TODO/placeholder, correct en-dash/em-dash usage, sensible section structure, GDPR-aware privacy copy, `lastUpdated="June 2026"` on the legal pages. Each has a written `title` (`"… — Sang Logium"`), `description`, canonical and OpenGraph. This layer is production-quality.
- **Footer links** — every policy/support/about link (`/shipping-policy`, `/returns-policy`, `/contact`, `/faq`, `/about-us`, `/terms-of-service`, `/privacy-policy`, `/account`) resolves to a real route; brand links build valid `/products?f=brand:` URLs.
- **Contact addresses** — `support@sanglogium.com`, `advice@sanglogium.com` (real brand domain, not `example.com`).
- **Auth copy** — `sign-in`, `sign-up`, `forgot-password`, `reset-password` forms: consistent "Sign In" / "Sign Up" / "Sign in with Google", human validation/error strings ("Sign in failed.", "Invalid code. Please try again.").
- **No lorem/ipsum** anywhere in `app/`. `TODO`/`FIXME`/`BACKLOG` markers exist only in comments (`app/actions/user.ts:1`, `app/components/layout/catalogue/**`, `lib/**`) — none render to users.
- **Checkout, order-history and email currency** — `app/checkout/**`, `app/(store)/account/orders/**`, `lib/email.ts`: correct `pl-PL` / `PLN` złoty formatting throughout. (The bug is that the storefront does *not* match this.)
- **Confirmed dead-link sweep** — no `href="#"`, `href=""`, `href="/todo"`, or `example.com` links in user-facing `app/` code; the only non-functional footer elements are the social icons and "Order Status" noted in P1-2.
