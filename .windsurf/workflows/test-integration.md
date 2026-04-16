---
description: API boundary and component interaction testing with real infrastructure
---

# /test-integration Command Protocol

**System Directive:** You are a deterministic execution engine for integration testing. Test real interactions between components, real database calls, real API endpoints — mock ONLY external APIs.

**Input:** API endpoint, data flow requirement, or component interaction boundary
**Output:** `tests/integration/[feature]/[flow].test.ts` verifying real integration behavior

---

## Pre-Flight Containment Checklist

### 1. PRD LINKAGE (Non-negotiable)
- [ ] API contract or data flow requirement documented
- [ ] Expected request/response defined
- [ ] Side effects explicitly listed

### 2. Infrastructure Verification
```bash
# BEFORE writing test, verify test infrastructure
# Test database running?
redis-cli -n 15 ping  # Should return PONG
# Test Sanity dataset accessible?
curl -s $SANITY_API_URL/data/query/test  # Should return 200
```

### 3. Scope Containment Contract
**IN SCOPE (test verifies ONLY these):**
- Request → Response transformation
- Database state changes
- Side effect execution
- API contract compliance

**OUT OF SCOPE (test NEVER touches these):**
- Implementation details of internal services
- UI rendering
- User interactions
- Business logic internals

### 4. Mock Policy (External APIs ONLY)
**APPROVED for mocking:**
- [ ] Stripe API (payments)
- [ ] External email services
- [ ] Third-party auth providers
- [ ] External webhooks

**FORBIDDEN to mock:**
- [ ] Database (use test instance)
- [ ] Internal APIs
- [ ] Business logic
- [ ] Data layer

### 5. Black Box Assertion Selection
**VERIFY (observable outcomes only):**
- Response status code
- Response body content
- Database state after call
- Side effects triggered

**NEVER VERIFY (implementation details):**
- Internal function calls
- Variable values
- Service method execution
- Code path taken

---

## Phase 1: Test Specification (10 min)

### Step 1: Define Contract
```typescript
// Request contract
interface Request {
  // Document expected request shape
}

// Response contract
interface Response {
  // Document expected response shape
}

// Side effects to verify
const SIDE_EFFECTS = [
  'Database record created',
  'Cache invalidated',
  'Event dispatched'
];
```

### Step 2: Draft Test Structure
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { [apiClient] } from '@/lib/[feature]/client';

describe('PRD: [Criterion Reference]', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it('[Flow]: [expected behavior]', async () => {
    // Test implementation
  });
});
```

---

## Phase 2: Implementation (20 min)

### Constraint Rules (Strictly Enforced)
- **USE** real database (test instance, never mock)
- **USE** real API endpoints
- **MOCK** external APIs only (Stripe, etc.)
- **VERIFY** via public interfaces (query after, not internal state)
- **MAX** 100 lines per test file
- **MAX** 3 test cases per integration flow

### Test Template
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { [apiClient] } from '@/lib/[feature]/client';
import { [dbQuery] } from '@/lib/db/queries';

describe('PRD: [API Contract Description]', () => {
  let testData: any;

  beforeAll(async () => {
    // Setup: Create test data in real database
    testData = await setupTestData();
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await cleanupTestData(testData);
  });

  it('[Scenario]: [request] → [expected response]', async () => {
    // Act: Call real API
    const response = await [apiClient].[method](testData.request);
    
    // Assert: Response contract
    expect(response.status).toBe(expectedStatus);
    expect(response.data).toMatchObject(expectedShape);
    
    // Verify side effect via query (not internal state)
    const dbState = await [dbQuery](testData.id);
    expect(dbState).toHaveProperty('expectedField');
  });
});
```

### Mock Setup (External APIs ONLY)
```typescript
import { vi } from 'vitest';

// Mock external API ONLY
vi.mock('stripe', () => ({
  default: {
    charges: {
      create: vi.fn().mockResolvedValue({ id: 'ch_test_123' })
    }
  }
}));

// NEVER mock internal modules
// WRONG: vi.mock('@/lib/db', ...) — FORBIDDEN
```

### Hallucination Detection
| Smell | Violation | Fix |
|-------|-----------|-----|
| `vi.mock('@/lib/db')` | Mocking data layer | Remove, use test database |
| `vi.mock('@/lib/[feature]')` | Mocking internal API | Remove, call real endpoint |
| `expect(service.internalMethod)` | White box assertion | Query public state instead |
| Test file > 100 lines | Scope creep | Split into focused tests |
| `const mockData = {...}` | Fake data instead of real | Use test database setup |

---

## Phase 3: Falsification Verification (10 min)

### Step 1: Run Test (Should Pass)
```bash
npx vitest run tests/integration/[feature]/[flow].test.ts --reporter=verbose
```

### Step 2: Verify Real Integration
Check that test actually uses real infrastructure:
```bash
# Monitor database queries
redis-cli -n 15 monitor  # Should show real Redis calls

# Check API logs
# Should show real HTTP requests (not mocks)
```

### Step 3: Force Failure (Must Fail)
Temporarily break the integration:
```typescript
// In API handler, add:
return new Response(null, { status: 500 });
```

Re-run test — **must fail**.

### Step 4: Restore and Confirm
Remove temporary break, re-run — **must pass**.

---

## Phase 4: Human Checkpoint (10 min)

### Review Checklist
- [ ] Test uses real database (not mocks)
- [ ] External APIs are the only mocks
- [ ] Verification via public interface (query, not internal state)
- [ ] Side effects observable via query
- [ ] File length ≤ 100 lines
- [ ] Runtime < 5 seconds
- [ ] Test fails when integration breaks
- [ ] PRD contract explicitly covered

### Completion Criteria
```markdown
✅ Test is complete when:
- Uses real database/test infrastructure
- Mocks only external APIs
- Verifies side effects via query (not internal state)
- Has ≤ 3 test cases
- File length ≤ 100 lines
- Runs in < 5 seconds
- Fails when integration breaks
- Covers PRD API contract
```

---

## Verification Commands

```bash
# Run single integration test
npx vitest run tests/integration/[feature]/[flow].test.ts

# Run all integration tests for feature
npx vitest run tests/integration/[feature]/

# With real infrastructure check
npm run verify:test-env && npx vitest run tests/integration/
```

---

## Output File Structure

```
tests/integration/
├── [feature]/
│   ├── [flow].test.ts           # Main test file (max 100 lines)
│   ├── fixtures/                # Test data (if needed)
│   │   └── [scenario].json
│   └── README.md               # API contract documentation
```

---

## Example: Complete Integration Test

```typescript
// tests/integration/basket/add-to-basket.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { addToBasket } from '@/app/actions/basket';
import { getBasket } from '@/lib/basket/queries';

describe('PRD: Adding item to basket creates reservation', () => {
  let userId: string;
  let productId: string;

  beforeAll(async () => {
    userId = await createTestUser();
    productId = await createTestProduct({ stock: 10 });
  });

  afterAll(async () => {
    await cleanupTestUser(userId);
    await cleanupTestProduct(productId);
  });

  it('adds item and reserves stock', async () => {
    const result = await addToBasket({ userId, productId, quantity: 1 });
    
    expect(result.success).toBe(true);
    
    // Verify via public query (not internal state)
    const basket = await getBasket(userId);
    expect(basket.items).toContainEqual(
      expect.objectContaining({ productId, quantity: 1 })
    );
    
    // Verify side effect (reservation created)
    const reservation = await getReservation(productId);
    expect(reservation).toBeTruthy();
  });
});
```

**Line count:** 45 lines ✅  
**Database:** Real test instance ✅  
**Mocks:** None (no external APIs) ✅  
**Verification:** Public query ✅  
**Runtime:** ~3 seconds ✅
