# Opus Prompt: Fix Critical Queue Implementation Violation

## Task
Fix the FIFO queue implementation to comply with PRD requirement. Current implementation uses in-memory arrays which violates persistence and atomic processing requirements.

## Critical Issue
**PRD Line 79**: "Queue is implemented with Redis Streams (or BullMQ) for persistence, atomic processing, and priority support."

**Current Implementation**: Uses in-memory JavaScript arrays (`private normalQueue: QueueRequest[] = []`)

## Why This Is Critical
- In-memory queue = NO persistence (loses all requests on server restart)
- In-memory queue = NO atomic processing (race conditions guaranteed)
- In-memory queue = NO real priority support (fake priority)
- In-memory queue = NOT operational under load (will lose reservations)

## Context
The implementation was created with 15 files total, but the core queue (lib/checkout/reservation/fifo-queue.ts) violates the fundamental PRD requirement.

## Exact Fix Required
Replace in-memory queue implementation with Redis Streams (preferred) or BullMQ. Must maintain:

1. **Priority Support**: Priority queue processed before regular FIFO
2. **Persistence**: Requests survive server restarts
3. **Atomic Processing**: Single request at a time with Redis transactions
4. **All Existing Features**: Idempotency, circuit breaker, retry logic, token state machine

## Files to Modify
- `lib/checkout/reservation/fifo-queue.ts` - Complete rewrite
- `tests/checkout/guest-checkout-inventory-reservation/integration/checkout-button-to-redis-queue/queue-operations.test.ts` - Update tests
- `tests/checkout/guest-checkout-inventory-reservation/integration/checkout-button-to-redis-queue/human-verification/queue-operations.todo` - Update verification

## Implementation Approach
Use Redis Streams with:
- `XADD` to enqueue requests
- `XREADGROUP` with consumer group for processing
- Separate streams for normal and priority queues
- Maintain all existing queue behavior and interfaces

## Constraints
- No new dependencies (use existing ioredis)
- Maintain backward compatibility with existing API
- Keep all error handling and retry logic
- Preserve token state machine logic

## Success Criteria
- Queue uses Redis Streams (not in-memory arrays)
- All existing tests pass
- Requests persist across server restarts
- Atomic processing guaranteed
- Priority queue works correctly
