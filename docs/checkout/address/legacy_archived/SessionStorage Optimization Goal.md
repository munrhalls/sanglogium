# Address Slice Modification: SessionStorage Optimization

## Current Goal (from PRD.md)
User validates shipping address via Google API, saves verified address to basket reservation document, and proceeds to shipping selection.

## Modified Goal
User validates shipping address via Google API, saves verified address to basket reservation document AND to sessionStorage, and proceeds to shipping selection.

**Purpose**: Eliminate CMS round trip on shipping page for shippingAddress fetch, reducing shipping page latency from 2 sequential round trips to 1.

---

## Current Implementation Status

**Completed** (from code trace):
- ✅ Google API server action (submitShippingAction) works
- ✅ Basket reservation schema supports shippingAddress field
- ✅ PATCH endpoint exists at `/api/basket-reservations/[id]`
- ✅ Address slice integrated with Google API (validateShipping function in layout.tsx)
- ✅ Redirect to shipping page on success
- ✅ Integration tests exist (address-slice.test.ts)
- ✅ E2E tests exist (address-flow.spec.ts)

**Missing**:
- ❌ shippingAddress saved to sessionStorage after CMS save

---

## Modified Flow

**Current Flow**:
```
User submits address
  → validateShipping() called
  → submitShippingAction() (Google API validation)
  → PATCH /api/basket-reservations/[id] (save to CMS)
  → setShippingAddress() (React state)
  → router.push("/checkout/shipping")
```

**Modified Flow**:
```
User submits address
  → validateShipping() called
  → submitShippingAction() (Google API validation)
  → PATCH /api/basket-reservations/[id] (save to CMS)
  → sessionStorage.setItem("shippingAddress", JSON.stringify(validation.address)) ← NEW
  → setShippingAddress() (React state)
  → router.push("/checkout/shipping")
```

---

## Task Decomposition

### Task 1: Add sessionStorage save to address slice

**File**: `app/(store)/checkout/layout.tsx`

**Change**: In `validateShipping` function, after successful PATCH to CMS, add:
```typescript
sessionStorage.setItem("shippingAddress", JSON.stringify(validation.address));
```

**Location**: After line 68 (after `if (!patchRes.ok)` check), before `setShippingAPIValidation("CONFIRMED")`

**Verification**:
- Manual test: Submit address form, check browser dev tools → Application → Session Storage → verify shippingAddress key exists
- Integration test: Update address-slice.test.ts to verify sessionStorage set

---

### Task 2: Update shipping page to read from sessionStorage

**File**: `app/(store)/checkout/shipping/page.tsx`

**Change**: Modify `fetchShippingOptions` function to:
1. Read shippingAddress from sessionStorage first
2. If found, pass to `/api/shipping/rates` in request body
3. If not found, fall back to current behavior (fetch from CMS via basketReservationId)

**API Update**: Update `/api/shipping/rates` endpoint to accept optional shippingAddress in request body

**Verification**:
- Manual test: Navigate to shipping page, check network tab → verify request includes shippingAddress in body
- Integration test: Update shipping-rates.test.ts to test with/without sessionStorage

---

### Task 3: Update /api/shipping/rates to accept optional shippingAddress

**File**: `app/api/shipping/rates/route.ts`

**Change**: Modify GET endpoint to:
1. Accept optional `shippingAddress` in query params or request body
2. If shippingAddress provided, use it directly (skip CMS fetch for shippingAddress)
3. If not provided, fetch from CMS (current behavior)

**Verification**:
- Manual API test: Call endpoint with shippingAddress in body → verify response
- Integration test: Add test case for shippingAddress in request body

---

### Task 4: Add fallback for missing sessionStorage

**File**: `app/(store)/checkout/shipping/page.tsx`

**Change**: If sessionStorage missing shippingAddress, fall back to current behavior (fetch from CMS via basketReservationId)

**Rationale**: Handles edge cases (sessionStorage cleared, browser privacy mode, etc.)

**Verification**:
- Manual test: Clear sessionStorage, navigate to shipping page → verify still works
- Integration test: Test with missing sessionStorage

---

### Task 5: Update tests

**Files**:
- `tests/checkout/integration/address-slice.test.ts`
- `tests/checkout/integration/shipping-rates.test.ts`
- `tests/checkout/e2e/address-flow.spec.ts`

**Changes**:
- Add sessionStorage verification to address slice test
- Add shippingAddress in request body test to shipping rates test
- Update E2E test to verify sessionStorage flow

---

## Risk Assessment

**Low Risk**:
- sessionStorage is well-supported across browsers
- Fallback to CMS fetch exists if sessionStorage missing
- Minimal code change (1 line in address slice)

**Edge Cases**:
- SessionStorage cleared by user: Fallback to CMS fetch
- Browser privacy mode: Fallback to CMS fetch
- Data divergence: CMS is source of truth, sessionStorage is cache

---

## Definition of Done

- [ ] shippingAddress saved to sessionStorage after CMS save (layout.tsx)
- [ ] shipping page reads shippingAddress from sessionStorage
- [ ] /api/shipping/rates accepts optional shippingAddress in request body
- [ ] Fallback to CMS fetch if sessionStorage missing
- [ ] Integration tests updated and passing
- [ ] E2E tests updated and passing
- [ ] Manual verification: Submit address, check sessionStorage, navigate to shipping, verify options load
