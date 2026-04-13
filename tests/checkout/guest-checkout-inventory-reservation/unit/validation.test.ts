// Unit Tests: Validation
// 
// Tests pure logic for UUID validation and request structure validation
// Data in, predictable data out, zero side effects

import { describe, it, expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
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

// Extract the pure functions from FIFOQueue for testing
class ValidationUtils {
  static isValidUUID(uuid: string): boolean {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidV4Regex.test(uuid)
  }

  static validateQueueRequest(request: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!request || typeof request !== 'object') {
      errors.push('request must be an object')
      return { valid: false, errors }
    }
    
    const req = request as Record<string, unknown>
    
    if (!req.id || typeof req.id !== 'string') {
      errors.push('id is required and must be string')
    }
    
    if (!req.type || !['create_reservation', 'rollback_reservation', 'realize_reservation'].includes(req.type)) {
      errors.push('type must be valid reservation type')
    }
    
    if (!req.idempotencyKey || typeof req.idempotencyKey !== 'string') {
      errors.push('idempotencyKey is required and must be string')
    }
    
    if (!req.payload || typeof req.payload !== 'object') {
      errors.push('payload is required and must be object')
    }
    
    if (!req.priority || !['normal', 'high'].includes(req.priority)) {
      errors.push('priority must be normal or high')
    }
    
    if (!(req.createdAt instanceof Date)) {
      errors.push('createdAt must be Date')
    }
    
    if (typeof req.retryCount !== 'number' || req.retryCount < 0) {
      errors.push('retryCount must be non-negative number')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

describe('Validation', () => {
  describe('UUID Validation', () => {
    it('should validate UUID v4 format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      expect(ValidationUtils.isValidUUID(validUUID)).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(ValidationUtils.isValidUUID('invalid-uuid')).toBe(false)
      expect(ValidationUtils.isValidUUID('550e8400-e29b-41d4-a716')).toBe(false) // Too short
      expect(ValidationUtils.isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false) // Too long
      expect(ValidationUtils.isValidUUID('550e8400-e29b-51d4-a716-446655440000')).toBe(false) // Wrong version (5 instead of 4)
      expect(ValidationUtils.isValidUUID('550e8400-e29b-41d4-c716-446655440000')).toBe(false) // Wrong variant (c instead of 8,9,a,b)
      expect(ValidationUtils.isValidUUID('550e8400-e29b-41d4-a716-44665544zzzz')).toBe(false) // Invalid hex characters
    })

    it('should accept real UUID generation', () => {
      const generatedUUID = uuidv4()
      expect(ValidationUtils.isValidUUID(generatedUUID)).toBe(true)
    })

    it('should handle empty string', () => {
      expect(ValidationUtils.isValidUUID('')).toBe(false)
    })

    it('should handle null/undefined', () => {
      expect(ValidationUtils.isValidUUID(null as any)).toBe(false)
      expect(ValidationUtils.isValidUUID(undefined as any)).toBe(false)
    })
  })

  describe('Request Structure Validation', () => {
    it('should validate complete valid request', () => {
      const result = ValidationUtils.validateQueueRequest(mockRequest)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const invalidRequest = { ...mockRequest }
      delete (invalidRequest as any).id
      delete (invalidRequest as any).type
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('id is required and must be string')
      expect(result.errors).toContain('type must be valid reservation type')
    })

    it('should validate payload structure', () => {
      const invalidRequest = { ...mockRequest, payload: null }
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('payload is required and must be object')
    })

    it('should validate priority values', () => {
      const invalidRequest = { ...mockRequest, priority: 'invalid' as any }
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('priority must be normal or high')
    })

    it('should validate retry count is non-negative', () => {
      const invalidRequest = { ...mockRequest, retryCount: -1 }
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('retryCount must be non-negative number')
    })

    it('should validate createdAt is Date', () => {
      const invalidRequest = { ...mockRequest, createdAt: '2023-01-01' as any }
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('createdAt must be Date')
    })

    it('should handle null request', () => {
      const result = ValidationUtils.validateQueueRequest(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('request must be an object')
    })

    it('should handle undefined request', () => {
      const result = ValidationUtils.validateQueueRequest(undefined)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('request must be an object')
    })

    it('should validate idempotencyKey format', () => {
      const invalidRequest = { ...mockRequest, idempotencyKey: '' }
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('idempotencyKey is required and must be string')
    })

    it('should accumulate multiple errors', () => {
      const invalidRequest = {
        id: 123, // wrong type
        type: 'invalid',
        idempotencyKey: '',
        payload: null,
        priority: 'wrong',
        createdAt: 'date',
        retryCount: -1
      }
      
      const result = ValidationUtils.validateQueueRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(5)
    })
  })
})
