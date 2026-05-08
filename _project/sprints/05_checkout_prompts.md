# Checkout Flow - Agent Delegation Prompts

**Purpose:** Ready-to-paste prompts for human developer to delegate checkout implementation to agent
**Scope:** 7-step checkout flow (basket → address validation → shipping options → payment → order creation → return page)
**Ground:** Basket is complete and verified
**Approach:** Test-first, tiny scopes, continuous verification per sprint workflow

---

## SCOPE 1: Checkout Queue & Reservation Creation

**Prompt to paste to agent:**
```
Implement Scope Contract 1: Checkout Queue & Reservation Creation

UX Requirements:
- User clicks "Checkout" button on basket page → system shows loading → user redirected to address page (/checkout/shipping)
- System creates reservation document with basket items and reserved stock
- Session storage stores reservation ID for persistence

Architecture Requirements:
- Event: CHECKOUT_INIT from basket page
- Server action: Atomic reservation operation (queue-based)
- State: Save reservationId to session storage
- Side effect: Create Sanity document of type checkoutReservation
- Redirect: /checkout/shipping on success

Test-First Approach:
1. Write failing black box test for checkout button click triggering queue operation
2. Write failing test for reservation document creation with correct basket items and reserved stock
3. Write failing test for session storage storing reservation ID
4. Implement minimal code to pass all tests

Use existing queue system for atomic reservation operation. Use existing Sanity CMS for document storage. No new abstractions.

After implementation, run this verification:
- Click checkout on basket page, see loading state
- Verify redirect to /checkout/shipping
- Check session storage has reservationId
- Verify Sanity has new checkoutReservation document with basket items
```

**DoD Verification Prompt:**
```
Verify Scope Contract 1 is complete:

1. Manual verification:
   - [ ] Click checkout on basket page, see loading state
   - [ ] Verify redirect to /checkout/shipping
   - [ ] Check session storage has reservationId
   - [ ] Verify Sanity has new checkoutReservation document with basket items

2. Test verification:
   - [ ] Tests pass for checkout button triggering queue operation
   - [ ] Tests pass for reservation document creation
   - [ ] Tests pass for session storage storing reservation ID

3. Simplicity check:
   - [ ] Uses existing queue system (no new concurrency primitive)
   - [ ] Uses existing Sanity CMS (no new database)
   - [ ] Uses existing session storage (no new state library)
   - [ ] Single reservation document type in Sanity

If all checks pass, scope is complete. Move to Scope 2.
```

---

## SCOPE 2: Address Page & Google Verification

**Prompt to paste to agent:**
```
Implement Scope Contract 2: Address Page & Google Verification

UX Requirements:
- User fills address form → clicks "Verify Address" → system shows verified address
- User confirms address → system saves to reservation → redirects to shipping page (/checkout/shipping-options)
- Error shown if verification fails, user can retry

Architecture Requirements:
- Event: ADDRESS_VERIFY → call Google Places API
- Event: ADDRESS_CONFIRM → update reservation document
- State: Store verifiedAddress in reservation
- Redirect: /checkout/shipping-options on confirm

Test-First Approach:
1. Write failing black box test for address form calling Google API and returning verified address
2. Write failing test for confirm saving to reservation and redirecting
3. Write failing test for invalid address showing error message
4. Implement minimal code to pass all tests

Create address page at /checkout/shipping. Use Google Places API for address verification. Update existing reservation document.

After implementation, run this verification:
- Fill address form, click verify, see verified address
- Confirm address, verify redirect to shipping page
- Check reservation document has verified address
- Test invalid address shows error
```

**DoD Verification Prompt:**
```
Verify Scope Contract 2 is complete:

1. Manual verification:
   - [ ] Fill address form, click verify, see verified address
   - [ ] Confirm address, verify redirect to shipping page
   - [ ] Check reservation document has verified address
   - [ ] Test invalid address shows error

2. Test verification:
   - [ ] Tests pass for address form calling Google API
   - [ ] Tests pass for confirm saving to reservation and redirecting
   - [ ] Tests pass for invalid address error handling

3. Simplicity check:
   - [ ] Direct Google API call (no new abstraction layer)
   - [ ] Updates existing reservation document (no new document type)
   - [ ] Simple address form component

If all checks pass, scope is complete. Move to Scope 3.
```

---

## SCOPE 3: Shipping Options & Shippo Integration

**Prompt to paste to agent:**
```
Implement Scope Contract 3: Shipping Options & Shippo Integration

UX Requirements:
- User lands on shipping page → system shows loading → displays shipping options with rates
- User selects option → clicks "Continue" → saves to reservation → redirects to payment (/checkout/payment)
- Options show carrier, service, price, delivery estimate

Architecture Requirements:
- Page load: Combine address + company origin + parcel data → call Shippo API
- Event: SHIPPING_SELECT → update reservation with selected option
- State: Store shippingOptions and selectedShipping in reservation
- Redirect: /checkout/payment on selection

Test-First Approach:
1. Write failing black box test for shipping page calling Shippo API with correct parameters
2. Write failing test for shipping options displaying correctly (carrier, price, delivery)
3. Write failing test for selection saving to reservation and redirecting
4. Implement minimal code to pass all tests

Create shipping options page at /checkout/shipping-options. Calculate parcel data from basket items (weight, dimensions). Use Shippo API for rate fetching. Save selected option to reservation.

After implementation, run this verification:
- Load shipping page, see options with real rates
- Select option, click continue, verify redirect to payment
- Check reservation has selected shipping data
- Verify parcel data calculated from basket items
```

**DoD Verification Prompt:**
```
Verify Scope Contract 3 is complete:

1. Manual verification:
   - [ ] Load shipping page, see options with real rates
   - [ ] Select option, click continue, verify redirect to payment
   - [ ] Check reservation has selected shipping data
   - [ ] Verify parcel data calculated from basket items

2. Test verification:
   - [ ] Tests pass for Shippo API call with correct parameters
   - [ ] Tests pass for shipping options display
   - [ ] Tests pass for selection saving and redirecting

3. Simplicity check:
   - [ ] Direct Shippo API call (no new abstraction)
   - [ ] Simple parcel calculation from basket items
   - [ ] Updates existing reservation document

If all checks pass, scope is complete. Move to Scope 4.
```

---

## SCOPE 4: Payment Page & Stripe Integration

**Prompt to paste to agent:**
```
Implement Scope Contract 4: Payment Page & Stripe Integration

UX Requirements:
- User sees Stripe Elements form → enters payment details → can toggle billing address
- User clicks "Pay Now" → system processes payment → creates order
- On success, redirects to success page (/checkout/success)

Architecture Requirements:
- Page load: Load reservation data for order context
- Event: PAYMENT_SUBMIT → call Stripe API → create order in Sanity
- Side effect: Update product stock using reservedStock from reservation
- Cleanup: Delete reservation document
- Redirect: /checkout/success on success

Test-First Approach:
1. Write failing black box test for payment page loading with reservation data
2. Write failing test for Stripe Elements rendering correctly
3. Write failing test for payment submit creating order and updating stock
4. Write failing test for reservation cleanup after successful order
5. Implement minimal code to pass all tests

Create payment page at /checkout/payment. Use existing Stripe integration. Load reservation by ID from session storage. Create order in Sanity. Update product stock atomically using reservedStock. Delete reservation document after successful order.

After implementation, run this verification:
- Load payment page, see Stripe Elements
- Toggle billing address checkbox, verify form updates
- Enter test card, click pay, verify redirect to success
- Check product stock updated correctly
- Verify reservation document deleted
```

**DoD Verification Prompt:**
```
Verify Scope Contract 4 is complete:

1. Manual verification:
   - [ ] Load payment page, see Stripe Elements
   - [ ] Toggle billing address checkbox, verify form updates
   - [ ] Enter test card, click pay, verify redirect to success
   - [ ] Check product stock updated correctly
   - [ ] Verify reservation document deleted

2. Test verification:
   - [ ] Tests pass for payment page loading with reservation data
   - [ ] Tests pass for Stripe Elements rendering
   - [ ] Tests pass for payment submit creating order and updating stock
   - [ ] Tests pass for reservation cleanup

3. Simplicity check:
   - [ ] Uses existing Stripe integration (no new payment abstraction)
   - [ ] Direct server action for order creation
   - [ ] Atomic stock update from reservation
   - [ ] Simple reservation cleanup

If all checks pass, scope is complete. Move to Scope 5.
```

---

## SCOPE 5: Success Page & Error Handling

**Prompt to paste to agent:**
```
Implement Scope Contract 5: Success Page & Error Handling

UX Requirements:
- User lands on success page → sees order details (ID, items, total)
- User sees clean success message
- User can click "Continue Shopping" to return to store

Architecture Requirements:
- Page load: Load order by ID from URL param or session
- State: Display order details from Sanity
- Error handling: Show error page if order not found or payment failed

Test-First Approach:
1. Write failing black box test for success page loading and displaying order details
2. Write failing test for continue shopping link redirecting correctly
3. Write failing test for error case showing error page
4. Implement minimal code to pass all tests

Create success page at /checkout/success. Load order by ID from URL query param. Display order details (order ID, items, shipping, total). Add "Continue Shopping" link to store homepage. Create error page for failed/missing orders.

After implementation, run this verification:
- Complete checkout, land on success page
- Verify order details displayed correctly
- Click "Continue Shopping", verify redirect to store
- Test error case (invalid order ID) shows error page
```

**DoD Verification Prompt:**
```
Verify Scope Contract 5 is complete:

1. Manual verification:
   - [ ] Complete checkout, land on success page
   - [ ] Verify order details displayed correctly
   - [ ] Click "Continue Shopping", verify redirect to store
   - [ ] Test error case (invalid order ID) shows error page

2. Test verification:
   - [ ] Tests pass for success page loading and displaying order details
   - [ ] Tests pass for continue shopping link redirecting
   - [ ] Tests pass for error case showing error page

3. Simplicity check:
   - [ ] Simple order display from Sanity
   - [ ] Basic error handling
   - [ ] No new abstractions

If all checks pass, scope is complete. Move to Final Verification.
```

---

## FINAL VERIFICATION

**Prompt to paste to agent:**
```
Run end-to-end verification of complete checkout flow:

1. Full flow test:
   - Start on basket page with items
   - Click checkout, verify reservation created and redirect to address
   - Fill and verify address, confirm, verify redirect to shipping options
   - Select shipping option, continue, verify redirect to payment
   - Enter payment details, submit, verify order creation and redirect to success
   - Verify success page shows order details
   - Verify product stock updated correctly
   - Verify reservation document deleted

2. Error handling test:
   - Test error at each step (invalid address, payment failure, etc.)
   - Verify clear error messages shown
   - Verify user can retry

3. Black box test coverage:
   - Verify all black box tests pass
   - Verify test-to-production ratio is healthy
   - Verify tests follow AAA pattern and are human-readable

4. Simplicity audit:
   - Verify no unnecessary abstractions
   - Verify existing systems used (Sanity, Stripe, queue)
   - Verify direct server actions over complex layers
   - Verify single reservation document type

Report any issues found. If all checks pass, sprint is complete.
```

**DoD Verification Prompt:**
```
Verify sprint is complete:

1. End-to-end flow:
   - [ ] Complete 7-step checkout flow works
   - [ ] All redirects work correctly
   - [ ] Reservation created, updated, deleted correctly
   - [ ] Stock updated atomically
   - [ ] Order created successfully

2. Error handling:
   - [ ] Errors shown at each step
   - [ ] User can retry failed steps
   - [ ] Reservation persists for retry

3. Test coverage:
   - [ ] All black box tests pass
   - [ ] Test-to-production ratio healthy
   - [ ] Tests follow AAA pattern
   - [ ] Tests are human-readable

4. Simplicity:
   - [ ] No unnecessary abstractions
   - [ ] Existing systems used (Sanity, Stripe, queue)
   - [ ] Direct server actions
   - [ ] Single reservation document type

5. Ground verification:
   - [ ] Basket still works (no regression)
   - [ ] Basket integration with checkout works

If all checks pass, sprint is complete. Execute /learn protocol to capture lessons.
```

---

## EXECUTION ORDER

**For human developer:**

1. Copy Scope 1 prompt → paste to agent → wait for completion
2. Copy Scope 1 DoD prompt → run verification manually
3. If Scope 1 passes: Copy Scope 2 prompt → paste to agent → wait for completion
4. Copy Scope 2 DoD prompt → run verification manually
5. Continue through all 5 scopes
6. Copy Final Verification prompt → paste to agent
7. Copy Final DoD prompt → run verification manually
8. If all pass: Execute /learn protocol

**Critical Rule:** Do not proceed to next scope until current scope passes DoD verification. Continuous verification prevents accumulation of issues.
