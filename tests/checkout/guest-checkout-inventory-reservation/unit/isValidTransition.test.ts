import { describe, it, expect } from 'vitest'
import { isValidTransition } from '@/lib/checkout/reservation/state-machine'

describe('isValidTransition', () => {
  it('should allow FREE to RESERVING', () => {
    expect(isValidTransition('FREE', 'RESERVING')).toBe(true)
  })

  it('should allow RESERVING to ACTIVE', () => {
    expect(isValidTransition('RESERVING', 'ACTIVE')).toBe(true)
  })

  it('should allow RESERVING to FREE (failed reservation)', () => {
    expect(isValidTransition('RESERVING', 'FREE')).toBe(true)
  })

  it('should allow ACTIVE to CANCELLING', () => {
    expect(isValidTransition('ACTIVE', 'CANCELLING')).toBe(true)
  })

  it('should allow ACTIVE to REALIZING', () => {
    expect(isValidTransition('ACTIVE', 'REALIZING')).toBe(true)
  })

  it('should allow CANCELLING to FREE', () => {
    expect(isValidTransition('CANCELLING', 'FREE')).toBe(true)
  })

  it('should allow REALIZING to FREE', () => {
    expect(isValidTransition('REALIZING', 'FREE')).toBe(true)
  })

  it('should reject invalid transitions', () => {
    expect(isValidTransition('FREE', 'ACTIVE')).toBe(false)
    expect(isValidTransition('ACTIVE', 'RESERVING')).toBe(false)
    expect(isValidTransition('CANCELLING', 'REALIZING')).toBe(false)
    expect(isValidTransition('REALIZING', 'CANCELLING')).toBe(false)
  })

  it('should reject undefined transitions', () => {
    expect(isValidTransition('FREE', 'INVALID' as never)).toBe(false)
    expect(isValidTransition('INVALID' as never, 'FREE')).toBe(false)
  })
})
