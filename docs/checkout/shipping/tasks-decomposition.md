# Tasks Decomposition - Shipping Page

**Happy path tracer only.**

## Task Graph

```
[1] Verify iron-session setup exists from address page implementation
     │
     ├─→ [3] Create shipping page route structure /checkout/shipping/page.tsx (Layer 1)
     │        │
     │        ├─→ [4] Implement shipping guard - redirect to address if session.address missing
     │        │
     │        └─→ [5] Fetch parcel data from Sanity for shipping API call
     │                 │
     │                 └─→ [6] Integrate AlleKurier API call in shipping page server component
     │                          │
     │                          └─→ [7] Create shipping options display UI (radio buttons with service name, price, delivery time)
     │
     └─→ [8] Create saveShipping Server Action (Layer 3 - Mutation & Session Gateway)
              │
              ├─→ [9] Implement security: Server Action fetches price server-side and saves BOTH shippingCode AND shippingCost
              │
              └─→ [10] Implement redirect to /checkout/payment after save
                       │
                       └─→ [11] Create blank /checkout/payment/page.tsx as checkpoint (verify session state)
                                │
                                └─→ [12] Test vertical slice: address → shipping → payment flow

[2] Verify AlleKurier API wrapper exists (lib/shipping/allekurier-rates.ts)
     │
     └─→ [6] Integrate AlleKurier API call in shipping page server component
```

## Critical Path
1 → 3 → 5 → 6 → 7 → 12 (server component data flow)
1 → 8 → 9 → 10 → 11 → 12 (server action mutation flow)

## Parallel Opportunities
- Task 2 (AlleKurier wrapper verification) can run in parallel with Task 1 (session verification)
- Task 4 (guard) can run in parallel with Task 5 (parcel fetch) after Task 3

## Vertical Slice Structure
**Layer 4 (Infrastructure):** Task 2
**Layer 1 (Routing):** Tasks 3, 4, 5, 6
**Layer 2 (Presentation):** Task 7
**Layer 3 (Mutation):** Tasks 8, 9, 10
**Checkpoint:** Tasks 11, 12

## Task Details

### Task 1: Verify iron-session setup exists from address page implementation
- Check `lib/session.ts` exists and is configured
- Verify session type includes address field
- Confirm address page successfully writes to session

### Task 2: Verify AlleKurier API wrapper exists (lib/shipping/allekurier-rates.ts)
- Confirm `lib/shipping/allekurier-rates.ts` exists
- Verify `fetchAlleKurierRates` function signature
- Check environment variables: ALLEKURIER_EMAIL, ALLEKURIER_PASSWORD
- Test API call returns valid service list

### Task 3: Create shipping page route structure /checkout/shipping/page.tsx (Layer 1)
- Create directory: `app/(store)/checkout/shipping/`
- Create `page.tsx` as React Server Component
- Import session utility
- Set up basic page structure

### Task 4: Implement shipping guard - redirect to address if session.address missing
- Read session at page load
- Check if `session.address` exists
- If missing, execute `redirect("/checkout/address")`
- Prevent direct access to shipping page without address

### Task 5: Fetch parcel data from Sanity for shipping API call
- Read basket IDs from session
- Fetch product documents from Sanity
- Extract parcel dimensions (weight, width, height, length)
- Aggregate total parcel data for API call

### Task 6: Integrate AlleKurier API call in shipping page server component
- Import `fetchAlleKurierRates` from `lib/shipping/allekurier-rates.ts`
- Prepare API input: fromCountry (PL), fromZip (sender), toCountry (PL), toZip (session.address), packages (from Sanity)
- Call AlleKurier API
- Transform response to shipping options format
- Display options to user with rateId (shippingCode) for form submission

### Task 7: Create shipping options display UI (radio buttons with service name, price, delivery time)
- Create form with radio buttons for each shipping option
- Display: Carrier name, Service name, Price (PLN), Delivery days
- Add "Continue to Payment" button
- Submit form to Server Action with selected rateId

### Task 8: Create saveShipping Server Action (Layer 3 - Mutation & Session Gateway)
- Create `app/actions/checkout.ts` or add to existing
- Create `saveShippingAction(formData)` function
- Extract selected rateId from FormData
- Read session

### Task 9: Implement security: Server Action fetches price server-side and saves BOTH shippingCode AND shippingCost
- Extract rateId (e.g., "dpd_dpd_classic") from form submission
- Call AlleKurier API server-side using shippingCode and session.address to fetch exact current price
- Convert price to integer (grosz — PLN's smallest unit; 1 PLN = 100 grosz)
- Save BOTH `session.shippingCode = rateId` AND `session.shippingCost = priceInGrosze`
- This prevents client-side price tampering (price fetched server-side, tamper-proof in encrypted cookie)

### Task 10: Implement redirect to /checkout/payment after save
- After saving shippingCode to session
- Execute `redirect("/checkout/payment")`
- Ensure session is saved before redirect

### Task 11: Create blank /checkout/payment/page.tsx as checkpoint (verify session state)
- Create directory: `app/(store)/checkout/payment/`
- Create `page.tsx` as React Server Component
- Read session and log to console: `{ basket, address, shippingCode, shippingCost }`
- Verify session state is correct after shipping selection

### Task 12: Test vertical slice: address → shipping → payment flow
- Start from address page with valid address
- Submit address → verify redirect to shipping
- Verify shipping page loads with session.address
- Select shipping option → submit
- Verify redirect to payment
- Verify payment page logs session with shippingCode AND shippingCost
- Verify shippingCost was fetched server-side (security check: client never submitted price)
