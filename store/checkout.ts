import { create } from 'zustand'

type CheckoutStatus = 'IDLE' | 'PROCESSING' | 'ERROR_NETWORK' | 'ERROR_BASKET' | 'SUCCESS'

type CheckoutState = {
  status: CheckoutStatus
  startProcessing: () => void
  setResult: (result: 'SUCCESS' | 'ERROR_NETWORK' | 'ERROR_BASKET') => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  status: 'IDLE',

  startProcessing: () =>
    set((state) => {
      if (state.status === 'IDLE' || state.status.startsWith('ERROR')) {
        return { status: 'PROCESSING' }
      }
      return state
    }),

  setResult: (result) =>
    set((state) => {
      if (state.status === 'PROCESSING') {
        return { status: result }
      }
      return state
    }),

  reset: () => set({ status: 'IDLE' }),
}))