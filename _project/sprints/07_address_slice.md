# Address Slice Sprint

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` exists. No pre-work lessons to load.

---

## PHASE 1: UX Flows First

### Step 1: Define All User Interactions

**Current State (what exists today):**
1. User is on `/checkout/shipping` → sees address form (regionCode, postalCode, street, streetNumber, city)
2. User fills form → clicks "Submit Address"
3. System calls `/api/shipping` → Google validates address
4. On CONFIRMED: system patches Sanity reservation doc with `shippingAddress`, redirects to `/checkout/shipping/confirmation`
5. On FIX: system shows error "Could not locate provided address on the map"

**Target State (what this sprint delivers):**
1. User is on `/checkout/shipping` → sees address form (same fields)
2. User fills form → clicks "Submit Address"
3. System calls Google API via `submitShippingAction` server action → returns verified address
4. System calls `PATCH /api/basket-reservations/[id]` with verified address + reservationId from sessionStorage
5. On success: redirects to `/checkout/shipping` (shipping options page)
6. On FIX: system shows validation error to user

### Step 2: End-State Overview

The user enters their shipping address on a clean form. The system validates it against Google's Address Validation API using a dedicated server action. On successful validation, the verified address is persisted to the basket reservation document via a focused PATCH endpoint. The user is then redirected to the shipping options page. The flow is decoupled: address validation, persistence, and navigation are separate concerns with clear boundaries.

---

## PHASE 2: Architecture Contract

### Event → State → Side Effect → Result Event

```
SUBMIT_ADDRESS
  → state: validating
  → side effect: submitShippingAction(address) → Google API
  → result: ADDRESS_VALIDATED { status, correctedAddress }
    OR ADDRESS_VALIDATION_FAILED { error }

ADDRESS_VALIDATED (status === ACCEPT)
  → state: saving
  → side effect: PATCH /api/basket-reservations/[id] { shippingAddress }
  → result: ADDRESS_SAVED
    OR ADDRESS_SAVE_FAILED { error }

ADDRESS_SAVED
  → state: redirecting
  → side effect: router.push('/checkout/shipping')
```

### Three Readable Contracts

**1. Events + Payloads**
```ts
type AddressEvent =
  | { type: 'SUBMIT_ADDRESS'; payload: ShippingAddress }
  | { type: 'ADDRESS_VALIDATED'; payload: { status: 'ACCEPT'; address: ShippingAddress } }
  | { type: 'ADDRESS_VALIDATION_FAILED'; payload: { status: 'FIX'; errors: { message: string } } }
  | { type: 'ADDRESS_SAVED' }
  | { type: 'ADDRESS_SAVE_FAILED'; payload: { error: string } }
```

**2. Transition Table**
```
idle        → SUBMIT_ADDRESS           → validating
validating  → ADDRESS_VALIDATED        → saving
validating  → ADDRESS_VALIDATION_FAILED → idle (show error)
saving      → ADDRESS_SAVED            → redirecting
saving      → ADDRESS_SAVE_FAILED      → idle (show error)
redirecting → (auto)                   → idle (page unload)
```

**3. Context Shape**
```ts
type AddressSliceContext = {
  status: 'idle' | 'validating' | 'saving' | 'redirecting'
  shippingAddress: ShippingAddress | null
  validationError: string | null
  saveError: string | null
}
```

### Simplicity Guardrail
No state machine library. A simple `useReducer` in the shipping page or checkout layout is sufficient. The existing `CheckoutContext` already holds `isLoading`, `shippingAPIValidation`, and `shippingAddress` — extend it rather than creating new abstractions.

---

## PHASE 3: Tiny Scope Contracts

---

### Scope Contract 1: Remove Dead Code — Legacy AddressForm

**UX Slice**
- No user-facing change — the legacy `AddressForm.tsx` is not rendered anywhere
- Removes confusion for future developers

**Architecture Slice**
- Delete `app/components/features/checkout/AddressForm.tsx`
- This file imports from non-existent `@/store/checkout/checkoutMachine` and calls `reserveStock` instead of Google API
- It is dead code with zero references in any route or layout

**Human Verification Checklist (<5 minutes)**
- [ ] `grep_search` for `AddressForm` across the codebase — confirm only the deleted file matches
- [ ] `grep_search` for `reserveStock` — confirm it's still used elsewhere (it is, by checkout-queue flow)
- [ ] Build succeeds: `npx next build --no-lint` (or `npx tsc --noEmit`)

**Minimal Tests**
- None needed — dead code removal

---

### Scope Contract 2: Fix Hardcoded API Key + Consolidate Google Validation

**UX Slice**
- No user-facing change
- Removes security vulnerability

**Architecture Slice**
- Remove hardcoded key from `app/api/shipping/route.ts:52`
- Replace with `process.env.GOOGLE_MAPS_API_KEY`
- The server action `submitShippingAction` in `app/actions/address/address.ts` already uses the env var correctly — keep it as the single source of truth for Google validation
- Refactor `app/api/shipping/route.ts` to call `submitShippingAction` instead of duplicating Google API logic
- The API route becomes: receive address → call `submitShippingAction` → if ACCEPT, PATCH Sanity → return result

**Human Verification Checklist (<5 minutes)**
- [ ] Confirm no hardcoded keys remain: `grep_search` for `AIzaSy` across codebase
- [ ] Confirm `GOOGLE_MAPS_API_KEY` is in `.env.local`
- [ ] Manual test: submit valid Polish address, verify Google API call succeeds

**Minimal Tests**
- None needed — refactor with existing E2E test as safety net

---

### Scope Contract 3: Create PATCH `/api/basket-reservations/[id]`

**UX Slice**
- No direct user-facing change
- Enables clean separation: address validation ≠ address persistence

**Architecture Slice**
- New file: `app/api/basket-reservations/[id]/route.ts`
- `PATCH` handler: accepts `{ shippingAddress: ShippingAddress }` in body
- Validates that the document exists (404 if not found)
- Patches the Sanity document with `shippingAddress`
- Returns `{ ok: true }` on success
- Uses `SANITY_STUDIO_READ_WRITE` token (same as existing shipping route)
- This endpoint is reusable by shipping option selection later

**Human Verification Checklist (<5 minutes)**
- [ ] `curl -X PATCH http://localhost:3000/api/basket-reservations/[real-id] -H 'Content-Type: application/json' -d '{"shippingAddress": {...}}'` → returns 200
- [ ] Query Sanity to confirm `shippingAddress` was persisted
- [ ] `curl` with invalid ID → returns 404
- [ ] `curl` with missing body → returns 400

**Minimal Tests**
- Test: PATCH with valid reservation ID persists shippingAddress
- Test: PATCH with non-existent ID returns 404

---

### Scope Contract 4: Wire Address Page to PATCH Endpoint

**UX Slice**
- User submits address → sees loading state → on success, redirects to `/checkout/shipping`
- On Google validation failure → sees error message, can edit and retry
- On save failure → sees error message, can retry

**Architecture Slice**
- Modify `app/(store)/checkout/layout.tsx` `validateShipping`:
  1. Call `submitShippingAction` (server action) instead of `fetch('/api/shipping')`
  2. On ACCEPT: call `PATCH /api/basket-reservations/[id]` with corrected address
  3. On PATCH success: redirect to `/checkout/shipping` (shipping options page)
  4. On any failure: set error state, stay on form
- Remove the Google API call + Sanity patch from `app/api/shipping/route.ts` (now handled by server action + PATCH endpoint)
- The `/api/shipping` route can be deprecated or repurposed for shipping options later

**Human Verification Checklist (<5 minutes)**
- [ ] Fill form with valid Polish address → submit → see loading → redirect to `/checkout/shipping`
- [ ] Check Sanity: reservation doc has `shippingAddress` with correct data
- [ ] Fill form with invalid address (e.g., "asdf", "123", "nowhere") → see "Could not locate address" error
- [ ] Form remains editable after error

**Minimal Tests**
- Test: valid address → Google returns ACCEPT → PATCH called → redirect
- Test: invalid address → Google returns FIX → error shown, no redirect

---

### Scope Contract 5: Integration Test

**UX Slice**
- No user-facing change
- Provides specification and regression safety

**Architecture Slice**
- New file: `tests/checkout/integration/address-slice.test.ts`
- Happy path only:
  1. Create basket reservation via Sanity write client
  2. Call `submitShippingAction` with valid test address
  3. Assert ACCEPT status + corrected address
  4. Call `PATCH /api/basket-reservations/[id]` with corrected address
  5. Query Sanity, assert `shippingAddress` matches
- Uses real Google API, real Sanity (zero mocks)

**Human Verification Checklist (<5 minutes)**
- [ ] Run test: `npx vitest run tests/checkout/integration/address-slice.test.ts`
- [ ] Test passes (or fails with clear message if Google API quota exceeded)

**Minimal Tests**
- This IS the test. One integration test covering the full address slice happy path.

---

## PHASE 4: Continuous Verification

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests (if any)
4. Confirm: "Is this the simplest possible way?"
5. Only then: move to next scope contract

### Verification Order
Scope 1 (dead code) → Scope 2 (security fix) → Scope 3 (PATCH endpoint) → Scope 4 (wire up) → Scope 5 (integration test)

Each scope builds on the previous. Scope 3 must exist before Scope 4 can call it. Scope 5 validates the whole chain.

---

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] Start from `/checkout/shipping` with a valid reservationId in sessionStorage
- [ ] Fill form with `testAddresses.poland`
- [ ] Submit → see loading → redirected to `/checkout/shipping`
- [ ] Query Sanity: reservation doc has `shippingAddress` matching submitted data
- [ ] Verify no hardcoded keys in source
- [ ] Verify no dead `AddressForm.tsx` remains
- [ ] Run E2E test: `npx playwright test tests/checkout/e2e/address-flow.spec.ts`
- [ ] Run integration test: `npx vitest run tests/checkout/integration/address-slice.test.ts`

---

## PHASE 6: Simplicity Guardrails

- **No new state machine library** — extend existing `CheckoutContext` with `useReducer` if needed, or keep the simple `useState` pattern already in place
- **No new abstractions** — `submitShippingAction` already exists, just use it
- **Single PATCH endpoint** — one route, one responsibility
- **Delete, don't fix** — `AddressForm.tsx` is dead code, delete it rather than refactoring it
- **Single source of truth** — `submitShippingAction` is the only Google validation caller

---

## PHASE 7: Scope Lock Rules

- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence

---

## PHASE 8: Post-Sprint /learn

**Trigger:** After final human check

**Action:** Execute `/learn` protocol
- Did removing dead code prevent confusion?
- Did consolidating Google API calls reduce duplication?
- Did the PATCH endpoint enable clean separation?
- Were simplicity guardrails effective?
