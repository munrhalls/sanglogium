# TDD Red Phase: Test as Specification

**Date:** 2026-04-22  
**Source:** Address slice e2e test preparation  
**Severity:** Critical  
**Frequency:** Universal (applies to all feature development)

## Core Principle

**Red phase test is specification, not test.** It defines what the system should do (input/output), not how it does it (implementation).

## The Problem

Tests that mock core functionality create false positives. Test passes but system doesn't work. This is infinitely worse than no test.

## The Solution

Red phase test must be:
- **Input/output only** - specify what goes in, what comes out
- **Zero mocks** - use real dependencies (Google API, Sanity, browser)
- **Zero fakes** - no manual implementations of real services
- **Zero lies** - no canned responses that don't match reality
- **Zero implementation details** - don't test internal structure

## Red Phase Test Structure

```typescript
// RED PHASE: Specification only
test('user submits address → Google validates → Sanity updates → redirect', async () => {
  // INPUT: User submits address form
  const address = { street: '123 Main', city: 'Warsaw', postalCode: '00-001', regionCode: 'PL' }
  
  // ACTION: Submit form
  await page.fill(address)
  await page.click('Submit')
  
  // OUTPUT: Verify end state only
  await expect(page).toHaveURL('/checkout/shipping')
  const doc = await sanityClient.fetch(reservationId)
  expect(doc.shippingAddress).toEqual(address)
})
```

## What Makes This Valid Red Phase

1. **Fails before implementation exists** - Test will fail because PATCH endpoint doesn't exist
2. **Input/output only** - Specifies form input, verifies redirect and document update
3. **Zero mocks** - Uses real Google API, real Sanity, real browser
4. **Zero implementation details** - Doesn't test how Google API is called, only that it works
5. **Human verifiable** - Anyone can read test and understand expected behavior
6. **Zero false positive risk** - No fakes, no manual implementations, no lies

## When Red Phase Is Ready

Design is ready for red phase test when:
- [x] Flow diagram exists showing input/output chain
- [x] PRD exists with clear behavior definition
- [x] Test specification is input/output only (no implementation details)
- [x] Test uses zero mocks (real dependencies)
- [x] Test is verifiable by human (clear input → clear output)
- [x] Test has zero risk of false positives (no fakes)

## Anti-Patterns

❌ **Mocking Google API** - Test passes with fake address, real API rejects it
❌ **Mocking Sanity** - Test saves to fake client, real write fails
❌ **Testing internal function calls** - Test couples to implementation, breaks on refactor
❌ **Creating fake services** - Manual implementation drifts from real service
❌ **Canned responses** - Test expects specific response, real API returns different

## Prevention Rules

**MANDATORY:**
1. **Red phase test first** - Write failing test before any implementation
2. **Real dependencies only** - Use real Google API, real Sanity, real browser
3. **Input/output specification** - Test only what goes in, what comes out
4. **Zero implementation coupling** - Don't test how, test what
5. **Human verification** - Test must be readable and verifiable by human

## Applicability

**When to apply:**
- All feature development
- All e2e test writing
- All integration test writing

**When to skip:**
- Never - red phase specification is mandatory for all production code

## Keywords

["tdd", "red-phase", "specification", "zero-mocks", "zero-fakes", "zero-lies", "input-output", "false-positives"]
