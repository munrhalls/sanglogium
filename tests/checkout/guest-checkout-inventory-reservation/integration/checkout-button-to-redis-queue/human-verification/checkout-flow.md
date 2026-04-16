# Human Verification: Checkout Button to Redis Queue Flow

## Purpose
Manual verification checklist for the complete checkout button to Redis queue flow. Use this to verify the implementation works correctly in real scenarios.

## Pre-Test Setup

### Environment Requirements
- [ ] Redis server running on localhost:6379
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Browser with dev tools opened
- [ ] Test products loaded in basket with valid stripePriceId

### Quick Redis Check
```bash
# Verify Redis is running
redis-cli ping
# Should return: PONG

# Clear test data
redis-cli flushdb
```

## Test Scenarios

### 1. Happy Path - Valid Reservation

**Steps:**
1. Navigate to basket page with items
2. Open browser dev tools (Console + Network tabs)
3. Click "Checkout" button
4. Observe the flow

**Expected Results:**
- [ ] Console shows: "TRACE: Checkout button clicked"
- [ ] Button shows "Processing..." with spinner
- [ ] Network tab: POST to /api/checkout/reserve
- [ ] Request headers include: Content-Type: application/json, Idempotency-Key
- [ ] Request body contains valid clientBasket with stripePriceId
- [ ] Response status: 202 Accepted
- [ ] Response contains reservationId
- [ ] Redis contains entry: `redis-cli LRANGE queue:reservations 0 -1`
- [ ] UI updates to show success state

**Redis Verification:**
```bash
# Check queue contents
redis-cli LRANGE queue:reservations 0 -1
# Should show JSON reservation request

# Check TTL
redis-cli TTL queue:reservations
# Should show > 0 (not -1)
```

### 2. Empty Basket

**Steps:**
1. Navigate to basket page with NO items
2. Click "Checkout" button

**Expected Results:**
- [ ] Button remains disabled (basket.length === 0)
- [ ] No network request made
- [ ] Error message: "Your basket is empty"

### 3. Double-Click Prevention

**Steps:**
1. Navigate to basket page with items
2. Rapidly click checkout button twice within 1 second

**Expected Results:**
- [ ] Only one network request sent
- [ ] Console warning: "Action checkout clicked too rapidly"
- [ ] Only one reservation created in Redis
- [ ] Button remains disabled during processing

### 4. Network Error Simulation

**Steps:**
1. Stop Redis server: `redis-cli shutdown`
2. Navigate to basket page with items
3. Click "Checkout" button

**Expected Results:**
- [ ] Button shows error state
- [ ] Error message displayed to user
- [ ] Console shows connection error
- [ ] UI recovers after Redis restart

### 5. Invalid Data Test

**Steps:**
1. Use browser dev tools to modify request
2. Remove stripePriceId from product data
3. Click "Checkout" button

**Expected Results:**
- [ ] API returns 400 error
- [ ] Error message about missing required fields
- [ ] No entry added to Redis queue

### 6. Idempotency Test

**Steps:**
1. Navigate to basket page with items
2. Open dev tools Network tab
3. Right-click the checkout request -> "Copy as cURL"
4. Execute same cURL command twice

**Expected Results:**
- [ ] First request returns 202 (processing)
- [ ] Second request returns 200 with cached response
- [ ] Only one reservation in Redis
- [ ] Both responses have same reservationId

## Bus Stop Verification

### Console Logs to Verify
Each bus stop should log a TRACE message:

1. **Bus Stop 1**: Button click handler
   ```
   TRACE: Checkout button clicked { requestId: "...", idempotencyKey: "...", timestamp: ... }
   ```

2. **Bus Stop 2**: Request formation
   ```
   TRACE: Queue request formed { request: { id: "...", type: "...", ... } }
   ```

3. **Bus Stop 3**: API call initiation
   ```
   TRACE: API call initiated { url: "/api/checkout/reserve", method: "POST", ... }
   ```

4. **Bus Stop 4**: Server receives request
   ```
   TRACE: Server received request { endpoint: "...", requestId: "...", ... }
   ```

5. **Bus Stop 5**: Redis connection
   ```
   TRACE: Redis connection status { connected: "ready", host: "...", port: 6379, ... }
   ```

6. **Bus Stop 6**: Queue enqueue
   ```
   TRACE: Queue enqueue operation { requestId: "...", queueName: "...", ... }
   ```

7. **Bus Stop 7**: Response formation
   ```
   TRACE: Response formed { response: { requestId: "...", status: "...", ... } }
   ```

8. **Bus Stop 8**: API response sent
   ```
   TRACE: API response sent { statusCode: 202, responseSize: ..., ... }
   ```

9. **Bus Stop 9**: Client receives response
   ```
   TRACE: Client received response { status: "...", requestId: "...", ... }
   ```

10. **Bus Stop 10**: UI state update
    ```
    TRACE: UI state updated { loading: false, success: true, ... }
    ```

## Failure Mode Checklist

### Common Failure Points
- [ ] **Stop 1 Fails**: Button not connected to handler
- [ ] **Stop 3 Fails**: API endpoint returns 404
- [ ] **Stop 5 Fails**: Redis connection refused
- [ ] **Stop 6 Fails**: Queue initialization error
- [ ] **Stop 8 Fails**: Response serialization error

### Error Messages to Verify
- Empty basket: "Your basket is empty"
- Network error: "Failed to create reservation"
- Invalid data: Appropriate validation error
- Processing error: Clear error message with retry option

## Performance Checks

### Response Times
- [ ] Button click to processing state: < 100ms
- [ ] API request to response: < 500ms
- [ ] Queue enqueue operation: < 200ms
- [ ] Total flow: < 1 second

### Memory Leaks
- [ ] No growing console errors on repeated clicks
- [ ] Redis queue doesn't grow indefinitely
- [ ] Browser memory stable after multiple attempts

## Accessibility Verification

### Button States
- [ ] Disabled state has aria-disabled="true"
- [ ] Loading state has appropriate aria-label
- [ ] Error state announced to screen readers

### Focus Management
- [ ] Button remains focusable during states
- [ ] Error messages are focusable
- [ ] Success feedback is perceivable

## Cleanup After Testing

```bash
# Clear test data
redis-cli flushdb

# Check Redis is clean
redis-cli DBSIZE
# Should return: (integer) 0
```

## Notes
- Each test should be run independently
- Clear Redis between test scenarios
- Document any deviations from expected behavior
- Take screenshots of any failures for debugging
