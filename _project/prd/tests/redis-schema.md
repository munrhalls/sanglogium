# Redis Schema Test Specification

## Test Overview
Tests the Redis schema for reservation TTL management, circuit breaker state, and idempotency caching.

## Test 1: Reservation Token TTL Creation

### Setup
- Redis connection active
- Reservation token generated

### Test Steps
1. Create reservation token
2. Set Redis key with 600 second TTL
3. Verify key exists with correct data
4. Check TTL value is exactly 600 seconds
5. Verify JSON data structure correct
6. Test with multiple tokens

### Verification
- Keys created with proper TTL
- Data structure matches specification
- TTL values accurate

## Test 2: Reservation Token Expiry

### Setup
- Reservation token in Redis
- TTL monitoring enabled

### Test Steps
1. Create reservation with 10 second TTL (for testing)
2. Monitor key countdown
3. Wait for expiration
4. Verify key automatically deleted
5. Check expiration event triggered
6. Verify cleanup job notified

### Verification
- TTL countdown works
- Automatic deletion on expiry
- Expiration events fired

## Test 3: Reservation Token Removal

### Setup
- Active reservation token
- Cancel operation triggered

### Test Steps
1. Create reservation token
2. Verify key exists
3. Remove token via DEL command
4. Confirm key deleted
5. Check TTL cancelled
6. Verify no expiration event

### Verification
- Manual deletion works
- TTL properly cancelled
- No false expiration events

## Test 4: Circuit Breaker State Persistence

### Setup
- Circuit breaker manager active
- Service name configured

### Test Steps
1. Set circuit breaker to OPEN state
2. Verify state persisted to Redis
3. Restart circuit breaker service
4. Verify state recovered from Redis
5. Update state to HALF_OPEN
6. Check state updates persist

### Verification
- State persists across restarts
- Transitions saved correctly
- Recovery works properly

## Test 5: Circuit Breaker Failure Counting

### Setup
- Circuit breaker in CLOSED state
- Failure tracking enabled

### Test Steps
1. Increment failure count
2. Verify count increases
3. Check failure counter key exists
4. Increment to threshold (5 failures)
5. Verify circuit breaker opens
6. Reset failure count
7. Verify count resets to 0

### Verification
- Failure counting works
- Threshold triggers opening
- Reset functionality works

## Test 6: Idempotency Cache Storage

### Setup
- Idempotency manager active
- Request fingerprint generated

### Test Steps
1. Store response with idempotency key
2. Verify data stored correctly
3. Check TTL is 24 hours (86400 seconds)
4. Retrieve cached response
5. Verify response matches original
6. Test with different request fingerprint

### Verification
- Cache stores responses correctly
- TTL set to 24 hours
- Retrieval returns exact response

## Test 7: Idempotency Cache Expiry

### Setup
- Cached idempotency response
- Short TTL for testing

### Test Steps
1. Cache response with 5 second TTL
2. Retrieve immediately (should work)
3. Wait for expiration
4. Attempt retrieval (should fail)
5. Verify key automatically deleted
6. Check no memory leak

### Verification
- Cache expires correctly
- Automatic cleanup works
- No expired data remains

## Test 8: Concurrent Redis Operations

### Setup
- Multiple simultaneous operations
- Redis connection pool

### Test Steps
1. Create 10 reservations simultaneously
2. Verify all keys created
3. Check no race conditions
4. Delete 5 reservations concurrently
5. Verify only specified keys deleted
6. Test mixed operations

### Verification
- Concurrent operations safe
- No race conditions
- Operations atomic

## Test 9: Redis Connection Resilience

### Setup
- Redis with connection monitoring
- Connection failure simulation

### Test Steps
1. Disconnect Redis temporarily
2. Attempt operation (should fail)
3. Reconnect Redis
4. Verify operations resume
5. Check no data lost
6. Test with multiple disconnections

### Verification
- Connection failures handled
- Automatic reconnection works
- Data integrity maintained

## Test 10: Key Pattern Validation

### Setup
- Various key operations
- Pattern matching enabled

### Test Steps
1. Create reservation key pattern
2. Verify pattern matches specification
3. Create circuit breaker key
4. Check pattern consistency
5. Test idempotency key pattern
6. Verify all patterns correct

### Verification
- Key patterns follow spec
- No pattern conflicts
- Naming consistent

## Test 11: Memory Usage and Cleanup

### Setup
- Redis memory monitoring
- Large dataset test

### Test Steps
1. Create 1000 reservation keys
2. Monitor memory usage
3. Let keys expire naturally
4. Verify memory freed
5. Test manual cleanup
6. Check no memory fragmentation

### Verification
- Memory usage scales linearly
- Expired keys free memory
- Cleanup effective

## Test 12: Redis Security and Access

### Setup
- Redis with authentication
- Access control configured

### Test Steps
1. Test with valid credentials
2. Verify operations succeed
3. Test with invalid credentials
4. Verify access denied
5. Check key isolation
6. Test unauthorized key access

### Verification
- Authentication works
- Access control enforced
- Data isolation maintained

## Test 13: Performance Benchmarks

### Setup
- Redis performance monitoring
- Benchmark tools ready

### Test Steps
1. Measure SET operation latency
2. Measure GET operation latency
3. Test DEL operation speed
4. Benchmark concurrent operations
5. Check throughput limits
6. Verify sub-millisecond latency

### Verification
- Operations meet performance targets
- Latency within acceptable range
- Throughput scales with load

## Test 14: Redis Cluster Compatibility

### Setup
- Redis cluster configured
- Multiple nodes active

### Test Steps
1. Create keys on different nodes
2. Verify cluster distribution
3. Test node failure handling
4. Check automatic failover
5. Verify data consistency
6. Test cluster rejoining

### Verification
- Cluster distribution works
- Failover automatic
- Data consistent across nodes
