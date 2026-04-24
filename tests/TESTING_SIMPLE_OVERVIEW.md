# TESTING_SIMPLE_OVERVIEW

## Test Flows

```
NODE_ENV (test/production)
    ↓
next.config.ts
    ↓
Sanity CMS (test dataset for dev/test)
    ↓
test-data.ts helpers
    ↓
├─ Integration Tests (Vitest, 16 files, zero mocks)
│   └─ Real Redis + Real Sanity
├─ E2E Tests (Playwright, 6 files)
│   └─ Real browser + Real Sanity
└─ Component Tests (Playwright CT, 1 file)
    └─ Real Next.js environment
```

## Test Types

### Integration Tests (Vitest)
- Location: tests/checkout-queue/integration/
- Count: 16 files
- Approach: Zero mocks
- Infrastructure: Real Redis + Real Sanity
- Data: Fetched from CMS via getTestProducts()

### E2E Tests (Playwright)
- Location: tests/checkout/e2e/ and tests/checkout-queue/e2e/
- Count: 6 files
- Approach: Real browser testing
- Infrastructure: Real Google API, Real Sanity
- Data: Fetched from CMS via getTestProducts()

### Component Tests (Playwright CT)
- Location: tests/component/
- Count: 1 file
- Approach: Real Next.js environment
- Infrastructure: @playwright/experimental-ct-react
- Data: Mock data in test

## Dataset Configuration

- Development/Test: NODE_ENV=test → dataset="test"
- Production: NODE_ENV=production → dataset="production"
- Control: next.config.ts drives dataset selection

## Test Helpers

- getTestProducts(): Fetches products from Sanity CMS test dataset
- resetProductStock(): Resets product stock for test isolation
- Sanity Clients: Read client for queries, write client for setup
