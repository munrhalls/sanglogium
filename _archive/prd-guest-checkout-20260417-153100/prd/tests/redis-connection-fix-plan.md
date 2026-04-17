# Redis Connection Fix Plan

## Intelligence Gathering

### Current Issue
- Using `ioredis` library to connect to Upstash Redis
- DNS resolution error: `getaddrinfo ENOTFOUND redis.upstash.io`
- Current configuration attempts to resolve `redis.upstash.io` which doesn't exist
- Upstash uses REST API, not direct Redis protocol

### Root Cause Analysis
1. **Wrong Connection Method**: Using `ioredis` (Redis protocol) instead of `@upstash/redis` (HTTP/REST)
2. **Wrong Host**: Trying to resolve `redis.upstash.io` instead of using the REST URL
3. **Missing Package**: `@upstash/redis` package not installed

### Upstash Redis Architecture
- Upstash provides Redis-compatible API via HTTP/REST
- Direct Redis connections use different endpoint format
- `@upstash/redis` is the official client for Upstash

## Implementation Plan

### Phase 1: Install Correct Package
```bash
npm install @upstash/redis
```

### Phase 2: Update Connection Method
Replace `ioredis` with `@upstash/redis` in all scripts:

**Current (broken):**
```javascript
const Redis = require('ioredis')
const redis = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL ? 'redis.upstash.io' : 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '1')
})
```

**Fixed:**
```javascript
import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
// Or simpler:
const redis = Redis.fromEnv()
```

### Phase 3: Update Scripts
1. `verify-test-env-simple.cjs`
2. `migrate-reservations-field.cjs`
3. `setup-test-data.cjs`
4. Any other scripts using Redis

### Phase 4: Test Connection
Verify with simple connection test script.

## Files to Modify

### 1. verify-test-env-simple.cjs
- Replace import
- Update Redis initialization
- Keep same API calls (get, set, ping)

### 2. migrate-reservations-field.cjs
- Replace import
- Update Redis initialization
- No API changes needed

### 3. setup-test-data.cjs
- Replace import
- Update Redis initialization
- No API changes needed

### 4. Test Files
- `redis-schema.test.ts`
- `basic-reservation-flow.test.ts`
- Any other test files using Redis

## Implementation Details

### Package Installation
```bash
npm install @upstash/redis
```

### Connection Pattern
```javascript
// Option 1: Explicit config
import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Option 2: From environment (recommended)
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()
```

### API Compatibility
The `@upstash/redis` client maintains Redis API compatibility:
- `redis.get(key)`
- `redis.set(key, value)`
- `redis.del(key)`
- `redis.expire(key, ttl)`
- `redis.setex(key, ttl, value)`

## Verification Steps

1. Install `@upstash/redis`
2. Update one script to use new client
3. Test connection with simple ping
4. Update remaining scripts
5. Run full environment verification
6. Verify tests pass

## Benefits

1. **Proper Upstash Integration**: Uses official Upstash client
2. **HTTP/REST Protocol**: No DNS resolution issues
3. **Same API**: Minimal code changes required
4. **Better Performance**: Optimized for Upstash architecture

## Risk Mitigation

1. **Backup Current Scripts**: Keep originals until verified
2. **Test Incrementally**: Update one script at a time
3. **API Compatibility**: `@upstash/redis` maintains Redis API
4. **Rollback Plan**: Can revert to `ioredis` if needed

## Timeline

- **Phase 1**: 5 minutes (install package)
- **Phase 2**: 10 minutes (update scripts)
- **Phase 3**: 5 minutes (test connection)
- **Total**: 20 minutes

This fix will resolve the Redis connection issue and enable proper TTL management for the reservation system.
