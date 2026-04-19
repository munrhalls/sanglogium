# Tech Stack: Queue System

## Decision: Redis Streams (Native Redis)

## Evidence-Based Reasoning

### Option 1: Bee-Queue
**Pros:**
- Simple (~1000 LOC)
- Minimal dependencies
- Fast (minimizes Redis overhead)

**Cons:**
- NO priority queue support (dealbreaker for our requirements)
- Not actively maintained (last update 2021)

**Evidence:** Bee-Queue README explicitly states "Bee-Queue currently does not [support job prioritization]"

**Verdict:** ❌ Rejected - Missing core requirement (priority queues)

---

### Option 2: BullMQ
**Pros:**
- Has priority queue support
- Robust feature set
- Actively maintained

**Cons:**
- Complex configuration (maxRetriesPerRequest: null required for Workers)
- Heavy abstraction layer (Workers, Queues, connection management)
- Configuration errors (as demonstrated by current issue)

**Evidence:** BullMQ documentation requires `maxRetriesPerRequest: null` for Worker connections, causing configuration complexity

**Verdict:** ⚠️ Overcomplicated - Configuration complexity outweighs benefits

---

### Option 3: Redis Streams (Native)
**Pros:**
- Native Redis feature (already in use in codebase)
- Supports priority queues natively
- No third-party dependency
- Direct control over implementation
- Persistent (append-only log)
- Atomic operations
- Simple connection (single ioredis client)

**Cons:**
- Requires manual implementation of retry logic
- Requires manual implementation of circuit breaker

**Evidence:** Redis documentation confirms priority queue support via sorted sets and multiple streams

**Verdict:** ✅ Recommended - Simplest, most robust, fits existing stack

---

## Pragmatic Check

### Existing Code Stack Relevance
- **Redis:** Already using ioredis in codebase (redis-client.ts)
- **Node.js:** Primary runtime
- **Next.js:** Framework (no conflict)
- **Sanity CMS:** Target system (no conflict)

**Fit:** Perfect - Redis Streams uses existing Redis infrastructure

### Complexity Analysis
- **BullMQ:** 2+ abstraction layers (Worker, Queue, Connection)
- **Bee-Queue:** 1 abstraction layer (missing features)
- **Redis Streams:** 0 abstraction layers (direct Redis commands)

**Winner:** Redis Streams (zero abstraction, direct control)

### Maintenance Burden
- **BullMQ:** Third-party dependency updates, API changes
- **Bee-Queue:** Not maintained, missing features
- **Redis Streams:** Native Redis (updates managed by Redis team)

**Winner:** Redis Streams (lowest maintenance burden)

---

## Final Decision

**Tech Stack:** Redis Streams (Native Redis)

**Rationale:**
1. Fits existing code stack (Redis already in use)
2. Meets all core requirements (FIFO, atomic, persistence, priority)
3. Zero abstraction complexity (direct Redis commands)
4. Lowest maintenance burden (native Redis)
5. Evidence-based: Bee-queue missing priority, BullMQ overcomplicated

**Tradeoffs:**
- Manual implementation of retry logic (acceptable - simple pattern)
- Manual implementation of circuit breaker (acceptable - simple pattern)
