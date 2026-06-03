# Research Scope Contract
- **Topic:** AAA (Arrange, Act, Assert) pattern in unit testing
- **First Principles:** Test clarity, single responsibility, test isolation
- **Fundamentals:** Test structure, assertion placement, test organization
- **Scope Boundary:** Out of scope: specific testing frameworks, test strategy (unit vs integration vs E2E)
- **Target Audience:** Sang-logium project team writing tests
- **Decay Risk:** Low - AAA is a fundamental pattern, not technology-dependent

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Bill Wake (XP123) | https://xp123.com/3a-arrange-act-assert/ | Originator | Canonical | 2001 | AAA makes tests do one thing clearly | ✅ Verified |
| Kent C Dodds | https://kentcdodds.com/blog/write-tests | Authoritative | High | 2019 | Focus on integration tests, not AAA specifically | ⚠️ Not about AAA |
| Semaphore Blog | https://semaphore.io/blog/aaa-pattern-test-automation | Blog | Low | Unknown | AAA is standard across industry | ❌ Generic/hype |

## First Principles Analysis

### Core Problem Being Solved
Tests become unreadable when they mix setup, execution, and verification in unclear sequences, making it hard to understand what behavior is being tested.

### Underlying Constraints
1. Tests must be readable by other developers
2. Tests must be maintainable during refactoring
3. Tests must clearly communicate what behavior is being verified

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Strict AAA (one assert) | Maximum clarity | More test files | Simple unit tests |
| Flexible AAA (multiple asserts) | Fewer test files | Reduced clarity | Integration tests |
| No AAA structure | Maximum flexibility | Unreadable | Never |

### Failure Modes
1. **Misapplication:** Using AAA for complex multi-step scenarios that should be split
2. **Over-application:** Enforcing one-assert rule when multiple related assertions make sense
3. **Under-application:** Not using AAA at all, making tests unreadable

## Code Fundamentals

### Fundamental: AAA Structure
**Claim:** Tests should be structured as Arrange (setup), Act (execute), Assert (verify)

**Verification:**
- [x] Located in our codebase: tests/checkout-queue/integration/happy-path/sequential-fifo.test.ts
- [x] Test created: N/A (existing code)
- [x] Source inspected: Our codebase

**Actual Behavior:**
Our codebase tests do NOT strictly follow AAA:
- `setup.test.ts`: Simple fetch + multiple asserts (close to AAA)
- `sequential-fifo.test.ts`: Complex setup, multiple fetch calls, multiple asserts (NOT AAA)

**Edge Cases:**
1. Integration tests with multiple API calls break strict AAA
2. Tests verifying multiple dimensions of a single action require multiple asserts

## Best Practices (Verified)

### Practice: AAA for Test Structure
**Consensus:** High - widely recommended

**Supporting Evidence:**
- Bill Wake (originator): AAA makes tests do one thing clearly
- Semaphore blog: Mentions AAA is standard (but low credibility)

**Counter-Evidence (Falsification Attempts):**
- Bill Wake explicitly says guidelines can be bent: "I won't say 'never do it'"
- One-assert-per-test is not a strict rule per Bill Wake

**Verdict:** ✅ Recommended as guideline, not absolute rule

**When to Use:** Unit tests, simple scenarios
**When to Skip:** Complex integration tests, multi-step scenarios

### Practice: Assert First (TDD technique)
**Consensus:** Medium - TDD-specific

**Supporting Evidence:**
- Bill Wake: "Assert First lets you start by asking 'Suppose it worked; how would I be able to tell?'"

**Counter-Evidence:**
- Not applicable if not using TDD

**Verdict:** ⚠️ Context-Dependent (TDD only)

**When to Use:** TDD workflow
**When to Skip:** Non-TDD workflows

## Common Solutions Landscape

### Solution: Strict AAA (one assert per test)
**Prevalence:** Common in unit testing literature
**Type:** Idiomatic

**Pros:**
- Maximum test clarity
- Easy to identify failing assertion
- Tests do one thing

**Cons:**
- More test files to maintain
- Cannot verify multiple dimensions in one test

**Real-World Pain Points:**
- Integration tests with multiple API calls cannot follow strict AAA
- Tests verifying complex state changes need multiple asserts

**Recommendation:** Use for unit tests, bend for integration tests

### Solution: Flexible AAA (multiple asserts)
**Prevalence:** Common in real-world codebases
**Type:** Idiomatic

**Pros:**
- Fewer test files
- Can verify multiple dimensions
- Practical for integration tests

**Cons:**
- Reduced clarity
- Harder to identify failing assertion
- Tests may do multiple things

**Real-World Pain Points:**
- Tests become unreadable when too many asserts

**Recommendation:** Use for integration tests, limit to related assertions

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| AAA improves test clarity | Bill Wake (originator) | Authoritative source |
| Guidelines can be bent | Bill Wake (XP123) | Direct quote |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| One assert per test is required | Bill Wake says not strict rule | Modified (guideline, not rule) |
| AAA is universally applied | Our codebase doesn't follow AAA | Survived (guideline, not rule) |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| AAA fundamentals | Low | Never (fundamental pattern) |

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use AAA as guideline, not absolute rule | Bill Wake (originator) allows bending | Follow AAA structure when practical |
| One assert per test for unit tests | Maximum clarity | Apply to simple unit tests |
| Multiple asserts for integration tests | Practical necessity | Our integration tests already do this |
| Focus on test clarity over strict AAA | First principle: tests must be readable | Prioritize readability over dogma |

### Immediate Actions
1. Update execution specs to use AAA structure (describe/it blocks already follow this)
2. When writing tests, think in terms of Arrange/Act/Assert phases
3. Don't enforce one-assert-per-test rule for integration tests
4. Split complex tests into multiple simpler tests when possible

### Open Questions
None
