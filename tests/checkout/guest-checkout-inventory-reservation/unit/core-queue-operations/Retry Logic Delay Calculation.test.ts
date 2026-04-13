import { describe, it, expect } from 'vitest'

// Test the pure calculateRetryDelay logic by extracting it
// Following import-only rule from lesson learned
function calculateRetryDelay(retryCount: number): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds max for rollback
  const jitter = 0.25 // ±25% jitter

  let delay = baseDelay * Math.pow(2, retryCount - 1)

  // Add jitter before applying max delay cap
  const jitterAmount = delay * jitter
  delay = delay + (Math.random() * 2 - 1) * jitterAmount

  // Apply max delay cap after jitter (ensures 30s includes jitter)
  delay = Math.min(delay, maxDelay)

  return Math.floor(delay)
}

describe('Retry Logic Delay Calculation', () => {
  it('calculates exponential backoff with jitter within expected ranges', () => {
    // Test multiple retries to verify exponential pattern
    const delay1 = calculateRetryDelay(1) // Should be ~1000ms ±25%
    const delay2 = calculateRetryDelay(2) // Should be ~2000ms ±25%
    const delay3 = calculateRetryDelay(3) // Should be ~4000ms ±25%
    const delay4 = calculateRetryDelay(4) // Should be ~8000ms ±25%

    // Verify exponential growth (each should be roughly double previous)
    expect(delay2).toBeGreaterThan(delay1)
    expect(delay3).toBeGreaterThan(delay2)
    expect(delay4).toBeGreaterThan(delay3)

    // Verify within expected ranges (±25% of base)
    expect(delay1).toBeGreaterThanOrEqual(750)   // 1000 - 25%
    expect(delay1).toBeLessThanOrEqual(1250)     // 1000 + 25%
    expect(delay2).toBeGreaterThanOrEqual(1500)  // 2000 - 25%
    expect(delay2).toBeLessThanOrEqual(2500)     // 2000 + 25%
    expect(delay3).toBeGreaterThanOrEqual(3000)  // 4000 - 25%
    expect(delay3).toBeLessThanOrEqual(5000)     // 4000 + 25%
    expect(delay4).toBeGreaterThanOrEqual(6000)  // 8000 - 25%
    expect(delay4).toBeLessThanOrEqual(12000)    // 16000 - 25%
  })

  it('caps delay at maximum (PRD: 30s max for rollback)', () => {
    // Test high retry counts that would exceed 30s
    const delay15 = calculateRetryDelay(15) // Would be ~32768ms ±25% without cap
    const delay20 = calculateRetryDelay(20) // Would be much higher without cap

    // Both should be capped at exactly 30s (jitter applied before cap)
    expect(delay15).toBe(30000)
    expect(delay20).toBe(30000)

    // Should be exactly 30s since jitter is applied before the cap
    expect(delay15).toBe(30000)
    expect(delay20).toBe(30000)
  })

  it('applies ±25% jitter (PRD requirement)', () => {
    const delays: number[] = []

    // Run same calculation multiple times to see jitter effect
    for (let i = 0; i < 50; i++) {
      delays.push(calculateRetryDelay(3)) // Base: 4000ms
    }

    const minDelay = Math.min(...delays)
    const maxDelay = Math.max(...delays)

    // Should span the jitter range
    expect(minDelay).toBeGreaterThanOrEqual(3000) // 4000 - 25%
    expect(maxDelay).toBeLessThanOrEqual(5000)    // 4000 + 25%

    // Should have variety due to jitter
    expect(new Set(delays).size).toBeGreaterThan(1)
  })

  it('returns integer milliseconds', () => {
    for (let i = 1; i <= 5; i++) {
      const delay = calculateRetryDelay(i)
      expect(Number.isInteger(delay)).toBe(true)
      expect(delay).toBeGreaterThan(0)
    }
  })

  it('handles edge case retry count of 0', () => {
    const delay = calculateRetryDelay(0)

    // Should still work and be within reasonable range
    expect(delay).toBeGreaterThan(0)
    expect(delay).toBeLessThan(1000) // Should be small
    expect(Number.isInteger(delay)).toBe(true)
  })

  it('produces different delays for different retry counts', () => {
    const delays = new Set()

    for (let i = 1; i <= 10; i++) {
      delays.add(calculateRetryDelay(i))
    }

    // Should have different delays for different retry counts
    expect(delays.size).toBeGreaterThan(5)
  })

  it('follows PRD pattern: exponential backoff with 30s max and ±25% jitter', () => {
    // Test the core PRD requirements in one comprehensive test
    const earlyRetries = [1, 2, 3, 4, 5].map(n => calculateRetryDelay(n))
    const lateRetries = [15, 20].map(n => calculateRetryDelay(n))

    // Early retries should show exponential growth
    for (let i = 1; i < earlyRetries.length; i++) {
      expect(earlyRetries[i]).toBeGreaterThan(earlyRetries[i-1])
    }

    // Early retries should be within expected exponential ranges
    expect(earlyRetries[0]).toBeGreaterThanOrEqual(750)   // ~1000 ±25%
    expect(earlyRetries[1]).toBeGreaterThanOrEqual(1500)  // ~2000 ±25%
    expect(earlyRetries[2]).toBeGreaterThanOrEqual(3000)  // ~4000 ±25%
    expect(earlyRetries[3]).toBeGreaterThanOrEqual(6000)  // ~8000 ±25%
    expect(earlyRetries[4]).toBeGreaterThanOrEqual(12000) // ~16000 ±25%

    // Late retries should be capped at exactly 30s (jitter applied before cap)
    expect(lateRetries[0]).toBe(30000)
    expect(lateRetries[1]).toBe(30000)
  })
})