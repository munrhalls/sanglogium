# Async Queue Testing Verification

**Date:** 2026-04-13
**Source**: Real reservation API testing challenges
**Severity**: High
**Frequency**: Universal (applies to all queue-based systems)

## The Problem
API returned 202 (processing) but tests failed because actual queue processing happened asynchronously. Tests were checking immediate results instead of eventual state.

## Root Cause
Queue-based systems have two phases:
1. **Immediate Response**: API acknowledges request (202)
2. **Async Processing**: Queue worker processes the request

Tests only verified phase 1, missing phase 2 failures.

## The Fix
```typescript
test('Async queue processing', async ({ request }) => {
  // Phase 1: Submit request
  const response = await request.post('/api/checkout/reserve', {
    data: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } }
  })
  
  expect(response.status()).toBe(202)
  const { reservationId } = await response.json()
  
  // Phase 2: Wait for async processing
  await waitForQueueProcessing(reservationId)
  
  // Phase 3: Verify eventual state
  const reservation = await getReservationFromRedis(reservationId)
  expect(reservation.state).toBe('ACTIVE')
  
  // Phase 4: Verify side effects
  const product = await getProductFromSanity('p1')
  expect(product.reservedStock).toBe(1)
})

async function waitForQueueProcessing(reservationId: string, timeout = 5000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const reservation = await getReservationFromRedis(reservationId)
    if (reservation?.state === 'ACTIVE') {
      return
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Queue processing timeout')
}
```

## Prevention
**MANDATORY ASYNC QUEUE TESTING PROTOCOL:**

1. **Three-Phase Verification**
   ```typescript
   // Always test all three phases
   // 1. API Response (immediate)
   // 2. Queue Processing (async)
   // 3. Side Effects (eventual)
   ```

2. **Polling Pattern**
   ```typescript
   async function waitForAsyncState(
     checkFn: () => Promise<boolean>,
     timeout = 5000,
     interval = 100
   ) {
     const start = Date.now()
     while (Date.now() - start < timeout) {
       if (await checkFn()) return
       await new Promise(resolve => setTimeout(resolve, interval))
     }
     throw new Error('Async state timeout')
   }
   ```

3. **State Verification Pattern**
   ```typescript
   // Check intermediate states
   test('queue states', async () => {
     const reservationId = await submitRequest()
     
     // Should be processing immediately
     const immediate = await getReservation(reservationId)
     expect(immediate.state).toBe('PROCESSING')
     
     // Wait for completion
     await waitForAsyncState(async () => {
       const r = await getReservation(reservationId)
       return r.state === 'ACTIVE'
     })
     
     // Verify final state
     const final = await getReservation(reservationId)
     expect(final.state).toBe('ACTIVE')
   })
   ```

4. **Error Handling Pattern**
   ```typescript
   test('queue failure handling', async () => {
     // Submit invalid request
     const response = await request.post('/api/checkout/reserve', {
       data: { clientBasket: { products: [] } }  // Invalid
     })
     
     expect(response.status()).toBe(202)  // Still 202!
     
     // Wait for async failure
     await waitForAsyncState(async () => {
       const reservation = await getReservation(reservationId)
       return reservation.state === 'FAILED'
     })
     
     // Verify failure recorded
     const failed = await getReservation(reservationId)
     expect(failed.error).toBeDefined()
   })
   ```

5. **Timeout Configuration**
   ```typescript
   // Configure appropriate timeouts
   const QUEUE_TIMEOUT = 5000  // 5 seconds for normal ops
   const SLOW_QUEUE_TIMEOUT = 30000  // 30 seconds for heavy ops
   ```

## Common Pitfalls

1. **Race Conditions**
   ```typescript
   // BAD - Assumes immediate processing
   const result = await submitRequest()
   expect(result.processed).toBe(true)
   
   // GOOD - Waits for processing
   await waitForProcessing(result.id)
   expect((await getResult(result.id)).processed).toBe(true)
   ```

2. **Missing Side Effects**
   ```typescript
   // Always verify the actual work was done
   // Not just that the queue job completed
   ```

3. **Infinite Waits**
   ```typescript
   // Always have a timeout
   // Fail fast if queue is broken
   ```

## Testing Strategies

1. **Happy Path**: Normal flow, all phases succeed
2. **Queue Failure**: Invalid data, processing errors
3. **Timeout**: Queue never processes
4. **Concurrent**: Multiple requests at once
5. **Recovery**: Queue restarts with pending jobs

## Applicability
**When to apply:**
- All queue-based APIs
- Background job systems
- Event-driven architectures
- WebSocket message processing
- Any async workflow

**Keywords:** ["async-queue", "eventual-consistency", "polling", "timeout", "race-conditions", "background-jobs"]
