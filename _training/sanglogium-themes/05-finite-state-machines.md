# Theme 05: Finite State Machines — Order Management System

## SangLogium Context
The Order Management System uses a Granular Finite State Machine to represent every physical state an order can be in. This is not abstract theory—it's the difference between knowing "a box is sitting on the packing table" vs "order is processing." The FSM drives UI views for different roles (OWNER, MANAGER, PACKER).

**Critical Files:**
- `sanity/ORDER_MANAGEMENT_SYSTEM.md` — FSM documentation
- `sanity/schemaTypes/orderType.ts` — Order schema with status enum
- `sanity/lib/orders/orderTypes.ts` — TypeScript types for order states
- `app/(admin)/manager/` — Role-based management UI
- `app/(admin)/packer/` — Packer-specific workflow UI

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at documentation. Binary pass/fail.

#### FSM Fundamentals
- [ ] What is a Finite State Machine?
- [ ] What makes an FSM "finite"?
- [ ] What is the difference between a state and a transition?
- [ ] Why use FSM for order management vs a simple status string?
- [ ] What does "granular" mean in "Granular FSM"?

#### Order States
- [ ] Name 5 order states in the "forward pipe" (normal flow)
- [ ] Name 3 "hold" states (exception states)
- [ ] What is the difference between CANCELLED_PENDING_UNPACK and CANCELLED_RESTOCKED?
- [ ] What state represents "money in the bank"?
- [ ] What state prevents double-packing?

#### State Transitions
- [ ] Can any state transition to any other state?
- [ ] What validates allowed transitions?
- [ ] Who can trigger state transitions? (System? User? Both?)
- [ ] What happens to the timeline/history log on each transition?
- [ ] How does the FSM prevent invalid transitions?

#### Role-Based Views
- [ ] What does a PACKER see vs a MANAGER vs an OWNER?
- [ ] How does the FSM state drive UI visibility?
- [ ] What is "PACKING_LOCKED" and why does it exist?
- [ ] How do you prevent a MANAGER from seeing PACKER-specific actions?

---

## Layer 1: Comprehensive Curriculum

### Module 1: FSM First Principles

**What is a Finite State Machine?**
```
A mathematical model of computation:
- Finite set of states
- Finite set of transitions between states
- Current state is the system's complete status
- Transitions are triggered by events
```

**Why FSM for Orders?**

| Traditional Status | FSM State |
|-------------------|-----------|
| "Processing" | TO_PACK, PACKING_LOCKED, PACKED_LABEL_GENERATED |
| "Shipped" | SHIPPED_IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED_SUCCESS |
| "Cancelled" | CANCELLED_PENDING_UNPACK, CANCELLED_RESTOCKED |

**Benefits:**
1. **Physical Reality Mapping:** State represents actual box location
2. **Race Condition Prevention:** LOCKED states prevent double-work
3. **Audit Trail:** Every transition logged with who/when/why
4. **Role Clarity:** Each role sees only relevant states
5. **Impossible States Unrepresentable:** Invalid combinations can't exist

---

### Module 2: Order State Taxonomy

**Phase 1: Genesis (The Money)**
```typescript
CREATED_UNPAID      // Cart exists, no payment yet
PAYMENT_FAILED      // Card declined, retry possible
PAID_CONFIRMED     // Money captured, ready for warehouse
```

**Phase 2: Forward Pipe (Warehouse)**
```typescript
TO_PACK                    // Standard queue state
PACKING_LOCKED            // Worker claimed, prevents double-pack
PACKED_LABEL_GENERATED    // Box sealed, label printed
SHIPPED_IN_TRANSIT       // Carrier scanned
DELIVERED_SUCCESS        // Customer received (happy path end)
```

**Phase 3: The Holds (Exceptions)**
```typescript
HOLD_INVENTORY_MISSING        // Packer can't find item
HOLD_ADDRESS_INVALID          // API rejected address
HOLD_WAITING_CUSTOMER_CHOICE  // Partial ship or cancel?
HOLD_WAITING_PAYMENT_BALANCE  // Order change requires more money
```

**Phase 4: Cancellation (Backward Pipe)**
```typescript
// "Cancelled" is a PROCESS, not a single state

CANCELLED_PENDING_UNPACK   // Manager clicked cancel, box open on table
                          // Worker task: "Open and put items back"
                          // → Auto-transitions to RESTOCKED when done

CANCELLED_RESTOCKED      // Items confirmed back on shelf (dead state)
REFUNDED_NO_RESTOCK     // Cancelled before packing (dead state)
```

**Phase 5: Returns (Post-Delivery)**
```typescript
RETURN_REQUESTED                    // Label sent to customer
RETURN_RECEIVED_PENDING_INSPECTION  // Box arrived at warehouse
RETURNED_RESTOCKED                 // Item good, inventory +1
RETURNED_DISCARDED                 // Item damaged/unusable
```

---

### Module 3: State Transitions & Validation

**Valid Transitions Map:**
```typescript
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  CREATED_UNPAID: ['PAYMENT_FAILED', 'PAID_CONFIRMED', 'CANCELLED'],
  PAYMENT_FAILED: ['CREATED_UNPAID', 'CANCELLED'],
  PAID_CONFIRMED: ['TO_PACK', 'HOLD_INVENTORY_MISSING', 'CANCELLED'],
  TO_PACK: ['PACKING_LOCKED', 'HOLD_INVENTORY_MISSING', 'CANCELLED'],
  PACKING_LOCKED: ['PACKED_LABEL_GENERATED', 'HOLD_INVENTORY_MISSING', 'TO_PACK'],
  PACKED_LABEL_GENERATED: ['SHIPPED_IN_TRANSIT', 'CANCELLED_PENDING_UNPACK'],
  SHIPPED_IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERY_FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED_SUCCESS', 'DELIVERY_FAILED'],
  // ... etc
};
```

**Transition Function:**
```typescript
function transitionOrder(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  actor: string,
  reason?: string
): Order {
  // 1. Validate transition is allowed
  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new InvalidStateTransitionError(
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }
  
  // 2. Execute side effects (if any)
  const sideEffects = getSideEffects(currentStatus, newStatus);
  await executeSideEffects(sideEffects);
  
  // 3. Update order
  return {
    ...order,
    status: newStatus,
    timeline: [
      ...order.timeline,
      {
        timestamp: new Date().toISOString(),
        status: newStatus,
        actor,
        reason,
        previousStatus: currentStatus
      }
    ]
  };
}
```

**Side Effects Examples:**
- `TO_PACK` → `PACKING_LOCKED`: Set `lockedBy`, `lockedAt`
- `PACKED_LABEL_GENERATED` → `CANCELLED_PENDING_UNPACK`: Move to restock queue
- `DELIVERED_SUCCESS` → `RETURN_REQUESTED`: Initiate return flow

---

### Module 4: Timeline & Audit Trail

**Strictly Append-Only Log:**
```typescript
interface TimelineEntry {
  timestamp: string;      // ISO 8601
  status: OrderStatus;      // New state
  actor: string;           // User ID or system
  reason?: string;          // Human-readable explanation
  metadata?: Record<string, unknown>; // Additional context
}

// Example timeline
[
  { timestamp: '2025-12-21T10:00:00Z', status: 'PACKING_LOCKED', actor: 'worker_bob' },
  { timestamp: '2025-12-21T10:05:00Z', status: 'HOLD_INVENTORY_MISSING', actor: 'worker_bob', reason: 'Could not find Red Socks' },
  { timestamp: '2025-12-21T10:15:00Z', status: 'TO_PACK', actor: 'manager_alice', reason: 'Restocked, return to queue' }
]
```

**Why Append-Only?**
- Fraud prevention: Can't alter history
- Debugging: Complete state evolution visible
- Compliance: Regulatory requirements
- Customer service: See exactly what happened

---

## Layer 2: Integration Examination

### Integration Challenge 1: FSM Implementation

**Scenario:** Implement the order state machine from scratch

**Requirements:**
1. Define all order states as TypeScript union type
2. Create valid transition mapping
3. Implement `transitionOrder` function with validation
4. Add side effect hooks for specific transitions
5. Maintain timeline with each transition

**Test Cases:**
```typescript
// Should succeed
transitionOrder('TO_PACK', 'PACKING_LOCKED', 'worker_123');

// Should throw
transitionOrder('TO_PACK', 'DELIVERED_SUCCESS', 'hacker'); // Invalid!

// Should log timeline
const order = transitionOrder('CREATED_UNPAID', 'PAID_CONFIRMED', 'system');
expect(order.timeline).toHaveLength(1);
```

**Success Criteria:**
- [ ] TypeScript prevents invalid states at compile time
- [ ] Runtime validation prevents invalid transitions
- [ ] Timeline is append-only and complete
- [ ] Side effects execute for relevant transitions
- [ ] Human-readable errors for invalid operations

---

### Integration Challenge 2: Role-Based UI

**Scenario:** Build PACKER view that filters orders by FSM state

**Requirements:**
1. Query orders where status is in PACKER-visible states
2. Display different UI based on exact state
3. Allow state transitions based on role permissions
4. Show timeline entries relevant to current state

**PACKER-Visible States:**
```typescript
const PACKER_STATES = [
  'TO_PACK',
  'PACKING_LOCKED',
  'HOLD_INVENTORY_MISSING',
  'CANCELLED_PENDING_UNPACK'
];
```

**State-Specific Actions:**
- `TO_PACK`: "Start Packing" (locks to packer)
- `PACKING_LOCKED` (if locked by me): "Complete Packing", "Report Issue"
- `PACKING_LOCKED` (if locked by other): "View Only"
- `HOLD_INVENTORY_MISSING`: "Restocked" (return to TO_PACK)
- `CANCELLED_PENDING_UNPACK`: "Confirm Restocked"

**Success Criteria:**
- [ ] Only relevant orders visible to PACKER
- [ ] State determines available actions
- [ ] Lock ownership enforced
- [ ] Transitions update UI immediately

---

## Layer 3: Systems Examination

### Systems Challenge: Cancellation Flow Design

**Scenario:** Design the complete cancellation process

**Current Problem:** User clicks "Cancel" at different stages

**Stage 1: Before Payment**
- Status: `CREATED_UNPAID`
- Action: Simple cancellation
- Next State: `CANCELLED` (no inventory impact)

**Stage 2: After Payment, Before Packing**
- Status: `PAID_CONFIRMED`, `TO_PACK`
- Action: Refund required
- Next State: `REFUNDED_NO_RESTOCK` (inventory untouched)

**Stage 3: During Packing**
- Status: `PACKING_LOCKED`
- Problem: Worker has items!
- Solution: `CANCELLED_PENDING_UNPACK` state

**Stage 4: After Shipping**
- Status: `SHIPPED_IN_TRANSIT`+
- Problem: Already with carrier
- Solution: Initiate return flow, not cancellation

**Design Decisions:**
1. State machine representation for each stage
2. Side effects (refunds, inventory, notifications)
3. Who can cancel at each stage? (Customer? Manager? System?)
4. Rollback mechanisms if side effects fail

**Deliverable:**
- Complete state diagram
- Transition validation rules
- Side effect specification
- Error handling strategy

---

## Stress Test Scenarios

### Scenario 1: Race Condition Bug

**Given:**
- Two packers see same order in "TO_PACK" state
- Both click "Start Packing" simultaneously
- Both transition to "PACKING_LOCKED"

**Expected:**
- First succeeds, second gets "already locked" error
- Order shows locked by first packer

**Bug:**
- Both succeed, order shows locked by "packer_2" (last write wins)

**Fix:**
- Optimistic locking with version/timestamp
- Atomic read-modify-write in database
- Pre-condition check: "only transition if status == TO_PACK"

---

### Scenario 2: Inventory Sync Issue

**Given:**
- Order moves: `PACKED_LABEL_GENERATED` → `CANCELLED_PENDING_UNPACK`
- Worker puts items back on shelf
- Worker clicks "Confirm Restocked"
- System should: Update state, restore inventory

**Bug:**
- State updates to `CANCELLED_RESTOCKED`
- Inventory NOT restored
- Physical inventory > system inventory

**Root Cause:**
- Side effect failed silently
- No rollback mechanism
- Missing validation that inventory was restored

**Fix:**
- Idempotent side effects
- Retry with exponential backoff
- Compensation transactions on failure

---

## Quick Reference: State Guide

| State | Phase | Role Concern | Actionable? |
|-------|-------|--------------|-------------|
| CREATED_UNPAID | Genesis | Customer | Pay now |
| PAID_CONFIRMED | Genesis | System | Auto-advance |
| TO_PACK | Forward | PACKER | Start packing |
| PACKING_LOCKED | Forward | Specific PACKER | Finish/Issue |
| HOLD_* | Exception | MANAGER | Resolve |
| CANCELLED_PENDING_UNPACK | Backward | PACKER | Restock |
| SHIPPED* | Forward | Carrier API | Track |

---

## FSM Design Principles

1. **One state = One physical reality**
2. **Impossible states should be unrepresentable**
3. **Transitions validate at compile AND runtime**
4. **Side effects are part of transition definition**
5. **Timeline is strictly append-only**
6. **Roles see only relevant states**
7. **Lock states prevent race conditions**

---

## Completion Checklist

- [ ] Can explain why FSM beats simple status strings
- [ ] Can name all order states and their meanings
- [ ] Can implement transition validation
- [ ] Can design side effects for transitions
- [ ] Can implement append-only timeline
- [ ] Can build role-based views from FSM
- [ ] Can debug race conditions in state transitions
- [ ] Can handle failed side effects gracefully

---

*Next: Theme 06 — Stripe Integration & Payments*
