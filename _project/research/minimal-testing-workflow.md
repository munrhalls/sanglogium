# Minimal Testing Workflow Research

**Research Date:** 2026-05-12
**Topic:** Minimal, high-value testing practices for /test workflow definition

---

## Research Scope Contract
- **Topic:** Minimal testing workflow that produces high-value tests without bloat, cargo-cult patterns, or white box coupling
- **First Principles:** 
  1. Tests exist to provide confidence that application works when users use it
  2. Use case coverage > code coverage
  3. Tests should rarely need to change when code is refactored
- **Fundamentals:** Behavior verification over implementation verification, integration over unit where appropriate, minimal passing tests
- **Scope Boundary:** Testing philosophy and workflow design; not specific framework implementation details
- **Target Audience:** Development team implementing /test workflow for /implement Definition of Done verification
- **Decay Risk:** Low - testing fundamentals are stable

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Kent C. Dodds - How to know what to test | https://kentcdodds.com/blog/how-to-know-what-to-test | Authoritative Voice | High | 2019-04 | "Think less about the code you are testing and more about the use cases that code supports" | ✅ Verified |
| Kent C. Dodds - Write tests. Not too many. Mostly integration. | https://kentcdodds.com/blog/write-tests | Authoritative Voice | High | 2019-07 | "Not too many. Mostly integration." - Avoid 100% coverage, focus on integration tests | ✅ Verified |
| Codepipes - Software Testing Anti-patterns | https://blog.codepipes.com/testing/software-testing-antipatterns.html | Community Consensus | Medium | N/A | Anti-pattern: Testing internal implementation causes tight coupling | ✅ Verified |
| Microsoft - Unit Testing Best Practices | https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices | Official Documentation | Canonical | N/A | Write minimally passing tests with simplest input needed | ✅ Verified |
| Kyle Bebak - Cargo Cult Testing | https://kylebebak.github.io/post/cargo-cult-testing | Counter-Evidence | Medium | N/A | Testing mocks/frameworks instead of actual behavior is cargo cult | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
How to write tests that provide confidence without becoming a maintenance burden that slows development.

### Underlying Constraints
1. **Time is finite:** Every test written is time not spent on features
2. **Tests must be maintained:** Tests that break on refactoring are liabilities, not assets
3. **Confidence is the goal:** Tests exist to verify behavior users care about, not code paths

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Unit tests (mocked) | Fast, isolated | Low confidence, brittle | Pure logic functions, algorithms |
| Integration tests (real deps) | High confidence, realistic behavior | Slower, more setup | Component interactions, API contracts |
| E2E tests | Maximum confidence | Very slow, fragile | Critical user flows, happy paths |

### Failure Modes
1. **Over-application:** Testing trivial code or implementation details
2. **Cargo-cult testing:** Writing tests because "tests are good" without understanding what value they provide
3. **White box coupling:** Tests that break when implementation changes without behavior change

---

## Code Fundamentals

### Fundamental: Use Case Coverage over Code Coverage
**Claim:** Code coverage metrics are misleading; focus on use cases instead.

**Verification:**
- [x] Located in our codebase: Not applicable (philosophy)
- [x] Source inspected: Kent C. Dodds blog post with concrete example

**Actual Behavior:**
Code coverage shows which lines run, but not whether important use cases are verified. A function with 100% coverage can still have missing edge cases.

**Edge Cases:**
1. Coverage can help identify untested code paths, but should not be the goal
2. 70% coverage with good use case coverage > 100% coverage with implementation-detail tests

### Fundamental: Integration Tests Over Unit Tests
**Claim:** Integration tests provide better confidence-to-effort ratio for most application code.

**Verification:**
- [x] Source inspected: Kent C. Dodds "Write tests. Not too many. Mostly integration."

**Actual Behavior:**
Unit tests with mocks remove confidence in integration between components. Integration tests verify components work together, often making isolated unit tests unnecessary.

**Edge Cases:**
1. Pure algorithms still benefit from unit tests
2. External services (email, payment) still need mocking in integration tests

---

## Best Practices (Verified)

### Practice: Write Tests for Use Cases, Not Implementation
**Consensus:** High

**Supporting Evidence:**
- Kent C. Dodds: "Think less about the code you are testing and more about the use cases that code supports"
- Microsoft: "Focus on verifying the behavior over the implementation"

**Counter-Evidence (Falsification Attempts):**
- Some argue implementation details matter for complex algorithms
- Rebuttal: Even algorithms can be tested via behavior (input → output)

**Verdict:** ✅ Recommended

**When to Use:** Always for application code
**When to Skip:** Never - this is a fundamental principle

### Practice: Write Minimally Passing Tests
**Consensus:** High

**Supporting Evidence:**
- Microsoft: "The input for a unit test should be the simplest information needed to verify the behavior"
- Kent C. Dodds: Tests with extra information have higher chance of errors and less clear intent

**Counter-Evidence (Falsification Attempts):**
- Some argue complex test data better represents real scenarios
- Rebuttal: Real scenarios should be separate integration/E2E tests, not bloated unit tests

**Verdict:** ✅ Recommended

**When to Use:** Unit tests
**When to Skip:** When testing edge cases that require specific complex input

### Practice: Mostly Integration Tests
**Consensus:** High

**Supporting Evidence:**
- Kent C. Dodds: "Integration tests strike a great balance on the trade-offs between confidence and speed/expense"
- Guillermo Rauch: "Write tests. Not too many. Mostly integration."

**Counter-Evidence (Falsification Attempts):**
- Traditional testing pyramid suggests mostly unit tests
- Rebuttal: Pyramid doesn't account for confidence quotient; Testing Trophy is better model

**Verdict:** ✅ Recommended

**When to Use:** Component interactions, API contracts, user flows
**When to Skip:** Pure logic functions, algorithms (use unit tests)

### Practice: Avoid Testing Internal Implementation
**Consensus:** High

**Supporting Evidence:**
- Codepipes: "Tests that need to be refactored all the time suffer from tight coupling with the main code"
- Kent C. Dodds: "You should very rarely have to change tests when you refactor code"

**Counter-Evidence (Falsification Attempts):**
- Some argue internal state verification is necessary for complex systems
- Rebuttal: If internal state matters, it should be exposed via behavior/API

**Verdict:** ✅ Recommended

**When to Use:** Always
**When to Skip:** Never

---

## Common Solutions Landscape

### Solution: Test Naming Convention (Method_Scenario_ExpectedBehavior)
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Self-documenting
- Clear failure messages
- Expresses intent

**Cons:**
- Can be verbose for complex scenarios

**Real-World Pain Points:**
- Poorly named tests require reading implementation to understand purpose

**Recommendation:** Use for all tests

### Solution: Arrange-Act-Assert Pattern
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Pros:**
- Clear test structure
- Separates concerns
- Improves readability

**Cons:**
- None significant

**Real-World Pain Points:**
- Tests that mix setup, execution, and verification are hard to debug

**Recommendation:** Use for all tests

### Solution: 100% Code Coverage Goals
**Prevalence:** Common (but anti-pattern)
**Type:** Anti-pattern

**Pros:**
- Easy metric to track
- Ensures all code is touched

**Cons:**
- Diminishing returns beyond 70%
- Encourages testing trivial code
- Encourages testing implementation details
- Slows development

**Real-World Pain Points:**
- Teams spend more time maintaining tests than writing features
- Tests break on refactoring without behavior changes

**Recommendation:** Avoid. Target 70% coverage with focus on use cases.

### Solution: Heavy Mocking in Unit Tests
**Prevalence:** Common
**Type:** Anti-pattern (when overused)

**Pros:**
- Fast execution
- Isolated testing

**Cons:**
- Low confidence (testing mocks, not real behavior)
- Brittle (coupled to implementation)
- Cargo-cult risk (testing framework instead of code)

**Real-World Pain Points:**
- Tests pass but production fails due to integration issues
- Mocks drift from real implementations

**Recommendation:** Minimize mocking. Prefer integration tests with real dependencies.

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Use case coverage > code coverage | Kent C. Dodds blog | Doc |
| Integration tests provide better ROI | Kent C. Dodds + Guillermo Rauch | Doc |
| Testing implementation details is anti-pattern | Codepipes + Kent C. Dodds | Doc |
| Minimally passing tests are more resilient | Microsoft docs | Doc |
| 100% coverage is waste of time | Kent C. Dodds + Codepipes | Doc |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Unit tests should be primary focus | Testing Trophy shows integration better balance | Modified |
| High code coverage = quality | Codepipes: "100% coverage can still have bugs" | Abandoned |
| Implementation details need testing | If it matters, expose via behavior | Survived |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Testing philosophy | Low | 2027-05-12 |
| Tool-specific patterns | High | 2026-08-12 |
| Anti-patterns | Low | 2027-05-12 |

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Focus on use case coverage | Code coverage is misleading metric | Test based on user scenarios, not code paths |
| Prefer integration tests | Better confidence-to-effort ratio | Test component interactions with real dependencies |
| Avoid white box testing | Tests break on refactoring | Test behavior, not implementation details |
| Write minimally passing tests | More resilient, clearer intent | Use simplest input that verifies behavior |
| Target 70% coverage | Diminishing returns beyond | Stop when critical use cases covered |
| Avoid cargo-cult testing | Testing mocks/frameworks is waste | Test actual code behavior, not test tools |

### Immediate Actions
1. Define /test workflow based on these principles
2. Integrate /test with /implement Definition of Done
3. Establish test naming convention: Method_Scenario_ExpectedBehavior
4. Enforce Arrange-Act-Assert pattern in test reviews
5. Set coverage target at 70% for critical paths only

### Open Questions
1. What is the optimal integration-to-unit test ratio for our codebase?
2. Which external dependencies should be mocked vs. real in integration tests?
3. How do we measure "use case coverage" without automated tooling?

---

## References
- Kent C. Dodds. "How to know what to test." https://kentcdodds.com/blog/how-to-know-what-to-test
- Kent C. Dodds. "Write tests. Not too many. Mostly integration." https://kentcdodds.com/blog/write-tests
- Kent C. Dodds. "The Testing Trophy and Testing Classifications." https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Codepipes Blog. "Software Testing Anti-patterns." https://blog.codepipes.com/testing/software-testing-antipatterns.html
- Microsoft Learn. "Unit testing best practices for .NET." https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices
- Kyle Bebak. "Cargo Cult Testing." https://kylebebak.github.io/post/cargo-cult-testing
- Guillermo Rauch. Twitter thread on testing philosophy. https://x.com/rauchg/status/807626710350839808
