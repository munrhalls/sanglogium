# Legacy vs Current Checkout System — Audit Report

> **Date:** May 26, 2026
> **Purpose:** Zero confusion about legacy vs current checkout architecture. 100% accurate discernment.
> **Rule:** `basketReservationId` and `checkout-queue` are LEGACY. Current system uses `iron-session` only.

---

## Current Architecture (Source of Truth: `/docs/checkout/*/framed-objective.md`)

```
Basket Page → iron-session: { basket: [{productId, quantity}] }
  ↓
Address Page → iron-session: { basket, address: {firstName, lastName, phone, regionCode, postalCode, street, streetNumber, city} }
  ↓
Shipping Page → iron-session: { basket, address, shippingCode, shippingCost }
  ↓
Payment Page → iron-session: { basket, address, shippingCode, shippingCost, paymentIntentId }
  ↓
PaymentForm.client.tsx → stripe.confirmPayment → /api/checkout/return
  ↓
Success Page → displays result (reads order created by webhook)
  ↓
Webhook → payment_intent.succeeded → create order in Sanity + decrement stock
```

**Key principle:** All state lives in `iron-session` encrypted cookie. No CMS reservations during checkout. Webhook creates order directly from PI metadata.

---

## Legacy Architecture (DEPRECATED — DO NOT USE OR EXTEND)

```
Basket Page → creates basketReservation document in Sanity
  ↓
Address Page → patches basketReservation with shippingAddress
  ↓
Shipping Page → patches basketReservation with shippingChoice
  ↓
Payment Page → reads basketReservationId from sessionStorage
  ↓
POST /api/checkout/payment-intent → creates PI with basketReservationId in metadata
  ↓
Webhook → reads basketReservationId from PI metadata → creates order from reservation doc
```

**Key identifiers of legacy code:**
- References to `basketReservationId`
- Reads from `sessionStorage` (except for non-checkout purposes)
- `app/api/basket-reservations/*` endpoints
- `app/api/checkout-queue/*` endpoints
- `lib/queue/*` files
- `basketReservation` Sanity schema type

---

## Legacy Artifacts Still in Codebase (To Be Removed)

### Components / Pages
| File | Legacy Indicator | Status |
|------|-----------------|--------|
| `app/(store)/checkout/layout.tsx` | Reads `sessionStorage.basketReservationId`, patches reservations via API | **ACTIVE THREAT** — layout wraps all checkout pages |
| `app/(store)/checkout/payment/PaymentPageClient.tsx` | Reads `sessionStorage.basketReservationId`, calls `/api/checkout/payment-intent` | Dead code (orphaned) |
| `app/(store)/checkout/payment/_components/PaymentForm.tsx` | Broken `return_url` with `{CHECKOUT_SESSION_ID}` placeholder | Dead code (only used by PaymentPageClient) |
| `app/(store)/checkout/payment/_components/OrderSummary.tsx` | Requires `basketReservationId` prop | Dead code (reservation flow only) |

### API Routes
| File | Legacy Indicator | Status |
|------|-----------------|--------|
| `app/api/checkout/payment-intent/route.ts` | Creates PI with `basketReservationId` metadata | Dead code (only called by PaymentPageClient) |
| `app/api/basket-reservations/route.ts` | GET/DELETE all reservations | Legacy API |
| `app/api/basket-reservations/[id]/route.ts` | GET/PATCH single reservation | Legacy API |
| `app/api/checkout-queue/*` | Entire directory | **100% LEGACY** — per user directive |

### Test / Dev Routes
| File | Legacy Indicator | Status |
|------|-----------------|--------|
| `app/(test)/checkout-queue/*` | Entire directory | **100% LEGACY** — per user directive |
| `app/(test)/checkout-seed/*` | May be legacy depending on implementation | Verify before removal |

### Sanity Schema
| File | Legacy Indicator | Status |
|------|-----------------|--------|
| `sanity-cms/schemaTypes/basketReservationType.ts` | Defines `basketReservation` document type | Retain for historical data; mark deprecated |

### Tests
| File | Legacy Indicator | Status |
|------|-----------------|--------|
| `app/(store)/checkout/shipping/shipping-page.spec.ts` | Injects `basketReservationId` into `sessionStorage` | Tests wrong flow; must be rewritten for iron-session |
| `tests/checkout/e2e/address-flow.spec.ts` | Injects `basketReservationId` into `sessionStorage` | Tests wrong flow; must be rewritten |
| `tests/checkout/e2e/shipping-visual-tracer.test.ts` | Injects `basketReservationId` into `sessionStorage` | Tests wrong flow; must be rewritten |

### Library Files
| File | Legacy Indicator | Status |
|------|-----------------|--------|
| `lib/queue/*` | Any queue-related files | **100% LEGACY** — per user directive |
| `lib/dev/event-logger.ts` | Used by both flows but may have legacy references | Verify and clean |

---

## Current Code Elements (THE REAL ARCHITECTURE — Preserve and Extend)

### Server Components
| File | Role | Status |
|------|------|--------|
| `app/(store)/checkout/page.tsx` | Basket entry point | ✅ Current |
| `app/(store)/checkout/address/page.tsx` | Address funnel guard + renders AddressForm | ✅ Current |
| `app/(store)/checkout/shipping/page.tsx` | Shipping funnel guard + AlleKurier rates | ✅ Current |
| `app/(store)/checkout/payment/page.tsx` | Payment funnel guards + PI create/update | ✅ Current |
| `app/checkout/success/page.tsx` | Privacy-guarded success display | ✅ Current |

### Client Components
| File | Role | Status |
|------|------|--------|
| `app/(store)/checkout/address/AddressForm.tsx` | Address form (5 fields — needs firstName/lastName/phone) | ✅ Current |
| `app/(store)/checkout/shipping/ShippingPageClient.tsx` | Shipping option selection | ✅ Current |
| `app/(store)/checkout/payment/PaymentForm.client.tsx` | Stripe PaymentElement + confirmPayment | ✅ Current |

### Server Actions
| File | Role | Status |
|------|------|--------|
| `app/actions/checkout/index.ts` | `saveAddress`, `saveShippingAction`, `initPaymentAction` | ✅ Current |
| `app/actions/address/address.ts` | Google Address Validation | ✅ Current |

### Route Handlers
| File | Role | Status |
|------|------|--------|
| `app/api/checkout/return/route.ts` | PI verification, session lifecycle, redirect | ✅ Current |
| `app/api/webhooks/stripe/route.ts` | Signature verification, order creation, stock decrement | ⚠️ **NEEDS FIX** — currently expects `basketReservationId` (legacy) |

### Utilities
| File | Role | Status |
|------|------|--------|
| `lib/session.ts` | iron-session config + CheckoutSession interface | ✅ Current (except fallback password bug) |
| `lib/stripe.ts` | Stripe client initialization | ✅ Current |
| `lib/shipping/allekurier-rates.ts` | AlleKurier API integration | ✅ Current |
| `lib/shipping/parcel-calculator.ts` | Package dimension calculation | ✅ Current |

---

## Beads Issues — Legacy vs Current Classification

### Current Issues (Valid — Implement These)

| ID | Title | Why Current |
|----|-------|-------------|
| **8l3** | Remove iron-session fallback password | Fixes `lib/session.ts` — core current infrastructure |
| **zym** | Fix webhook order creation for iron-session flow | Adapts webhook to work with current iron-session PI metadata |
| **80l** | Add Stripe idempotency keys | Fixes `initPaymentAction` — current Server Action |
| **q3m** | Add firstName, lastName, phone to address form | Extends `AddressForm.tsx` — current component |
| **cdy** | Add email capture and OrderSummary to payment page | Extends `PaymentForm.client.tsx` and `page.tsx` — current |
| **33x** | Fix cascade invalidation | Fixes `saveAddress`/`saveShippingAction` — current Server Actions |
| **1tz** | Add stock guard to webhook | Defensive fix for current webhook |
| **4nj** | Migrate metadata to Stripe shipping parameter | Improves current PI creation in `initPaymentAction` |
| **ayz** | Deprecate basket reservation flow artifacts | Removes legacy code from current codebase |
| **xjf** | Basket page transition to address page using iron-session | Current flow infrastructure |
| **d04** | Implement soft stock checks between checkout steps | Current flow validation |
| **cfn** | Implement scarcity badges | Current feature |
| **x1u** | Production UI implementation | Current feature |
| **a4k** | Delivery timeline resolution | Current shipping feature |

### Legacy Issues (Should Be Closed/Deferred/Marked)

| ID | Title | Why Legacy | Recommended Action |
|----|-------|-----------|-------------------|
| **5hf** | Migrate checkout address from Stripe metadata to shipping parameter | **DUPLICATE of 4nj** | ✅ **CLOSED** as duplicate |
| **01t** | Research Redis spin loop anti-pattern in checkout queue | References legacy `checkout-queue` | Add `[LEGACY]` prefix; close as "superseded by g14" |
| **cos** | Implement graceful fail at payment — OCC transaction collision | References legacy OCC/Redis approach | Add `[LEGACY]` prefix; close as "superseded by d04 + zym" |
| **0h3** | Footer links return 404 errors | Unrelated to checkout | Keep open but not checkout-relevant |
| **aq2** | Fix prod hosting platform — Netlify free build minutes exhausted | Unrelated to checkout | Keep open but not checkout-relevant |

### Issues With Legacy Language (Need Description Updates)

| ID | Title | Legacy Language Found | Fix Required |
|----|-------|----------------------|-------------|
| **rlz** | Auto-select cheapest carrier logic with user choice | "Persist selected carrier to basket reservation" | Change to "Persist selected carrier to iron-session" |
| **g14** | Update checkout system ADR: Eliminate Redis queue | References legacy queue elimination | Add note: "Documents transition FROM legacy Redis queue TO current iron-session + Sanity soft-check architecture" |

---

## Mix-Ups Found and Fixed

### Mix-Up 1: Duplicate Issues
**Problem:** `4nj` and `5hf` are identical scope.
**Fix:** `5hf` closed as duplicate of `4nj`.

### Mix-Up 2: `rlz` Uses Legacy Language
**Problem:** "Persist selected carrier to basket reservation" implies CMS-based reservation.
**Fix:** Update to "Persist selected carrier to iron-session." The current `saveShippingAction` already does this correctly.

### Mix-Up 3: `q3m` References Legacy Layout
**Problem:** Description mentions "Update checkout/layout.tsx — remove unused basket reservation logic."
**Fix:** This is actually CORRECT — it's telling the implementer to clean up legacy from the current layout. But should be clearer: "Remove legacy basket reservation logic from layout.tsx (see ayz for full deprecation)."

### Mix-Up 4: `cdy` References Legacy OrderSummary
**Problem:** "OrderSummary component exists at payment/_components/OrderSummary.tsx but requires basketReservationId prop (reservation flow only)"
**Fix:** This is CORRECT identification of legacy component. But should explicitly say: "The existing OrderSummary component is LEGACY (reservation flow only). Create a NEW OrderSummary for the iron-session flow or render summary inline in page.tsx."

### Mix-Up 5: `cos` Implements Legacy Pattern
**Problem:** "catch OCC transaction collision" — OCC was the legacy Redis-based approach.
**Fix:** Close this issue. The current approach (d04 soft stock checks + zym webhook fix) replaces OCC entirely.

### Mix-Up 6: `01t` Researches Legacy System
**Problem:** "Research Redis spin loop anti-pattern in checkout queue" — the checkout queue is 100% legacy.
**Fix:** Close as "superseded by g14 (ADR documenting elimination of Redis queue)."

---

## Action Items

1. ✅ **CLOSED** `5hf` as duplicate of `4nj`
2. **UPDATE** `rlz` description: change "basket reservation" to "iron-session"
3. **UPDATE** `q3m` description: clarify layout.tsx reference is legacy cleanup
4. **UPDATE** `cdy` description: explicitly mark OrderSummary as legacy, specify new component needed
5. **CLOSE** `01t` as superseded by g14
6. **CLOSE** `cos` as superseded by d04 + zym
7. **UPDATE** `g14` description: clarify it documents transition FROM legacy TO current
8. **VERIFY** `app/(test)/checkout-seed/` — if it seeds iron-session, it's current; if it seeds basket reservations, it's legacy
