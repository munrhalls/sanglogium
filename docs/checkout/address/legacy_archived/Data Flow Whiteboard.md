# Address → Shipping Data Flow Whiteboard

**Problem**: Current design has 2 sequential round trips on shipping page (CMS fetch + Packlink API fetch), causing poor UX.

**Current Flow**:
```
Address Page:
1. User submits address
2. Google API validates address (round trip 1)
3. PATCH /api/basket-reservations/[id] saves shippingAddress to CMS (round trip 2)
4. Redirect to /checkout/shipping

Shipping Page:
5. GET /api/shipping/rates?basketReservationId={id} (round trip 3)
   - Fetches reservation from CMS (to get shippingAddress + basket)
   - Fetches product parcel data from CMS
   - Calls Packlink PRO API
6. Displays shipping options
```

**Total**: 3 round trips, with 2 sequential on shipping page.

---

## Design Options

### Option 1: Pass shippingAddress via sessionStorage

**Flow**:
```
Address Page:
1. User submits address
2. Google API validates address (round trip 1)
3. PATCH /api/basket-reservations/[id] saves shippingAddress to CMS (round trip 2)
4. Save shippingAddress to sessionStorage
5. Redirect to /checkout/shipping

Shipping Page:
6. Read shippingAddress from sessionStorage
7. GET /api/shipping/rates with shippingAddress in body (round trip 3)
   - Fetches basket from CMS (product IDs, quantities, verified prices)
   - Fetches product parcel data from CMS
   - Calls Packlink PRO API with passed shippingAddress
8. Displays shipping options
```

**Round Trips**: 3 (same as current, but shipping page only has 1 round trip)

**Pros**:
- Eliminates CMS fetch for shippingAddress on shipping page
- Shipping page has 1 round trip instead of 2
- Simpler API endpoint (doesn't need to fetch shippingAddress from CMS)

**Cons**:
- Still needs CMS fetch for basket data
- SessionStorage could be cleared/lost (rare but possible)
- shippingAddress in CMS and sessionStorage could diverge

**Risk Mitigation**:
- If sessionStorage missing, fallback to CMS fetch
- Always save to CMS as source of truth
- SessionStorage is optimization, not requirement

---

### Option 2: Fetch shipping options on address page

**Flow**:
```
Address Page:
1. User submits address
2. Google API validates address (round trip 1)
3. PATCH /api/basket-reservations/[id] saves shippingAddress to CMS (round trip 2)
4. Fetch basket from CMS (round trip 3)
5. Fetch product parcel data from CMS (round trip 4)
6. Call Packlink PRO API (round trip 5)
7. Save shippingOptions to CMS or sessionStorage
8. Redirect to /checkout/shipping

Shipping Page:
9. Read shippingOptions from CMS or sessionStorage
10. Displays shipping options instantly
```

**Round Trips**: 5 on address page, 0 on shipping page

**Pros**:
- Shipping page loads instantly (options pre-fetched)
- Best perceived performance for shipping page

**Cons**:
- Address page becomes much slower (5 round trips)
- User might change address after seeing options (rare but possible)
- Shipping options might expire between address and shipping pages
- More complex state management

**Risk Mitigation**:
- Show loading state on address page
- Cache shipping options with short TTL
- Re-fetch if expired

---

### Option 3: Combine CMS fetch + Packlink API into single endpoint

**Flow**:
```
Address Page:
1. User submits address
2. Google API validates address (round trip 1)
3. PATCH /api/basket-reservations/[id] saves shippingAddress to CMS (round trip 2)
4. Redirect to /checkout/shipping

Shipping Page:
5. GET /api/shipping/rates?basketReservationId={id} (round trip 3)
   - Fetches reservation from CMS (shippingAddress + basket)
   - Fetches product parcel data from CMS
   - Calls Packlink PRO API
   - All in a single backend operation
6. Displays shipping options
```

**Round Trips**: 3 (same as current, but backend handles all fetches in parallel)

**Pros**:
- No change to frontend
- Backend can optimize parallel fetches (CMS + Packlink API)
- Simplest frontend implementation

**Cons**:
- Still 2 sequential operations on backend (CMS fetch + Packlink API)
- Frontend still waits for both to complete
- Doesn't solve the fundamental problem

**Risk Mitigation**:
- Backend can use Promise.all for parallel fetches where possible
- Add caching for CMS data

---

### Option 4: Hybrid - sessionStorage for shippingAddress, parallel fetch for basket

**Flow**:
```
Address Page:
1. User submits address
2. Google API validates address (round trip 1)
3. PATCH /api/basket-reservations/[id] saves shippingAddress to CMS (round trip 2)
4. Save shippingAddress to sessionStorage
5. Redirect to /checkout/shipping

Shipping Page:
6. Read shippingAddress from sessionStorage
7. In parallel:
   - Fetch basket from CMS (round trip 3a)
   - Fetch product parcel data from CMS (round trip 3b)
8. Call Packlink PRO API with shippingAddress + parcel data (round trip 4)
9. Displays shipping options
```

**Round Trips**: 4 total, but 2 parallel on shipping page

**Pros**:
- Eliminates CMS fetch for shippingAddress
- Parallel fetches for basket + parcel data
- Better perceived performance

**Cons**:
- More complex frontend logic
- Still need to handle sessionStorage missing
- More round trips overall (but parallel)

**Risk Mitigation**:
- Fallback to CMS fetch if sessionStorage missing
- Error handling for failed parallel fetches

---

### Option 5: Single combined API endpoint with all data

**Flow**:
```
Address Page:
1. User submits address
2. Google API validates address (round trip 1)
3. POST /api/checkout/validate-address with address data (round trip 2)
   - Validates address (Google API)
   - Saves shippingAddress to CMS
   - Fetches basket from CMS
   - Fetches product parcel data from CMS
   - Calls Packlink PRO API
   - Returns shipping options
4. Save shippingAddress + shippingOptions to sessionStorage
5. Redirect to /checkout/shipping

Shipping Page:
6. Read shippingOptions from sessionStorage
7. Displays shipping options instantly
8. On selection: PATCH /api/basket-reservations/[id] with shippingChoice
```

**Round Trips**: 2 on address page, 0 on shipping page

**Pros**:
- Address page handles all backend operations in one call
- Shipping page loads instantly
- Best UX (fast shipping page)
- Single source of truth (CMS)

**Cons**:
- Address page slower (but only 2 round trips total)
- More complex backend endpoint
- Need to handle all error cases in one place

**Risk Mitigation**:
- Show loading state on address page
- Clear error messages for each failure mode
- Fallback to individual operations if combined endpoint fails

---

## UX Impact Comparison

| Option | Address Page RT | Shipping Page RT | Total RT | Shipping Page Latency | Perceived Performance | Complexity |
|--------|----------------|-------------------|----------|----------------------|----------------------|------------|
| Current | 2 | 2 (sequential) | 4 | High (2 sequential) | Poor | Low |
| Option 1 | 2 | 1 | 3 | Medium | Good | Low |
| Option 2 | 5 | 0 | 5 | Zero | Excellent (shipping) / Poor (address) | High |
| Option 3 | 2 | 1 (backend parallel) | 3 | Medium | Good | Low |
| Option 4 | 2 | 2 (parallel) | 4 | Medium | Good | Medium |
| Option 5 | 2 | 0 | 2 | Zero | Excellent | Medium |

**RT = Round Trip**

---

## Recommendation: Option 1 (sessionStorage for shippingAddress)

**Rationale**:
1. **Simplest implementation**: Minimal code changes
2. **Good UX**: Reduces shipping page from 2 sequential round trips to 1
3. **Low risk**: SessionStorage is reliable fallback to CMS fetch
4. **Maintains data integrity**: CMS remains source of truth
5. **Easy to rollback**: Can disable sessionStorage optimization if issues arise

**Implementation Steps**:
1. Address page: Save shippingAddress to sessionStorage after CMS save
2. Shipping page: Read shippingAddress from sessionStorage
3. Update `/api/shipping/rates` to accept optional shippingAddress in request body
4. If shippingAddress provided, use it; otherwise fetch from CMS
5. Add fallback: if sessionStorage missing, fetch from CMS

**Risk Mitigation**:
- SessionStorage cleared/lost: Fallback to CMS fetch (existing behavior)
- Data divergence: CMS is source of truth, sessionStorage is cache
- Browser privacy mode: Fallback to CMS fetch

**Alternative if higher performance needed**: Option 5 (combined endpoint) but only if Option 1 proves insufficient.

---

## Next Steps

1. Implement Option 1
2. Measure shipping page load time
3. If still slow, consider Option 5
4. A/B test different approaches if performance is critical
