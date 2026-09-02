# Error / Empty / Loading State Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code inspection only; zero doc reliance._

## State inventory

| State | Where handled (file) | Quality |
| --- | --- | --- |
| Global 500 (root layout crash) | `app/global-error.tsx` | designed (basic) |
| Route render error (store subtree) | `app/error.tsx` | bare (generic gray, leaks `error.message`) |
| Checkout render error | `app/checkout/error.tsx` | designed (retry + back to basket) |
| Product page render error | `app/(store)/product/[slug]/error.tsx` | bare (generic, no nav) |
| Category page render error | `app/(store)/products/[...slug]/error.tsx` | bare (generic, no nav) |
| Search render error | `app/(store)/search/error.tsx` → `SearchError.tsx` | designed (icon, copy, retry) |
| `/products` (all products) render error | no file — falls to `app/error.tsx` | missing (segment-specific) |
| Account subtree render error (orders, wishlist, addresses, order detail) | no file — falls to `app/error.tsx` | missing |
| 404 — missing product | `product/[slug]/page.tsx:17` `notFound()` — no `not-found.tsx` anywhere | missing (Next built-in 404) |
| 404 — missing category | `products/[...slug]/page.tsx:37,69` `notFound()` — no `not-found.tsx` | missing |
| 404 — missing order | `account/orders/[orderNumber]/page.tsx:62` `notFound()` — no `not-found.tsx` | missing |
| 404 — unknown URL | no root/global `not-found.tsx` | missing |
| Homepage loading | `app/(store)/loading.tsx` | designed (approximate, some CLS risk) |
| Category loading | `app/(store)/products/[...slug]/loading.tsx` | designed (mirrors sidebar + grid, low CLS) |
| Product loading | `app/(store)/product/[slug]/loading.tsx` | designed (matches final layout) |
| `/products` (all products) loading | no `loading.tsx`, no Suspense (`products/page.tsx:44` awaits `Promise.all`) | missing |
| Search loading | `search/page.tsx:24` Suspense → `ProductGridSkeleton` | designed |
| Checkout shipping loading | `app/checkout/shipping/loading.tsx` | designed (matches option cards) |
| Checkout address / payment loading | no `loading.tsx` (payment does Sanity fetch, `payment/page.tsx:60`) | missing |
| Account pages loading (orders/wishlist/addresses) | none — async Sanity fetch, no Suspense | missing |
| Basket loading | `BasketManager.tsx:186` → `BasketSkeleton` (page Suspense fallback = `Loader`, off-brand) | designed / mixed |
| Empty basket | `EmptyBasket.tsx` | designed (icon, copy, CTA) |
| Empty search results | `SearchEmpty.tsx` | designed (icon, category suggestions, browse-all) |
| Empty PLP / zero-filter results | `EmptyResults.tsx` | bare (centered text; "Clear filters" only if filters active; no browse CTA for empty category) |
| Empty wishlist | `account/wishlist/page.tsx:45` | bare (`<p>Your wishlist is empty.</p>`) |
| Empty order history | `account/orders/page.tsx:32` | bare (`<p>No orders yet.</p>` gray) |
| Empty order items | `account/orders/[orderNumber]/page.tsx:89` | bare (`<p>No items.</p>`) |
| Basket product-load failure | `BasketManager.tsx:188` | bare (error message in card, no retry, no icon) |
| Basket shipping-rate failure | `BasketManager.tsx:175` | silent (`console.error` only; cost stays `null` / "Calculating…") |
| Payment: declined (`requires_payment_method`) | `checkout/success/page.tsx:246` | designed (distinct, shows decline reason, "Try again") |
| Payment: canceled | `checkout/success/page.tsx:270` | designed (distinct, "Try again") |
| Payment: processing | `checkout/success/page.tsx:291` | designed (distinct, reference code, refresh) |
| Payment: verification failed / Stripe down | `checkout/success/page.tsx:72,102` | designed copy — but recovery button points to non-existent `/support` |
| Payment: unexpected status | `checkout/success/page.tsx:319` | designed (reference + back to basket) — also broken `/support` link nearby |
| Order receipt not yet written | `checkout/success/OrderDetails.tsx:21` | designed (hourglass, amount, refresh) |
| Out-of-stock on PDP | `ProductInfo.tsx:67` shows text; `BasketControls.tsx:60` add button stays active | bare / broken |
| Auth required / session expiry | `lib/auth/dal.ts:84` `redirect("/sign-in")` | bare (no `returnTo`; user loses destination) |
| Sanity null in server components | mostly guarded (`?.` + `?? []`); `products/page.tsx` chunk throws unbounded by segment error boundary | mixed |

## Summary

Payment-result handling is genuinely strong: declined / canceled / processing / verification-failed / Stripe-down / unexpected are each a distinct, on-brand screen with a retry path — a rare thing to get right. Search states are also complete (loading, empty, error all designed).

Everything outside those two flows is thin. There is **no `not-found.tsx` anywhere in the app**, so every 404 — mistyped URL, unpublished product, stale category link, wrong order number — renders Next's unstyled built-in page with no header, nav, or search. The account subtree and the `/products` listing have neither a `loading.tsx` nor a segment `error.tsx`. Empty wishlist, empty order history, and empty PLP results are bare one-line text. Out-of-stock products can still be added to the basket.

Counts: **3 P0**, **7 P1**, **6 P2**. Verdict: checkout outcome UI is production-grade; the surrounding store is at prototype level for non-happy states. Biggest gaps: no 404 design, broken `/support` recovery link on the payment-failure screens, no account-area loading/error boundaries, addable out-of-stock items.

## P0 — a professional evaluator would visibly wince

### P0-1 No `not-found.tsx` — every 404 is Next's unstyled default
- **Where:** no `not-found.tsx` in `app/` (verified); `notFound()` called at `app/(store)/product/[slug]/page.tsx:17`, `app/(store)/products/[...slug]/page.tsx:37` and `:69`, `app/(store)/account/orders/[orderNumber]/page.tsx:62`
- **What:** No custom `not-found` boundary at any level, and no global one. All `notFound()` calls and all unknown URLs render the framework's built-in "404 — This page could not be found" — no site header, no nav, no footer, no search, no links.
- **User-visible impact:** A customer who clicks a stale link to a discontinued product, or mistypes a URL, hits a blank white dead end with no way back into the store except the browser back button.
- **2026 standard:** Branded 404 inside the site chrome, with a search box, popular-category links, and a "back to shop" CTA; for a missing product, "this product is no longer available" plus related items.
- **Fix direction:** Add `app/not-found.tsx` (global, branded, with nav + search) and a `app/(store)/product/[slug]/not-found.tsx` with product-specific copy and category links.

### P0-2 Payment-failure recovery button links to a route that does not exist
- **Where:** `app/checkout/success/page.tsx:90`, `:120` (also `:100`–`:126` Stripe-down branch) — `<a href="/support" class="btn-secondary">Contact support</a>`; no `app/support` route exists (verified)
- **What:** On the "we couldn't verify your payment" and "Stripe API down" screens — shown when the customer's card may already be charged — the primary recovery action is a link to `/support`, which 404s (see P0-1: to the unstyled default).
- **User-visible impact:** The single highest-anxiety screen in the whole app (money possibly taken, no confirmation) sends the user from a calm "contact support" button straight into a blank 404.
- **2026 standard:** Verification-failed screens link to a real contact channel (the `mailto:` already used elsewhere on the same page, or a real `/contact` / `/support` page) and surface the reference code for a support ticket.
- **Fix direction:** Point these buttons at the existing `mailto:support@sanglogium.com` (as the succeeded branch does) or `/contact`, and/or create `/support`.

### P0-3 Out-of-stock products can be added to the basket
- **Where:** `app/components/features/products/ProductInfo.tsx:67` (renders "Out of Stock" text) with `BasketControls` at `:94`; `app/components/features/basket/BasketControls.tsx:60` `handleAdd` calls `addProduct(productId)` unconditionally — no `stock` / `availableStock` prop is passed or checked
- **What:** The PDP shows a red "Out of Stock" label but the "Add to Cart" button is fully enabled. Adding an out-of-stock item succeeds in the Zustand store; `BasketManager.tsx:100` then caps `quantity` to `Math.min(item.quantity, availableStock)` = 0, producing a zero-quantity line item.
- **User-visible impact:** User adds a sold-out product, navigates to the basket, and finds a broken-looking row with quantity 0 and no explanation — or worse, proceeds toward checkout where `payment/page.tsx:77` finally redirects them back to the basket with `?error=out_of_stock`.
- **2026 standard:** Out-of-stock disables the add button, swaps it for "Notify me when available", and never lets the item enter the cart.
- **Fix direction:** Pass `product.stock` / `availableStock` into `BasketControls`; when `<= 0`, render a disabled state or a "Notify me" affordance instead of the add button.

## P1 — they would note it

### P1-1 Auth redirect drops the user's destination
- **Where:** `lib/auth/dal.ts:84` `redirect("/sign-in")` — no `returnTo`/callback param; `app/(store)/sign-in/SignInForm.tsx:87` reads `returnTo` but nothing sets it for page guards (only `WishlistButton.tsx:53` does it correctly)
- **What:** Any unauthenticated or session-expired visit to `/account`, `/account/orders`, `/account/orders/[n]`, `/account/addresses`, `/account/wishlist` redirects to a bare `/sign-in`; after login `SignInForm` falls through to `/account` because no `returnTo` was passed.
- **User-visible impact:** Session expires while a user is reading an order; they click a link, get bounced to sign-in, log in, and land on the account home instead of the order they wanted — they have to navigate back manually.
- **2026 standard:** Guard captures the current path and appends `?returnTo=`, and the post-login redirect honours it (the machinery already exists on the form side).
- **Fix direction:** In `verifySession`, read the incoming pathname (via `headers()`), `redirect(`/sign-in?returnTo=${encodeURIComponent(path)}`)`.

### P1-2 `/products` (all-products listing) has no loading and no error boundary
- **Where:** `app/(store)/products/page.tsx:44` — `await Promise.all([...4 Sanity queries])` with no Suspense; no `app/(store)/products/loading.tsx`; no `app/(store)/products/error.tsx` (only the sibling `[...slug]` segment has both)
- **What:** The primary "browse everything" route blocks on four Sanity queries with no streamed skeleton, and any throw from those queries or from `getProductsChunk` bubbles to the generic `app/error.tsx`.
- **User-visible impact:** Clicking "All Products" from the nav shows the previous page frozen (or nothing) until Sanity responds; a Sanity hiccup gives a generic gray "Something went wrong" with no category context or retry that keeps them in the catalogue.
- **2026 standard:** Instant skeleton on navigation (matching the grid), and a catalogue-scoped error state with "retry" that doesn't dump the shopper out of the store.
- **Fix direction:** Add `products/loading.tsx` (reuse the `[...slug]` one) and `products/error.tsx` (reuse `CategoryError`).

### P1-3 Account subtree has no loading or error states
- **Where:** `app/(store)/account/orders/page.tsx:20`, `account/orders/[orderNumber]/page.tsx:53`, `account/wishlist/page.tsx:10`, `account/addresses/page.tsx:12` — each `await backendClient.fetch(...)` with no Suspense; no `loading.tsx` or `error.tsx` under `app/(store)/account/`
- **What:** Every account page blocks on a Sanity round-trip with no skeleton, and a Sanity outage throws into the generic root `app/error.tsx`.
- **User-visible impact:** Order history and order detail feel unresponsive on navigation; if Sanity is down, "My Orders" becomes a generic error page rather than "we can't load your orders right now, try again".
- **2026 standard:** Skeleton list/table on load; scoped, reassuring error copy with retry, account nav still visible.
- **Fix direction:** Add `account/loading.tsx` and `account/error.tsx`; consider per-segment skeletons for the orders table and order detail.

### P1-4 Empty order history and empty wishlist are bare text
- **Where:** `app/(store)/account/orders/page.tsx:32` `<p className="text-gray-500">No orders yet.</p>`; `app/(store)/account/wishlist/page.tsx:45` `<p className="type-body text-secondary">Your wishlist is empty.</p>`
- **What:** First-time / empty states are a single unstyled sentence. Orders has a generic "Continue shopping" link; wishlist has one but no illustration or guidance.
- **User-visible impact:** A new customer opening "My Orders" or "My Wishlist" sees what looks like an unfinished page — no icon, no encouragement, no strong CTA.
- **2026 standard:** Designed empty state — icon/illustration, one line of friendly copy, a prominent "Start shopping" / "Browse headphones" button, consistent with `EmptyBasket`.
- **Fix direction:** Build a shared `EmptyState` component (mirror `EmptyBasket`) and use it here.

### P1-5 PLP empty state is bare and offers no path forward for a genuinely empty category
- **Where:** `app/components/features/products/EmptyResults.tsx:20` — centered `<p>` "No products found."; "Clear filters" button only renders when `filtersActive`
- **What:** A category with zero products (or an over-narrow filter that the user can't tell is a filter) shows one line of text. When no filters are active there is no CTA at all — no "browse all products", no category suggestions.
- **User-visible impact:** Dead end on a catalogue page; the user has nowhere obvious to go and may assume the site is broken.
- **2026 standard:** Empty PLP shows an icon, "no products in this category yet", links to parent category / all products, and (when filtered) a clear "clear filters".
- **Fix direction:** Add an always-present "Browse all products" link and category suggestions to `EmptyResults`, matching `SearchEmpty`.

### P1-6 Basket product-load failure has no recovery
- **Where:** `app/components/features/basket/BasketManager.tsx:188` — `if (error) return <div className="card-base p-6"><p className="text-error-700">{error.message}</p></div>`
- **What:** When `/api/basket/products` fails, the entire basket is replaced by a raw error string in a card — no icon, no "try again", no way to see the items that are still in the local store.
- **User-visible impact:** A transient network blip makes the customer's whole basket appear lost; their only option is a manual full-page reload.
- **2026 standard:** Inline error with a retry button (SWR `mutate`), keeping the basket header/summary shell, reassuring copy that items are saved.
- **Fix direction:** Add a retry button calling SWR `mutate`, an icon, and friendlier copy.

### P1-7 Basket shipping-rate failure fails silently
- **Where:** `app/components/features/basket/BasketManager.tsx:174` — `catch (e) { console.error('Failed to fetch shipping rates:', e); }`; `shippingCost` stays `null`
- **What:** If `/api/basket/shipping-rates` throws, nothing is surfaced; `BasketSummary` keeps showing the `null` (calculating) state indefinitely.
- **User-visible impact:** Shipping cost shows "Calculating…" forever; the customer can't tell whether it's loading or broken, and the total is incomplete.
- **2026 standard:** "Couldn't estimate shipping — calculated at checkout" fallback message, or a retry.
- **Fix direction:** Set an error flag in the catch and render a fallback line in `BasketSummary`.

## P2 — polish

### P2-1 Product and category `error.tsx` are generic and strip the site chrome
- **Where:** `app/(store)/product/[slug]/error.tsx:15`, `app/(store)/products/[...slug]/error.tsx:16` — plain `min-h-[50vh]` centered "Something went wrong / Failed to load…", `bg-black` button, no nav, no links
- **What:** Functional (has `reset`) but off-brand and offers only "Try again" — no "back to shop", no search.
- **2026 standard:** Error states keep the header/nav and offer a secondary navigation path, not just retry.
- **Fix direction:** Add a "Browse products" link and align styling with the design system (these use raw Tailwind `bg-black`, unlike `SearchError`).

### P2-2 `app/error.tsx` renders raw `error.message` to users
- **Where:** `app/error.tsx:16` — `{error.message || "An unexpected error occurred."}`
- **What:** For client-side render errors (not masked by the server in production), the raw exception message is shown to the shopper.
- **2026 standard:** Always show friendly, fixed copy; keep the digest for support only.
- **Fix direction:** Drop `error.message` from the visible text; keep `error.digest`.

### P2-3 `Loader` (basket Suspense fallback) is off-brand
- **Where:** `app/components/common/Loader.tsx:11` — `absolute inset-0 ... bg-white`, `border-t-blue-500` spinner; used at `app/(store)/basket/page.tsx:14`
- **What:** White background + blue spinner against the dark store theme. Rarely seen because `BasketManager` renders `BasketSkeleton` itself, but it is the SSR fallback.
- **Fix direction:** Use `BasketSkeleton` as the page-level Suspense fallback too, or restyle `Loader` to theme tokens.

### P2-4 Homepage skeleton approximates rather than mirrors the real layout
- **Where:** `app/(store)/loading.tsx:4` — guessed hero `h-[50vh] min-h-[400px]`, generic 4-card row, 3 generic split rows, 8-tile grid
- **What:** Not tied to the actual homepage section components, so heights/counts can drift from the real sections and cause CLS on hydration.
- **2026 standard:** Skeleton dimensions derived from the same layout primitives as the real sections.
- **Fix direction:** Base each skeleton block on the corresponding section component's real dimensions.

### P2-5 Checkout `address` / `payment` have no `loading.tsx`
- **Where:** `app/checkout/address/page.tsx:7`, `app/checkout/payment/page.tsx:60` (Sanity fetch) — only `app/checkout/shipping/loading.tsx` exists
- **What:** Navigation into the payment step (which does a Sanity product fetch + validation) shows no skeleton; the step is guarded so errors mostly redirect, but a slow fetch is a blank beat.
- **Fix direction:** Add `checkout/payment/loading.tsx` mirroring the summary + payment-form two-column layout.

### P2-6 Order-detail sub-states are bare
- **Where:** `app/(store)/account/orders/[orderNumber]/page.tsx:89` "No items.", `:181` / `:206` "Not recorded"
- **What:** Minor — internal fallbacks that a real order should never hit, but rendered as plain gray text with no styling.
- **Fix direction:** Low priority; style consistently if touched.

## Checked and OK

- **Payment result page** (`app/checkout/success/page.tsx`) — `succeeded`, `requires_payment_method` (declined, with decline reason), `canceled`, `processing` (with reference + refresh), `verification_failed`, Stripe-API-down, and unexpected-status are each a distinct, on-brand screen with a retry path. Privacy guard redirects missing `payment_intent` to `/basket` (`:46`); session-gate failure falls back to a Sanity order lookup before denying (`:61`). Strong. (Only defect: the `/support` link — see P0-2.)
- **Order receipt not-yet-written** (`checkout/success/OrderDetails.tsx:21`) — designed hourglass state with amount charged + refresh button while the webhook catches up.
- **Search** — loading (`search/page.tsx:24` Suspense → `ProductGridSkeleton`), empty (`SearchEmpty.tsx` — icon, category suggestions, browse-all), and error (`search/error.tsx` → `SearchError.tsx` — icon, copy, retry) are all designed and on-brand.
- **Empty basket** (`EmptyBasket.tsx`) — icon, friendly copy, clear CTA.
- **Category listing loading** (`products/[...slug]/loading.tsx`) — explicitly mirrors the loaded flex row + fixed sidebar column and uses the shared grid class, so hydration doesn't shift. `ProductGridSkeleton.tsx` matches `ProductCard`'s `aspect-[4/3]` box + text block.
- **Product page loading** (`product/[slug]/loading.tsx`) — breadcrumb + gallery + info + specs skeleton matches the final layout closely.
- **Checkout shipping loading** (`checkout/shipping/loading.tsx`) — matches the stepper + option-card layout including the mobile sticky CTA.
- **Checkout render error** (`app/checkout/error.tsx`) — "Try again" + "Back to basket", reasonable copy.
- **Checkout step guards** (`checkout/address/page.tsx:10`, `checkout/shipping/page.tsx:13,19`, `checkout/payment/page.tsx:27–128`) — every missing precondition (no basket, no address, no shipping cost, invalid/excessive quantity, out-of-stock, invalid total) redirects cleanly to the right earlier step, several with an `?error=` code for the basket to display.
- **Shipping package-calc failure** (`checkout/shipping/page.tsx:41–57`) — caught, logged, and passed to `ShippingPageClient` as an `error` prop with empty options rather than throwing.
- **Auth form error UI** — `SignInForm.tsx:139` (with email-not-verified resend flow), `ForgotPasswordForm.tsx:30` (plus enumeration-safe success copy), and the 2FA path all render styled error/success banners with design tokens.
- **Server-component null handling** — `account/wishlist/page.tsx:38`, `account/addresses/page.tsx:23`, `account/page.tsx:36`, `account/orders/[orderNumber]/page.tsx:61` all guard null with `?.` + `?? []` or `notFound()`; `formatAddress`/`formatCurrency` in order detail tolerate missing fields.
