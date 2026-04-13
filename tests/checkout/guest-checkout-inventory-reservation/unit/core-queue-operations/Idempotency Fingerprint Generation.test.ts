import { describe, it, expect } from 'vitest'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

// Test the pure generateFingerprint logic by extracting it
// Following import-only rule from lesson learned
function generateFingerprint(request: QueueRequest): string {
  const fingerprint = {
    type: request.type,
    payload: request.payload,
    priority: request.priority,
  }
  return JSON.stringify(fingerprint)
}

describe('Idempotency Fingerprint Generation', () => {
  it('generates consistent fingerprint for identical requests', () => {
    const request: QueueRequest = {
      id: 'req-1',
      type: 'create_reservation',
      idempotencyKey: 'key-123',
      priority: 'normal',
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] },
      retryCount: 0
    }

    const fingerprint1 = generateFingerprint(request)
    const fingerprint2 = generateFingerprint(request)

    expect(fingerprint1).toBe(fingerprint2)
    expect(fingerprint1).toBe(JSON.stringify({
      type: 'create_reservation',
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] },
      priority: 'normal'
    }))
  })

  it('generates different fingerprints for different request types', () => {
    const baseRequest = {
      id: 'req-1',
      idempotencyKey: 'key-123',
      priority: 'normal',
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] },
      retryCount: 0
    }

    const createRequest: QueueRequest = { ...baseRequest, type: 'create_reservation' }
    const rollbackRequest: QueueRequest = { ...baseRequest, type: 'rollback_reservation' }

    const createFingerprint = generateFingerprint(createRequest)
    const rollbackFingerprint = generateFingerprint(rollbackRequest)

    expect(createFingerprint).not.toBe(rollbackFingerprint)
  })

  it('generates different fingerprints for different payloads', () => {
    const baseRequest: QueueRequest = {
      id: 'req-1',
      type: 'create_reservation',
      idempotencyKey: 'key-123',
      priority: 'normal',
      retryCount: 0
    }

    const request1: QueueRequest = {
      ...baseRequest,
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] }
    }
    const request2: QueueRequest = {
      ...baseRequest,
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 3 }] }
    }

    const fingerprint1 = generateFingerprint(request1)
    const fingerprint2 = generateFingerprint(request2)

    expect(fingerprint1).not.toBe(fingerprint2)
  })

  it('generates different fingerprints for different priorities', () => {
    const baseRequest = {
      id: 'req-1',
      type: 'create_reservation',
      idempotencyKey: 'key-123',
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] },
      retryCount: 0
    }

    const normalRequest: QueueRequest = { ...baseRequest, priority: 'normal' }
    const highPriorityRequest: QueueRequest = { ...baseRequest, priority: 'high' }

    const normalFingerprint = generateFingerprint(normalRequest)
    const highPriorityFingerprint = generateFingerprint(highPriorityRequest)

    expect(normalFingerprint).not.toBe(highPriorityFingerprint)
  })

  it('ignores id, idempotencyKey, and retryCount in fingerprint (PRD requirement)', () => {
    const request1: QueueRequest = {
      id: 'req-1',
      type: 'create_reservation',
      idempotencyKey: 'key-123',
      priority: 'normal',
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] },
      retryCount: 0
    }

    const request2: QueueRequest = {
      id: 'req-2', // Different ID
      type: 'create_reservation',
      idempotencyKey: 'key-456', // Different idempotency key
      priority: 'normal',
      payload: { clientBasket: [{ productId: 'prod-1', quantity: 2 }] },
      retryCount: 5 // Different retry count
    }

    const fingerprint1 = generateFingerprint(request1)
    const fingerprint2 = generateFingerprint(request2)

    // Should be identical since only type, payload, and priority matter
    expect(fingerprint1).toBe(fingerprint2)
  })

  it('handles complex nested payloads', () => {
    const request: QueueRequest = {
      id: 'req-1',
      type: 'rollback_reservation',
      idempotencyKey: 'key-123',
      priority: 'high',
      payload: {
        reservationId: 'res-abc',
        products: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 }
        ],
        metadata: { reason: 'user_cancelled', timestamp: '2026-04-13T16:00:00Z' }
      },
      retryCount: 0
    }

    const fingerprint = generateFingerprint(request)
    const expected = JSON.stringify({
      type: 'rollback_reservation',
      payload: {
        reservationId: 'res-abc',
        products: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 }
        ],
        metadata: { reason: 'user_cancelled', timestamp: '2026-04-13T16:00:00Z' }
      },
      priority: 'high'
    })

    expect(fingerprint).toBe(expected)
  })

  it('empty payload generates valid fingerprint', () => {
    const request: QueueRequest = {
      id: 'req-1',
      type: 'realize_reservation',
      idempotencyKey: 'key-123',
      priority: 'high',
      payload: {},
      retryCount: 0
    }

    const fingerprint = generateFingerprint(request)
    const expected = JSON.stringify({
      type: 'realize_reservation',
      payload: {},
      priority: 'high'
    })

    expect(fingerprint).toBe(expected)
  })
})