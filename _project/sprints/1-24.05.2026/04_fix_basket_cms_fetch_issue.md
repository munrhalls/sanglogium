# Sprint: Fix Basket CMS Fetch Issue

**Target Agent:** DeepSeek v4  
**Goal:** Verify and fix CMS fetch behavior to only trigger when new product IDs are added to basket, not on quantity changes or item deletions

---

## Context for DeepSeek v4

### Problem Description
Basket page shows incorrect number of items after adding products on homepage and navigating back. The CMS fetch logic in `BasketManager.tsx` uses a `useRef` to track fetched product IDs to prevent unnecessary re-fetches, but the ref resets on component unmount/remount. This causes:

1. When navigating from homepage → basket page, `BasketManager` unmounts and remounts
2. `fetchedIdsRef` resets to empty `Set`
3. The `useEffect` detects all current IDs as "new" and should fetch all products
4. However, due to race conditions with Zustand hydration or SWR deduping, some products may not be fetched
5. Result: UI shows fewer items than localStorage contains

### Relevant Files
- **BasketManager.tsx** - Component with CMS fetch logic (lines 38-70)
- **basketStore.ts** - Zustand store with persist middleware
- **BasketManager.test.tsx** - Unit tests

### Current Implementation (Lines 38-70)
```tsx
const currentProductIds = useMemo(() => {
  return basket.map((item) => item.productId);
}, [basket]);

const fetchedIdsRef = useRef<Set<string>>(new Set());
const [swrKey, setSwrKey] = useState<string[] | null>(null);

useEffect(() => {
  if (!_hasHydrated || currentProductIds.length === 0) {
    fetchedIdsRef.current.clear();
    setSwrKey(null);
    return;
  }

  const newIds = currentProductIds.filter(
    (id) => !fetchedIdsRef.current.has(id)
  );

  if (newIds.length > 0) {
    newIds.forEach((id) => fetchedIdsRef.current.add(id));
    setSwrKey(["basket-products", ...currentProductIds]);
  }
}, [currentProductIds, _hasHydrated]);
```

### Requirements
1. CMS fetch should ONLY trigger when basket adds NEW product IDs (array grows longer)
2. CMS fetch should NOT trigger when:
   - Quantity changes on existing product
   - Product is removed from basket
3. Zero coupling between CMS fetch and basket store state changes
4. Must work correctly across navigation (homepage ↔ basket page)

---

## UX Flows

### Current State
1. User adds product on homepage → basket store updates → localStorage persists
2. User navigates to basket page → BasketManager mounts
3. BasketManager reads from localStorage (via Zustand persist)
4. CMS fetch triggers for all product IDs
5. **BUG:** UI shows fewer items than localStorage contains

### Target End-State
1. User adds product on homepage → basket store updates → localStorage persists
2. User navigates to basket page → BasketManager mounts
3. BasketManager reads from localStorage (via Zustand persist)
4. CMS fetch triggers ONLY for products not yet fetched
5. UI shows ALL items from localStorage correctly
6. User changes quantity → NO CMS re-fetch
7. User removes item → NO CMS re-fetch

---

## Architecture Contract

### Event-State-Server Flow
```
Navigation Event → BasketManager Mount → Read localStorage (Zustand persist) → 
Calculate product IDs → Compare against fetched IDs → 
If NEW IDs exist: Update SWR key → CMS fetch → Enrich items → Render
```

### Contracts
1. **Fetched IDs Tracking:** Must persist across component unmount/remount (currently broken)
2. **Fetch Trigger Condition:** Only when `newIds.length > 0` (new product IDs not previously fetched)
3. **Hydration Safety:** Must handle Zustand `_hasHydrated` flag correctly to avoid race conditions

### Simplicity Guardrail
"If it can be done with fewer lines or no new abstraction, do it that way"

---

## Scope Contracts (3 contracts)

### Scope Contract 1: Verify Root Cause

**UX Slice:**
- DeepSeek reads BasketManager.tsx lines 38-70
- DeepSeek analyzes the race condition between component remount and SWR fetch

**Architecture Slice:**
- Identify exact point where `fetchedIdsRef` reset causes missing fetches
- Verify if SWR dedupingInterval (5000ms) interferes with navigation timing
- Check if Zustand `_hasHydrated` timing causes effect to run with empty state

**Human Verification:**
- DeepSeek reports: "Root cause is X" with evidence from code analysis

**Minimal Tests:**
- None (investigation phase)

---

### Scope Contract 2: Design Solution

**UX Slice:**
- DeepSeek proposes minimal fix that preserves current behavior
- Solution must handle navigation remount correctly
- Solution must maintain "only fetch on new IDs" requirement

**Architecture Slice:**
- Evaluate options:
  1. Move `fetchedIdsRef` to localStorage (persists across remount)
  2. Change ref reset logic to only clear on basket empty
  3. Remove ref entirely and use SWR's native caching differently
  4. Other approach DeepSeek discovers
- Select simplest solution with minimal code changes

**Human Verification:**
- DeepSeek explains: "Solution X is simplest because..."

**Minimal Tests:**
- None (design phase)

---

### Scope Contract 3: Implement and Verify

**UX Slice:**
- Apply chosen fix to BasketManager.tsx
- Run existing unit tests
- Verify behavior matches requirements

**Architecture Slice:**
- Implement the fix (maximum 10 lines changed)
- Ensure no new dependencies or abstractions
- Keep SWR configuration unchanged unless necessary

**Human Verification:**
- [ ] Unit tests pass
- [ ] Code review shows minimal changes
- [ ] Solution handles navigation remount correctly
- [ ] Solution prevents fetch on quantity change
- [ ] Solution prevents fetch on item removal

**Minimal Tests:**
- If fix changes behavior significantly, add test case for navigation scenario

---

## Continuous Verification

### Per Scope Contract
1. DeepSeek completes investigation/design/implementation
2. DeepSeek self-verifies against requirements
3. DeepSeek reports findings with evidence
4. Only then: proceed to next contract

### No Big Phases
- No "implement all then test"
- Each scope contract is self-contained
- Verification after each contract

---

## Final Human Check

After all scope contracts:
- [ ] CMS fetch only triggers when new product IDs added
- [ ] CMS fetch does NOT trigger on quantity changes
- [ ] CMS fetch does NOT trigger on item removal
- [ ] Navigation from homepage to basket shows all items correctly
- [ ] Solution is minimal (≤ 10 lines changed)
- [ ] Existing unit tests pass
- [ ] No new dependencies or abstractions

---

## Simplicity Guardrails

- "Is this the simplest possible way?" - ask before each implementation
- Maximum 10 lines changed in BasketManager.tsx
- No new files
- No new dependencies
- No new abstractions (hooks, utilities, etc.)
- Prefer single-line fixes over complex state machines

---

## Notes for DeepSeek v4

**Exploration Space:**
- You may discover the root cause is different than suspected
- You may find a simpler solution than the options listed
- You should verify your understanding by reading the actual code
- You should consider edge cases: rapid navigation, empty basket, hydration timing

**Verification Requirements:**
- Don't just propose a solution - verify it against the requirements
- Explain WHY your solution is the simplest
- Show evidence that it solves the navigation remount issue
- Confirm it maintains the "only fetch on new IDs" behavior

**Constraints:**
- Maximum 7 scope contracts (this sprint has 3)
- Each contract should take < 10 minutes to complete
- Total sprint should take < 30 minutes
- If you find complexity growing, stop and propose a simpler approach
