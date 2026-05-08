# Checkout Sprint - 7-Step Flow

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** Skipped - No lessons INDEX.md exists in `_project/lessons/`

---

## PHASE 1: UX Flows First

### Step 1: Define All User Interactions

**Current State (Basket complete):**
1. User is on basket page with items
2. User clicks "Checkout" button
3. System triggers queue operation
4. User is redirected to address page

**Target State (7-step checkout flow):**

1. **Basket → Checkout Initiation**
   - User clicks "Checkout" button on basket page
   - System shows loading state (queue processing)
   - System creates checkout reservation document in Sanity CMS
   - System saves basket reservation ID to session storage
   - System redirects user to `/checkout/shipping` (address page)

2. **Address Page → Address Verification**
   - User fills in address details (name, street, city, postal code, country)
   - User clicks "Continue" or "Verify Address"
   - System calls Google API to verify address
   - System shows verified address back to user
   - User confirms address is correct
   - System saves verified address to reservation document
   - System redirects user to `/checkout/shipping-options` (shipping page)

3. **Shipping Options Page → Rate Fetching**
   - System combines user address with company data (origin address)
   - System combines with parcel data (weight, dimensions from products)
   - System calls Shippo API to fetch shipping options and rates
   - System displays shipping options to user (carrier, service, price, delivery estimate)
   - User selects shipping option
   - User clicks "Continue"
   - System saves chosen shipping data to reservation document
   - System redirects user to `/checkout/payment` (payment page)

4. **Payment Page → Payment Processing**
   - System displays Stripe Elements payment form
   - User sees billing address section
   - User can check "Same as shipping address" checkbox
   - Or user fills in different billing address
   - User enters payment details (card number, expiry, CVC)
   - User clicks "Pay Now" or "Complete Order"
   - System processes payment via Stripe
   - System uses reservation document to create final order

5. **Order Creation → Stock Update**
   - System creates order in Sanity CMS
   - System updates real product stock using reservedStock values from reservation
   - System deletes reservation document (cleanup)
   - System generates order confirmation

6. **Return/Success Page → Order Display**
   - User lands on `/checkout/success` page
   - System displays order details (order ID, items, shipping, total)
   - System shows clean success message
   - User can view order details
   - User can continue shopping (link back to store)

7. **Error Handling (All Steps)**
   - If any step fails, system shows clear error message
   - User can retry the failed step
   - Reservation persists for retry (TTL-based cleanup)

### Step 2: End-State Overview

**One Paragraph:**
The user experiences a seamless 7-step checkout flow starting from the basket page. After clicking checkout, they enter their address which is verified by Google API, then select from real-time shipping rates fetched via Shippo API based on their location and order contents. On the payment page, they use Stripe Elements with optional billing address matching, and after payment confirmation, the system atomically updates stock from their reserved quantities and displays a clean success page with their complete order details. The entire flow maintains state via a checkout reservation document in Sanity CMS with session storage persistence, ensuring reliability even if the user navigates away or refreshes.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow

**Core Pattern:**
```
User Action (Event) → State Update (Client) → Server Action (Side Effect) → Result Event → New State
```

### Three Readable Contracts

#### 1. Events + Payloads

```typescript
// Checkout Initiation
type CheckoutInitEvent = {
  type: 'CHECKOUT_INIT'
  basketId: string
}

// Address Verification
type AddressVerifyEvent = {
  type: 'ADDRESS_VERIFY'
  address: Address
}

// Address Confirm
type AddressConfirmEvent = {
  type: 'ADDRESS_CONFIRM'
  verifiedAddress: VerifiedAddress
}

// Shipping Option Select
type ShippingSelectEvent = {
  type: 'SHIPPING_SELECT'
  shippingOption: ShippingOption
}

// Payment Submit
type PaymentSubmitEvent = {
  type: 'PAYMENT_SUBMIT'
  paymentMethod: PaymentMethod
  billingAddress?: Address
  useShippingAddress: boolean
}

// Order Complete
type OrderCompleteEvent = {
  type: 'ORDER_COMPLETE'
  orderId: string
}
```

#### 2. Transition Table

| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| IDLE | CHECKOUT_INIT | CREATING_RESERVATION | Call queue API |
| CREATING_RESERVATION | RESERVATION_CREATED | ADDRESS_ENTRY | Save to session, redirect |
| ADDRESS_ENTRY | ADDRESS_VERIFY | VERIFYING_ADDRESS | Call Google API |
| VERIFYING_ADDRESS | ADDRESS_CONFIRMED | SHIPPING_SELECTION | Save to reservation, redirect |
| SHIPPING_SELECTION | SHIPPING_SELECT | PAYMENT_ENTRY | Save to reservation, redirect |
| PAYMENT_ENTRY | PAYMENT_SUBMIT | PROCESSING_PAYMENT | Call Stripe, create order |
| PROCESSING_PAYMENT | ORDER_COMPLETE | SUCCESS | Update stock, delete reservation, redirect |
| [Any] | ERROR | ERROR_STATE | Show error, allow retry |

#### 3. Context Shape

```typescript
type CheckoutContext = {
  // Reservation ID (from session storage)
  reservationId: string | null
  
  // Current step
  currentStep: 'address' | 'shipping' | 'payment' | 'success' | 'error'
  
  // Address data
  address: Address | null
  verifiedAddress: VerifiedAddress | null
  
  // Shipping data
  shippingOptions: ShippingOption[] | null
  selectedShipping: ShippingOption | null
  
  // Payment data
  paymentMethod: PaymentMethod | null
  billingAddress: Address | null
  
  // Order data
  orderId: string | null
  
  // Error state
  error: Error | null
}
```

### Simplicity Guardrail

**Rule:** "If it can be done with fewer lines or no new abstraction, do it that way"

- Use existing Sanity CMS for reservation storage (no new database)
- Use existing session storage for client-side persistence (no new state library)
- Use existing Stripe integration (no new payment abstraction)
- Use existing queue system for atomic reservation (no new concurrency primitive)
- One reservation document type in Sanity (no complex document hierarchy)
- Direct API calls from server actions (no new service layer unless needed)

---

## PHASE 3: Tiny Scope Contracts (MAX 5)

### Scope Contract 1: Checkout Queue & Reservation Creation

**UX Slice (2-3 bullets max)**
- User clicks "Checkout" button on basket page → system shows loading → user redirected to address page
- System creates reservation document with basket items and reserved stock
- Session storage stores reservation ID for persistence

**Architecture Slice**
- Event: `CHECKOUT_INIT` from basket page
- Server action: Atomic reservation operation (queue-based)
- State: Save `reservationId` to session storage
- Side effect: Create Sanity document of type `checkoutReservation`
- Redirect: `/checkout/shipping` on success

**Human Verification Checklist (<5 minutes)**
- [ ] Click checkout on basket page, see loading state
- [ ] Verify redirect to `/checkout/shipping`
- [ ] Check session storage has `reservationId`
- [ ] Verify Sanity has new `checkoutReservation` document with basket items

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Checkout button click triggers queue operation and creates reservation
- Test: Reservation document contains correct basket items and reserved stock
- Test: Session storage stores reservation ID

---

### Scope Contract 2: Address Page & Google Verification

**UX Slice (2-3 bullets max)**
- User fills address form → clicks "Verify Address" → system shows verified address
- User confirms address → system saves to reservation → redirects to shipping page
- Error shown if verification fails, user can retry

**Architecture Slice**
- Event: `ADDRESS_VERIFY` → call Google Places API
- Event: `ADDRESS_CONFIRM` → update reservation document
- State: Store `verifiedAddress` in reservation
- Redirect: `/checkout/shipping-options` on confirm

**Human Verification Checklist (<5 minutes)**
- [ ] Fill address form, click verify, see verified address
- [ ] Confirm address, verify redirect to shipping page
- [ ] Check reservation document has verified address
- [ ] Test invalid address shows error

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Address form calls Google API and returns verified address
- Test: Confirm saves to reservation and redirects
- Test: Invalid address shows error message

---

### Scope Contract 3: Shipping Options & Shippo Integration

**UX Slice (2-3 bullets max)**
- User lands on shipping page → system shows loading → displays shipping options with rates
- User selects option → clicks "Continue" → saves to reservation → redirects to payment
- Options show carrier, service, price, delivery estimate

**Architecture Slice**
- Page load: Combine address + company origin + parcel data → call Shippo API
- Event: `SHIPPING_SELECT` → update reservation with selected option
- State: Store `shippingOptions` and `selectedShipping` in reservation
- Redirect: `/checkout/payment` on selection

**Human Verification Checklist (<5 minutes)**
- [ ] Load shipping page, see options with real rates
- [ ] Select option, click continue, verify redirect to payment
- [ ] Check reservation has selected shipping data
- [ ] Verify parcel data calculated from basket items

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Shipping page calls Shippo API with correct parameters
- Test: Shipping options display correctly (carrier, price, delivery)
- Test: Selection saves to reservation and redirects

---

### Scope Contract 4: Payment Page & Stripe Integration

**UX Slice (2-3 bullets max)**
- User sees Stripe Elements form → enters payment details → can toggle billing address
- User clicks "Pay Now" → system processes payment → creates order
- On success, redirects to success page

**Architecture Slice**
- Page load: Load reservation data for order context
- Event: `PAYMENT_SUBMIT` → call Stripe API → create order in Sanity
- Side effect: Update product stock using `reservedStock` from reservation
- Cleanup: Delete reservation document
- Redirect: `/checkout/success` on success

**Human Verification Checklist (<5 minutes)**
- [ ] Load payment page, see Stripe Elements
- [ ] Toggle billing address checkbox, verify form updates
- [ ] Enter test card, click pay, verify redirect to success
- [ ] Check product stock updated correctly
- [ ] Verify reservation document deleted

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Payment page loads with reservation data
- Test: Stripe Elements renders correctly
- Test: Payment submit creates order and updates stock
- Test: Reservation cleanup after successful order

---

### Scope Contract 5: Success Page & Error Handling

**UX Slice (2-3 bullets max)**
- User lands on success page → sees order details (ID, items, total)
- User sees clean success message
- User can click "Continue Shopping" to return to store

**Architecture Slice**
- Page load: Load order by ID from URL param or session
- State: Display order details from Sanity
- Error handling: Show error page if order not found or payment failed

**Human Verification Checklist (<5 minutes)**
- [ ] Complete checkout, land on success page
- [ ] Verify order details displayed correctly
- [ ] Click "Continue Shopping", verify redirect to store
- [ ] Test error case (invalid order ID) shows error page

**Minimal Tests (ONLY if needed for human confidence)**
- Test: Success page loads and displays order details
- Test: Continue shopping link redirects correctly
- Test: Error case shows error page

---

## PHASE 4: Continuous Verification (MANDATORY)

### Per Scope Contract Workflow

**For each scope contract:**
1. Implement scope contract (test-first: write failing test, then implement)
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
- [ ] Verify against original UX flows (all 7 steps work end-to-end)
- [ ] Confirm end-state overview achieved (seamless flow from basket to success)
- [ ] Test error handling at each step
- [ ] Verify reservation cleanup after successful order
- [ ] Confirm stock updates correctly
- Only then is sprint complete

---

## PHASE 6: Simplicity Guardrails

**Questions to ask before each implementation:**
- "Is this the simplest possible way?"
- "Can this be done with fewer lines?"
- "Do we need a new abstraction, or can we use existing code?"
- "Is this test serving human confidence, or just coverage?"

**Rules:**
- Use existing Sanity CMS, Stripe, queue system
- No new state libraries (use session storage)
- No new service layers unless absolutely necessary
- Direct server actions over complex abstractions
- Single reservation document type in Sanity

---

## PHASE 7: Execution Protocol

### Per Scope Contract

1. **Write failing test first** (Red phase per TEST_FIRST_PRINCIPLES.md)
2. **Implement minimal code to pass** (Green phase)
3. **Run human verification checklist** IMMEDIATELY
4. **Run minimal tests** (if any)
5. **Confirm simplicity:** "Is this the simplest possible way?"
6. **Only then:** move to next scope contract

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
- **YES** test-first: write failing tests before implementation

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
