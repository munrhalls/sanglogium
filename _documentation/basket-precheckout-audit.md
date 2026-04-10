# Basket to Pre-Checkout Implementation Audit

## Critical Contract Violations Found

### 1. **UI Directly Calls Work Function** (CRITICAL)
**File**: `app/(store)/basket/CheckoutButton.tsx`
**Violation**: Lines 19-24 - UI directly calls `validateBasket()` server action
```typescript
const response = await validateBasket({
    items: basket.items.map(item => ({
        _id: item._id,
        quantity: item.quantity
    }))
}, idempotencyKey);
```

**Contract Broken**: UI should only dispatch events, never call work functions directly.

### 2. **Dual State Management** (CRITICAL)
**Files**: 
- `store/checkout.ts` (Legacy Zustand store)
- `store/preCheckout/preCheckoutMachine.ts` (New state machine)

**Violation**: Two competing state systems managing the same flow
- `CheckoutButton` uses `useCheckoutStore`
- `Basket.tsx` uses `usePreCheckout`
- No single source of truth

**Contract Broken**: Must have single state machine as source of truth.

### 3. **Mixed State Management in UI** (HIGH)
**File**: `app/(store)/basket/CheckoutButton.tsx`
**Violation**: Component manages both legacy and new state:
```typescript
const checkoutStatus = useCheckoutStore((state) => state.status);
const nextCheckoutStep = useCheckoutStore((state) => state.nextStep);
```

**Contract Broken**: UI should only read from single state machine.

### 4. **Work Function Updates UI** (HIGH)
**File**: `app/(store)/basket/CheckoutButton.tsx`
**Violation**: Line 27 - Work result directly updates UI state:
```typescript
if (response.success) {
    nextCheckoutStep(); // Direct UI state update
}
```

**Contract Broken**: Work functions should only dispatch events, never update UI.

### 5. **Missing Event-Driven Work Trigger** (HIGH)
**Issue**: State machine state changes don't automatically trigger work functions
- `useCheckoutAction` is called manually from `usePreCheckout`
- No automatic work execution on state change

**Contract Broken**: State changes should trigger work automatically.

### 6. **Success Handler Performs Side Effects** (MEDIUM)
**File**: `app/components/features/basket/checkout/useSuccessHandler.ts`
**Violation**: Line 14 - Direct browser navigation:
```typescript
window.location.assign(stripeUrl);
```

**Contract Broken**: Success handler should dispatch event, not perform navigation.

### 7. **Accept Discrepancies Mixes Concerns** (MEDIUM)
**File**: `app/components/features/basket/checkout/useAcceptDiscrepancies.ts`
**Violation**: Lines 58-60 - Direct work function call after state update:
```typescript
dispatch({ type: "START_VALIDATION" });
executeValidation(basketPayload, newKey);
```

**Contract Broken**: Should dispatch event, let state change trigger work.

## Architecture Issues

### 1. **No Clear Work Trigger Mechanism**
- No system to automatically execute work functions on state changes
- Manual work execution in hooks creates tight coupling

### 2. **State Machine Isolation**
- Pre-checkout state machine exists but isn't integrated with UI
- Legacy store still handles primary checkout flow

### 3. **Event Flow Breakdown**
- Events don't flow through complete cycle
- Missing automatic work execution layer

### 4. **No Cleanup Mechanism**
- No automatic state reset on navigation
- No inventory cleanup on abandoned checkouts

## Compliance Status

| Contract Rule | Status | Evidence |
|---------------|--------|----------|
| UI only dispatches events | **BROKEN** | CheckoutButton calls validateBasket directly |
| State machine only transitions | **OK** | preCheckoutMachine is pure |
| Work functions only do side effects | **BROKEN** | SuccessHandler navigates directly |
| Single state machine source | **BROKEN** | Two competing state systems |
| Event-only communication | **BROKEN** | Direct function calls everywhere |
| Atomic work with rollback | **OK** | validateBasket has rollback |

## Required Changes Priority

### Priority 1: Critical Architecture Fixes
1. Remove direct `validateBasket` call from CheckoutButton
2. Eliminate legacy `useCheckoutStore`
3. Implement event-driven work trigger system
4. Create single state machine integration

### Priority 2: Flow Corrections
1. Fix success handler to dispatch events only
2. Fix accept discrepancies to not call work directly
3. Implement automatic work execution on state changes
4. Add proper event flow completion

### Priority 3: Integration & Cleanup
1. Remove all legacy checkout state management
2. Implement proper cleanup mechanisms
3. Add error boundaries and recovery
4. Complete event-driven architecture

## Implementation Strategy

### Phase 1: Fix Core Violations
- Replace CheckoutButton with event-only dispatch
- Remove useCheckoutStore dependency
- Implement work trigger system

### Phase 2: Complete Event Flow
- Fix success handler event dispatch
- Fix accept discrepancies flow
- Add automatic work execution

### Phase 3: Cleanup & Polish
- Remove legacy state management
- Add cleanup mechanisms
- Test complete flow
