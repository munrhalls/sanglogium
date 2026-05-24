# Sprint 10: Fix Shipping Rates (Shippo) — Remediation

## PHASE 0: Pre-Work Verification

### Root Cause (Verified — Sprint 09)
```
[DEBUG] Shippo API error: {"parcels":[{"mass_unit":["This field is required."]}]}
```
- `app/api/shipping/rates/route.ts:45-46` sends `distanceUnit` and `massUnit` (camelCase)
- Shippo API requires `distance_unit` and `mass_unit` (snake_case)
- **This is the direct cause of "Failed to fetch shipping rates from Shippo"**

### Additional Gaps (Trace Verified)
- Hardcoded fake sender address (`"123 Main St, Warsaw"`)
- Sanity client created without auth token
- Parcel data hardcoded, not derived from basket products
- No timeout, retry, or circuit breaker on Shippo fetch
- Raw Shippo error details leaked to client
- `address_to.state` always empty string
- No input validation on shippingAddress fields
- Zero tests

### Confirmed
- `SHIPPO_API_KEY` is set and valid in `.env`

---

## PHASE 1: UX Flows

### Current State (Broken)
1. User completes address → redirected to `/checkout/shipping`
2. Page shows loading spinner → API call fails
3. User sees: **"Failed to fetch shipping rates from Shippo"**
4. User clicks "Go Back" → stuck, cannot proceed to payment

### Target State (After Sprint)
1. User completes address → redirected to `/checkout/shipping`
2. Page shows loading spinner → shipping options load successfully
3. User sees list of shipping options: provider name, service level, price, estimated delivery days
4. User clicks an option → visual selection feedback
5. User clicks "Continue to Payment" → shipping choice saved → redirected to `/checkout/payment`
6. If Shippo is temporarily unavailable: user sees "Shipping rates temporarily unavailable, please try again" with retry button
7. If address is invalid: user sees clear guidance, not raw API errors

---

## PHASE 2: End-State Overview

The shipping page reliably displays real-time shipping rates from Shippo using the customer's verified address and actual product parcel data. Transient failures are handled gracefully with retries and clear user messaging. Internal errors are logged server-side only — the user sees actionable, sanitized messages. The implementation is the simplest possible: no new abstractions, no new dependencies, minimal changes to existing files.

---

## PHASE 3: Architecture Contract

### Event → State → Side Effect Flow
```
Page mounts → get basketReservationId from sessionStorage
  → fetch reservation via authenticated Sanity client
  → extract shippingAddress
  → fetch basket products' parcel data
  → validate address + parcel before Shippo call
  → POST Shippo API (with 15s timeout, 2 retries)
  → classify response (success / validation error / provider error / network error)
  → return sanitized rates or sanitized error
  → render options or error with retry
```

### Sender Address Contract
```
Env vars → read at request time (supports runtime changes)
  SHIPPO_SENDER_NAME, SHIPPO_SENDER_STREET, SHIPPO_SENDER_CITY,
  SHIPPO_SENDER_ZIP, SHIPPO_SENDER_COUNTRY, SHIPPO_SENDER_STATE (optional),
  SHIPPO_SENDER_PHONE (optional), SHIPPO_SENDER_EMAIL (optional)
```

### Error Classification Contract
```typescript
type ShippoErrorClass = 
  | 'CONFIGURATION'  // missing env vars → 500, log alert
  | 'VALIDATION'     // bad address/parcel → 400, user-friendly message
  | 'PROVIDER'       // Shippo returned error → 502, retryable
  | 'NETWORK'        // timeout/fetch failure → 502, retryable
```

---

## PHASE 4: Scope Contracts

### Scope Contract 1: Fix snake_case Bug (Immediate Unblock)

**UX Slice**
- User visits `/checkout/shipping` → shipping rates display instead of error

**Architecture Slice**
- Fix `PARCEL_DATA` field names in `app/api/shipping/rates/route.ts:40-47`
- `distanceUnit` → `distance_unit`, `massUnit` → `mass_unit`

**Files:** `app/api/shipping/rates/route.ts` (lines 40-47)

**Change:**
```typescript
const PARCEL_DATA: ParcelData = {
  length: 10,
  width: 10,
  height: 5,
  weight: 500,
  distance_unit: 'cm',  // was distanceUnit
  mass_unit: 'g',       // was massUnit
};
```
Also update the `ParcelData` interface (lines 14-21) to use snake_case.

**Human Verification Checklist**
- [ ] Visit `/checkout/shipping` with a reservation that has `shippingAddress`
- [ ] Shipping options display (no "Failed to fetch" error)
- [ ] Options show provider, service level, price, estimated days

**Minimal Tests**
- None (verified manually — test added in Scope 7)

---

### Scope Contract 2: Real Sender Address from Env Vars

**UX Slice**
- No visible change (Shippo receives real address instead of fake one)

**Architecture Slice**
- Read sender address from environment variables at request time
- Remove hardcoded `"123 Main St, Warsaw, MZ, 00-001, PL"`
- Store address: high-end audio shop with presence in Poland, Netherlands, Austria
- Add to `.env.example` with placeholder values

**Files:**
- `app/api/shipping/rates/route.ts` (lines 134-141)
- `.env.example`

**Env vars to add:**
```
SHIPPO_SENDER_NAME=Sang Logium
SHIPPO_SENDER_STREET=
SHIPPO_SENDER_CITY=
SHIPPO_SENDER_STATE=
SHIPPO_SENDER_ZIP=
SHIPPO_SENDER_COUNTRY=PL
SHIPPO_SENDER_PHONE=
SHIPPO_SENDER_EMAIL=
```

**Change in route.ts:** Replace hardcoded `address_from` object with values from `process.env`, with fallback error if required fields missing.

**Human Verification Checklist**
- [ ] `.env.example` updated with new vars
- [ ] Route reads sender address from env
- [ ] Missing required sender fields returns clear CONFIGURATION error
- [ ] Shipping rates still load with real address configured

**Minimal Tests**
- None (configuration — verified by successful Shippo call)

---

### Scope Contract 3: Authenticated Sanity Client

**UX Slice**
- No visible change (reservation fetch works reliably regardless of Sanity permissions)

**Architecture Slice**
- Replace `createClient({ projectId, dataset, apiVersion, useCdn: false })` (no token)
- With `getBackendClient()` from `@/sanity-cms/lib/backendClient` (uses `SANITY_STUDIO_READ_WRITE` token)
- Remove the `createClient` import from `next-sanity`

**Files:** `app/api/shipping/rates/route.ts` (lines 1, 74-79)

**Change:**
```typescript
// Remove: import { createClient } from "next-sanity";
// Add: import { getBackendClient } from '@/sanity-cms/lib/backendClient';

// Replace lines 74-79:
const client = getBackendClient();
```

**Human Verification Checklist**
- [ ] Reservation fetch succeeds with authenticated client
- [ ] No import of `createClient` from `next-sanity` remains
- [ ] Shipping rates still load

**Minimal Tests**
- None (verified by successful flow)

---

### Scope Contract 4: Derive Parcel Data from Basket Products

**UX Slice**
- Shipping rates reflect actual product sizes/weights, not fake defaults

**Architecture Slice**
- Extend GROQ query to fetch `basketReservation` array with product `_id`s
- Fetch each product's `parcel` field from Sanity
- Aggregate: sum weights, use max dimensions (simplest approach)
- If any product is missing `parcel` data: return VALIDATION error with clear message — do NOT silently use fake data
- Remove hardcoded `PARCEL_DATA` constant (no longer needed after this scope)

**Files:** `app/api/shipping/rates/route.ts`

**GROQ query change:**
```groq
*[_id == $id][0]{
  _id,
  shippingAddress,
  basketReservation[]{
    _id,
    quantity
  }
}
```

**Product parcel fetch:**
```typescript
const productIds = reservation.basketReservation.map((item: any) => item._id);
const products = await client.fetch(
  `*[_id in $ids]{ _id, parcel }`,
  { ids: productIds }
);
```

**Aggregation (simplest):**
```typescript
const parcels = products.map((p: any) => {
  if (!p.parcel) throw new ShippoValidationError(`Product ${p._id} missing parcel data`);
  return { ...p.parcel, quantity: /* from reservation */ };
});
```

**Human Verification Checklist**
- [ ] Products with parcel data → rates use actual dimensions
- [ ] Product without parcel data → clear error (not silent fallback)
- [ ] Multiple products in basket → aggregated correctly
- [ ] Empty basket → appropriate error

**Minimal Tests**
- None (tested in Scope 7)

---

### Scope Contract 5: Resilience — Timeout, Retry, Circuit Breaker

**UX Slice**
- Temporary Shippo outage → user sees "please try again" instead of hard failure
- After multiple failures → system fails fast instead of hanging

**Architecture Slice**
- Wrap Shippo fetch with:
  - **Timeout:** `AbortController` with 15s timeout
  - **Retry:** 2 retries with exponential backoff (500ms, 1500ms) on 5xx or network errors
  - **Circuit breaker:** Simple in-memory counter — 5 consecutive failures in 60s window → fail fast for 30s, return cached "temporarily unavailable" response
- All implemented inline in the route handler — no new files, no new dependencies

**Files:** `app/api/shipping/rates/route.ts`

**Implementation (simplest):**
```typescript
// Timeout helper (inline)
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Retry helper (inline)
async function fetchWithRetry(url: string, options: RequestInit, timeoutMs: number, retries: number) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      if (res.ok || res.status < 500) return res; // don't retry 4xx
      if (i === retries) return res;
    } catch (e) {
      if (i === retries) throw e;
    }
    await new Promise(r => setTimeout(r, [500, 1500][i]));
  }
}

// Circuit breaker (module-level state, simplest)
let failureCount = 0;
let circuitOpenUntil = 0;
```

**Human Verification Checklist**
- [ ] Normal Shippo call completes within 15s
- [ ] Simulated slow Shippo → times out at 15s with NETWORK error
- [ ] Simulated Shippo 500 → retries twice, then returns PROVIDER error
- [ ] 5 consecutive failures → circuit opens, immediate response
- [ ] After 30s → circuit closes, next call attempts Shippo again

**Minimal Tests**
- None (resilience patterns verified via manual simulation or Scope 7 integration test)

---

### Scope Contract 6: Error Handling + Input Validation

**UX Slice**
- User never sees raw Shippo error JSON
- Invalid address → clear message: "We couldn't calculate shipping for this address. Please check your details."
- Shippo down → "Shipping rates temporarily unavailable. Please try again." with retry button
- Missing product data → "Some products in your basket are missing shipping information. Please contact support."

**Architecture Slice**
- Classify all errors into 4 types: CONFIGURATION, VALIDATION, PROVIDER, NETWORK
- Log full error details server-side with `console.error` + request correlation ID
- Return sanitized `{ error, errorClass, retryable }` to client
- Frontend: map `errorClass` to user-friendly message + optional retry button
- Validate `shippingAddress` before Shippo call:
  - `regionCode`: must be ISO 3166-1 alpha-2 (2 uppercase letters)
  - `postalCode`: non-empty
  - `street`, `city`: non-empty
  - `state`: derive from country if empty and required (PL → voivodeship not required by Shippo; NL → province may be; AT → state may be) — simplest: pass empty if not provided, let Shippo validate

**Files:**
- `app/api/shipping/rates/route.ts` (error classification + validation)
- `app/(store)/checkout/shipping/page.tsx` (user-friendly error display + retry)

**Human Verification Checklist**
- [ ] Invalid regionCode → VALIDATION error, user-friendly message
- [ ] Shippo returns 400 → VALIDATION error, sanitized message
- [ ] Shippo returns 500 → PROVIDER error, retry button shown
- [ ] Network timeout → NETWORK error, retry button shown
- [ ] Check server logs → full error details present, correlation ID visible
- [ ] Check client response → no raw Shippo data leaked

**Minimal Tests**
- None (tested in Scope 7)

---

### Scope Contract 7: Tests (Minimal, Black Box, Valuable)

**UX Slice**
- No direct UX impact (confidence for developers)

**Architecture Slice**
- **Integration test:** `GET /api/shipping/rates` with mocked Shippo response
  - Success path: returns `{ options: [...] }`
  - Missing address: returns 400 with VALIDATION error
  - Shippo error: returns 502 with PROVIDER error
  - Missing parcel data: returns 400 with VALIDATION error
- **E2E test:** Shipping page flow
  - Navigate with valid reservation → options display → select → redirect to payment
  - Navigate without reservation → redirect to basket
  - API error → error message displayed with retry button

**Files:**
- `tests/checkout/integration/shipping-rates.test.ts` (new)
- `tests/checkout/e2e/shipping-page.spec.ts` (new)

**Test approach:** Mock Shippo at the `fetch` level using Vitest/Nock for integration. Use Playwright with route interception for E2E. Keep tests minimal — 3-4 test cases each. Black box: test only request/response, not internals.

**Human Verification Checklist**
- [ ] `npx vitest run tests/checkout/integration/shipping-rates.test.ts` — all pass
- [ ] `npx playwright test tests/checkout/e2e/shipping-page.spec.ts` — all pass

**Minimal Tests**
- These ARE the minimal tests

---

## PHASE 5: Verification Checkpoints

| Scope | Check | Pass |
|-------|-------|------|
| 1 | snake_case fix → shipping rates display | ☐ |
| 2 | Real sender address from env vars | ☐ |
| 3 | Authenticated Sanity client | ☐ |
| 4 | Parcel data derived from products | ☐ |
| 5 | Timeout + retry + circuit breaker functional | ☐ |
| 6 | Errors classified, sanitized, retry button works | ☐ |
| 7 | Integration + E2E tests pass | ☐ |

---

## PHASE 6: Final Human Check

- [ ] Full flow: basket → address → shipping (options display) → select → payment
- [ ] Shipping options show realistic rates for real address
- [ ] Error states: Shippo down → retry button → recovery
- [ ] No raw API errors visible to user at any point
- [ ] Server logs contain full error details for debugging
- [ ] All tests pass

---

## PHASE 7: Simplicity Guardrails

- **No new files except tests** — all fixes in existing `route.ts` and `page.tsx`
- **No new dependencies** — timeout/retry/circuit breaker are inline functions, no libraries
- **No new abstractions** — error classification is a simple string union, not a class hierarchy
- **Single-line fixes where possible** — Scope 1 is literally renaming two keys
- **Tests are black box** — test inputs/outputs, not implementation details
- **Fallback is explicit** — if parcel data missing, fail with clear error (don't silently use fake data)
- **"Is this the simplest possible way?"** — checked at each scope

---

## PHASE 8: Dependencies Between Scopes

```
Scope 1 (snake_case) → unblocks everything
  ↓
Scope 2 (sender address) → independent, parallel with 3
Scope 3 (auth client) → independent, parallel with 2
  ↓
Scope 4 (product parcel data) → depends on 3 (needs auth client)
  ↓
Scope 5 (resilience) → depends on 1-4 (wraps working Shippo call)
  ↓
Scope 6 (error handling) → depends on 5 (classifies errors from resilient fetch)
  ↓
Scope 7 (tests) → depends on 1-6 (tests the complete implementation)
```

**Parallelizable:** Scopes 2 and 3 can be done simultaneously after Scope 1.
