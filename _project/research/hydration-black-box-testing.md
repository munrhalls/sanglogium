# Research: Black Box Testing for Next.js Hydration

## Research Scope Contract
- **Topic:** Black box testing approach for Next.js SSR hydration error prevention
- **First Principles:** SSR hydration mismatch, store-level vs component-level state, test isolation
- **Fundamentals:** React hydration lifecycle, Zustand persist middleware, test double boundaries
- **Scope Boundary:** Out of scope: E2E testing, actual SSR environment simulation
- **Target Audience:** Frontend developers implementing hydration-safe components
- **Decay Risk:** High - React/Next.js hydration patterns evolve

## Research Phase 1: Understanding the Problem

### What is Hydration?
- Server renders HTML with initial state
- Client React hydrates the HTML with JavaScript
- Hydration error occurs when server HTML ≠ client initial render
- Common cause: Component renders different state on server vs client

### Current Implementation in Our Codebase
- ActionBar.tsx uses local `mounted` state pattern:
  ```typescript
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  const displayCount = mounted ? basketCount : 0
  ```
- basketStore.ts has store-level `hasHydrated` flag:
  ```typescript
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  onRehydrateStorage: () => (state) => { state?.setHasHydrated(true) }
  ```

### The Testing Problem
- Test calling `setHasHydrated(true)` directly = white box (implementation detail)
- Test should test component behavior, not store internals
- Need to test observable behavior without manipulating internal state

## Research Phase 2: Black Box Testing Approaches

### Approach 1: Test Component's Natural Behavior
**What it tests:** Component renders correctly based on actual store state
**How:** Don't manipulate hydration flag, let store hydrate naturally
**Problem:** In test environment, store hydrates immediately (no real SSR delay)

### Approach 2: Test Through User Actions
**What it tests:** User can add/remove items and badge updates
**How:** Simulate user clicking add/remove buttons
**Problem:** Doesn't test hydration prevention, just state updates

### Approach 3: Test SSR Scenario (E2E)
**What it tests:** Actual SSR/hydration cycle in browser
**How:** Playwright/Cypress test with actual Next.js SSR
**Problem:** Not integration test, requires full SSR environment

### Approach 4: Test the Pattern, Not the Flag
**What it tests:** Component uses proper hydration pattern (mounted or hasHydrated)
**How:** Verify component checks hydration status before rendering persisted state
**Problem:** Still requires knowing about the pattern

## Research Phase 3: Professional Black Box Approach

### The Real Question
What is the actual observable behavior we want to test?

**Answer:** Component should not cause hydration errors by rendering different state on server vs client.

### How to Test This Black Box
1. **Test initial render consistency:** Component renders same way regardless of basket state
2. **Test after mount:** Component shows persisted state after hydration completes
3. **Don't test the flag:** Test the observable behavior (badge rendering), not the mechanism

### The Problem with Current Test
```typescript
useBasketStore.getState().setHasHydrated(true)  // ❌ White box - manipulating internal state
```

This is implementing usage, not testing usage. It's forcing the store into a specific state rather than testing how the component behaves when the store is in that state naturally.

## Research Phase 4: Proper Black Box Test Design

### Option A: Test Current Implementation (Mounted Pattern)
Since ActionBar currently uses the mounted pattern, test that:
- Initial render: badge doesn't show (even with items)
- After mount: badge shows (if items exist)
- This tests the actual pattern ActionBar uses

**Pros:** Tests actual implementation
**Cons:** Tests old pattern, not new hasHydrated pattern

### Option B: Delete Test, Accept Limitation
Hydration testing requires actual SSR context. Integration tests cannot properly test hydration.

**Pros:** Honest about test limitations
**Cons:** No test for hydration behavior

### Option C: Test Store Rehydration Behavior
Test that persist middleware works correctly:
- Store persists items to localStorage
- Store rehydrates items from localStorage
- Component renders rehydrated state

**Pros:** Tests actual persistence/rehydration
**Cons:** Doesn't test hydration error prevention specifically

### Option D: Migrate to hasHydrated, Then Test
1. Update ActionBar to use `selectHasHydrated` selector
2. Test that component checks selector before rendering
3. But this still requires calling setHasHydrated in test

**Pros:** Tests new pattern
**Cons:** Still white box if calling setHasHydrated

## Research Phase 5: Verdict

### The Hard Truth
**True black box hydration testing is not possible in integration tests.**

Hydration errors are an SSR-specific problem that requires:
1. Actual server rendering
2. Actual client hydration
3. Network delay between them
4. Browser environment

Integration tests (vitest + React Testing Library) cannot simulate this.

### What We CAN Test Black Box
1. **Persistence:** Store saves/loads from localStorage
2. **State updates:** Component updates when basket changes
3. **Component behavior:** Badge shows/hides based on basket state

### What We CANNOT Test Black Box
1. **Hydration error prevention:** Requires actual SSR
2. **Hydration flag behavior:** Requires calling internal methods (white box)

## Research Phase 6: Professional Recommendation

### Recommended Approach
**Delete the hydration test.** It's not possible to test hydration error prevention in a black box way in integration tests.

### Alternative: E2E Test
Create an E2E test (Playwright) that:
1. Starts actual Next.js server
2. Navigates to page with SSR
3. Verifies no hydration errors in console
4. Verifies component renders correctly

### What to Keep
Keep integration tests for:
- Basket state updates (add/remove items)
- Badge rendering based on basket state
- Persistence/rehydration (localStorage)

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale |
|----------|-----------|
| Delete actionBarHydration.spec.tsx | Cannot test hydration black box in integration tests |
| Keep existing basket integration tests | Test state updates and component behavior |
| Add E2E test for hydration (optional) | Only way to truly test SSR hydration |

### The hasHydrated Flag
The `hasHydrated` flag in the store is infrastructure for components to use. Testing it requires:
1. Components actually use it (ActionBar doesn't yet)
2. Either white box testing (calling setHasHydrated) or E2E testing

### Conclusion
The current test is fundamentally flawed because it's trying to test an SSR-specific concern in a non-SSR test environment. The professional approach is to accept this limitation and test hydration in E2E tests where actual SSR occurs.
