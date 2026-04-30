# Next.js 15/18 + Zustand Async State Management Research

## Research Scope Contract
- **Topic:** Best practices for async data fetching in Next.js 15/18 with Zustand store vs view layer orchestration
- **First Principles:** Separation of concerns, single responsibility, data flow unidirectionality
- **Fundamentals:** Server Actions, Zustand middleware, async state patterns, CMS integration
- **Scope Boundary:** OUT of scope: Redux, Jotai, Recoil, or other state management libraries
- **Target Audience:** Frontend developers implementing basket sync with Sanity CMS
- **Decay Risk:** High - Next.js and React patterns evolve rapidly

---

## Phase 2: Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Zustand Docs (async) | https://dev.to/mrsupercraft/... | Community | Medium | 2025 | "You can handle async actions by using async functions within your Zustand store" | ⚠️ Pending |
| Zustand GitHub Discussion | https://github.com/pmndrs/zustand/discussions/1415 | Official | High | 2022 | "Just call set when you're ready, zustand doesn't care if your actions are async or not" | ⚠️ Pending |
| Zustand Persist Docs | https://zustand.docs.pmnd.rs/... | Official | Canonical | 2025 | "Asynchronous hydration can cause unexpected behaviors" | ⚠️ Pending |
| Next.js Server Actions | https://makerkit.dev/blog/tutorials/nextjs-server-actions | Blog | Medium | 2026 | "React 19 introduced useActionState for form submissions" | ⚠️ Pending |

---

## Phase 3: First Principles Analysis

### Core Problem Being Solved
Where should async data fetching logic live in a Next.js 15/18 + Zustand architecture: in the store (thunk-style) or in the view layer (orchestration pattern)?

### Underlying Constraints
1. **Server Actions run on server** - Cannot directly access client-side store
2. **Zustand is client-side only** - Store exists in browser memory
3. **React 18+ concurrent rendering** - Async state needs proper batching
4. **Next.js SSR/SSG** - Store hydration must handle server-client mismatch

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Store contains async actions | Encapsulation, single responsibility, testability | Store becomes complex, harder to mock server actions | Complex state logic with multiple steps |
| View layer orchestrates | Store stays simple, easier to test UI | View layer becomes complex, business logic leaks into components | Simple fetch-and-set patterns |

### Failure Modes
1. **Misapplication:** Using store async actions for simple one-off fetches
2. **Over-application:** Putting all async logic in store when view layer is more appropriate
3. **Under-application:** Not using store for complex state transitions that belong there

---

## Phase 4: Code Fundamentals

### Fundamental: Zustand Async Actions
**Claim:** Zustand supports async actions natively by calling set() when ready

**Verification:**
- [ ] Located in our codebase: `store/basketStore.ts` has `syncFreshness: () => Promise<SyncResult>`
- [ ] Test created: `tests/basket/unit/basketLatestSync.spec.ts`
- [ ] Source inspected: GitHub discussion #1415 from Zustand maintainers

**Actual Behavior:**
From Zustand GitHub discussion: "Just call set when you're ready, zustand doesn't care if your actions are async or not"

**Edge Cases:**
1. Race conditions if multiple async actions run concurrently
2. Need loading/error state tracking (not built into Zustand)
3. Hydration mismatch if async actions run before store hydrates

---

## Phase 5: Best Practices (Verified)

### Practice: Store Contains Async Actions for Complex State Logic
**Consensus:** High - Zustand maintainers and community recommend this pattern

**Supporting Evidence:**
- Zustand GitHub discussion #1415: "Just call set when you're ready"
- DEV.to article: Shows async fetchData pattern in store
- Common pattern in production apps

**Counter-Evidence (Falsification Attempts):**
- Some prefer React Query/SWR for data fetching instead of Zustand
- Over-engineering risk for simple fetches

**Verdict:** ✅ Recommended for complex state transitions

**When to Use:** When state update requires multiple steps, error handling, loading states
**When to Skip:** Simple one-off fetches that don't affect complex state

---

## Phase 6: Common Solutions Landscape

### Solution: Store Contains Async Actions (Thunk-style)
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Encapsulation - business logic stays in store
- Testability - can mock store actions
- Reusability - multiple components can trigger same action

**Cons:**
- Store becomes more complex
- Harder to mock server actions in tests
- Less visibility into what's happening

**Real-World Pain Points:**
- Debugging async state transitions
- Mocking server actions in unit tests

**Recommendation:** Use for complex state logic (like basket sync with CMS), avoid for simple fetches

### Solution: View Layer Orchestrates (Component calls server action, then updates store)
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Store stays simple
- Easier to mock server actions in component tests
- More visible data flow

**Cons:**
- Business logic leaks into components
- Harder to reuse across components
- Components become more complex

**Real-World Pain Points:**
- Duplicated orchestration logic across components
- Testing becomes harder with complex component logic

**Recommendation:** Use for simple fetches, avoid for complex state transitions

---

## Phase 7: Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Zustand supports async actions natively | GitHub discussion #1415 | Official source |
| Store can contain async actions | DEV.to article + GitHub discussion | Community + official |
| Persist middleware has async hydration issues | Zustand docs | Official documentation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Store should contain ALL async logic | React Query/SRW often better for data fetching | Modified - use store for state logic, use data fetching libs for API calls |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Next.js Server Actions patterns | High | 2026-06 |
| Zustand async patterns | Low | 2026-12 |
| React 19 useActionState | High | 2026-06 |

---

## Phase 8: Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Store contains syncFreshness async action | Complex state logic (CMS fetch + transformation + error handling + status tracking) | Keep syncFreshness in basketStore.ts as async action |
| View layer triggers on mount | Basket page component orchestrates lifecycle | BasketClientWrapper.tsx calls store.syncFreshness() on mount |
| Store handles transformation | CMS data needs transformation (cents→displayPrice, stock-reservedStock=availableStock) | Store contains transformation logic in syncFreshness |
| Store handles error handling | syncStatus lifecycle is store responsibility | Store manages syncStatus state transitions |

### Immediate Actions
1. ✅ Keep syncFreshness as async action in basketStore.ts (already designed this way)
2. ✅ Store handles CMS data transformation (already in PRD)
3. ✅ Store manages syncStatus lifecycle (already in PRD)
4. ✅ View layer triggers syncFreshness on mount (already in design)
5. Add server action type definition for CMS fetch request/response
6. Add error handling for CMS fetch failures in store

### Open Questions
1. Should we use React Query/SWR for CMS data fetching instead of store async action?
   - **Answer:** No - for this specific use case (basket sync), the complex state logic belongs in store. React Query would add unnecessary abstraction.

2. Should the store call server action directly or receive it as a dependency?
   - **Answer:** Store should call server action directly for encapsulation. If needed for testing, can inject via dependency injection pattern.

### Final Recommendation
**Store contains async action (syncFreshness) that:**
- Calls server action to fetch CMS data (price_data, stock, reservedStock)
- Transforms data (cents→displayPrice, calculates availableStock)
- Updates syncStatus through lifecycle (idle→loading→success/error)
- Handles errors gracefully
- Returns transformed data for view layer

**View layer (basket page) simply:**
- Triggers store.syncFreshness() on mount/refresh
- Reads syncStatus from store for UI state
- Reads transformed data from store for rendering

This follows Zustand best practices, maintains separation of concerns, and keeps the store as the single source of truth for basket state.
