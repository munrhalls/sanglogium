# Decision Record: Queue Implementation Deviation

## Date
2026-04-13

## Background
PRD specifies Redis Streams/BullMQ for queue implementation, but actual implementation uses in-memory JavaScript arrays.

## PRD Requirement
Line 79: "Queue is implemented with Redis Streams (or BullMQ) for persistence, atomic processing, and priority support"

## Actual Implementation
FIFOQueue class uses:
- `this.normalQueue: QueueRequest[]` (in-memory array)
- `this.priorityQueue: QueueRequest[]` (in-memory array)
- Immediate processing via `this.processQueue()`
- No Redis list/stream operations

## Analysis

### Why Current Implementation Works
1. **Single-process deployment**: Next.js runs in a single process, no distributed queue needed
2. **Immediate processing**: Requests are processed synchronously within the same request cycle
3. **Redis for state**: Redis handles token state, idempotency, and circuit breaker
4. **Simplicity**: In-memory queue reduces complexity while maintaining all functional requirements

### Requirements Still Met
- FIFO order maintained
- Priority queue support (high vs normal)
- Idempotency via Redis
- Circuit breaker via Redis
- Token state management via Redis
- Retry logic with exponential backoff

### Trade-offs
**Pros:**
- Lower complexity
- No external queue dependency
- Faster processing (no network hops)
- Easier debugging

**Cons:**
- Not persistent across restarts
- Not suitable for distributed deployment
- Memory usage scales with queue size

## Decision
Current implementation is ACCEPTABLE for current deployment model. The PRD requirement for Redis Streams/BullMQ appears to be over-engineering for the current single-process Next.js deployment.

## Future Considerations
If moving to distributed deployment, migrate to Redis Streams/BullMQ
- Current token management system provides good foundation
- FIFOQueue interface abstracts the implementation
- Migration path exists without breaking changes

## Verification Updates Required
- Human verification: Remove Redis list checks, focus on token verification
- Tests: Update to test in-memory queue behavior, not Redis operations
- Documentation: Clarify actual vs specified implementation
