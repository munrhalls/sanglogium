import { describe, it, expect } from 'vitest'
import { getMaxRetries } from '@/lib/checkout/reservation/queue-utils'

describe('getMaxRetries', () => {
  it('returns 3 for create_reservation', () => {
    expect(getMaxRetries('create_reservation')).toBe(3)
  })

  it('returns 10 for rollback_reservation', () => {
    expect(getMaxRetries('rollback_reservation')).toBe(10)
  })

  it('returns 3 for realize_reservation', () => {
    expect(getMaxRetries('realize_reservation')).toBe(3)
  })

  it('returns default 3 for unknown type', () => {
    expect(getMaxRetries('unknown_type' as never)).toBe(3)
  })
})
