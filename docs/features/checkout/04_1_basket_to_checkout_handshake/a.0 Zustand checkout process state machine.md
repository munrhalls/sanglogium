# Specification: Checkout Process State Machine

## 1. Overview
The `checkoutStore` is a dedicated, non-persistent Zustand store designed to manage the lifecycle of a checkout transaction. It acts as a **Finite State Machine (FSM)**, ensuring that the UI only transitions between logical phases and preventing illegal states (e.g., success without processing).

---

## 2. State Definitions (`CheckoutStatus`)

| Status | Type | Description |
|:---|:---|:---|
| `idle` | Initial | Default state. Ready to start checkout. |
| `processing` | Transient | Request sent to Server Action; awaiting validation/API response. |
| `publicBasketDataInvalid` | Failure | Pre-flight Zod validation failed (structural error). |
| `inventoryConflict` | Failure | Server-side check found stock/price discrepancies. |
| `readyForPayment` | Success (Pre) | Validation passed; ready to redirect to Stripe/Provider. |
| `success` | Terminal | Transaction complete and confirmed. |

---

## 3. Transition Matrix (Guards)

| Current State | Target State | Action / Trigger | Guard Condition |
|:---|:---|:---|:---|
| `idle` / `Failure` | `processing` | `initiate()` | Must not be `processing` or `success`. |
| `processing` | `publicBasketDataInvalid`| `rejectData()` | Must be in `processing`. |
| `processing` | `inventoryConflict` | `resolveConflict()` | Must be in `processing`. |
| `processing` | `readyForPayment` | `preparePayment()` | Must be in `processing`. |
| `any` | `idle` | `reset()` | None (User-initiated reset). |

---

## 4. Implementation Logic

### File: `app/(store)/basket/checkoutStore.ts`

```typescript
import { create } from "zustand";

interface CheckoutState {
  status: CheckoutStatus;
  error: string | null;

  // Actions
  initiate: () => void;
  rejectData: (msg: string) => void;
  resolveConflict: (msg: string) => void;
  markReady: () => void;
  markSuccess: () => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  status: 'idle',
  error: null,

  initiate: () => {
    const { status } = get();
    if (status === 'processing' || status === 'success') return;
    set({ status: 'processing', error: null });
  },

  rejectData: (msg) => {
    if (get().status !== 'processing') return;
    set({ status: 'publicBasketDataInvalid', error: msg });
  },

  resolveConflict: (msg) => {
    if (get().status !== 'processing') return;
    set({ status: 'inventoryConflict', error: msg });
  },

  markReady: () => {
    if (get().status !== 'processing') return;
    set({ status: 'readyForPayment', error: null });
  },

  markSuccess: () => {
    set({ status: 'success', error: null });
  },

  reset: () => set({ status: 'idle', error: null }),
}));

5. Persistence Strategy
Middleware: None. persist is strictly omitted.

Rationale: If a user refreshes during processing, they must land back on idle. Storing a transient state in localStorage creates a "Locked UI" anti-pattern where the user cannot escape a loading spinner.

6. Failure Case UI (b.0 Spec Alignment)
publicBasketDataInvalid Case
UI Trigger: status === 'publicBasketDataInvalid'.

Action: Replace Checkout Button with an Inline Message.

Message: "Basket data out of sync. Please refresh."

Primary Control: A "Refresh" button that calls reset() and potentially re-fetches product data from Sanity.


7. Verification Checklist
[ ] Logic prevents idle -> success transition.

[ ] Logic prevents double-processing if initiate() is called twice.

[ ] error state is cleared upon every new initiate().

[ ] Store is correctly decoupled from useBasketStore (Data vs. Process).