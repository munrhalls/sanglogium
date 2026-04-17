import { describe, it, expect } from 'vitest'
import { calculateRetryDelay } from '@/lib/checkout/reservation/queue-utils'

describe('calculateRetryDelay', () => {
  it('calculates ~1s base delay for first retry', () => {
    const delay = calculateRetryDelay(1)
    expect(delay).toBeGreaterThanOrEqual(750) // 1s - 25% jitter
    expect(delay).toBeLessThanOrEqual(1250) // 1s + 25% jitter
  })

  it('doubles delay exponentially', () => {
    const d1 = calculateRetryDelay(1)
    const d2 = calculateRetryDelay(2)
    const d3 = calculateRetryDelay(3)

    // Each should be roughly double the previous (with jitter)
    expect(d2).toBeGreaterThan(d1 * 1.5)
    expect(d3).toBeGreaterThan(d2 * 1.5)
  })

  it('caps delay at 30s maximum', () => {
    // retryCount=6 would be 32s without cap, should be capped at 30s
    const delay = calculateRetryDelay(6)
    expect(delay).toBeLessThanOrEqual(30000)
  })

  it('adds jitter to delay', () => {
    // Collect multiple samples to verify jitter exists
    const delays = Array.from({ length: 10 }, () => calculateRetryDelay(2))
    const uniqueDelays = new Set(delays)

    // With jitter, we should have some variation (not all identical)
    expect(uniqueDelays.size).toBeGreaterThan(1)
  })

  it('returns positive integer', () => {
    const delay = calculateRetryDelay(1)
    expect(delay).toBeGreaterThan(0)
    expect(Number.isInteger(delay)).toBe(true)
  })
})
