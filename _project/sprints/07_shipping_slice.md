# Sprint: Shipping Slice

## Context & Investigation Summary

### Critical Finding: Implementation Mismatch
**Current state**: `/checkout/shipping` page implements ADDRESS VALIDATION (Google API), not shipping options selection.

**Documentation requirement**: Shipping slice should display Shippo shipping options for user selection.

**Root cause**: Address slice is not implemented. The current `/checkout/shipping` page is actually the address slice functionality mislabeled as shipping.

### Checkout Flow Verification
1. **Basket** → CheckoutButton → POST `/api/checkout-queue` → saves `basketReservationId` to sessionStorage → redirects to `/checkout`
2. **Checkout Queue** → Creates basket reservation document (basketReservation array, expiresAt) → returns reservationId
3. **Address Slice** (MISSING) → Should validate address via Google API → save `shippingAddress` to reservation → redirect to `/checkout/shipping`
4. **Shipping Slice** (CURRENTLY WRONG) → Should display Shippo options → user selects → save `shippingChoice` → redirect to `/checkout/payment`
5. **Payment Slice** → Stripe checkout → order creation

### Schema Status
- `basketReservation` has: `basketReservation`, `createdAt`, `expiresAt`, `shippingAddress`
- **MISSING**: `shippingChoice` field for selected shipping option

### Session Storage Keys
- `basketReservationId` (set by CheckoutButton - CORRECT)
- `reservationId` (used by checkout layout - INCONSISTENT, should use `basketReservationId`)

### Architectural Constraints (from architecture.md)
- Address Validation & Shipping: Integrate Google Address Validation API BEFORE fetching shipping rates
- Validate address structure and deliverability FIRST
- Fetch real-time shipping rates via provider APIs SECOND
- Ensures every label generated maps to a real, deliverable physical location

---

## UX Flows

### Current State (Broken)
1. User on basket page → clicks checkout → redirected to `/checkout/shipping`
2. `/checkout/shipping` shows address form (Google API validation) - WRONG PAGE
3. User submits address → redirected to `/checkout/shipping/confirmation`
4. User sees confirmed address → clicks "Proceed to Payment" → redirected to `/checkout/payment`
5. **MISSING**: User never sees shipping options or selects shipping method

### Target State (After Sprint)
1. User on basket page → clicks checkout → redirected to `/checkout/address` (NEW)
2. `/checkout/address` shows address form (Google API validation)
3. User submits address → Google API validates → saves `shippingAddress` to reservation → redirected to `/checkout/shipping`
4. `/checkout/shipping` shows shipping options list (provider, service level, price, delivery estimate)
5. User selects shipping option → saves `shippingChoice` to reservation → redirected to `/checkout/payment`

### End-State Overview
User sees shipping options after address validation, can select preferred shipping method with clear pricing and delivery estimates, then proceeds to payment. Address validation happens first (separate page), shipping selection happens second (dedicated page), maintaining clear separation of concerns.

---

## Architecture Contract

### Event-State-Server Flow
```
Event: User navigates to /checkout/shipping
State: Page mounts → get basketReservationId from sessionStorage
Side Effect: Fetch reservation from Sanity CMS → extract shippingAddress
Side Effect: Call Shippo API with address + parcel data
Result Event: Shipping options fetched → display to user

Event: User selects shipping option
State: Selection captured → prepare shippingChoice payload
Side Effect: PATCH basket reservation with shippingChoice
Result Event: Update success → redirect to /checkout/payment
```

### Events + Payloads
```typescript
// Page mount event
interface ShippingPageMountEvent {
  basketReservationId: string // from sessionStorage
}

// Shipping options fetched
interface ShippingOptionsFetchedEvent {
  options: ShippingOption[]
}

// User selection event
interface ShippingSelectionEvent {
  basketReservationId: string
  shippingChoice: ShippingChoice
}

interface ShippingChoice {
  provider: string
  serviceLevel: string
  rateId: string
  amount: number
  currency: string
  estimatedDays: number
}
```

### Transition Table
| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| Page mounting | basketReservationId found | Loading | Fetch reservation |
| Page mounting | basketReservationId missing | Redirect to basket | None |
| Loading | Reservation fetched | Fetching rates | Call Shippo API |
| Loading | Reservation missing shippingAddress | Redirect to address | None |
| Fetching rates | Shippo success | Display options | Render options list |
| Fetching rates | Shippo error | Error state | Display error |
| Display options | User selects option | Updating | PATCH reservation |
| Updating | Update success | Redirect to payment | None |
| Updating | Update error | Error state | Display error |

### Context Shape
```typescript
interface ShippingPageContext {
  basketReservationId: string | null
  shippingAddress: ShippingAddress | null
  shippingOptions: ShippingOption[] | null
  selectedOption: ShippingOption | null
  isLoading: boolean
  error: string | null
}
```

---

## Scope Contracts

### Scope Contract 1: Sanity Schema Update - Add shippingChoice Field

**UX Slice**
- No direct UX impact (backend preparation)

**Architecture Slice**
- Add `shippingChoice` field to `basketReservationType` schema
- Field type: object with provider, serviceLevel, rateId, amount, currency, estimatedDays
- Regenerate Sanity types via typegen

**Human Verification Checklist**
- [ ] Schema updated in `sanity-cms/schemaTypes/basketReservationType.ts`
- [ ] Run typegen command to regenerate `sanity.types.ts`
- [ ] Verify `shippingChoice` appears in generated types

**Minimal Tests**
- None (schema change, verified by type generation)

---

### Scope Contract 2: Create GET /api/shipping/rates Endpoint

**UX Slice**
- No direct UX impact (backend API)

**Architecture Slice**
- Create `app/api/shipping/rates/route.ts`
- Accept `basketReservationId` from query params or body
- Fetch reservation from Sanity CMS
- Extract `shippingAddress` from reservation
- Combine with parcel data (weight, dimensions from config)
- Call Shippo API to fetch rates
- Return `ShippingOption[]` to caller
- Handle errors (missing address, Shippo API failure)

**Human Verification Checklist**
- [ ] Call endpoint with valid basketReservationId → returns shipping options
- [ ] Call endpoint with missing shippingAddress → returns error
- [ ] Call endpoint with invalid reservationId → returns 404

**Minimal Tests**
- Integration test: GET /api/shipping/rates with valid reservation → returns options
- Integration test: GET /api/shipping/rates with missing address → returns error

---

### Scope Contract 3: Update PATCH /api/basket-reservations/[id] to Support shippingChoice

**UX Slice**
- No direct UX impact (backend API)

**Architecture Slice**
- Update existing `app/api/basket-reservations/[id]/route.ts`
- Add PATCH method support
- Accept `shippingChoice` in request body
- Update reservation document with `shippingChoice` field
- Return success confirmation

**Human Verification Checklist**
- [ ] PATCH with valid shippingChoice → document updated
- [ ] Verify shippingChoice saved in Sanity CMS

**Minimal Tests**
- Integration test: PATCH with shippingChoice → updates reservation

---

### Scope Contract 4: Create Shipping Options Display Page

**UX Slice**
- User navigates to `/checkout/shipping` → sees loading state
- Loading completes → sees list of shipping options (provider, service level, price, delivery estimate)
- User clicks option → option selected visually
- User clicks "Continue" → redirected to `/checkout/payment`

**Architecture Slice**
- Create new `app/(store)/checkout/shipping/page.tsx` (replace existing address form)
- Page mount: get `basketReservationId` from sessionStorage
- Fetch reservation from Sanity CMS
- Call GET /api/shipping/rates
- Display loading/error/options states
- Handle user selection
- On selection: call PATCH /api/basket-reservations/[id] with shippingChoice
- On success: redirect to `/checkout/payment`
- Handle missing basketReservationId → redirect to basket
- Handle missing shippingAddress → redirect to `/checkout/address`

**Human Verification Checklist**
- [ ] Navigate to /checkout/shipping with valid reservation → see options
- [ ] Navigate without basketReservationId → redirected to basket
- [ ] Navigate without shippingAddress → redirected to /checkout/address
- [ ] Select option → redirected to payment
- [ ] Verify shippingChoice saved in Sanity CMS

**Minimal Tests**
- E2E test: Complete shipping selection flow
- Integration test: Page renders options from API

---

### Scope Contract 5: Fix Session Storage Key Inconsistency

**UX Slice**
- No direct UX impact (internal consistency)

**Architecture Slice**
- Update `app/(store)/checkout/layout.tsx` to use `basketReservationId` instead of `reservationId`
- Update all references to use consistent key name
- Verify CheckoutButton sets correct key

**Human Verification Checklist**
- [ ] Checkout flow works end-to-end
- [ ] sessionStorage uses consistent key throughout

**Minimal Tests**
- None (internal refactor, verified by E2E flow)

---

## Continuous Verification

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests (if any)
4. Only then: move to next scope contract

### No Big Phases
- No "implement all then test"
- No separate test phases
- No waiting until end for verification

---

## Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] Navigate from basket → address → shipping → payment
- [ ] Address validation works (Google API)
- [ ] Shipping options display (Shippo API)
- [ ] Selection saves to reservation
- [ ] Redirect to payment works
- [ ] Verify against original UX flows
- [ ] Confirm end-state overview achieved

---

## Simplicity Guardrails

- "Is this the simplest possible way?" - Use existing Shippo integration patterns if available
- No new state management libraries (use React hooks)
- No new UI component libraries (use existing Tailwind patterns)
- Minimal abstraction (direct API calls in page component)
- Single-file components where possible

---

## Pre-requirements (from Documentation)

- [ ] Address slice completed (shippingAddress field in basket reservation)
- [ ] Shippo API account and API key configured
- [ ] Company parcel data defined (weight, dimensions)
- [ ] PATCH endpoint for basket reservation updates

**NOTE**: Address slice is NOT currently implemented. This sprint assumes address slice will be implemented separately or as a prerequisite. The current `/checkout/shipping` page (address form) should be moved to `/checkout/address` before implementing this shipping slice sprint.
