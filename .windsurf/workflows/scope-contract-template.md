# Tiny Scope Contract Template

**Purpose:** Self-contained implementation units with UX slice, architecture slice, human verification, and minimal tests.

---

## Scope Contract N: [Feature Name] - [UX Impact]

### UX Slice (2-3 bullets max)
- User does [specific action] -> system shows [specific result] -> user can do [next action]
- User sees [specific UI state] when [specific condition]
- User can [specific interaction] to achieve [specific goal]

### Architecture Slice
- **State Machine Integration:**
  - Handles event(s): [EVENT_NAME]
  - Transitions from: [CURRENT_STATE] to [NEXT_STATE]
  - Updates context: [context_field] with [value]
- **Side Effects:**
  - Server action: [function_name] with [payload]
  - Result event: [RESULT_EVENT] with [payload]
- **UI Updates:**
  - Component: [ComponentName] renders based on [state]

### Human Verification Checklist (<5 minutes)
- [ ] **Pre-condition:** [specific observable state before action]
- [ ] **Action:** [specific user interaction to perform]
- [ ] **Immediate result:** [specific UI change should be visible]
- [ ] **State change:** [specific state transition should occur]
- [ ] **Side effect:** [specific server action should trigger]
- [ ] **Error case:** [specific error handling behavior]

### Minimal Tests (ONLY if needed for human confidence)
```typescript
// Test: [specific user behavior]
test('[test description]', async () => {
  // Arrange
  [setup code]
  
  // Act
  [user action]
  
  // Assert
  [specific observable outcome]
});
```

### Implementation Notes
- **Files to touch:** [specific file paths only]
- **Dependencies:** [minimal external requirements]
- **Simplicity check:** "Can this be done with fewer lines?"

### Completion Criteria
- [ ] Human verification checklist passes
- [ ] Minimal tests (if any) pass
- [ ] Simplicity guardrail satisfied
- [ ] No regression in other scope contracts

---

## Usage Instructions

1. **Copy this template** for each scope contract
2. **Fill UX slice first** - must be user-focused
3. **Define architecture slice** - how it plugs into system
4. **Write verification checklist** - must be human-doable in <5 min
5. **Add tests ONLY if needed** - for human confidence, not coverage
6. **Implement** - only what the contract specifies
7. **Verify immediately** - run checklist before moving on

## Guardrails

- **Stay tiny:** Each contract should be implementable in <2 hours
- **Stay focused:** No touching other contracts' code
- **Stay simple:** If it can be done with fewer lines, do it
- **Stay verifiable:** If human can't verify it quickly, simplify
