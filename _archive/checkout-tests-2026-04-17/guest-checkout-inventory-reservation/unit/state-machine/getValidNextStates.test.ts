import { describe, it, expect } from 'vitest'
import { getValidNextStates } from '@/lib/checkout/reservation/state-machine'

describe('getValidNextStates', () => {
  it('should return valid next states for FREE', () => {
    expect(getValidNextStates('FREE')).toEqual(['RESERVING'])
  })

  it('should return valid next states for RESERVING', () => {
    expect(getValidNextStates('RESERVING')).toEqual(['ACTIVE', 'FREE'])
  })

  it('should return valid next states for ACTIVE', () => {
    expect(getValidNextStates('ACTIVE')).toEqual(['CANCELLING', 'REALIZING'])
  })

  it('should return valid next states for CANCELLING', () => {
    expect(getValidNextStates('CANCELLING')).toEqual(['FREE'])
  })

  it('should return valid next states for REALIZING', () => {
    expect(getValidNextStates('REALIZING')).toEqual(['FREE'])
  })

  it('should return empty array for undefined states', () => {
    expect(getValidNextStates('INVALID' as never)).toEqual([])
  })
})
