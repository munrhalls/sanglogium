# Address Page — Exact Code Status Report

## 1. Page Entry Point
**File:** `app/checkout/address/page.tsx` (Server Component)

- Reads `checkoutSession` via `getCheckoutSession()` (iron-session cookie)
- **Guard:** Redirects to `/basket` if `session.basket` is missing or empty
- Passes `traceId` (`session.checkoutSessionId`) and `initialAddress` (`session.address`) to `AddressForm`

## 2. Address Form UI
**File:** `app/checkout/address/AddressForm.tsx` (Client Component, `"use client"`)

- Renders `CheckoutStepper` with `currentStep={1}`
- Form fields: `firstName`, `lastName`, `phone`, `regionCode` (select: PL/GB), `city`, `street`, `streetNumber`, `postalCode`
- **Hydration:** `useEffect` pre-fills form from `initialAddress` when user returns via Back button
- **Submit:** `handleSubmit` extracts values from `FormData`, calls `saveAddress(addressData)` (server action imported from `@/app/actions/checkout`)
- **Trace:** Fire-and-forget POST to `/api/trace` with `traceId` + form data
- **Error handling:** Displays error if `result.status === "FIX"`; re-throws `NEXT_REDIRECT` errors (Next.js navigation)
- Loading state shows `<Loader message="Verifying address..." />`

## 3. Save Address Server Action
**File:** `app/actions/checkout/index.ts` — `saveAddress(address)`

- Reads session; guards redirect to `/basket` if no basket
- Calls `submitShippingAction(address)` → Google Address Validation API
- **On ACCEPT:** Saves validated address to `session.address`, **cascade-invalidates** downstream fields (`shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays` = `undefined`), saves session, redirects to `/checkout/shipping`
- **On FIX:** Logs validation failure, returns result to client (error displayed)
- Checkout events logged via `logCheckoutEvent` at every step

## 4. Google Address Validation
**File:** `app/actions/address/address.ts` — `submitShippingAction(input)`

- Calls `https://addressvalidation.googleapis.com/v1:validateAddress?key=...`
- Payload: `regionCode`, `postalCode`, `locality`, `addressLines` (street + number)
- **Acceptance criteria:** `addressComplete === true`, no inferred components, `inputGranularity` and `validationGranularity` in `{PREMISE, SUB_PREMISE}`
- **On ACCEPT:** Returns cleaned address (mapped from Google components: `route`, `street_number`, `subpremise`, `locality`/`postal_town`, `postal_code`, `regionCode`) + geocode + placeId
- **On FIX / error:** Returns `{status: "FIX", errors: {message}}` with contextual error messages (400/401/service unavailable)

## 5. Session Layer
**File:** `lib/session.ts`

- `getCheckoutSession()` → iron-session cookie named `checkout_session`, maxAge 1 hour, httpOnly, lax, secure in production
- Session shape: `basket`, `address`, `email`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `paymentIntentId`, `completedPaymentIntentId`, `checkoutSessionId`

## 6. Checkout Layout
**File:** `app/checkout/layout.tsx`

- Wraps children in `CheckoutProvider` + minimal header (`BrandLogo`)
- Montserrat font, dark theme (`bg-brand-800`, `text-brand-100`)
- Centers content in `max-w-4xl`

## 7. Checkout Stepper
**File:** `app/checkout/_components/CheckoutStepper.tsx` (Client Component)

- 4 steps: Basket → Address → Shipping → Payment
- Visual: Phosphor icons + labels (hidden on mobile), colored by state (active/passed/pending)
- `aria-label="Checkout progress"`, `aria-current="step"` on active step

## 8. Trace API (Fire-and-Forget)
**File:** `app/api/trace/route.ts`

- POST endpoint; logs checkout events via `logCheckoutEvent`
- Called from `AddressForm.tsx` on submit; `.catch(() => {})` — never blocks submission

## 9. Basket Reservation PATCH
**File:** `app/api/basket-reservations/[id]/route.ts`

- `PATCH` accepts `{shippingChoice?, shippingAddress?}`; patches Sanity `basketReservation` doc
- Used by E2E test to persist address; **NOT called by production address page code** (production uses iron-session only)

## 10. Tests

### Integration (`tests/checkout/integration/address-slice.test.ts`)
- Calls `submitShippingAction(testAddresses.poland)` directly
- Asserts `ACCEPT` + corrected address shape
- Calls PATCH endpoint, verifies Sanity doc updated

### E2E (`tests/checkout/e2e/address-flow.spec.ts`)
- Full browser flow: seeds Sanity reservation → injects `reservationId` into sessionStorage → navigates to `/checkout/address` → fills form → clicks "Continue to Shipping" → waits for PATCH call → asserts navigation to `/checkout/shipping` → polls Sanity for `shippingAddress`

## 11. Complete Call Chain (Address Submit)

```
User clicks "Continue to Shipping"
  → AddressForm.handleSubmit (Client)
    → POST /api/trace (fire-and-forget)
    → saveAddress(addressData) (Server Action)
      → getCheckoutSession()
      → submitShippingAction(address) → Google Address Validation API
      → session.address = validatedAddress
      → session.shippingCode/Cost/... = undefined (cascade invalidation)
      → session.save()
      → redirect("/checkout/shipping")
```

## 12. Data Types
**File:** `app/checkout/checkout.types.ts`

```ts
Address = { firstName, lastName, phone, regionCode, postalCode, street, streetNumber, city }
ServerResponse = { status: "LOADING"|"FIX"|"CONFIRM"|"ACCEPT", address?, geocode?, placeId?, errors? }
```

## 13. Key Design Decisions

- **Funnel guard:** No basket → redirect to `/basket`
- **Cascade invalidation:** Address edit clears all downstream shipping data
- **Back-button safe:** `initialAddress` hydrates form from session
- **Never block on trace:** Fire-and-forget with empty catch
- **Never intercept redirects:** `NEXT_REDIRECT` re-thrown for Next.js to handle
