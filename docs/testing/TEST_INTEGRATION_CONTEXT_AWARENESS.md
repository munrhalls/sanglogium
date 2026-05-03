# Context-Aware Integration Testing

## Rule
**Integration tests for context-aware components MUST test each rendering context separately. Never assume single rendering mode.**

## What is Context-Aware Component
Component that renders differently based on:
- Page type (product page vs basket page)
- State (in basket vs not in basket)
- Props (isBasketPage, showRemove, etc.)
- User role (admin vs customer)
- Device (mobile vs desktop)

## Why Context Matters
Context-aware components have multiple valid rendering states. Testing only one state creates false confidence and misses critical edge cases.

## How to Identify Context Dependencies

### Step 1: Check HTML Structure Documentation
Look for context-specific HTML structures:
```html
<!-- Product page: product NOT in basket -->
<button element="add-to-basket">Add</button>

<!-- Product page: product IN basket -->
<button element="decrement">-</button>
<span element="quantity">1</span>
<button element="increment">+</button>

<!-- Basket page: product IN basket -->
<button element="decrement">-</button>
<span element="quantity">1</span>
<button element="increment">+</button>
<button element="remove">X</button>
```

**WHY:** HTML Structure documentation defines expected rendering per context. If you see different HTML for different contexts, component is context-aware.

### Step 2: Check PRD for Context-Specific Behavior
Look for behavior that varies by context:
- "When I decrement to zero, item removes" (product page)
- "Decrement button capped at 1, delete via remove button" (basket page)

**WHY:** PRD defines user expectations per context. Different behaviors = different contexts.

### Step 3: Check Component Props Interface
Look for props that control rendering:
```typescript
interface BasketControlsProps {
  productId: string;
  isBasketPage?: boolean;  // Context flag
  showRemove?: boolean;    // Context flag
}
```

**WHY:** Props that control rendering indicate context-aware component.

## How to Test Context-Aware Components

### Rule: Test Each Context Separately

```typescript
// ❌ WRONG - Context-ignorant test
describe('BasketControls', () => {
  it('renders add, increment, decrement, remove buttons', () => {
    // Assumes all buttons render together - WRONG
    render(<BasketControls productId="p1" />)
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
    expect(screen.getByTestId('increment-button')).toBeInTheDocument()
    expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
    expect(screen.getByTestId('remove-button')).toBeInTheDocument()
  })
})

// ✅ CORRECT - Context-aware test
describe('BasketControls', () => {
  describe('on product page', () => {
    it('renders add button when product not in basket', () => {
      useBasketStore.setState({ items: [] })
      render(<BasketControls productId="p1" isBasketPage={false} />)
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
    })

    it('renders increment/decrement when product in basket', () => {
      useBasketStore.setState({ items: [{ productId: 'p1', quantity: 1, ... }] })
      render(<BasketControls productId="p1" isBasketPage={false} />)
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument() // WHY: Remove button only on basket page
    })
  })

  describe('on basket page', () => {
    it('renders increment/decrement/remove when product in basket', () => {
      useBasketStore.setState({ items: [{ productId: 'p1', quantity: 1, ... }] })
      render(<BasketControls productId="p1" isBasketPage={true} />)
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
      expect(screen.getByTestId('remove-button')).toBeInTheDocument() // WHY: Remove button only on basket page
    })
  })
})
```

## Why Separate Context Tests

### 1. Prevents False Positives
Testing one context and assuming it applies to all misses critical bugs:
- Remove button renders on product page (shouldn't)
- Decrement goes below 1 on basket page (shouldn't)
- Add button renders when product in basket (shouldn't)

### 2. Aligns with Documentation
HTML Structure and PRD define context-specific behavior. Tests must match documentation.

### 3. Clearer Test Intent
Each test clearly states which context it tests. Future developers understand component behavior.

### 4. Easier Debugging
When test fails, you know exactly which context is broken.

## Architectural Decision: Single vs Separate Components

### Single Component with Context Props
```typescript
interface Props {
  productId: string;
  isBasketPage: boolean; // Context flag
}
```

**Use when:** Contexts share 80%+ logic, only rendering differs
**Test strategy:** Test each context with different prop values

### Separate Components per Context
```typescript
// ProductPageBasketControls.tsx
// BasketPageBasketControls.tsx
```

**Use when:** Contexts have significantly different behaviors (not just UI)
**Test strategy:** Separate test files per component

**WHY:** Different behaviors (decrement to 0 vs capped at 1) indicate separate components needed.

## Checklist Before Writing Integration Test

- [ ] Checked HTML Structure documentation for context-specific rendering
- [ ] Checked PRD for context-specific behavior
- [ ] Identified all rendering contexts (page type, state, props)
- [ ] Decided on component architecture (single vs separate)
- [ ] Test file structure matches context structure (nested describes)
- [ ] Each test explicitly states which context it tests
- [ ] No test assumes single rendering mode

## Failure Mode: Context-Ignorant Test

**Symptoms:**
- Test assumes all UI elements render together
- No nested describe blocks for contexts
- No context flags in props
- Test passes but component wrong in production

**Example of Failure:**
basketControls.spec.tsx assumed all 4 buttons render together, but HTML Structure defined:
- Product page: add OR increment/decrement (no remove)
- Basket page: increment/decrement/remove

**Impact:** Component implemented incorrectly, test gives false confidence.

## Professional Practice

**Before writing integration test:**
1. Read HTML Structure documentation
2. Read PRD for context-specific behavior
3. Identify all rendering contexts
4. Structure test file with nested describes per context
5. Write tests that explicitly state context

**After writing integration test:**
1. Verify each test explicitly states which context
2. Verify no test assumes single rendering mode
3. Verify test structure matches documentation structure
