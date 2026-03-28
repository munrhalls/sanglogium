# Theme 02: TypeScript with Sanity Typegen

## SangLogium Context
Type safety is non-negotiable. Sanity Typegen auto-generates types from schemas. These types flow through GROQ queries to React components. No manual type definitions that could conflict.

**Critical Files:**
- `sanity.types.ts` — Auto-generated from Sanity schemas
- `sanity/schemaTypes/productType.ts` — Product schema (source of truth)
- `sanity/schemaTypes/orderType.ts` — Order schema
- `sanity/schemaTypes/catalogueItemType.ts` — VFS category schema
- `app/components/features/products/ProductsGrid.tsx` — Consumes typed data

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

#### Type Generation Pipeline
- [ ] What command generates types from Sanity schemas?
- [ ] Where are generated types stored?
- [ ] What happens if you manually edit `sanity.types.ts`?
- [ ] How do you regenerate types after schema changes?
- [ ] What is the relationship between `schema.json` and `sanity.types.ts`?

#### GROQ + Type Safety
- [ ] How do GROQ queries know their return types?
- [ ] What happens if a GROQ query returns fields not in the type?
- [ ] How do you handle partial selections in GROQ with TypeScript?
- [ ] What is the `sanityFetch` function's generic parameter for?

#### Type Constraints
- [ ] What does `asserts` do in a TypeScript function?
- [ ] How would you type the `validateCatalogueIndex` function?
- [ ] When should you use `unknown` vs `any`?
- [ ] How do you type a function that narrows a union type?

#### SangLogium-Specific
- [ ] What type represents a product in the codebase?
- [ ] How are catalogue items typed?
- [ ] What type enforces the order status enum?
- [ ] How does the `CatalogueTreeNode` interface relate to Sanity types?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Sanity Typegen Fundamentals

**First Principles:**
- TypeScript types should derive from a single source of truth
- Manual types drift from actual data structures over time
- Generated types enforce CMS contract at compile time

**The Typegen Pipeline:**
```bash
# Step 1: Extract schema to JSON
sanity schema extract

# Step 2: Generate TypeScript types
sanity typegen generate
```

**Key Outputs:**
- `schema.json` — Sanity schema definition
- `sanity.types.ts` — TypeScript interfaces for all document types
- Type-safe GROQ query results

**SangLogium Pattern:**
```tsx
import type { Product, Order, CatalogueItem } from '@/sanity.types';

// Types match Sanity schema exactly
function processProduct(product: Product) {
  // TypeScript knows all fields and their types
  const { name, price, specifications } = product;
}
```

---

### Module 2: Type Safety Patterns

**1. Strict Type Contracts:**
```tsx
// Generated types are source of truth
// NEVER manually define conflicting types
export interface Product {
  // This is auto-generated from Sanity schema
  // Do not modify manually
}
```

**2. GROQ Type Safety:**
```tsx
import { sanityFetch } from '@/sanity/lib/client';
import type { Product } from '@/sanity.types';

// Generic ensures return type matches query
const products = await sanityFetch<Product[]>({
  query: `*[_type == "product"]`
});
```

**3. Custom Type Helpers:**
```tsx
// For client-side state that extends Sanity types
type CartItem = {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
};

// Derived types from generated types
type ProductSummary = Pick<Product, '_id' | 'name' | 'price' | 'image'>;
```

---

### Module 3: Advanced Type Patterns

**Discriminated Unions for State:**
```tsx
// FSM states with proper typing
type OrderStatus = 
  | { status: 'pending_payment' }
  | { status: 'processing'; lockedBy: string }
  | { status: 'shipped'; trackingNumber: string }
  | { status: 'delivered'; deliveredAt: Date };

// Type narrowing works correctly
function handleOrder(order: OrderStatus) {
  if (order.status === 'shipped') {
    // TypeScript knows order.trackingNumber exists
    console.log(order.trackingNumber);
  }
}
```

**Assertion Functions:**
```tsx
// Runtime validation with type narrowing
export function validateCatalogueIndex(
  data: unknown
): asserts data is CatalogueIndexData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid catalogue data');
  }
  // ... validation logic
}

// Usage
const data = fetchCatalogueData();
validateCatalogueIndex(data); // Throws if invalid
// TypeScript now knows data is CatalogueIndexData
data.tree.forEach(node => ...);
```

**Conditional Types:**
```tsx
// Extract field types from Sanity types
type FieldType<T, K extends keyof T> = T[K];

// Make certain fields required
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

---

### Module 4: Common Type Errors & Fixes

**Error 1: Type 'X' is missing properties from type 'Y'**
- Cause: GROQ query returns partial fields
- Fix: Use `Pick<Product, 'field1' | 'field2'>` or `Partial<Product>`

**Error 2: Cannot assign to read-only property**
- Cause: Generated types often mark fields as read-only
- Fix: Create mutable copy: `const mutable = { ...immutable }`

**Error 3: Type 'never' has no call signatures**
- Cause: Exhaustive switch not actually exhaustive
- Fix: Add `default` case with runtime check

---

## Layer 2: Integration Examination

### Integration Challenge 1: Type-Safe GROQ

**Scenario:** Build a type-safe product fetch function

**Requirements:**
1. Create a function `getProductsByCategory` with typed parameters
2. GROQ query must return typed results
3. Handle partial selections (not all product fields)
4. Return type must reflect what GROQ actually returns

**Constraints:**
- Use Sanity-generated types as base
- Create appropriate derived types for partial data
- Function must be fully typed end-to-end

**Verification:**
- [ ] TypeScript shows no errors
- [ ] Return type matches actual query results
- [ ] Partial selections are properly typed
- [ ] Consumer code gets correct autocomplete

---

### Integration Challenge 2: Order Status FSM Types

**Scenario:** Type the order status FSM completely

**Requirements:**
1. Define all possible order statuses as discriminated union
2. Each status should have appropriate metadata fields
3. Create type guards for status checking
4. Ensure impossible states are unrepresentable

**Statuses to Model:**
- `pending_payment` → no extra data
- `paid_confirmed` → paymentIntentId, paidAt
- `to_pack` → queue position
- `packing_locked` → lockedBy, lockedAt
- `shipped_in_transit` → trackingNumber, carrier
- `delivered_success` → deliveredAt
- All HOLD states → reason, notes
- All CANCELLED states → cancelledAt, reason

**Success Criteria:**
- [ ] Discriminated union prevents invalid field access
- [ ] Type guards narrow correctly
- [ ] Impossible combinations cannot be constructed
- [ ] Transition functions enforce valid state changes

---

## Layer 3: Systems Examination

### Systems Challenge: Type Architecture Design

**Scenario:** You are designing the type architecture for a new "Inventory" system

**Requirements:**
1. Inventory records in Sanity (stock levels, reservations)
2. Real-time-ish updates (but not truly real-time)
3. Reservation system for checkout (prevent overselling)
4. Integration with Order FSM

**Design Decisions:**
1. How do Sanity types relate to runtime inventory state?
2. How do you type the reservation/checkout flow?
3. What happens when types drift between Sanity and app?
4. How do you handle temporary state (reservations) vs persistent?

**Deliverables:**
- Type definitions for all entities
- Flow types for checkout process
- Validation functions with proper typing
- Documentation of type safety guarantees

---

## Stress Test Scenarios

### Scenario 1: Schema Migration

**Situation:** Product schema in Sanity is changing:
- `price` → `basePrice` + `salePrice`
- Adding `variants` array with nested pricing
- Removing `compareAtPrice` (moving to variants)

**Task:**
1. Update types without breaking existing code
2. Create migration types for gradual transition
3. Ensure type safety during deployment window
4. Handle old data that still has old schema

**Questions:**
1. How do you maintain backward compatibility?
2. What TypeScript features help with gradual migration?
3. How do you find all usages of changed fields?

---

### Scenario 2: Runtime Type Safety

**Given:**
```tsx
// Catalogue index is loaded from JSON at build time
import catalogueIndex from './catalogue-index.json';

// Type is asserted but not validated
const data = catalogueIndex as CatalogueIndexData;
```

**Problem:** JSON might be malformed, causing runtime errors

**Fix Required:**
- Implement runtime validation that matches TypeScript types
- Use assertion function pattern
- Handle validation failures gracefully

---

## Quick Reference: Type Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| `Pick<T, K>` | Partial data | Product cards showing subset |
| `Omit<T, K>` | Remove fields | API responses without internals |
| `Partial<T>` | Optional updates | PATCH request bodies |
| `Required<T>` | Ensure presence | After validation |
| `ReturnType<T>` | Function outputs | API response typing |
| `Parameters<T>` | Function inputs | Handler typing |

---

## Completion Checklist

- [ ] Can regenerate types from Sanity schema
- [ ] Can create derived types from generated types
- [ ] Can debug type mismatches between GROQ and TypeScript
- [ ] Can implement discriminated unions for state machines
- [ ] Can write assertion functions for runtime validation
- [ ] Can handle schema migrations safely

---

*Next: Theme 03 — Sanity CMS & GROQ*
