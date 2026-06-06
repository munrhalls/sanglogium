# Basket Page — Exact Code Trace

## Entry Point

`app/(store)/basket/page.tsx`
- Server Component
- Renders `Shelf` wrapper → `SegmentTitle` ("Your Basket") → `Suspense` (fallback `Loader`) → `BasketManager`

---

## Layout Shell

`app/components/layout/general/Shelf.tsx`
- `<section>` with `max-w-content` and horizontal padding
- Accepts `data-testid`

`app/components/ui/segment-title/SegmentTitle.tsx`
- Renders `logo-orbit.svg` icon + `<h1>` title + icon, centered

`app/components/common/Loader.tsx`
- White overlay with CSS spinner (used only as `Suspense` fallback)

---

## Core Orchestrator

`app/components/features/basket/BasketManager.tsx` (Client Component)

### Data Flow
1. Reads `items` + `_hasHydrated` from `basketStore` via Zustand `useShallow`
2. Builds `trackedIds` (accumulates product IDs across renders, never shrinks)
3. Calls SWR with key `basket-products:<sortedTrackedIds>` to fetch `/api/basket/products`
4. Enriches local basket items with CMS data (name, price, stock, image, parcel)
5. **Auto-adjusts quantity** if CMS `availableStock` < basket quantity; stores original in `stockAdjustments`
6. Sorts items: in-stock first, out-of-stock last
7. Computes `itemCount`, `subtotal`, `checkoutData`, `parcelData`
8. Debounced 500ms fetch to `/api/basket/shipping-rates` (POST with `parcelData` + country from `detectCountry`)

### Render States
- Not hydrated or SWR loading → `BasketSkeleton`
- Empty basket → `EmptyBasket`
- SWR error → error card with message
- Normal → 3-column grid (2 cols items, 1 col summary)

### Render Layout
- Desktop header row: Product / Price / Quantity / Total
- Maps `enrichedItems` to `BasketItem` rows
- Sidebar: `BasketSummary` (sticky on desktop, fixed bottom on mobile)

---

## Item Row

`app/components/features/basket/BasketItem.tsx` (Client Component)

### Props
`productId`, `name`, `quantity`, `displayPrice`, `image`, `availableStock`, `originalQuantity`

### Desktop (`lg-touch` / `lg-desktop`)
- 4-column grid row
- Col 1: product image via `next/image` with `sanityImageLoader` + product name
- Col 2: unit price via `Price` component
- Col 3: `originalQuantity` (strikethrough if stock-adjusted) + `BasketControls`
- Col 4: line total (`displayPrice * quantity`) via `Price`

### Mobile (default)
- Two-zone card layout
- Zone A: image + name + unit price
- Zone B: quantity controls + line total

---

## Quantity Controls

`app/components/features/basket/BasketControls.tsx` (Client Component)

### Behavior
- Not in basket → shows **Add** button (`addClassName` / default `btn-cart`)
- In basket → shows `[-] [qty] [+]` segment + trash icon (basket page only)

### Rules
- **Increment**: capped at `maxQuantity` if provided
- **Decrement on basket page**: stops at 1 (will not remove item)
- **Decrement on product page**: goes to 0 → removes item via `decrementQuantity`
- **Remove**: only on basket page, calls `removeProduct`

---

## Summary Sidebar

`app/components/features/basket/BasketSummary.tsx` (Client Component)

- Subtotal (item count)
- Shipping (`Calculating...` while null, else `Price`)
- Tax (hard-coded `$0.00`)
- Total (subtotal + shipping when available)
- `CheckoutButton` (disabled if no basket data or processing)
- "Continue Shopping" link to `/`

---

## Checkout Button

`app/components/features/checkout/reservation/CheckoutButton.tsx` (Client Component)

- Generates `checkoutSessionId` (`chk_<timestamp>_<random>`)
- Transforms `basketData` to minimal `{ productId, quantity }[]`
- Calls **Server Action** `initCheckoutSession(items, checkoutSessionId)`
- Shows spinner while `isProcessing`
- Displays error if action throws

---

## Skeleton & Empty States

`app/components/features/basket/BasketSkeleton.tsx`
- Pulse animation placeholders matching 2+1 grid layout
- `aria-busy="true"`

`app/components/features/basket/EmptyBasket.tsx`
- Shopping cart icon + "Your basket is empty" + description
- **Broken**: "Browse Headphones" is a `<button>` with **no `onClick` and no `href`** — clicking does nothing

---

## State Store

`store/basketStore.ts`

- **Zustand** + `persist` middleware
- **Storage**: `localStorage` with `sessionStorage` fallback; graceful degradation if both fail
- **Validation**: Zod schema (`productId: string.min(1)`, `quantity: int.positive`)
- **Hydration guard**: `_hasHydrated` flag to prevent SSR mismatch

### Actions
- `addProduct(productId)` — validates, increments if exists, appends if new
- `removeProduct(productId)` — filters out
- `incrementQuantity(productId)` — +1
- `decrementQuantity(productId)` — -1, filters if ≤ 0
- `setQuantity(productId, quantity)` — direct set or remove if ≤ 0; validates with Zod
- `clear()` — empties items

### Selectors exported
`selectTotalItemsCount`, `selectItems`, `selectItem`, `selectItemQuantity`, `selectHasItem`, `selectHasHydrated`

---

## API Routes

### `/api/basket/products`
`app/api/basket/products/route.ts`

- GET with `?ids=` comma-separated product IDs
- Calls `getBasketProducts(ids)` from Sanity
- Returns `{ success: true, data: products[] }` or `{ success: false, error: ... }`

### `/api/basket/shipping-rates`
`app/api/basket/shipping-rates/route.ts`

- POST body: `{ parcelData[], countryCode }`
- Aggregates parcels (total weight, volume, max dimensions)
- Splits into multiple parcels if exceeds 25kg / 99,000 cm³
- **PL**: calls `fetchAlleKurierRates` with sender address from env vars, returns cheapest option
- **GB / DE**: returns **mock** hard-coded options (TODO comments present)
- Returns `{ rate: { provider, servicelevel, rateId, amount, currency, estimatedDays } }` or `{ rate: null }`

---

## Sanity Backend

`sanity-cms/lib/products/getBasketProducts.ts`

- GROQ query on `product` docs by `_id in $ids` with `defined(price_data)`
- Returns: `_id`, `name`, `price_data`, `stock`, `reservedStock`, `image.asset._ref`, `parcel{...}`
- Uses `sanityFetch` (public read client, CDN enabled)

---

## Checkout Server Action

`app/actions/checkout/index.ts`

### `initCheckoutSession(items, checkoutSessionId?)`
- Reads `getCheckoutSession()` (iron-session)
- Sets `session.checkoutSessionId` and `session.basket = items`
- Logs checkout event via `logCheckoutEvent`
- `redirect("/checkout/address")`

### Downstream actions (not called by basket page, but in same file)
- `saveAddress(address)` — validates via Google Address Validation, saves to session, invalidates shipping fields, redirects to `/checkout/shipping`
- `saveShippingAction(...)` — guards for basket/address, validates price, saves shipping details, redirects to `/checkout/payment`

---

## Utilities

`lib/shipping/countryDetector.ts`
- Checks `localStorage` cache (1 hour TTL)
- Fetches `https://ipapi.co/json/` for country code
- Falls back to `navigator.language`
- Default: `'PL'`
- Valid codes: `PL`, `GB`, `DE`

`app/components/ui/Price.tsx`
- `Intl.NumberFormat('en-US', { style: 'currency', currency })`
- `variant='summary'` forces 2 decimal places; default uses 0

---

## Verified Gaps / Bugs

1. **EmptyBasket broken CTA**: `Browse Headphones` button has no `onClick` or `href` — it is dead.
2. **Shipping rates for GB/DE are mocked**: Returns static fake carriers, not real APIs.
3. **No AlleKurier fallback**: If `fetchAlleKurierRates` fails for PL, route returns `rate: null` with no error surfaced to user.
4. **CheckoutButton does not disable on out-of-stock items**: It only checks `basketData.length === 0`.
5. **BasketManager shipping cost does not handle API errors gracefully**: `catch` logs to console but leaves `shippingCost` stuck at `null` (shows "Calculating..." indefinitely).
