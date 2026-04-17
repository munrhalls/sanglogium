# Guest Checkout Human Verification: DoD Checklist

Ordered verification steps for all PRD Definition of Done items. Follow this checklist sequentially — do not skip steps.

**Prerequisites:** Complete [SETUP.md](./SETUP.md) first.

**Estimated Time:** 25-30 minutes for full verification.

---

## How to Use This Checklist

1. **Work sequentially** — Don't skip to later items
2. **Mark as you go** — Check off each item after verification
3. **Document failures** — Note any issues in the Notes column
4. **Full pass required** — All items must pass for deployment approval

**Legend:**
- ✅ PASS — Verified working as specified
- ❌ FAIL — Not working, document issue
- ⏭️ SKIP — Out of scope for this verification session
- 🔄 RETRY — Flaky, needs re-verification

---

## Bus Stop 1: Basket Page Load

**Goal:** Verify baseline state and zero-cookie policy.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 1.1 | Page loads without errors | Open `/basket`, check DevTools Console | No red errors, no warnings | [ ] | |
| 1.2 | **#3: Zero cookies** | DevTools → Application → Cookies | `Document.cookie` is empty, no Set-Cookie headers in Network tab | [ ] | |
| 1.3 | Basket renders with items | Add test products, verify display | Products show name, price, quantity | [ ] | |
| 1.4 | Checkout button enabled | Verify button state | `data-testid="checkout-button"` not disabled | [ ] | |

**Console verification:**
```javascript
// Verify zero cookies
console.log('Cookies:', document.cookie); // Should be ""

// Verify basket loaded
console.log('BS1: Basket state', {
  items: document.querySelectorAll('[data-testid^="basket-item"]').length,
  checkoutEnabled: !document.querySelector('[data-testid="checkout-button"]').disabled,
  cookies: document.cookie.length
});
```

---

## Bus Stop 2: Request Formation

**Goal:** Verify request structure, idempotency, and deduplication.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 2.1 | **#1: UUIDv4 idempotency key** | Click checkout, intercept request in Network tab | `Idempotency-Key` header present, UUIDv4 format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx) | [ ] | |
| 2.2 | Request payload structure | Inspect POST body in Network tab | `clientBasket` with `products[]`, `totalAmount`, `currency: "PLN"` | [ ] | |
| 2.3 | Product data in request | Verify each product has required fields | Each: `id`, `stripePriceId`, `quantity` | [ ] | |
| 2.4 | **#9: UI deduplication** | Click checkout 3 times rapidly | Only 1 network request sent, button shows loading state immediately | [ ] | |

**Console verification:**
```javascript
// Intercept fetch to verify
const origFetch = window.fetch;
window.fetch = async (...args) => {
  const [url, opts] = args;
  if (url.includes('/api/checkout/reserve')) {
    console.log('BS2: Request', {
      idempotencyKey: opts.headers['Idempotency-Key'],
      isUUIDv4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(opts.headers['Idempotency-Key']),
      body: JSON.parse(opts.body)
    });
  }
  return origFetch(...args);
};
```

---

## Bus Stop 3: API Request Processing

**Goal:** Verify API receives request and generates reservation token.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 3.1 | **#4: Reservation token (UUID)** | Check API response in Network tab | Response contains `reservationId` (UUID format) | [ ] | |
| 3.2 | HTTP 202 status | Check response status | Status: 202 Accepted | [ ] | |
| 3.3 | Server logs request | Check terminal running `npm run dev` | Shows "BUS STOP 4: Request received - OK" | [ ] | |
| 3.4 | **#33: Parameter validation** | Send request with missing basket | Returns 400 with `MISSING_CLIENT_BASKET` error | [ ] | |

**Test #33 (Parameter validation):**
```javascript
// In console, send invalid request
fetch('/api/checkout/reserve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
  body: JSON.stringify({}) // Missing clientBasket
}).then(r => r.json()).then(console.log);
// Expected: { success: false, error: { code: 'MISSING_CLIENT_BASKET' } }
```

---

## Bus Stop 4: Redis Queue Operations

**Goal:** Verify queue functionality and concurrent operation handling.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 4.1 | **#17: FIFO queue processing** | Check Redis for queue state | `redis-cli LRANGE reservation:queue:waiting 0 -1` shows job | [ ] | |
| 4.2 | **#18: Redis Streams/BullMQ** | Verify queue implementation | Job has `id`, `type`, `idempotencyKey`, `payload` structure | [ ] | |
| 4.3 | **#20: Reject concurrent operations** | Open second tab, attempt concurrent checkout | Second request blocked with `operation_in_progress` error | [ ] | |
| 4.4 | **#5: Idempotency 24h cache** | Check Redis for idempotency key | `redis-cli HGETALL idempotency:<key>` shows cached response | [ ] | |

**Verification commands:**
```bash
# Check queue
redis-cli LRANGE reservation:queue:waiting 0 -1

# Check idempotency cache
redis-cli HGETALL idempotency:<idempotency-key-from-request>

# Check all keys
redis-cli KEYS "*"
```

**Test #20 (Concurrent operations):**
1. Tab A: Click checkout, wait for loading state
2. Tab B: Open same basket, click checkout
3. Tab B should show: "Please wait, operation in progress in another tab"

---

## Bus Stop 5: Stock Reservation

**Goal:** Verify stock management and atomic operations.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 5.1 | **#15: Cancel rollback restores stock** | Create reservation → Cancel → Check Sanity | `reservedStock` returns to original value | [ ] | |
| 5.2 | **#25: Product stock fields** | Check Sanity Studio product document | `stock` and `reservedStock` fields exist | [ ] | |
| 5.3 | **#26: Reservation increments reservedStock only** | Reserve 2 units, check Sanity | `reservedStock` increased by 2, `stock` unchanged | [ ] | |
| 5.4 | **#23: Atomic transactions** | Check server logs | Shows "Atomic reservation successful" without errors | [ ] | |
| 5.5 | Sequential reservation fails | Try to reserve last item twice | Second reservation gets decremented quantity or empty | [ ] | |

**Sanity verification:**
```bash
# Note stock before reservation
# Reserve...
# Note stock after - reservedStock should increment
```

---

## Bus Stop 6: Client State Management

**Goal:** Verify Zustand store and localStorage persistence.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 6.1 | **#2: Zustand mirrors create/delete** | After reservation, check localStorage | `reserved-basket-storage` key exists with reservation data | [ ] | |
| 6.2 | **#2: Delete on rollback** | Click Cancel, check localStorage | `reserved-basket-storage` cleared or `reservedBasket: null` | [ ] | |
| 6.3 | State survives page refresh | Refresh page after reservation | Reserved basket still displayed | [ ] | |
| 6.4 | **#5: Idempotency cached response** | Same key returns same reservationId | Re-request with same key → same reservation token | [ ] | |

**Console verification:**
```javascript
// Check localStorage state
const state = JSON.parse(localStorage.getItem('reserved-basket-storage'));
console.log('BS6: Zustand state', {
  hasReservedBasket: !!state?.state?.reservedBasket,
  reservationToken: state?.state?.reservedBasket?.reservationToken,
  expiresAt: state?.state?.reservedBasket?.expiresAt
});
```

---

## Bus Stop 7: UI State Transitions

**Goal:** Verify all 5 UI states render correctly.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 7.1 | **#7: Button disabled during processing** | Click checkout | Button shows spinner, disabled attribute set | [ ] | |
| 7.2 | **#7: Re-enabled on basket modify** | Modify basket after reservation | Checkout button re-enabled | [ ] | |
| 7.3 | **#10: State 1 - Full availability** | Reserve with sufficient stock | "Proceed" button visible, automatic flow | [ ] | |
| 7.4 | **#11: State 2 - Decrements** | Reserve with partial stock | "Approve & Proceed" + "Cancel" buttons, "We've had to revise..." message | [ ] | |
| 7.5 | **#12: State 3 - Empty** | Reserve out-of-stock item | "We apologize - these products are out of stock." message | [ ] | |
| 7.6 | **#14: State 5 - Concurrent op** | Try checkout in second tab | "Please wait, operation in progress in another tab" message | [ ] | |

---

## Bus Stop 8: Error Handling & Retry Logic

**Goal:** Verify retry mechanisms and edge cases.

| # | DoD Item | Verification Step | Expected Result | Status | Notes |
|---|----------|-------------------|-----------------|--------|-------|
| 8.1 | **#29: Create retry 3x** | Block network temporarily (DevTools Network offline) | Automatic retry up to 3 attempts | [ ] | |
| 8.2 | **#13: State 4 - Network failure** | Block network, click checkout | Retry button + "Network error" message after 3 failures | [ ] | |
| 8.3 | **#30: Delete retry 10x** | Cancel during network issue | Rollback retries up to 10 times | [ ] | |
| 8.4 | **#31: Circuit breaker** | Cause 5 consecutive failures | 6th request returns `service_temporarily_unavailable` | [ ] | |
| 8.5 | **#32: Transient vs non-transient** | Test 4xx error (invalid token) | Fails immediately without retry | [ ] | |
| 8.6 | **#8: Rollback then new reservation** | Modify basket, click re-enabled checkout | Two requests: rollback first, then new reservation | [ ] | |
| 8.7 | **#16: 10-minute TTL auto-rollback** | Wait 10 minutes or manipulate TTL | Automatic rollback triggered | [ ] | ⏱️ Can shorten TTL for testing |
| 8.8 | **#21: Token state atomic tracking** | Check Redis during operation | Token state: FREE → RESERVING → ACTIVE | [ ] | |
| 8.9 | **#24: Idempotency fingerprint** | Same key, different payload | Returns error: `IDEMPOTENCY_KEY_PARAMETER_MISMATCH` | [ ] | |

**Test #8 (Rollback then new reservation):**
1. Create reservation
2. Add/remove item from basket (modifies client basket)
3. Click checkout (now re-enabled)
4. Check Network tab: Should see 2 requests — rollback first, then create

---

## Out of Scope Items (Payment-Related)

These items are explicitly out of scope per PRD, but noted for future verification:

| # | DoD Item | Status | Notes |
|---|----------|--------|-------|
| 6 | Stripe webhook signature verification | ⏭️ SKIP | Payment success out of scope |
| 19 | Priority queue for payment realize | ⏭️ SKIP | Payment success out of scope |
| 27 | Realize decrements both stock fields | ⏭️ SKIP | Payment success out of scope |

---

## Sign-Off Section

**Verifier Name:** _________________

**Date:** _________________

**Environment:**
- [ ] Local development (`npm run dev`)
- [ ] Staging deployment
- [ ] Production (smoke test only)

**Results Summary:**
| Category | Total | Pass | Fail | Skip |
|----------|-------|------|------|------|
| Bus Stop 1 | 4 | | | |
| Bus Stop 2 | 4 | | | |
| Bus Stop 3 | 4 | | | |
| Bus Stop 4 | 4 | | | |
| Bus Stop 5 | 5 | | | |
| Bus Stop 6 | 4 | | | |
| Bus Stop 7 | 6 | | | |
| Bus Stop 8 | 9 | | | |
| **Total** | **40** | | | |

**Approval:**

- [ ] **APPROVED** — All required items pass, ready for deployment
- [ ] **CONDITIONAL** — Some items failed but documented, risk accepted
- [ ] **REJECTED** — Critical failures, do not deploy

**Verifier Signature:** _________________ **Date:** _______

**Notes/Issues Found:**

```
[Space for documenting any failures, workarounds, or observations]



```

---

## References

- **Detailed Steps:** [human-verification-report.md](./human-verification-report.md) — Bus stop console scripts
- **Automated Script:** [verification-script.js](./verification-script.js) — Browser automation
- **Setup Guide:** [SETUP.md](./SETUP.md) — Environment preparation
- **PRD Source:** `_project/prd/PRD_guest-checkout-inventory-reservation.md`
