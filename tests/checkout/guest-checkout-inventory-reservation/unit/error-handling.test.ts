// Unit Tests: Error Handling
//
// Tests pure logic for error classification and detection
// Data in, predictable data out, zero side effects

import { describe, it, expect } from 'vitest'

// Extract the pure function from FIFOQueue for testing
class ErrorHandlingUtils {
  static isTransientError(error: Error): boolean {
    const transientErrors = ['network', 'timeout', 'ECONNREFUSED', 'ETIMEDOUT']
    const message = error.message || ''
    return transientErrors.some(err => message.toLowerCase().includes(err.toLowerCase()))
  }
}

describe('Error Handling', () => {
  describe('isTransientError', () => {
    it('should detect network errors', () => {
      const networkError = new Error('Network connection failed')
      expect(ErrorHandlingUtils.isTransientError(networkError)).toBe(true)
    })

    it('should detect timeout errors', () => {
      const timeoutError = new Error('Request timeout after 30s')
      expect(ErrorHandlingUtils.isTransientError(timeoutError)).toBe(true)
    })

    it('should detect connection errors', () => {
      const connError = new Error('ECONNREFUSED: Connection refused')
      expect(ErrorHandlingUtils.isTransientError(connError)).toBe(true)
    })

    it('should detect ETIMEDOUT errors', () => {
      const etimedoutError = new Error('ETIMEDOUT: Operation timed out')
      expect(ErrorHandlingUtils.isTransientError(etimedoutError)).toBe(true)
    })

    it('should return false for validation errors', () => {
      const validationError = new Error('Invalid request format')
      expect(ErrorHandlingUtils.isTransientError(validationError)).toBe(false)
    })

    it('should return false for authentication errors', () => {
      const authError = new Error('Authentication failed')
      expect(ErrorHandlingUtils.isTransientError(authError)).toBe(false)
    })

    it('should return false for permission errors', () => {
      const permError = new Error('Permission denied')
      expect(ErrorHandlingUtils.isTransientError(permError)).toBe(false)
    })

    it('should be case insensitive', () => {
      const upperCaseError = new Error('NETWORK ERROR')
      const lowerCaseError = new Error('network error')

      expect(ErrorHandlingUtils.isTransientError(upperCaseError)).toBe(true)
      expect(ErrorHandlingUtils.isTransientError(lowerCaseError)).toBe(true)
    })

    it('should handle partial matches', () => {
      const partialError = new Error('Connection timeout: network unstable')
      expect(ErrorHandlingUtils.isTransientError(partialError)).toBe(true)
    })

    it('should handle empty error message', () => {
      const emptyError = new Error()
      expect(ErrorHandlingUtils.isTransientError(emptyError)).toBe(false)
    })

    it('should handle null/undefined error message', () => {
      const nullError = { message: null } as Error
      const undefinedError = { message: undefined } as Error

      expect(ErrorHandlingUtils.isTransientError(nullError)).toBe(false)
      expect(ErrorHandlingUtils.isTransientError(undefinedError)).toBe(false)
    })
  })
})
