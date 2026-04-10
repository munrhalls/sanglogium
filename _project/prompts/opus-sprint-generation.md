
## Task
Create a sprint following the human-first methodology for basket to checkout flow, specifically for the reserved stock data integrity cleanup.

## Context Summary

### 1. Core Problem
CheckoutButton has bug: checks `response.success` but validateBasket returns `response.outcome`. Stock reservation with `reservedStock` already implemented. Need to: (1) Fix CheckoutButton bug, (2) Document existing functionality with human-first methodology, (3) Add verification for 10 UX flows. No data migration needed. Same UX.

### 2. Fatal Flaws to Prevent
- Over-complication
- No human verification checkpoints
- Vague architecture (no event-state-server contract)
- Cargo cult testing
- Big verification windows
- Starting from code instead of UX

### 3. Human-First Methodology (MUST FOLLOW)
1. Start with UX flows
2. Simple end-state overview
3. Explicit architecture contract
4. Tiny scope contracts
5. Continuous human verification
6. Tests serve human confidence only
7. Simplicity guardrails

## Key References

### Pre-Checkout State Machine Spec v3.0
**Location:** `docs/features/checkout/foundation/pre-checkout-state-machine-spec.md`

**Key sections to reference:**
- 10 UX flows (starting point)
- End-state overview (one paragraph)
- Architecture contract (event -> status -> side-effect)
- 5 states (IDLE, PROCESSING, ERROR_NETWORK, ERROR_VALIDATION, SUCCESS)
- Event transition table
- Context shape

### Updated /Sprint Command
**Location:** `.windsurf/workflows/sprint.md`

**Must follow these phases:**
- Phase 1: UX Flows First
- Phase 2: Architecture Contract
- Phase 3: Tiny Scope Contracts (max 5)
- Phase 4: Continuous Verification
- Phase 5: Final Human Check

### Scope Contract Template
**Location:** `.windsurf/workflows/scope-contract-template.md`

**Each contract must include:**
- UX slice (2-3 bullets max)
- Architecture slice (state machine integration)
- Human verification checklist (<5 minutes)
- Minimal tests (only if needed)

### Critical Lessons Learned
**From:** `_project/lessons/workflows/human-first-sprint-methodology.md`

**Key prevention rules:**
- Start with UX flows, not code
- Explicit architecture contracts prevent vagueness
- Tiny scopes with immediate verification
- Tests serve human confidence, not coverage
- "Is this the simplest possible way?" guardrail

## Exact Output Format

### File Structure
```
_project/sprints/
[SPRINT_NAME].todo
```

### Content Sections (IN THIS ORDER)

1. **Sprint Metadata**
   - Date, target state, scope lock rules
   - Reference to human-first methodology

2. **Phase 1: UX Flows First**
   - List all 10 UX flows from spec
   - Each as: "State: user does X -> system shows Y -> user can do Z"

3. **Phase 2: End-State Overview**
   - ONE paragraph only
   - What stays identical for user
   - What becomes simpler/faster
   - No technical details

4. **Phase 3: Architecture Contract**
   - Event -> State Update FIRST -> Side Effects -> Result Event flow
   - Three readable contracts:
     - Events + Payloads
     - Transition Table
     - Context Shape
   - Simplicity guardrail statement

5. **Phase 4: Tiny Scope Contracts**
   - MAX 3 contracts (keep it tiny)
   - Each following template structure
   - Include delegation commands

6. **Phase 5: Continuous Verification**
   - Per scope contract workflow
   - No big phases
   - Verify immediately after each

7. **Phase 6: Final Human Check**
   - End-to-end verification steps
   - Against original UX flows

8. **Regression Containment**
   - Files at risk
   - Mitigation plan

9. **Verification Commands**
   - Build command
   - Test commands (minimal)

## Specific Sprint Requirements

### Target State
- CheckoutButton bug fixed (checks response.outcome === "PASS")
- All 10 UX flows documented with human-first methodology
- Architecture contract created for existing event-state flow
- Human verification checklist for each UX flow
- UX remains 100% identical (already working)
- Estimated: 30-60 minutes total

### Scope Lock Rules
- NO globals.css, homepage, or UI changes
- NO new abstractions
- YES atomic, minimal changes only
- YES human verification after every contract

### Estimated Duration
- 30-60 minutes total (bug fix + documentation)
- Keep contracts tiny and focused

## Simplicity Guardrails
Apply this test to every decision:
"Is this the simplest possible way?"
- If it can be done with fewer lines, do it
- No extra layers
- No unnecessary abstractions

## Output Instructions

1. Generate the complete `.todo` file
2. Follow exact structure above
3. Include all references properly
4. Ensure human-first methodology is followed
5. Keep it simple and focused

## Final Check Before Output
- [ ] Starts with UX flows
- [ ] Has end-state overview (one paragraph)
- [ ] Includes architecture contract
- [ ] Tiny scope contracts (max 3)
- [ ] Continuous verification checkpoints
- [ ] Simplicity guardrails present
- [ ] Tests serve human confidence only
- [ ] No cargo cult patterns
- [ ] No over-complication

---

Execute this task completely. Generate the sprint file following all requirements above.
