# Zustand Store Slice Test Specification

## Test Overview
Tests the Zustand store for managing reserved basket state, ensuring proper persistence, state transitions, and event deduplication.

## Test 1: Store Initialization and Persistence

### Setup
- Clear localStorage
- Import useReservedBasketStore

### Test Steps
1. Verify initial state is empty (reservedBasket: null, isLoading: false, error: null)
2. Check computed properties (hasReservedBasket: false, basketStatus: 'none')
3. Verify localStorage is empty
4. Reload page and verify state persists as empty

### Verification
- Store initializes with correct default values
- Computed properties calculate correctly
- Persistence middleware works on initial load

## Test 2: Reserved Basket Creation and Persistence

### Setup
- Store in initial empty state
- Mock API response with reservation data

### Test Steps
1. Call setReservedBasket with valid reservation data
2. Verify state updates (reservedBasket populated, error cleared)
3. Check computed properties update (hasReservedBasket: true, basketStatus calculated)
4. Verify data persists to localStorage
5. Open new tab and verify state syncs from localStorage

### Verification
- State updates immutably (no direct mutations)
- Computed properties recalculate correctly
- Persistence saves only essential fields
- Cross-tab synchronization works

## Test 3: Loading and Operation States

### Setup
- Store with existing reservation

### Test Steps
1. Set loading state to true
2. Verify UI would show loading indicator
3. Set operationInProgress to true
4. Verify buttons would be disabled
5. Clear loading and operation states
6. Verify UI returns to normal state

### Verification
- Loading state tracks API calls
- Operation state prevents duplicate actions
- States can be set and cleared independently

## Test 4: Error Handling and Recovery

### Setup
- Store with existing reservation

### Test Steps
1. Set error with error message
2. Verify error state persists
3. Attempt new operation (should clear error)
4. Verify error is cleared on new action
5. Clear error manually
6. Verify error state is null

### Verification
- Errors are stored and displayed
- Errors clear on new operations
- Manual error clearing works

## Test 5: Event Deduplication

### Setup
- Store in initial state
- Mock slow API response

### Test Steps
1. Trigger checkout action twice rapidly
2. Verify only one request is sent
3. Check request queue prevents duplicates
4. Verify second action is ignored with warning
5. Wait for completion and verify queue clears

### Verification
- Duplicate requests are blocked
- Request queue tracks active operations
- Warning logged for blocked requests
- Queue clears on completion

## Test 6: Basket Status Calculation

### Setup
- Store in initial state

### Test Steps
1. Set basket with all products fully available
2. Verify basketStatus: 'full'
3. Set basket with some products decremented
4. Verify basketStatus: 'decremented'
5. Set basket with all products out of stock
6. Verify basketStatus: 'empty'
7. Clear basket
8. Verify basketStatus: 'none'

### Verification
- Status calculates based on product availability
- Status updates when basket changes
- Edge cases handled correctly

## Test 7: Store Actions and Selectors

### Setup
- Store with reservation data

### Test Steps
1. Test all selector hooks return correct values
2. Verify useBasketTotals calculates correctly
3. Check useBasketProducts returns product list
4. Test clearReservedBasket resets all state
5. Verify setOperationInProgress toggles correctly

### Verification
- Selectors are efficient and accurate
- Actions update state correctly
- Clear action resets everything

## Test 8: Cross-Tab Synchronization

### Setup
- Two browser tabs with same origin

### Test Steps
1. Create reservation in first tab
2. Verify second tab receives update via BroadcastChannel
3. Cancel reservation in second tab
4. Verify first tab receives update
5. Modify localStorage directly
6. Verify both tabs update

### Verification
- BroadcastChannel syncs state changes
- Manual localStorage changes trigger updates
- State stays consistent across tabs

## Test 9: Store Hydration and Migration

### Setup
- localStorage with old version data

### Test Steps
1. Set localStorage with v1 data structure
2. Load store and verify hydration works
3. Test migration from missing fields
4. Verify corrupted data doesn't crash store
5. Test version upgrade handling

### Verification
- Store hydrates from persisted data
- Missing fields handled gracefully
- Version migrations work correctly

## Test 10: Performance and Memory

### Setup
- Store with large reservation data

### Test Steps
1. Add 100 products to reservation
2. Verify performance remains acceptable
3. Check memory usage doesn't grow excessively
4. Test rapid state updates
5. Verify no memory leaks on clear

### Verification
- Store handles large datasets efficiently
- Memory management is proper
- Performance degrades gracefully
