# Address Slice — Gap-Close Report

## Gap 1: Geocode and placeId not persisted to session

### Intel Gathered
- `submitShippingAction` (app/actions/address/address.ts) returns `{status: "ACCEPT", address, geocode, placeId}` on success
- `saveAddress` (app/actions/checkout/index.ts) only writes `validationResult.address` to `session.address`
- `CheckoutSession.address` type (lib/session.ts) has no fields for geocode or placeId
- Spec: "geocode: Google response — stored but not used downstream in PL happy path"
- Spec: "placeId: Google response — stored but not used downstream in PL happy path"

### Gap-Close
1. Extend `CheckoutSession.address` type to include optional `geocode` and `placeId`
2. Update `saveAddress` to persist them: `session.address = { ...address, ...validationResult.address, geocode: validationResult.geocode, placeId: validationResult.placeId }`

---

## Gap 2: CheckoutProvider contains dead code from obsolete architecture

### Intel Gathered
- `CheckoutProvider.client.tsx` defines `validateShipping` which: calls `submitShippingAction`, reads `sessionStorage.getItem("basketReservationId")`, PATCHes to `/api/basket-reservations/${id}`, stores address in `sessionStorage`, pushes to `/checkout/shipping`
- `useCheckout` hook exported from `CheckoutProvider.client.tsx` has **zero call sites** anywhere in `app/`
- `validateShipping` has **zero call sites** anywhere in `app/`
- `AddressForm.tsx` bypasses `CheckoutProvider` entirely — imports `saveAddress` server action directly and calls it
- `CheckoutProvider` is rendered in `app/checkout/layout.tsx` but never consumed by any child
- This is leftover code from a prior architecture where address was saved to Sanity via client-side PATCH

### Gap-Close
1. Remove `app/checkout/CheckoutProvider.client.tsx` entirely
2. Remove `CheckoutProvider` wrapper from `app/checkout/layout.tsx`
3. If any other checkout pages need shared client state, add it back with a clean, consumed context

---

## Gap 3: E2E test tests dead code path, not production flow

### Intel Gathered
- `tests/checkout/e2e/address-flow.spec.ts` flow:
  1. Seeds Sanity `basketReservation` document
  2. Injects `basketReservationId` into `sessionStorage`
  3. Navigates to `/checkout/address`
  4. Fills form
  5. Clicks submit
  6. **Waits for PATCH to `/api/basket-reservations/[id]`**
  7. Asserts navigation to `/checkout/shipping`
  8. Polls Sanity for `shippingAddress` on reservation doc
- Production `AddressForm.tsx` calls `saveAddress` server action → writes to iron-session → redirects. No PATCH. No sessionStorage read. No Sanity write.
- The test's expected PATCH call will never fire against production code. The test will timeout/fail.
- Spec system coherence rule: "Session cookie is the only persistence mechanism for address data. No address data is written to a database at this stage."

### Gap-Close
Rewrite E2E test to match production architecture:
1. Seed basket into iron-session (call `initCheckoutSession` or set session cookie directly)
2. Navigate to `/checkout/address`
3. Fill form with valid Polish address
4. Click submit
5. Assert redirect to `/checkout/shipping`
6. (Optional) Verify session contains validated address via a test endpoint

Remove all logic related to: Sanity reservation creation, sessionStorage injection, PATCH waiting, Sanity polling.

---

## Gap 4: Integration test tests PATCH endpoint in isolation (not a gap, but needs clarity)

### Intel Gathered
- `tests/checkout/integration/address-slice.test.ts` calls `submitShippingAction` directly, then manually PATCHes `/api/basket-reservations/[id]`
- This tests the PATCH endpoint + Sanity write correctly as an isolated integration test
- It does not test the production address flow (which doesn't use PATCH)

### Gap-Close
Update test comments to clarify: this tests the PATCH endpoint and Sanity integration in isolation, not the production checkout flow. Optionally rename file to `basket-reservations-patch.test.ts` for clarity. Keep the test — it provides value for the PATCH endpoint.

---

## Coherence Check (Post Gap-Close)

| Rule | Status |
|---|---|
| Single address flow (no dual paths) | PASS — only `saveAddress` server action + iron-session |
| Cascade invalidation unconditional | PASS — already correct in `saveAddress` |
| Google validation authoritative | PASS — FIX rejected, no fallback |
| Session-only persistence at address stage | PASS — no Sanity writes, no dead provider |
| Trace logging non-blocking | PASS — already correct (`.catch(() => {})`) |
| Geocode and placeId stored | PASS — after Gap 1 close |
| `initialAddress` hydration = UX only, no re-validation | PASS — already correct |
| Tests match production code | PASS — after Gap 3 close |

**Red flags found and fixed:**
- Dead context provider wrapping layout but never consumed
- E2E test asserting behavior of code that no longer exists
- Session type missing fields the spec requires to be stored
