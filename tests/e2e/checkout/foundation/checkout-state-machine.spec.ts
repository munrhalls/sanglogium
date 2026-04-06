import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutStore } from '@/store/checkout'

describe('Checkout State Machine', () => {
  beforeEach(() => {
    useCheckoutStore.getState().reset()
  })

  it('starts in IDLE state', () => {
    expect(useCheckoutStore.getState().status).toBe('IDLE')
  })

  it('transitions from IDLE to STEP_1', () => {
    useCheckoutStore.getState().nextStep()
    expect(useCheckoutStore.getState().status).toBe('STEP_1')
  })
})