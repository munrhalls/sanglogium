# Audit: Checkout — Basket → Address → Shipping

**Scope:** Basket page → Address page → Shipping page (excl. Stripe payment)
**Stack:** Next.js 15, React 18, Sanity v3, Redis checkout-queue
**Date:** 2026-05-21

---

## 1. End-State Spatial Maps

### Desktop (1280px)
```
[STORE LAYOUT — max-w-[1440px], bg-brand-800]
  [HEADER] [CATALOGUE NAVBAR]
  [MAIN — flex-1, overflow-y-auto]
    BASKET PAGE:
      [Shelf] [SegmentTitle "Your Basket"]
      [BasketManager — grid lg:grid-cols-3]
        [LEFT 2/3 — card-base: BasketItem[] rows]
        [RIGHT 1/3 — card-base sticky: BasketSummary + CheckoutButton]
          │ POST /api/checkout-queue → reservationId → sessionStorage
          ▼
    CHECKOUT LAYOUT (client, max-w-4xl, p-6):
      [h1 "CHECKOUT" — text-3xl font-black uppercase]
      ADDRESS PAGE:
        [max-w-xl, bg-white, rounded, shadow, p-6]
        [h1 "Shipping Address"] [FIX error banner]
        [form: Country(select) | City | Street/Number(grid-2) | PostalCode]
        [btn: bg-black text-white "Continue to Shipping"]
          │ submitShippingAction(Google API) → PATCH reservation → redirect
          ▼
      SHIPPING PAGE:
        [max-w-2xl, bg-white, rounded, shadow, p-6]
        [h1 "Wybierz metodę dostawy"]
        [ShippingOption cards — border-2, selectable]
        [btn: bg-black text-white "Przejdź do płatności"]
          │ PATCH reservation → redirect /checkout/payment
```

### Mobile (375px)
```
[BasketManager — grid-cols-1, summary sticky bottom-0]
[Address — max-w-xl full-width, Street/Number stays 2-col]
[Shipping — max-w-2xl full-width, option cards stacked]
```

---

## 2. Spatial Architecture

### Component Hierarchy
```
app/(store)/layout.tsx (server)
├── Header
├── CatalogueNavbar
├── main
│   ├── basket/page.tsx (server)
│   │   └── BasketManager (client)
│   │       ├── BasketSkeleton / EmptyBasket / error state
│   │       ├── BasketItem[]
│   │       └── BasketSummary
│   │           └── CheckoutButton → POST /api/checkout-queue
│   │
│   └── checkout/layout.tsx (client — CheckoutContext.Provider)
│       ├── checkout/page.tsx → redirect /checkout/address
│       ├── checkout/address/page.tsx (client)
│       │   └── form → useCheckout().validateShipping
│       └── checkout/shipping/page.tsx (client)
│           └── POST /api/shipping/rates → option cards → PATCH reservation
├── Footer
├── DrawersManager
└── ActionBar
```

### Data Flow
```
BasketManager
  │ Zustand basketStore (localStorage→sessionStorage fallback, Zod validated)
  │ SWR → GET /api/basket/products?ids=...
  │ fetch → POST /api/basket/shipping-rates (estimate on basket page)
  │
  └── CheckoutButton
        │ POST /api/checkout-queue
        │   → Redis FIFO (SET NX lock, one-at-a-time)
        │   → Sanity: create basketReservation doc + inc reservedStock
        │   → Response: reservationId, ttl, products
        │ sessionStorage.setItem("basketReservationId", ...)
        │ router.push("/checkout")
        ▼
Address Page
  │ useCheckout().validateShipping(form)
  │   → submitShippingAction (server action, Google Address Validation API)
  │   → PATCH /api/basket-reservations/[id] { shippingAddress }
  │   → sessionStorage.setItem("shippingAddress", ...)
  │   → router.push("/checkout/shipping")
  ▼
Shipping Page
  │ POST /api/shipping/rates { basketReservationId, shippingAddress }
  │   → Sanity: fetch reservation + parcel data
  │   → AlleKurier (PL) / Packlink (fallback)
  │   → Response: options[]
  │ User selects → PATCH /api/basket-reservations/[id] { shippingChoice }
  │ router.push("/checkout/payment")
```

---

## 3. Gap Analysis

| ID | Component | Current | Target | Severity | Source |
|----|-----------|---------|--------|----------|--------|
| G-01 | Address page | Raw Tailwind: `bg-white`, `text-gray-700`, `border-gray-300` | Design tokens: `card-base`, `input-field`, `input-select`, `btn-primary` | **HIGH** | `app/(store)/checkout/address/page.tsx:41-131` |
| G-02 | Shipping page | Raw Tailwind: `bg-white`, `text-black`, `border-gray-200` | Design tokens: `card-base`, `btn-primary`, `type-section-hed` | **HIGH** | `app/(store)/checkout/shipping/page.tsx:147-231` |
| G-03 | Address page | No client-side validation — only HTML `required` | Zod schema + field-level validation before server submission | **HIGH** | `app/(store)/checkout/address/page.tsx` — no validation logic |
| G-04 | Shipping options | `<div onClick>` cards — no `role`, `aria-selected`, `tabIndex`, keyboard | Radio group pattern: `role="radiogroup"`, `aria-selected`, keyboard nav | **HIGH** | `app/(store)/checkout/shipping/page.tsx:189-208` |
| G-05 | Processor | `verifiedPrice = p.price_data.unit_amount` — trusts client price blindly | Server-side price verification against CMS `price_data` | **CRITICAL** | `lib/queue/processor.ts:104` |
| G-06 | Processor | No stock check before reservation — `inc(reservedStock)` without validating `stock - reservedStock >= quantity` | Atomic stock validation before reservation creation | **CRITICAL** | `lib/queue/processor.ts:134-137` |
| G-07 | Address page | No field-level error display — only generic "FIX" banner | Per-field validation errors from Google API surfaced to user | **MEDIUM** | `app/(store)/checkout/address/page.tsx:45-51` |
| G-08 | Shipping page | Mixed Polish/English strings (address page=EN, shipping=PL) | Consistent i18n — single language throughout checkout | **MEDIUM** | `app/(store)/checkout/shipping/page.tsx` — Polish labels vs English address page |
| G-09 | Checkout flow | No progress indicator / stepper | Visual stepper: Address → Shipping → Payment | **MEDIUM** | No stepper component exists in checkout |
| G-10 | Address page | No guard for missing `basketReservationId` in sessionStorage | Redirect to `/basket` if no reservationId (like shipping page does) | **MEDIUM** | `app/(store)/checkout/address/page.tsx` — no reservationId check; cf. `shipping/page.tsx:52-55` |
| G-11 | Shipping page | `sessionStorage` is primary data path for `shippingAddress` — dual source of truth with Sanity reservation | Sanity reservation is sole source of truth; sessionStorage is cache only | **MEDIUM** | `app/(store)/checkout/shipping/page.tsx:41-48` — reads from sessionStorage first |
| G-12 | Types | `ShippingAddress` defined in 4 separate files with identical shape | Single shared type import from `checkout.types.ts` | **MEDIUM** | `layout.tsx:7-13`, `checkout.types.ts:1-7`, `basket-reservations/route.ts:13-19`, `shipping/rates/route.ts:7-13` |
| G-13 | Checkout layout | `"use client"` on entire layout — loses server rendering | Client wrapper for context only; layout shell stays server component | **LOW** | `app/(store)/checkout/layout.tsx:1` |
| G-14 | Shipping page | Full-page `Loader` spinner during fetch | Inline skeleton cards matching option card shape | **LOW** | `app/(store)/checkout/shipping/page.tsx:147-153` |
| G-15 | Debug | `console.log` statements in production code paths | Remove or guard behind `process.env.NODE_ENV` check | **LOW** | `checkout/layout.tsx:72`, `shipping/page.tsx:42,46` |

---

## 4. RWD Strategy

| Component | Desktop (1280px) | Mobile (375px) | Implementation |
|-----------|------------------|----------------|----------------|
| BasketManager | `lg:grid-cols-3` (2/3 + 1/3) | `grid-cols-1` stacked | `grid grid-cols-1 lg-touch:grid-cols-3` |
| BasketSummary | `sticky top-4` | `sticky bottom-0 z-10` | Conditional sticky position |
| Address form | `max-w-xl` centered | `max-w-xl` full width | No explicit mobile breakpoint needed |
| Shipping options | `max-w-2xl` centered | `max-w-2xl` full width | No explicit mobile breakpoint needed |
| Street/Number | `grid-cols-2` | `grid-cols-2` (unchanged) | Always 2-col — acceptable at 375px |

**Note:** Address and shipping pages lack explicit mobile breakpoint handling. They rely on `max-w-xl`/`max-w-2xl` natural width constraints. The store layout provides `pb-[var(--mobile-menu-h)]` for ActionBar clearance.

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `app/(store)/checkout/layout.tsx` | Central context — changes affect all checkout pages | E2E address-flow.spec.ts covers the integration path |
| `lib/queue/processor.ts` | Core reservation logic — price/stock gaps are security-critical | Add server-side price verification + stock check; update unit tests |
| `app/(store)/checkout/address/page.tsx` | Design token migration touches every class | Visual regression via Playwright screenshot comparison |
| `app/(store)/checkout/shipping/page.tsx` | Accessibility refactor changes DOM structure | `shipping-page.spec.ts` E2E test must be updated for new ARIA roles |
| `store/basketStore.ts` | Shared by all basket features | Unit tests in `BasketManager.test.tsx` cover store integration |
| `tailwind.config.ts` | Token additions only — never modify existing | Add-only policy; verify `npm run build` passes |

---

## 6. Test Coverage Assessment

| Layer | Tests Exist? | Coverage |
|-------|-------------|----------|
| BasketManager unit | Yes — `BasketManager.test.tsx` (4 tests) | Happy path, empty, error, data-gap |
| Address E2E | Yes — `address-flow.spec.ts` (1 test) | Happy path: fill form → Google API → PATCH → redirect |
| Shipping E2E | Yes — `shipping-page.spec.ts` (3 tests) | Happy path, error+retry, missing reservationId redirect |
| Shipping rates integration | Yes — `shipping-rates.test.ts` (5 tests) | Success, missing ID, missing address, config error, parcel splitting |
| Address integration | Yes — `address-slice.test.ts` (1 test) | Happy path: Google API → PATCH → verify Sanity |
| Basket E2E | Directory exists, empty | **GAP** — no basket page E2E tests |
| Basket integration | Directory exists, empty | **GAP** — no basket integration tests |

---

## 7. Verification Commands

```bash
# Build check
npm run build

# Unit tests
npx vitest run

# E2E tests (checkout scope)
npx playwright test --grep "checkout"

# Integration tests
npx vitest run --config vitest.integration.config.ts
```
