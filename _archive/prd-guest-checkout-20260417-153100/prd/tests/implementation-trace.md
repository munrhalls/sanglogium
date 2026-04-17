# Implementation Trace - Guest Checkout Inventory Reservation

## UI Components to Implement

### 1. Checkout Button with Deduplication
**Location**: `app/(store)/basket/CheckoutButton.tsx`
**Current State**: 
- Has basic checkout button
- Uses `usePreCheckout` hook
- State management: IDLE, PROCESSING, ERROR_NETWORK, ERROR_VALIDATION
- Missing: Deduplication logic for multiple clicks

**Implementation Needed**:
- Add deduplication flag to prevent multiple submissions
- Disable button during processing
- Show loading state
- Handle idempotency key generation

### 2. Cancel Button with Confirmation
**Current State**:
- Cancel URL handling exists in `BasketPage.tsx` (line 18-21)
- Stripe webhook handles payment_intent.canceled (line 196-203)
- Missing: UI cancel button with confirmation dialog

**Implementation Needed**:
- Add cancel button component
- Confirmation modal/dialog
- Integration with reservation rollback
- Update UI state on cancel

### 3. Reserved Basket Display
**Current State**:
- Basket summary exists in `BasketSummary.tsx`
- Stock verification in `verifyBasketStock.ts`
- Missing: Visual indication of reserved items

**Implementation Needed**:
- Show reserved status next to items
- Display reservation timer/TTL
- Visual indicator for out-of-stock items
- Real-time stock updates

### 4. Stock Decrement/Out of Stock Messages
**Current State**:
- Stock verification logic exists
- `reservedStock` field implemented
- Missing: User-facing messages

**Implementation Needed**:
- Show "Last items available!" messages
- Display "Out of stock" for unavailable items
- Update stock count in real-time
- Handle reservation conflicts

### 5. Operation in Progress Message
**Current State**:
- "Connecting..." message in CheckoutButton.tsx (line 29)
- Processing state exists
- Missing: Detailed progress indicators

**Implementation Needed**:
- Multi-step progress indicator
- "Reserving items..." message
- "Processing payment..." message
- Error recovery messages

## Integration Layer to Implement

### 1. Connect UI to API Endpoints
**Current API Endpoints**:
- `/api/checkout/route.ts` - Main checkout endpoint
- `/api/webhooks/stripe/route.ts` - Stripe webhooks
- `validateBasket.ts` - Basket validation
- `reserveStock.ts` - Stock reservation

**Missing Connections**:
- UI doesn't call reservation API directly
- No real-time stock updates
- Missing error state propagation
- No loading state management

**Implementation Needed**:
- Direct API calls from UI components
- WebSocket or polling for real-time updates
- Error boundary implementation
- Loading state management

### 2. Handle Error States
**Current Error Handling**:
- Basic error states in CheckoutButton
- Network and validation errors
- Missing: Granular error handling

**Implementation Needed**:
- Specific error messages for each failure type
- Retry buttons for failed operations
- Graceful degradation for network issues
- User-friendly error explanations

### 3. Implement Retry Logic
**Current State**:
- No retry mechanism in UI
- Server has idempotency key support
- Missing: Client-side retry logic

**Implementation Needed**:
- Exponential backoff for retries
- Max retry limits
- User-initiated retry buttons
- Preserve form state during retries

## Files Marked for Deletion (Revert Changes)

### Redis-Related Changes
1. `scripts/test-redis-connection.cjs` - DELETE
2. `scripts/migrate-reserved-stock-field.cjs` - DELETE  
3. `_project/prd/tests/redis-connection-fix-plan.md` - DELETE
4. Package: `@upstash/redis` - UNINSTALL
5. `scripts/verify-test-env-simple.cjs` - RESTORE to original

### Schema Changes
1. `reservedStock` field additions - REVERT (already exists in schema)
2. Product migrations - REVERT

### Test Data
1. Test products created - KEEP (needed for tests)
2. Stripe test price created - KEEP (needed for tests)

## Implementation Priority

1. **High Priority** (Core functionality):
   - Checkout button deduplication
   - API endpoint connections
   - Error state handling

2. **Medium Priority** (User experience):
   - Stock messages
   - Progress indicators
   - Cancel functionality

3. **Low Priority** (Enhancements):
   - Real-time updates
   - Advanced retry logic
   - Reservation timers

## Notes for Opus

- Start from clean slate (after reverting changes)
- Use existing components as reference
- Implement PRD-compliant reservation system
- Focus on UI components first, then integration
- Maintain existing basket/store structure
