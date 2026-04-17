import { describe, it, expect } from 'vitest'
import { maskSecret } from '@/lib/checkout/reservation/config'

describe('maskSecret', () => {
  it('should mask Stripe sk_ keys', () => {
    const secret = 'sk_test_1234567890abcdef'
    expect(maskSecret(secret)).toBe('sk_test***MASKED***')
  })

  it('should mask Stripe webhook whsec_ keys', () => {
    const secret = 'whsec_1234567890abcdef'
    expect(maskSecret(secret)).toBe('whsec_1234***MASKED***')
  })

  it('should mask Stripe sk- keys', () => {
    const secret = 'sk-1234567890abcdef'
    expect(maskSecret(secret)).toBe('sk-***MASKED***')
  })

  it('should return non-secret strings unchanged', () => {
    const normal = 'normal-string'
    expect(maskSecret(normal)).toBe(normal)
  })

  it('should handle empty strings', () => {
    expect(maskSecret('')).toBe('')
  })

  it('should handle strings that start with secret prefixes but are not secrets', () => {
    const fake = 'sk_fakeprefix'
    expect(maskSecret(fake)).toBe('sk_fake***MASKED***')
  })
})
