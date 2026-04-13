// Unit Tests: Retry Logic
// 
// Tests pure logic for retry calculations and limits
// Data in, predictable data out, zero side effects

import { describe, it, expect } from 'vitest'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

// Extract the pure functions from FIFOQueue for testing
class RetryLogicUtils {
  static calculateRetryDelay(retryCount: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 30000 // 30 seconds max for rollback
    const jitter = 0.25 // ±25% jitter

    let delay = baseDelay * Math.pow(2, retryCount - 1)
    delay = Math.min(delay, maxDelay)

    // Add jitter
    const jitterAmount = delay * jitter
    delay = delay + (Math.random() * 2 - 1) * jitterAmount

    return Math.floor(delay)
  }

  static getMaxRetries(type: QueueRequest['type']): number {
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
}

describe('Retry Logic', () => {
  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      // Mock Math.random for deterministic test
      const originalRandom = Math.random
      Math.random = () => 0.5 // Fixed value for jitter
      
      try {
        const delay1 = RetryLogicUtils.calculateRetryDelay(1)
        const delay2 = RetryLogicUtils.calculateRetryDelay(2)
        const delay3 = RetryLogicUtils.calculateRetryDelay(3)
        
        expect(delay1).toBe(1000) // 1 second base
        expect(delay2).toBe(2000) // 2 seconds
        expect(delay3).toBe(4000) // 4 seconds
      } finally {
        Math.random = originalRandom
      }
    })

    it('should apply jitter within bounds', () => {
      const baseDelay = RetryLogicUtils.calculateRetryDelay(2) // Should be 2000 base
      const jitterAmount = 2000 * 0.25 // 500
      
      // Run multiple times to check jitter is applied
      const delays: number[] = []
      for (let i = 0; i < 100; i++) {
        delays.push(RetryLogicUtils.calculateRetryDelay(2))
      }
      
      const minDelay = Math.min(...delays)
      const maxDelay = Math.max(...delays)
      
      // Should be within jitter bounds (2000 ± 500)
      expect(minDelay).toBeGreaterThanOrEqual(1500)
      expect(maxDelay).toBeLessThanOrEqual(2500)
    })

    it('should cap at max delay', () => {
      // Test high retry count that would exceed max
      const delay = RetryLogicUtils.calculateRetryDelay(10)
      expect(delay).toBeLessThanOrEqual(30000)
    })

    it('should return base delay for first retry', () => {
      const delay = RetryLogicUtils.calculateRetryDelay(1)
      expect(delay).toBeGreaterThanOrEqual(750) // With jitter down
      expect(delay).toBeLessThanOrEqual(1250) // With jitter up
    })

    it('should handle zero retry count', () => {
      const delay = RetryLogicUtils.calculateRetryDelay(0)
      expect(delay).toBeGreaterThanOrEqual(375) // 500 * 0.75
      expect(delay).toBeLessThanOrEqual(625) // 500 * 1.25
    })
  })

  describe('getMaxRetries', () => {
    it('should return 3 for create_reservation', () => {
      expect(RetryLogicUtils.getMaxRetries('create_reservation')).toBe(3)
    })

    it('should return 10 for rollback_reservation', () => {
      expect(RetryLogicUtils.getMaxRetries('rollback_reservation')).toBe(10)
    })

    it('should return 3 for realize_reservation', () => {
      expect(RetryLogicUtils.getMaxRetries('realize_reservation')).toBe(3)
    })

    it('should return 3 for unknown types', () => {
      expect(RetryLogicUtils.getMaxRetries('unknown' as any)).toBe(3)
    })

    it('should handle all valid request types', () => {
      const validTypes: QueueRequest['type'][] = [
        'create_reservation',
        'rollback_reservation',
        'realize_reservation'
      ]
      
      validTypes.forEach(type => {
        const maxRetries = RetryLogicUtils.getMaxRetries(type)
        expect(maxRetries).toBeGreaterThan(0)
        expect(maxRetries).toBeLessThanOrEqual(10)
      })
    })
  })
})
