# Checkout & Payments Flow — Professional Technical Architecture Audit

**Date:** 2026-04-02
**Auditor:** Architecture Review (Cascade)
**Scope:** Basket → Checkout → Payment → Order Creation
**Out of Scope:** Post-creation order management, packer/manager flows

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Flow Map](#2-current-flow-map)
3. [Metrics Ratings with Evidence](#3-metrics-ratings-with-evidence)
4. [Critical Gaps Analysis](#4-critical-gaps-analysis)
5. [Bus-Stop Specifications](#5-bus-stop-specifications)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Testing Specifications](#7-testing-specifications)
8. [Verification Checklist](#8-verification-checklist)

---

## 1. Executive Summary

### Verdict: 3.2 / 10 — NOT production-ready

The checkout → payment flow is **architecturally scaffolded but critically non-functional**. The Stripe session creation is commented out. The webhook handler is entirely commented out. Stock is decremented immediately with no rollback. No order is ever created on payment success. The return page fetches from an API route that returns nothing.

**What works:**
- Basket state management (Zustand + localStorage persistence) — solid
- Address validation via Google Address Validation API — functional
- Checkout UI flow structure (shipping → payment → return) — present
- Order schema in Sanity — comprehensive and well-designed
- Order creation utility (`addOrder.ts`) — robust with validation

**What is broken or missing:**
- Stripe checkout session creation — **commented out**
- Webhook handler — **entirely commented out**
- Order creation on payment success — **does not happen**
- Stock reservation system — **not implemented** (immediate decrement only)
- Return page data flow — **broken** (API route returns nothing)
- Two-phase commit — **not implemented**
- Stock rollback on failure — **not implemented**

### Risk Assessment for High-Value Audio E-commerce

| Risk | Severity | Current Status |
|------|----------|----------------|
| Customer charged, no order created | **CRITICAL** | Webhook commented out |
| Stock oversold via race condition | **CRITICAL** | No reservation system |
| Phantom stock decrement on Stripe failure | **HIGH** | No rollback mechanism |
| Return page shows "Order not found" | **HIGH** | API route returns nothing |
| Double payment on retry | **MEDIUM** | No idempotency key |
| No webhook signature verification | **CRITICAL** | Handler disabled |

---

## 2. Current Flow Map

### Actual User Journey (Current State)

```
BASKET (/basket)
  │
  ├─ BasketSummary.tsx renders total + shipping ($15.99 hardcoded)
  ├─ selectIsCheckoutEnabled checks stock > 0 && quantity > 0
  ├─ Link to /checkout (enabled/disabled)
  │
  ▼
CHECKOUT ENTRY (/checkout)
  │
  ├─ page.tsx → redirect("/checkout/shipping")
  │
  ▼
CHECKOUT LAYOUT (layout.tsx) — Server Component
  │
  ├─ Fetches user via Clerk (currentUser)
  ├─ IF authenticated: fetches address from Sanity user.addresses
  ├─ IF guest: reads JWT cookie (checkout_context)
  ├─ Wraps children in CheckoutProvider with initialAddress + initialStatus
  │
  ▼
SHIPPING (/checkout/shipping) — Client Component
  │
  ├─ Shows FormView (EDITING/FIX) or ConfirmationView (ACCEPT)
  ├─ Form: react-hook-form with regionCode, postalCode, street, streetNumber, city
  ├─ Submit → submitShippingAction (server action)
  │   ├─ Calls Google Address Validation API
  │   ├─ Returns ACCEPT + cleaned address OR FIX + error
  │   └─ Sets CheckoutProvider status accordingly
  ├─ On ACCEPT: shows confirmation + "Proceed to Payment" link
  │
  ▼
PAYMENT (/checkout/payment) — Client Component
  │
  ├─ Reads basket from Zustand store
  ├─ Maps to publicBasket: [{_id, quantity}]
  ├─ Renders EmbeddedCheckoutForm
  │   ├─ Loads Stripe.js via loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  │   ├─ fetchClientSecret calls POST /api/checkout
  │   │
  │   │  POST /api/checkout (route.ts):
  │   │   ├─ Validates publicBasket array
  │   │   ├─ Fetches products from Sanity (_id, name, price, stock, stripePriceId, _rev)
  │   │   ├─ Checks stock >= quantity per item
  │   │   ├─ ⚠️ IMMEDIATELY decrements stock via sanityTransaction.patch().dec().ifRevisionId()
  │   │   ├─ ❌ Stripe session creation is COMMENTED OUT
  │   │   ├─ ❌ No client_secret is returned
  │   │   └─ ❌ Function completes without returning anything on success path
  │   │
  │   ├─ ❌ EmbeddedCheckout never receives client_secret → FAILS
  │   └─ Error displayed: "Checkout service temporarily unavailable"
  │
  ▼ (BROKEN — never reaches below in current state)

STRIPE CHECKOUT (Embedded)
  │
  ├─ ❌ Never loads (no client_secret)
  │
  ▼
WEBHOOK (/api/webhook)
  │
  ├─ ❌ ENTIRELY COMMENTED OUT — no export, no handler
  ├─ Would have: signature verification, session retrieval, order creation
  │
  ▼
RETURN PAGE (/checkout/return)
  │
  ├─ Server Component reads searchParams.session_id
  ├─ Calls getOrderBySession(sessionId) — server action
  │   ├─ Fetches GET /api/order?session_id=...
  │   ├─ ❌ API route has all logic commented out, returns nothing
  │   └─ Returns null → "Order not found" displayed
  ├─ OrderSuccessClient clears basket on mount (works)
  ├─ Shows SuccessMessage, WhatHappensNext, OrderSummary, ActionButtons
  │   └─ ❌ OrderSummary receives null order → likely crashes
  │
  ▼
END — No order exists in Sanity. Stock was decremented. Customer sees error.
```

### Intended Flow (What TODOs Describe)

```
BASKET → CHECKOUT → SHIPPING (address validation) → PAYMENT
  │
  ├─ POST /api/checkout:
  │   ├─ Validate basket
  │   ├─ Fetch products + stock
  │   ├─ Reserve stock (increment reservedStock atomically via _rev)
  │   ├─ Create Stripe checkout session with metadata
  │   ├─ Set session expiry (25 min)
  │   └─ Return client_secret
  │
  ├─ Stripe Embedded Checkout renders
  ├─ Customer pays
  │
  ├─ WEBHOOK receives checkout.session.completed:
  │   ├─ Verify signature
  │   ├─ Check idempotency (existing order?)
  │   ├─ Verify amount matches line items
  │   ├─ Create order in Sanity via createOrder()
  │   ├─ Decrement stock + reservedStock
  │   └─ Return 200
  │
  ├─ WEBHOOK receives checkout.session.expired:
  │   ├─ Wait grace period (15-30 min)
  │   └─ Release reservedStock
  │
  ├─ WEBHOOK receives async_payment_failed:
  │   └─ Immediately release reservedStock
  │
  └─ RETURN PAGE fetches order by session_id from Sanity → shows confirmation
```

---

## 3. Metrics Ratings with Evidence

### Data Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Data structure integrity | **5/10** | Order schema (`orderType.ts`) is comprehensive with snapshots, pricing breakdown, FSM status. But checkout types (`checkout.types.ts`) are minimal — `ServerProduct` lacks `reservedStock`. `BasketCheckoutItem` sends only `{_id, quantity}` which is correct (server-authoritative pricing). Gap: No `reservedStock` field exists in product schema. Address type mismatch between checkout (`Address`) and order schema (`ShippingAddress` — different field names). |
| Database query efficiency | **4/10** | Basket products fetched with `_id in $productIds` — correct batch query. But `backendClient` uses `useCdn: true` (`backendClient.ts:9`) which returns stale data — **critical for stock checks**. Stock reads may be cached and inaccurate. Order number generation (`addOrder.ts:11-16`) does a `count()` query per order — race condition for sequential numbering. |
| Data validation robustness | **4/10** | Basic basket validation exists (`route.ts:31-39`). Stock check per item exists but ignores reserved stock. `addOrder.ts:32-81` has thorough validation (email, items, address, pricing). But no input sanitization on product IDs before GROQ query. No quantity bounds checking (negative, float, absurdly large). |
| State management architecture | **6/10** | Zustand store with `persist` middleware — solid pattern. Proper hydration tracking (`_hasHydrated`). Stock-clamped quantities. Migration support for schema changes. CheckoutProvider uses React Context correctly for checkout-scoped state. But: two separate state systems (Zustand basket + Context checkout) with manual bridge via `useInitializeCheckoutCart` — references non-existent `store/checkout.ts`. |
| Data persistence strategy | **3/10** | Basket persisted in localStorage (good for cart abandonment). Guest checkout context stored in JWT cookie (good). But: no server-side basket validation on checkout entry. Stale stock data in persisted basket not refreshed. No session-based checkout state — refreshing payment page restarts entire flow. |

**Data Layer Average: 4.4/10**

---

### Architecture Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Component separation of concerns | **6/10** | Good separation: layout (server) handles data fetching, provider handles state, pages handle rendering. Address validation is a server action. Order creation is a separate utility. But: `EmbeddedCheckoutForm.tsx` calls `/api/checkout` directly (fetch) instead of via server action. DevHUD is defined inside CheckoutProvider (should be separate component). |
| Dependency injection patterns | **3/10** | `backendClient` is a module-level singleton — not injectable for testing. Stripe client similarly. No abstraction layer between business logic and external services. Google API key read directly in server action. |
| Modularity and reusability | **5/10** | Order types and creation logic well-modularized (`sanity/lib/orders/`). Address validation reusable. But: checkout types are in a page-specific directory, not shared. DisplayAddress has hardcoded country map (only PL, GB). Shipping cost hardcoded in `BasketSummary.tsx:13` ($15.99). |
| Architectural layering | **4/10** | Intended layers exist but incomplete: API routes (transport) → business logic → data access. But checkout route mixes validation, stock management, and payment creation in one function. No service layer between route handler and Sanity/Stripe. |
| Code organization structure | **5/10** | File structure follows Next.js App Router conventions. Checkout pages properly nested. Actions in `/actions/` directory. But: archived webhook files mixed with active code. Empty `checkout.ts` placeholder. `useInitializeCheckoutCart.ts` imports from non-existent `store/checkout.ts`. Legacy `CheckoutForm.tsx` (referenced in file list) may still exist. |

**Architecture Layer Average: 4.6/10**

---

### Performance Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Render optimization | **5/10** | Checkout layout is Server Component (good — auth + address fetched server-side). Payment page properly client-only. Zustand selectors prevent unnecessary re-renders. But: Loading state is a plain `<div>Loading...</div>` with no skeleton/spinner. DevHUD re-renders on every state change. |
| Bundle size efficiency | **6/10** | Stripe.js loaded only on payment page (lazy via `loadStripe`). Icons from `@phosphor-icons/react` (tree-shakeable). `react-hook-form` only on shipping page. But: `loadStripe` call in `EmbeddedCheckoutForm.tsx:11` is at module level — loads Stripe SDK even if component errors before rendering. Also duplicated — `stripe-client.ts` exports `stripePromise` but `EmbeddedCheckoutForm` creates its own. |
| Data fetching patterns | **4/10** | Server-side address fetch in layout (good). But `getOrderBySession` makes a fetch call from server action to own API route (`fetch(\`${baseUrl}/api/order\`)`), which is a Next.js anti-pattern — should call Sanity directly. `backendClient` uses CDN for stock checks (stale data risk). |
| Caching strategy | **2/10** | `backendClient` uses `useCdn: true` globally — problematic for stock checks that need real-time data. `getOrderBySession` uses `cache: "no-store"` (correct for order data). No cache invalidation strategy for product stock. No Stripe session caching. |
| Memory usage optimization | **6/10** | Zustand store is lean. Basket items validated on rehydration. Migration cleans up old data shapes. No memory leaks apparent in checkout flow. |

**Performance Layer Average: 4.6/10**

---

### Security Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Input sanitization | **3/10** | Basic array check on publicBasket (`route.ts:31-34`). No validation of `_id` format (could inject malicious strings into GROQ). No quantity bounds (could send negative or float). No rate limiting on checkout endpoint. Address validation relies on Google API for sanitization. |
| Authentication integration | **4/10** | Clerk middleware runs on checkout routes (`middleware.ts:18`). But `currentUser()` is commented out in checkout route (`route.ts:14`). Layout correctly uses `currentUser()` for address fetching. Guest checkout supported via JWT cookie. But: no auth check before stock decrement — anonymous user can trigger stock changes. |
| Data exposure boundaries | **5/10** | `publicBasket` correctly sends only `{_id, quantity}` — no client-side price trust. Server fetches authoritative prices. But: error messages expose product IDs and stock counts (`route.ts:85,103`). Stock count in error message tells attackers exact inventory levels. |
| Error information disclosure | **4/10** | Generic "Failed to create checkout session" on 500 (good). But console.error logs full error objects including potentially sensitive Sanity/Stripe details. Google API key passed as URL parameter (`address.ts:103`) — could appear in logs. Address validation errors are specific enough for debugging but not excessive. |
| Security headers implementation | **3/10** | No CSP headers configured for checkout pages. No Stripe-specific security headers. Middleware sets custom `x-show-modal` header but no security headers. No CSRF protection on checkout API route (relies on SameSite cookies only). |

**Security Layer Average: 3.8/10**

---

### Robustness Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Error handling completeness | **3/10** | Checkout route: try/catch returns 500 but doesn't rollback stock decrement (`route.ts:144-152`). Address validation: comprehensive error handling with specific messages per HTTP status. EmbeddedCheckoutForm: catches fetch errors but no retry logic. Return page: null check on order but OrderSummary may crash on missing data. |
| Edge case coverage | **2/10** | No handling for: concurrent purchases of same item, basket item deleted between add and checkout, Stripe session timeout, browser back during payment, network disconnect during stock decrement, partial transaction failure. Country dropdown has only 2 options (PL, GB) — international shipping claim unsupported. |
| Resilience to failures | **2/10** | Single point of failure at stock decrement — if Stripe fails after, stock is phantom decremented. No retry mechanism for Sanity writes. No circuit breaker for Google Address API. No fallback for Stripe unavailability. Webhook (if enabled) has no dead letter queue for failed processing. |
| Data consistency guarantees | **1/10** | **CRITICAL**: Stock is decremented in Sanity BEFORE Stripe session is created (`route.ts:118-123`). If Stripe creation fails, stock is lost. No rollback. No compensating transaction. `ifRevisionId` provides optimistic concurrency but only prevents double-decrement, not phantom decrement. Two-phase commit described in TODOs but not implemented. |
| Recovery mechanisms | **1/10** | Zero recovery mechanisms exist. No stock rollback on any failure path. No webhook retry handling. No expired session cleanup. No admin tool for manual stock correction. No monitoring/alerting for failed checkouts. |

**Robustness Layer Average: 1.8/10**

---

### Integration Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| API design coherence | **3/10** | POST `/api/checkout` — correct verb and path. But returns nothing on success (Stripe code commented out). GET `/api/order` — correct verb but entirely non-functional. POST `/api/webhook` — entirely commented out. No API versioning. No consistent error response format. |
| Frontend-backend contract | **3/10** | `BasketCheckoutItem` type shared between frontend and API. But: checkout route doesn't return `client_secret` (commented out). Return page expects order data that API never provides. Address type names differ between checkout (`Address.street`) and order schema (`ShippingAddress.line1`). `getOrderBySession` calls own API route instead of direct Sanity query. |
| Third-party integration safety | **3/10** | Stripe SDK properly initialized with `server-only` guard (`stripe.js:1`). API key validated at startup. But: webhook signature verification commented out. No Stripe API version pinning in webhook handler. Google API key in URL (should use header). No retry logic for Stripe/Google API calls. `backendClient` uses CDN for mutation-dependent reads. |
| Cross-component communication | **4/10** | CheckoutProvider → children via Context (correct). Basket → Checkout via Zustand (correct). But: `useInitializeCheckoutCart` references non-existent `store/checkout.ts`. No event system for checkout state changes. Basket cleared on return page mount — if return page errors, basket data lost permanently. |
| System-wide consistency | **2/10** | Address format inconsistent across system: checkout uses `{street, streetNumber, city, postalCode, regionCode}`, order schema uses `{line1, line2, city, state, postalCode, country}`, cookie uses `{line1, line2, city, postal_code, country}`. Three different address shapes. Pricing: basket uses `displayPrice`, checkout doesn't use it (server-authoritative), order uses `price` — correct but naming inconsistent. |

**Integration Layer Average: 3.0/10**

---

### Overall Assessment

| Metric | Rating | Evidence |
|--------|--------|----------|
| Professional e-commerce standards | **2/10** | No functional payment flow. No stock reservation. No webhook processing. No order creation. Would fail any professional e-commerce audit. Industry standard requires: idempotent payments, stock reservation, webhook reliability, PCI compliance delegation. |
| System scalability requirements | **3/10** | Sanity CDN for reads (scalable but wrong for stock). Zustand (lightweight). Stripe Embedded Checkout (delegates PCI scope). But: order number generation via count() query doesn't scale. No queue system for webhook processing. No background job system for reservation timeouts. |
| Maintainability and technical debt | **4/10** | Good TypeScript usage. Clear file structure. Comprehensive order types. But: massive amount of TODO comments (30+). Commented-out code everywhere. DevHUD in production-shipped component. Empty placeholder files. Archived files in active directories. |
| Overall architectural coherence | **4/10** | The architecture is **correctly designed in comments** — stock reservation, two-phase commit, webhook handling, rollback mechanisms are all described accurately. The order schema is production-quality. The address validation works. But execution is ~15% complete. |

**Overall Average: 3.2/10**

---

## 4. Critical Gaps Analysis

### CRITICAL (Payment Security & Data Consistency)

#### GAP-C1: Stripe Session Creation Disabled
- **Location:** `app/api/checkout/route.ts:125-143`
- **Current:** All Stripe code commented out. Function completes without returning anything on success path.
- **Impact:** No payment can be processed. EmbeddedCheckout receives no client_secret.
- **Risk:** Store appears broken to any user reaching payment step.

#### GAP-C2: Webhook Handler Disabled
- **Location:** `app/api/webhook/route.ts:1-140`
- **Current:** Entire file is commented out. No export. No handler.
- **Impact:** Even if payments were processed, no order would be created. Stripe would retry webhook delivery 3 times then give up.
- **Risk:** Customer charged with no order record. Unrecoverable without manual intervention.

#### GAP-C3: Phantom Stock Decrement
- **Location:** `app/api/checkout/route.ts:118-123`
- **Current:** Stock decremented via `sanityTransaction.patch().dec()` BEFORE Stripe session creation.
- **Impact:** If Stripe fails (network, API error, rate limit), stock is permanently reduced with no product purchased.
- **Risk:** Inventory slowly drains to zero through failed checkouts. Products become "unavailable" despite never being sold.

#### GAP-C4: CDN-Cached Stock Reads
- **Location:** `sanity/lib/backendClient.ts:9` (`useCdn: true`)
- **Current:** All Sanity queries including stock checks use CDN-cached data.
- **Impact:** Stock check may read stale data. Two users see "1 in stock", both proceed, one gets oversold.
- **Risk:** Overselling on low-stock high-value items (the entire inventory model).

### HIGH (Stock Reservation & Order Flow)

#### GAP-H1: No Stock Reservation System
- **Location:** `app/api/checkout/route.ts:44-52, 67-74`
- **Current:** Detailed TODO comments describe the system but nothing is implemented.
- **Impact:** No way to temporarily hold inventory during checkout without permanent decrement.
- **Risk:** Race conditions between concurrent buyers. Either oversell or phantom decrement.

#### GAP-H2: Order API Route Non-Functional
- **Location:** `app/api/order/route.ts:11-43`
- **Current:** All logic commented out. Function has no return statement on success path.
- **Impact:** Return page always shows "Order not found".
- **Risk:** Customer pays, sees error page, panics, contacts support or initiates chargeback.

#### GAP-H3: No Failure Recovery
- **Location:** `app/api/checkout/route.ts:146-152, 155-181`
- **Current:** Catch block returns 500 but doesn't rollback Sanity stock decrement. Expired/failed session handlers are comments only.
- **Impact:** Every checkout failure permanently loses inventory.
- **Risk:** Cumulative inventory loss. Requires manual database corrections.

### MEDIUM (Error Handling & UX)

#### GAP-M1: Stock Exposure in Error Messages
- **Location:** `app/api/checkout/route.ts:101-106`
- **Current:** Error includes `Available: ${serverProduct.stock}` — reveals exact inventory.
- **Impact:** Competitor or bad actor can probe inventory levels.
- **Risk:** Business intelligence leak. Minor but unprofessional.

#### GAP-M2: Hardcoded Shipping Cost
- **Location:** `app/(store)/basket/BasketSummary.tsx:13`
- **Current:** `const shipping = 15.99;` — not connected to any shipping calculation.
- **Impact:** Displayed shipping doesn't match what Stripe would charge.
- **Risk:** Customer expects one price, charged another. Chargeback/trust issue.

#### GAP-M3: Limited Country Support
- **Location:** `app/(store)/checkout/shipping/FormView.tsx:88-90`, `DisplayAddress.tsx:4-7`
- **Current:** Only PL and GB in dropdown. CountryMap only has PL and GB.
- **Impact:** "International shipping" claim is false — only 2 countries.
- **Risk:** UX limitation. Easy to fix.

#### GAP-M4: useInitializeCheckoutCart References Non-Existent Module
- **Location:** `app/hooks/useInitializeCheckoutCart.ts:2,4`
- **Current:** Imports from `@/store/checkout` which doesn't exist.
- **Impact:** Any component importing this hook will crash at build/runtime.
- **Risk:** Dead code or build break.

### LOW (Code Organization & Debt)

#### GAP-L1: 30+ TODO Comments in Checkout Route
- **Location:** `app/api/checkout/route.ts` (throughout)
- **Impact:** Technical debt indicator. Clear intent but no execution.

#### GAP-L2: DevHUD in Production Bundle
- **Location:** `app/(store)/checkout/CheckoutProvider.tsx:30-79`
- **Current:** DevHUD component defined inside CheckoutProvider. Gated by `NODE_ENV` but still in bundle.
- **Impact:** Slightly larger client bundle. No security risk (NODE_ENV check).

#### GAP-L3: Archived Files in Active Directories
- **Location:** `app/api/webhooks/stripe/ARCHIVED.ts`, `archived helpers.ts`
- **Impact:** Confusion for developers. Dead code.

#### GAP-L4: Duplicate Stripe Client Initialization
- **Location:** `lib/stripe/stripe-client.ts` exports `stripePromise`, but `EmbeddedCheckoutForm.tsx:11-13` creates its own.
- **Impact:** Two Stripe.js instances potentially loaded.

---

## 5. Bus-Stop Specifications

### End-to-End Flow: Bus-Stop Trace

Each "bus stop" is a discrete checkpoint where the system must be in a verifiable state.

---

### BUS STOP 1: Basket → Checkout Entry

**Trigger:** User clicks "Checkout" button in `BasketSummary.tsx`
**Route:** `/basket` → `/checkout` → redirect to `/checkout/shipping`

#### Pre-conditions
- Basket has ≥1 item with quantity > 0 and stock > 0
- `selectIsCheckoutEnabled` returns true

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Basket data in Zustand | Valid items with _id, quantity, stock, displayPrice | ✅ Working |
| Hydration complete | `_hasHydrated === true` | ✅ Working |
| Checkout enabled gate | Prevents empty/invalid basket from proceeding | ✅ Working |
| Server-side stock revalidation | Fresh stock check against Sanity (no CDN) | ❌ MISSING |

#### Gap at This Stop
- **No server-side stock revalidation on checkout entry.** User could have stale stock from hours ago in localStorage. Should fetch fresh stock on checkout entry and block if items now unavailable.

---

### BUS STOP 2: Checkout Layout Initialization

**Trigger:** Checkout route renders `layout.tsx`
**Route:** `/checkout/shipping` layout render

#### Pre-conditions
- Checkout route matched
- Clerk middleware has run

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Auth state resolved | `currentUser()` returns user or null | ✅ Working |
| Saved address loaded (auth user) | Fetched from Sanity user.addresses | ✅ Working |
| Guest address loaded | From JWT cookie | ✅ Working |
| CheckoutProvider initialized | initialAddress + initialStatus set | ✅ Working |
| Basket contents verified server-side | All items exist, are in stock, prices match | ❌ MISSING |

#### Gap at This Stop
- **No basket verification on layout mount.** Server doesn't know what's in the basket. Should validate basket contents exist and have sufficient stock.

---

### BUS STOP 3: Shipping Address Submission

**Trigger:** User fills shipping form and clicks "Continue to Payment"
**Route:** `/checkout/shipping` → `submitShippingAction`

#### Pre-conditions
- Form validates client-side (react-hook-form)
- All required fields filled

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Client validation passes | regionCode, postalCode, street, streetNumber, city present | ✅ Working |
| Google Address Validation called | Real API call with proper payload | ✅ Working |
| Address accepted or rejected | ACCEPT with cleaned address or FIX with error | ✅ Working |
| Address persisted | Saved to cookie (guest) or Sanity (auth) | ⚠️ PARTIAL — cookie SET not implemented in this flow |
| Status updated in provider | ACCEPT or FIX | ✅ Working |

#### Gap at This Stop
- **Guest address cookie not set after validation.** `getCheckoutCookie` reads the cookie but nothing in the current flow sets it. Guest user's address is lost on page refresh.
- Address format mismatch: checkout uses `{street, streetNumber}` but cookie expects `{line1, line2}` and order expects `{line1, line2}`. No mapping layer.

---

### BUS STOP 4: Payment Initiation

**Trigger:** User clicks "Proceed to Payment" on confirmation view
**Route:** `/checkout/payment` renders, calls POST `/api/checkout`

#### Pre-conditions
- Address confirmed (status === "ACCEPT")
- Basket still has items

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Basket mapped to publicBasket | `[{_id, quantity}]` — no client price | ✅ Working |
| POST /api/checkout called | With publicBasket in body | ✅ Working |
| Server validates basket | Array check, non-empty | ✅ Working |
| Server fetches products | Batch query with product IDs | ✅ Working |
| Server checks stock | Per-item stock >= quantity | ⚠️ Uses CDN (stale) |
| Stock reserved (not decremented) | `reservedStock` incremented atomically | ❌ BROKEN — decrements stock instead |
| Stripe session created | With line items, return URL, metadata, expiry | ❌ COMMENTED OUT |
| client_secret returned | To EmbeddedCheckoutProvider | ❌ COMMENTED OUT |
| Stripe Embedded Checkout renders | Payment form visible | ❌ BROKEN (no secret) |

#### Gaps at This Stop
1. **Stock decremented instead of reserved** — immediate inventory loss
2. **CDN-cached stock reads** — stale data
3. **Stripe session creation disabled** — no payment possible
4. **No return value on success** — function falls through
5. **No rollback if Stripe fails after stock decrement**
6. **Shipping address not included in Stripe session** — not passed to checkout metadata

---

### BUS STOP 5: Payment Processing (Stripe Hosted)

**Trigger:** Customer enters payment details in Stripe Embedded Checkout
**Route:** Handled by Stripe SDK

#### Pre-conditions
- Valid client_secret received
- Stripe.js loaded

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Stripe Embedded Checkout visible | Card form, email field | ❌ Never loads |
| Payment method collected | Via Stripe (PCI-compliant) | ❌ N/A |
| Session expires after timeout | 25 min as per commented code | ❌ N/A |
| Duplicate payment prevented | Stripe session is single-use | ❌ N/A |

#### Gap at This Stop
- **Entire bus stop non-functional.** Stripe never receives control.

---

### BUS STOP 6: Payment Success → Webhook

**Trigger:** Stripe sends `checkout.session.completed` webhook
**Route:** POST `/api/webhook`

#### Pre-conditions
- Stripe payment succeeded
- Webhook endpoint registered in Stripe dashboard
- Webhook signing secret configured

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Webhook received | POST to /api/webhook | ❌ Handler commented out |
| Signature verified | `stripe.webhooks.constructEvent` | ❌ Handler commented out |
| Idempotency check | Query for existing order by session ID | ❌ Handler commented out |
| Amount verification | Line items total matches session total | ❌ Handler commented out |
| Order created in Sanity | Via `createOrder()` with full snapshot | ❌ Handler commented out |
| Stock finalized | Decrement stock + reservedStock | ❌ Handler commented out |
| Payment timestamp set | `dates.paidAt` updated | ❌ Handler commented out |

#### Gap at This Stop
- **Entire bus stop non-functional.** This is the most critical gap. Without this, payment results in no order.

---

### BUS STOP 7: Payment Return Page

**Trigger:** Stripe redirects to `/checkout/return?session_id={ID}`
**Route:** `/checkout/return`

#### Pre-conditions
- Stripe checkout completed (success or failure)
- session_id in URL params

#### Expected State at This Stop
| Aspect | Expected | Current Status |
|--------|----------|----------------|
| Session ID extracted | From searchParams | ✅ Working |
| Order fetched | By Stripe session ID from Sanity | ❌ BROKEN — API returns nothing |
| Success UI shown | If order found | ❌ Always shows "Order not found" |
| Basket cleared | Client-side via useEffect | ✅ Working (OrderSuccessClient) |
| Order summary displayed | Items, total, status | ❌ Crashes (null order) |

#### Gap at This Stop
1. **Order never exists** (webhook doesn't create it)
2. **API route returns nothing** (all code commented out)
3. **Server action fetches from own API** instead of querying Sanity directly
4. **No polling/retry** if order hasn't been created yet (webhook may arrive after redirect)

---

### BUS STOP 8: Failure & Recovery Paths

**Trigger:** Any failure in the flow
**Route:** Various

#### Expected Failure Scenarios

| Scenario | Expected Behavior | Current Status |
|----------|-------------------|----------------|
| Item out of stock at checkout | Block with message, suggest alternatives | ⚠️ Returns 409 but with stock count exposed |
| Stripe session creation fails | Rollback stock, show error, allow retry | ❌ Stock lost, generic error |
| Payment declined | Release reservation, show card error | ❌ N/A (Stripe handles, but no reservation to release) |
| Session expired (25 min timeout) | Release reservation, show timeout message | ❌ No handler |
| Webhook delivery fails | Stripe retries 3x, then dead letter | ❌ No handler to receive retries |
| Order creation fails after payment | Retry order creation, alert admin | ❌ No handler |
| Network disconnect during payment | Stripe session persists, webhook still fires | ⚠️ Would work IF webhook was enabled |
| User closes tab during payment | Same as above | ⚠️ Would work IF webhook was enabled |
| Double-click "Pay" | Stripe session is single-use | ✅ Stripe handles this |

---

## 6. Implementation Roadmap

### Phase 1: CRITICAL — Enable Payment Flow (Priority: IMMEDIATE)

#### Step 1.1: Create non-CDN Sanity client for checkout
- **File:** `sanity/lib/backendClient.ts` — create `backendMutationClient` with `useCdn: false`
- **Why:** Stock checks must read fresh data
- **Dependency:** None

#### Step 1.2: Implement stock reservation system
- **Files:**
  - Sanity product schema: Add `reservedStock` field (number, default 0)
  - `app/api/checkout/route.ts`: Replace `dec({stock})` with `inc({reservedStock})` using `ifRevisionId`
  - Add `availableStock = stock - reservedStock` calculation
- **Why:** Prevents phantom decrement and enables rollback
- **Dependency:** 1.1

#### Step 1.3: Enable Stripe session creation
- **File:** `app/api/checkout/route.ts`
- **Action:** Uncomment and update Stripe session creation. Include:
  - `line_items` from validated products
  - `return_url` with session_id placeholder
  - `metadata` with product:quantity pairs and clerkUserId
  - `expires_at` (25 minutes)
  - `customer_email` if authenticated
- **Why:** Core payment functionality
- **Dependency:** 1.2

#### Step 1.4: Add rollback on Stripe failure
- **File:** `app/api/checkout/route.ts`
- **Action:** In catch block after reservation, decrement `reservedStock` for each item
- **Why:** Prevents phantom reservation on Stripe API failure
- **Dependency:** 1.2, 1.3

#### Step 1.5: Enable webhook handler
- **File:** `app/api/webhook/route.ts`
- **Action:** Uncomment and rewrite using `createOrder()` from `sanity/lib/orders/addOrder.ts`
- **Must include:**
  - Signature verification (`stripe.webhooks.constructEvent`)
  - Idempotency check (query existing order by `payment.stripeCheckoutSessionId`)
  - Amount verification
  - Order creation via `createOrder()` with proper address/item mapping
  - Stock finalization: decrement both `stock` and `reservedStock`
  - Handle `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
- **Why:** Without this, payment results in no order
- **Dependency:** 1.2

#### Step 1.6: Fix return page data flow
- **File:** `app/actions/checkout/getOrderBySession.ts`
- **Action:** Replace fetch-to-own-API with direct Sanity query:
  ```groq
  *[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]
  ```
- **Why:** Current flow is broken and architecturally wrong
- **Dependency:** 1.5

### Phase 2: HIGH — Robustness & Security

#### Step 2.1: Add reservation timeout cleanup
- **Approach:** Inngest background job or cron
- **Logic:** Find products where `reservedStock > 0` and no active Stripe session, decrement `reservedStock`
- **Fallback:** Stripe expired session webhook handler
- **Dependency:** Phase 1

#### Step 2.2: Input validation hardening
- **File:** `app/api/checkout/route.ts`
- **Actions:**
  - Validate `_id` format (Sanity document ID pattern)
  - Validate `quantity` is positive integer ≤ reasonable max (e.g., 10)
  - Sanitize before GROQ query
  - Remove stock count from error messages

#### Step 2.3: Address format unification
- **Create:** `lib/checkout/addressMapper.ts`
- **Maps between:** Checkout `Address` ↔ Order `ShippingAddress` ↔ Cookie `GuestContext.address`
- **Single source of truth for address transformation**

#### Step 2.4: Guest checkout cookie setting
- **File:** Create `app/actions/address/setCheckoutCookie.ts`
- **Action:** After address validation success, sign JWT with address and set cookie
- **Why:** Guest address lost on page refresh

#### Step 2.5: Authentication on checkout route
- **File:** `app/api/checkout/route.ts`
- **Action:** Uncomment `currentUser()`, use for metadata but don't require (guest checkout)

### Phase 3: MEDIUM — UX & Conversion

#### Step 3.1: Stock revalidation on checkout entry
- **File:** Checkout layout or shipping page
- **Action:** On mount, fetch current stock for basket items, block if any unavailable

#### Step 3.2: Shipping cost calculation
- **Replace:** Hardcoded $15.99 with dynamic calculation based on address/weight
- **Or:** At minimum, pass consistent shipping cost to Stripe

#### Step 3.3: Return page polling
- **File:** Return page
- **Action:** If order not found on initial load, poll every 2s for up to 30s (webhook may be delayed)

#### Step 3.4: Expand country support
- **Files:** `FormView.tsx`, `DisplayAddress.tsx`
- **Action:** Dynamic country list, proper country name mapping

### Phase 4: LOW — Cleanup & Optimization

#### Step 4.1: Remove dead code
- Delete `app/api/webhooks/stripe/ARCHIVED.ts` and `archived helpers.ts`
- Delete or implement `app/actions/checkout/checkout.ts`
- Fix or remove `app/hooks/useInitializeCheckoutCart.ts`
- Consolidate Stripe client initialization

#### Step 4.2: Extract DevHUD
- Move to separate file, lazy-load behind `process.env.NODE_ENV` check

#### Step 4.3: Order number generation
- Replace `count()` query with UUID-based or atomic counter to prevent race conditions

---

## 7. Testing Specifications

### Test Architecture: 3-Tier Model

```
Tier 1: Unit Tests (vitest) — Pure logic, no external calls
Tier 2: Integration Tests (vitest) — Server actions with mocked externals
Tier 3: E2E Tests (playwright) — Full user journeys in Stripe test mode
```

---

### Tier 1: Unit Tests

#### T1.1: Basket → Checkout Data Mapping
```
File: tests/basket/checkout-handoff.unit.test.ts
Framework: vitest

TEST: publicBasket contains only {_id, quantity} — no price, no name
  Input: BasketItem with all fields
  Assert: mapped item has exactly 2 keys
  Why: Server-authoritative pricing — client must not send price

TEST: publicBasket preserves quantity correctly
  Input: BasketItem with quantity 3
  Assert: publicBasket item quantity === 3

TEST: Empty basket produces empty publicBasket
  Input: empty basket array
  Assert: publicBasket.length === 0

TEST: Basket with 0-quantity items excluded
  Input: BasketItem with quantity 0
  Assert: selectIsCheckoutEnabled returns false
```

#### T1.2: Address Validation Logic
```
File: tests/address/address-validation.unit.test.ts
Framework: vitest

TEST: isAcceptedAddress returns true for PREMISE granularity + complete address
TEST: isAcceptedAddress returns false for ROUTE granularity
TEST: isAcceptedAddress returns false when hasReplacedComponents is true
TEST: isAcceptedAddress returns false when addressComplete is false
TEST: formatCleanAddress falls back to input when Google component missing
TEST: UK regionCode normalized to GB
```

#### T1.3: Order Validation Logic
```
File: tests/orders/order-validation.unit.test.ts
Framework: vitest

TEST: validateOrderData rejects missing email
TEST: validateOrderData rejects empty items array
TEST: validateOrderData rejects item with quantity < 1
TEST: validateOrderData rejects item where subtotal !== price × quantity
TEST: validateOrderData rejects incomplete shipping address
TEST: validateOrderData rejects missing currency
TEST: validateOrderData accepts complete valid order
```

#### T1.4: Stock Calculation Logic
```
File: tests/checkout/stock-calculation.unit.test.ts
Framework: vitest

TEST: availableStock = stock - reservedStock
TEST: availableStock < requested quantity blocks checkout
TEST: availableStock >= requested quantity allows checkout
TEST: stock === 0 returns out of stock error
TEST: reservedStock === stock returns "being purchased" error
```

---

### Tier 2: Integration Tests

#### T2.1: Checkout API Route
```
File: tests/checkout/checkout-api.integration.test.ts
Framework: vitest with mocked Sanity + Stripe

TEST: Returns 400 for empty basket
TEST: Returns 400 for basket with non-existent product ID
TEST: Returns 409 for out-of-stock item with correct error
TEST: Returns 409 when available stock < requested quantity
TEST: Successful checkout reserves stock (increments reservedStock, not decrements stock)
TEST: Successful checkout returns Stripe client_secret
TEST: Stripe failure after reservation triggers rollback (reservedStock decremented)
TEST: Concurrent requests for last item — only one succeeds (ifRevisionId)
TEST: Negative quantity rejected with 400
TEST: Quantity > stock rejected with 409
```

#### T2.2: Webhook Handler
```
File: tests/checkout/webhook.integration.test.ts
Framework: vitest with mocked Stripe + Sanity

TEST: Invalid signature returns 400
TEST: checkout.session.completed creates order in Sanity
TEST: Duplicate session_id doesn't create duplicate order (idempotency)
TEST: Amount mismatch throws error
TEST: Order contains correct item snapshots (name, price, quantity at purchase time)
TEST: Stock decremented on successful payment (both stock and reservedStock)
TEST: checkout.session.expired releases reservedStock
TEST: async_payment_failed releases reservedStock
TEST: Missing line items handled gracefully
```

#### T2.3: Address Flow Integration
```
File: tests/address/address-flow.integration.test.ts
Framework: vitest with mocked Google API

TEST: Valid address → ACCEPT + cleaned address returned
TEST: Invalid address → FIX + error message
TEST: Google API 500 → FIX + "temporarily unavailable"
TEST: Google API 401 → FIX + "authentication error"
TEST: Missing API key → FIX + "configuration error"
TEST: Address with typo corrections → FIX (hasReplacedComponents)
```

#### T2.4: Return Page Data Flow
```
File: tests/checkout/return-page.integration.test.ts
Framework: vitest with mocked Sanity

TEST: Valid session_id returns order data
TEST: Invalid session_id returns null
TEST: Missing session_id returns null
TEST: Order data contains items, amountTotal, status
```

---

### Tier 3: E2E Tests (Playwright)

#### T3.1: Happy Path — Guest Checkout
```
File: tests/e2e/checkout/guest-checkout.spec.ts
Framework: playwright with Stripe test mode

FLOW:
  1. Add product to basket → verify basket count
  2. Click Checkout → lands on /checkout/shipping
  3. Fill valid address (PL, 50-100, Rynek, 1, Wroclaw)
  4. Submit → see "Address confirmed" + "Proceed to Payment"
  5. Click Proceed to Payment → Stripe form loads
  6. Enter Stripe test card (4242 4242 4242 4242)
  7. Complete payment → redirect to /checkout/return?session_id=...
  8. See "Payment Successful!" message
  9. See order summary with correct items
  10. Basket is empty (check localStorage)

ASSERTIONS PER STOP:
  Stop 1: URL is /checkout/shipping
  Stop 2: Address form visible
  Stop 3: Confirmation view with address displayed
  Stop 4: Stripe iframe visible
  Stop 5: Redirect URL contains session_id
  Stop 6: Success heading visible
  Stop 7: Basket count === 0
```

#### T3.2: Out-of-Stock Intercept
```
File: tests/e2e/checkout/out-of-stock.spec.ts
Framework: playwright

FLOW:
  1. Add product to basket
  2. (API mock: set stock to 0)
  3. Proceed to payment
  4. Verify error message shown before payment form
  5. Verify user is NOT charged
```

#### T3.3: Address Validation Rejection
```
File: tests/e2e/checkout/address-rejection.spec.ts
Framework: playwright

FLOW:
  1. Navigate to /checkout/shipping
  2. Enter invalid address
  3. Submit
  4. Verify error message appears
  5. Verify "Proceed to Payment" NOT shown
  6. Edit address → enter valid address
  7. Verify confirmation shown
```

#### T3.4: Authenticated Checkout with Saved Address
```
File: tests/e2e/checkout/auth-checkout.spec.ts
Framework: playwright with Clerk test user

FLOW:
  1. Sign in with test account
  2. Add product to basket
  3. Go to checkout
  4. Verify saved address pre-populated
  5. Proceed to payment
  6. Complete with test card
  7. Verify order linked to user account
```

---

## 8. Verification Checklist

### Pre-Launch Checklist

#### Payment Security
- [ ] Stripe webhook signature verification enabled and tested
- [ ] Webhook endpoint registered in Stripe dashboard (production + test)
- [ ] `STRIPE_WEBHOOK_SECRET` environment variable set
- [ ] `STRIPE_SECRET_KEY` is production key (not test)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is production key
- [ ] No sensitive data logged in production (remove all console.log with payment data)
- [ ] Amount verification in webhook matches Stripe session total
- [ ] Idempotency: duplicate webhook delivery doesn't create duplicate orders
- [ ] PCI compliance: no card data touches your server (Stripe Embedded handles)

#### Stock Integrity
- [ ] `reservedStock` field added to product schema in Sanity
- [ ] Stock reads use non-CDN client (`useCdn: false`)
- [ ] Reservation uses `ifRevisionId` for optimistic concurrency
- [ ] Failed checkout releases reservation (rollback)
- [ ] Expired session releases reservation
- [ ] Successful payment decrements both `stock` and `reservedStock`
- [ ] Concurrent purchase test: two users, one item — only one succeeds

#### Order Integrity
- [ ] Order created on `checkout.session.completed` webhook
- [ ] Order contains item snapshots (price at purchase, not current price)
- [ ] Order contains shipping address
- [ ] Order linked to Clerk user ID (if authenticated)
- [ ] Order number unique and sequential
- [ ] `payment.stripeCheckoutSessionId` stored for lookup
- [ ] `dates.orderedAt` and `dates.paidAt` set

#### UX Verification
- [ ] Shipping form validates all required fields
- [ ] Address validation provides clear error messages
- [ ] Out-of-stock items blocked before payment with user-friendly message
- [ ] Payment form loads without errors
- [ ] Success page shows order details
- [ ] Basket cleared after successful purchase
- [ ] Error states don't crash the app (white screen)
- [ ] Loading states present for all async operations

#### Monitoring
- [ ] Error logging for webhook failures
- [ ] Alert for failed order creation after successful payment
- [ ] Monitor `reservedStock > 0` products with no matching active session
- [ ] Stripe dashboard webhook delivery success rate
- [ ] Sanity query to find orders with `status: "pending_payment"` older than 1 hour

---

## Appendix A: File Dependency Map

```
ENTRY POINTS:
  /basket → BasketSummary.tsx → Link to /checkout
  /checkout → page.tsx → redirect to /checkout/shipping
  /checkout/shipping → layout.tsx → CheckoutProvider → shipping/page.tsx
  /checkout/payment → payment/page.tsx → EmbeddedCheckoutForm.tsx → POST /api/checkout
  /checkout/return → return/page.tsx → getOrderBySession → GET /api/order

API ROUTES:
  POST /api/checkout → backendClient (Sanity) + stripe (commented)
  POST /api/webhook → stripe + backendClient (commented)
  GET /api/order → stripe (commented)

SERVER ACTIONS:
  submitShippingAction → Google Address Validation API
  getOrderBySession → GET /api/order (should be direct Sanity query)

STATE:
  Zustand (basket) → localStorage persistence
  React Context (checkout) → CheckoutProvider
  JWT Cookie (guest address) → checkout_context

EXTERNAL:
  Stripe → Payment processing (SDK + webhooks)
  Clerk → Authentication (middleware + currentUser)
  Sanity → CMS (products, orders, users)
  Google → Address Validation API
```

## Appendix B: Address Type Mapping Required

```
Checkout Address          → Order ShippingAddress      → Cookie GuestContext
─────────────────────────────────────────────────────────────────────────────
street                    → line1                       → line1
streetNumber              → line2                       → line2
city                      → city                        → city
(missing)                 → state                       → (missing)
postalCode                → postalCode                  → postal_code
regionCode                → country                     → country
(missing)                 → name                        → (missing)
(missing)                 → phone                       → (missing)
```

**Three incompatible address shapes** must be unified via a mapping layer.

---

## Appendix C: Metrics Summary Table

| Layer | Average | Status |
|-------|---------|--------|
| Data Layer | 4.4/10 | Below standard |
| Architecture Layer | 4.6/10 | Below standard |
| Performance Layer | 4.6/10 | Below standard |
| Security Layer | 3.8/10 | Critical gaps |
| Robustness Layer | 1.8/10 | **Non-functional** |
| Integration Layer | 3.0/10 | **Critical gaps** |
| **Overall** | **3.2/10** | **Not production-ready** |

**Professional e-commerce minimum threshold: 7/10 across all layers.**

---

*End of Audit — 2026-04-02*
