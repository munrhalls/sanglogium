import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutStore } from '@/store/checkout'

describe('Checkout State Machine - Advanced Flow', () => {
  beforeEach(() => {
    useCheckoutStore.getState().reset()
  })

  it('transitions from IDLE to PROCESSING', () => {
    useCheckoutStore.getState().startProcessing()
    expect(useCheckoutStore.getState().status).toBe('PROCESSING')
  })

  it('transitions from PROCESSING to ERROR_NETWORK', () => {
    useCheckoutStore.getState().startProcessing()
    useCheckoutStore.getState().setResult('ERROR_NETWORK')
    expect(useCheckoutStore.getState().status).toBe('ERROR_NETWORK')
  })

  it('allows retry from ERROR_NETWORK back to PROCESSING', () => {
    useCheckoutStore.getState().startProcessing()
    useCheckoutStore.getState().setResult('ERROR_NETWORK')

    useCheckoutStore.getState().startProcessing()
    expect(useCheckoutStore.getState().status).toBe('PROCESSING')
  })

  it('blocks setResult if not in PROCESSING state', () => {
    useCheckoutStore.getState().setResult('SUCCESS')
    expect(useCheckoutStore.getState().status).toBe('IDLE')
  })
})