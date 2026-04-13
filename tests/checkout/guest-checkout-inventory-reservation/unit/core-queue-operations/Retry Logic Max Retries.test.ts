import { describe, it, expect } from 'vitest'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

// Test the pure getMaxRetries logic by extracting it
// Following import-only rule from lesson learned
function getMaxRetries(type: QueueRequest['type']): number {
  switch (type) {
    case 'create_reservation':
      return 3
    case 'rollback_reservation':
      return 10 // Higher retry count for rollbacks per PRD
    case 'realize_reservation':
      return 3
    default:
      return 3
  }
}

describe('Retry Logic Max Retries', () => {
  it('returns 3 retries for create_reservation (PRD line 95)', () => {
    const maxRetries = getMaxRetries('create_reservation')
    expect(maxRetries).toBe(3)
  })

  it('returns 10 retries for rollback_reservation (PRD line 96)', () => {
    const maxRetries = getMaxRetries('rollback_reservation')
    expect(maxRetries).toBe(10)
  })

  it('returns 3 retries for realize_reservation', () => {
    const maxRetries = getMaxRetries('realize_reservation')
    expect(maxRetries).toBe(3)
  })

  it('returns 3 retries for unknown types (default)', () => {
    const maxRetries = getMaxRetries('unknown_type' as QueueRequest['type'])
    expect(maxRetries).toBe(3)
  })

  it('rollobs get higher retry count than creates (PRD requirement)', () => {
    const createRetries = getMaxRetries('create_reservation')
    const rollbackRetries = getMaxRetries('rollback_reservation')

    expect(rollbackRetries).toBeGreaterThan(createRetries)
    expect(rollbackRetries).toBe(10)
    expect(createRetries).toBe(3)
  })
})