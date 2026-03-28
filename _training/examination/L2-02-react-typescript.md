# Layer 2: React + TypeScript Integration

## Prerequisites
- [ ] L1-02 TypeScript
- [ ] L1-03 React 18

## Section A: Component Typing Patterns (25 min)

### A1: Generic Components
Create a typed generic List component:
```tsx
// Must support:
// - Generic item type
// - Custom render prop
// - Key extraction function
// - Optional empty state

function List<T>(props: _______): JSX.Element {
  // Implementation:
}
```

### A2: Polymorphic Components
Create a polymorphic Button that renders as different elements:
```tsx
// Must support:
// - as="button" | "a" | Component
// - Proper ref forwarding
// - Type-safe props based on "as"

type ButtonProps<T extends ElementType> = _______
```

### A3: Context with Type Safety
Create a typed ThemeContext:
```tsx
type Theme = 'light' | 'dark';

// Must have:
// - Current theme value
// - Toggle function
// - Proper default handling
// - useTheme hook with runtime check
```

## Section B: Hook Typing (20 min)

Implement these typed hooks without reference:

```typescript
// useAsync - handles async operations with loading/error states
function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>
): _______

// useLocalStorage - persists state to localStorage
function useLocalStorage<T>(
  key: string,
  initialValue: T
): _______

// useDebounce - delays value updates
function useDebounce<T>(value: T, delay: number): _______
```

## Section C: Your Codebase Analysis (25 min)

### C1: Zustand + TypeScript
Examine `store/store.ts`:
- How are actions typed?
- How is middleware typed?
- What is the `persist` type signature?

### C2: Form Types
Examine a form in `app/(store)/`:
- Zod schema type inference
- React Hook Form integration types
- Error message typing

### C3: API Route Types
Examine `app/api/`:
- Request/response types
- Error handling types
- Status code typing

## Section D: Common Errors (20 min)

| Error | Root Cause | Fix |
|-------|------------|-----|
| "JSX element type X does not have any construct or call signatures" | | |
| "Property X does not exist on type Y" | | |
| "Cannot find name JSX" | | |
| "RefObject<T> is not assignable to MutableRefObject<T>" | | |

## Open-Book Verification (10 min)

### Corrections Table
| Pattern | My Answer | Correct | Gap |
|---------|-----------|---------|-----|
| Generic component | | | |
| Polymorphic | | | |
| Context | | | |
| Hooks | | | |

## Attestation
**I can:**
- [ ] Type generic components correctly
- [ ] Implement polymorphic patterns
- [ ] Debug common TS/React errors
- [ ] Navigate codebase type patterns

**Signed:** _________________ **Date:** _________

## Cross-Reference
**Prerequisites:** L1 TypeScript, L1 React
**Dependents:** Form systems, API integration
**Sources:** react.dev, totaltypescript.com
