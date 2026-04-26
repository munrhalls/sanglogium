
# Red phase tests plan - verifying what should be against expectations

# Hydration & Persistence (The Guards)

[] Test: The store state does not write to or read from localStorage until the hasHydrated flag is set to true. (Prevents React 18 / Next 15 hydration mismatches).

[] Test: Updating the basket store successfully pushes the exact {productId, quantity} structure to localStorage.

[] Test: Opening a page with an empty basket but populated localStorage successfully initializes the store with the stored items.

# Core State Transitions (The API)

[] Test: Adding a new productId creates a store entry with a quantity of 1.

[] Test: Deleting a productId removes it entirely from the store array.

# Mathematical Boundaries (The Limits)

[] Test: Decrementing a product's quantity strictly stops at 0 and does not drop into negative numbers.

[] Test: Incrementing a product's quantity strictly stops at the provided stock limit parameter.

# UI Rendering Contracts (The View)

[] Test: The cart button component renders the total sum of all item quantities, not just the length of the unique items array.

[] Test: The decrement/increment UI controls do not render into the DOM if the target product is not present in the basket.

Why they are required: These tests enforce the absolute truth of the system. They test the side-effects (localStorage), the mathematical constraints (0 to stock max), and the exact API contracts. If these tests pass, feature works as designed.