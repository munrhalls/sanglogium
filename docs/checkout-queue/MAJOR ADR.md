# Major ADR: Checkout Queue Architecture

## ADR #0: Atomic FIFO Processing with Redis

## Context
Concurrent checkout attempts can cause race conditions. Multiple users can click checkout simultaneously, leading to:
- Corrupted reservedStock values
- Double-reservation of the same products
- Stock mis-counting
- Sanity transactions don't prevent concurrent document creation

Without serialization, concurrent requests could process out of order, causing data integrity issues.

## Decision
Use atomic FIFO processing with Redis SET NX + FIFO head check:
- Redis SET NX for atomic lock acquisition (fails if lock already held)
- FIFO head check via LINDEX (only request at index 0 proceeds)
- Spin loop with 25ms retry interval until request reaches head
- 45s timeout to prevent infinite waits
- Sanity transaction for atomic reservedStock increments
- Unique requestId as Sanity document _id to prevent duplicate reservations

## Consequences
- Positive: Prevents race conditions under load, ensures data integrity, serializes reservation writes
- Positive: Only one request processes at a time (via lock + head check)
- Positive: Requests process in order (FIFO queue)
- Positive: ReservedStock increments are atomic (Sanity transaction)
- Positive: No double-reservations (unique requestId as doc _id)
- Negative: Adds Redis dependency
- Negative: 25ms retry overhead for non-head requests
- Negative: 45s timeout means some requests may fail under extreme load

This is the correct solution for this constraint. Without it, the system would be vulnerable to race conditions under load.
