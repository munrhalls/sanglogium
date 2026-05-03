Real-World Testing Architecture: Data-UI Synergy Over Dogma
The traditional "Testing Pyramid" is an economic artifact from 2009. It optimized for execution time on old hardware, not for architectural confidence. The cargo cult interpretation of "Unit vs. Integration" ignores the mathematical reality of modern applications.

Testing two random components together and calling it "integration" is meaningless. Real value comes from aligning your testing strategy directly with the physical boundaries of your architecture.

Here is the distilled, one-page blueprint of real-world testing that works.

1. The Data Layer: Deterministic Unit Testing
The data layer (reducers, state machines, domain logic, sagas) is the mathematical core of your application. It consists of pure functions and strict state transitions.

The Goal: Absolute confidence in data integrity.

The Method: Exhaustive unit testing.

The Mechanics: Given State A and Event B, the result must be State C. There is no DOM, no rendering, and no asynchronous UI bridging.

Why It Works: It is fast, highly deterministic, and tests the exact logic the rest of the application relies on. This is the only place where chasing near 100% test coverage yields direct, real-world ROI.

2. The UI Layer: Behavioral Integration Testing
The presentation layer (React components, DOM nodes) is where the user interacts with the system. Testing implementation details here (like component internal state) is fragile and wasteful.

The Goal: Confidence that the user can interact with the system and the system reacts correctly.

The Method: Behavioral integration tests (e.g., Testing Library).

The Mechanics: Mount the UI with a known, trusted state. Query the DOM by accessibility roles (like a user would). Fire real user events (clicks, typing).

Why It Works: It treats the UI as a black box. You provide the state, and you assert that the correct action is dispatched back to the data layer.

3. The Synergy: How They Work Together
The separation of data and UI is what makes this architecture professional and robust. They do not overlap; they form a closed loop of trust.

Trust the State: UI integration tests do not need to test if the data mutates correctly. They trust the data layer's unit tests for that.

Trust the Render: Data layer unit tests do not care about the DOM. They trust the UI integration tests to render the maps correctly.

The Contract: The UI integration test proves that clicking "Submit" dispatches ACTION_SUBMIT with the correct payload. The Data layer unit test proves that receiving ACTION_SUBMIT with that payload results in the correct new state.

4. The North Star of Discernment
IF IT'S EASY TO VARY BASED ON VARIOUS CASES - THEN IT'S BULLSHIT BECAUSE IT'S TOO GENERAL.

Generic advice says "Write more integration tests."

Real-world engineering says "Unit test the pure data transformations, integration test the DOM behaviors, and mock the network boundary between them."

If a test requires retries to pass, it is not a test; it is a liability.

If a test breaks because you changed a CSS class or refactored a component's internal hook without changing the UI output, it is a bad test.


# Testing Organization: Real-World Patterns (Not Generic Theory)
 
**Research Sources:** TanStack Query, Next.js, Sang-logium codebase, Signadot (real implementations)  
**Discernment:** "IF IT'S EASY TO VARY BASED ON VARIOUS CASES - THEN IT'S BULLSHIT"
 
---
 
## What Actually Works (From Real Codebases)
 
**TanStack Query:**
- `packages/react-query/src/__tests__/useQuery.types.test.tsx` - Type-level tests next to source
- Tests grouped by feature (initialData, query key overload)
- Specific TypeScript type validation, not generic "unit tests"
 
**Next.js:**
- `packages/next/src/trace/report/index.test.ts` - Co-located with source
- Functional tests grouped by feature (JSON reporter, Telemetry reporter)
- Tests actual behavior (file writing, telemetry recording)
 
**Sang-logium:**
- `tests/checkout-queue/integration/happy-path/` - Feature-based organization
- `tests/checkout-queue/integration/reservation-ttl/` - Feature-based organization
- Zero mocks - hits real Redis and real Sanity
- Tests verify actual behavior (reservation doc created, reservedStock incremented)
 
---
 
## Universal Patterns (Not Generic)
 
**1. Co-locate tests with code**
- TanStack: `__tests__/` next to source file
- Next.js: `index.test.ts` next to `index.ts`
- Sang-logium: Feature directories with test files
- **Why:** Easy to find, easy to maintain, tests stay relevant
 
**2. Organize by feature/flow, not test type**
- Sang-logium: `happy-path/`, `reservation-ttl/`, `cleanup/` (not `unit/`, `integration/`)
- TanStack: Grouped by functionality (initialData, query key)
- Next.js: Grouped by reporter type (JSON, Telemetry)
- **Why:** Tests reflect actual user flows, not artificial categories
 
**3. Test actual behavior, not implementation details**
- Sang-logium: Verifies reservation doc created, stock incremented (not function calls)
- Next.js: Verifies file written, telemetry recorded (not internal logic)
- **Why:** Tests survive refactoring, provide real confidence
 
**4. Avoid mocks when possible**
- Sang-logium: Zero mocks, hits real Redis/Sanity
- Signadot: "Mocks simulate too much" - they don't reflect real service behavior
- **Why:** Mocks hide integration failures, expensive to maintain
 
---
 
## What Varies by Case (Not Universal)
 
**Directory structure:**
- TanStack: `__tests__/` next to each source file
- Sang-logium: Feature directories (`happy-path/`, `reservation-ttl/`)
- **Decision:** Use what fits your project structure
 
**Test types:**
- TanStack: Type-level tests (TypeScript-specific)
- Sang-logium: Integration tests (API + database)
- **Decision:** Test what matters for your domain
 
**Real systems vs stubs:**
- Sang-logium: Real Redis/Sanity (integration tests)
- Next.js: File system tests (no external services)
- **Decision:** Use real systems when feasible, stubs when not
 
---
 
## Direct Benefits (Real Evidence)
 
**Zero mocks (Sang-logium):**
- Integration tests caught encoding issues that unit tests with mocks would miss
- Tests verify actual integration between API, Redis, and Sanity
- No mock maintenance overhead
 
**Feature-based organization (Sang-logium):**
- Easy to find tests for specific flow (basket reservation, TTL cleanup)
- Tests grouped by user-facing feature, not internal implementation
- Clear mapping from feature to test coverage
 
**Co-location (TanStack, Next.js):**
- Tests next to code they test
- Easy to update when code changes
- No searching through separate `/tests` directory
 
---
 
## Apply to ExecutionSpecs.todo
 
**Current issue:** 30+ tests, over-granular split by individual actions
 
**Apply real patterns:**
1. Group by feature/slice (data layer, component layer, page integration)
2. Within each feature, group tests by actual behavior (not "unit/integration/e2e" labels)
3. Co-locate tests with code (feature-based directories)
4. Limit to what provides actual value (remove trivial tests)
5. Focus on happy path for E2E, edge cases for lower-level tests
 
**Example transformation:**
- Before: "Unit tests: add button dispatch, increment button dispatch, decrement button dispatch, remove button dispatch"
- After: "Integration tests: BasketControls rendering and all button interactions"
 