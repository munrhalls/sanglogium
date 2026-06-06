# Shipping Page — 100% Code Trace

**Date:** 2026-06-06  
**Scope:** Every file in the `/checkout/shipping` production code path  
**Status:** Active flow traced; orphaned route identified

---

## 1. File Inventory

| File | Role | In Production Flow? |
|------|------|---------------------|
| `app/checkout/shipping/page.tsx` | Server Component — entry point, data fetching | **YES** |
| `app/checkout/shipping/ShippingPageClient.tsx` | Client Component — UI, selection, CTA | **YES** |
| `app/actions/checkout/index.ts` | Server Action — `saveShippingAction` | **YES** |
| `lib/shipping/allekurier-rates.ts` | Direct AlleKurier API client | **YES** |
| `lib/shipping/parcel-calculator.ts` | Package dimension/weight aggregation | **YES** |
| `sanity-cms/lib/products/getProductsByIds.ts` | Sanity read for product parcel data | **YES** |
| `app/api/shipping/rates/route.ts` | REST API endpoint (AlleKurier + Packlink fallback) | **NO — ORPHANED** |
| `app/checkout/shipping/shipping-rates.test.ts` | Tests the ORPHANED API route | **NO — tests dead code** |
| `lib/shipping/packlink-rates.ts` | Packlink API client | **NO — only in orphaned route** |

---

## 2. Production Flow (4-Layer Stack)

### Layer 1 — Server Component (`page.tsx`)

**Guards (funnel jumping prevention):**
- No `session.address` → redirect `/checkout/address`
- No `session.basket` / empty → redirect `/basket`

**Data fetch:**
- Pulls basket product IDs from iron-session
- Calls `getProductsByIds(basketIds)` → Sanity read for `parcel` data

**Package calculation:**
- Calls `calculatePackages(session.basket, products)`
- Aggregates weight/volume, splits on courier limits (25kg / 99,000cm³ max per parcel)
- Falls back to `DEFAULT_PARCEL` (500g, 20×15×25cm) if product lacks parcel data

**Rate fetch:**
- Builds payload: `fromCountry: "PL"`, `fromZip: env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001"`, `toCountry: "PL"`, `toZip: session.address.postalCode`, `packages`
- Calls `fetchAlleKurierRates(payload, traceId)` directly (HTTP POST to `allekurier.pl/api_v1/service_list`)
- Transforms results via `transformAlleKurierToShippingOption`

**Handoff:**
- Passes `shippingOptions[]` + `traceId` + optional `error` to `ShippingPageClient`

**Env vars read:**
- `SENDER_ADDRESS_DEFAULT_ZIP`
- `ALLEKURIER_EMAIL`
- `ALLEKURIER_PASSWORD`

---

### Layer 2 — Client Component (`ShippingPageClient.tsx`)

**State:**
- `selectedRateId: string | null`
- `isSubmitting: boolean`
- `error: string | null`

**UI:**
- `CheckoutStepper` (step 2)
- Radio group of shipping options (provider, price, service name, delivery estimate)
- Selected summary line below list
- Inline error banner with retry (page reload)
- Desktop CTA: inline button below list (`#shipping-continue-desktop`)
- Mobile CTA: sticky fixed bottom bar (`#shipping-continue-mobile`)

**Selection handler (`handleContinue`):**
- Fire-and-forget POST to `/api/trace` (logging)
- Calls `saveShippingAction(rateId, priceInCents, methodName, carrier, estimatedDays)`
- Catches non-redirect errors, shows message

---

### Layer 3 — Server Action (`app/actions/checkout/index.ts`)

`saveShippingAction(shippingCode, priceInCents, shippingMethodName?, shippingCarrier?, shippingEstimatedDays?)`

**Guards:**
- No basket → redirect `/basket`
- No address → redirect `/checkout/address`
- No `checkoutSessionId` → redirect `/basket`
- `priceInCents` must be positive integer

**Mutation:**
- Writes to iron-session: `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`
- `session.save()`

**Redirect:**
- `redirect("/checkout/payment")`

---

### Layer 4 — Infrastructure

**`lib/shipping/allekurier-rates.ts`**
- Endpoint: `POST https://allekurier.pl/api_v1/service_list`
- Auth: `User[email]`, `User[password]` via `application/x-www-form-urlencoded`
- Timeout: 15s with `AbortController`
- Returns empty array on: missing creds, invalid packages, HTTP error, API error, timeout, parse failure
- `transformAlleKurierToShippingOption`: maps `Carrier.name` → `provider`, `Service.name` → `servicelevel.name`, `Order.gross` → `amount`, `Time.days` → `estimatedDays`

**`lib/shipping/parcel-calculator.ts`**
- `calculatePackages(basketItems, sanityProducts)`: used by page.tsx
- `calculatePackagesFromReservation(basketReservation)`: used only by orphaned API route
- Splits by max weight (25kg) or max volume (99,000cm³)
- Uses `max` dimensions for single parcel; splits by item count for multiple parcels

---

## 3. Critical Finding: Orphaned API Route

`app/api/shipping/rates/route.ts` exists but is **never imported or called** by the shipping page.

**What it does:**
- Accepts `POST` with `basketReservationId` + optional `shippingAddress`
- Reads `basketReservation` doc from Sanity
- Validates address fields
- Uses `calculatePackagesFromReservation`
- Calls AlleKurier for PL routes; falls back to Packlink for non-PL or AlleKurier failure
- Returns `{ options: ShippingOption[] }` or error JSON

**Call site check:**
- Zero imports in `app/checkout/shipping/*`
- Zero fetch calls to `/api/shipping/rates` in `app/checkout/**/*`
- Only caller: `shipping-rates.test.ts` (test file hitting the route directly)

**Implication:** The route is dead production code. The shipping page bypasses it entirely, calling `fetchAlleKurierRates` directly from the Server Component.

---

## 4. Session Cascade

**Upstream requirements (must exist):**
- `session.basket` (set at checkout init)
- `session.address` (set by address page)
- `session.checkoutSessionId` (set by checkout init)

**Downstream writes (set by this page):**
- `session.shippingCode`
- `session.shippingCost`
- `session.shippingMethodName`
- `session.shippingCarrier`
- `session.shippingEstimatedDays`

**Cascade invalidation rule (in `saveAddress`):**
- Editing address clears all downstream shipping fields

---

## 5. Error Handling

| Stage | Error | Behavior |
|-------|-------|----------|
| Package calc | Missing parcel data | Uses `DEFAULT_PARCEL`; warns in console |
| Package calc | All items invalid | Returns empty packages → AlleKurier gets empty → returns `[]` |
| AlleKurier | No credentials | Returns `[]`, logs error |
| AlleKurier | Timeout / HTTP / Parse | Returns `[]`, logs error |
| Page | `packageError` | Renders client with `error` prop |
| Client | Selection save fails | Shows inline error banner, stops spinner |
| Client | `NEXT_REDIRECT` | Re-thrown (framework handles navigation) |

---

## 6. Env Var Summary

| Var | Used By | Purpose |
|-----|---------|---------|
| `ALLEKURIER_EMAIL` | `allekurier-rates.ts` | API auth |
| `ALLEKURIER_PASSWORD` | `allekurier-rates.ts` | API auth |
| `SENDER_ADDRESS_DEFAULT_ZIP` | `page.tsx`, `api/shipping/rates` | Sender postal code |
| `SENDER_ADDRESS_*` | `api/shipping/rates` | Full sender address (orphaned route only) |
| `PACKLINK_PRO_API_KEY` | `packlink-rates.ts` | Fallback API (orphaned route only) |

---

## 7. Trace Accuracy Checklist

- [x] Every import in `page.tsx` traced to its source file
- [x] Every function call in `ShippingPageClient.tsx` traced to its definition
- [x] `saveShippingAction` fully traced (guards → validation → session write → redirect)
- [x] `fetchAlleKurierRates` fully traced (endpoint → auth → payload → response → transform)
- [x] `calculatePackages` fully traced (aggregation → split logic → fallback defaults)
- [x] API route existence verified AND call sites checked (confirmed orphaned)
- [x] No Packlink usage in active flow (only in orphaned route)
- [x] Session read/write boundaries documented
