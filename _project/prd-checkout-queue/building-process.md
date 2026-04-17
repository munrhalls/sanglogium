# Queue Building Process

## End State
A Redis Streams-based queue system that:
- Enqueues reservation requests from UI
- Processes requests sequentially and atomically
- Supports priority queue for payment realize
- Implements idempotency, retry logic, circuit breaker
- Prevents race conditions in Sanity CMS stock operations

---

## Component Building Blocks (Order of Execution)

### Block 1: Redis Connection
**Purpose:** Establish single Redis client for queue operations
**Why first:** All queue operations depend on Redis connection

**Step 1.1: Skeleton**
- Create `lib/queue/redis-client.ts`
- Export function `getQueueRedisClient()`
- Returns ioredis instance
- No actual connection yet

**Verification:**
- [ ] File exists
- [ ] Function exported
- [ ] TypeScript compiles

**Step 1.2: Connection**
- Connect to Redis using existing environment variables
- Reuse existing Redis configuration from project
- Add connection logging
- Test connection with ping

**Verification:**
- [ ] Redis connection successful
- [ ] Ping returns PONG
- [ ] Connection logs visible

---

### Block 2: Queue Enqueue (Producer)
**Purpose:** Add jobs to Redis Stream
**Why second:** Need ability to add jobs before processing them

**Step 2.1: Skeleton**
- Create `lib/queue/enqueue.ts`
- Export function `enqueueJob(streamName, jobData)`
- Function signature only, no implementation

**Verification:**
- [ ] File exists
- [ ] Function signature correct
- [ ] TypeScript compiles

**Step 2.2: Implementation**
- Use Redis XADD command to add job to stream
- Add job with timestamp and data
- Return job ID

**Verification:**
- [ ] Job successfully added to stream
- [ ] Job ID returned
- [ ] Job data matches input

---

### Block 3: Queue Dequeue (Consumer)
**Purpose:** Read jobs from Redis Stream
**Why third:** Need ability to read jobs before processing them

**Step 3.1: Skeleton**
- Create `lib/queue/dequeue.ts`
- Export function `readJobs(streamName, consumerGroup)`
- Function signature only, no implementation

**Verification:**
- [ ] File exists
- [ ] Function signature correct
- [ ] TypeScript compiles

**Step 3.2: Implementation**
- Use Redis XREADGROUP command
- Create consumer group if not exists
- Read pending jobs
- Return job array

**Verification:**
- [ ] Consumer group created
- [ ] Jobs successfully read
- [ ] Job data matches enqueued data

---

### Block 4: Job Processor
**Purpose:** Process individual jobs (call handler function)
**Why fourth:** Core processing logic

**Step 4.1: Skeleton**
- Create `lib/queue/processor.ts`
- Export function `processJob(job, handler)`
- Function signature only, no implementation

**Verification:**
- [ ] File exists
- [ ] Function signature correct
- [ ] TypeScript compiles

**Step 4.2: Implementation**
- Call handler function with job data
- Handle success/failure
- Return result

**Verification:**
- [ ] Handler called with correct data
- [ ] Success returns result
- [ ] Failure returns error

---

### Block 5: Idempotency Check
**Purpose:** Prevent duplicate processing of same request
**Why fifth:** Required by queue requirements

**Step 5.1: Skeleton**
- Create `lib/queue/idempotency.ts`
- Export functions `checkIdempotency(key)`, `saveIdempotency(key, result)`
- Function signatures only, no implementation

**Verification:**
- [ ] File exists
- [ ] Functions exported
- [ ] TypeScript compiles

**Step 5.2: Implementation**
- Use Redis SET with NX flag
- Store result with 24h TTL
- Return cached result if exists

**Verification:**
- [ ] First call stores result
- [ ] Second call returns cached result
- [ ] TTL expires after 24h

---

### Block 6: Retry Logic
**Purpose:** Retry failed jobs with exponential backoff
**Why sixth:** Required by queue requirements

**Step 6.1: Skeleton**
- Create `lib/queue/retry.ts`
- Export function `shouldRetry(job, attempt)`
- Function signature only, no implementation

**Verification:**
- [ ] File exists
- [ ] Function exported
- [ ] TypeScript compiles

**Step 6.2: Implementation**
- Check retry limit (3 for create, 10 for rollback)
- Calculate exponential backoff delay
- Return retry decision

**Verification:**
- [ ] Retry limit enforced
- [ ] Backoff delay calculated correctly
- [ ] Max retry not exceeded

---

### Block 7: Circuit Breaker
**Purpose:** Prevent cascade failures
**Why seventh:** Required by queue requirements

**Step 7.1: Skeleton**
- Create `lib/queue/circuit-breaker.ts`
- Export functions `checkCircuitBreaker()`, `recordFailure()`, `recordSuccess()`
- Function signatures only, no implementation

**Verification:**
- [ ] File exists
- [ ] Functions exported
- [ ] TypeScript compiles

**Step 7.2: Implementation**
- Track consecutive failures
- Open after 5 failures
- Close after 30s cooldown
- Fail fast when open

**Verification:**
- [ ] Opens after 5 failures
- [ ] Closes after cooldown
- [ ] Fails fast when open

---

### Block 8: Priority Queue
**Purpose:** Process payment realize before regular requests
**Why eighth:** Required by queue requirements

**Step 8.1: Skeleton**
- Create `lib/queue/priority.ts`
- Export functions `enqueuePriority()`, `enqueueRegular()`
- Function signatures only, no implementation

**Verification:**
- [ ] File exists
- [ ] Functions exported
- [ ] TypeScript compiles

**Step 8.2: Implementation**
- Use separate Redis Streams for priority and regular
- Read from priority stream first
- Read from regular stream if priority empty

**Verification:**
- [ ] Priority jobs processed first
- [ ] Regular jobs processed after priority
- [ ] Both streams work independently

---

### Block 9: Concurrency Control
**Purpose:** One active operation per reservation token
**Why ninth:** Required by queue requirements

**Step 9.1: Skeleton**
- Create `lib/queue/concurrency.ts`
- Export functions `acquireLock(token)`, `releaseLock(token)`
- Function signatures only, no implementation

**Verification:**
- [ ] File exists
- [ ] Functions exported
- [ ] TypeScript compiles

**Step 9.2: Implementation**
- Use Redis SET with NX flag for lock
- Set lock with TTL
- Release lock on completion

**Verification:**
- [ ] Lock acquired successfully
- [ ] Concurrent requests rejected
- [ ] Lock released on completion

---

### Block 10: Sanity Integration
**Purpose:** Stock reservation in Sanity CMS
**Why tenth:** Core business logic, depends on all queue infrastructure

**Step 10.1: Skeleton**
- Create `lib/queue/sanity-handler.ts`
- Export function `reserveStock(clientBasket)`
- Function signature only, no implementation

**Verification:**
- [ ] File exists
- [ ] Function exported
- [ ] TypeScript compiles

**Step 10.2: Implementation**
- Fetch product stock from Sanity
- Calculate available stock
- Use Redis WATCH/MULTI for atomic reservation
- Update Sanity reservedStock

**Verification:**
- [ ] Stock fetched from Sanity
- [ ] Reservation atomic in Redis
- [ ] Sanity updated correctly

---

## Bus Stop Log Template

For each step, after completion:

```
## [Block X] [Step Y] Bus Stop Log

**Date:** [timestamp]
**Status:** ✅ PASS / ❌ FAIL

**Verification:**
- [ ] Checklist item 1
- [ ] Checklist item 2
- [ ] Checklist item 3

**Notes:**
[What worked, what didn't, any surprises]

**Human Verification:**
[Manual test performed, result]

**Q&A with AI:**
[Any questions raised, answers received]

**Refactor if needed:**
[Any changes made after verification]
```

---

## Guardrails

**Scope Creep Prevention:**
- Each block has explicit IN SCOPE items
- OUT OF SCOPE items listed per block
- FORBIDDEN items explicitly named
- No block exceeds 2 steps (skeleton + implementation)

**Overcomplication Prevention:**
- Each step has max 3 verification items
- Each step takes < 30 minutes
- No step adds more than one file
- No step adds more than 50 lines of code

**Disconnection Prevention:**
- Each block builds on previous blocks
- Each block has clear "Why [Nth]" rationale
- Each block connects to core requirements
- No block is isolated from queue purpose

**Foundation-Up Enforcement:**
- Cannot skip Block 1 (Redis Connection)
- Cannot skip Block 2 (Enqueue) before Block 3 (Dequeue)
- Cannot skip Block 5 (Idempotency) before Block 6 (Retry)
- Order is mandatory, not optional

---

## Adaptation Flexibility

If a step fails:
1. Document failure in Bus Stop Log
2. Q&A with AI to diagnose
3. Refactor approach
4. Re-verify
5. Only then proceed to next step

If requirements change:
1. Update affected blocks
2. Re-verify changed blocks
3. Continue from changed block
4. Do not skip verification

If tech stack changes:
1. Update tech-stack.md with new decision
2. Update affected blocks
3. Re-verify from Block 1
4. Do not skip verification
