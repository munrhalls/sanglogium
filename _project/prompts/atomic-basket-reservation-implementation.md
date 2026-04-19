# Task: Implement Atomic Basket Reservation API

Implement the atomic basket reservation API to make the integration tests pass.

## Specification

Read the integration tests at `tests/atomic-basket-reservation/integration/basket-reservation-flow.test.ts` and `tests/atomic-basket-reservation/integration/type-mismatch.test.ts`. These tests define exactly what needs to work - they are your specification.

## Implementation Steps

Follow the DoD items in `_project/prd-checkout-queue/atomic-basket-reservation/atomic-basket-reservation.todo` lines 38-72.

## Cover and Move

Verify each DoD item works before moving to the next. Run the integration tests after each step to confirm progress.

## Simplicity Guardrail

Ask yourself "Is this the simplest possible way?" for every decision. No extra features, no over-engineering, only what the tests require.

## Verification

Run `npm run test:integration -- atomic-basket-reservation` to confirm all tests pass.

## Constraints

- Use existing checkout-queue infrastructure where possible
- Use backendClient for write operations with read write create token from .env.example (or find the proper one that works for write/create operations)
- Follow existing patterns from `app/api/checkout-queue/`
- No mocking - tests use real Redis and Sanity
