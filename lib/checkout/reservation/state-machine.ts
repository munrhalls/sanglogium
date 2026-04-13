// Guest Checkout Inventory Reservation - Token State Machine
// Pure logic implementation for state transitions

import type { TokenState } from './types'

// Valid state transitions based on PRD requirements
const VALID_TRANSITIONS: Record<TokenState, TokenState[]> = {
  FREE: ['RESERVING'],
  RESERVING: ['ACTIVE', 'FREE'], // FREE for failed reservations
  ACTIVE: ['CANCELLING', 'REALIZING'],
  CANCELLING: ['FREE'],
  REALIZING: ['FREE']
}

/**
 * Check if a state transition is valid
 * @param fromState Current state
 * @param toState Target state
 * @returns true if transition is valid
 */
export function isValidTransition(fromState: TokenState, toState: TokenState): boolean {
  return VALID_TRANSITIONS[fromState]?.includes(toState) ?? false
}

/**
 * Get all valid next states from current state
 * @param currentState Current token state
 * @returns Array of valid next states
 */
export function getValidNextStates(currentState: TokenState): TokenState[] {
  return VALID_TRANSITIONS[currentState] ?? []
}

/**
 * Validate that a specific operation can be performed in the given state
 * @param state Current token state
 * @param operation Type of operation to perform
 * @returns true if operation is allowed in this state
 */
export function canPerformOperation(
  state: TokenState,
  operation: 'create' | 'rollback' | 'realize'
): boolean {
  switch (operation) {
    case 'create':
      return state === 'FREE'
    case 'rollback':
      return state === 'ACTIVE' || state === 'RESERVING'
    case 'realize':
      return state === 'ACTIVE'
    default:
      return false
  }
}
