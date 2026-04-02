# Products Filtering & Sorting - Test Requirements

## Research Scope Contract
- **Topic**: Essential testing for products page filtering and sorting
- **First Principles**: URL state sync, server-client data consistency, filter validation
- **Fundamentals**: GROQ query accuracy, nuqs state management, UI feedback
- **Scope Boundary**: Only filtering/sorting - no pagination, no search, no checkout
- **Target Audience**: Development team ensuring feature reliability
- **Decay Risk**: Medium - depends on GROQ schema and nuqs API

## Critical Tests Required

### 1. URL State Persistence Tests
```typescript
// Test: Direct URL navigation loads correct filtered products
// URL: /products/headphones?f=brand:sennheiser&sort=displayPrice:asc
// Expected: Products filtered by Sennheiser, sorted by price ascending
```

### 2. Server-Side Filtering Tests
```typescript
// Test: GROQ filter accuracy
// Filter: brand:sennheiser
// Expected: Only products with brand->name == "sennheiser"
// Edge: Case sensitivity, special characters in brand names
```

### 3. Sort Functionality Tests
```typescript
// Test: All sort options work correctly
// Sorts: featured, displayPrice:asc, displayPrice:desc, name:asc, name:desc
// Expected: Correct ordering, stable sort for equal values
// Edge: Products with missing/zero price, empty names
```

### 4. Price Range Tests
```typescript
// Test: Price range filtering
// Input: min:100, max:500
// Expected: Products with 100 ≤ displayPrice ≤ 500
// Edge: min > max validation, boundary values
```

### 5. Stock Minimum Tests
```typescript
// Test: Stock availability filtering
// Input: stockMin:5
// Expected: Products with stock ≥ 5
// Edge: Zero/negative values, missing stock field
```

### 6. Filter Combination Tests
```typescript
// Test: Multiple filters work together
// Input: brand:sennheiser + priceRange:min:100 + type:open-back
// Expected: Products matching ALL conditions (AND logic)
// Edge: Conflicting filters, empty result set
```

### 7. Client-Side State Tests
```typescript
// Test: nuqs shallow routing
// Action: Toggle filter checkbox
// Expected: URL updates instantly, no full page reload
// Edge: Rapid clicking, browser back/forward
```

### 8. Filter Clear Tests
```typescript
// Test: Individual and clear all functionality
// Action: Remove single filter vs clear all
// Expected: Correct URL and product updates
// Edge: Clear when no filters active
```

### 9. Mobile Drawer Tests
```typescript
// Test: Mobile filter drawer
// Action: Open drawer, apply filters, close
// Expected: Filters applied, drawer state managed
// Edge: Orientation change, drawer state persistence
```

### 10. Edge Case Tests
```typescript
// Test: Invalid/malicious URL parameters
// Input: ?f=invalid:format&sort=unknown:direction
// Expected: Graceful fallback, no errors
// Edge: XSS attempts, SQL injection via GROQ
```

## Minimal Test Implementation Strategy

### Unit Tests (Vitest)
1. **useFilterNuqs hook** - State management logic
2. **Filter parsing** - URL string to FilterState
3. **Price validation** - min < max logic
4. **GROQ building** - Filter to query conversion

### Integration Tests (Playwright)
1. **End-to-end filter flow** - URL → UI → Products
2. **Sort persistence** - URL sort parameter
3. **Mobile responsiveness** - Drawer functionality
4. **Error boundaries** - Invalid parameters

### Reality-Check Commands
```bash
# Manual verification checklist
npm run build
npx playwright test products-filtering
# Test URLs:
# /products/headphones
# /products/headphones?f=brand:sennheiser
# /products/headphones?sort=displayPrice:asc
# /products/headphones?f=brand:sennheiser&f=type:open-back&sort=price:desc
```

## Verification Requirements
- All filter combinations produce valid GROQ queries
- URL state remains synchronized with UI state
- Server and client filtering produce identical results
- No memory leaks in filter state management
- Mobile/desktop parity in functionality
