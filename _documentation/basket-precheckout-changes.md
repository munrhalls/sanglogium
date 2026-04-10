# Required Changes for Basket to Pre-Checkout Flow

## Priority 1: Critical Architecture Fixes

### 1. Replace CheckoutButton.tsx with Event-Only Dispatch
**File**: `app/(store)/basket/CheckoutButton.tsx`
**Changes**:
```typescript
// REMOVE: Direct validateBasket call
// REMOVE: useCheckoutStore dependency
// ADD: Event-only dispatch

export default function CheckoutButton() {
  const { state, checkout } = usePreCheckout(); // Use only pre-checkout state
  
  const handleCheckout = () => {
    checkout(); // Dispatches START_VALIDATION event
  }

  return (
    <button 
      onClick={handleCheckout}
      disabled={state !== "IDLE"}
      className="btn-primary..."
    >
      {state === "PROCESSING" ? "Connecting..." : "Checkout"}
    </button>
  );
}
```

### 2. Remove Legacy Checkout Store
**File**: `store/checkout.ts`
**Action**: DELETE entire file
**Impact**: 
- Remove `useCheckoutStore` from all components
- Eliminate dual state management
- Create single source of truth

### 3. Implement Work Trigger System
**File**: `app/components/features/basket/checkout/useWorkTrigger.ts` (NEW)
**Purpose**: Automatically execute work functions on state changes
```typescript
export function useWorkTrigger(state: PreCheckoutState, context: PreCheckoutContext) {
  const { executeValidation } = useCheckoutAction(dispatch);
  
  useEffect(() => {
    if (state === "PROCESSING" && context.idempotencyKey) {
      // State change triggers work automatically
      executeValidation(getBasketPayload(), context.idempotencyKey);
    }
  }, [state, context.idempotencyKey]);
}
```

### 4. Update usePreCheckout Hook
**File**: `app/components/features/basket/checkout/usePreCheckout.ts`
**Changes**:
- Remove manual work execution
- Add work trigger integration
- Simplify public API

## Priority 2: Flow Corrections

### 5. Fix Success Handler
**File**: `app/components/features/basket/checkout/useSuccessHandler.ts`
**Changes**:
```typescript
// REMOVE: Direct navigation
// ADD: Event dispatch

const onSuccessEntry = (stripeUrl: string, watchdogRef: React.MutableRefObject<number | null>) => {
  // Dispatch navigation event instead of direct navigation
  dispatch({ type: "NAVIGATE_TO_STRIPE", payload: { stripeUrl } });
  
  // Keep watchdog timer
  watchdogRef.current = window.setTimeout(() => {
    if (watchdogRef.current !== null) {
      dispatch({ type: "FAIL_NETWORK" });
    }
  }, 5_000) as unknown as number;
};
```

### 6. Fix Accept Discrepancies Flow
**File**: `app/components/features/basket/checkout/useAcceptDiscrepancies.ts`
**Changes**:
```typescript
// REMOVE: Direct work execution
// ADD: Event-only dispatch

const acceptAndContinue = async (discrepancy: DiscrepancyPayload, idempotencyKey: string) => {
  // ... mutations logic ...
  
  // Dispatch event only - let work trigger handle execution
  dispatch({ type: "ACCEPT_DISCREPANCIES_AND_RETRY" });
  // REMOVE: executeValidation(basketPayload, newKey);
};
```

### 7. Add Navigation Event Handler
**File**: `app/components/features/basket/checkout/useNavigationHandler.ts` (NEW)
**Purpose**: Handle navigation events from state machine
```typescript
export function useNavigationHandler(state: PreCheckoutState, context: PreCheckoutContext) {
  useEffect(() => {
    if (state === "SUCCESS" && context.stripeUrl) {
      window.location.assign(context.stripeUrl);
    }
  }, [state, context.stripeUrl]);
}
```

### 8. Update State Machine Events
**File**: `store/preCheckout/preCheckoutTypes.ts`
**Changes**:
```typescript
export type PreCheckoutEvent =
  | { type: "START_VALIDATION" }
  | { type: "FAIL_NETWORK" }
  | { type: "FAIL_VALIDATION"; payload: DiscrepancyPayload }
  | { type: "PASS_VALIDATION"; stripeUrl: string }
  | { type: "RESET" }
  | { type: "ACCEPT_DISCREPANCIES_AND_RETRY" } // NEW
  | { type: "NAVIGATE_TO_STRIPE"; payload: { stripeUrl: string } }; // NEW
```

## Priority 3: Integration & Cleanup

### 9. Update Basket.tsx State Usage
**File**: `app/(store)/basket/Basket.tsx`
**Changes**:
```typescript
// REMOVE: Legacy checkout state
// ADD: Pre-checkout state only

const { state: checkoutState } = usePreCheckout();
const isBasketLocked = checkoutState !== "IDLE";
```

### 10. Remove Legacy State from Components
**Files to update**:
- `app/(store)/basket/BasketSummary.tsx`
- `app/(store)/basket/BasketClientWrapper.tsx`
- Any component using `useCheckoutStore`

### 11. Add Cleanup Mechanism
**File**: `app/components/features/basket/checkout/useCleanup.ts` (NEW)
**Purpose**: Handle abandoned checkouts and state cleanup
```typescript
export function useCleanup(state: PreCheckoutState, context: PreCheckoutContext) {
  useEffect(() => {
    // Cleanup on page unload
    const handleUnload = () => {
      if (context.idempotencyKey) {
        releaseInventoryLock(context.idempotencyKey);
      }
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [context.idempotencyKey]);
}
```

### 12. Update State Machine Transitions
**File**: `store/preCheckout/preCheckoutMachine.ts`
**Changes**:
- Add `ACCEPT_DISCREPANCIES_AND_RETRY` transition
- Add `NAVIGATE_TO_STRIPE` transition
- Ensure all transitions are pure

## Implementation Order

### Phase 1: Core Fixes (30 mins)
1. Create work trigger system
2. Update usePreCheckout hook
3. Replace CheckoutButton.tsx
4. Test basic event flow

### Phase 2: Flow Corrections (20 mins)
1. Fix success handler
2. Fix accept discrepancies
3. Add navigation handler
4. Update state machine events
5. Test complete flow

### Phase 3: Cleanup (15 mins)
1. Remove legacy checkout store
2. Update all component dependencies
3. Add cleanup mechanisms
4. Final integration testing

## Files to Delete
- `store/checkout.ts` (legacy store)
- Any files using `useCheckoutStore` after migration

## Files to Create
- `app/components/features/basket/checkout/useWorkTrigger.ts`
- `app/components/features/basket/checkout/useNavigationHandler.ts`
- `app/components/features/basket/checkout/useCleanup.ts`

## Files to Modify
- `app/(store)/basket/CheckoutButton.tsx`
- `app/(store)/basket/Basket.tsx`
- `app/components/features/basket/checkout/usePreCheckout.ts`
- `app/components/features/basket/checkout/useSuccessHandler.ts`
- `app/components/features/basket/checkout/useAcceptDiscrepancies.ts`
- `store/preCheckout/preCheckoutTypes.ts`
- `store/preCheckout/preCheckoutMachine.ts`

## Verification Steps
1. Event dispatch triggers state change
2. State change triggers work function
3. Work function dispatches result event
4. Result event updates state
5. State update updates UI
6. No direct function calls across layers
7. Single state machine as source of truth
