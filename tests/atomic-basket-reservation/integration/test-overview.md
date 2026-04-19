# Atomic Basket Reservation Integration Tests - Overview

## Folder Structure
```
tests/atomic-basket-reservation/integration/
├── basket-reservation-flow.test.ts    # Main flow: UI → queue → CMS → response
├── type-mismatch.test.ts              # Type validation: rejects invalid requests
└── test-overview.md                   # This file
```

## File Contents

### basket-reservation-flow.test.ts
- Imports types from `@/lib/queue/types`
- Tests full flow: UI request → queue add → CMS processing → response
- Verifies: request type, queue type, CMS reservation doc creation, response type
- Uses real Redis (localhost:6379, DB 15) and real Sanity
- No mocks

### type-mismatch.test.ts
- Imports types from `@/lib/queue/types`
- Tests invalid request rejection
- Verifies: no queue add, no processing for mismatched types
- Uses real type guards from types.ts
- No mocks

## Verification
Run: `npm run test:integration -- atomic-basket-reservation`
