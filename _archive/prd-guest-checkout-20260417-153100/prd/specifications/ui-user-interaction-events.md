# UI User Interaction Events Specification

## Event Overview

The UI must handle user interactions with strict deduplication to prevent double requests. All events must be debounced and have request deduplication at the UI level.

## Core UI Events

### 1. Checkout Button Click Event

```typescript
interface CheckoutClickEvent {
  type: 'checkout'
  element: HTMLButtonElement
  timestamp: number
  userAction: 'click' | 'keypress'
}

// Event Handler Implementation
export const useCheckoutHandler = () => {
  const { reservedBasket, isLoading, operationInProgress } = useReservedBasketStore()
  const { clientBasket } = useClientBasketStore()
  
  // Deduplication state
  const [lastClickTime, setLastClickTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleCheckout = useCallback(async (event: CheckoutClickEvent) => {
    // 1. Prevent double clicks
    const now = Date.now()
    if (now - lastClickTime < 1000) { // 1 second debounce
      console.warn('Checkout button clicked too rapidly')
      return
    }
    setLastClickTime(now)
    
    // 2. Check if already processing
    if (isProcessing || isLoading || operationInProgress) {
      console.warn('Checkout operation already in progress')
      return
    }
    
    // 3. Validate client basket
    if (!clientBasket.products.length) {
      showError('Your basket is empty')
      return
    }
    
    // 4. Check for existing reserved basket
    if (reservedBasket) {
      // User modified basket after reservation
      const hasModifications = checkBasketModifications(clientBasket, reservedBasket)
      if (hasModifications) {
        // Show confirmation dialog
        const confirmed = await showModificationDialog()
        if (!confirmed) return
        
        // Rollback first, then create new reservation
        await handleReCheckout()
        return
      } else {
        // Proceed with existing reservation
        navigateToNextCheckoutSlice()
        return
      }
    }
    
    // 5. Create new reservation
    setIsProcessing(true)
    try {
      await createReservation(clientBasket)
      navigateToNextCheckoutSlice()
    } catch (error) {
      showError('Failed to create reservation')
    } finally {
      setIsProcessing(false)
    }
  }, [clientBasket, reservedBasket, isLoading, operationInProgress, lastClickTime])
  
  return { handleCheckout, isDisabled: isLoading || operationInProgress || isProcessing }
}

// React Component Usage
function CheckoutButton() {
  const { handleCheckout, isDisabled } = useCheckoutHandler()
  
  return (
    <button
      onClick={handleCheckout}
      disabled={isDisabled}
      className="checkout-button"
      data-testid="checkout-button"
    >
      {isDisabled ? 'Processing...' : 'Checkout'}
    </button>
  )
}
```

### 2. Cancel Button Click Event

```typescript
interface CancelClickEvent {
  type: 'cancel'
  element: HTMLButtonElement
  timestamp: number
  reservationToken: string
}

export const useCancelHandler = (reservationToken: string) => {
  const { setOperationInProgress } = useReservedBasketStore()
  const [isCancelling, setIsCancelling] = useState(false)
  const [lastCancelTime, setLastCancelTime] = useState(0)
  
  const handleCancel = useCallback(async (event: CancelClickEvent) => {
    // 1. Prevent double clicks
    const now = Date.now()
    if (now - lastCancelTime < 1000) {
      console.warn('Cancel button clicked too rapidly')
      return
    }
    setLastCancelTime(now)
    
    // 2. Check if already cancelling
    if (isCancelling) {
      console.warn('Cancel operation already in progress')
      return
    }
    
    // 3. Show confirmation dialog
    const confirmed = await showCancelConfirmation()
    if (!confirmed) return
    
    // 4. Execute rollback
    setIsCancelling(true)
    setOperationInProgress(true)
    
    try {
      await rollbackReservation(reservationToken)
      clearReservedBasket()
      showSuccess('Reservation cancelled')
    } catch (error) {
      if (error.code === 'OPERATION_IN_PROGRESS') {
        showError('Cannot cancel: operation already in progress')
      } else {
        showError('Failed to cancel reservation')
      }
    } finally {
      setIsCancelling(false)
      setOperationInProgress(false)
    }
  }, [reservationToken, isCancelling, lastCancelTime])
  
  return { handleCancel, isCancelling }
}
```

### 3. Approve Button Click Event (Stock Decrements)

```typescript
interface ApproveClickEvent {
  type: 'approve'
  element: HTMLButtonElement
  timestamp: number
  reservedBasket: ReservedBasket
}

export const useApproveHandler = (reservedBasket: ReservedBasket) => {
  const [isApproving, setIsApproving] = useState(false)
  const [lastApproveTime, setLastApproveTime] = useState(0)
  
  const handleApprove = useCallback(async (event: ApproveClickEvent) => {
    // 1. Prevent double clicks
    const now = Date.now()
    if (now - lastApproveTime < 1000) {
      console.warn('Approve button clicked too rapidly')
      return
    }
    setLastApproveTime(now)
    
    // 2. Check if already approving
    if (isApproving) {
      console.warn('Approve operation already in progress')
      return
    }
    
    // 3. Show stock decrement details
    const confirmed = await showStockDecrementDialog(reservedBasket)
    if (!confirmed) return
    
    // 4. Proceed to next checkout slice
    setIsApproving(true)
    try {
      await approveReservation(reservedBasket.reservationToken)
      navigateToNextCheckoutSlice()
    } catch (error) {
      showError('Failed to approve reservation')
    } finally {
      setIsApproving(false)
    }
  }, [reservedBasket, isApproving, lastApproveTime])
  
  return { handleApprove, isApproving }
}
```

### 4. Retry Button Click Event

```typescript
interface RetryClickEvent {
  type: 'retry'
  element: HTMLButtonElement
  timestamp: number
  originalRequest: any
  retryCount: number
}

export const useRetryHandler = (originalRequest: any, maxRetries = 3) => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastRetryTime, setLastRetryTime] = useState(0)
  
  const handleRetry = useCallback(async (event: RetryClickEvent) => {
    // 1. Check retry limit
    if (retryCount >= maxRetries) {
      showError('Maximum retry attempts exceeded')
      return
    }
    
    // 2. Prevent rapid retries
    const now = Date.now()
    if (now - lastRetryTime < 2000) { // 2 second debounce for retries
      console.warn('Retry attempted too quickly')
      return
    }
    setLastRetryTime(now)
    
    // 3. Execute retry
    setIsRetrying(true)
    try {
      await retryRequest(originalRequest)
      setRetryCount(0) // Reset on success
      showSuccess('Request completed successfully')
    } catch (error) {
      setRetryCount(prev => prev + 1)
      if (retryCount + 1 >= maxRetries) {
        showError('Failed after maximum retry attempts')
      } else {
        showError(`Request failed, retrying... (${retryCount + 1}/${maxRetries})`)
      }
    } finally {
      setIsRetrying(false)
    }
  }, [originalRequest, retryCount, maxRetries, lastRetryTime])
  
  return { handleRetry, isRetrying, retryCount, canRetry: retryCount < maxRetries }
}
```

## Event Deduplication System

```typescript
class EventDeduplicator {
  private static instance: EventDeduplicator
  private eventQueue = new Map<string, number>()
  private readonly DEBOUNCE_TIME = 1000 // 1 second
  
  static getInstance(): EventDeduplicator {
    if (!EventDeduplicator.instance) {
      EventDeduplicator.instance = new EventDeduplicator()
    }
    return EventDeduplicator.instance
  }
  
  shouldProcessEvent(eventType: string, elementId: string): boolean {
    const key = `${eventType}-${elementId}`
    const now = Date.now()
    const lastProcessed = this.eventQueue.get(key)
    
    if (lastProcessed && (now - lastProcessed) < this.DEBOUNCE_TIME) {
      return false
    }
    
    this.eventQueue.set(key, now)
    
    // Clean up old entries
    setTimeout(() => {
      this.eventQueue.delete(key)
    }, this.DEBOUNCE_TIME * 2)
    
    return true
  }
  
  // Reset all event tracking (useful for testing)
  reset(): void {
    this.eventQueue.clear()
  }
}

// Higher-order component for event deduplication
export function withEventDeduplication<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  eventType: string
) {
  return function DeduplicatedComponent(props: T) {
    const deduplicator = EventDeduplicator.getInstance()
    const elementId = props.id || props['data-testid'] || 'unknown'
    
    const enhancedProps = {
      ...props,
      onClick: (event: React.MouseEvent) => {
        if (!deduplicator.shouldProcessEvent(eventType, elementId)) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
        
        if (props.onClick) {
          props.onClick(event)
        }
      }
    }
    
    return <Component {...enhancedProps} />
  }
}
```

## UI State Management

```typescript
// UI State Store Slice
interface UIState {
  // Button states
  checkoutButton: {
    isDisabled: boolean
    isLoading: boolean
    lastClickTime: number
  }
  cancelButton: {
    isDisabled: boolean
    isLoading: boolean
    lastClickTime: number
  }
  approveButton: {
    isDisabled: boolean
    isLoading: boolean
    lastClickTime: number
  }
  retryButton: {
    isDisabled: boolean
    isLoading: boolean
    retryCount: number
    lastRetryTime: number
  }
  
  // Modal states
  showModificationDialog: boolean
  showCancelConfirmation: boolean
  showStockDecrementDialog: boolean
  
  // Notification states
  notification: {
    type: 'success' | 'error' | 'warning' | null
    message: string
    visible: boolean
  }
}

const useUIStateStore = create<UIState>((set) => ({
  // Initial button states
  checkoutButton: {
    isDisabled: false,
    isLoading: false,
    lastClickTime: 0
  },
  cancelButton: {
    isDisabled: false,
    isLoading: false,
    lastClickTime: 0
  },
  approveButton: {
    isDisabled: false,
    isLoading: false,
    lastClickTime: 0
  },
  retryButton: {
    isDisabled: false,
    isLoading: false,
    retryCount: 0,
    lastRetryTime: 0
  },
  
  // Modal states
  showModificationDialog: false,
  showCancelConfirmation: false,
  showStockDecrementDialog: false,
  
  // Notification state
  notification: {
    type: null,
    message: '',
    visible: false
  },
  
  // Actions
  setCheckoutButtonState: (state) => set((prev) => ({ 
    checkoutButton: { ...prev.checkoutButton, ...state } 
  })),
  
  setCancelButtonState: (state) => set((prev) => ({ 
    cancelButton: { ...prev.cancelButton, ...state } 
  })),
  
  setApproveButtonState: (state) => set((prev) => ({ 
    approveButton: { ...prev.approveButton, ...state } 
  })),
  
  setRetryButtonState: (state) => set((prev) => ({ 
    retryButton: { ...prev.retryButton, ...state } 
  })),
  
  showNotification: (type, message) => set({
    notification: { type, message, visible: true }
  }),
  
  hideNotification: () => set((prev) => ({
    notification: { ...prev.notification, visible: false }
  }))
}))
```

## Modal Dialog Implementations

```typescript
// Modification Dialog
function ModificationDialog({ reservedBasket, onConfirm, onCancel }) {
  const hasDecrements = reservedBasket.products.some(p => 
    p.reservedQuantity < p.requestedQuantity
  )
  
  const hasOutOfStock = reservedBasket.products.some(p => 
    p.reservedQuantity === 0
  )
  
  return (
    <Modal isOpen={true} onClose={onCancel}>
      <div className="modification-dialog">
        <h2>Basket Updated</h2>
        
        {hasOutOfStock ? (
          <div className="out-of-stock-message">
            <p>We apologize - some products are now out of stock.</p>
          </div>
        ) : hasDecrements ? (
          <div className="decrement-message">
            <p>We've had to revise your basket based on latest inventory check.</p>
            <ul>
              {reservedBasket.products.map(product => (
                <li key={product.id}>
                  {product.name}: {product.requestedQuantity} -> {product.reservedQuantity}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="no-changes-message">
            <p>Your basket is available as requested.</p>
          </div>
        )}
        
        <div className="dialog-actions">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="approve-button"
            disabled={hasOutOfStock}
          >
            {hasOutOfStock ? 'Out of Stock' : 'Approve & Proceed'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Cancel Confirmation Dialog
function CancelConfirmationDialog({ onConfirm, onCancel }) {
  return (
    <Modal isOpen={true} onClose={onCancel}>
      <div className="cancel-confirmation-dialog">
        <h2>Cancel Reservation</h2>
        <p>Are you sure you want to cancel your reservation? This will release all reserved items back to inventory.</p>
        
        <div className="dialog-actions">
          <button onClick={onCancel} className="keep-button">
            Keep Reservation
          </button>
          <button onClick={onConfirm} className="cancel-button">
            Cancel Reservation
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

## Error Handling and Notifications

```typescript
// Notification System
export function useNotificationSystem() {
  const { notification, showNotification, hideNotification } = useUIStateStore()
  
  const showError = useCallback((message: string) => {
    showNotification('error', message)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification()
    }, 5000)
  }, [showNotification, hideNotification])
  
  const showSuccess = useCallback((message: string) => {
    showNotification('success', message)
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideNotification()
    }, 3000)
  }, [showNotification, hideNotification])
  
  const showWarning = useCallback((message: string) => {
    showNotification('warning', message)
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      hideNotification()
    }, 4000)
  }, [showNotification, hideNotification])
  
  return { showError, showSuccess, showWarning, notification }
}

// Notification Component
function Notification({ notification }) {
  if (!notification.visible) return null
  
  const className = `notification notification-${notification.type}`
  
  return (
    <div className={className}>
      <div className="notification-content">
        {notification.type === 'error' && <ErrorIcon />}
        {notification.type === 'success' && <SuccessIcon />}
        {notification.type === 'warning' && <WarningIcon />}
        
        <span className="notification-message">
          {notification.message}
        </span>
      </div>
      
      <button 
        onClick={() => hideNotification()}
        className="notification-close"
      >
        ×
      </button>
    </div>
  )
}
```

## Accessibility Considerations

```typescript
// Accessible Button Component
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  'data-testid': testId,
  ...props
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled || loading) {
      event.preventDefault()
      return
    }
    
    onClick?.(event)
  }, [onClick, disabled, loading])
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      buttonRef.current?.click()
    }
  }, [])
  
  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      data-testid={testId}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="button-loading">
          <LoadingSpinner />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
```

## Testing Utilities

```typescript
// Test helpers for UI events
export const createMockEvent = (type: string, properties = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { id: 'test-button' },
  currentTarget: { id: 'test-button' },
  type,
  ...properties
})

export const simulateUserClick = (element: HTMLElement, options = {}) => {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    ...options
  })
  element.dispatchEvent(event)
}

export const waitForButtonState = (button: HTMLElement, state: 'disabled' | 'enabled') => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (state === 'disabled' && button.disabled) {
        observer.disconnect()
        resolve(true)
      } else if (state === 'enabled' && !button.disabled) {
        observer.disconnect()
        resolve(true)
      }
    })
    
    observer.observe(button, { attributes: true, attributeFilter: ['disabled'] })
  })
}
```
