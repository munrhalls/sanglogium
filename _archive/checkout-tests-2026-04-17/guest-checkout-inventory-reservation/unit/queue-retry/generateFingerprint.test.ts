import { describe, it, expect } from 'vitest'
import { generateFingerprint } from '@/lib/checkout/reservation/queue-utils'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

describe('generateFingerprint', () => {
  const baseRequest: QueueRequest = {
    id: 'req-1',
    type: 'create_reservation',
    idempotencyKey: 'key-1',
    payload: { products: [] },
    priority: 'normal',
    createdAt: new Date(),
    retryCount: 0,
  }

  it('generates consistent fingerprint for identical requests', () => {
    const fp1 = generateFingerprint(baseRequest)
    const fp2 = generateFingerprint(baseRequest)
    expect(fp1).toBe(fp2)
  })

  it('generates different fingerprints for different types', () => {
    const fp1 = generateFingerprint(baseRequest)
    const fp2 = generateFingerprint({ ...baseRequest, type: 'rollback_reservation' })
    expect(fp1).not.toBe(fp2)
  })

  it('generates different fingerprints for different payloads', () => {
    const fp1 = generateFingerprint(baseRequest)
    const fp2 = generateFingerprint({ ...baseRequest, payload: { products: [{ id: '1' }] } })
    expect(fp1).not.toBe(fp2)
  })

  it('includes priority in fingerprint', () => {
    const fp1 = generateFingerprint(baseRequest)
    const fp2 = generateFingerprint({ ...baseRequest, priority: 'high' })
    expect(fp1).not.toBe(fp2)
  })

  it('produces valid JSON string', () => {
    const fp = generateFingerprint(baseRequest)
    expect(() => JSON.parse(fp)).not.toThrow()
  })
})
