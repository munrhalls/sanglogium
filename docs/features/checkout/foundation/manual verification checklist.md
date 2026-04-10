# Human Manual Verification Checklist - Checkout Flow

> **Purpose:** Every step must be manually verified before writing tests. This checklist ensures the system works as designed, not as we assume it works.
>
> **Rule:** Tests must document VERIFIED behavior, not speculate about it. Never mock core functionality.

---

## Preparation

### Environment Setup
- [ ] Stripe test mode activated
- [ ] Test cards ready (4242 4242 4242 4242 for success, 4000 0000 0000 0002 for decline)
- [ ] Redis connected (can see keys with `redis-cli` if needed)
- [ ] Browser DevTools open (Network tab, Console tab)
- [ ] Sanity Studio accessible for product verification

### Test Data
- [ ] At least 1 product in stock
- [ ] Product with known price (e.g., 100 PLN)
- [ ] Guest session cleared (clear cookies)

---

## SLICE 1: Basket Page Verification

### Step 1: Basket Page Load
**Expected:** Basket displays with items, checkout button enabled

**Manual Checks:**
- [ ] Basket loads without errors
- [ ] Items display correctly with prices
- [ ] Checkout button is enabled
- [ ] No console errors
- [ ] Network tab shows no failed requests

**Bus Stop:** User sees their basket

---

### Step 2: Checkout Click
**Expected:** Button disables, loading state shows, navigation to address

**Manual Checks:**
- [ ] Click checkout button
- [ ] Button immediately disables
- [ ] Loading spinner appears
- [ ] No server calls made (check Network tab)
- [ ] URL changes to /checkout/address

**Console Verification:**
```javascript
// Check FSM context
console.log(window.checkoutFSM);
// Should show: { status: 'processing', idempotencyKey: 'uuid-v4' }
```

**Bus Stop:** User is on address page with idempotency key

---

### Step 3: Address Page Load
**Expected:** Address form loads, FSM status is 'idle'

**Manual Checks:**
- [ ] Address form renders
- [ ] All fields present (name, street, city, postal, country)
- [ ] Submit button enabled
- [ ] No console errors
- [ ] URL is /checkout/address

**Console Verification:**
```javascript
// Verify FSM state
console.log('FSM status:', window.checkoutFSM?.status);
// Should be: 'idle'
```

**Bus Stop:** User can fill address form

---

## SLICE 2: Address Page Verification

### Step 4: Address Form Fill
**Expected:** Form accepts input, validation works

**Manual Checks:**
- [ ] Fill all required fields
- [ ] Client-side validation triggers (empty fields, invalid email)
- [ ] Submit button enables when valid
- [ ] No server calls yet

**Test Data:**
```
Name: Test User
Street: Test Street 123
City: Test City
Postal: 00-123
Country: Poland
```

**Bus Stop:** Form is ready for submission

---

### Step 5: Address Submit
**Expected:** Submit disables, server call made, stock reserved

**Manual Checks:**
- [ ] Click submit button
- [ ] Button disables immediately
- [ ] Loading state shows
- [ ] Network tab shows POST to server action
- [ ] Request includes: idempotencyKey, addressData, basketItems

**Console Verification:**
```javascript
// Check request payload
// In Network tab, click request -> Payload
// Should contain:
{
  idempotencyKey: "checkout_session_xxx_timestamp",
  guestJwt: "...",
  sessionId: "guest_session_xxx",
  addressData: { ... },
  basketItems: [ { productId: "...", quantity: 1, price: 10000 } ]
}
```

**Bus Stop:** Server is processing

---

### Step 6: Server Response
**Expected:** Success with clientSecret, reservationId

**Manual Checks:**
- [ ] Response arrives within 2 seconds
- [ ] Response contains: clientSecret, reservationId, expiresAt
- [ ] No error in response
- [ ] Navigation to /checkout/payment starts

**Console Verification:**
```javascript
// Check response structure
// In Network tab, click response
{
  clientSecret: "pi_xxx_secret_xxx",
  reservationId: "reserve_xxx",
  expiresAt: 1723456789000
}
```

**Redis Verification (if accessible):**
```bash
# Check reservation exists
redis-cli GET "reserve:guest_session_xxx"
# Should show reservation data
```

**Bus Stop:** User is redirected to payment page

---

## SLICE 3: Payment Page Verification

### Step 7: Payment Page Load
**Expected:** Stripe Elements load, payment form appears

**Manual Checks:**
- [ ] URL is /checkout/payment
- [ ] Stripe iframe loads (card input fields)
- [ ] Payment button enabled
- [ ] No console errors
- [ ] Stripe script loaded (check Network tab)

**Console Verification:**
```javascript
// Check Stripe Elements
console.log(window.Stripe);
// Should be defined

// Check FSM state
console.log('FSM:', window.checkoutFSM);
// Should have clientSecret, reservationId, expiresAt
```

**Bus Stop:** Payment form is ready

---

### Step 8: Card Details Entry
**Expected:** Card form accepts input, validation works

**Manual Checks:**
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Enter expiry: any future date
- [ ] Enter CVC: any 3 digits
- [ ] Card brand logo appears
- [ ] No validation errors for valid card

**Test Error Cases:**
- [ ] Enter invalid card: see error message
- [ ] Enter expired date: see error message
- [ ] Enter incomplete CVC: see error message

**Bus Stop:** Card details are ready

---

### Step 9: Payment Submit
**Expected:** Submit disables, Stripe processes, success

**Manual Checks:**
- [ ] Click pay button
- [ ] Button disables immediately
- [ ] Loading state shows
- [ ] Stripe processes payment (check Network tab)
- [ ] Success redirect to /checkout/success

**Console Verification:**
```javascript
// Check Stripe events
// Should see elements.submit() called
// Should see confirmPayment called
```

**Network Verification:**
- [ ] POST to Stripe API (confirm payment)
- [ ] Response: paymentIntent.status = "succeeded"

**Bus Stop:** Payment is complete

---

## SLICE 4: Success Page Verification

### Step 10: Success Page
**Expected:** Order confirmed, user sees success message

**Manual Checks:**
- [ ] URL is /checkout/success
- [ ] Success message displays
- [ ] Order details show (items, total)
- [ ] No payment form present
- [ ] Option to continue shopping

**Console Verification:**
```javascript
// Check final FSM state
console.log('Final FSM:', window.checkoutFSM);
// Should be: { status: 'complete', errorMessage: null }
```

**Bus Stop:** User journey complete

---

## WEBHOOK Verification (Manual Trigger)

### Setup for Webhook Testing
- [ ] Stripe CLI running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Webhook endpoint accessible
- [ ] Test payment created in Stripe Dashboard

### Test payment_intent.succeeded
**Expected:** Order created, stock committed

**Manual Steps:**
1. [ ] In Stripe Dashboard, find test payment
2. [ ] Trigger webhook manually
3. [ ] Check server logs for webhook receipt
4. [ ] Verify order in database
5. [ ] Verify stock decremented permanently

### Test payment_intent.payment_failed
**Expected:** Stock released

**Manual Steps:**
1. [ ] Create failed payment (use decline card 4000 0000 0000 0002)
2. [ ] Trigger webhook
3. [ ] Check server logs
4. [ ] Verify stock released in Redis

---

## ERROR PATH Verification

### Error 1: Out of Stock
**Expected:** Clear error message, stock not reserved

**Steps:**
1. [ ] Set product stock to 0 in Sanity
2. [ ] Add to basket
3. [ ] Proceed through address submit
4. [ ] Should see error: "OUT_OF_STOCK"
5. [ ] No reservation created in Redis

### Error 2: Payment Declined
**Expected:** Error on payment page, retry allowed

**Steps:**
1. [ ] Use decline card: 4000 0000 0000 0002
2. [ ] Submit payment
3. [ ] See decline message
4. [ ] Can retry with different card
5. [ ] Stock still reserved

### Error 3: Network Failure
**Expected:** Graceful handling, retry possible

**Steps:**
1. [ ] Disconnect network during address submit
2. [ ] Should see error message
3. [ ] Button re-enables
4. [ ] Can retry submission

---

## SECURITY Verification

### 1. Idempotency Key
**Expected:** Same key prevents double charge

**Steps:**
1. [ ] Submit address form twice quickly
2. [ ] Only one PaymentIntent created
3. [ ] Only one stock reservation

### 2. Client Secret Exposure
**Expected:** clientSecret never logged or exposed

**Checks:**
- [ ] No clientSecret in console logs
- [ ] No clientSecret in URLs
- [ ] clientSecret only passed to Stripe Elements

### 3. Amount Validation
**Expected:** Server validates prices

**Steps:**
1. [ ] Manipulate client-side price (via DevTools)
2. [ ] Submit address
3. [ ] Server rejects with PRICE_MISMATCH error

---

## PERFORMANCE Verification

### 1. Page Load Times
**Expected:** < 2 seconds for each page

**Checks:**
- [ ] Basket page: < 2s
- [ ] Address page: < 2s
- [ ] Payment page: < 3s (Stripe loading)

### 2. API Response Times
**Expected:** < 500ms for server actions

**Checks:**
- [ ] Address submit: < 500ms
- [ ] Stock reservation: < 100ms (Redis)
- [ ] PaymentIntent creation: < 400ms (Stripe)

---

## MOBILE Verification

### Responsive Design
**Expected:** Usable on mobile devices

**Checks:**
- [ ] Basket page: items readable, button accessible
- [ ] Address form: fields usable, keyboard doesn't hide submit
- [ ] Payment form: Stripe Elements mobile-friendly
- [ ] Success page: message readable

### Touch Interactions
**Expected:** No hover states, touch-friendly

**Checks:**
- [ ] Buttons have 44px minimum touch target
- [ ] No hover-only interactions
- [ ] Zoom works correctly

---

## Final Verification Checklist

### Before Writing Tests
- [ ] All happy path steps verified manually
- [ ] All error paths tested
- [ ] Security checks passed
- [ ] Performance acceptable
- [ ] Mobile experience working
- [ ] Webhook handlers tested
- [ ] Console is clean (no errors)
- [ ] Network shows expected requests only

### Test Documentation
- [ ] Document exact user flows observed
- [ ] Note any deviations from expected
- [ ] Record actual API response shapes
- [ ] Capture error message text
- [ ] Document timing measurements

### Ready for Tests
When all above are checked:
- [ ] Create tests that document VERIFIED behavior
- [ ] NO mocking of Stripe, Sanity, or Redis
- [ ] Tests must fail if behavior changes
- [ ] Tests serve human confidence, not coverage metrics

---

## Verification Log Template

```
Date: 2026-04-10
Tester: [Name]
Environment: [Local/Staging]

Basket Page:
- Load: PASS/FAIL - Notes
- Checkout Click: PASS/FAIL - Notes

Address Page:
- Form Fill: PASS/FAIL - Notes
- Submit: PASS/FAIL - Notes
- Server Response: PASS/FAIL - Notes

Payment Page:
- Load: PASS/FAIL - Notes
- Card Entry: PASS/FAIL - Notes
- Payment: PASS/FAIL - Notes

Success Page:
- Display: PASS/FAIL - Notes

Error Paths:
- Out of Stock: PASS/FAIL - Notes
- Payment Declined: PASS/FAIL - Notes
- Network Failure: PASS/FAIL - Notes

Security:
- Idempotency: PASS/FAIL - Notes
- Client Secret: PASS/FAIL - Notes
- Price Validation: PASS/FAIL - Notes

Issues Found:
1. [Description]
2. [Description]

Deviations from Expected:
1. [Description]
2. [Description]

Ready for Tests: YES/NO
```
