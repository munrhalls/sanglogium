# Task Decomposition: Shipping Slice

**Goal**: User views available shipping options, selects preferred shipping method, and proceeds to payment.

**Pattern Reference**: `_project/patterns/migration/task-decomposition.md`

---

## Current State Assessment

**Implementation Status**: FULLY IMPLEMENTED

- ✓ Schema: `shippingChoice` field exists in `basketReservationType.ts`
- ✓ API: GET `/api/shipping/rates` endpoint fully implemented (Packlink PRO API + fallback)
- ✓ API: PATCH `/api/basket-reservations/[id]` supports `shippingChoice` updates
- ✓ Frontend: `/checkout/shipping/page.tsx` fully implemented (options display, selection, error handling)
- ✓ Tests: E2E test `shipping-page.spec.ts` written
- ✓ Documentation: README, PRD, Technical Design, UX requirements complete

**Task Decomposition Purpose**: Verification and validation of existing implementation, not new implementation.

---

## Task Decomposition (Verification-Focused)

### Step 1: Verify Pre-requirements Met

**Objective**: Confirm all dependencies are in place before verification testing.

**Actions**:
1. Verify address slice completed (shippingAddress field in basket reservation)
2. Verify Packlink PRO API account and API key configured
3. Verify product parcel data exists in Sanity CMS
4. Verify PATCH endpoint for basket reservation updates exists

**Verification Commands**:
```bash
# Check parcel data exists
node scripts/verify-parcel-data.mjs

# Check API key configured
echo $PACKLINK_API_KEY

# Check schema has shippingAddress and shippingChoice
grep -r "shippingAddress" sanity-cms/schemaTypes/basketReservationType.ts
grep -r "shippingChoice" sanity-cms/schemaTypes/basketReservationType.ts
```

**Risks**:
- **Risk**: Parcel data missing for some products
  - **Contingency**: Run parcel migration script (`scripts/migrations/parcel-migration/add-parcel-data.mjs`)
- **Risk**: Packlink API key not configured
  - **Contingency**: Configure environment variable or use mock fallback (already implemented)
- **Risk**: Address slice not completed
  - **Contingency**: Complete address slice sprint first (sprint 07_address_slice.md)

**Success Criteria**: All pre-requirements verified or contingencies executed.

---

### Step 2: Verify API Endpoint Functionality

**Objective**: Confirm GET `/api/shipping/rates` endpoint works correctly with real data.

**Actions**:
1. Create test basket reservation with valid shippingAddress and basketReservation
2. Call GET `/api/shipping/rates?basketReservationId={id}`
3. Verify response structure: `{ options: ShippingOption[] }`
4. Verify error handling for missing address, empty basket, invalid reservation

**Verification Commands**:
```bash
# Manual API test
curl "http://localhost:3000/api/shipping/rates?basketReservationId={test-id}"
```

**Risks**:
- **Risk**: Packlink PRO API returns no rates
  - **Contingency**: Verify fallback to mock rates for Poland domestic (Tier 2)
- **Risk**: Sender address not configured for destination country
  - **Contingency**: Configure SENDER_ADDRESS_{COUNTRY}_* environment variables
- **Risk**: Product parcel data missing
  - **Contingency**: Run parcel migration script (Step 1)

**Success Criteria**: API returns valid shipping options or appropriate error with errorClass.

---

### Step 3: Verify PATCH Endpoint Updates shippingChoice

**Objective**: Confirm PATCH `/api/basket-reservations/[id]` correctly saves shippingChoice.

**Actions**:
1. Create test basket reservation
2. Call PATCH with shippingChoice payload
3. Verify document updated in Sanity CMS
4. Verify response returns success

**Verification Commands**:
```bash
# Manual PATCH test
curl -X PATCH "http://localhost:3000/api/basket-reservations/{id}" \
  -H "Content-Type: application/json" \
  -d '{"shippingChoice": {"provider": "DHL", "serviceLevel": "Express", "rateId": "test", "amount": 1500, "currency": "PLN", "estimatedDays": 2}}'
```

**Risks**:
- **Risk**: PATCH endpoint rejects shippingChoice
  - **Contingency**: Verify endpoint code supports shippingChoice field (already implemented)
- **Risk**: Sanity write permissions issue
  - **Contingency**: Verify SANITY_STUDIO_READ_WRITE token has write permissions

**Success Criteria**: shippingChoice saved to reservation document, API returns 200.

---

### Step 4: Verify Frontend Page Renders Options

**Objective**: Confirm `/checkout/shipping` page displays shipping options correctly.

**Actions**:
1. Create test basket reservation with valid shippingAddress
2. Inject basketReservationId into sessionStorage
3. Navigate to `/checkout/shipping` in browser
4. Verify loading state displays
5. Verify shipping options list displays (provider, service level, price, delivery estimate)
6. Verify selection state (border color change on click)
7. Verify error states (no options, API failure)

**Verification Commands**:
```bash
# Run E2E test
npx playwright test app/(store)/checkout/shipping/shipping-page.spec.ts
```

**Risks**:
- **Risk**: Page shows address form instead of shipping options (old implementation)
  - **Contingency**: Verify page.tsx is the shipping options implementation (already confirmed)
- **Risk**: Options not displaying due to API error
  - **Contingency**: Check browser console for error messages, verify API endpoint (Step 2)
- **Risk**: Session storage key mismatch
  - **Contingency**: Verify page uses `basketReservationId` (already confirmed in code)

**Success Criteria**: Page displays shipping options, user can select option, continue button enables.

---

### Step 5: Verify End-to-End Flow

**Objective**: Confirm complete flow from address validation to payment redirect.

**Actions**:
1. Start from basket page with products
2. Complete address validation (address slice)
3. Navigate to shipping page
4. Verify shipping options load
5. Select shipping option
6. Click "Continue to Payment"
7. Verify redirect to `/checkout/payment`
8. Verify shippingChoice saved in Sanity CMS

**Verification Commands**:
```bash
# Run full E2E test
npx playwright test app/(store)/checkout/shipping/shipping-page.spec.ts
```

**Risks**:
- **Risk**: Redirect fails after selection
  - **Contingency**: Check router.push("/checkout/payment") in handleContinue function
- **Risk**: shippingChoice not saved before redirect
  - **Contingency**: Verify PATCH call completes before redirect (await in code)
- **Risk**: Payment page rejects missing shippingChoice
  - **Contingency**: Verify payment slice handles shippingChoice from reservation

**Success Criteria**: Complete flow works, shippingChoice saved, redirect successful.

---

### Step 6: Verify Error Handling and Fallbacks

**Objective**: Confirm error states display correctly and fallback mechanisms work.

**Actions**:
1. Test with missing basketReservationId → verify redirect to basket
2. Test with missing shippingAddress → verify redirect to address
3. Test with empty basket → verify error message
4. Test with Packlink API failure → verify fallback to mock rates (Poland domestic)
5. Test with configuration error (no sender address) → verify CONFIGURATION error
6. Test retry button for retryable errors

**Verification Commands**:
```bash
# Test error scenarios manually or via E2E test
npx playwright test app/(store)/checkout/shipping/shipping-page.spec.ts --project="chromium"
```

**Risks**:
- **Risk**: Error states not user-friendly
  - **Contingency**: Improve error messages based on UX requirements
- **Risk**: Fallback to mock rates not working
  - **Contingency**: Verify getPolandDomesticRates function and city coordinates
- **Risk**: Retry button causes infinite loop
  - **Contingency**: Verify window.location.reload() triggers fresh API call

**Success Criteria**: All error states display appropriate messages, fallback mechanisms work, retry button functional.

---

### Step 7: Verify Integration with Address Slice

**Objective**: Confirm shipping slice correctly receives shippingAddress from address slice.

**Actions**:
1. Complete address validation flow
2. Verify shippingAddress saved to reservation
3. Navigate to shipping page
4. Verify shipping page uses saved shippingAddress
5. Verify no address re-entry required

**Verification Commands**:
```bash
# Check reservation document has shippingAddress
# (via Sanity Studio or API call)
```

**Risks**:
- **Risk**: Address slice not saving shippingAddress correctly
  - **Contingency**: Debug address slice implementation
- **Risk**: Shipping page re-requests address entry
  - **Contingency**: Verify page redirects to address if shippingAddress missing (already implemented)

**Success Criteria**: Shipping page uses saved shippingAddress, no re-entry required.

---

### Step 8: Verify Integration with Payment Slice

**Objective**: Confirm payment slice receives shippingChoice from reservation.

**Actions**:
1. Complete shipping selection
2. Verify shippingChoice saved to reservation
3. Navigate to payment page
4. Verify payment page displays selected shipping method
5. Verify payment amount includes shipping cost

**Verification Commands**:
```bash
# Check payment page displays shippingChoice
# (manual verification or payment slice E2E test)
```

**Risks**:
- **Risk**: Payment slice doesn't read shippingChoice
  - **Contingency**: Update payment slice to use shippingChoice from reservation
- **Risk**: Shipping cost not included in payment total
  - **Contingency**: Verify payment slice adds shippingChoice.amount to total

**Success Criteria**: Payment page displays shipping method and includes shipping cost in total.

---

## Risk Summary

### High-Risk Areas
1. **Packlink PRO API reliability**: External API dependency, may fail or return no rates
   - **Mitigation**: Two-tier fallback (Packlink → Mock rates for PL domestic)
2. **Sender address configuration**: Missing environment variables for destination countries
   - **Mitigation**: Priority order (country-specific → default → base), clear error messages
3. **Parcel data completeness**: Missing parcel data for products breaks rate calculation
   - **Mitigation**: Parcel migration script, validation in API endpoint

### Medium-Risk Areas
1. **Session storage consistency**: Key mismatch between components
   - **Mitigation**: Use consistent `basketReservationId` key throughout
2. **Error handling clarity**: Users may not understand error messages
   - **Mitigation**: Error classification (VALIDATION, CONFIGURATION, NETWORK, PROVIDER)
3. **E2E test flakiness**: External API dependencies in tests
   - **Mitigation**: Tests handle API failures gracefully, verify error states

### Low-Risk Areas
1. **UI styling**: Minor visual inconsistencies
   - **Mitigation**: Follow existing Tailwind patterns
2. **Type safety**: TypeScript types may not match API responses
   - **Mitigation**: Zod validation in API endpoints, type generation from Sanity schema

---

## Contingency Paths

### Path A: Packlink API Fails
1. Verify destination country is Poland (PL)
2. Fallback to mock rates (getPolandDomesticRates)
3. If mock rates also fail, display error message
4. User can retry or contact support

### Path B: Parcel Data Missing
1. Run parcel migration script
2. Verify parcel data for all products in basket
3. Re-run shipping options fetch
4. If still missing, display error for specific product

### Path C: Sender Address Not Configured
1. Check for country-specific sender address (SENDER_ADDRESS_{COUNTRY}_*)
2. Check for default sender address (SENDER_ADDRESS_DEFAULT_*)
3. Check for base sender address (SENDER_ADDRESS_*)
4. If all missing, display CONFIGURATION error with retryable: false
5. Admin must configure environment variables

### Path D: Address Slice Not Completed
1. Redirect to address page if shippingAddress missing
2. User must complete address validation first
3. Address slice saves shippingAddress to reservation
4. User can then proceed to shipping selection

---

## Exit Strategy

**Stop Conditions**:
- If Packlink API and mock fallback both fail → Display clear error, stop
- If parcel data cannot be migrated → Display product-specific error, stop
- If sender address cannot be configured → Display configuration error, stop
- If address slice is not implemented → Complete address slice first, stop

**Never Get Stuck Rule**:
- Each step has clear success criteria
- Each risk has identified contingency
- Each failure mode has exit path
- User always sees actionable error message or clear next step

---

## Verification Checklist

### Pre-requirements
- [ ] Address slice completed
- [ ] Packlink PRO API key configured
- [ ] Product parcel data exists
- [ ] PATCH endpoint supports shippingChoice

### API Verification
- [ ] GET /api/shipping/rates returns options
- [ ] API handles missing address error
- [ ] API handles empty basket error
- [ ] API handles invalid reservation error
- [ ] Fallback to mock rates works (Poland domestic)

### Frontend Verification
- [ ] Page displays loading state
- [ ] Page displays shipping options
- [ ] User can select option
- [ ] Continue button enables on selection
- [ ] Error states display correctly
- [ ] Retry button works for retryable errors

### Integration Verification
- [ ] Redirect to basket if no reservationId
- [ ] Redirect to address if no shippingAddress
- [ ] Redirect to payment after selection
- [ ] shippingChoice saved to reservation
- [ ] Payment page receives shippingChoice

### E2E Verification
- [ ] Happy path test passes
- [ ] Error handling test passes
- [ ] Redirect test passes
- [ ] Complete flow from basket to payment works

---

## Next Steps After Verification

If verification passes:
- Mark shipping slice as complete in project tracking
- Update sprint documentation with verification results
- Proceed to payment slice verification (if needed)

If verification fails:
- Identify failing step
- Execute contingency for that step
- Re-run verification
- If contingencies exhausted, escalate to implementation fixes

---

## Simplicity Guardrails

- **No new abstractions**: Use existing React hooks, direct API calls
- **No new state management**: Use React useState, no Redux/Zustand
- **No new UI libraries**: Use existing Tailwind patterns
- **Minimal files**: Single-file components where possible
- **Direct verification**: Manual API tests + E2E tests, no complex test harnesses
- **Clear error messages**: User-facing errors explain what to do next
- **Fallback paths**: Every failure mode has exit strategy

---

**Decomposition Complete**: 8 verification steps, each with clear actions, risks, contingencies, and success criteria.
