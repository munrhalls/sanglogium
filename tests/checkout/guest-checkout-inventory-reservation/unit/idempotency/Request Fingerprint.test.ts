import { describe, it, expect } from 'vitest'
import { createHash } from 'crypto'

// Test the pure SHA256 hash generation and comparison logic
// Following import-only rule from lesson learned
function generateSHA256Hash(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

function generateRequestFingerprint(body: unknown, headers: Record<string, string>): string {
  // Normalize body to string
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body)

  // Sort headers for consistent ordering
  const sortedHeaders = Object.keys(headers)
    .sort()
    .reduce((acc, key) => {
      acc[key] = headers[key]
      return acc
    }, {} as Record<string, string>)

  const headersString = JSON.stringify(sortedHeaders)

  // Combine body and headers
  const combined = `${bodyString}:${headersString}`

  return generateSHA256Hash(combined)
}

function compareFingerprints(hash1: string, hash2: string): boolean {
  return hash1 === hash2
}

describe('SHA256 Request Fingerprint Generation', () => {
  it('generates consistent SHA256 hash for identical input', () => {
    const data = 'test data'
    const hash1 = generateSHA256Hash(data)
    const hash2 = generateSHA256Hash(data)

    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/i) // SHA256 produces 64 hex chars
  })

  it('generates different hashes for different inputs', () => {
    const hash1 = generateSHA256Hash('data1')
    const hash2 = generateSHA256Hash('data2')

    expect(hash1).not.toBe(hash2)
  })

  it('handles empty string input', () => {
    const hash = generateSHA256Hash('')
    expect(hash).toMatch(/^[a-f0-9]{64}$/i)
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') // Known SHA256 of empty string
  })

  it('generates fingerprint for simple request', () => {
    const body = { productId: 'prod-123', quantity: 2 }
    const headers = { 'content-type': 'application/json', 'x-custom': 'value' }

    const fingerprint = generateRequestFingerprint(body, headers)

    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i)
  })

  it('generates same fingerprint for identical requests regardless of header order', () => {
    const body = { test: 'value' }
    const headers1 = { 'b': '2', 'a': '1' }
    const headers2 = { 'a': '1', 'b': '2' }

    const fingerprint1 = generateRequestFingerprint(body, headers1)
    const fingerprint2 = generateRequestFingerprint(body, headers2)

    expect(fingerprint1).toBe(fingerprint2)
  })

  it('generates different fingerprints for different bodies', () => {
    const headers = { 'content-type': 'application/json' }
    const body1 = { productId: 'prod-1' }
    const body2 = { productId: 'prod-2' }

    const fingerprint1 = generateRequestFingerprint(body1, headers)
    const fingerprint2 = generateRequestFingerprint(body2, headers)

    expect(fingerprint1).not.toBe(fingerprint2)
  })

  it('generates different fingerprints for different headers', () => {
    const body = { test: 'same' }
    const headers1 = { 'x-version': '1' }
    const headers2 = { 'x-version': '2' }

    const fingerprint1 = generateRequestFingerprint(body, headers1)
    const fingerprint2 = generateRequestFingerprint(body, headers2)

    expect(fingerprint1).not.toBe(fingerprint2)
  })

  it('handles string body input', () => {
    const body = 'raw string body'
    const headers = { 'content-type': 'text/plain' }

    const fingerprint = generateRequestFingerprint(body, headers)

    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i)
  })

  it('handles empty headers', () => {
    const body = { test: 'value' }
    const headers = {}

    const fingerprint = generateRequestFingerprint(body, headers)

    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i)
  })

  it('handles complex nested objects', () => {
    const body = {
      user: { id: '123', name: 'John' },
      items: [
        { id: 'i1', qty: 2 },
        { id: 'i2', qty: 1, options: { color: 'red' } }
      ]
    }
    const headers = {
      'x-request-id': 'req-abc',
      'authorization': 'Bearer token123'
    }

    const fingerprint = generateRequestFingerprint(body, headers)

    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i)
  })

  it('compareFingerprints correctly identifies matching hashes', () => {
    const hash = generateSHA256Hash('test')

    expect(compareFingerprints(hash, hash)).toBe(true)
  })

  it('compareFingerprints correctly identifies non-matching hashes', () => {
    const hash1 = generateSHA256Hash('test1')
    const hash2 = generateSHA256Hash('test2')

    expect(compareFingerprints(hash1, hash2)).toBe(false)
  })

  it('handles special characters in body and headers', () => {
    const body = { message: 'Hello émojis! ñáçèñts' }
    const headers = { 'x-special': 'v@lue$with#symbols' }

    const fingerprint = generateRequestFingerprint(body, headers)

    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i)
  })

  it('generates consistent fingerprints across multiple calls', () => {
    const body = { data: 'consistent' }
    const headers = { 'x-test': 'value' }

    const fingerprint1 = generateRequestFingerprint(body, headers)
    const fingerprint2 = generateRequestFingerprint(body, headers)

    expect(fingerprint1).toBe(fingerprint2)
  })
})
