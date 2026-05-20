# Sprint: Shipping Slice - Happy Path Only Tracer Implementation (Poland Only)

## Context & Current State

### Implementation Status
**Task 1 (AlleKurier API Endpoint):** ✓ COMPLETED
- `app/api/shipping/rates/route.ts` implements AlleKurier, Packlink, and mock rates
- Accepts basketReservationId and shippingAddress
- Returns ShippingOption[] array

**Schema:** ✓ READY
- `basketReservationType.ts` already has `shippingChoice` field defined
- No schema update required

**Backend API:** ✓ READY
- `app/api/basket-reservations/[id]/route.ts` has PATCH method
- Accepts and saves shippingChoice to reservation

**Address Slice:** ✓ EXISTS
- `app/(store)/checkout/address/page.tsx` handles address validation
- Saves shippingAddress to reservation
- Redirects to `/checkout/shipping`

**Shipping Page:** ⚠ INCOMPLETE
- `app/(store)/checkout/shipping/page.tsx` exists
- Fetches shipping options from API
- Has selection logic and PATCH call
- **MISSING:** Shipping options list UI (lines 185-196 show button but no options rendered)
- **MISSING:** Polish locale formatting for prices

### Objective
User views trustworthy shipping options (Poland only via AlleKurier), selects method, selection saved to basket reservation, redirected to payment page (happy path only).

---

## PHASE 1: UX Flows First

### Current State (Broken)
1. User navigates to `/checkout/shipping` → page loads
2. Page fetches shipping options from API
3. **MISSING:** No shipping options displayed to user
4. User cannot select shipping method
5. Flow stops

### Target State (After Sprint)
1. User navigates to `/checkout/shipping` → sees loading state
2. Loading completes → sees list of shipping options (provider, service, price in zł, delivery estimate)
3. User clicks shipping option → option selected visually (highlighted)
4. User clicks "Continue to Payment" → selection saved via PATCH
5. On success → redirected to `/checkout/payment`
6. Loading/error states displayed appropriately

### End-State Overview
User sees Poland shipping options from AlleKurier API with clear Polish locale pricing (e.g., "15,69 zł"), can select preferred method with visual feedback, and proceeds to payment. Selection is saved to basket reservation. Loading and error states provide clear feedback.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow
```
Event: User navigates to /checkout/shipping
State: Page mounts → get basketReservationId from sessionStorage
Side Effect: POST /api/shipping/rates with basketReservationId
Result Event: Shipping options fetched → display options list

Event: User clicks shipping option
State: Selected option captured → setSelectedOption
Side Effect: Visual highlight of selected option

Event: User clicks "Continue to Payment"
State: Prepare shippingChoice payload
Side Effect: PATCH /api/basket-reservations/[id] with shippingChoice
Result Event: Update success → redirect to /checkout/payment
```

### Events + Payloads
```typescript
// Page mount event
interface ShippingPageMountEvent {
  basketReservationId: string // from sessionStorage
  shippingAddress?: ShippingAddress // from sessionStorage (optional)
}

// Shipping options fetched
interface ShippingOptionsFetchedEvent {
  options: ShippingOption[]
}

// User selection event
interface ShippingSelectionEvent {
  selectedOption: ShippingOption
}

// Continue to payment event
interface ContinueToPaymentEvent {
  basketReservationId: string
  shippingChoice: ShippingChoice
}
```

### Transition Table
| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| Page mounting | basketReservationId found | Loading | POST /api/shipping/rates |
| Page mounting | basketReservationId missing | Redirect to basket | None |
| Loading | API success | Display options | Render options list |
| Loading | API error | Error state | Display error with retry |
| Display options | User clicks option | Option selected | Visual highlight |
| Option selected | User clicks Continue | Submitting | PATCH reservation |
| Submitting | PATCH success | Redirect | Navigate to /checkout/payment |
| Submitting | PATCH error | Error state | Display error |

### Context Shape
```typescript
interface ShippingPageContext {
  basketReservationId: string | null
  shippingOptions: ShippingOption[]
  selectedOption: ShippingOption | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  errorClass: string | null
  retryable: boolean
}
```

---

## PHASE 3: Tiny Scope Contracts

### Scope Contract 1: Add Shipping Options List UI

**UX Slice**
- User sees list of shipping options (provider, service, price in zł, delivery estimate)
- Each option is clickable
- Selected option is visually highlighted

**Architecture Slice**
- Add shipping options list rendering between heading and continue button
- Map over shippingOptions array
- Display provider name, service level name, price (Polish locale), estimated days
- Add click handler to select option
- Add visual highlight class for selected option

**Human Verification Checklist (<5 minutes)**
- [ ] Navigate to /checkout/shipping with valid reservation → see options list
- [ ] Click option → option highlighted
- [ ] Verify prices display in Polish locale (e.g., "15,69 zł")

**Minimal Tests**
- None (UI verification is human-visible)

---

### Scope Contract 2: Polish Locale Price Formatting

**UX Slice**
- Prices display in Polish złoty format (e.g., "15,69 zł" not "15.69 PLN")
- Uses gross prices (Order.gross) for B2C display

**Architecture Slice**
- Create price formatting utility function: `formatPolishPrice(amount: number): string`
- Use `Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })`
- Apply to amount field in shipping options display
- Ensure gross price is used (already implemented in API)

**Human Verification Checklist (<5 minutes)**
- [ ] View shipping options → prices show "15,69 zł" format
- [ ] Verify decimal separator is comma (Polish convention)
- [ ] Verify currency symbol is "zł"

**Minimal Tests**
- Unit test: formatPolishPrice(15.69) → "15,69 zł"
- Unit test: formatPolishPrice(12.5) → "12,50 zł" (zero padding)

---

### Scope Contract 3: Delivery Estimate Formatting

**UX Slice**
- Delivery estimates display in user-friendly format (e.g., "1 dzień roboczy", "2-3 dni robocze")

**Architecture Slice**
- Create delivery estimate formatter: `formatDeliveryEstimate(days: number): string`
- Handle singular: "1 dzień roboczy"
- Handle plural: "X dni robocze"
- Apply to estimatedDays field in shipping options display

**Human Verification Checklist (<5 minutes)**
- [ ] View shipping options → delivery estimates in Polish
- [ ] Verify singular/plural handling

**Minimal Tests**
- Unit test: formatDeliveryEstimate(1) → "1 dzień roboczy"
- Unit test: formatDeliveryEstimate(3) → "3 dni robocze"

---

### Scope Contract 4: Error State Polish Translation

**UX Slice**
- Error messages display in Polish
- Retry button text in Polish
- Back button text in Polish

**Architecture Slice**
- Translate error messages to Polish
- Update button labels to Polish
- Keep error classification for retry logic

**Human Verification Checklist (<5 minutes)**
- [ ] Trigger error (e.g., invalid reservation) → Polish error message
- [ ] Verify retry button shows "Spróbuj ponownie"
- [ ] Verify back button shows "Wróć"

**Minimal Tests**
- None (UI verification is human-visible)

---

### Scope Contract 5: End-to-End Happy Path Verification

**UX Slice**
- Complete flow from address → shipping → payment
- Verify shipping selection persists in reservation

**Architecture Slice**
- No code changes (verification only)
- Manually test complete checkout flow
- Verify shippingChoice saved in Sanity CMS

**Human Verification Checklist (<5 minutes)**
- [ ] Start from basket → checkout → address → enter PL address → submit
- [ ] Redirected to shipping → see AlleKurier options
- [ ] Select option → click "Continue to Payment"
- [ ] Redirected to payment page
- [ ] Check Sanity CMS → shippingChoice saved to reservation

**Minimal Tests**
- E2E test: Complete shipping selection flow (if time permits)

---

## PHASE 4: Continuous Verification

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

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] Navigate from address → shipping → payment
- [ ] Shipping options display correctly (AlleKurier, Poland only)
- [ ] Prices in Polish locale (zł with comma decimal)
- [ ] Delivery estimates in Polish
- [ ] Selection saves to reservation
- [ ] Redirect to payment works
- [ ] Error states in Polish
- [ ] Verify against original UX flows
- [ ] Confirm end-state overview achieved

---

## Simplicity Guardrails

- "Is this the simplest possible way?" - Direct UI rendering, no new components
- No new state management libraries (use existing React hooks)
- No new UI component libraries (use existing Tailwind patterns)
- Minimal abstraction (formatting functions as simple utilities)
- Single-file page component (no component extraction unless necessary)
- Reuse existing Loader component for loading state

---

## Pre-requirements

- [x] AlleKurier API credentials configured (ALLEKURIER_EMAIL, ALLEKURIER_PASSWORD)
- [x] Sender address environment variables configured
- [x] Basket reservation schema has shippingChoice field
- [x] PATCH endpoint for basket reservations exists
- [x] Address slice implemented and working
- [x] Shipping rates API endpoint implemented

**All pre-requirements met.** Ready to implement scope contracts.

---

## Scope Lock Rules (Mandatory)

- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence
- **NO** international shipping (Poland only for this tracer)
- **NO** address validation changes (handled by address slice)
- **NO** payment processing changes (handled by payment slice)
