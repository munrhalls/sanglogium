# Sprint: Shipping Page - Iron Session Happy Path Tracer

**Happy path tracer only.**

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` found. Skipping lesson retrieval.

---

## PHASE 1: UX Flows First

### Current State (Address Page Complete)
1. User navigates to `/checkout/address` → sees address form
2. User fills address → submits → Google Address Validation
3. On validation success → address saved to iron-session
4. Redirected to `/checkout/shipping`

### Target State (After Sprint)
1. User navigates to `/checkout/shipping` → page loads with session.address
2. Server reads session.address → fetches parcel data from Sanity → calls AlleKurier API
3. User sees list of shipping options (provider, service, price in zł, delivery estimate)
4. User clicks shipping option → option selected visually (radio button)
5. User clicks "Continue to Payment" → form submits shippingCode to Server Action
6. Server Action rebuilds payload (basket IDs → Sanity → parcel dimensions) → calls AlleKurier API server-side
7. Server Action filters response for selected shippingCode → fetches exact price
8. Server Action saves BOTH shippingCode AND shippingCost to iron-session
9. Redirected to `/checkout/payment`

### End-State Overview
User sees Poland shipping options from AlleKurier API with clear Polish locale pricing, selects preferred method with radio button, and proceeds to payment. Server Action rebuilds the complete payload server-side (preventing tampering), fetches exact price, and saves both shippingCode and shippingCost to encrypted iron-session cookie. Guard prevents access without address.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow
```
Event: User navigates to /checkout/shipping
State: Server Component reads iron-session → check session.address exists
Side Effect: If missing → redirect to /checkout/address
Result Event: If present → fetch parcel data from Sanity → call AlleKurier API

Event: AlleKurier API returns rates
State: Server Component transforms response to shipping options
Side Effect: Render radio button form with options

Event: User selects shipping option and submits form
State: Server Action receives shippingCode (e.g., "dpd_dpd_classic")
Side Effect: Rebuild payload (basket IDs → Sanity → parcel dimensions) → call AlleKurier API server-side
Result Event: Filter response for shippingCode → convert price to cents → save session.shippingCode + session.shippingCost → redirect to /checkout/payment
```

### Events + Payloads
```typescript
// Page mount event (Server Component)
interface ShippingPageMountEvent {
  session: {
    basket: Array<{ id: string; quantity: number }>
    address: Address
  }
}

// Sanity fetch (Server Component)
interface SanityFetchEvent {
  basketIds: string[]
}

// AlleKurier API call (Server Component)
interface AlleKurierAPIRequest {
  fromCountry: 'PL'
  fromZip: string // sender address from env
  toCountry: 'PL'
  toZip: string // from session.address
  packages: Array<{ weight: number; width: number; height: number; length: number }>
}

// Shipping options fetched (Server Component)
interface ShippingOptionsFetchedEvent {
  options: Array<{
    provider: string
    servicelevel: { name: string }
    rateId: string // shippingCode
    amount: number
    currency: 'PLN'
    estimatedDays: number
  }>
}

// User selection event (Server Action)
interface ShippingSelectionEvent {
  shippingCode: string // e.g., "dpd_dpd_classic"
}

// Server Action payload rebuild
interface ServerActionPayloadRebuild {
  basketIds: string[]
  address: Address
}

// Server Action price fetch
interface ServerActionPriceFetch {
  shippingCode: string
  fullPayload: AlleKurierAPIRequest
}

// Session update (Server Action)
interface SessionUpdateEvent {
  shippingCode: string
  shippingCost: number // in cents
}
```

### Transition Table
| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| Page mounting | session.address missing | Redirect | redirect("/checkout/address") |
| Page mounting | session.address present | Fetch parcel data | Sanity query for basket items |
| Parcel data fetched | Sanity success | Call AlleKurier API | fetchAlleKurierRates() |
| AlleKurier API call | API success | Display options | Render radio button form |
| Display options | User submits form | Server Action | saveShippingAction(formData) |
| Server Action | shippingCode received | Rebuild payload | Sanity fetch + parcel extraction |
| Server Action | Payload rebuilt | Fetch price server-side | AlleKurier API call with full payload |
| Server Action | Price fetched | Filter & save | Filter for shippingCode → session.shippingCode + session.shippingCost |
| Server Action | Session saved | Redirect | redirect("/checkout/payment") |

### Context Shape
```typescript
interface IronSessionState {
  basket: Array<{ id: string; quantity: number }>
  address: Address
  shippingCode?: string
  shippingCost?: number // in cents
}

interface ShippingPageServerContext {
  session: IronSessionState
  shippingOptions: ShippingOption[]
  senderAddress: { postalCode: string } // from env
}
```

---

## PHASE 3: Tiny Scope Contracts

### Scope Contract 1: Infrastructure Verification

**UX Slice**
- No user-visible changes (verification only)

**Architecture Slice**
- Verify `lib/session.ts` exists and is configured
- Verify session type includes address field
- Confirm address page successfully writes to session
- Verify `lib/shipping/allekurier-rates.ts` exists
- Verify `fetchAlleKurierRates` function signature
- Check environment variables: ALLEKURIER_EMAIL, ALLEKURIER_PASSWORD

**Human Verification Checklist (<5 minutes)**
- [ ] Check `lib/session.ts` exists
- [ ] Verify session type has `address` field
- [ ] Navigate to address page → submit form → check server logs for session.address
- [ ] Check `lib/shipping/allekurier-rates.ts` exists
- [ ] Run verification script: `node scripts/verify-allekurier-integration.mjs`

**Minimal Tests**
- None (manual verification)

---

### Scope Contract 2: Shipping Page Route Structure with Guard

**UX Slice**
- User navigates to `/checkout/shipping` → page loads if session.address exists
- User navigates to `/checkout/shipping` without address → redirected to `/checkout/address`

**Architecture Slice**
- Create directory: `app/(store)/checkout/shipping/`
- Create `page.tsx` as React Server Component
- Import session utility from `lib/session.ts`
- Read session at page load
- Check if `session.address` exists
- If missing, execute `redirect("/checkout/address")`
- Set up basic page structure with heading

**Human Verification Checklist (<5 minutes)**
- [ ] Navigate to `/checkout/shipping` with valid session → page loads
- [ ] Navigate to `/checkout/shipping` without session → redirected to address
- [ ] Check server logs confirm session.address was read

**Minimal Tests**
- None (manual verification)

---

### Scope Contract 3: Server Component Data Pipeline (Sanity + AlleKurier)

**UX Slice**
- User sees list of shipping options (provider, service, price in zł, delivery estimate)
- Loading state while API call in progress
- Error state if API call fails

**Architecture Slice**
- Read basket IDs from session
- Fetch product documents from Sanity
- Extract parcel dimensions (weight, width, height, length)
- Aggregate total parcel data for API call
- Import `fetchAlleKurierRates` from `lib/shipping/allekurier-rates.ts`
- Prepare API input: fromCountry (PL), fromZip (sender), toCountry (PL), toZip (session.address), packages (from Sanity)
- Call AlleKurier API
- Transform response to shipping options format using `transformAlleKurierToShippingOption`
- Display options to user with rateId (shippingCode) for form submission

**Human Verification Checklist (<5 minutes)**
- [ ] Navigate to `/checkout/shipping` with valid session → see shipping options
- [ ] Verify options show provider name, service name, price, delivery days
- [ ] Verify prices are in Polish locale (e.g., "15,69 zł")
- [ ] Check server logs confirm Sanity fetch (basket IDs, product documents, parcel dimensions)
- [ ] Check server logs confirm AlleKurier API was called

**Minimal Tests**
- None (manual verification)

---

### Scope Contract 4: Shipping Options Form UI

**UX Slice**
- User sees radio buttons for each shipping option
- User clicks option → option selected visually
- User clicks "Continue to Payment" → form submits

**Architecture Slice**
- Create form with radio buttons for each shipping option
- Display: Carrier name, Service name, Price (PLN), Delivery days
- Add "Continue to Payment" button
- Submit form to Server Action with selected rateId

**Human Verification Checklist (<5 minutes)**
- [ ] Click shipping option → option highlighted
- [ ] Click "Continue to Payment" → form submits
- [ ] Check server logs show form submission with shippingCode only (no price)

**Minimal Tests**
- None (manual verification)

---

### Scope Contract 5: Server Action (Payload Rebuild + Price Fetch + Session Save + Redirect)

**UX Slice**
- User clicks "Continue to Payment" → redirected to `/checkout/payment`

**Architecture Slice**
- Create `saveShippingAction(formData)` in `app/actions/checkout.ts`
- Extract rateId from FormData
- Read basket IDs from session
- Fetch product documents from Sanity
- Extract parcel dimensions (weight, width, height, length)
- Call AlleKurier API server-side with full payload (shippingCode + session.address + packages)
- Filter response for selected shippingCode
- Convert price to integer (cents)
- Save BOTH `session.shippingCode = rateId` AND `session.shippingCost = priceInCents`
- Execute `redirect("/checkout/payment")`
- Create blank `/checkout/payment/page.tsx` as checkpoint
- Read session and log to console: `{ basket, address, shippingCode, shippingCost }`

**Human Verification Checklist (<5 minutes)**
- [ ] Select shipping option → click "Continue to Payment"
- [ ] Verify redirect to `/checkout/payment`
- [ ] Check server logs confirm payload rebuild (basket IDs → Sanity → parcel dimensions)
- [ ] Check server logs confirm AlleKurier API called server-side with full payload
- [ ] Check server logs confirm response filtered for selected shippingCode
- [ ] Check server logs confirm session.shippingCode and session.shippingCost saved
- [ ] Check server logs on payment page confirm session contains { basket, address, shippingCode, shippingCost }
- [ ] Verify shippingCost is in cents (integer)

**Minimal Tests**
- None (manual verification)

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
- [ ] Start from basket → checkout → address → enter PL address → submit
- [ ] Redirected to shipping → see AlleKurier options
- [ ] Select option → click "Continue to Payment"
- [ ] Redirected to payment page
- [ ] Check server logs → session contains { basket, address, shippingCode, shippingCost }
- [ ] Verify shippingCost was fetched server-side (security check)
- [ ] Verify against original UX flows
- [ ] Confirm end-state overview achieved

---

## Simplicity Guardrails

- "Is this the simplest possible way?" - Direct Server Component rendering, no new components
- No new state management libraries (use iron-session only)
- No new UI component libraries (use existing Tailwind patterns)
- Minimal abstraction (use existing AlleKurier wrapper)
- Single-file page component (no component extraction unless necessary)
- Server Actions for mutations (no API routes)
- Native HTML forms (no React Form libraries)

---

## Pre-requirements

- [ ] AlleKurier API credentials configured (ALLEKURIER_EMAIL, ALLEKURIER_PASSWORD)
- [ ] Sender address environment variables configured
- [ ] Iron-session configured (lib/session.ts)
- [ ] Address slice implemented and working
- [ ] Sanity CMS has product documents with parcel data

**Status:** Pre-requirements verification needed (Scope Contract 1)

---

## Scope Lock Rules (Mandatory)

- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence
- **NO** international shipping (Poland only for this tracer)
- **NO** address validation changes (handled by address slice)
- **NO** payment processing changes (handled by payment slice)
- **NO** client-side price submission (security critical)
- **NO** saving price from client (must fetch server-side)
- **NO** skipping Sanity fetch in Server Action (must rebuild payload)
