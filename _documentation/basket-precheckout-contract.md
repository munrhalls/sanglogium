# Basket to Pre-Checkout Flow Contract

## Core Principle: Event-Driven State Machine

**Rule**: UI never calls business logic directly. UI always dispatches events.
**Rule**: State machine never does work. State machine only manages state.
**Rule**: Work functions never update UI. Work functions only dispatch events.

---

## Architecture Layers

### Layer 1: UI Components (Pure)
- **Basket.tsx** - Renders basket state
- **CheckoutButton.tsx** - Dispatches `START_VALIDATION` event
- **ErrorBanners.tsx** - Render based on error state

**Contract**: UI components can ONLY:
- Read state from state machine
- Dispatch events to state machine
- Show loading states based on state

### Layer 2: State Machine (Pure Transitions)
- **preCheckoutMachine.ts** - Pure transition logic
- **preCheckoutTypes.ts** - Event/state definitions

**Contract**: State machine can ONLY:
- Receive events and return new state
- Never perform side effects
- Never make network calls
- Never access external APIs

### Layer 3: Work Functions (Side Effects)
- **validateBasket.ts** - Server action
- **reserveInventory.ts** - Atomic stock reservation
- **createStripeSession.ts** - Payment session creation

**Contract**: Work functions can ONLY:
- Perform business logic
- Make network calls
- Dispatch result events back to state machine
- Never directly update UI

---

## Event Flow Contract

### Phase 1: Checkout Initiation
```
UI: User clicks "Checkout"
  dispatches START_VALIDATION event
    |
    v
State Machine: IDLE -> PROCESSING
    |
    v
UI: Shows "Connecting..." (basket locked)
```

### Phase 2: Validation Work
```
State Machine: PROCESSING state triggers work function
    |
    v
Work Function: validateBasket() executes
  - Fetches current prices
  - Checks inventory
  - Reserves stock
  - Creates Stripe session
    |
    v
Work Function: Dispatches result event
  - PASS_VALIDATION (with stripeUrl)
  - FAIL_VALIDATION (with discrepancy)
  - FAIL_NETWORK (no payload)
```

### Phase 3: Result Processing
```
State Machine: Receives result event
  - PROCESSING -> SUCCESS
  - PROCESSING -> ERROR_VALIDATION  
  - PROCESSING -> ERROR_NETWORK
    |
    v
UI: Renders based on new state
  - SUCCESS: Redirect to Stripe
  - ERROR_VALIDATION: Show discrepancy banner
  - ERROR_NETWORK: Show retry option
```

---

## Event Definitions

### Input Events (UI -> State Machine)
```typescript
START_VALIDATION = "START_VALIDATION"
RETRY_VALIDATION = "START_VALIDATION" // Same event, different context
ACCEPT_DISCREPANCIES = "ACCEPT_DISCREPANCIES"
RESET_CHECKOUT = "RESET"
```

### Work Events (State Machine -> Work Functions)
```typescript
// Implicit: State machine state change triggers work
// No explicit work events - state drives execution
```

### Result Events (Work Functions -> State Machine)
```typescript
PASS_VALIDATION = { type: "PASS_VALIDATION", stripeUrl: string }
FAIL_VALIDATION = { type: "FAIL_VALIDATION", payload: DiscrepancyPayload }
FAIL_NETWORK = { type: "FAIL_NETWORK" }
```

---

## State-to-Work Mapping

### IDLE State
- **Triggers**: No work
- **UI**: Checkout button enabled
- **Allowed Events**: START_VALIDATION

### PROCESSING State  
- **Triggers**: validateBasket work function
- **UI**: Basket locked, loading indicator
- **Allowed Events**: All result events

### SUCCESS State
- **Triggers**: Stripe redirect work
- **UI**: Redirecting message
- **Allowed Events**: RESET (for cleanup)

### ERROR_VALIDATION State
- **Triggers**: Show discrepancy UI
- **UI**: Error banner with accept/retry
- **Allowed Events**: START_VALIDATION, ACCEPT_DISCREPANCIES, RESET

### ERROR_NETWORK State
- **Triggers**: Show retry UI
- **UI**: Retry button
- **Allowed Events**: START_VALIDATION, RESET

---

## Work Function Contracts

### validateBasket()
```typescript
interface ValidateBasketInput {
  items: Array<{ _id: string; quantity: number }>
  total: number
  idempotencyKey: string
}

interface ValidateBasketOutput {
  outcome: "PASS" | "FAIL_VALIDATION" | "FAIL_NETWORK"
  stripeUrl?: string
  discrepancy?: DiscrepancyPayload
}

// Contract: Must dispatch exactly one result event
// Contract: Must handle all errors internally
// Contract: Must cleanup reservations on failure
```

### reserveInventory()
```typescript
// Contract: Atomic reservation with rollback
// Contract: Returns 400 for stock issues, throws for network errors
// Contract: Never leaves partial reservations
```

---

## UI Update Contract

### State Machine -> UI
```typescript
// UI subscribes to state changes
const { state, context } = usePreCheckout()

// UI renders based on state
switch (state) {
  case "IDLE": return <CheckoutButton />
  case "PROCESSING": return <LoadingSpinner />
  case "SUCCESS": return <RedirectToStripe url={context.stripeUrl} />
  case "ERROR_VALIDATION": return <ValidationErrorBanner />
  case "ERROR_NETWORK": return <NetworkErrorBanner />
}
```

### UI -> State Machine
```typescript
// UI never calls work functions directly
const checkout = () => {
  dispatch({ type: "START_VALIDATION" }) // Only dispatch events
}
```

---

## Critical Rules

1. **No Direct Work Calls**: UI never calls validateBasket directly
2. **No UI Updates**: Work functions never touch UI state
3. **No Side Effects**: State machine never performs I/O
4. **Event-Only Communication**: All layers communicate via events
5. **Single Source of Truth**: State machine is the only state source
6. **Atomic Work**: Work functions either complete fully or rollback

---

## Failure Modes & Recovery

### Network Failure
```
Work Function: Throws network error
  dispatches FAIL_NETWORK event
    |
    v
State Machine: PROCESSING -> ERROR_NETWORK
    |
    v
UI: Shows retry button
    |
    v
User: Clicks retry
  dispatches START_VALIDATION event
```

### Validation Failure
```
Work Function: Detects price mismatch
  dispatches FAIL_VALIDATION event
    |
    v
State Machine: PROCESSING -> ERROR_VALIDATION
    |
    v
UI: Shows discrepancy banner
    |
    v
User: Accepts changes
  dispatches ACCEPT_DISCREPANCIES event
```

---

## Implementation Checklist

- [ ] UI components only dispatch events
- [ ] State machine only manages transitions
- [ ] Work functions only do side effects
- [ ] All communication via explicit events
- [ ] No direct function calls across layers
- [ ] Single state machine as source of truth
- [ ] Atomic work with rollback capability
- [ ] Clear separation of concerns maintained
