# Redis Test Database Isolation

**Date:** 2026-04-13
**Source**: Real reservation test implementation
**Severity**: High
**Frequency**: Universal (applies to all Redis-based systems)

## The Problem
Tests were using Redis default DB (0), interfering with development data and causing test pollution. Multiple test runs created duplicate keys and inconsistent state.

## Root Cause
No Redis database isolation strategy - tests and development shared the same Redis instance.

## The Fix
```typescript
// Test configuration - Use dedicated DB
const redis = new Redis({
  host: process.env.GUEST_CHECKOUT_REDIS_HOST || 'localhost',
  port: parseInt(process.env.GUEST_CHECKOUT_REDIS_PORT || '6379'),
  db: parseInt(process.env.GUEST_CHECKOUT_REDIS_DB || '15'), // Test DB
})

// Clean before each test
test.beforeEach(async () => {
  await redis.flushdb()
})

// Verify isolation
test('Redis isolation works', async () => {
  await redis.set('test-key', 'test-value')
  
  // Development DB (0) should not have this
  const devRedis = new Redis({ db: 0 })
  const devValue = await devRedis.get('test-key')
  expect(devValue).toBeNull()
  
  await devRedis.quit()
})
```

## Prevention
**MANDATORY REDIS ISOLATION PROTOCOL:**

1. **Database Allocation**
   ```
   DB 0: Development
   DB 1-14: Other environments (staging, feature branches)
   DB 15: Tests (exclusive)
   DB 16+: Reserved for future use
   ```

2. **Environment Variable Pattern**
   ```typescript
   // .env.local
   REDIS_DB=0  # Development
   GUEST_CHECKOUT_REDIS_DB=15  # Tests
   
   // Code
   const db = process.env.NODE_ENV === 'test' ? 15 : 0
   ```

3. **Test Setup Template**
   ```typescript
   // In every test file using Redis
   import Redis from 'ioredis'
   
   test.describe('Redis Tests', () => {
     let redis: Redis
     
     test.beforeAll(async () => {
       redis = new Redis({
         host: 'localhost',
         port: 6379,
         db: 15  // ALWAYS use test DB
       })
     })
     
     test.beforeEach(async () => {
       await redis.flushdb()
     })
     
     test.afterAll(async () => {
       await redis.quit()
     })
   })
   ```

4. **Connection Factory Pattern**
   ```typescript
   // lib/redis.ts
   export function createRedisClient(db?: number) {
     return new Redis({
       host: process.env.REDIS_HOST || 'localhost',
       port: parseInt(process.env.REDIS_PORT || '6379'),
       db: db || parseInt(process.env.REDIS_DB || '0')
     })
   }
   
   // Usage
   const devRedis = createRedisClient(0)
   const testRedis = createRedisClient(15)
   ```

5. **Verification Commands**
   ```bash
   # Check what's in each DB
   redis-cli -n 0 keys "*"  # Development
   redis-cli -n 15 keys "*" # Tests
   
   # Switch between DBs
   redis-cli -n 15  # Test DB
   redis-cli -n 0   # Development DB
   ```

## Key Patterns

1. **Key Prefixing for Tests**
   ```typescript
   // Even with isolation, use prefixes
   const TEST_PREFIX = 'test:'
   await redis.set(`${TEST_PREFIX}reservation:${id}`, data)
   ```

2. **Cleanup Verification**
   ```typescript
   test.afterEach(async () => {
     const keys = await redis.keys('*')
     expect(keys.length).toBe(0)
   })
   ```

3. **Parallel Test Safety**
   ```typescript
   // Use unique identifiers in parallel tests
   const uniqueId = `${Date.now()}_${Math.random()}`
   await redis.set(`test:${uniqueId}`, value)
   ```

## Benefits

1. **No Test Pollution** - Tests can't affect development data
2. **Parallel Execution** - Multiple test suites can run simultaneously
3. **Consistent State** - Each test starts with clean Redis
4. **Debugging Isolation** - Test failures don't corrupt dev environment
5. **CI/CD Safety** - Tests run in isolated environment

## Applicability
**When to apply:**
- All Redis-based system tests
- Queue system testing
- Cache testing
- Session management tests
- Any test with persistent state

**Keywords:** ["redis", "test-isolation", "database-separation", "test-db", "parallel-testing", "state-management"]
