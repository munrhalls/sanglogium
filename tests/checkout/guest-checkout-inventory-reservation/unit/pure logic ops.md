Based on the PRD and implementation, here are the pure logic operations:

Core Queue Operations:

# Enqueue requests (BullMQ queue.add for priority, BullMQ queue.add for normal)
Dequeue requests (BullMQ Worker with concurrency=1 for FIFO)
Acknowledge completion (BullMQ automatic on job completion)
Delete processed messages (BullMQ removeOnComplete/removeOnFail settings)
Get queue lengths (BullMQ queue.getWaiting())
Token State Machine Logic:


# FREE → RESERVING → ACTIVE → CANCELLING/REALIZING → FREE
Atomic state transitions with Redis locks
State validation before operations
Idempotency Logic:

# Generate UUIDv4 idempotency keys
Cache responses for 24 hours
Validate request fingerprints match original
Return cached response on duplicate keys
Priority Processing Logic:

# Priority queue processed before normal queue
Payment realize requests go to priority
Regular reservations go to normal queue
Circuit Breaker Logic:

# Track consecutive failures (count to 5)
Open state after threshold (fail fast)
Half-open probe after cooldown (30 seconds)
Close on success, stay open on failure
Retry Logic:

# Exponential backoff calculation (1s base, ±25% jitter)
Max retries: 3 for create, 10 for rollback
Transient vs non-transient error classification
Delay calculation between retries
Stock Management Logic:

# Two-phase pattern: Redis reserve → Sanity patch
WATCH/MULTI for optimistic locking
Stock calculations: stock - reservedStock = availableStock
Reservation increments reservedStock only
Realize decrements both stock and reservedStock
Rollback decrements reservedStock only
Request Validation Logic:

# Content-Type validation
Idempotency-Key header validation
Parameter fingerprint matching
Concurrent operation detection
UI State Logic:

# Basket status calculation (none/full/decremented/empty)
Event deduplication (1-second debounce)
State transitions based on reserved basket contents
Timeout Logic:

# 10-minute TTL on reservation tokens
Automatic rollback on timeout
TTL management in Redis