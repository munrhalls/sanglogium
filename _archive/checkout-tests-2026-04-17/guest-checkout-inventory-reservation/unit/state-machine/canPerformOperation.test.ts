import { describe, it, expect } from 'vitest'
import { canPerformOperation } from '@/lib/checkout/reservation/state-machine'

describe('canPerformOperation', () => {
  it('should allow create operation only in FREE state', () => {
    expect(canPerformOperation('FREE', 'create')).toBe(true)
    expect(canPerformOperation('RESERVING', 'create')).toBe(false)
    expect(canPerformOperation('ACTIVE', 'create')).toBe(false)
    expect(canPerformOperation('CANCELLING', 'create')).toBe(false)
    expect(canPerformOperation('REALIZING', 'create')).toBe(false)
  })

  it('should allow rollback operation in ACTIVE and RESERVING states', () => {
    expect(canPerformOperation('ACTIVE', 'rollback')).toBe(true)
    expect(canPerformOperation('RESERVING', 'rollback')).toBe(true)
    expect(canPerformOperation('FREE', 'rollback')).toBe(false)
    expect(canPerformOperation('CANCELLING', 'rollback')).toBe(false)
    expect(canPerformOperation('REALIZING', 'rollback')).toBe(false)
  })

  it('should allow realize operation only in ACTIVE state', () => {
    expect(canPerformOperation('ACTIVE', 'realize')).toBe(true)
    expect(canPerformOperation('FREE', 'realize')).toBe(false)
    expect(canPerformOperation('RESERVING', 'realize')).toBe(false)
    expect(canPerformOperation('CANCELLING', 'realize')).toBe(false)
    expect(canPerformOperation('REALIZING', 'realize')).toBe(false)
  })

  it('should reject invalid operations', () => {
    expect(canPerformOperation('FREE', 'invalid' as never)).toBe(false)
    expect(canPerformOperation('ACTIVE', 'invalid' as never)).toBe(false)
  })
})
