import { create } from 'zustand'

type CheckoutState = {
  status: 'IDLE' | 'STEP_1' | 'STEP_2'
  nextStep: () => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  status: 'IDLE',

  nextStep: () =>
    set((state) => {
      if (state.status === 'IDLE') return { status: 'STEP_1' }
      if (state.status === 'STEP_1') return { status: 'STEP_2' }
      return state
    }),
  reset: () => set({ status: 'IDLE' }),

}))