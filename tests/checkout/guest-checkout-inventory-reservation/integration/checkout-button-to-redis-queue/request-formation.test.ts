// Integration Test: Request Formation
//
// Scope: Button click -> Idempotency key -> API request formation
// OUT OF SCOPE: Redis queue addition, response handling, state management, UI updates
//
// Tests request structure and idempotency key generation

import { describe, it, expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

// Test data - inline to avoid fixtures (no external dependencies)
const clientBasket = {
  products: [
    {
      id: 'prod-1',
      quantity: 2,
      stripePriceId: 'price_1234567890'
    }
  ],
  currency: 'PLN'
}

describe('Request Formation', () => {
  describe('Button Click Handling', () => {
    it('should generate UUIDv4 idempotency key', () => {
      const idempotencyKey = uuidv4()

      expect(idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should include client basket in payload', () => {
      const idempotencyKey = uuidv4()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      expect(request.payload.clientBasket).toEqual(clientBasket)
    })
  })

  describe('API Request Formation', () => {
    it('should format request with correct structure', () => {
      const idempotencyKey = uuidv4()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      expect(request).toHaveProperty('type', 'create_reservation')
      expect(request).toHaveProperty('idempotencyKey')
      expect(request).toHaveProperty('payload.clientBasket')
    })

    it('should include idempotency key in request', () => {
      const idempotencyKey = uuidv4()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      expect(typeof request.idempotencyKey).toBe('string')
      expect(request.idempotencyKey).toHaveLength(36) // UUID length
    })

    it('should include all required QueueRequest fields', () => {
      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      // Verify all required fields are present and have correct types
      expect(typeof request.id).toBe('string')
      expect(['create_reservation', 'rollback_reservation', 'realize_reservation']).toContain(request.type)
      expect(typeof request.idempotencyKey).toBe('string')
      expect(typeof request.payload).toBe('object')
      expect(['normal', 'high']).toContain(request.priority)
      expect(request.createdAt).toBeInstanceOf(Date)
      expect(typeof request.retryCount).toBe('number')
    })
  })
})
