# Perceived-Performance Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code inspection only; zero doc reliance. No runtime measurement performed — findings are code-level risks to CWV/perceived speed._

## Summary
P0: 3 — P1: 7 — P2: 5. Verdict: the streaming/skeleton scaffolding is genuinely good (per-chunk Suspense on the PLP, `loading.tsx` on the fetching routes, `optimizeCss:false`/`inlineCss:true` chosen deliberately to protect streaming, custom AVIF/WebP Sanity loader, `next/font` with `swap`, CDN preconnect). What drags it down: a self-inflicted `filter: blur(8px)` transition sitting on the LCP image of every product grid, request waterfalls from sequential `await`s on the PDP and homepage, and an uncached `sanityFetch` that hits the Sanity API live on every dynamic PLP/search request.
Worst routes: **PDP** (`/product/[slug]` — triple sequential fetch, no data cache), **PLP** (`/products/[...slug]` — blurred LCP image, live Sanity per request), **checkout/payment** (client-side payment-intent waterfall + serialized trace `fetch`es before the Pay action).

## P0 — a professional evaluator would visibly wince

### P0-1 LCP product image ships blurred and un-blurs on a 350 ms filter transition
- **Where:** `app/components/features/products/reveal.module.css:20-29` (`.reveal { filter: blur(8px); transition: filter 350ms ease-out }`), applied in `app/components/features/products/ProductImage.tsx:55-58` to every grid `<Image>` including `priority` ones; `app/components/features/products/ChunkedProductGrid.tsx:42` marks chunk 0 `priority`.
- **What:** The first product image on the PLP is the LCP candidate. It is rendered with a static `blur(8px)` filter and only cleared when an inline script (`ImageRevealScript.tsx`) catches the image's `load` event and waits two `requestAnimationFrame`s, then a 350 ms `ease-out` transition runs. LCP is timestamped at the *final* paint of the element, so the deliberate blur-then-sharpen defers LCP by roughly one frame pair + up to 350 ms beyond the image's actual decode.
- **User-visible impact:** Above-the-fold product image resolves from fuzzy to sharp a third of a second after it has actually downloaded; Lighthouse/CrUX reads that as the LCP moment.
- **2026 standard:** The LCP image paints sharp on first frame. Blur-up is for *lazy* below-the-fold media only; the priority image either skips the reveal entirely or uses `next/image` `placeholder="blur"` (which resolves on decode, not on a timed CSS transition).
- **Fix direction:** When `priority` is true, render `ProductImage` without `data-reveal`/`.reveal` (no blur filter, no transition) so the first chunk's first row paints sharp immediately.

### P0-2 PDP does three data fetches strictly in series before any HTML
- **Where:** `app/(store)/product/[slug]/page.tsx:14` `await getProductBySlug(slug)` → `:21` `await getRelatedProducts(...)` → `:27` `await getWishlistProductIds()`.
- **What:** Three awaited round trips run back-to-back. `getRelatedProducts` legitimately needs `product._id`, but `getWishlistProductIds()` (a cookie/session read) is independent of both and still waits behind them. Nothing is wrapped in Suspense, so the below-the-fold "Related products" query also gates the initial response.
- **User-visible impact:** PDP TTFB / LCP is the sum of three latencies instead of two; the hero product image can't stream until the related-products query finishes.
- **2026 standard:** `Promise.all([getRelatedProducts(...), getWishlistProductIds()])` after the product resolves, and put `<RelatedProducts>` behind its own `<Suspense>` so the main product block streams first.
- **Fix direction:** Parallelize wishlist with related; move related products into a Suspense boundary fed by an unawaited promise (the PLP already does exactly this pattern).

### P0-3 Homepage renders nothing until two serial Sanity queries plus one 14-projection mega-query all resolve
- **Where:** `app/(store)/page.tsx:21-22` `const data = await fetchHomepageData(); const iemsData = await getIemProductsBySlugs(HOME_12);` — two awaits in series. `fetchHomepageData` → `sanity-cms/lib/homepage/getHomepageData.ts:207-399` is a single GROQ document with 14 sub-projections, 7 of them unbounded `*[_type == "product" && $x in catalogueLocationKeys] | order(_createdAt desc)` accessory scans.
- **What:** The IEM-gallery query fires only *after* the homepage batch resolves, though it shares nothing with it. The whole page (including the `<Hero>` LCP) is a synchronous child of both awaits — no per-section Suspense — so the hero image markup is withheld until the accessory scans return. ISR (`revalidate = 3600`) hides this from most users, but every cold build and every hourly regeneration pays the full serial cost, and any error path (`catch` returns empty) still blocks first.
- **User-visible impact:** On cache-miss / revalidation the first byte waits on the slowest of ~9 projections plus a second serial query; hero cannot paint independently.
- **2026 standard:** `Promise.all([fetchHomepageData(), getIemProductsBySlugs(HOME_12)])`; hero in its own `<Suspense>` fed first; below-the-fold sections (DACs, accessories, newest release) behind their own boundaries so they never gate the hero.
- **Fix direction:** Parallelize the two top-level awaits now; longer term split the mega-query so hero + featured stream ahead of accessories.

## P1 — they would note it

### P1-1 `sanityFetch` sets no Next cache/revalidate — dynamic PLP & search hit Sanity live every request
- **Where:** `sanity-cms/lib/client.ts:43-51` (`return client.fetch(query, params)` — no `next: { revalidate, tags }`, no `cache`). Consumed by `app/(store)/products/[...slug]/page.tsx:56-64` (5 parallel queries) + `:83-86` (per-chunk queries), and `app/(store)/search/page.tsx:19`.
- **What:** In Next 15 an un-annotated `fetch` is uncached. The PLP and search routes are dynamic (they read `searchParams` and `getWishlistProductIds()` reads cookies), so there is no full-route cache to fall back on. Every category navigation issues ~5 + N-chunk uncached GROQ requests to the Sanity API. `useCdn: true` helps edge latency but is not a Next data cache.
- **User-visible impact:** Every PLP/search load waits on a fresh Sanity round trip fan-out; repeat visits are no faster.
- **2026 standard:** Tagged, revalidated data cache (`next: { revalidate: 3600, tags: ['products'] }`) or `next-sanity`'s `sanityFetch` with `revalidateTag` wiring, so catalogue reads are served from the data cache and busted on publish webhook.
- **Fix direction:** Add a `revalidate` + tag to the shared `sanityFetch` wrapper; invalidate tags from the existing `/api/revalidate` handler.

### P1-2 Zero `next/dynamic` usage anywhere in `app/` — modals and drawers ship in the initial bundle
- **Where:** `grep next/dynamic app/` → no matches. E.g. `app/components/features/products/ImageGallery.tsx:111-163` (full-screen zoom modal markup always in the client component), `app/(store)/layout.tsx:71` `DrawersManager` imported eagerly.
- **What:** Heavy/rarely-used client widgets (image-zoom modal, drawer manager, any command palette via `cmdk`) are statically imported, so their JS is parsed on first load rather than on interaction.
- **User-visible impact:** Larger main-thread parse/compile cost up front → worse INP/TBT on low-end mobile, especially on the PDP.
- **2026 standard:** `dynamic(() => import(...), { ssr: false })` for modal/drawer/below-the-fold client widgets.
- **Fix direction:** Code-split the zoom modal and any non-critical drawer content behind `next/dynamic`.

### P1-3 Payment form fetches the Stripe client secret client-side after mount — long path to an interactive form
- **Where:** `app/checkout/payment/PaymentForm.client.tsx:292-330` — `useEffect(() => initPayment(metadata), ...)` POSTs `/api/checkout/payment-intent-session`, then sets `clientSecret`, only then `<Elements>` mounts and Stripe.js iframes load.
- **What:** Serial client waterfall: hydrate → fetch intent (with up to 3 retries/backoff) → mount `<Elements>` → Stripe loads PaymentElement iframe. The page (`payment/page.tsx`) is already an async server component that could create the PaymentIntent server-side and pass `clientSecret` as a prop.
- **User-visible impact:** Payment form shows a pulsing skeleton for one extra network round trip beyond TTFB before fields appear; on a flaky connection the backoff path stretches this to seconds.
- **2026 standard:** Create/resume the PaymentIntent in the server component, stream `clientSecret` down as a prop; client only mounts `<Elements>`.
- **Fix direction:** Move `initPayment` into `payment/page.tsx`, pass `clientSecret` to `PaymentForm`.

### P1-4 Pay button fires 3 sequential `await fetch('/api/trace')` calls before `confirmPayment`
- **Where:** `app/checkout/payment/PaymentForm.client.tsx:126-179` — `payment_submit_start` fetch awaited, then `elements.submit()`, then `payment_confirm_call` fetch awaited, then `stripe.confirmPayment`.
- **What:** Telemetry writes are on the critical path of the user's tap. Each is a blocking `await` to an internal API before the payment actually starts.
- **User-visible impact:** Perceptible lag between pressing "Pay" and the Stripe confirmation UI responding — reads as an unresponsive button (INP).
- **2026 standard:** Fire-and-forget telemetry (`void fetch(..., { keepalive: true })`) or `navigator.sendBeacon`; never `await` analytics on an interaction path.
- **Fix direction:** Drop the `await` on trace calls, or batch them post-confirmation.

### P1-5 Global catalogue mega-menu uses raw unoptimized `<img>` with full-resolution Sanity URLs
- **Where:** `app/components/layout/catalogue/hero/HeroImage.tsx:13-18` (`<img src={data.imageUrl}>`, `loading="lazy"` but no size params) and `app/components/layout/catalogue/details/DetailWatermark.tsx:21-26` (`<img src={imageUrl}>`, **no `loading` attr**, `scale-[3]`). `CatalogueNavbar` is rendered in `app/(store)/layout.tsx:56` — every store page.
- **What:** `imageUrl` comes from `image.asset->url` (original asset, no `?w=`/`?fm=`), served as-is with no `next/image`, no responsive `srcset`, no AVIF/WebP. `DetailWatermark` has no lazy hint so it can be fetched eagerly when the dropdown mounts.
- **User-visible impact:** Multi-hundred-KB (potentially multi-MB) PNGs downloaded for decorative nav art on every page; contends with LCP bandwidth on slow links.
- **2026 standard:** `next/image` with `sizes` + the existing custom Sanity loader, or at minimum append `?w=<n>&fm=webp&q=75` to the URL and keep `loading="lazy"` + `decoding="async"`.
- **Fix direction:** Route these through the Sanity image loader / `next/image`; add `loading="lazy"` to `DetailWatermark`.

### P1-6 Three separate icon libraries; only one is tree-shake-optimized
- **Where:** `package.json:55` `@phosphor-icons/react`, `:96` `react-icons`, `:99` `react-payment-icons`; `next.config.ts:41` `optimizePackageImports: ["@phosphor-icons/react"]` only.
- **What:** `react-icons` in particular is notorious for pulling large barrels when imported from a family entry point, and it is not in `optimizePackageImports`. Carrying three icon systems inflates the client bundle.
- **User-visible impact:** Extra JS to download/parse on first load → slower FCP/INP on mobile.
- **2026 standard:** One icon library; deep imports (`react-icons/fi/index.mjs` style) or `optimizePackageImports` coverage for every icon package in use.
- **Fix direction:** Consolidate on Phosphor; add `react-icons` (if kept) and `react-payment-icons` to `optimizePackageImports`.

### P1-7 Homepage below-the-fold sections are all eagerly imported and synchronously rendered
- **Where:** `app/(store)/page.tsx:1-16` static imports of `ProductSpotlight1-3`, `IemsGallery`, `NewestRelease`, `Dacs`, `Accessories`, `Featured`; `:24-60` all rendered inline with no Suspense.
- **What:** Every homepage section's component code is in the initial payload and every section's data must be present before the page returns (see P0-3). No streaming boundary between the hero and the accessories grid.
- **User-visible impact:** Hero paint is coupled to the slowest section; more hydration work than needed up front.
- **2026 standard:** Hero/first-viewport rendered eagerly; subsequent sections behind `<Suspense>` boundaries (and heavy client sections behind `next/dynamic`).
- **Fix direction:** Wrap each `<Shelf>` below the fold in its own `<Suspense fallback={skeleton}>`.

## P2 — polish

### P2-1 `Montserrat` font loader instantiated twice
- **Where:** `app/(store)/configuration.ts:24-28` and `app/checkout/layout.tsx:7-11` — two separate `Montserrat({...})` calls.
- **What:** Duplicate `next/font` declarations for the same family/subset; harmless functionally but each is its own build artifact and the checkout copy can drift.
- **Fix direction:** Export the single instance from `configuration.ts` and import it in the checkout layout.

### P2-2 `loading.tsx` missing on `/search` route segment
- **Where:** `app/(store)/search/` has `error.tsx` but no `loading.tsx`; the route relies on an in-page `<Suspense>` (`search/page.tsx:24`).
- **What:** The in-page Suspense covers results, but `SearchHeader` + `generateMetadata` still run before first paint with no route-level fallback; acceptable but inconsistent with PLP/PDP.
- **Fix direction:** Add a `search/loading.tsx` mirroring the grid skeleton for instant nav feedback.

### P2-3 Serialized `await logCheckoutEvent(...)` calls on the payment page render path
- **Where:** `app/checkout/payment/page.tsx:25, 58, 65, 123` — multiple awaited event-logger calls interleaved with guards and the Sanity query.
- **What:** Each awaited logging call adds latency to the payment page's server render. If the logger writes to a store/file these are real milliseconds on TTFB.
- **Fix direction:** Batch or fire-and-forget the non-guard telemetry.

### P2-4 PDP image-zoom modal always mounted in the client tree
- **Where:** `app/components/features/products/ImageGallery.tsx:111` — modal markup + a 1600×1600 `priority` `<Image>` (`:150-159`) are conditionally rendered by state but the component and its imports load with the PDP.
- **What:** The zoom `<Image priority>` at `:159` requests a large asset variant; `priority` on a modal image that is not visible on load is questionable (it should not preload).
- **Fix direction:** Drop `priority` on the zoom image; `next/dynamic` the modal.

### P2-5 `lodash` full package present as a dependency
- **Where:** `package.json:81` `"lodash": "^4.17.21"` (no `lodash-es`, `@types/lodash` at `:132`).
- **What:** No `import ... from 'lodash'` found in `app/`, but the full package is installed; any server/lib usage of the default import pulls the whole library. Worth confirming `lib/` and `sanity-cms/` deep-import only.
- **Fix direction:** Audit imports; switch to `lodash/<fn>` deep imports or `lodash-es`.

## Checked and OK
- `next/font/google` Montserrat with `display: "swap"` and CSS-variable wiring — `app/(store)/configuration.ts:24-28`.
- Custom Sanity image loader emits `auto("format")` + clamped quality; `next.config.ts:43-52` sets `formats: [avif, webp]`, `deviceSizes`/`imageSizes`, `minimumCacheTTL: 31536000`, `qualities: [75, 90]`.
- CDN `preconnect` + `dns-prefetch` to `cdn.sanity.io` — `app/(store)/layout.tsx:35-37`.
- `optimizeCss: false` + `inlineCss: true` chosen specifically to avoid buffering the streamed response — `next.config.ts:31-42` (correct call).
- PLP uses unawaited chunk promises + per-chunk `<Suspense>` with skeletons and `priority` on chunk 0 — `app/(store)/products/[...slug]/page.tsx:83-102`, `ChunkedProductGrid.tsx`.
- `loading.tsx` present for homepage, PLP, PDP, and `checkout/shipping`; PLP skeleton mirrors the loaded layout's sidebar column to avoid hydration CLS — `products/[...slug]/loading.tsx:21-32`.
- Search page wraps results in `<Suspense>` with a grid skeleton and passes an unawaited promise — `app/(store)/search/page.tsx:19-27`.
- Product grid/card imagery uses `next/image` with `sizes` and explicit `width/height` or `fill`; card figures use fixed `aspect-[4/3]` so media is dimensioned (low CLS) — `ProductCard.tsx:51`, `IemCard.tsx:27-39`, `AccessoryCard.tsx:24-36`.
- Hero LCP image: `priority` + `fetchPriority="high"` + LQIP blur placeholder + art-directed `<picture>` via `getImageProps` + reserved container height with `min-h-[80vh]` — `app/components/features/homepage/hero/Hero.tsx:27-73`.
- GA4 loaded via `next/script` `strategy="afterInteractive"` (not render-blocking) — `app/components/analytics/GoogleAnalytics.tsx:14-21`.
- `WebVitals` + `SpeedInsights` + drawers mounted inside a `<Suspense fallback={null}>` and only run effects client-side — `app/(store)/layout.tsx:70-75`.
- Homepage route is fully static/ISR (`export const revalidate = 3600`, no cookie/searchParams reads) — `app/(store)/page.tsx:18`.
- Stripe.js pulled only in the payment route's client chunk via module-level `loadStripe` singleton — `PaymentForm.client.tsx:14`.
- `poweredByHeader: false`, `compress: true`, CDN cache headers with `stale-while-revalidate` — `next.config.ts:53-91`.
