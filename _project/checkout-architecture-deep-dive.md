# Checkout Architecture Deep Dive

## UX Slice 1: Basket Review - Full System Requirements

### User Flow
- Start: User views basket
- Bus Stops: Load basket, display checkout, click checkout, validate, navigate
- End: User lands on address page

### Under-the-Hood Requirements

#### 1. Reservation Contract
**Problem**: User clicks checkout, stock must be reserved
**Requirements**:
- Reserve stock before navigation
- Handle reservation failures
- Track reservation ID for rollback
- Expiration time management

#### 2. Rollback Contract
**Problem**: What happens if validation fails?
**Requirements**:
- Release reserved stock on validation failure
- Clean up temporary state
- Return to basket with error message
- Prevent double reservation attempts

#### 3. State Persistence Contract
**Problem**: User navigates away and back
**Requirements**:
- Persist reservation state across navigation
- Handle browser refresh
- Handle tab close/reopen
- Cleanup expired reservations

#### 4. Error Handling Contract
**Problem**: Multiple failure modes
**Requirements**:
- Network errors during validation
- Stock availability changes
- Invalid basket data
- Stripe service unavailable

#### 5. Navigation Contract
**Problem**: Navigation must be atomic
**Requirements**:
- Only navigate after successful reservation
- Prevent navigation on errors
- Handle back button correctly
- Maintain URL state

### System Events Required

#### User Events
- CLICK_CHECKOUT
- NAVIGATE_BACK
- REFRESH_PAGE

#### System Events
- VALIDATION_SUCCESS
- VALIDATION_FAILED
- RESERVATION_SUCCESS
- RESERVATION_FAILED
- STOCK_CHANGED
- NETWORK_ERROR

#### Side Effects
- validateBasket()
- reserveStock()
- router.push()
- showError()
- cleanupReservation()

### State Machine Design

#### States
- BASKET_IDLE
- BASKET_VALIDATING
- BASKET_RESERVED
- BASKET_ERROR
- NAVIGATING_TO_ADDRESS

#### Transitions
```
BASKET_IDLE
  --CLICK_CHECKOUT--> BASKET_VALIDATING

BASKET_VALIDATING
  --VALIDATION_SUCCESS--> BASKET_RESERVED
  --VALIDATION_FAILED--> BASKET_ERROR
  --NETWORK_ERROR--> BASKET_ERROR

BASKET_RESERVED
  --NAVIGATE_TO_ADDRESS--> NAVIGATING_TO_ADDRESS

BASKET_ERROR
  --RETRY_CHECKOUT--> BASKET_VALIDATING
  --UPDATE_BASKET--> BASKET_IDLE

NAVIGATING_TO_ADDRESS
  --NAVIGATION_SUCCESS--> (Next UX Slice)
  --NAVIGATION_FAILED--> BASKET_RESERVED
```

### API Contracts

#### validateBasket API
```typescript
Input: {
  items: Array<{_id: string, quantity: number}>
  idempotencyKey: string
}

Output: {
  success: boolean
  reservedItems?: Array<{productId: string, quantity: number}>
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

#### reserveStock API
```typescript
Input: {
  items: Array<{productId: string, quantity: number}>
  reservationId: string
  expiresAt: Date
}

Output: {
  success: boolean
  reservationId?: string
  error?: string
}
```

### Error Scenarios & Handling

#### E1: Stock Changed During Validation
**Detection**: validateBasket returns stock mismatch
**Handling**: 
- Release any partial reservations
- Show "Stock updated" message
- Refresh basket data
- Return to BASKET_IDLE

#### E2: Network Error During Validation
**Detection**: API call fails
**Handling**:
- Show "Network error" message
- Enable retry button
- Stay in BASKET_ERROR state
- Don't release reservations (none made yet)

#### E3: Reservation Partial Failure
**Detection**: Some items reserved, some failed
**Handling**:
- Release all partial reservations
- Show "Items unavailable" message
- Update basket to remove unavailable items
- Return to BASKET_IDLE

#### E4: Navigation Failure
**Detection**: router.push fails
**Handling**:
- Stay in BASKET_RESERVED state
- Retry navigation
- Show "Navigation error" if persistent
- Provide manual link

### Performance Requirements

#### Response Times
- validateBasket: < 2 seconds
- Navigation: < 1 second
- Error display: < 500ms

#### Concurrent Users
- Handle 100+ concurrent checkouts
- Prevent race conditions on stock
- Rate limiting per user

### Security Requirements

#### Idempotency
- Prevent duplicate reservations
- Handle retry attempts safely
- Unique checkout session IDs

#### Data Integrity
- Validate all input data
- Sanitize user inputs
- Prevent stock manipulation

---

## UX Slice 2: Address Entry - Full System Requirements

[Similar deep dive for address slice...]

---

## UX Slice 3: Payment - Full System Requirements

[Similar deep dive for payment slice...]

---

## UX Slice 4: Order Success - Full System Requirements

[Similar deep dive for success slice...]
