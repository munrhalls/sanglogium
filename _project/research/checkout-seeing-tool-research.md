# Research: Checkout Flow Seeing Tool for Data Integrity
**Date:** 2026-04-11
**Purpose:** Pragmatic possibility research for creating a "seeing tool" that allows seeing entire possible stream of user/network API events and outcomes per checkout UX slice in one go
**Focus:** Data integrity and data incorruptibility first and foremost, not UI/UX

---

## Research Scope Contract
- **Topic:** Simplest possible robust seeing tool for checkout flow data integrity
- **First Principles:** Complete event stream visibility, atomic operation verification, data corruption detection
- **Fundamentals:** Event sourcing pattern, immutable logs, state transition verification
- **Scope Boundary:** Research only - no code implementation, focus on pragmatic feasibility
- **Target Audience:** System architects and debugging engineers
- **Decay Risk:** Low - checkout flow fundamentals are stable

---

## Phase 1: Current Checkout Flow Event Mapping

### UX Slice 1: Basket to Address Navigation
**Events Stream:**
1. **User Action:** Click Checkout button
2. **Client Event:** FSM transition `idle` -> `processing`
3. **Client Action:** Generate idempotencyKey (UUIDv4)
4. **Client Action:** Get/create guest session (JWT + cookie)
5. **Client Action:** Validate basket locally
6. **Client Action:** Navigate to `/checkout/address?sessionId=X&idempotencyKey=X`
7. **Client Event:** FSM transition `processing` -> `idle`

**Data Integrity Points:**
- idempotencyKey uniqueness
- Session persistence
- Basket data consistency during navigation

### UX Slice 2: Address Form Submission
**Events Stream:**
1. **User Action:** Submit address form
2. **Client Event:** FSM transition `idle` -> `processing`
3. **Server Action:** POST to reserveStock with:
   - idempotencyKey
   - guestJwt
   - sessionId
   - addressData
   - basketData
4. **Server Check:** Redis idempotency cache lookup
5. **Cache Hit Path:** Return cached result (skip to step 12)
6. **Cache Miss Path:** Continue to stock reservation
7. **Redis Action:** Atomic stock reservation via Lua script
8. **Stock Check:** Verify sufficient quantity
9. **Insufficient Stock:** Return error, no side effects
10. **Sufficient Stock:** Create Stripe PaymentIntent
11. **Stripe Success:** Store reservation metadata in Redis
12. **Server Action:** Cache result by idempotencyKey
13. **Server Response:** Return clientSecret, reservationId, expiresAt
14. **Client Event:** FSM transition `processing` -> `idle`
15. **Client Action:** Navigate to payment page

**Data Integrity Points:**
- Idempotency key prevents duplicate operations
- Atomic stock reservation prevents race conditions
- Compensation pattern (rollback on Stripe failure)
- Redis TTL auto-release prevents permanent locks
- JSON reservation array format consistency

### UX Slice 3: Payment Page Initialization
**Events Stream:**
1. **Client Action:** Payment page mounts
2. **Client Check:** Verify expiresAt from FSM context
3. **Expired Path:** Redirect to basket with error
4. **Valid Path:** Initialize Stripe Elements
5. **Client Action:** Load Stripe (module scope)
6. **Client Action:** Render PaymentElement with clientSecret
7. **No clientSecret:** Show spinner

**Data Integrity Points:**
- Expiration timestamp validation
- Stripe Elements initialization safety
- Client secret availability verification

### UX Slice 4: Payment Submission
**Events Stream:**
1. **User Action:** Submit payment form
2. **Client Event:** FSM transition `idle` -> `processing`
3. **Stripe Action:** elements.submit()
4. **Submit Error:** FSM transition `processing` -> `idle` with error
5. **Submit Success:** stripe.confirmPayment()
6. **Immediate Error:** FSM transition `processing` -> `idle` with error
7. **Payment Success:** FSM transition `processing` -> `complete`
8. **Success Navigation:** Navigate to `/checkout/success?payment_intent=pi_XXX`
9. **3DS Redirect:** Stripe handles automatically

**Data Integrity Points:**
- PaymentIntent status verification
- Success URL includes payment_intent ID
- 3DS redirect integrity

### UX Slice 5: Webhook Processing
**Events Stream:**
1. **Stripe Event:** Webhook POST to `/api/webhooks/stripe`
2. **Server Check:** Verify Stripe-Signature
3. **Server Check:** Idempotency check via processed_event cache
4. **payment_intent.succeeded:**
   - Commit reservation to Sanity
   - Create order record
   - Send confirmation email
   - Keep idempotency cache (replay safety)
5. **payment_intent.payment_failed:**
   - Release Redis stock reservation
   - Clear paymentIntentId from session
6. **payment_intent.canceled:**
   - Release Redis stock reservation

**Data Integrity Points:**
- Webhook signature verification
- Event idempotency processing
- JSON reservation parsing with legacy fallback
- Atomic stock restoration
- Order creation atomicity

---

## Phase 2: Critical Data Integrity Checkpoints

### 1. Idempotency Integrity
**What must not corrupt:**
- Unique idempotencyKey generation
- Cache key consistency (`idempotency:${key}`)
- Response cache integrity

**Failure modes:**
- Duplicate idempotencyKey generation
- Cache corruption
- Race condition in cache lookup

### 2. Stock Reservation Integrity
**What must not corrupt:**
- Redis `product_stock` hash values
- Reservation JSON format consistency
- Atomic decrement operations

**Failure modes:**
- Partial reservation (some items, not all)
- Redis key corruption (JSON split bug)
- Rollback failure leaving stock in wrong state

### 3. PaymentIntent Integrity
**What must not corrupt:**
- Stripe PaymentIntent metadata
- Amount calculation (PLN vs grosze)
- Client secret transmission

**Failure modes:**
- Amount calculation errors (100x wrong)
- Missing metadata
- Client secret leakage/corruption

### 4. Session Integrity
**What must not corrupt:**
- Guest session JSON structure
- TTL consistency
- Cross-reference between reservations and sessions

**Failure modes:**
- Session data corruption
- TTL expiration race conditions
- Orphaned reservations

### 5. Webhook Integrity
**What must not corrupt:**
- Event processing idempotency
- Stock restoration on failure
- Order creation atomicity

**Failure modes:**
- Duplicate order creation
- Failed stock restoration
- Signature verification bypass

---

## Phase 3: Pragmatic Implementation Approaches

### Approach 1: Event Stream Logger (Simplest)
**Concept:** Append-only log of all checkout events with timestamps and correlation IDs

**Implementation:**
- Redis list or file-based log
- Structured event format
- Correlation via idempotencyKey
- Query interface for event reconstruction

**Pros:**
- Minimal complexity
- No performance impact
- Easy to implement
- Immutable audit trail

**Cons:**
- Read-only (no active monitoring)
- Requires manual analysis
- No real-time alerts

### Approach 2: State Transition Tracker
**Concept:** Track FSM state changes with before/after snapshots

**Implementation:**
- Middleware on FSM transitions
- State diff generation
- Anomaly detection (invalid transitions)
- State reconstruction tool

**Pros:**
- Detects invalid state changes
- Visual state flow
- Anomaly detection

**Cons:**
- Limited to FSM states
- Doesn't track data mutations
- Requires FSM integration

### Approach 3: Data Integrity Monitor
**Concept:** Active monitoring of critical data structures

**Implementation:**
- Redis hash integrity checks
- Stock level consistency verification
- Reservation JSON validation
- Periodic checksum verification

**Pros:**
- Detects data corruption
- Active monitoring
- Can trigger alerts

**Cons:**
- Performance overhead
- Complex implementation
- Storage requirements

### Approach 4: Comprehensive Event Sourcing
**Concept:** Full event sourcing with replay capability

**Implementation:**
- Event store (Redis/DB)
- Event replay mechanism
- State reconstruction from events
- Snapshot capability

**Pros:**
- Complete visibility
- Debugging via replay
- State reconstruction
- Time travel debugging

**Cons:**
- High complexity
- Performance impact
- Storage requirements
- Overkill for simple debugging

---

## Phase 4: Recommended Pragmatic Solution

### Hybrid Approach: Event Logger + Integrity Monitor
**Core Principle:** Simple, robust, minimal overhead

**Components:**

1. **Event Stream Logger**
   ```
   {
     timestamp: "2026-04-11T12:00:00.000Z",
     correlationId: "checkout_123_abc",
     slice: "address-submit",
     event: "stock-reservation-start",
     data: { items: [...], stockBefore: {...} },
     outcome: "success|error",
     error: null | {...}
   }
   ```

2. **Integrity Monitor**
   - Redis hash checksum verification
   - Stock level sanity checks
   - Reservation JSON format validation
   - TTL consistency checks

3. **Visualization Interface**
   - Filter by correlationId (complete flow)
   - Filter by slice (partial flow)
   - Show data mutations
   - Highlight integrity violations

**Implementation Simplicity:**
- Single Redis list for events
- Simple integrity check functions
- Basic web interface for visualization
- No complex event sourcing framework

**Data Integrity Focus:**
- Log all data mutations
- Verify atomic operations
- Detect corruption immediately
- Provide complete audit trail

---

## Phase 5: Verification & Falsification

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Checkout flow has 5 distinct UX slices | Sprint document + flow diagrams | Code analysis |
| Each slice has critical data integrity points | 15 identified checkpoints | Architecture analysis |
| Event logging is simplest robust approach | Minimal complexity, immutable trail | Pattern analysis |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Full event sourcing is necessary | Overkill for debugging needs | Survived (simpler approach sufficient) |
| Real-time monitoring is required | Adds complexity without benefit | Survived (post-hoc analysis sufficient) |
| UI visualization is primary goal | Research states data integrity first | Survived (integrity over visualization) |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Checkout flow architecture | Low | 2026-07-11 |
| Data integrity checkpoints | Low | 2026-07-11 |
| Implementation approaches | Medium | 2026-05-11 |

---

## Phase 6: Synthesis & Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use event logger + integrity monitor | Simplest robust solution | Redis list + periodic checks |
| Focus on data corruption detection | Primary requirement | Integrity validation functions |
| Correlation via idempotencyKey | Natural flow identifier | Use existing key |
| Slice-based filtering | Matches UX documentation | Simple query interface |

### Implementation Priority
1. **Event Stream Logger** - Core visibility
2. **Integrity Monitor** - Corruption detection
3. **Query Interface** - Data access
4. **Basic Visualization** - Human-readable output

### Anti-Patterns to Avoid
- Complex event sourcing frameworks
- Real-time UI dashboards
- Database-heavy solutions
- Over-engineered visualization

### Success Criteria
- All checkout events logged
- Data corruption detected immediately
- Complete flow reconstruction possible
- Minimal performance impact
- Simple to maintain

---

## Conclusion

A pragmatic seeing tool for checkout flow data integrity is **highly feasible** using a simple event logger combined with integrity monitoring. The key insights:

1. **Simplicity First:** Event logging + integrity checks provides 90% of value with 10% of complexity
2. **Correlation is Key:** Use existing idempotencyKey as flow identifier
3. **Integrity Focus:** Monitor critical data structures, not just events
4. **Slice-Based Organization:** Match UX documentation for clarity
5. **Immutable Trail:** Append-only logging ensures audit integrity

The recommended approach avoids over-engineering while providing complete visibility into checkout flow data integrity, exactly as required for a Brett Victor-style seeing tool focused on data incorruptibility.
