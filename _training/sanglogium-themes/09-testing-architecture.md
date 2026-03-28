# Theme 09: Testing Architecture

## SangLogium Context
Testing is strategic—minimum needed, maximum impact. The Kent C. Dodds testing trophy guides the approach: mostly integration and E2E, with unit tests for complex logic. Playwright for E2E, Vitest for unit/integration. Every test serves a concrete end purpose.

**Critical Files:**
- `tests/e2e/` — Playwright E2E tests
- `tests/component/` — Playwright component tests
- `tests/unit/` — Vitest unit tests
- `playwright.config.ts` — E2E configuration
- `vitest.config.mts` — Unit test configuration

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at documentation. Binary pass/fail.

#### Testing Philosophy
- [ ] What is the Testing Trophy and what shape is it?
- [ ] Why more integration tests than unit tests?
- [ ] When should you write a unit test vs E2E test?
- [ ] What makes a test "valuable" vs "checking implementation details"?
- [ ] What is the difference between testing "what" vs "how"?

#### Playwright E2E
- [ ] What is Playwright vs Cypress vs Selenium?
- [ ] How do you select elements in Playwright?
- [ ] What is the difference between `page.click()` and `locator.click()`?
- [ ] How do you handle dynamic content that loads asynchronously?
- [ ] What is the `expect` API for assertions?

#### Component Testing
- [ ] What is Playwright component testing?
- [ ] How is it different from Storybook?
- [ ] How do you mount a component in isolation?
- [ ] How do you pass props to a mounted component?

#### Vitest Unit Testing
- [ ] What is Vitest vs Jest?
- [ ] How do you mock dependencies?
- [ ] What is the difference between `vi.fn()` and `vi.spyOn()`?
- [ ] How do you test async functions?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Testing Trophy & Strategy

**The Testing Trophy (Kent C. Dodds):**
```
    E2E
   _____
  /     \
 /Integration\  <- Write MOST of these
/-------------\
/    Unit      \  <- Write FEW of these (complex logic only)
---------------
Static Analysis  <- ALWAYS (TypeScript, ESLint)
```

**SangLogium Testing Distribution:**

| Type | Percentage | Use Case |
|------|-----------|----------|
| Static | Base | TypeScript, ESLint, Prettier |
| Unit | 10% | Pure functions, complex logic |
| Integration | 50% | API routes, data fetching, state management |
| E2E | 40% | Critical user flows |

**Why This Distribution?**
- Unit tests: Fragile, test implementation
- Integration tests: Test behavior, more stable
- E2E tests: Test real user value, catch real bugs

---

### Module 2: Playwright E2E Testing

**Test Structure:**
```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays hero section', async ({ page }) => {
    // Prefer user-facing selectors
    const hero = page.getByRole('heading', { name: /sang.?logium/i });
    await expect(hero).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    // Click with auto-waiting
    await page.getByRole('link', { name: 'Shop' }).click();
    
    // Assert URL changed
    await expect(page).toHaveURL(/\/shop/);
  });

  test('product search', async ({ page }) => {
    // Fill and submit
    await page.getByPlaceholder('Search').fill('headphones');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Wait for results
    await expect(page.getByText(/found.*results/)).toBeVisible();
  });
});
```

**Selector Best Practices:**
```typescript
// BEST: Role + accessible name
page.getByRole('button', { name: 'Add to Cart' });

// GOOD: Test ID (if no accessible alternative)
page.getByTestId('product-card-123');

// AVOID: CSS selectors (brittle)
page.locator('.product-card button');

// AVOID: XPath (hard to read)
page.locator('//div[@class="product"]');
```

**Auto-Waiting:**
```typescript
// Playwright automatically waits for:
// - Element to be visible
// - Element to be enabled
// - Action to complete

// This retries automatically until timeout
await page.getByRole('button').click();

// Custom wait for specific condition
await expect(page.getByText('Success')).toBeVisible({ timeout: 5000 });
```

---

### Module 3: Component Testing

**Playwright Component Tests:**
```typescript
// tests/component/ProductCard.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { ProductCard } from '@/app/components/features/products/ProductCard';

test.describe('ProductCard', () => {
  const mockProduct = {
    _id: '123',
    name: 'HD 660S',
    price: 499,
    image: { asset: { url: '/test.jpg' } },
  };

  test('renders product information', async ({ mount }) => {
    const component = await mount(<ProductCard product={mockProduct} />);
    
    await expect(component.getByText('HD 660S')).toBeVisible();
    await expect(component.getByText('$499')).toBeVisible();
  });

  test('add to cart button works', async ({ mount }) => {
    const onAddToCart = jest.fn();
    const component = await mount(
      <ProductCard product={mockProduct} onAddToCart={onAddToCart} />
    );
    
    await component.getByRole('button', { name: 'Add to Cart' }).click();
    expect(onAddToCart).toHaveBeenCalledWith('123');
  });
});
```

**When to Use Component Tests:**
- Complex UI interactions
- Reusable components with many states
- Visual regression testing
- Faster than E2E, more realistic than unit

---

### Module 4: Integration Testing

**API Route Testing:**
```typescript
// tests/integration/checkout-api.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/checkout/route';

vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: vi.fn(),
}));

describe('Checkout API', () => {
  it('creates order and Stripe session', async () => {
    const request = new Request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: '123', quantity: 1 }],
        shippingAddress: { /* ... */ },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
  });

  it('returns 400 for invalid cart', async () => {
    const request = new Request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**Unit Tests for Pure Functions:**
```typescript
// tests/unit/vfs-utils.test.ts
import { describe, it, expect } from 'vitest';
import { unrollDescendantKeys } from '@/data/catalogue';

describe('unrollDescendantKeys', () => {
  it('returns all descendants including self', () => {
    const mockData = {
      slotMetadataMap: {
        'root': { children: ['child1', 'child2'] },
        'child1': { children: ['grandchild'] },
        'child2': { children: [] },
        'grandchild': { children: [] },
      },
    };

    const result = unrollDescendantKeys('root', mockData);
    expect(result).toContain('root');
    expect(result).toContain('child1');
    expect(result).toContain('child2');
    expect(result).toContain('grandchild');
  });

  it('handles cycles gracefully', () => {
    // Test cycle prevention
  });
});
```

---

## Layer 2: Integration Examination

### Integration Challenge 1: E2E Checkout Flow

**Scenario:** Write an E2E test for complete checkout

**Requirements:**
1. Navigate to product page
2. Add product to cart
3. Proceed to checkout
4. Fill shipping form
5. Complete Stripe payment (test mode)
6. Verify order confirmation

**Test Steps:**
```typescript
test('complete checkout flow', async ({ page }) => {
  // 1. Visit product
  await page.goto('/products/headphones/hd660s');
  
  // 2. Add to cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  
  // 3. Go to checkout
  await page.getByRole('link', { name: 'Checkout' }).click();
  
  // 4. Fill shipping
  await page.getByLabel('Name').fill('Test User');
  await page.getByLabel('Address').fill('123 Test St');
  // ... more fields
  
  // 5. Continue to payment
  await page.getByRole('button', { name: 'Continue' }).click();
  
  // 6. Stripe test card
  await page.frameLocator('iframe').getByLabel('Card number').fill('4242424242424242');
  // ... expiry, cvc
  
  // 7. Complete payment
  await page.getByRole('button', { name: 'Pay' }).click();
  
  // 8. Verify confirmation
  await expect(page.getByText('Order Confirmed')).toBeVisible();
  await expect(page.getByText(/Order #/)).toBeVisible();
});
```

**Constraints:**
- Use test Stripe credentials
- Clean up test data after
- Don't depend on specific product IDs (use fixtures)

---

### Integration Challenge 2: VFS Integration Test

**Scenario:** Test VFS + GROQ integration

**Requirements:**
1. Set up test catalogue data
2. Test category navigation
3. Verify correct products displayed
4. Test edge cases (empty categories, deep nesting)

**Test Structure:**
```typescript
describe('VFS Product Discovery', () => {
  beforeEach(async () => {
    // Seed test data or mock VFS
  });

  it('shows products from category and subcategories', async () => {
    // Navigate to /products/headphones
    // Should show headphones + open-back + closed-back products
  });

  it('handles deep category paths', async () => {
    // Navigate to /products/headphones/open-back
    // Should show only open-back products
  });

  it('shows empty state for category with no products', async () => {
    // Navigate to category with 0 products
    // Should show "No products found" message
  });
});
```

---

## Layer 3: Systems Examination

### Systems Challenge: Testing Strategy for New Feature

**Scenario:** You're adding a "wishlist" feature

**Features:**
1. Add/remove products from wishlist
2. View wishlist page
3. Move from wishlist to cart
4. Persist across sessions (for logged-in users)
5. Store in localStorage (for guests)

**Design Test Strategy:**

1. **What to test with E2E:**
   - Complete wishlist flow (add → view → move to cart)
   - Persistence after page refresh

2. **What to test with integration:**
   - API endpoints (add, remove, list)
   - Database operations
   - LocalStorage sync

3. **What to test with unit:**
   - Wishlist state logic
   - Price calculation for moved items

4. **What NOT to test:**
   - Implementation details (specific hooks used)
   - Third-party library internals

**Deliverable:**
- Test file structure
- Key test cases for each level
- Mock strategy for external dependencies

---

## Stress Test Scenarios

### Scenario 1: Flaky Test Investigation

**Given:**
```typescript
test('product loads', async ({ page }) => {
  await page.goto('/products/headphones');
  await page.getByText('Headphones').click();
  expect(await page.getByRole('heading').textContent()).toBe('Headphones');
});
```

**Problem:** Test passes locally, fails in CI intermittently

**Investigation:**
1. Check for race conditions (no await on click)
2. Check for timing issues (element might not be ready)
3. Check for test isolation (state leaking between tests)
4. Check for environment differences (viewport, network)

**Fix:**
```typescript
test('product loads', async ({ page }) => {
  await page.goto('/products/headphones');
  await page.getByText('Headphones').click();
  // Use Playwright's auto-waiting assertion
  await expect(page.getByRole('heading', { name: 'Headphones' })).toBeVisible();
});
```

---

### Scenario 2: Test Maintenance Burden

**Problem:**
- 200 E2E tests take 45 minutes to run
- 30% failure rate (mostly false positives)
- Team avoids running tests

**Analysis:**
1. Tests are too granular (testing implementation)
2. No test isolation (shared state)
3. Tests depend on external services
4. Missing retry logic for flaky operations

**Solution:**
1. Remove implementation-detail tests
2. Add proper setup/teardown
3. Mock external APIs
4. Use Playwright's retry configuration
5. Parallelize test execution

---

## Quick Reference: Testing Checklist

| Concern | Approach | Tool |
|---------|----------|------|
| Critical user flow | E2E | Playwright |
| Component states | Component test | Playwright CT |
| API behavior | Integration | Vitest + supertest |
| Pure functions | Unit | Vitest |
| Visual regression | Snapshot | Playwright |
| Accessibility | Automated | @axe-core/playwright |

---

## Completion Checklist

- [ ] Can explain Testing Trophy philosophy
- [ ] Can write Playwright E2E tests with proper selectors
- [ ] Can implement component tests
- [ ] Can decide what to test at each level
- [ ] Can debug flaky tests
- [ ] Can mock dependencies effectively
- [ ] Can balance test coverage vs maintenance

---

*Next: Theme 10 — Drawer State Management*
