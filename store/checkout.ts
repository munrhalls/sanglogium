import { create } from "zustand";

export type CheckoutStatus =
  | 'idle'
  | 'processing'
  | 'publicBasketDataInvalid'
  | 'inventoryConflict'
  | 'readyForPayment'
  | 'success';

interface CheckoutState {
  status: CheckoutStatus;
  error: string | null;

  // Actions (The State Machine Transitions)
  initiate: () => void;
  rejectData: (msg: string) => void;
  resolveConflict: () => void;
  markSuccess: () => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  status: 'idle',
  error: null,

  initiate: () => {
    // GUARD: Only allow starting from idle or an error state
    const { status } = get();
    if (status === 'processing' || status === 'success') return;

    set({ status: 'processing', error: null });
  },

  rejectData: (msg) => {
    // GUARD: Only reject if we were actually processing
    if (get().status !== 'processing') return;
    set({ status: 'publicBasketDataInvalid', error: msg });
  },

  markSuccess: () => {
    if (get().status !== 'processing') return;
    set({ status: 'success', error: null });
  },

  reset: () => set({ status: 'idle', error: null }),
  resolveConflict: () => set({ status: 'idle', error: null }),
}));