# Checkout Test Suite

## Architecture

This test suite provides systematic coverage of the checkout flow, mapping infinite user/network/backend event streams to finite, enumerable test cases.

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST PYRAMID                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                            │
│  │   E2E       │  Golden path only                          │
│  │ (Playwright)│  tests/e2e/checkout/golden-path.spec.ts    │
│  └──────┬──────┘                                            │
│         │                                                   │
│  ┌──────┴──────┐                                           │
│  │ Integration │  API routes, webhooks, FSM               │
│  │    (MSW)    │  tests/checkout/api/                       │
│  └──────┬──────┘                                            │
│         │                                                   │
│  ┌──────┴──────────┐                                       │
│  │    Unit         │  Components, utilities, validation      │
│  │ (Vitest + RTL)  │  tests/checkout/ui/                     │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Test Inventory

### FSM Tests (`tests/checkout/fsm/`)
- **checkoutMachine.test.ts**: All state transitions (idle→processing→complete/error)
- **Coverage**: 15 FSM transitions, 4 scenarios (happy path, error recovery, retry, restart)

### API Tests (`tests/checkout/api/`)
- **webhook.test.ts**: Webhook signature verification, event routing, idempotency, stock management
- **checkout-route.test.ts**: Input validation, rate limiting, stock checks, Stripe session creation
- **Coverage**: 40+ test cases for API layer

### UI Tests (`tests/checkout/ui/`)
- **PaymentForm.test.tsx**: Component rendering, form states, submission flow, error handling, FSM integration
- **Coverage**: 20+ test cases for user interactions

### Fixtures (`tests/checkout/fixtures/`)
- **stripe.ts**: Test card numbers, webhook events, FSM scenarios, API responses, network errors

## Event Stream Coverage

| Stream Type | Count | Test Location |
|-------------|-------|---------------|
| User Interactions | 15+ | `ui/PaymentForm.test.tsx` |
| Stripe.js Events | 8 | `ui/PaymentForm.test.tsx` |
| API Network States | 12 | `api/checkout-route.test.ts` |
| Webhook Event Types | 6 | `api/webhook.test.ts` |
| FSM State Transitions | 15 | `fsm/checkoutMachine.test.ts` |
| Error Scenarios | 8 | All files |
| **Total** | **~64** | **0 critical gaps** |

## Running Tests

```bash
# Run all checkout tests
npm test tests/checkout/

# Run specific suite
npm test tests/checkout/fsm/
npm test tests/checkout/api/
npm test tests/checkout/ui/

# Run with coverage
npm run test:coverage -- tests/checkout/

# E2E tests (requires dev server)
npm run test:checkout
```

## Test Card Reference

See `tests/checkout/fixtures/stripe.ts` for complete test card inventory:
- Success scenarios: `4242424242424242`
- Decline scenarios: `4000000000009995` (insufficient funds)
- 3D Secure: `4000002500003155`
- Disputes: `4000000000000259`

## Adding New Tests

1. **Identify bus stop**: What state transition or event needs coverage?
2. **Choose layer**: Unit (fast) vs Integration (realistic) vs E2E (complete)
3. **Use fixtures**: Import from `fixtures/stripe.ts` for consistency
4. **Verify FSM**: Does test align with `store/checkout/checkoutMachine.ts`?
5. **Assert behavior**: Test outcomes, not implementation

## Maintenance

- Review after Stripe SDK updates
- Update test cards quarterly (check Stripe docs)
- Add tests for new webhook events
- Keep FSM tests in sync with machine changes
