# Checkout State Machine — Mathematical Specification

> **Audit Date:** 2026-04-03
> **Scope:** Basket → Checkout (Shipping → Payment) → Return
> **Stack:** Next.js 15 · React 18 · Sanity v3 · Stripe Embedded Checkout · Zustand · Clerk Auth · Google Address Validation API
> **Status:** Constraint contract for sprint consumption

---

## Part 1: Technology Ground-Truth (Confirmed Dependencies)

| Dependency | Version | Role |
|---|---|---|
| `@stripe/react-stripe-js` | ^5.3.0 | Embedded Checkout UI |
| `@stripe/stripe-js` | ^8.2.0 | Stripe.js loader (client) |
| `stripe` | ^19.1.0 | Stripe Node SDK (server) |
| `zustand` | ^5.0.1 | Client-side basket state (localStorage persisted) |
| `react-hook-form` | ^7.66.0 | Shipping address form |
| `@clerk/nextjs` | ^6.16.0 | Authentication (optional, guest allowed) |
| `@googlemaps/addressvalidation` | ^3.2.1 | Google Address Validation (via server action) |
| `jose` | ^6.1.2 | JWT for legacy checkout cookie (`CHECKOUT_JWT_SECRET`) |
| `zod` | ^4.1.12 | Schema validation (available, not actively used in checkout) |
| `next-sanity` | ^9.12.3 | Sanity client |

### Sanity Clients Used in Pipeline

| Client | Token | Usage |
|---|---|---|
| `checkoutClient` | `SANITY_API_TOKEN` | Stock reservation, finalization, rollback |
| `backendClient` | `SANITY_API_TOKEN` | User address fetch, order creation, order queries |

### Stripe Configuration

| Parameter | Value |
|---|---|
| `ui_mode` | `"embedded"` |
| `mode` | `"payment"` |
| Session expiry | `25 minutes` (from creation) |
| `customer_creation` | `"always"` (auth users only) |
| `return_url` | `{origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}` |

---

## Part 2: Journey Map — Bus Stops (Nodes)

```
┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐    ┌────────────┐
│  B-1    │───▶│    B-2       │───▶│    C-1      │───▶│   C-2     │───▶│    C-3     │
│ Product │    │   Basket     │    │  Shipping   │    │  Payment  │    │   Return   │
│ Browse  │    │   Page       │    │  Address    │    │  (Stripe) │    │   Page     │
└─────────┘    └──────────────┘    └─────────────┘    └───────────┘    └────────────┘
     │               │                   │                  │                │
   addItem()     Checkout CTA      submitAddress()    fetchClientSecret   getOrderBySession
                                                      → POST /api/checkout  → clearBasket
```

### Node Index

| ID | Route | Component Boundary | Server/Client |
|---|---|---|---|
| **B-1** | `/product/[slug]` | `ProductInfo` → `addItem()` | Client |
| **B-2** | `/basket` | `BasketPage` → `BasketClientWrapper` → `Basket` + `BasketSummary` | Client |
| **C-0** | `/checkout` | `page.tsx` — immediate redirect to `/checkout/shipping` | Server |
| **C-1** | `/checkout/shipping` | `ShippingPage` → `FormView` or `ConfirmationView` | Client (within Server layout) |
| **C-2** | `/checkout/payment` | `EmbeddedCheckoutForm` → Stripe `<EmbeddedCheckout>` | Client |
| **C-3** | `/checkout/return?session_id=X` | `CheckoutReturnClient` → `OrderSummary` | Server page + Client components |
| **W-1** | `POST /api/webhook` | Stripe webhook handler | Server (API route) |

---

## Part 3: State Matrix — Entry State & After-State

### B-1: Product Browse → Add to Cart

| Dimension | Specification |
|---|---|
| **Trigger** | User clicks "Add to Cart" on a product page |
| **Entry State** | Zustand store hydrated (`_hasHydrated: true`), product data available from Sanity |
| **Validation Gate** | `addItem()` validates: `_id`, `name`, `displayPrice` (number), `stock` (number), `image`, `slug` — all must be truthy/valid |
| **Quantity Logic** | New item: `min(item.quantity, item.stock)` — must be > 0. Existing item: `min(existing.quantity + item.quantity, item.stock)` |
| **After-State: Zustand** | `basket[]` updated with `BasketItem { _id, name, displayPrice, stock, quantity, image, slug }` |
| **After-State: localStorage** | `basket-storage` key updated (via Zustand persist middleware) |
| **After-State: UI** | Header cart badge count updates (reads `selectBasketCount`). Product UI transitions from "Add to Cart" → "In Cart" state |
| **Failure Mode** | Silent no-op if validation fails (no error thrown, no UI feedback) |

#### BasketItem Shape (Contract)

```typescript
interface BasketItem {
  _id: string;        // Sanity document _id
  name: string;       // Product name
  displayPrice: number; // Unit price (e.g., 19.99)
  stock: number;      // Available stock at time of add
  quantity: number;    // User-requested quantity (clamped to stock)
  image: string;      // Product image URL
  slug: string;       // URL slug
}
```

---

### B-2: Basket Page

| Dimension | Specification |
|---|---|
| **Route** | `/basket` |
| **Entry State** | Zustand store rehydrating from localStorage. Three possible states on mount: ① Hydrating (skeleton) ② Hydrated + empty basket ③ Hydrated + items |
| **Hydration Gate** | `_hasHydrated === false` → render skeleton. `basket.length === 0` → render `EmptyBasketContent`. Otherwise → render `Basket` + `BasketSummary` |
| **Available Actions** | Quantity update (`updateQuantity`), item removal (`removeItem` with 500ms animation), navigate to checkout |
| **Quantity Constraints** | `updateQuantity`: `Math.max(1, quantity)` then `Math.min(safeQuantity, item.stock)`. Floor = 1, ceiling = stock |
| **Removal Animation** | 500ms opacity + max-height transition, then `removeItem(id)` fires |
| **Checkout CTA Gate** | `selectIsCheckoutEnabled`: `basket.length > 0 AND every item has quantity > 0 AND stock > 0`. If false → button disabled with `opacity-50 cursor-not-allowed` |
| **Checkout CTA Target** | `<Link href="/checkout">` (client-side navigation) |
| **Shipping Line** | **Hardcoded**: `$15.99` static value in [BasketSummary.tsx:15](file:///c:/webdev/sang-logium/app/%28store%29/basket/BasketSummary.tsx#L15) |
| **After-State: Navigation** | User navigates to `/checkout` → server redirect to `/checkout/shipping` |

#### Summary Calculations (Client-Side)

```
subtotal = Σ(item.displayPrice × item.quantity) for all items in basket
shipping = 15.99 (hardcoded)
total    = subtotal + shipping
```

---

### C-0: Checkout Entry Point (Server Redirect)

| Dimension | Specification |
|---|---|
| **Route** | `/checkout` |
| **Implementation** | `redirect("/checkout/shipping")` — immediate server-side 307 redirect |
| **Layout Behavior** | `checkout/layout.tsx` is Server Component. Runs on EVERY checkout sub-route |

---

### C-LAYOUT: Checkout Layout (Server Component — Critical)

| Dimension | Specification |
|---|---|
| **Component** | [checkout/layout.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/layout.tsx) (Server Component — `async function`) |
| **Execution** | Runs on every request to `/checkout/*` routes |
| **Auth Check** | `await currentUser()` via `@clerk/nextjs/server` |
| **Address Resolution Priority** | ① Authenticated user → fetch from Sanity (`addresses[]` on user document, prefer `isDefault`) ② Guest → read `checkout_context` JWT cookie via `getCheckoutCookie()` |
| **Address Shape Transform** | Sanity `{ line1, line2, city, postalCode, country }` → Checkout `{ street, streetNumber, city, postalCode, regionCode }` |
| **Initial Status** | Always `"EDITING"` (hardcoded in layout) |
| **Output** | Wraps children in `<CheckoutProvider initialAddress={...} initialStatus={...}>` |
| **Guest Cookie** | Reads `checkout_context` cookie → JWT verify with `CHECKOUT_JWT_SECRET` → extract `GuestContext.address` |

#### Authenticated User Address Resolution

```
1. currentUser() → user.id
2. Sanity query: *[_type == "user" && clerkUserId == $id][0]{ addresses }
3. Find: addresses.find(a => a.isDefault) || addresses[0]
4. Validate: line1, city, postalCode, country must all be truthy strings
5. Transform → Address { street: line1, streetNumber: line2, city, postalCode, regionCode: country }
```

#### Guest Address Resolution

```
1. getCheckoutCookie() → JWT verify → GuestContext
2. If GuestContext.address exists:
   Transform → Address { street: line1, streetNumber: line2, city, postalCode: postal_code, regionCode: country }
```

---

### C-1: Shipping Address

| Dimension | Specification |
|---|---|
| **Route** | `/checkout/shipping` |
| **Context Consumer** | `useCheckout()` — reads `{ status, address, apiErrors, submitAddress, editAddress }` |
| **Rendering Logic** | `status === "LOADING"` → Loader. `status === "ACCEPT" && address` → `ConfirmationView`. Otherwise → `FormView` |

#### C-1a: FormView (Address Input)

| Dimension | Specification |
|---|---|
| **Form Library** | `react-hook-form` with `mode: "onChange"` |
| **Default Values** | `address || undefined` from CheckoutProvider context |
| **Address Reset** | If `address` changes (e.g., from layout hydration), `reset(address)` + `trigger()` revalidate |
| **Fields** | `regionCode` (select: PL, GB), `postalCode` (required, min 5), `street` (required), `streetNumber` (required), `city` (required) |
| **Submit Gate** | Button disabled when `!isValid` (react-hook-form validation) |
| **Submit Action** | `handleSubmit(submitAddress)` — calls `CheckoutProvider.submitAddress(data)` |
| **Error Display** | `status === "FIX"` → red banner with `apiErrors.form` or default message |

#### C-1b: submitAddress Flow (CheckoutProvider)

```
1. setStatus("LOADING"), setAPIErrors({})
2. await submitShippingAction(data) — Server Action
3. If response.status === "ACCEPT" && response.address:
   → setAddress(response.address), setStatus("ACCEPT")
4. On catch:
   → setStatus("FIX"), setAPIErrors({ form: "Something went wrong..." })
```

#### C-1c: submitShippingAction (Server Action)

| Dimension | Specification |
|---|---|
| **File** | [address.ts](file:///c:/webdev/sang-logium/app/actions/address/address.ts) |
| **API** | Google Address Validation API (`addressvalidation.googleapis.com/v1:validateAddress`) |
| **API Key** | `GOOGLE_MAPS_API_KEY` (server-side, NOT `NEXT_PUBLIC_`) |
| **Region Mapping** | `"UK" → "GB"` |
| **Address Assembly** | `addressLines: ["street streetNumber"]`, `locality: city`, `postalCode`, `regionCode` |
| **Accept Criteria** | `verdict.addressComplete === true` AND no replaced/spell-corrected components AND both `inputGranularity` and `validationGranularity` ∈ `{"PREMISE", "SUB_PREMISE"}` |
| **On Accept** | Returns `{ status: "ACCEPT", address: correctedAddress, geocode, placeId }` |
| **On Reject** | Returns `{ status: "FIX", errors: { message: "..." } }` |
| **correctedAddress** | Built from Google API components: `route`, `street_number`, `locality`/`postal_town`, `postalCode`, `regionCode` |

#### C-1d: ConfirmationView (Address Accepted)

| Dimension | Specification |
|---|---|
| **Entry State** | `status === "ACCEPT"` AND `address !== null` |
| **Displays** | `DisplayAddress` component with `street`, `streetNumber`, `city`, `postalCode`, `regionCode → countryName` |
| **Country Map** | `{ GB: "Great Britain", PL: "Poland" }` — only 2 supported |
| **Actions** | "Edit" button → `editAddress()` → `setStatus("EDITING")`. "Proceed to Payment" → `<Link href="/checkout/payment">` |
| **After-State** | User navigates to `/checkout/payment` (client-side) |

#### CheckoutProvider Status State Machine

```
EDITING ──submitAddress()──▶ LOADING ──success──▶ ACCEPT
                                      ──failure──▶ FIX
ACCEPT  ──editAddress()───▶ EDITING
FIX     ──(user resubmits)──▶ LOADING ──...──▶ (repeat)
```

Valid states: `"EDITING" | "LOADING" | "FIX" | "CONFIRM" | "ACCEPT"`
- `CONFIRM` is defined in type but **never set** by current code.

---

### C-2: Payment (Stripe Embedded Checkout)

| Dimension | Specification |
|---|---|
| **Route** | `/checkout/payment` |
| **Entry State** | Basket must be non-empty (reads Zustand store). Address must have been accepted at C-1 (⚠️ no explicit guard — user can navigate directly) |
| **Basket Projection** | `basket.map(item => ({ _id, quantity }))` → `BasketCheckoutItem[]` (strips all client-local data) |
| **UI** | Full-screen fixed overlay (`z-50`) with Stripe `<EmbeddedCheckout>` |
| **Close Action** | `router.back()` — navigates back to previous route |

#### C-2a: fetchClientSecret Flow (Client → Server)

```
1. POST /api/checkout with body: { publicBasket: BasketCheckoutItem[] }
2. On success: return data.client_secret (Stripe session client secret)
3. On failure: throw Error (Stripe embedded checkout handles display)
```

#### C-2b: POST /api/checkout (Server — Critical Route)

| Step | Operation | Failure Response |
|---|---|---|
| 1 | **Rate Limit**: 5 req/min per IP (in-memory Map) | `429` |
| 2 | **Parse Body**: `req.json()` → `body.publicBasket` | — |
| 3 | **Validate Basket**: `validateBasket()` — must be array, 1-50 items, no duplicates, each item has valid `_id` (1-64 chars, sanitized) and `quantity` (int, 1-99) | `400` |
| 4 | **Auth Check**: `currentUser()` → optional. Extracts `user.primaryEmailAddress` | — |
| 5 | **Fetch Server Products**: Sanity query: `*[_type == "product" && _id in $productIds] { _id, name, stock, reservedStock, stripePriceId, _rev }` | — |
| 6 | **Stock Check Loop**: For each item: `availableStock = stock - (reservedStock \|\| 0)`. If `availableStock < quantity` → `409` | `400` (product missing) or `409` (insufficient stock) |
| 7 | **Reserve Stock**: `checkoutClient.patch(id).inc({ reservedStock: quantity }).ifRevisionId(_rev).commit()` | — |
| 8 | **Create Stripe Session**: `stripe.checkout.sessions.create(...)` with `ui_mode: "embedded"`, `mode: "payment"`, `expires_at: now + 25min` | `500` + rollback |
| 9 | **Return**: `{ client_secret: session.client_secret }` | — |

> [!IMPORTANT]
> Stock reservation uses `ifRevisionId(_rev)` for optimistic concurrency control against the Sanity document. If a concurrent write has changed the document between the fetch and the patch, the patch will fail.

#### Stock Reservation Tracking

```
productsIntent = items.map(i => `${i._id}:${i.quantity}`).join(",")
  → stored in Stripe session metadata
  → used by webhook to finalize or release stock
```

#### Rollback on Failure

```
If Stripe session creation fails OR unhandled error after reservations:
  → rollbackReservations(): .dec({ reservedStock: quantity }) for each reserved item
```

---

### C-3: Return Page (Order Confirmation)

| Dimension | Specification |
|---|---|
| **Route** | `/checkout/return?session_id={CHECKOUT_SESSION_ID}` |
| **Server Component** | [return/page.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/return/page.tsx) — `async function`. Extracts `searchParams.session_id` |
| **Server Fetch** | `getOrderBySession(sessionId)` — Sanity query: `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]` |
| **Client Component** | `CheckoutReturnClient` — handles polling + display |

#### C-3a: CheckoutReturnClient Polling State Machine

```
1. If initialOrder exists:
   → setOrder(initialOrder), clearBasket() — DONE
2. If no initialOrder AND sessionId:
   → Poll every 2000ms for up to 30 attempts (60s max)
   → Each poll: getOrderBySession(sessionId)
   → On success: setOrder(order), clearBasket(), stop polling
   → On max attempts: setLoading(false) → "Order not found" fallback
3. If no sessionId:
   → "Invalid session" with link to home
```

#### C-3b: Render States

| State | Condition | UI |
|---|---|---|
| No session | `!sessionId` | "Invalid session" + "Go Home" link |
| Loading | `loading === true` | Spinner + "Processing your order..." |
| Order not found | `!order && !loading` | "Order not found" + retry message + "Go Home" |
| Order found | `order !== null` | `SuccessMessage` + `WhatHappensNext` + `OrderSummary` + `ActionButtons` |

#### C-3c: After-State (Success)

| Dimension | Specification |
|---|---|
| **Zustand** | `clearBasket()` → `basket: []` |
| **localStorage** | `basket-storage` cleared to empty basket |
| **UI** | Green success page with order number, order summary (items, pricing), "View My Orders" + "Continue Shopping" buttons |
| **Action Buttons** | "View My Orders" → `/account/orders`, "Continue Shopping" → `/` |

---

### W-1: Webhook Handler (Server — Background)

| Dimension | Specification |
|---|---|
| **Route** | `POST /api/webhook` |
| **Signature** | `stripe.webhooks.constructEvent(body, stripe-signature, STRIPE_WEBHOOK_SECRET)` |
| **Permitted Events** | `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed` |

#### W-1a: checkout.session.completed

| Step | Operation |
|---|---|
| 1 | **Idempotency check**: Query Sanity for existing order by `stripeCheckoutSessionId`. If exists → return early |
| 2 | **Retrieve full session**: `stripe.checkout.sessions.retrieve(id, { expand: ["line_items", "line_items.data.price.product"] })` |
| 3 | **Amount validation**: `calculatedTotal` (sum of line item amounts) must equal `session.amount_total` |
| 4 | **Parse products intent**: `session.metadata.productsIntent` → `[{ productId, quantity }]` |
| 5 | **Fetch products from Sanity**: Get `name, slug, image` for each product |
| 6 | **Build order items**: Map line items + Sanity product data → `OrderItem[]` |
| 7 | **Extract shipping**: From `session.shipping_details` or `session.customer_details` |
| 8 | **Create order in Sanity**: `createOrder(orderOptions)` → generates `orderNumber` (ORD-YYYY-NNNN), `orderId` |
| 9 | **Finalize stock**: Transaction: `.dec({ stock: quantity, reservedStock: quantity })` for each product |

#### W-1b: checkout.session.expired

| Operation |
|---|
| Parse `productsIntent` from metadata |
| `releaseReservations()` → `.dec({ reservedStock: quantity })` for each item |

#### W-1c: checkout.session.async_payment_failed

| Operation |
|---|
| Identical to expired: `releaseReservations()` |

---

## Part 4: Pathway Divergence — Guest vs. Authenticated

### Address Resolution (C-LAYOUT)

| Dimension | Guest | Authenticated |
|---|---|---|
| **Detection** | `currentUser()` returns `null` | `currentUser()` returns `User` object |
| **Address Source** | `checkout_context` JWT cookie (via `getCheckoutCookie()`) | Sanity user document → `addresses[]` |
| **Address Priority** | Single cookie address (if exists) | `addresses.find(a => a.isDefault) \|\| addresses[0]` |
| **Cookie Secret** | `CHECKOUT_JWT_SECRET` (⚠️ noted as potentially corrupted) | Not used |
| **Fallback** | `initialAddress = null` → form starts empty | `initialAddress = null` → falls through to guest cookie check → then null |

### Stripe Session Creation (/api/checkout)

| Dimension | Guest | Authenticated |
|---|---|---|
| **customer_email** | NOT set on session | `user.primaryEmailAddress.emailAddress` |
| **customer_creation** | NOT set (Stripe default) | `"always"` |
| **metadata.clerkUserId** | `"guest"` | `user.id` (actual Clerk user ID) |

### Order Creation (Webhook)

| Dimension | Guest | Authenticated |
|---|---|---|
| **clerkUserId** | `undefined` (metadata was "guest") | `session.metadata.clerkUserId` |
| **isGuest** | `true` | `false` |
| **customerEmail** | `session.customer_details.email` (from Stripe form) | `session.customer_details.email` (pre-filled) |

### Return Page Actions

| Dimension | Guest | Authenticated |
|---|---|---|
| **"View My Orders"** | Links to `/account/orders` — ⚠️ No guest order lookup mechanism | Links to `/account/orders` — works if orders are Clerk-user-linked |
| **Basket Clear** | Same: `clearBasket()` | Same: `clearBasket()` |

---

## Part 5: Data Flow Payloads

### Payload P-1: Zustand → Basket Page

```typescript
// Stored in localStorage key: "basket-storage"
{
  state: {
    basket: BasketItem[] // { _id, name, displayPrice, stock, quantity, image, slug }
  },
  version: 1
}
```

### Payload P-2: Basket → Payment Page (Client Projection)

```typescript
// BasketCheckoutItem[] — sent to /api/checkout
{
  publicBasket: [
    { _id: string, quantity: number }
    // All pricing/product data stripped — server re-fetches from Sanity
  ]
}
```

### Payload P-3: Server → Stripe Session

```typescript
{
  ui_mode: "embedded",
  mode: "payment",
  line_items: [
    { price: "price_xxx", quantity: number } // stripePriceId from Sanity
  ],
  return_url: "{origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}",
  customer_email?: string,       // auth users only
  customer_creation?: "always",  // auth users only
  metadata: {
    productsIntent: "id1:qty1,id2:qty2",
    clerkUserId: string | "guest"
  },
  expires_at: number // Unix timestamp, now + 25 minutes
}
```

### Payload P-4: Webhook → Sanity Order

```typescript
{
  _type: "order",
  orderNumber: "ORD-2026-0001",
  orderId: "order_1743696000000_abc1234",
  clerkUserId?: string,
  customerEmail: string,
  isGuest: boolean,
  items: OrderItem[],           // { productId, name, slug, imageUrl, price, quantity, subtotal, returnStatus }
  shippingAddress: ShippingAddress, // { name, line1, line2?, city, state, postalCode, country, phone? }
  pricing: OrderPricing,        // { subtotal, shipping, tax, total, currency }
  payment: PaymentInfo,         // { stripeCheckoutSessionId, stripePaymentIntentId?, stripeCustomerId? }
  status: "pending_payment",
  dates: { orderedAt: ISO-8601 }
}
```

---

## Part 6: Gap Analysis (G-XX)

### Critical Gaps

| ID | Gap | Current State | Target State | Components Affected | Severity |
|---|---|---|---|---|---|
| **G-01** | No basket emptiness guard on `/checkout/payment` | User can navigate directly to `/checkout/payment` with empty basket. Stripe session will fail with 400. | Redirect to `/basket` if basket is empty on mount | [payment/page.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/payment/page.tsx) | **Critical** |
| **G-02** | No address completion guard on `/checkout/payment` | User can navigate directly to payment without completing shipping. No check that `status === "ACCEPT"` | Redirect to `/checkout/shipping` if address not confirmed | [payment/page.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/payment/page.tsx) | **Critical** |
| **G-03** | Hardcoded shipping cost `$15.99` not reflected in Stripe session | `BasketSummary` shows `$15.99` shipping, but Stripe session has no shipping line item — Stripe total will differ from displayed total | Align shipping: either add as Stripe line item or show "calculated at checkout" | [BasketSummary.tsx](file:///c:/webdev/sang-logium/app/%28store%29/basket/BasketSummary.tsx), [api/checkout/route.ts](file:///c:/webdev/sang-logium/app/api/checkout/route.ts) | **Critical** |

### Major Gaps

| ID | Gap | Current State | Target State | Components Affected | Severity |
|---|---|---|---|---|---|
| **G-04** | `CONFIRM` status defined but never set | Type union includes `"CONFIRM"` but no code path sets it | Remove from type or implement CONFIRM flow for partial address matches | [checkout.types.ts](file:///c:/webdev/sang-logium/app/%28store%29/checkout/checkout.types.ts), [CheckoutProvider.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/CheckoutProvider.tsx) | **Major** |
| **G-05** | Dual competing guest cookie systems | `lib/utils/cookies.ts` uses JWT (`checkout_context`). `actions/checkout/guestCookies.ts` uses plain JSON (`guest_checkout`). Only JWT system used in layout. | Consolidate to one guest state mechanism. Verify/rotate `CHECKOUT_JWT_SECRET` | [cookies.ts](file:///c:/webdev/sang-logium/lib/utils/cookies.ts), [guestCookies.ts](file:///c:/webdev/sang-logium/app/actions/checkout/guestCookies.ts) | **Major** |
| **G-06** | `api/order/route.ts` entirely commented out | The GET route body is fully commented. No functional code. | Remove dead route or re-implement if needed | [api/order/route.ts](file:///c:/webdev/sang-logium/app/api/order/route.ts) | **Major** |
| **G-07** | Stock snapshot stale in localStorage | `BasketItem.stock` captured at add-time and persisted. If stock changes externally, client shows stale availability | Re-verify stock on basket page load or checkout entry | [store.ts](file:///c:/webdev/sang-logium/store/store.ts), [Basket.tsx](file:///c:/webdev/sang-logium/app/%28store%29/basket/Basket.tsx) | **Major** |
| **G-09** | No shipping method selection in flow | `shippingMethod` field in `OrderTypes` is never populated. No UI for picking method. | Add mock shipping method selection (EasyShip/Shippo style) before payment | checkout/shipping/, [orderTypes.ts](file:///c:/webdev/sang-logium/sanity/lib/orders/orderTypes.ts) | **Major** |
| **G-10** | Guest "View My Orders" links to auth-only page | Guest users see "View My Orders" → `/account/orders` but have no Clerk account | Conditionally show/hide based on auth, or implement guest order lookup by email | [ActionButtons.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/return/components/ActionButtons.tsx) | **Major** |
| **G-11** | No email collected for guests before payment | Guest email collected only by Stripe at payment. `guestCookies.ts` has `saveGuestEmail()` but never called | Collect email at shipping step for guests | [FormView.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/shipping/FormView.tsx), [guestCookies.ts](file:///c:/webdev/sang-logium/app/actions/checkout/guestCookies.ts) | **Major** |

### Minor Gaps

| ID | Gap | Current State | Target State | Components Affected | Severity |
|---|---|---|---|---|---|
| **G-08** | Rate limit is in-memory, not persistent | `rateLimitMap` resets on server restart. Doesn't work across serverless instances. | Acceptable for portfolio. Document as known limitation. | [api/checkout/route.ts](file:///c:/webdev/sang-logium/app/api/checkout/route.ts) | **Minor** |
| **G-12** | No client-side cleanup on checkout abandonment | If user closes browser during Stripe checkout, reservations remain until session expires (25 min) | Acceptable per Stripe's model. Session expiry webhook handles cleanup. | [EmbeddedCheckoutForm.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/payment/EmbeddedCheckoutForm.tsx) | **Minor** |
| **G-13** | `api/shipping/route.ts` duplicates `address.ts` server action | Two Google Address Validation implementations. Only server action is used. | Remove dead API route | [api/shipping/route.ts](file:///c:/webdev/sang-logium/app/api/shipping/route.ts) | **Minor** |

---

## Part 7: Verification Checklist

| # | Criterion | Method | Pass/Fail |
|---|---|---|---|
| V-01 | Adding item persists to localStorage | `localStorage.getItem("basket-storage")` → JSON with item | ◻ |
| V-02 | Basket shows skeleton before hydration | Throttle network → observe skeleton before content | ◻ |
| V-03 | Empty basket shows `EmptyBasketContent` | Clear localStorage → navigate to `/basket` | ◻ |
| V-04 | Quantity cannot exceed stock | `updateQuantity(_id, stock + 1)` → quantity === stock | ◻ |
| V-05 | Quantity cannot go below 1 | `updateQuantity(_id, 0)` → quantity === 1 | ◻ |
| V-06 | Checkout button disabled when basket empty | `selectIsCheckoutEnabled` returns false for empty basket | ◻ |
| V-07 | `/checkout` redirects to `/checkout/shipping` | Navigate → URL ends in `/checkout/shipping` | ◻ |
| V-08 | Auth user: address pre-filled from Sanity | Login with saved address → form pre-populated | ◻ |
| V-09 | Valid address → ACCEPT | Submit `PL, 50-100, Rynek, 1, Wroclaw` → `status === "ACCEPT"` | ◻ |
| V-10 | Invalid address → FIX | Submit invalid data → red error banner | ◻ |
| V-11 | ConfirmationView renders after ACCEPT | Green check + "Proceed to Payment" visible | ◻ |
| V-12 | Edit returns to FormView | Click Edit → form with previous values | ◻ |
| V-13 | Payment page creates Stripe session | POST `/api/checkout` → 200 + `client_secret` | ◻ |
| V-14 | Stock reserved in Sanity | `reservedStock` incremented after session creation | ◻ |
| V-15 | Stripe Embedded Checkout renders | `<EmbeddedCheckout>` visible with valid session | ◻ |
| V-16 | Payment → redirect to return page | Complete test payment → `/checkout/return?session_id=cs_xxx` | ◻ |
| V-17 | Return page polls for order | Order not immediate → polling at 2s intervals observed | ◻ |
| V-18 | Return page clears basket | After order → `basket-storage` empty | ◻ |
| V-19 | Webhook creates order in Sanity | New `order` document in Sanity after payment | ◻ |
| V-20 | Webhook finalizes stock | `stock` decremented, `reservedStock` decremented | ◻ |
| V-21 | Expired session releases reservations | Session expiry → `reservedStock` rolls back | ◻ |
| V-22 | Rate limit blocks excess requests | 6th request in 1 min → 429 | ◻ |

---

## Part 8: Expected End-State After Sprint

### Target Architecture Scores

| Bus Stop | Current (1-10) | Target | Key Change |
|---|---|---|---|
| B-1 (Add to Cart) | 8 | 9 | Stock validation against server on add |
| B-2 (Basket Page) | 7 | 9 | Stock re-verification, shipping method placeholder |
| C-0 (Checkout Redirect) | 10 | 10 | No change needed |
| C-1 (Shipping) | 7 | 9 | Email for guests, consolidate cookie systems |
| C-2 (Payment) | 5 | 9 | Entry guards (basket + address), shipping cost alignment |
| C-3 (Return) | 7 | 9 | Guest-aware actions, error recovery |
| W-1 (Webhook) | 8 | 9 | Scoped for later sprint per constraints |

### Success Criteria

1. **Zero unguarded transitions** — Every bus stop has explicit entry-state validation
2. **Price consistency** — Client-displayed total === Stripe-charged total
3. **Guest/Auth parity** — Both pathways reach payment with equal data integrity
4. **Stock integrity** — `reservedStock` always decremented on session end (success, expiry, or failure)
5. **Basket lifecycle** — Basket cleared if and only if payment confirmed + order created
