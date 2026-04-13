# Test Scope Creep Anti-Pattern

**Date:** 2026-04-13
**Source:** Test planning for checkout button to Redis queue
**Severity:** High
**Frequency:** Systemic (occurs when test names imply clear boundaries)

## The Problem
Test plan included state management, UI updates, and response handling - completely outside the "checkout button to Redis queue" scope. The flow name clearly defines an endpoint, but tests included everything after that point.

## Root Cause
Natural tendency to over-scope tests by including related but separate concerns. When planning tests, the brain automatically includes "what happens next" rather than stopping at the defined endpoint.

## The Fix
```markdown
## Test Scope
Strictly limited to these operations:
1. Button click handling
2. Idempotency key generation  
3. API request formation
4. Adding request to Redis FIFO queue

**OUT OF SCOPE**: Response handling, state management, UI updates - those are separate test scopes
```

## Prevention
**MANDATORY:** When creating unit tests, enforce strict scope boundaries:
1. **Parse the flow name** - "A to B" means ONLY A to B, not beyond
2. **Write explicit OUT OF SCOPE section** - list what's NOT included
3. **Stop at the endpoint** - tests must stop where the flow name stops
4. **Separate concerns** - each flow gets its own test file, no mixing

## Applicability
**When to apply:**
- All unit test planning
- Any test with "to" in the name (e.g., "button to queue")
- Flow-based testing (e.g., "request to response")

**Keywords:** ["test-scope", "unit-testing", "test-boundaries", "flow-testing", "scope-creep"]
