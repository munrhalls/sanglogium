# Sprint: Checkout Button Click → Checkout-Queue Integration

**Status:** Ready for execution  
**Date:** 2026-05-08  
**Based on:** Research artifact `_project/research/checkout-button-to-queue-flow-research.md`

---

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** Skipped - No lessons INDEX.md exists in `_project/lessons/`

---

## PHASE 1: UX Flows First

### Step 1: Define All User Interactions

**Current State (Broken):**
1. User is on basket page with items
2. User clicks "Checkout" button
3. System shows loading state
4. System does nothing (button has placeholder basket data)
5. No reservation created, no redirect

**Target State (Working):**
1. User is on basket page with items
2. User clicks "Checkout" button
3. System shows loading state (spinner + "Processing...")
4. System creates basket reservation in Sanity CMS via checkout-queue
5. System saves reservationId to sessionStorage
6. System redirects user to `/checkout` (or `/checkout/shipping` per checkout sprint)
7. System shows error message if checkout fails

### Step 2: End-State Overview

User clicks checkout button on basket page, sees loading state while system atomically reserves stock via checkout-queue, then is redirected to checkout flow with reservation ID persisted in session storage. Error messages display clearly if reservation fails. The entire flow is simple, direct, and uses existing professional backend (route.ts, processor.ts, types.ts).

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow

**Core Pattern:**
```
User Click (Event) → Loading State (Client) → API Call (Server) → Reservation Created (CMS) → Result Event → Redirect/Success State
```

### Three Readable Contracts

#### 1. Events + Payloads

```typescript
// Checkout Click Event
type CheckoutClickEvent = {
  type: 'CHECKOUT_CLICK'
  basketItems: Array<{ productId: string; quantity }>
}

// API Request Payload (matches BasketReservation from lib/queue/types.ts)
type BasketReservationRequest = {
  basketReservation: Array<{
    _id: string
    quantity: number
    price_data: { currency: string; unit_amount: number }
  }>
  createdAt: string
}

// API Response Payload (matches BasketReservationResponse from lib/queue/types.ts)
type BasketReservationResponse = {
  ok: true
  reservationId: string
  ttl: number
  products: Array<{
    id: string
    realPrice: number
    reservedStock: number
    stock: number
  }>
  debug?: {
    priceVerification: Array<{
      productId: string
      verifiedPrice: number
    }>
  }
}
```

#### 2. Transition Table

| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| IDLE | CHECKOUT_CLICK | LOADING | Set isProcessing=true, call API |
| LOADING | API_SUCCESS | SUCCESS | Save reservationId to sessionStorage, redirect |
| LOADING | API_ERROR | ERROR | Set error message, set isProcessing=false |
| ERROR | RETRY_CLICK | LOADING | Set isProcessing=true, clear error, call API |

#### 3. Context Shape

```typescript
type CheckoutButtonContext = {
  // Basket state
  basketItems: Array<{ productId: string; quantity }>
  
  // UI state
  isProcessing: boolean
  error: string | null
  
  // Reservation state
  reservationId: string | null
}
```

### Simplicity Guardrail

**Rule:** "If it can be done with fewer lines or no new abstraction, do it that way"

- Use existing basketStore (no new state management)
- Use existing getProductsByIds (no new data fetching)
- Use existing checkout-queue API (no new backend)
- Direct fetch call in component (no new service layer)
- Simple useState for UI state (no complex state machine)
- Session storage for persistence (no new database)

---

## PHASE 3: Tiny Scope Contracts (MAX 5)

### Scope Contract 1: Connect CheckoutButton to Basket Store

**UX Slice (2-3 bullets max)**
- CheckoutButton receives basket items from basketStore
- CheckoutButton receives product details via getProductsByIds
- Component renders without errors when basket has items

**Architecture Slice**
- Event: Component mounts → reads from basketStore via useBasketStore
- State: basketItems array with productId and quantity
- Side Effect: Fetch product details via getProductsByIds
- Transform: Merge basket quantities with product data (price_data)

**Human Verification Checklist (<5 minutes)**
- [ ] Add item to basket on product page
- [ ] Navigate to basket page
- [ ] Checkout button is enabled (not disabled)
- [ ] No console errors

**Minimal Tests (ONLY if needed for human confidence)**
- Test: CheckoutButton receives basket items from store
- Test: getProductsByIds fetches correct product data

---

### Scope Contract 2: Transform Basket to API Request Format

**UX Slice (2-3 bullets max)**
- Component transforms basket items to BasketReservation format
- Component includes price_data for each item
- Component includes createdAt timestamp
**Architecture Slice**
- Event: User clicks checkout → transform basket to API payload
- State: BasketReservationRequest object
- Side Effect: None (transformation only)
- Validation: Ensure all items have price_data

**Human Verification Checklist (<5 me**_ata
- [ ] Add item to basket
- [ ] Click checkout button
- [ ] Check browser network tab for request payload
- [ ] Verify payload matches BasketReservation format

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Basket transformation produces correct API payload
- Test: Transformation handles items without price_data

---

### Scope Contract 3: Call Checkout-Queue API

**UX Slice (2-3 bullets max)**
- User clicks checkout → button shows loading state
- System POSTs to /api/checkout-queue
- System handles API response (success or error)

**Architecture Slice**
- Event: User clicks checkout → POST to /api/checkout-queue
- State: isProcessing=true during request
- Side Effect: API call to existing checkout-queue endpoint
- Result Event: API success → proceed to Scope Contract 4

**Human Verification Checklist (<5 minutes)**
- [ ] Add item to basket
- [ ] Click checkout button
- [ ] Button shows spinner + "Processing..."
- [ ] Network tab shows POST to /api/checkout-queue
- [ ] Response status is 202 (success) or 400/500 (error)

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Checkout button calls /api/checkout-queue on click
- Test: Loading state shows during API call

---

### Scope Contract 4: Handle API Response (Success Path)

**UX Slice (2-3 bullets max)**
- API returns 202 with reservationId
- System saves reservationId to sessionStorage
- System redirects to /checkout (or /checkout/shipping)

**Architecture Slice**
- Event: API success (202) → save reservationId to sessionStorage
- State: reservationId saved, isProcessing=false
- Side Effect: router.push('/checkout')
- Cleanup: Clear loading state

**Human Verification Checklist (<5 minutes)**
- [ ] Add item to basket
- [ ] Click checkout button
- [ ] Wait for API success
- [ ] Check sessionStorage has basketReservationId
- [ ] Verify redirect to /checkout

**Minimal Tests (ONLY if needed for human confidence)**
- Test: API success saves reservationId to sessionStorage
- Test: API success redirects to /checkout

---

### Scope Contract 5: Handle API Response (Error Path)

**UX Slice (2-3 bullets max)**
- API returns error (400/500)
- System shows error message below button
- Button returns to enabled state

**Architecture Slice**
- Event: API error (400/500) → display error message
- State: error message set, isProcessing=false
- Side Effect: None (display error only)
- Recovery: User can retry by clicking again

**Human Verification Checklist (<5 minutes)**
- [ ] Add item to basket
- [ ] Simulate API error (disable checkout-queue endpoint)
- [ ] Click checkout button
- [ ] Error message displays below button
- [ ] Button returns to enabled state

**Minimal Tests (ONLY if needed for human confidence)**
- Test: API error displays error message
- Test: API error clears loading state

---

## PHASE 4: Continuous Verification (MANDATORY)

### Per Scope Contract Workflow

**For each scope contract:**
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests (if any)
4. Confirm: "Is this the simplest possible way?"
5. Only then: move to next scope contract

**No Big Phases**
- No "implement all then test"
- No separate test phases
- No waiting until end for verification

---

## PHASE 5: Final Human Check

### End-to-End Verification

After all scope contracts:
- [ ] User adds item to basket on product page
- [ ] User navigates to basket page
- [ ] User clicks checkout button
- [ ] Button shows loading state
- [ ] API call to /api/checkout-queue succeeds
- [ ] Reservation ID saved to sessionStorage
- [ ] User redirected to /checkout
- [ ] Sanity CMS has basketReservation document
- [ ] Reserved stock incremented in Sanity
- [ ] Error handling works (simulate API failure)
- Only then is sprint complete

---

## PHASE 6: Simplicity Guardrails

**Questions to ask before each implementation:**
- "Is this the simplest possible way?"
- "Can this be done with fewer lines?"
- "Do we need a new abstraction, or can we use existing code?"
- "Is this test serving human confidence, or just coverage?"

**Rules:**
- Use existing basketStore (no new state management)
- Use existing getProductsByIds (no new data fetching)
- Use existing checkout-queue API (no new backend)
- Direct fetch call in component (no new service layer)
- Simple useState for UI state (no complex state machine)
- Session storage for persistence (no new database)

---

## PHASE 7: Execution Protocol

### Per Scope Contract

1. **Implement scope contract** (minimal code to pass)
2. **Run human verification checklist** IMMEDIATELY
3. **Run minimal tests** (if any)
4. **Confirm simplicity:** "Is this the simplest possible way?"
5. **Only then:** move to next scope contract

### Delegation Commands
- **Implementation:** `/implement [scope contract description]`
- **Verification:** Human checklist + minimal tests
- **Final Check:** End-to-end verification against UX flows

---

## PHASE 8: Post-Sprint /learn (MANDATORY)

**Trigger:** After final human check

**Action:** Execute `/learn` protocol
- Extract lessons from sprint experience
- Did human-first approach prevent over-complication?
- Did continuous verification catch issues early?
- Were simplicity guardrails effective?
- Did test-first approach prevent false positives?

---

## Constraint Rules

- **NO** starting from code or architecture
- **NO** big phases or end-only verification
- **NO** unit/integration/e2e test splits
- **NO** tests that exceed human readability
- **YES** UX flows first always
- **YES** tiny scope contracts only
- **YES** human verification after each scope
- **YES** "Is this the simplest possible way?" check

---

## Integration Map

| Phase | Output | When |
|-------|--------|------|
| UX Flows | User interaction list | Start |
| Architecture | Event-state contracts | Before code |
| Scope Contract | Implementation | Per contract |
| Verification | Human checklist | After each scope |
| Final Check | End-to-end confirmation | End |
| Learnings | /learn execution | After final check |

---

## Fatal Flaws This Prevents

1. **Over-complication** - Simplicity guardrails
2. **No human verification** - Continuous checkpoints
3. **Vague architecture** - Explicit contracts
4. **Cargo cult testing** - Tests serve human confidence
5. **Big verification windows** - Verify after each scope
6. **Starting from code** - UX flows first
7. **False positives** - Test-first with failing tests first
