# failures: cloneElement Anti-Pattern

**Date:** 2026-04-01
**Source:** Debug - NavbarManager SSR Error
**Severity:** High
**Frequency:** Systemic (will recur without vigilance)
**Status:** Active

---

## The Problem

`childrenWithOnClose` variable referenced but never defined, causing ReferenceError during SSR. The code was attempting to use React.cloneElement to inject props into children but the implementation was incomplete.

## Root Cause

cloneElement is an anti-pattern for prop injection:
1. Breaks component contracts - children don't declare they receive the prop
2. Type safety issues - props injected at runtime, not compile time
3. SSR complications - dynamic prop injection can break prerendering
4. Debugging difficulty - props appear from nowhere

## The Fix

**Before (broken cloneElement):**
```tsx
// Never defined!
const childrenWithOnClose = React.Children.map(children, (child) => {
  if (React.isValidElement(child)) {
    return React.cloneElement(child, { onClose: closeMenu } as any);
  }
  return child;
});

{childrenWithOnClose?.map((child: React.ReactNode, idx: number) => (
```

**After (React Context):**
```tsx
// Context provides clean prop injection
const NavContext = createContext<{ closeMenu: () => void }>({ closeMenu: () => {} });

export const useNavContext = () => React.useContext(NavContext);

// Provider wraps children
<NavContext.Provider value={{ closeMenu }}>
  {children?.map((child: React.ReactNode, idx: number) => (

// Consumer explicitly declares dependency
const { closeMenu } = useNavContext();
```

## Prevention

**Rule for this codebase:** Never use cloneElement for prop injection. Use React Context for cross-component prop sharing.

**Code review checklist:**
- [ ] No cloneElement usage for prop injection
- [ ] Props explicitly declared in component interfaces
- [ ] Context used for deep prop sharing (3+ levels)
- [ ] "use client" directive on context consumers

**Verification command:**
```bash
# Check for cloneElement usage
grep -r "cloneElement" app/components/
```

## Applicability

**When to apply this lesson:**
- Sharing props across 3+ component levels
- Need to avoid prop drilling
- Server-side rendering considerations

**Keywords for retrieval:**
- "cloneElement"
- "context"
- "prop-drilling"
- "ssr"
- "prerender"

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] INDEX.md — Keywords added
- [ ] `.windsurfrules` — Consider adding "No cloneElement" constraint

**Date integrated:** 2026-04-01
