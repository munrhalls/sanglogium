# Sprint Template - Simple Checkout Reservation

## Overview
Implement simple stock reservation when user clicks checkout.

## UX Flow (from step 1)
1. User adds item to basket
2. User clicks checkout
3. Stock reserves for 15 seconds
4. User goes to Stripe
5. Stock releases if payment fails

## Manual Verification (from step 2)
1. Check stock is 10
2. Click checkout
3. Check stock is 8
4. Wait 15 seconds
5. Check stock is 10

## Architecture (from step 3)
- Event-driven state machine
- 4 states: IDLE, PROCESSING, SUCCESS, ERROR
- validateBasket() server action
- Simple UI updates per state

## Implementation Tasks

### Task 1: Fix Checkout Button (15 min)
- Fix response.success vs response.outcome
- Add idempotencyKey generation
- Add basic error handling

### Task 2: Create Stock Check API (15 min)
- Simple endpoint: GET /api/stock-check?product=ID
- Returns current stock and reserved amounts
- For manual verification

### Task 3: Manual Verification (15 min)
- Follow manual verification steps
- Confirm stock reservation works
- Confirm stock release works

### Task 4: Simple State Machine (30 min)
- Implement 4 states
- Event transitions
- UI updates per state
- No complex library

### Task 5: Optional Tests (if needed)
- Only if feature is complex enough
- Document working code
- No mocking core functionality

## Guardrails (from step 4)
- Manual verification first
- No tests unless needed
- Tests must be human-readable
- No mocking core functionality
- Keep it simple

## Success Criteria
- Stock reserves on checkout click
- Stock releases after 15 seconds
- Manual verification passes
- Code is simple and direct

## That's It

No cargo cult patterns. No over-engineering. Just simple, working code.
