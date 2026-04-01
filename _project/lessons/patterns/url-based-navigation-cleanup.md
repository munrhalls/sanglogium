# Pattern: URL-Based Navigation State Cleanup

**Date:** 2026-04-01  
**Source:** Debug session — catalogue dropdown not closing on navigation  
**Severity:** Medium  
**Frequency:** Recurring (any dropdown/modal with local state)

## The Problem

Client components using local React state for visibility (dropdowns, modals, panels) don't automatically respond to navigation changes. When a user clicks a link inside the component, the component stays open on the new page.

## Root Cause

Local state (`useState`) is decoupled from the URL. Navigation happens via Next.js router, but the component doesn't subscribe to route changes.

## The Fix

Use `usePathname()` from `next/navigation` with `useEffect` to reset visibility state on any navigation:

```typescript
"use client";
import { usePathname } from "next/navigation";

export default function DropdownComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ... rest of component
}
```

## When to Apply

| Scenario | Solution | Why |
|----------|----------|-----|
| Dropdown closes on navigation | `usePathname` + `useEffect` | Zero prop drilling |
| Dropdown needs back button support | NUQS URL state | History integration |
| Modal/dialog close on navigation | `usePathname` + `useEffect` | Same pattern |
| UI state should persist across nav | Keep local state only | Don't reset |

## Applicability

**Use this pattern when:**
- Component visibility should reset on page change
- No need for back button to restore previous state
- Zero coupling to child components required

**Don't use when:**
- State should persist across navigation (e.g., filter panels)
- Back button should restore previous UI state (use NUQS)

## Keywords
- "navigation", "dropdown", "close", "modal", "usePathname", "useEffect"

## Related
- NUQS pattern for URL-driven state
- Component Archaeology Principle (debug workflow)
