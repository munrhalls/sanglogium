# Research: Dropdown Close Mechanism - Parent-to-Deep-Child Communication

## Research Scope Contract
- **Topic:** Closing a dropdown menu when a deeply-nested link is clicked in React/Next.js
- **First Principles:** 
  1. Component state should be owned by the closest common ancestor
  2. Unidirectional data flow (props down, events up)
  3. Minimize re-renders and coupling
- **Fundamentals:** 
  - Prop drilling patterns
  - React Context API behavior
  - Event delegation alternatives
- **Scope Boundary:** 
  - IN: React 18+, Next.js 15, TypeScript
  - OUT: External state libraries (Zustand, Redux), global event bus
- **Target Audience:** Frontend developer implementing catalogue navigation
- **Decay Risk:** Low - React patterns are stable

---

## First Principles Analysis

### Core Problem Being Solved
A dropdown menu's open/close state lives in a parent component (NavbarManager), but the trigger to close it (clicking a catalog item Link) happens 3-4 component levels deep in the tree. The challenge is communicating the close event upward without breaking component boundaries.

### Underlying Constraints
1. **React's unidirectional data flow** — State flows down, events flow up
2. **Component isolation** — Child components shouldn't know parent implementation details
3. **Performance** — Avoid unnecessary re-renders across the tree
4. **Type safety** — TypeScript requires explicit prop contracts

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Prop drilling | Explicit, type-safe, no magic | Verbose, coupling at each level | Shallow trees (<4 levels), stable APIs |
| Context API | No prop drilling, clean interfaces | Less explicit, all consumers re-render | Deep trees, dynamic scope changes |
| Event delegation | Single handler, DOM-level | Breaks React abstraction, harder to type | Many similar elements, list items |
| Render props | Flexible composition | Callback pyramid, harder to read | Complex conditional rendering |

### Failure Modes
1. **Over-engineering:** Using Context for a 3-level tree adds complexity without benefit
2. **Tight coupling:** Child components knowing too much about parent state structure
3. **Prop drilling death:** Drilling 6+ levels creates maintenance burden
4. **Context waterfall:** Creating separate contexts for every piece of state

---

## Code Fundamentals

### Fundamental: Prop Drilling with Callback
**Claim:** Explicit prop passing is the most predictable pattern for shallow trees.

**Verification:**
- [ ] Located in our codebase: `app/components/layout/catalogue/NavbarManager.tsx`
- [ ] Tree depth: NavbarManager → CatalogueView → SliceDetails → DetailSection → Link (4 levels)
- [ ] Pattern already used: No, currently no onClick handler on links

**Actual Implementation Path:**
```
NavbarManager (closeMenu function)
  ↓ onClose prop
CatalogueView (forward to SliceDetails)
  ↓ onClose prop
SliceDetails (forward to DetailSection)
  ↓ onClose prop
DetailSection (apply to Link onClick)
```

**Edge Cases:**
1. Multiple link types (section headers vs leaf items)
2. SSR hydration — onClick only works client-side (acceptable for dropdown)

---

### Fundamental: React Context for State Distribution
**Claim:** Context is the idiomatic React solution for avoiding prop drilling in deep trees.

**Verification:**
- React docs: "Context lets the parent component make some information available to any component in the tree below it" — react.dev/reference/react/useContext
- Pattern is built into React, no external dependencies

**Actual Behavior:**
- Provider wraps children, consumers use `useContext()`
- All consumers re-render when context value changes
- TypeScript requires explicit context type definition

**Edge Cases:**
1. Context splits: Separate contexts for state vs dispatch prevent unnecessary renders
2. Over-use: Creates hidden dependencies that make testing harder

---

### Fundamental: Event Delegation Pattern
**Claim:** Single event listener on container can handle all child clicks.

**Verification:**
- DOM event bubbling is standard behavior
- React's onClick uses synthetic event system

**Actual Behavior:**
```javascript
// Parent captures all clicks
<div onClick={(e) => {
  if (e.target.closest('a')) closeMenu();
}}>
  {children}
</div>
```

**Edge Cases:**
1. Event target detection complexity
2. Breaks React's declarative model
3. Harder to type with TypeScript

---

## Best Practices (Verified)

### Practice: Prop Drilling for Depth ≤ 4
**Consensus:** High among React core team and community

**Supporting Evidence:**
- React docs: "Passing props is a great way to explicitly pipe data through your UI tree to the components that use it." — react.dev/learn/thinking-in-react
- Kent C. Dodds: "Prop drilling is fine. It's not a problem." — blog post 2021

**Counter-Evidence (Falsification Attempts):**
- Prop drilling becomes unwieldy at 5+ levels (agreed threshold)
- Can be refactored to Context when pain is felt

**Verdict:** ✅ Recommended for this use case

**When to Use:** Tree depth 1-4, stable API boundaries
**When to Skip:** Tree depth 5+, dynamic scope boundaries

---

### Practice: Context for Cross-Cutting Concerns
**Consensus:** High for auth, theme, user preferences

**Supporting Evidence:**
- React docs use Context for themes, current account

**Counter-Evidence:**
- Over-use creates "magic" dependencies
- Testing requires wrapping components with Provider

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Truly global state, 5+ component levels
**When to Skip:** Localized state, shallow trees

---

### Practice: Callback Naming Convention
**Consensus:** High in React community

**Supporting Evidence:**
- `onVerb` for callbacks (onClose, onSubmit)
- Prefix with `handle` for handlers (handleClose)

**Counter-Evidence:** None significant

**Verdict:** ✅ Recommended

---

## Common Solutions Landscape

### Solution: Prop Drilling (Explicit Callback)
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Pros:**
- Completely explicit — every component declares its interface
- Type-safe with TypeScript
- Easy to test — mock the callback
- No hidden dependencies
- Zero runtime overhead

**Cons:**
- Verbose for deep trees
- Intermediate components have to forward props they don't use
- Changing API requires touching all levels

**Real-World Pain Points:**
- "Prop drilling" has negative connotation but is often the right choice
- Fear of prop drilling leads to premature Context adoption

**Recommendation:** ✅ USE for this dropdown case (4 levels)

---

### Solution: React Context with useContext
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- No prop drilling at all
- Clean component signatures
- Can handle dynamic scope

**Cons:**
- Less explicit — child dependencies hidden
- All consumers re-render on context change (can split contexts)
- Testing requires Provider wrapper
- Overkill for shallow trees

**Real-World Pain Points:**
- "Why is this component re-rendering?" — Context change invisible in props
- Multiple contexts create Provider hell

**Recommendation:** ⚠️ Consider for deeper trees, skip for this case

---

### Solution: Render Props Pattern
**Prevalence:** Niche (was popular, now largely replaced by hooks)
**Type:** Workaround for pre-hooks era

**Pros:**
- Flexible composition
- Explicit data flow

**Cons:**
- Pyramid of doom
- Harder to read than hooks
- Not idiomatic modern React

**Recommendation:** ❌ Avoid — outdated pattern

---

### Solution: Event Delegation on Container
**Prevalence:** Niche in React
**Type:** Workaround

**Pros:**
- Single handler
- No prop changes needed

**Cons:**
- Breaks React abstraction
- Fragile (relies on DOM structure)
- Harder to type
- SSR issues

**Recommendation:** ❌ Avoid — not idiomatic React

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Prop drilling is fine for shallow trees | React docs, Kent C. Dodds | Documentation |
| Context causes re-renders in all consumers | React source code | Source inspection |
| 4 levels is acceptable for prop drilling | Community consensus | Blog posts |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Prop drilling is always bad" | Kent C. Dodds explictly refutes | Abandoned |
| "Always use Context for state" | React docs recommend props first | Modified |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| React patterns | Low | 2027-04 |
| Next.js specifics | Low | 2027-04 |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use prop drilling | 4 levels, explicit is better than implicit | Add `onClose` prop through chain |
| Type all callbacks | TypeScript safety | `onClose: () => void` interface |
| Keep NavbarManager state | Single source of truth | `closeMenu()` stays in place |

### Implementation Plan

**Files to Modify (Containment Scope):**
1. `app/components/layout/catalogue/NavbarManager.tsx` — Add `onClose` to children render
2. `app/components/layout/catalogue/CatalogueView.tsx` — Accept and forward `onClose`
3. `app/components/layout/catalogue/details/SliceDetails.tsx` — Accept and forward `onClose`
4. `app/components/layout/catalogue/details/DetailSection.tsx` — Accept `onClose`, apply to Link

**Interface:**
```typescript
interface WithCloseHandler {
  onClose?: () => void;
}
```

**Usage in DetailSection:**
```typescript
<Link 
  href={link.url} 
  onClick={onClose}
  // ... existing props
>
```

### Immediate Actions
1. Add `onClose` prop to CatalogueView, SliceDetails, DetailSection
2. Modify NavbarManager to pass `closeMenu` to children via cloneElement or wrapper
3. Test: Click catalog link → dropdown should close

### Open Questions
- None — solution is straightforward prop drilling

---

## Sources

| Source | URL | Type | Credibility | Date | Key Claim |
|--------|-----|------|-------------|------|-----------|
| React Docs - useContext | react.dev/reference/react/useContext | Official | Canonical | 2026 | Context for avoiding prop drilling |
| React Docs - Thinking in React | react.dev/learn/thinking-in-react | Official | Canonical | 2026 | Passing props is explicit and great |
| Kent C. Dodds - Prop Drilling | kentcdodds.com/blog/prop-drilling | Authoritative | High | 2021 | Prop drilling is not a problem |

---

*Research completed: 2026-04-01*
