# Sprint: Address Page Iron-Session Integration (HAPPY PATH ONLY)

**Scope:** Happy path tracer only. Error handling and edge cases are out of scope.

## PRIMARY SOURCE OF TRUTH
Based on: `docs/checkout/address/framed-objective.md`
This is the latest, primary source of truth. Any unaligned documentation is legacy and should be dismissed.

---

## PHASE 1: UX Flows First

### Current State User Interactions
1. User navigates to /checkout/address from basket page
2. User fills address form (regionCode, postalCode, street, streetNumber, city)
3. User clicks "Continue to Shipping"
4. System validates address via Google Address Validation API
5. System shows loading state during validation
6. System shows error if validation fails (FIX status)
7. System redirects to /checkout/shipping if validation succeeds (ACCEPT status)

### End-State Overview
The address page integration with iron-session provides a seamless checkout experience where user address data persists securely across page redirects. Users continue to fill the same address form with Google validation, but now their validated address is stored in an encrypted session cookie that survives the redirect to the shipping page. The shipping page can read both basket and address data from the session, enabling proper shipping rate calculation. No visible changes to the user interface - the improvement is entirely in the data persistence layer.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow
```
Event: User submits address form
  ↓
State Update: Google API validates address (ACCEPT/FIX)
  ↓
Side Effect: If ACCEPT, save address to iron-session cookie
  ↓
Result Event: Redirect to /checkout/shipping
  ↓
New State: Session contains { basket, address }
```

### Three Readable Contracts

#### 1. Events + Payloads
```typescript
// Form submission event
AddressFormSubmit {
  regionCode: string
  postalCode: string
  street: string
  streetNumber: string
  city: string
}

// Google validation response (existing)
GoogleValidationResponse {
  status: "ACCEPT" | "FIX"
  address?: Address
  errors?: { message: string }
}

// Session state
SessionState {
  basket: Array<{ id: string; quantity: number }>
  address?: Address
}
```

#### 2. Transition Table
| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| Session has basket | Form submit + ACCEPT | Session has { basket, address } | Save to cookie, redirect |
| Session has basket | Form submit + FIX | Session has basket | Show error to user |
| Session missing | Page load | Redirect to basket | Guard check |

#### 3. Context Shape
```typescript
// Session data carried across pages
interface CheckoutSession {
  basket: Array<{ id: string; quantity: number }>
  address?: {
    regionCode: string
    postalCode: string
    street: string
    streetNumber: string
    city: string
  }
  shippingCode?: string  // Invalidated on address change
  shippingCost?: number // Invalidated on address change
}
```

### Simplicity Guardrail
"If it can be done with fewer lines or no new abstraction, do it that way"
- Use existing Google validation (submitShippingAction)
- Modify existing form submission flow
- No new UI components, no new state management
- Single Server Action to bridge validation and session save

---

## PHASE 3: Tiny Scope Contracts

### Scope Contract 1: Session Guard on Address Page

#### UX Slice
- User navigates to /checkout/address
- System checks if session.basket exists
- If missing, user is redirected to basket page
- If present, user sees address form

#### Architecture Slice
- Plug into: page.tsx (Server Component)
- Event: Page load
- State: Session read
- Affects: Redirect decision

#### Human Verification Checklist (<5 minutes)
- [ ] Clear session cookie (or use incognito)
- [ ] Navigate directly to /checkout/address
- [ ] Verify redirect to basket page occurs
- [ ] Add item to basket, navigate to address
- [ ] Verify address form loads (no redirect)

#### Minimal Tests
- None needed (human verification sufficient)

---

### Scope Contract 2: Google Validation Integration

#### UX Slice
- User fills address form with valid data
- User clicks "Continue to Shipping"
- System shows loading state
- System validates via Google API
- System shows error if validation fails

#### Architecture Slice
- Plug into: Existing submitShippingAction in actions/address/address.ts
- Event: Form submit
- State: Google API call
- Affects: ACCEPT/FIX status

#### Human Verification Checklist (<5 minutes)
- [ ] Fill valid Polish address (Wrocław, Rynek 1, 50-101)
- [ ] Submit form
- [ ] Verify loading state appears
- [ ] Verify ACCEPT status (no error shown)
- [ ] Fill invalid address
- [ ] Submit form
- [ ] Verify error message appears

#### Minimal Tests
- None needed (Google API already tested, integration verified manually)

---

### Scope Contract 3: Session Save on Valid Address

#### UX Slice
- User submits valid address
- System validates successfully (ACCEPT)
- System saves address to session
- User sees no visible change (internal operation)

#### Architecture Slice
- Plug into: New/modified Server Action
- Event: Google validation returns ACCEPT
- State: Session mutation
- Affects: Session now contains { basket, address }
- Cascade invalidation: Delete shippingCode, shippingCost

#### Human Verification Checklist (<5 minutes)
- [ ] Fill valid address, submit
- [ ] Check server console logs for session.address
- [ ] Verify session contains both basket and address
- [ ] Verify shippingCode/shippingCost are deleted (if present)

#### Minimal Tests
- None needed (server logs provide verification)

---

### Scope Contract 4: Redirect to Shipping Page

#### UX Slice
- User submits valid address
- System saves to session
- System redirects to /checkout/shipping
- User sees shipping page

#### Architecture Slice
- Plug into: Server Action (after session save)
- Event: Session save complete
- State: Redirect
- Affects: Navigation to shipping page

#### Human Verification Checklist (<5 minutes)
- [ ] Fill valid address, submit
- [ ] Verify browser redirects to /checkout/shipping
- [ ] Verify URL is correct
- [ ] Verify no errors in console

#### Minimal Tests
- None needed (browser behavior is observable)

---

### Scope Contract 5: Session Persistence Verification

#### UX Slice
- User is on shipping page
- System reads session
- System has access to basket and address data
- User can proceed with shipping selection

#### Architecture Slice
- Plug into: Existing /checkout/shipping/page.tsx
- Event: Page load
- State: Session read
- Affects: Shipping page can access address data

#### Human Verification Checklist (<5 minutes)
- [ ] Complete address submission
- [ ] Arrive at shipping page
- [ ] Check server console logs
- [ ] Verify session.basket is present
- [ ] Verify session.address is present
- [ ] Verify both contain correct data

#### Minimal Tests
- None needed (server logs provide verification)

---

## PHASE 4: Continuous Verification

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Only then: move to next scope contract

### No Big Phases
- No "implement all then test"
- No separate test phases
- No waiting until end for verification

---

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] Start from basket page with items
- [ ] Click checkout, navigate to address
- [ ] Fill valid address, submit
- [ ] Verify redirect to shipping
- [ ] Verify shipping page can read session data
- [ ] Verify session contains { basket, address }
- [ ] Verify Google validation worked (no errors)
- [ ] Confirm end-state overview achieved

---

## PHASE 6: Simplicity Guardrails

### "Is this the simplest possible way?" Check
- Uses existing Google validation (no reimplementation)
- Uses existing address form (no UI changes)
- Uses existing shipping page (no new page)
- Single Server Action to bridge validation and session
- No new state management libraries
- No new API calls
- Minimal code changes

### Scope Lock Rules (Mandatory)
- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence

---

## PHASE 7: Execution Protocol

### Per Scope Contract
```
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Confirm: "Is this the simplest possible way?"
4. Only then: move to next scope contract
```

### Delegation Commands
- **Implementation:** `/implement [scope contract description]`
- **Verification:** Human checklist
- **Final Check:** End-to-end verification against UX flows

