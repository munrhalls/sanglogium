// Unit Tests: Security Functions
//
// Tests pure logic for secret masking and security-related transformations
// Data in, predictable data out, zero side effects

import { describe, it, expect } from 'vitest'

// Extract the pure function from config.ts for testing
class SecurityUtils {
  static maskSecret(value: string): string {
    if (!value || typeof value !== 'string') {
      return value || ''
    }
    if (value.startsWith('sk_')) {
      return value.substring(0, 7) + '***MASKED***'
    }
    if (value.startsWith('whsec_')) {
      return value.substring(0, 10) + '***MASKED***'
    }
    if (value.startsWith('sk-')) {
      return value.substring(0, 3) + '***MASKED***'
    }
    return value
  }
}

describe('Security Functions', () => {
  describe('maskSecret', () => {
    it('should mask Stripe secret keys (sk_ format)', () => {
      const secret = 'sk_live_1234567890abcdef'
      const masked = SecurityUtils.maskSecret(secret)

      expect(masked).toBe('sk_live***MASKED***')
      expect(masked).not.toContain('1234567890abcdef')
      expect(masked).toContain('sk_live')
    })

    it('should mask Stripe webhook secrets (whsec_ format)', () => {
      const secret = 'whsec_1234567890abcdef1234567890abcdef'
      const masked = SecurityUtils.maskSecret(secret)

      expect(masked).toBe('whsec_1234***MASKED***')
      expect(masked).not.toContain('567890abcdef1234567890abcdef')
      expect(masked).toContain('whsec_1234')
    })

    it('should mask Stripe test keys (sk- format)', () => {
      const secret = 'sk-test_1234567890abcdef'
      const masked = SecurityUtils.maskSecret(secret)

      expect(masked).toBe('sk-***MASKED***')
      expect(masked).not.toContain('test_1234567890abcdef')
      expect(masked).toContain('sk-')
    })

    it('should not mask non-secret strings', () => {
      const nonSecret = 'regular-string'
      const masked = SecurityUtils.maskSecret(nonSecret)

      expect(masked).toBe('regular-string')
    })

    it('should handle empty string', () => {
      const masked = SecurityUtils.maskSecret('')
      expect(masked).toBe('')
    })

    it('should handle null/undefined gracefully', () => {
      expect(SecurityUtils.maskSecret(null as any)).toBe('')
      expect(SecurityUtils.maskSecret(undefined as any)).toBe('')
    })

    it('should handle very short secret strings', () => {
      const shortSecret = 'sk_'
      const masked = SecurityUtils.maskSecret(shortSecret)

      expect(masked).toBe('sk_***MASKED***')
    })

    it('should handle exact boundary lengths', () => {
      const boundarySecret = 'sk_123456'
      const masked = SecurityUtils.maskSecret(boundarySecret)

      expect(masked).toBe('sk_1234***MASKED***')
    })

    it('should preserve case sensitivity', () => {
      const upperCase = 'SK_LIVE_1234567890ABCDEF'
      const lowerCase = 'sk_live_1234567890abcdef'

      // Only lowercase sk_ is masked
      expect(SecurityUtils.maskSecret(upperCase)).toBe('SK_LIVE_1234567890ABCDEF')
      expect(SecurityUtils.maskSecret(lowerCase)).toBe('sk_live***MASKED***')
    })

    it('should handle mixed format strings', () => {
      const mixed = 'prefix_sk_live_123456_suffix'
      const masked = SecurityUtils.maskSecret(mixed)

      // Only masks if sk_ is at the very beginning
      expect(masked).toBe('prefix_sk_live_123456_suffix')
    })

    it('should not mask partial matches', () => {
      const partial = 'not_a_secret_sk_but_contains_sk'
      const masked = SecurityUtils.maskSecret(partial)

      expect(masked).toBe('not_a_secret_sk_but_contains_sk')
    })

    it('should handle webhook secret boundary case', () => {
      const boundaryWebhook = 'whsec_123'
      const masked = SecurityUtils.maskSecret(boundaryWebhook)

      expect(masked).toBe('whsec_123***MASKED***')
    })

    it('should handle test key boundary case', () => {
      const boundaryTest = 'sk-'
      const masked = SecurityUtils.maskSecret(boundaryTest)

      expect(masked).toBe('sk-***MASKED***')
    })

    it('should be deterministic - same input always produces same output', () => {
      const secret = 'sk_live_1234567890abcdef'
      const result1 = SecurityUtils.maskSecret(secret)
      const result2 = SecurityUtils.maskSecret(secret)

      expect(result1).toBe(result2)
    })
  })
})
