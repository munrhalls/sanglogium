import { describe, it, expect } from 'vitest'
import { isValidTransition, getValidNextStates, canPerformOperation } from '@/lib/checkout/reservation/state-machine'

describe('Token State Machine Transitions', () => {
  // Test the complete flow: FREE -> RESERVING -> ACTIVE -> CANCELLING/REALIZING -> FREE

  it('should allow FREE to RESERVING transition', () => {
    expect(isValidTransition('FREE', 'RESERVING')).toBe(true)
  })

  it('should allow RESERVING to ACTIVE transition (successful reservation)', () => {
    expect(isValidTransition('RESERVING', 'ACTIVE')).toBe(true)
  })

  it('should allow RESERVING to FREE transition (failed reservation)', () => {
    expect(isValidTransition('RESERVING', 'FREE')).toBe(true)
  })

  it('should allow ACTIVE to CANCELLING transition', () => {
    expect(isValidTransition('ACTIVE', 'CANCELLING')).toBe(true)
  })

  it('should allow ACTIVE to REALIZING transition', () => {
    expect(isValidTransition('ACTIVE', 'REALIZING')).toBe(true)
  })

  it('should allow CANCELLING to FREE transition', () => {
    expect(isValidTransition('CANCELLING', 'FREE')).toBe(true)
  })

  it('should allow REALIZING to FREE transition', () => {
    expect(isValidTransition('REALIZING', 'FREE')).toBe(true)
  })

  // Test invalid transitions
  it('should NOT allow direct FREE to ACTIVE transition', () => {
    expect(isValidTransition('FREE', 'ACTIVE')).toBe(false)
  })

  it('should NOT allow ACTIVE to RESERVING transition', () => {
    expect(isValidTransition('ACTIVE', 'RESERVING')).toBe(false)
  })

  it('should NOT allow CANCELLING to ACTIVE transition', () => {
    expect(isValidTransition('CANCELLING', 'ACTIVE')).toBe(false)
  })

  it('should NOT allow REALIZING to CANCELLING transition', () => {
    expect(isValidTransition('REALIZING', 'CANCELLING')).toBe(false)
  })

  // Test complete valid flows
  describe('Complete Reservation Flow', () => {
    it('should allow complete successful flow: FREE -> RESERVING -> ACTIVE -> REALIZING -> FREE', () => {
      expect(isValidTransition('FREE', 'RESERVING')).toBe(true)
      expect(isValidTransition('RESERVING', 'ACTIVE')).toBe(true)
      expect(isValidTransition('ACTIVE', 'REALIZING')).toBe(true)
      expect(isValidTransition('REALIZING', 'FREE')).toBe(true)
    })

    it('should allow complete cancellation flow: FREE -> RESERVING -> ACTIVE -> CANCELLING -> FREE', () => {
      expect(isValidTransition('FREE', 'RESERVING')).toBe(true)
      expect(isValidTransition('RESERVING', 'ACTIVE')).toBe(true)
      expect(isValidTransition('ACTIVE', 'CANCELLING')).toBe(true)
      expect(isValidTransition('CANCELLING', 'FREE')).toBe(true)
    })

    it('should allow failed reservation flow: FREE -> RESERVING -> FREE', () => {
      expect(isValidTransition('FREE', 'RESERVING')).toBe(true)
      expect(isValidTransition('RESERVING', 'FREE')).toBe(true)
    })
  })

  // Test getValidNextStates
  describe('getValidNextStates', () => {
    it('should return correct next states for FREE', () => {
      expect(getValidNextStates('FREE')).toEqual(['RESERVING'])
    })

    it('should return correct next states for RESERVING', () => {
      expect(getValidNextStates('RESERVING')).toEqual(['ACTIVE', 'FREE'])
    })

    it('should return correct next states for ACTIVE', () => {
      expect(getValidNextStates('ACTIVE')).toEqual(['CANCELLING', 'REALIZING'])
    })

    it('should return correct next states for CANCELLING', () => {
      expect(getValidNextStates('CANCELLING')).toEqual(['FREE'])
    })

    it('should return correct next states for REALIZING', () => {
      expect(getValidNextStates('REALIZING')).toEqual(['FREE'])
    })
  })

  // Test operation permissions
  describe('canPerformOperation', () => {
    it('should allow create operation only in FREE state', () => {
      expect(canPerformOperation('FREE', 'create')).toBe(true)
      expect(canPerformOperation('RESERVING', 'create')).toBe(false)
      expect(canPerformOperation('ACTIVE', 'create')).toBe(false)
      expect(canPerformOperation('CANCELLING', 'create')).toBe(false)
      expect(canPerformOperation('REALIZING', 'create')).toBe(false)
    })

    it('should allow rollback operation in ACTIVE and RESERVING states', () => {
      expect(canPerformOperation('FREE', 'rollback')).toBe(false)
      expect(canPerformOperation('RESERVING', 'rollback')).toBe(true)
      expect(canPerformOperation('ACTIVE', 'rollback')).toBe(true)
      expect(canPerformOperation('CANCELLING', 'rollback')).toBe(false)
      expect(canPerformOperation('REALIZING', 'rollback')).toBe(false)
    })

    it('should allow realize operation only in ACTIVE state', () => {
      expect(canPerformOperation('FREE', 'realize')).toBe(false)
      expect(canPerformOperation('RESERVING', 'realize')).toBe(false)
      expect(canPerformOperation('ACTIVE', 'realize')).toBe(true)
      expect(canPerformOperation('CANCELLING', 'realize')).toBe(false)
      expect(canPerformOperation('REALIZING', 'realize')).toBe(false)
    })
  })
})
