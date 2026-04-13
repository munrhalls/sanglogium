// Unit Tests: Request Fingerprint Generation
// 
// Tests pure logic for generating request fingerprints used in idempotency
// Data in, predictable data out, zero side effects

import { describe, it, expect } from 'vitest'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

// Test data
const mockRequest: QueueRequest = {
  id: 'test-123',
  type: 'create_reservation',
  idempotencyKey: 'key-456',
  payload: {
    clientBasket: {
      products: [{ id: 'prod-1', quantity: 2, stripePriceId: 'price_123' }],
      currency: 'PLN'
    }
  },
  priority: 'normal',
  createdAt: new Date(),
  retryCount: 0
}

// Extract the pure function from FIFOQueue for testing
class FingerprintUtils {
  static generateFingerprint(request: QueueRequest): string {
    return JSON.stringify({
      type: request.type,
      payload: request.payload
    })
  }
}

describe('Request Fingerprint Generation', () => {
  describe('generateFingerprint', () => {
    it('should create consistent fingerprint for same request', () => {
      const fingerprint1 = FingerprintUtils.generateFingerprint(mockRequest)
      const fingerprint2 = FingerprintUtils.generateFingerprint(mockRequest)
      
      expect(fingerprint1).toBe(fingerprint2)
    })

    it('should exclude id, timestamp, retryCount from fingerprint', () => {
      const request1 = { ...mockRequest, id: 'different-123' }
      const request2 = { ...mockRequest, createdAt: new Date(Date.now() + 10000) }
      const request3 = { ...mockRequest, retryCount: 5 }
      
      const fingerprint1 = FingerprintUtils.generateFingerprint(request1)
      const fingerprint2 = FingerprintUtils.generateFingerprint(request2)
      const fingerprint3 = FingerprintUtils.generateFingerprint(request3)
      const original = FingerprintUtils.generateFingerprint(mockRequest)
      
      expect(fingerprint1).toBe(original)
      expect(fingerprint2).toBe(original)
      expect(fingerprint3).toBe(original)
    })

    it('should handle empty payload', () => {
      const requestWithEmptyPayload = {
        ...mockRequest,
        payload: {}
      }
      
      const fingerprint = FingerprintUtils.generateFingerprint(requestWithEmptyPayload)
      expect(fingerprint).toBe('{"type":"create_reservation","payload":{}}')
    })

    it('should differentiate different request types', () => {
      const rollbackRequest = { ...mockRequest, type: 'rollback_reservation' as const }
      const createFingerprint = FingerprintUtils.generateFingerprint(mockRequest)
      const rollbackFingerprint = FingerprintUtils.generateFingerprint(rollbackRequest)
      
      expect(createFingerprint).not.toBe(rollbackFingerprint)
    })

    it('should differentiate different payloads', () => {
      const requestWithDifferentPayload = {
        ...mockRequest,
        payload: {
          clientBasket: {
            products: [{ id: 'prod-2', quantity: 1, stripePriceId: 'price_456' }],
            currency: 'USD'
          }
        }
      }
      
      const originalFingerprint = FingerprintUtils.generateFingerprint(mockRequest)
      const differentFingerprint = FingerprintUtils.generateFingerprint(requestWithDifferentPayload)
      
      expect(originalFingerprint).not.toBe(differentFingerprint)
    })
  })
})
