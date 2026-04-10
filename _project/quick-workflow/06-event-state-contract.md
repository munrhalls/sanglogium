# Event-State-Server Contract

## The Fatal Gap
No contract for: Events -> State Machine -> Server/Side Effects -> Result Event -> State Machine

## 1. Event Contract

### Event Shape
```typescript
interface CheckoutEvent {
  type: "CLICK_CHECKOUT" | "VALIDATION_SUCCESS" | "VALIDATION_FAIL" | "RESET";
  payload?: {
    idempotencyKey?: string;
    discrepancy?: DiscrepancyPayload;
    error?: string;
  };
}
```

### Event Dispatch
```typescript
// Only these ways to dispatch events:
dispatch({ type: "CLICK_CHECKOUT" });
dispatch({ type: "VALIDATION_SUCCESS", payload: { stripeUrl } });
dispatch({ type: "VALIDATION_FAIL", payload: { discrepancy } });
dispatch({ type: "RESET" });
```

## 2. State Machine Contract

### State Shape
```typescript
interface CheckoutState {
  status: "IDLE" | "PROCESSING" | "SUCCESS" | "ERROR";
  context: {
    idempotencyKey: string | null;
    stripeUrl: string | null;
    discrepancy: DiscrepancyPayload | null;
    error: string | null;
  };
}
```

### State Transition Rules
```typescript
const transitions = {
  IDLE: {
    CLICK_CHECKOUT: "PROCESSING"
  },
  PROCESSING: {
    VALIDATION_SUCCESS: "SUCCESS",
    VALIDATION_FAIL: "ERROR"
  },
  SUCCESS: {
    RESET: "IDLE"
  },
  ERROR: {
    CLICK_CHECKOUT: "PROCESSING",
    RESET: "IDLE"
  }
};
```

## 3. Event-to-State Processing Contract

### Processor Function
```typescript
function processEvent(
  currentState: CheckoutState,
  event: CheckoutEvent
): CheckoutState {
  // 1. Validate transition is allowed
  const allowedNextStates = transitions[currentState.status];
  if (!allowedNextStates[event.type]) {
    throw new Error(`Invalid transition: ${currentState.status} -> ${event.type}`);
  }
  
  // 2. Create new state
  const newStatus = allowedNextStates[event.type];
  const newContext = updateContext(currentState.context, event);
  
  return { status: newStatus, context: newContext };
}
```

## 4. Server Function Contract

### Server Call Triggered by State Change
```typescript
// When state enters PROCESSING:
if (newState.status === "PROCESSING") {
  const result = await validateBasket(basketPayload, idempotencyKey);
  
  // MUST dispatch result event:
  if (result.outcome === "PASS") {
    dispatch({ type: "VALIDATION_SUCCESS", payload: { stripeUrl: result.stripeUrl } });
  } else {
    dispatch({ type: "VALIDATION_FAIL", payload: { discrepancy: result.discrepancy } });
  }
}
```

### Server Function Shape
```typescript
// Server MUST return:
interface ServerResult {
  outcome: "PASS" | "FAIL_VALIDATION" | "FAIL_NETWORK";
  data?: {
    stripeUrl?: string;
    discrepancy?: DiscrepancyPayload;
  };
}
```

## 5. Result Event Flow Contract

### Server Result -> Event Mapping
```typescript
function mapServerResultToEvent(result: ServerResult): CheckoutEvent {
  switch (result.outcome) {
    case "PASS":
      return { type: "VALIDATION_SUCCESS", payload: { stripeUrl: result.data?.stripeUrl } };
    case "FAIL_VALIDATION":
      return { type: "VALIDATION_FAIL", payload: { discrepancy: result.data?.discrepancy } };
    case "FAIL_NETWORK":
      return { type: "VALIDATION_FAIL", payload: { error: "Network error" } };
  }
}
```

## 6. UI Update Contract

### UI Updates from State
```typescript
// UI subscribes to state, updates based on status:
function CheckoutUI({ state }: { state: CheckoutState }) {
  switch (state.status) {
    case "IDLE":
      return <CheckoutButton onClick={() => dispatch({ type: "CLICK_CHECKOUT" })} />;
    case "PROCESSING":
      return <ProcessingSpinner />;
    case "SUCCESS":
      return <Redirecting toStripe={state.context.stripeUrl} />;
    case "ERROR":
      return <ErrorMessage error={state.context.error} onRetry={() => dispatch({ type: "CLICK_CHECKOUT" })} />;
  }
}
```

## 7. Prevention Rules

### MUST NOT:
- Call server functions outside of state change handlers
- Update UI directly from server results
- Skip event dispatch for server results
- Allow invalid state transitions

### MUST:
- Always go through event -> state -> server -> event -> state flow
- Validate all state transitions
- Dispatch events for ALL server results
- Keep UI as pure function of state

## That's The Contract

This closes the fatal gap. Every piece has a contract and clear flow.
