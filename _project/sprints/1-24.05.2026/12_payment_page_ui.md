# Sprint: Payment Page UI (Chunk 2)

## PHASE 0: Pre-Work

No `_project/lessons/INDEX.md`. Key verified facts:
- `app/(store)/checkout/payment/page.tsx` is placeholder `<div>page</div>`
- Chunk 1 complete: `POST /api/checkout/payment-intent` returns `{ clientSecret }`
- `basketReservationId` stored in `sessionStorage` by `CheckoutButton.tsx`
- Shipping page redirects to `/checkout/payment` after saving choice
- `@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe` already in `package.json`
- `Loader` component at `@/app/components/common/Loader`
- Checkout layout wraps pages in `max-w-4xl` + "Checkout" heading

---

## PHASE 1: UX Flows

1. **Shipping → Payment:** redirected to `/checkout/payment` → loading spinner → payment form + order summary
2. **Happy Path:** sees order summary → enters card in Payment Element → clicks "Pay" → "Processing..." → Stripe handles 3D Secure → redirected to `/checkout/return?payment_intent=pi_xxx`
3. **No Reservation:** direct navigation → redirect `/basket`
4. **API Error:** PaymentIntent fails → error + retry/back buttons
5. **Card Declined:** inline Payment Element error → user corrects

**End-State:** Single-page form with Stripe Payment Element + order summary. Four states: loading, error, ready, processing. No wizard, no custom payment UI.

---

## PHASE 2: Architecture Contract

```
PAGE_MOUNT → read sessionStorage
  → NO_ID: redirect /basket
  → HAS_ID: POST /api/checkout/payment-intent
    → ERROR: show error state (retry/back)
    → SUCCESS: init Elements, render PaymentElement + OrderSummary (ready)
      → SUBMIT: processing state, stripe.confirmPayment()
        → Stripe redirects to return_url
        → Decline: inline error, back to ready
```

**States:** `loading | ready | processing | error`
**No state machine lib. No context beyond Stripe Elements. `useState` + single `useEffect`.**

---

## PHASE 3: Scope Contracts

---

### Scope 1: OrderSummary Component

**File:** `app/(store)/checkout/payment/_components/OrderSummary.tsx`

**UX:** Shows items (name × qty = line total), shipping method + cost, grand total. Prices formatted `$19.99`.

**Arch:** Receives `basketReservationId` prop. Fetches reservation via `GET /api/basket-reservations/[id]`. Maps product IDs to names. Loading: skeleton. Error: "Unable to load summary" text, doesn't block payment.

**Verify:**
- [ ] Correct items, quantities, shipping, total displayed
- [ ] Prices formatted as dollars (`/ 100`)
- [ ] Grand total = items + shipping
- [ ] Doesn't block PaymentElement

---

### Scope 2: PaymentForm Component

**File:** `app/(store)/checkout/payment/_components/PaymentForm.tsx`

**UX:** Stripe Payment Element + "Pay $XX.XX" button. Processing: spinner + "Processing...". Decline: inline error.

**Arch:** Props: `{ clientSecret, totalAmount, currency }`. Module-level `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`. Wraps `<Elements stripe={stripePromise} options={{ clientSecret }}>`. Renders `<PaymentElement />` + submit button. On submit: `stripe.confirmPayment({ elements, confirmParams: { return_url: '/checkout/return?payment_intent={CHECKOUT_SESSION_ID}' } })`. Handles `confirmPayment` error by logging — Payment Element shows inline errors automatically.

**Verify:**
- [ ] Payment Element renders (card number, expiry, CVC fields)
- [ ] Button shows correct amount
- [ ] Test card `4242 4242 4242 4242` → redirects to return URL
- [ ] Test card `4000 0000 0000 0002` → inline decline error
- [ ] Processing state visible during confirmPayment

---

### Scope 3: Payment Page Assembly

**File:** `app/(store)/checkout/payment/page.tsx` (replace placeholder)

**UX:** Ties everything together. On mount: reads `sessionStorage`, calls API, renders PaymentForm + OrderSummary.

**Arch:** Client component. State: `{ status, clientSecret, error }`. `useEffect` on mount:
1. Get `basketReservationId` from `sessionStorage` → missing: `router.push('/basket')`
2. `POST /api/checkout/payment-intent` → error: set error state
3. Success: set `clientSecret`, status → `ready`

Renders:
- `loading` → `<Loader message="Preparing payment..." />`
- `error` → error card with message + "Try Again" + "Go Back" buttons
- `ready` → `<OrderSummary basketReservationId={id} />` + `<PaymentForm clientSecret={...} totalAmount={...} currency={...} />`

**Verify:**
- [ ] Full flow: basket → address → shipping → payment → Payment Element visible
- [ ] No reservation → redirect to `/basket`
- [ ] API down → error state with retry working
- [ ] Complete test payment with `4242...` → redirected to `/checkout/return?payment_intent=pi_xxx`

---

## PHASE 4: Continuous Verification

Per-scope workflow: implement → verify checklist → confirm simplest way → next scope.

Order: Scope 1 (OrderSummary) → Scope 2 (PaymentForm) → Scope 3 (page assembly)

---

## PHASE 5: Final Human Check

- [ ] Full flow: basket → address → shipping → payment → Payment Element renders
- [ ] OrderSummary shows correct items + total
- [ ] Test card `4242...` → successful redirect to return URL
- [ ] Test card `4000 0000 0000 0002` → inline decline
- [ ] No reservation → redirect `/basket`
- [ ] Error state renders + retry works
- [ ] `npx tsc --noEmit` passes
- [ ] No `stripePriceId` references in new code

---

## PHASE 6: Simplicity Guardrails

- **No new dependencies** — Stripe packages already installed
- **No state machine library** — `useState` + single `useEffect`
- **No context providers** beyond Stripe's `<Elements>`
- **No custom payment UI** — Stripe Payment Element handles everything
- **No 3D Secure code** — automatic via Payment Element
- **OrderSummary fetches independently** — self-contained, no coupling to page fetch lifecycle

---

## PHASE 7: Scope Lock

- **NO** changes outside scope contracts
- **NO** touching Chunk 1 API, shipping page, or return page
- **NO** webhook work (Chunk 3)
- **NO** adding complexity without necessity

---

## Appendix: Files Affected

| Action | File |
|--------|------|
| CREATE | `app/(store)/checkout/payment/_components/OrderSummary.tsx` |
| CREATE | `app/(store)/checkout/payment/_components/PaymentForm.tsx` |
| REPLACE | `app/(store)/checkout/payment/page.tsx` |
