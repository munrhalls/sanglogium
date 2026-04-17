# Post-Opus Implementation Fixing Plan

## Executive Summary
Opus implemented the guest checkout reservation system with all core components. However, several gaps were identified that need fixing for production readiness. All issues are non-critical and fixable.

## Issues & Fixes by Priority

### 1. In-memory Token/Idempotency Stores (MEDIUM)
**Issue**: `fifo-queue.ts` uses `Map()` for `tokenStore` and `idempotencyStore` instead of Redis
**Impact**: Breaks multi-instance deployments, data loss on restart
**Files**: `lib/checkout/reservation/fifo-queue.ts` (lines 27-28)

**Fix Plan**:
1. Create Redis managers for token and idempotency storage
2. Replace `Map<string, ReservationToken>` with Redis operations
3. Replace `Map<string, {requestFingerprint, response}>` with Redis hash
4. Update all token/idempotency operations to use Redis
5. Add TTL for idempotency keys (24 hours per PRD)

### 2. Missing Queue Callbacks (MEDIUM)
**Issue**: Queue has optional callbacks but they're not wired in API routes
**Impact**: Sanity stock updates not executed through queue
**Files**: `app/api/checkout/route.ts`, `lib/checkout/reservation/fifo-queue.ts`

**Fix Plan**:
1. Create Sanity stock update functions:
   - `createReservationHandler()` - decrement stock
   - `rollbackReservationHandler()` - restore stock
   - `realizeReservationHandler()` - finalize order
2. Wire handlers in API route when creating FIFOQueue instance
3. Replace direct Sanity operations in `route.ts` with queue enqueue
4. Ensure atomic operations within queue handlers

### 3. Optimistic Sanity Stock Logic (LOW)
**Issue**: No rollback on partial Sanity patch failure
**Impact**: Stock inconsistencies if some patches fail
**Files**: `app/api/checkout/route.ts` (lines 164-174, 218-234)

**Fix Plan**:
1. Wrap entire create flow in try/catch
2. On any error, call `removeReservationToken()` to cleanup
3. Use Sanity transactions for atomic multi-product updates
4. Add proper error logging for partial failures
5. Ensure idempotency cleanup on errors

### 4. Webhook Route Gaps (LOW)
**Issue**: Missing priority queue integration for payment realize
**Impact**: Payment success doesn't use priority queue as per PRD
**Files**: `app/api/webhooks/stripe/route.ts`

**Fix Plan**:
1. Import FIFOQueue instance (singleton pattern)
2. Replace direct `removeReservationToken()` with priority enqueue:
   ```typescript
   await queue.enqueue({
     type: 'realize_reservation',
     priority: 'high',
     reservationToken,
     idempotencyKey: `payment-${paymentIntent.id}`
   })
   ```
3. Add proper error handling for queue failures
4. Ensure webhook signature verification remains

### 5. UI Component Wiring (LOW)
**Issue**: Some dialogs and ReservedBasketView need final wiring
**Impact**: UI may not show all states correctly
**Files**: `components/checkout/reservation/`

**Fix Plan**:
1. Verify ReservedBasketView displays:
   - Full availability state
   - Stock decrement message
   - Out of stock message
   - Operation in progress state
2. Wire ConfirmDialog to CancelButton properly
3. Connect ApproveButton to queue for decremented baskets
4. Test all UI state transitions

## Implementation Sequence

### Phase 1: Core Infrastructure (Day 1)
1. Fix in-memory stores in FIFOQueue
2. Create Redis managers
3. Update queue to use Redis throughout
4. Test multi-instance compatibility

### Phase 2: API Integration (Day 2)
1. Create Sanity handler functions
2. Wire callbacks in queue instantiation
3. Replace direct Sanity operations with queue
4. Add proper error handling and rollback

### Phase 3: Webhook & UI Polish (Day 3)
1. Update webhook to use priority queue
2. Verify UI component wiring
3. Test complete end-to-end flow
4. Add monitoring for stuck reservations

## Testing Strategy

### Unit Tests
- Test Redis managers persistence
- Test queue with Redis backend
- Test Sanity handlers atomicity

### Integration Tests
- Test API route with queue
- Test webhook priority processing
- Test error scenarios and rollback

### E2E Tests
- Complete reservation flow
- Payment success webhook
- Multi-tab concurrency

## Risk Assessment

### Low Risk
- UI component wiring
- Error handling improvements

### Medium Risk
- Changing from Map to Redis (data migration)
- Queue callback integration

### Mitigations
- Run Redis migration scripts during deployment
- Keep old Map code as fallback initially
- Extensive testing in staging environment

## Success Criteria

1. All token/idempotency data persists across restarts
2. Sanity stock updates are atomic and rollback-safe
3. Payment webhooks use priority queue
4. UI shows all 5 states correctly
5. No stuck reservations after failures

## Rollback Plan

If issues arise:
1. Revert to Map-based storage (temporary)
2. Restore direct Sanity operations
3. Keep Redis for TTL only
4. Fix issues in next deployment

## Notes
- All fixes are backward compatible
- No breaking changes to API contracts
- Redis dependency already exists
- Queue architecture supports these changes
