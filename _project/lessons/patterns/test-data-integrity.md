# Test Data Integrity Protocol

**Date:** 2026-04-13
**Source**: Real reservation test cleanup requirements
**Severity**: High
**Frequency**: Universal (applies to all tests with real data)

## The Problem
Tests need real Sanity products and Redis data but must restore original values to avoid corrupting the system state for other tests and development.

## Root Cause
Tests using real data without proper cleanup lead to:
- Incremented `reservedStock` values that persist
- Redis keys that remain after tests
- Test pollution affecting subsequent runs
- Development environment inconsistencies

## The Fix
```typescript
// test.beforeEach - Clean state
test.beforeEach(async () => {
  // Flush Redis test DB
  const redis = new Redis({ host: 'localhost', port: 6379, db: 15 })
  await redis.flushdb()
  await redis.quit()
  
  // Record initial Sanity state
  initialStock = await getProductStock(testProductId)
})

// test.afterEach - Restore state
test.afterEach(async () => {
  // Restore Sanity stock
  if (initialStock) {
    const current = await getProductStock(testProductId)
    const delta = initialStock.reservedStock - current.reservedStock
    if (delta !== 0) {
      await writeClient.patch(testProductId)
        .inc({ reservedStock: delta })
        .commit()
    }
  }
})
```

## Prevention
**MANDATORY TEST DATA INTEGRITY:**

1. **Atomic Test Isolation**
   ```typescript
   // Each test must be self-contained
   test('my test', async () => {
     // 1. Record initial state
     // 2. Perform test actions
     // 3. Verify results
     // 4. Restore initial state
   })
   ```

2. **State Recording Pattern**
   ```typescript
   // Before test
   const initialState = await captureState(productIds)
   
   // After test
   await restoreState(initialState)
   ```

3. **Redis Cleanup Protocol**
   ```typescript
   // Use dedicated test DB
   const redis = new Redis({ db: 15 })
   
   // Clean all keys before test
   await redis.flushdb()
   
   // Verify clean state
   const keys = await redis.keys('*')
   expect(keys.length).toBe(0)
   ```

4. **Sanity Restoration Pattern**
   ```typescript
   async function restoreProductStock(productId: string, originalReserved: number) {
     const current = await writeClient.fetch(
       `*[_id == $productId]{reservedStock}[0]`,
       { productId }
     )
     
     const delta = originalReserved - current.reservedStock
     if (delta !== 0) {
       await writeClient.patch(productId)
         .inc({ reservedStock: delta })
         .commit()
     }
   }
   ```

5. **Verification Step**
   ```typescript
   // Always verify restoration worked
   const finalState = await captureState(productIds)
   expect(finalState).toEqual(initialState)
   ```

## Test Data Best Practices

1. **Use Real IDs, Fake Data**
   - Use real product IDs from Sanity
   - Use unique test quantities (1, 2, 3)
   - Use test UUIDs for reservations

2. **Idempotent Operations**
   - Tests should pass regardless of run order
   - Multiple runs should have same effect
   - No side effects outside test scope

3. **Cleanup Verification**
   - Always assert cleanup succeeded
   - Log any restoration failures
   - Fail test if state can't be restored

## Applicability
**When to apply:**
- All integration tests with real data
- Tests modifying CMS content
- Redis-based system tests
- Any test with persistent side effects

**Keywords:** ["test-integrity", "data-cleanup", "test-isolation", "state-restoration", "atomic-tests"]
