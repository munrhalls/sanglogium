# The Optimal Sequence

**Expected Value: 9.8/10**

## 1. PRD (User Intent)
Understand the invariants.

- **Invariant**: Basket total can never be negative.
- **Non-goal**: Saving basket for later.

## 2. System Contract (The Lead Domino)
Do not plan implementation details. Only map state boundaries and data structures.

- Where does the state live? (e.g., Zustand store vs. React Context)
- What is the exact TypeScript Interface? (e.g., `interface BasketItem { id: string, price: number, qty: number }`)

**Why this matters**: By locking in the data contract, everything else becomes a predictable mathematical reality.

## 3. Minimal Upfront Design 

## 4. Logic RGR (Custom Hooks / Store)
Test-drive the pure logic completely isolated from the UI.

1. Write a test: `it('calculates total with tax')`
2. Implement `useBasket()` or the Zustand reducers
3. Refactor

## 5. UI RGR (Component Mapping)
Now that the brain of the basket is flawless and tested, test-drive the UI.

1. Write a test: `it('renders correct total from store')`
2. Implement the React component
