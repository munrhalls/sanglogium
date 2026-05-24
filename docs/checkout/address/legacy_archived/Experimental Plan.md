# Experimental Plan: SessionStorage Optimization

## Approach: 5 Small Experiments, Each Easy to Verify

**Philosophy**: Break into minimal changes, verify each with simple methods (console logs, browser dev tools), rollback if needed.

---

## Experiment 1: Verify sessionStorage save works (address slice only)

**Change**: Add 1 line to `app/(store)/checkout/layout.tsx` after CMS save

```typescript
// After line 68 (after PATCH success check):
sessionStorage.setItem("shippingAddress", JSON.stringify(validation.address));
console.log("[ADDRESS SLICE] Saved shippingAddress to sessionStorage:", validation.address);
```

**Verification Method**:
1. Start dev server: `npm run dev`
2. Navigate to `/checkout/address`
3. Submit address form
4. Open browser dev tools → Application → Session Storage
5. Check for `shippingAddress` key
6. Check browser console for log message: `[ADDRESS SLICE] Saved shippingAddress to sessionStorage: {...}`

**Success Criteria**:
- ✅ `shippingAddress` key exists in Session Storage
- ✅ Console log shows saved address
- ✅ Address still saves to CMS (verify in Sanity Studio)

**Rollback**: Remove the 2 lines added

**Contingency**: If sessionStorage not supported, check browser console for error

---

## Experiment 2: Verify shipping page can read from sessionStorage

**Change**: Modify `app/(store)/checkout/shipping/page.tsx` to read from sessionStorage first

```typescript
// At start of fetchShippingOptions function (line 37):
const shippingAddressFromStorage = sessionStorage.getItem("shippingAddress");
console.log("[SHIPPING PAGE] shippingAddress from sessionStorage:", shippingAddressFromStorage);

// If found, use it instead of fetching from CMS
if (shippingAddressFromStorage) {
  console.log("[SHIPPING PAGE] Using shippingAddress from sessionStorage, skipping CMS fetch");
  // TODO: Pass to API in Experiment 3
}
```

**Verification Method**:
1. Complete Experiment 1 (address has sessionStorage)
2. Navigate to `/checkout/shipping`
3. Check browser console for log message
4. Verify it shows the address from sessionStorage

**Success Criteria**:
- ✅ Console log shows: `[SHIPPING PAGE] shippingAddress from sessionStorage: {...}`
- ✅ Console log shows: `[SHIPPING PAGE] Using shippingAddress from sessionStorage, skipping CMS fetch`

**Rollback**: Revert to original code (remove the 4 lines)

**Contingency**: If sessionStorage missing, fallback to current behavior (already in place)

---

## Experiment 3: Verify API endpoint can accept shippingAddress

**Change**: Modify `app/api/shipping/rates/route.ts` to accept optional shippingAddress

```typescript
// At start of GET function (line 56):
const shippingAddressFromBody = req.headers.get("X-Shipping-Address");
if (shippingAddressFromBody) {
  console.log("[API RATES] Received shippingAddress from request header:", shippingAddressFromBody);
  const address = JSON.parse(shippingAddressFromBody);
  // Use address instead of fetching from CMS
  // TODO: Implement in Experiment 4
}
```

**Verification Method**:
1. Complete Experiment 2
2. Modify shipping page to pass shippingAddress in request header
3. Navigate to `/checkout/shipping`
4. Check server console (terminal running dev server) for log message
5. Verify it shows the received address

**Success Criteria**:
- ✅ Server console shows: `[API RATES] Received shippingAddress from request header: {...}`

**Rollback**: Revert to original code (remove the 6 lines)

**Contingency**: If header missing, fallback to current behavior (fetch from CMS)

---

## Experiment 4: Connect shipping page to API with sessionStorage data

**Change**: Modify `app/(store)/checkout/shipping/page.tsx` to pass shippingAddress to API

```typescript
// In fetchShippingOptions function, replace the fetch call:
const headers: HeadersInit = { "Content-Type": "application/json" };
if (shippingAddressFromStorage) {
  headers["X-Shipping-Address"] = shippingAddressFromStorage;
}

const response = await fetch(
  `/api/shipping/rates?basketReservationId=${basketReservationId}`,
  { headers }
);
```

**Verification Method**:
1. Complete Experiments 1-3
2. Navigate to `/checkout/shipping`
3. Check browser console for sessionStorage log
4. Check server console for API received log
5. Verify shipping options load

**Success Criteria**:
- ✅ Browser console shows sessionStorage read
- ✅ Server console shows API received address
- ✅ Shipping options display on page
- ✅ No CMS fetch for shippingAddress (verify in network tab)

**Rollback**: Revert to original code (remove the header logic)

**Contingency**: If API fails, fallback to CMS fetch (add try-catch)

---

## Experiment 5: Verify fallback works (sessionStorage missing)

**Change**: Already built into Experiments 2-4 (if statements check for null)

**Verification Method**:
1. Open browser dev tools → Application → Session Storage
2. Clear `shippingAddress` key
3. Navigate to `/checkout/shipping`
4. Verify shipping options still load (fallback to CMS fetch)
5. Check network tab to verify CMS fetch happened

**Success Criteria**:
- ✅ Shipping options load even without sessionStorage
- ✅ Network tab shows CMS fetch for reservation
- ✅ No errors in console

**Rollback**: Not needed (fallback is original behavior)

**Contingency**: If fallback fails, check CMS connection

---

## Experiment 6: End-to-end verification (all changes combined)

**Change**: All experiments combined

**Verification Method**:
1. Start from basket page
2. Add product to basket
3. Navigate to checkout
4. Submit address form
5. Check sessionStorage has shippingAddress
6. Navigate to shipping page
7. Verify shipping options load
8. Check network tab: only 1 API call to /api/shipping/rates (no CMS fetch for reservation)
9. Select shipping option
10. Verify redirect to payment page

**Success Criteria**:
- ✅ Complete flow works end-to-end
- ✅ sessionStorage used throughout
- ✅ Only 1 round trip on shipping page
- ✅ Fallback works if sessionStorage cleared

**Rollback**: Revert all changes (remove all added lines)

**Contingency**: If any step fails, identify which experiment and rollback that specific change

---

## Contingencies Summary

**If sessionStorage not supported**:
- Fallback to CMS fetch (original behavior)
- Check browser compatibility

**If API header not received**:
- Fallback to CMS fetch (original behavior)
- Check network tab for request headers

**If shipping options don't load**:
- Check server console for errors
- Check browser console for errors
- Fallback to CMS fetch

**If data diverges**:
- CMS is source of truth
- Clear sessionStorage and reload page

---

## Rollback Strategy

**Per-Experiment Rollback**:
- Each experiment adds minimal code (1-6 lines)
- Rollback by removing those specific lines
- No dependencies between experiments (except sequential)

**Full Rollback**:
- Remove all added lines from all files
- System works as before (original behavior)
- No data loss (CMS is source of truth)

**Verification of Rollback**:
- Run original address flow
- Verify shipping options load via CMS fetch
- Check network tab shows CMS fetch

---

## Order of Experiments

1. **Experiment 1**: Save to sessionStorage (address slice) - 5 minutes
2. **Experiment 2**: Read from sessionStorage (shipping page) - 5 minutes
3. **Experiment 3**: Accept in API (API endpoint) - 5 minutes
4. **Experiment 4**: Connect page to API - 5 minutes
5. **Experiment 5**: Verify fallback - 2 minutes
6. **Experiment 6**: End-to-end test - 5 minutes

**Total Time**: ~27 minutes for all experiments

**Can Stop After**: Experiment 4 (if working, can skip to Experiment 6)
