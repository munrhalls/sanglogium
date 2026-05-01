# Simple, Robust PRD Contract Research

**Research Date:** 2026-04-30
**Purpose:** Research professional, simple, robust, clear software/web development PRD contracts and Design by Contract principles.

---

## Research Scope Contract
- **Topic:** Simple, robust PRD contract design with Design by Contract
- **First Principles:** Preconditions, postconditions, invariants; clear problem statements; focused scope
- **Fundamentals:** Design by Contract (DBC), minimal viable specification, human-readable contracts
- **Scope Boundary:** Technical implementation details, test specifications, checkout flow
- **Target Audience:** Software architects and developers
- **Decay Risk:** Low - these are timeless principles

---

## Design by Contract (The Pragmatic Programmer)

### Core Principles

**Source:** The Pragmatic Programmer, Topic 23: Design by Contract

**Definition:** Design by Contract (DBC) is a simple yet powerful technique that focuses on documenting (and agreeing to) the rights and responsibilities of software modules to ensure program correctness.

**Three Key Elements:**

1. **Preconditions**
   - What must be true in order for the routine to be called
   - The routine's requirements
   - Caller's responsibility to pass good data
   - Routine should never get called when preconditions violated

2. **Postconditions**
   - What the routine is guaranteed to do
   - State of the world when routine is done
   - Implies routine will conclude (no infinite loops)

3. **Class Invariants**
   - Condition always true from caller's perspective
   - May not hold during internal processing
   - Must be true when routine exits and control returns to caller

### The Contract

**If all preconditions met by caller, routine guarantees all postconditions and invariants when complete.**

**If either party fails to live up to contract, remedy is invoked** (exception, program termination). Failure to live up to contract is a bug.

**Key Insight:** Preconditions should NOT be used for user-input validation. That's caller's responsibility.

### Implementation

**In languages without built-in DBC support:**
- Document contract as comments
- Put contract in unit tests
- Use assertions for runtime checks
- Save "old" values for postcondition validation

**Example (Clojure with DBC):**
```clojure
(defn accept-deposit [account-id amount]
  { :pre [ (> amount 0.00) (account-open? account-id) ]
    :post [ (contains? (account-transactions account-id) %) ] }
  "Accept a deposit and return the new transaction id"
  ;; Processing...
  (create-transaction account-id :deposit amount))
```

---

## Professional PRD Contract Patterns

### From Top Tech Companies (Google, Linear, etc.)

**Common Structure:**
1. **Overview** - Purpose, background, rationale
2. **Problem Statement** - Clear, specific, backed by data
3. **Solution** - What we're building
4. **Technical Requirements** - Integration points, constraints
5. **Success Metrics** - Specific, measurable outcomes

**What Makes Great PRDs:**
- Clear problem statement backed by data
- Specific, measurable success metrics
- Technical requirements aligned with infrastructure
- Risk mitigation through gradual rollout
- Focused scope (no rabbit holes)

**Example: Linear Priority Micro-Adjust**
- **Context:** Fine-grained priority adjustments
- **Problem:** Manual sort unstable, local vs global confusion
- **Solution:** Drag-and-drop within priority buckets
- **Usage Scenarios:** Clear, specific user flows

**Example: Google Search Algorithm Update**
- **Purpose:** ML algorithm for search ranking
- **Success Metrics:** 12% satisfaction improvement, 8% CTR increase
- **Technical Requirements:** TensorFlow integration, A/B testing

---

## Synthesis: Simple PRD Contract Principles

### 1. Design by Contract Applied to PRDs

**For Each Operation:**
- **Preconditions:** What must be true before calling
- **Postconditions:** What operation guarantees
- **Invariants:** What remains true after operation

**Example (Basket Add Item):**
- **Precondition:** productId is non-empty string, quantity > 0, quantity <= availableStock
- **Postcondition:** Item in basket with quantity, basket persisted
- **Invariant:** All quantities >= 0, all quantities <= availableStock

### 2. Minimal Viable Specification

**What to Include:**
- Core operations (add, remove, increment, decrement)
- State structure (what data exists)
- Error conditions (what can go wrong)
- Invariants (what must always be true)

**What to Exclude:**
- Test specifications (separate concern)
- Implementation details (how, not what)
- Rabbit hole edge cases (focus on 95% use cases)
- Checkout flow (separate system)

### 3. Human-Readable Format

**Structure:**
1. **Purpose** - One sentence
2. **State** - What data exists
3. **Operations** - What you can do
4. **Contracts** - Preconditions, postconditions, invariants
5. **Errors** - What can go wrong

**Format:**
- Plain language, no jargon
- Examples for clarity
- Visual diagrams only if necessary
- Single source of truth

### 4. Robustness Through Simplicity

**Principles:**
- Fewer contracts = easier to verify
- Explicit contracts = fewer bugs
- Clear boundaries = less coupling
- Minimal state = less complexity

**Tradeoffs:**
- Simplicity vs Completeness: Favor simplicity for core features
- Explicit vs Implicit: Always explicit
- Formal vs Informal: Formal enough to be clear, informal enough to be readable

---

## Actionable Takeaways for Basket-5

### Apply Design by Contract
- Each operation has explicit preconditions, postconditions, invariants
- Caller responsible for meeting preconditions
- Operation responsible for meeting postconditions
- Invariants maintained across operations

### Simplify Contract Structure
- Single contract file (not 4 separate files)
- Focus on core basket operations
- Remove view-layer contracts (implementation detail)
- Remove test specifications (separate concern)

### Human-Readable Format
- Plain language descriptions
- Clear examples
- Minimal diagrams (only if clarifying)
- Single source of truth

### Strict Scope
- Checkout flow: OUT
- Test specifications: OUT
- Implementation details: OUT
- Rabbit hole edge cases: OUT
- Core basket operations: IN
- State structure: IN
- Error conditions: IN
- Invariants: IN

---

## Verification

### Claims Verified
- Design by Contract focuses on preconditions, postconditions, invariants
- Professional PRDs have clear problem statements and success metrics
- Simplicity improves verifiability and maintainability

### Falsification Attempts
- Counter-argument: More detail = more robust
  - Rebuttal: Complexity hides bugs; explicit contracts catch bugs early
- Counter-argument: Separate contracts for separation of concerns
  - Rebuttal: Single contract with clear sections achieves same goal with less overhead

### Knowledge Decay Assessment
- Design by Contract principles: Low risk (timeless)
- PRD patterns: Low risk (stable best practices)
