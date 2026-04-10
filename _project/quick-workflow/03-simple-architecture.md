# Simple Architecture - Event-Driven State Machine

## Pattern
```
Event -> State Change -> Function Call -> Result Event -> New State
```

## States
- **IDLE** - Basket ready, user can edit
- **PROCESSING** - Validating, reserving stock, creating Stripe session
- **SUCCESS** - Stripe URL received, redirecting
- **ERROR** - Something failed, user can retry

## Events
- **CLICK_CHECKOUT** - User clicks checkout button
- **VALIDATION_SUCCESS** - Stock reserved, Stripe session created
- **VALIDATION_FAIL** - Price mismatch, no stock, or network error
- **RESET** - Return to IDLE state

## Function Calls
- **validateBasket()** - Server action
  - Checks prices
  - Reserves stock
  - Creates Stripe session
  - Returns success/fail

## UI Updates
- **IDLE** - Show checkout button
- **PROCESSING** - Show "Processing...", disable button
- **SUCCESS** - Show "Redirecting..."
- **ERROR** - Show error message, show retry button

## Flow Example
```
User clicks checkout
    |
    v
CLICK_CHECKOUT event
    |
    v
State changes to PROCESSING
    |
    v
UI shows "Processing..."
    |
    v
validateBasket() called
    |
    v
Returns VALIDATION_SUCCESS
    |
    v
State changes to SUCCESS
    |
    v
UI shows "Redirecting..."
    |
    v
window.location.assign(stripeUrl)
```

## That's It

No complex state machine library. Just events, states, and function calls.
