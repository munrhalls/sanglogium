# Work Block Contract — 2026-05-26

## Intelligence Finding

All checkout tests test a **deprecated architecture** (basketReservation + sessionStorage + Shippo). The actual code uses **iron-session + AlleKurier + Stripe Server Actions**. Running `npm test` on checkout files produces guaranteed false failures — the tests are testing code that no longer exists.

**Specific mismatches verified:**
- `tests/checkout/payment/page.test.tsx` mocks `useRouter` + `sessionStorage` — page is a Server Component using `redirect()` + `getIronSession()`
- `tests/checkout/payment/payment-form.test.tsx` imports `_components/PaymentForm` with props `totalAmount, currency` — actual file is `PaymentForm.client.tsx` with props `clientSecret, address, traceId`
- `tests/checkout/integration/payment-intent.test.ts` calls `/api/checkout/payment-intent` with `basketReservationId` — actual flow uses `initPaymentAction()` Server Action with `iron-session`
- `app/(store)/checkout/shipping/shipping-page.spec.ts` injects `basketReservationId` into `sessionStorage` — actual flow reads `session.address` from encrypted cookie
- `app/(store)/checkout/shipping/shipping-rates.test.ts` POSTs to `/api/shipping/rates` with `basketReservationId` — actual flow is Server Component calling `fetchAlleKurierRates()` directly

---

## The Contract

```
In the next 90 minutes I will deliver:
1. lib/checkout/payment-guards.ts — pure functions extracted from app/(store)/checkout/payment/page.tsx
2. tests/checkout/payment/guards.test.ts — 5 passing vitest tests verifying current iron-session architecture

Why extraction: page.tsx is an async Server Component. @testing-library/react in jsdom cannot render
async Server Components (verified — no @testing-library/react-server in package.json; no existing
Server Component tests in tests/). Testing the extracted pure logic is the only 90-minute-viable path.

Acceptance (falsifiable — run "npx vitest run tests/checkout/payment/guards.test.tsx"):

FILE 1: lib/checkout/payment-guards.ts
- Export validateFunnelGuards(session: CheckoutSession) => 
    { action: 'redirect', url: string } | { action: 'proceed' }
  Must implement guards in exact order from page.tsx lines 23-41:
    1. !session.basket?.length → { action: 'redirect', url: '/basket' }
    2. quantity < 1 or non-integer → { action: 'redirect', url: '/basket?error=invalid_basket' }
    3. !session.address → { action: 'redirect', url: '/checkout/address' }
    4. shippingCost === undefined || shippingCost === null → { action: 'redirect', url: '/checkout/shipping' }
    5. all valid → { action: 'proceed' }

- Export validateSanityProducts(sessionBasket, sanityProducts) =>
    { action: 'redirect', url: string } | { action: 'throw', message: string } | { action: 'proceed', products: ValidatedProduct[] }
  Must implement checks from page.tsx lines 54-68:
    1. sanityProducts.length !== sessionBasket.length → { action: 'throw', message: 'Product mismatch...' }
    2. !Number.isFinite(product.price_data?.unit_amount) → { action: 'throw', message: 'Product X has invalid price' }
    3. product.stock === 0 → { action: 'redirect', url: '/basket?error=out_of_stock&id=...' }
    4. all valid → { action: 'proceed', products: matched products }

- Export calculateGrandTotal(subtotal: number, shippingCost: number) => number
  Must match page.tsx line 75: Math.round(subtotal + shippingCost)

FILE 2: tests/checkout/payment/guards.test.tsx
Test 1: "empty basket → redirect /basket"
  - Input: { basket: [] }
  - Expect: validateFunnelGuards returns { action: 'redirect', url: '/basket' }

Test 2: "quantity 0 → redirect /basket?error=invalid_basket"
  - Input: { basket: [{ productId: 'p1', quantity: 0 }] }
  - Expect: validateFunnelGuards returns { action: 'redirect', url: '/basket?error=invalid_basket' }

Test 3: "no address → redirect /checkout/address"
  - Input: { basket: [{ productId: 'p1', quantity: 1 }], address: undefined }
  - Expect: validateFunnelGuards returns { action: 'redirect', url: '/checkout/address' }

Test 4: "shippingCost undefined → redirect /checkout/shipping"
  - Input: { basket: [{ productId: 'p1', quantity: 1 }], address: { ...valid }, shippingCost: undefined }
  - Expect: validateFunnelGuards returns { action: 'redirect', url: '/checkout/shipping' }

Test 5: "shippingCost 0 → proceed (free shipping is valid)"
  - Input: { basket: [{ productId: 'p1', quantity: 1 }], address: { ...valid }, shippingCost: 0 }
  - Expect: validateFunnelGuards returns { action: 'proceed' }

Test 6: "product mismatch → throw"
  - Input: basket=[{productId:'p1'}], sanityProducts=[]
  - Expect: validateSanityProducts returns { action: 'throw', message: 'Product mismatch...' }

Test 7: "invalid price → throw"
  - Input: basket=[{productId:'p1'}], sanityProducts=[{_id:'p1', price_data:{unit_amount:null}, stock:5}]
  - Expect: validateSanityProducts returns { action: 'throw', message: 'Product p1 has invalid price' }

Test 8: "out of stock → redirect"
  - Input: basket=[{productId:'p1'}], sanityProducts=[{_id:'p1', price_data:{unit_amount:100}, stock:0}]
  - Expect: validateSanityProducts returns { action: 'redirect', url: '/basket?error=out_of_stock&id=p1' }

Test 9: "grand total calculation"
  - Input: subtotal=10000, shippingCost=1899
  - Expect: calculateGrandTotal returns 11899

If blocked:
- Ask if CheckoutSession type from lib/session.ts can be imported into lib/checkout/payment-guards.ts without circular dependency
- Abort if any guard logic in page.tsx depends on logging side effects that cannot be extracted

Verification command:
npx vitest run tests/checkout/payment/guards.test.tsx
Must output: "9 passed (100%)" or higher. Zero skipped.
```

---

## Why This Is the Right 90-Minute Target

- **One file.** Not "fix all tests." One file.
- **Lead domino.** Funnel guards are the security checkpoint. If they work, the rest of the payment flow is protected. If they don't, the payment page is exposed to invalid states.
- **Architecture alignment.** Rewriting this test forces understanding of the current iron-session pattern, which is required for every subsequent checkout test.
- **Falsifiable.** `npx vitest run` gives a binary pass/fail. No ambiguity.

---

## Anti-Patterns to Avoid in This Block

- Do NOT touch shipping tests. Out of scope.
- Do NOT touch integration tests. Out of scope.
- Do NOT refactor PaymentForm.client.tsx. Out of scope.
- Do NOT add logging. Out of scope.
- Do NOT read process books. Out of scope.

If any of these temptations arise: log them in a scratch file and return to the contract.
