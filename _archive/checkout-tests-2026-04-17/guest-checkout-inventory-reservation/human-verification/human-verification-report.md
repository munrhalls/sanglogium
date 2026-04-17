# Human Verification Report: Guest Checkout Inventory Reservation

End-to-end manual verification protocol for the guest checkout -> reserved basket flow, covering client basket submission, Redis FIFO queue processing, and reserved basket state transitions.

---

## Verification Philosophy

> **Manual verification catches what automated tests miss**: timing issues, visual feedback quality, race conditions, and real network behavior.

Per 2026 best practices: Human verification is mandatory for AI-developed checkout flows. Tests document behavior; humans verify reality.

---

## Pre-Flight Checklist (2 min)

```bash
# 1. Verify Redis is running
redis-cli ping  # Should return PONG

# 2. Start development server
npm run dev

# 3. Open browser to basket page
http://localhost:3000/basket
```

**Required Tools:**
- Browser DevTools (Console + Network tabs)
- Redis CLI
- Test products in basket

---

## The 8 Bus Stop Verification Flow

### Bus Stop 1: Basket Page Load -> Checkout Button Click

**Expected:**
- Checkout button visible and enabled (if basket has items)
- Basket items display correctly
- No console errors on page load

**Verification:**
```javascript
// In browser console
console.log('BUS STOP 1: Basket loaded', {
  itemCount: document.querySelectorAll('[data-testid="basket-item"]').length,
  checkoutEnabled: !document.querySelector('[data-testid="checkout-button"]').disabled
});
```

**Pass Criteria:**
- [ ] Checkout button is clickable
- [ ] Basket items match expected products
- [ ] No JavaScript errors in console

**Failure Signals:**
- Button disabled despite basket items
- Console errors about store initialization
- Missing basket items

---

### Bus Stop 2: Checkout Click -> Request Formation

**Expected:**
- Button enters processing state (spinner + "Processing...")
- UUIDv4 idempotency key generated
- Client basket formatted correctly in request payload

**Verification:**
```javascript
// In browser console before clicking
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [url, options] = args;
  if (url.includes('/api/checkout/reserve')) {
    console.log('BUS STOP 2: Request formed', {
      url,
      idempotencyKey: options.headers['Idempotency-Key'],
      body: JSON.parse(options.body)
    });
  }
  return originalFetch(...args);
};
```

**Pass Criteria:**
- [ ] Button shows loading state immediately
- [ ] `Idempotency-Key` header is UUIDv4 format
- [ ] `clientBasket` has: products[], totalAmount, currency
- [ ] Each product has: id, stripePriceId, quantity

**Failure Signals:**
- No loading state (UI stuck)
- Missing idempotency key
- Malformed basket payload

---

### Bus Stop 3: API Request -> Server Receive

**Expected:**
- POST to `/api/checkout/reserve` returns 202 Accepted
- Request logged in server terminal

**Verification:**
```bash
# Watch server terminal for:
BUS STOP 3: Request received - OK
BUS STOP 4: Redis connected - OK
BUS STOP 5: Request enqueued - OK
BUS STOP 6: Response formed - OK
BUS STOP 7: Response sent - OK
```

**Pass Criteria:**
- [ ] HTTP 202 response status
- [ ] Server logs show "Request received"
- [ ] Response contains reservationId

**Failure Signals:**
- 400 error (missing idempotency key or basket)
- 500 error (server crash)
- No server logs

---

### Bus Stop 4: Redis Queue Enqueue

**Expected:**
- Request added to FIFO queue
- Queue state shows waiting job

**Verification:**
```bash
# In Redis CLI
redis-cli LRANGE reservation:queue:waiting 0 -1
# Should show queue item with reservation data

redis-cli HGETALL idempotency:<idempotency-key>
# Should show cached request fingerprint
```

**Pass Criteria:**
- [ ] Queue has waiting job
- [ ] Idempotency key cached in Redis
- [ ] Job has correct payload structure

**Failure Signals:**
- Empty queue despite API 202 response
- No idempotency cache entry
- Redis connection errors

---

### Bus Stop 5: Queue Processing -> Stock Reservation

**Expected:**
- Job processed from queue
- Sanity reservedStock incremented
- Reservation token created

**Verification:**
```bash
# Watch server logs for:
"Atomic reservation successful: <reservationId>"

# In Sanity Studio
# Check product documents: reservedStock field should increment
```

**Or programmatic check:**
```javascript
// Check reservation was created
const token = await fetch('/api/checkout/reserve/status?token=<reservationId>');
console.log('BUS STOP 5: Reservation state', await token.json());
```

**Pass Criteria:**
- [ ] Server logs "Atomic reservation successful"
- [ ] Sanity reservedStock incremented by requested quantity
- [ ] Reservation token exists in Redis

**Failure Signals:**
- "Atomic reservation failed" in logs
- reservedStock not updated
- Queue job failed/retrying

---

### Bus Stop 6: Response -> Client State Update

**Expected:**
- API returns reserved basket data
- Zustand store updated with reserved basket
- localStorage persists reservation

**Verification:**
```javascript
// In browser console after response
const state = JSON.parse(localStorage.getItem('reserved-basket-storage'));
console.log('BUS STOP 6: Client state', {
  reservationToken: state?.state?.reservedBasket?.reservationToken,
  productCount: state?.state?.reservedBasket?.products?.length,
  expiresAt: state?.state?.reservedBasket?.expiresAt
});
```

**Pass Criteria:**
- [ ] localStorage has reserved-basket-storage key
- [ ] reservationToken is UUID format
- [ ] expiresAt is future timestamp
- [ ] products array matches reservation

**Failure Signals:**
- localStorage empty or missing key
- Malformed reserved basket data
- State not persisted

---

### Bus Stop 7: UI State Transition -> Reserved Basket View

**Expected:**
- Checkout button disabled
- Reserved basket panel appears
- Expiry countdown visible

**Verification:**
```javascript
// Check UI elements
console.log('BUS STOP 7: UI state', {
  checkoutDisabled: document.querySelector('[data-testid="checkout-button"]')?.disabled,
  reservedPanelVisible: !!document.querySelector('[data-testid="reserved-basket-panel"]'),
  expiryVisible: !!document.querySelector('[data-testid="expiry-countdown"]'),
  cancelButtonVisible: !!document.querySelector('[data-testid="cancel-button"]')
});
```

**Pass Criteria:**
- [ ] Checkout button disabled
- [ ] Reserved basket panel rendered
- [ ] Expiry countdown visible
- [ ] Cancel button available

**Failure Signals:**
- Checkout button still enabled
- No reserved basket panel
- Missing cancel button

---

### Bus Stop 8: Reserved Basket Status Classification

**Expected:**
- Basket status calculated correctly: 'full', 'decremented', or 'empty'
- UI shows appropriate message for each status

**Verification Scenarios:**

**Status: FULL (all items available)**
```javascript
// All products: requestedQuantity === reservedQuantity
console.log('BUS STOP 8: Status = FULL');
// Expected: "Proceed" button visible, no stock warnings
```

**Status: DECREMENTED (partial availability)**
```javascript
// Some products: reservedQuantity < requestedQuantity
console.log('BUS STOP 8: Status = DECREMENTED');
// Expected: "Approve & Proceed" and "Cancel" buttons
// Expected: "We've had to revise your basket based on latest inventory check."
```

**Status: EMPTY (no availability)**
```javascript
// All products: reservedQuantity === 0
console.log('BUS STOP 8: Status = EMPTY');
// Expected: Clear out of stock message
// Expected: "We apologize - these products are out of stock."
```

**Pass Criteria:**
- [ ] Correct status classification based on stock
- [ ] Appropriate UI for each status
- [ ] Clear messaging to user

---

## Error Scenario Verification

### Scenario 1: Idempotency Key Reuse

**Expected:** Same key returns cached response, no new reservation created.

**Test:**
```javascript
// 1. Note idempotency key from first request
const key = 'your-uuid-here';

// 2. Send identical request
fetch('/api/checkout/reserve', {
  method: 'POST',
  headers: { 'Idempotency-Key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify(sameBasket)
});

// 3. Verify: Should return same reservationId, no new stock decrement
```

**Pass:** Same reservation token returned, reservedStock unchanged.

---

### Scenario 2: Concurrent Checkout Attempt (Multi-Tab)

**Expected:** Second request blocked with "operation_in_progress" error.

**Test:**
1. Open basket in Tab A, click checkout
2. Before response, open basket in Tab B, click checkout

**Pass:** Tab B shows: "Please wait, operation in progress in another tab"

---

### Scenario 3: Network Failure / Retry

**Expected:** Automatic retry up to 3 attempts, then error state.

**Test:**
```javascript
// Simulate network failure by blocking fetch
window.fetch = () => new Promise((_, reject) => reject(new Error('Network error')));
// Click checkout, wait for retries
```

**Pass:** Error message displayed after 3 attempts with "Retry" button.

---

### Scenario 4: Cancel Button -> Rollback

**Expected:**
- Cancel button sends rollback request
- Reservation removed from localStorage
- Sanity reservedStock decremented

**Test:**
1. Create reservation
2. Click Cancel button
3. Check Redis: reservation token should transition to cancelled
4. Check Sanity: reservedStock decremented

**Pass:** Basket returns to pre-reservation state, stock restored.

---

## Complete Verification Script

```javascript
// Run this in browser console after page load
(function verifyCheckoutFlow() {
  const results = { passed: [], failed: [] };

  // Bus Stop 1
  const checkoutBtn = document.querySelector('[data-testid="checkout-button"]');
  if (checkoutBtn && !checkoutBtn.disabled) {
    results.passed.push('BS1: Checkout button enabled');
  } else {
    results.failed.push('BS1: Checkout button disabled or missing');
  }

  // Intercept fetch for remaining stops
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, opts] = args;
    if (url.includes('/api/checkout/reserve')) {
      console.log('BS2: Request intercepted', {
        hasIdempotency: !!opts.headers['Idempotency-Key'],
        body: JSON.parse(opts.body)
      });
    }
    const res = await origFetch(...args);
    if (url.includes('/api/checkout/reserve')) {
      const clone = res.clone();
      clone.json().then(data => {
        console.log('BS3: Response received', data);
        if (data.success) results.passed.push('BS3: API 202 response');
      });
    }
    return res;
  };

  // Check localStorage after reservation
  setTimeout(() => {
    const storage = JSON.parse(localStorage.getItem('reserved-basket-storage') || '{}');
    if (storage?.state?.reservedBasket?.reservationToken) {
      results.passed.push('BS6: Reserved basket persisted');
    } else {
      results.failed.push('BS6: Reserved basket not in localStorage');
    }
    console.log('Verification complete:', results);
  }, 5000);

  return results;
})();
```

---

## Success Criteria Summary

| Bus Stop | Check | Verification Method |
|----------|-------|---------------------|
| 1 | Button enabled, basket loaded | Visual + console |
| 2 | UUID idempotency key, proper payload | Fetch interceptor |
| 3 | HTTP 202, server receives request | Network tab + server logs |
| 4 | Job in Redis queue | Redis CLI |
| 5 | Stock reserved in Sanity | Sanity Studio |
| 6 | State persisted to localStorage | localStorage inspection |
| 7 | UI reflects reserved state | Visual confirmation |
| 8 | Correct status classification | Console + visual |

**Full Pass:** All 8 stops pass + 2 error scenarios pass.
**Partial Pass:** Core flow passes (stops 1-6) with known issues documented.
**Fail:** Any core stop fails (1-6) -> do not proceed to deployment.

---

## Time Estimate

| Phase | Time | Notes |
|-------|------|-------|
| Pre-flight | 2 min | Redis + server start |
| Core flow (8 stops) | 8 min | 1 min per stop |
| Error scenarios | 5 min | 3 scenarios |
| Documentation | 2 min | Record results |
| **Total** | **17 min** | Complete verification |

---

*Report generated following /trace bus stop methodology and 2026 human verification best practices.*
*Reference: PRD_guest-checkout-inventory-reservation.md, human-verification-patterns.md, manual-human-verification-stripe-checkout.md*
