# Simple Implementation Following Contract

## Step 1: Event Types
```typescript
// events.ts
export type CheckoutEvent = 
  | { type: "CLICK_CHECKOUT" }
  | { type: "VALIDATION_SUCCESS"; payload: { stripeUrl: string } }
  | { type: "VALIDATION_FAIL"; payload: { discrepancy: any } }
  | { type: "RESET" };
```

## Step 2: State Machine
```typescript
// stateMachine.ts
export type CheckoutState = {
  status: "IDLE" | "PROCESSING" | "SUCCESS" | "ERROR";
  context: {
    idempotencyKey: string | null;
    stripeUrl: string | null;
    discrepancy: any | null;
  };
};

const transitions = {
  IDLE: { CLICK_CHECKOUT: "PROCESSING" },
  PROCESSING: { 
    VALIDATION_SUCCESS: "SUCCESS",
    VALIDATION_FAIL: "ERROR" 
  },
  SUCCESS: { RESET: "IDLE" },
  ERROR: { 
    CLICK_CHECKOUT: "PROCESSING",
    RESET: "IDLE" 
  }
};

export function processEvent(
  currentState: CheckoutState, 
  event: CheckoutEvent
): CheckoutState {
  const allowedNextStates = transitions[currentState.status];
  const nextStatus = allowedNextStates[event.type];
  
  if (!nextStatus) {
    throw new Error(`Invalid transition: ${currentState.status} -> ${event.type}`);
  }
  
  return {
    status: nextStatus,
    context: updateContext(currentState.context, event)
  };
}

function updateContext(context: CheckoutState["context"], event: CheckoutEvent) {
  switch (event.type) {
    case "CLICK_CHECKOUT":
      return { 
        ...context, 
        idempotencyKey: generateIdempotencyKey(),
        stripeUrl: null,
        discrepancy: null 
      };
    case "VALIDATION_SUCCESS":
      return { 
        ...context, 
        stripeUrl: event.payload.stripeUrl,
        discrepancy: null 
      };
    case "VALIDATION_FAIL":
      return { 
        ...context, 
        discrepancy: event.payload.discrepancy,
        stripeUrl: null 
      };
    case "RESET":
      return { 
        idempotencyKey: null,
        stripeUrl: null,
        discrepancy: null 
      };
  }
}
```

## Step 3: Store/Reducer
```typescript
// store.ts
import { CheckoutState, CheckoutEvent, processEvent } from "./stateMachine";

const initialState: CheckoutState = {
  status: "IDLE",
  context: {
    idempotencyKey: null,
    stripeUrl: null,
    discrepancy: null
  }
};

export function checkoutReducer(
  state: CheckoutState = initialState,
  event: CheckoutEvent
): CheckoutState {
  return processEvent(state, event);
}

// React hook
export function useCheckoutMachine() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  
  // Side effects based on state changes
  useEffect(() => {
    if (state.status === "PROCESSING" && state.context.idempotencyKey) {
      // Trigger server call
      handleProcessing(state.context.idempotencyKey);
    }
  }, [state.status, state.context.idempotencyKey]);
  
  return { state, dispatch };
}
```

## Step 4: Server Handler
```typescript
// serverHandler.ts
async function handleProcessing(idempotencyKey: string) {
  try {
    const basket = getBasketItems();
    const result = await validateBasket(basket, idempotencyKey);
    
    // Map server result to event
    const event = mapServerResultToEvent(result);
    
    // Dispatch result event
    dispatch(event);
  } catch (error) {
    dispatch({ type: "VALIDATION_FAIL", payload: { error: error.message } });
  }
}

function mapServerResultToEvent(result: any): CheckoutEvent {
  if (result.outcome === "PASS") {
    return { type: "VALIDATION_SUCCESS", payload: { stripeUrl: result.stripeUrl } };
  } else {
    return { type: "VALIDATION_FAIL", payload: { discrepancy: result.discrepancy } };
  }
}
```

## Step 5: UI Component
```typescript
// CheckoutButton.tsx
export default function CheckoutButton() {
  const { state, dispatch } = useCheckoutMachine();
  
  const handleClick = () => {
    dispatch({ type: "CLICK_CHECKOUT" });
  };
  
  const handleRetry = () => {
    dispatch({ type: "CLICK_CHECKOUT" });
  };
  
  const handleReset = () => {
    dispatch({ type: "RESET" });
  };
  
  // UI based on state
  switch (state.status) {
    case "IDLE":
      return <button onClick={handleClick}>Checkout</button>;
      
    case "PROCESSING":
      return <div>Processing...</div>;
      
    case "SUCCESS":
      useEffect(() => {
        if (state.context.stripeUrl) {
          window.location.assign(state.context.stripeUrl);
        }
      }, [state.context.stripeUrl]);
      return <div>Redirecting to payment...</div>;
      
    case "ERROR":
      return (
        <div>
          <ErrorDisplay discrepancy={state.context.discrepancy} />
          <button onClick={handleRetry}>Retry</button>
          <button onClick={handleReset}>Cancel</button>
        </div>
      );
  }
}
```

## That's The Complete Flow

Events -> State Machine -> Server Call -> Result Event -> State Machine -> UI Update

No shortcuts, no direct server calls from UI, no direct UI updates from server. Everything flows through the contract.
