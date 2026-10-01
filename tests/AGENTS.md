# Test Directory Conventions

When working with test files in this directory:

## Naming and lanes
- Unit and component specs (jsdom, no network): `[subject].spec.ts` or `[subject].spec.tsx`, colocated and flat in the owner's `__tests__/` (for features: `features/<name>/__tests__/`). Default lane: `npm test`.
- Live-service specs (real Sanity, dev server on :3000, real Stripe): `[subject].spec.ts(x)` in `tests/live/<owner>/` (these specs import sanity-cms or need real services, which `features/**` may not do). Run with `npm run test:live` only (vitest.integration.config.ts); the default lane excludes `**/live/**`.
- Specs for an `app/api` route: `[route].spec.ts` in that route's `__tests__/` (routes are not features).
- Browser e2e (Playwright): `[flow].spec.ts` in `tests/e2e/<journey>/` (performance specs: `tests/e2e/performance/`). A journey spec drives the whole app, so no single feature owns it. The default lane excludes `**/e2e/**`.
- A spec that imports two or more sibling features: `tests/integration/[topic].spec.tsx`.
- Live-CMS proof scripts (Node .mjs, run by a human): `features/<name>/__tests__/{proofs,data}/`.
- Older files still named `.test.ts`, or kept in `unit/` and `integration/` subfolders, are renamed or flattened by the axis that moves their owner; do not rename them elsewhere.

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
- Never mix integration assertions with unit test assertions.

## Clickable file links

When outputting a file or directory path, always print it as a `file://` URI (e.g. `file:///home/jan/file.json`) for one-click terminal opening.
