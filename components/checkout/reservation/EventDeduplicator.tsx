// Guest Checkout Inventory Reservation - Event Deduplication System
// 1-second debounce per PRD, prevents double-clicks and rapid re-submissions

'use client'

import { useCallback, useRef } from 'react'

// ============================================================================
// Global Event Deduplicator
// ============================================================================

const DEBOUNCE_MS = 1000 // 1-second deduplication per PRD

class EventDeduplicatorSingleton {
  private lastClickTimes = new Map<string, number>()
  private inProgress = new Set<string>()

  canExecute(actionKey: string): boolean {
    const now = Date.now()
    const lastClick = this.lastClickTimes.get(actionKey) || 0

    // 1-second debounce
    if (now - lastClick < DEBOUNCE_MS) {
      console.warn(`Action ${actionKey} clicked too rapidly`)
      return false
    }

    // Already in progress
    if (this.inProgress.has(actionKey)) {
      console.warn(`Action ${actionKey} already in progress`)
      return false
    }

    return true
  }

  markStart(actionKey: string): void {
    this.lastClickTimes.set(actionKey, Date.now())
    this.inProgress.add(actionKey)
  }

  markEnd(actionKey: string): void {
    this.inProgress.delete(actionKey)
  }

  isInProgress(actionKey: string): boolean {
    return this.inProgress.has(actionKey)
  }

  reset(): void {
    this.lastClickTimes.clear()
    this.inProgress.clear()
  }
}

export const eventDeduplicator = new EventDeduplicatorSingleton()

// ============================================================================
// React Hook: useDeduplicatedAction
// ============================================================================

export function useDeduplicatedAction(actionKey: string) {
  const abortRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (action: () => Promise<void>) => {
    if (!eventDeduplicator.canExecute(actionKey)) return

    // Cancel any previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    eventDeduplicator.markStart(actionKey)

    try {
      await action()
    } finally {
      eventDeduplicator.markEnd(actionKey)
      abortRef.current = null
    }
  }, [actionKey])

  const isInProgress = useCallback(() => {
    return eventDeduplicator.isInProgress(actionKey)
  }, [actionKey])

  return { execute, isInProgress }
}

// ============================================================================
// React Hook: useCheckoutHandler
// ============================================================================

export function useCheckoutHandler(onCheckout: () => Promise<void>) {
  const { execute, isInProgress } = useDeduplicatedAction('checkout')

  const handleCheckout = useCallback(async () => {
    await execute(onCheckout)
  }, [execute, onCheckout])

  return { handleCheckout, isProcessing: isInProgress }
}

// ============================================================================
// React Hook: useCancelHandler
// ============================================================================

export function useCancelHandler(onCancel: () => Promise<void>) {
  const { execute, isInProgress } = useDeduplicatedAction('cancel')

  const handleCancel = useCallback(async () => {
    await execute(onCancel)
  }, [execute, onCancel])

  return { handleCancel, isProcessing: isInProgress }
}

// ============================================================================
// React Hook: useApproveHandler
// ============================================================================

export function useApproveHandler(onApprove: () => Promise<void>) {
  const { execute, isInProgress } = useDeduplicatedAction('approve')

  const handleApprove = useCallback(async () => {
    await execute(onApprove)
  }, [execute, onApprove])

  return { handleApprove, isProcessing: isInProgress }
}

// ============================================================================
// React Hook: useRetryHandler
// ============================================================================

export function useRetryHandler(onRetry: () => Promise<void>) {
  const { execute, isInProgress } = useDeduplicatedAction('retry')

  const handleRetry = useCallback(async () => {
    await execute(onRetry)
  }, [execute, onRetry])

  return { handleRetry, isProcessing: isInProgress }
}
