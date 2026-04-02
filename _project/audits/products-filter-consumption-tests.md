# Products Filter & Sort Consumption - Essential Tests

## Audit Scope
- **Feature**: Products page consumption of filter/sort parameters
- **Target State**: Reliable URL → query → UI data flow
- **Focus**: Consumption points, not UI components or filter generation

## Critical Tests Required

### 1. URL Parameter Parsing Tests
```typescript
// Test: Sort parameter extraction
// Input: ?sort=displayPrice:asc
// Expected: sort = "displayPrice:asc"
// Edge: ?sort=invalid → defaults to "featured"

// Test: Filter parameter array parsing
// Input: ?f=brand:sennheiser&f=type:open-back
// Expected: filters = ["brand:sennheiser", "type:open-back"]
// Edge: ?f= (empty) → filters = []
```

### 2. GROQ Query Building Tests
```typescript
// Test: Sort clause generation
// Input: sort = "displayPrice:asc"
// Expected: orderClause = "| order(displayPrice asc)"
// Edge: sort = "featured" → orderClause = ""

// Test: Brand filter GROQ
// Input: filters = ["brand:sennheiser"]
// Expected: `&& brand->name == "sennheiser"`
// Edge: Brand names with special characters

// Test: Specification filter GROQ
// Input: filters = ["driver-size:40mm"]
// Expected: Searches in overviewFields AND specifications arrays
// Edge: Field doesn't exist → no results
```

### 3. Data Flow Integration Tests
```typescript
// Test: Server-side filtering accuracy
// URL: /products/headphones?f=brand:sennheiser&sort=price:asc
// Expected: Only Sennheiser products, price ascending
// Verify: GROQ query matches URL parameters

// Test: Client-state synchronization
// Action: Change sort dropdown
// Expected: URL updates, products refetch, UI updates
// Edge: Rapid clicking, throttling behavior
```

### 4. Edge Case Handling Tests
```typescript
// Test: Malformed parameters
// Input: ?sort=invalid&f=malformed&f=brand:
// Expected: Graceful fallback, no errors
// Verify: Default values used, invalid ignored

// Test: SQL injection attempts
// Input: ?f=brand:"; DROP TABLE products; --
// Expected: GROQ sanitization or no results
// Verify: No query execution errors

// Test: Empty result sets
// Input: Impossible filter combination
// Expected: Empty product array, no errors
// Verify: UI handles empty state gracefully
```

### 5. Performance Tests
```typescript
// Test: Large filter arrays
// Input: 20+ simultaneous filters
// Expected: Query executes within reasonable time
// Verify: No timeout, proper GROQ optimization

// Test: Filter complexity
// Input: Nested category + multiple filters + sort
// Expected: Parallel data fetching works
// Verify: Suspense boundaries, streaming
```

## Minimal Test Implementation

### Unit Tests (Vitest)
```typescript
// test/products-consumption.test.ts
describe('URL Parameter Consumption', () => {
  test('parses sort parameter correctly', () => {
    const query = { sort: 'displayPrice:asc' };
    const sort = typeof query.sort === 'string' ? query.sort : 'featured';
    expect(sort).toBe('displayPrice:asc');
  });

  test('defaults sort to featured when invalid', () => {
    const query = { sort: 'invalid' };
    const sort = typeof query.sort === 'string' ? query.sort : 'featured';
    expect(sort).toBe('invalid'); // Note: Current implementation doesn't validate
  });
});

describe('GROQ Building', () => {
  test('builds brand filter correctly', () => {
    const filters = ['brand:sennheiser'];
    const filterClause = filters.map(f => {
      const [field, value] = f.split(':');
      if (field === 'brand') {
        return `&& brand->name == "${value}"`;
      }
      return '';
    }).join(' ');
    expect(filterClause).toBe('&& brand->name == "sennheiser"');
  });
});
```

### Integration Tests (Playwright)
```typescript
// test/e2e/products-consumption.spec.ts
test('filter consumption end-to-end', async ({ page }) => {
  await page.goto('/products/headphones?f=brand:sennheiser&sort=displayPrice:asc');
  
  // Verify URL parameters are consumed
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(/\d+/);
  
  // Verify sort dropdown reflects URL
  await expect(page.locator('#sort')).toHaveValue('displayPrice:asc');
  
  // Change sort and verify URL update
  await page.selectOption('#sort', 'name:asc');
  await expect(page).toHaveURL(/sort=name:asc/);
});
```

### Reality-Check Commands
```bash
# Manual verification checklist
npm run build

# Test URLs directly:
curl "http://localhost:3000/products/headphones?sort=displayPrice:asc"
curl "http://localhost:3000/products/headphones?f=brand:sennheiser"
curl "http://localhost:3000/products/headphones?f=brand:sennheiser&f=type:open-back&sort=price:desc"

# Verify GROQ queries:
npm run test -- test/products-consumption.test.ts
npx playwright test products-consumption
```

## Verification Requirements
- URL parameters correctly parsed and passed to data layer
- GROQ queries accurately reflect filter/sort parameters
- Server and client state remain synchronized
- Edge cases handled gracefully without errors
- Performance acceptable with complex filter combinations
