# Test Directory Conventions

When working with test files in this directory:

## Naming
- Unit tests: `[subject].test.ts` or `[subject].test.tsx`
- Integration tests: `[subject].spec.tsx`
- E2E tests: `[feature].e2e.spec.ts`

## Structure (Contract-Based)
- Top-level `describe`: Contract or system name (e.g., "Basket Store", "Basket Page Contracts")
- Nested `describe`: Operation name from contract (e.g., "addItem", "incrementItem")
- `it` blocks: Present tense action describing behavior, includes preconditions

## AAA Pattern
Every test MUST use Arrange-Act-Assert:
```typescript
it('action description in present tense', () => {
  // ARRANGE - setup test state
  // ACT - call function/behavior being tested
  // ASSERT - verify expected outcome
})
```

## Test-First Discipline
- Write tests BEFORE implementation
- Tests must FAIL first (RED)
- Never write tests that pass immediately — that's a false positive
- A single false positive can ruin the entire codebase

## Context-Aware Components
- Integration tests for context-aware components MUST test each rendering context separately
- Never assume single rendering mode
- Use nested describe blocks per context (e.g., "on product page", "on basket page")
- Each test explicitly states which context it tests

## Mocks
- Mock external dependencies (APIs, router, etc.)
- Document mock justification in comment
- Never mock the system under test

## Zustand Store Testing
- Reset store state in `beforeEach`: `useStore.setState({ items: [] })`
- Use `act()` for store mutations in tests

## Integration Test Layer Trust
- Integration tests trust unit tests for data layer behavior
- Integration tests verify: state renders, user action dispatches correct function with expected params
- Never mix integration assertions with unit test assertions
