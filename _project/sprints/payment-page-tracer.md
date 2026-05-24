# Sprint: Payment Page — Stripe Tracer (Happy Path)

**Happy path tracer only.** Source documents: `docs/checkout/payment/{framed-objective.md, tasks-decomposition.md, acceptance-tests.md}`. Scope is the **payment page only** (`/checkout/payment`). The return flow (`/api/checkout/return` + `/checkout/success`) is a separate sprint and is referenced here only as a hard dependency.

---

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` found. Skipping automated lesson retrieval.

**Manually retained constraints from prior sprints** (address + shipping):
- iron-session is the single source of truth between checkout pages; reads via `getCheckoutSession()` in Server Components.
- All prices stored as **integer grosz** (smallest PLN unit). Never floats. Never "cents".
- Funnel guards in Server Components are top-to-bottom; ALL run before any external call (Sanity/Stripe).
- Server Actions / Server Components throw → Next.js `error.tsx` boundary. The boundary must exist BEFORE shipping any throw-path code, or users see the global 500.

---

## PHASE 1: UX Flows First

### Current State (Shipping Page Complete)
1. User selects a shipping option → server action saves `shippingCode` + `shippingCost` (grosz) into iron-session.
2. Redirected to `/checkout/payment`.

### Target State (After Sprint)
1. User lands on `/checkout/payment` → funnel guards verify basket, address, shippingCost (`=== undefined` check; `0` is valid).
2. Server fetches Sanity prices, checks stock, calculates grand total (integer grosz).
3. Server creates a Stripe `PaymentIntent` (or updates the existing one on revisit) → passes `client_secret` to the client.
4. Page renders order total + Stripe `PaymentElement` (Card, Blik, Apple Pay) with **billing-address inputs suppressed** (already collected at `/checkout/address`).
5. User clicks **Pay** → button shows loading state.
6. Stripe confirms payment → browser redirects to `/api/checkout/return` (Route Handler in the next sprint).
7. On error (decline, validation): inline error message renders; Pay button re-enables; user stays on page.

### End-State Overview
The user sees a single payment screen with their order total and Stripe's payment form, types their card or selects Blik (without re-entering their address), clicks Pay, and is taken to a server-verified success or retry experience. Refreshing the page never creates a duplicate PaymentIntent. Editing upstream funnel steps never leaves a stale PI at the moment of confirmation. The encrypted iron-session cookie is the sole inter-page state.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow
```
Event: User navigates to /checkout/payment
State: Server Component reads iron-session
Side Effect 1 (guards, top-to-bottom — ALL before any external call):
  - !session.basket?.length          → redirect /basket
  - bad quantity (non-int / <1)      → redirect /basket?error=invalid_basket
  - !session.address                 → redirect /checkout/address
  - session.shippingCost === undefined → redirect /checkout/shipping
Side Effect 2: GROQ fetch products by _id in session.basket
  - sanityProducts.length !== basket.length → throw (CheckoutError)
  - any product.stock === 0          → redirect /basket?error=out_of_stock&id=<_id>
  - any product.price_data.unit_amount not Number.isFinite → throw (CheckoutError)
Side Effect 3: Calculate
  - subtotal = Σ(unit_amount × quantity)        [grosz]
  - grandTotal = Math.round(subtotal + session.shippingCost)
  - grandTotal < 1 → redirect /basket?error=invalid_total
Side Effect 4: Idempotent Stripe PI
  - session.paymentIntentId exists → stripe.paymentIntents.update({ amount, metadata })
    catch → clear paymentIntentId → fall through to create
  - else → stripe.paymentIntents.create({ amount, currency:'pln', automatic_payment_methods:{enabled:true}, metadata })
  - !result.client_secret → throw
  - session.paymentIntentId = result.id ; await session.save()
Result Event: Pass client_secret to PaymentForm.client.tsx

Event: PaymentForm mounts
State: <Elements stripe={loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)} options={{ clientSecret, currency:'pln' }}>
Side Effect: <PaymentElement options={{ fields: { billingDetails: { address: 'never' } } }} />

Event: User clicks Pay
State: isLoading=true; guard if (!stripe || !elements) return
Side Effect 1: const { error: submitError } = await elements.submit()
  - submitError → setError(submitError.message ?? 'Please check your payment details.') ; isLoading=false ; return
Side Effect 2: stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/api/checkout/return`,
      payment_method_data: { billing_details: { address: { line1, postal_code, city, state, country:'PL' } } }
    }
  })
Result Event:
  - success → browser redirects (function does not return)
  - error → setError(error?.message ?? 'Payment failed. Please try again.') ; isLoading=false
```

### Events + Payloads
```typescript
// iron-session (lib/session.ts — CheckoutSession interface)
interface CheckoutSession {
  basket: Array<{ productId: string; quantity: number }>
  address?: {
    regionCode: string
    postalCode: string
    street: string
    streetNumber: string
    city: string
  }
  shippingCode?: string
  shippingCost?: number              // grosz
  paymentIntentId?: string           // Stripe PI id
  completedPaymentIntentId?: string  // privacy-guard key for /checkout/success (written by return Route Handler)
}

// Server Component → Client Component
interface PaymentFormProps {
  clientSecret: string               // never null (Server Component throws if missing)
  address: NonNullable<CheckoutSession['address']>  // passed for billing_details push
}
```

### Transition Table
| From | Event | Guard | To | Side effect |
|---|---|---|---|---|
| `/checkout/shipping` | submit | shipping saved | `/checkout/payment` | session.shippingCost set |
| `/checkout/payment` mount | guards | any missing | `/basket` or `/checkout/address` or `/checkout/shipping` | none |
| `/checkout/payment` mount | guards | all pass | render page | PI create/update + session.save |
| Pay click | `confirmPayment` | success | `/api/checkout/return` | browser redirect (Stripe) |
| Pay click | `confirmPayment` | error | stay | setError inline; isLoading=false |

### Hard Architecture Contracts (must not drift)
1. **`return_url` = `${origin}/api/checkout/return`** (Route Handler). The path `/checkout/return` does NOT exist anywhere.
2. **Currency unit = integer grosz** end-to-end. Never floats. Never "cents".
3. **Billing collection suppression**: `<PaymentElement options={{ fields: { billingDetails: { address: 'never' } } }} />` + push `session.address` via `confirmParams.payment_method_data.billing_details`.
4. **paymentIntentId is idempotent**: `update` on revisit; `create` only when absent or on terminal-state catch.
5. **`session.completedPaymentIntentId`** is written by the next sprint's Route Handler — this sprint must declare the field in `CheckoutSession` but never write to it.
6. **`app/checkout/error.tsx` is mandatory** before any throw-path code ships.
7. **All funnel guards run before any external call** (no half-rendered pages with side effects).

### Simplicity Guardrail
"If a guard or branch can be expressed in one line without adding an abstraction, do it that way."

---

## PHASE 3: Scope Contracts

Five contracts, executed in order. Each is self-contained and verifies the ground for the next.

---

### Scope Contract 1 — Foundation: Session shape, error boundary, dev seed route, Stripe Dashboard preconditions

**Source tasks:** Task 1, Task 2, Task 2.5, Task 12 (seed route) from `tasks-decomposition.md`.

#### UX Slice
- No user-visible UX change yet.
- After this scope: a thrown error anywhere under `/checkout/*` renders a recoverable "Something went wrong" component (not the global 500).

#### Architecture Slice
- Add `paymentIntentId?: string` and `completedPaymentIntentId?: string` to `CheckoutSession` in `lib/session.ts`.
- Create `app/checkout/error.tsx` (Client Component error boundary, minimal — `Try again` button + link to `/basket`).
- Create `app/(test)/checkout-seed/route.ts` with two-gate security:
  1. `process.env.NODE_ENV !== 'production'`
  2. query `secret` matches `process.env.CHECKOUT_SEED_SECRET`
  Scenarios needed for downstream tests: `missing-address`, `shipping-zero`, `invalid-product-id`, `zero-quantity`, `grand-total-zero`, `succeeded-pi`.
- Verify Stripe Dashboard preconditions (no code change — checklist only):
  - Settings → Payment methods (PLN): Card + Blik enabled.
  - Developers → Webhooks: endpoint registered, subscribed to `payment_intent.succeeded`, `STRIPE_WEBHOOK_SECRET` in `.env.local`.

#### Human Verification Checklist (<5 min)
- [ ] `lib/session.ts` exports `CheckoutSession` with the two new optional fields; `npx tsc --noEmit` passes.
- [ ] Insert a temporary `throw new Error('test')` in any page under `app/(store)/checkout/*` → reload → CheckoutError component renders (not Next.js global 500). Remove the throw.
- [ ] Hit `/checkout-seed?scenario=missing-address` with no `secret` → 403. With wrong `secret` → 403. With correct secret → 302 redirect to `/checkout/payment`.
- [ ] Set `NODE_ENV=production` locally and hit the route → 404. Restore env.
- [ ] Stripe Dashboard checklist (Test 0 in `acceptance-tests.md`) printed and ticked.

#### Minimal Tests (only what builds human confidence)
- None automated yet. The throw-test above is the load-bearing manual proof that `error.tsx` is wired.

#### Cover-and-Move
- Verified before next scope: every later scope assumes `error.tsx` catches throws and the seed route can construct any test scenario.

---

### Scope Contract 2 — Server Component shell + funnel guards

**Source tasks:** Task 3, Task 4 from `tasks-decomposition.md`. Tests 1, 1.5, 1.6, 2, 2.5, 3, 6.5 from `acceptance-tests.md`.

#### UX Slice
- User without an address landing on `/checkout/payment` is redirected to `/checkout/address` (and analogous for missing basket / shipping).
- User with `shippingCost: 0` (free shipping) is NOT redirected — they see the payment page.

#### Architecture Slice
- Create `app/(store)/checkout/payment/page.tsx` — Server Component, no `'use client'`.
- Read session via `getCheckoutSession()`.
- Apply funnel guards top-to-bottom (order is load-bearing; quantity validation must run before any Sanity call):
  1. `!session.basket?.length` → `redirect('/basket')`
  2. `session.basket.some(i => !Number.isInteger(i.quantity) || i.quantity < 1)` → `redirect('/basket?error=invalid_basket')`
  3. `!session.address` → `redirect('/checkout/address')`
  4. `session.shippingCost === undefined || session.shippingCost === null` → `redirect('/checkout/shipping')` *(NOT truthiness — `0` is valid)*
- Render a placeholder `<div>payment page (guards passed)</div>` for now.

#### Human Verification Checklist (<5 min)
- [ ] Clear cookies, visit `/checkout/payment` → redirected to `/basket`.
- [ ] Seed `missing-address` → visit `/checkout/payment` → redirected to `/checkout/address`.
- [ ] Seed `shipping-zero` → visit `/checkout/payment` → page renders (no redirect).
- [ ] Seed `zero-quantity` → visit `/checkout/payment` → redirected to `/basket?error=invalid_basket`. **Server logs confirm NO Sanity query was issued.**
- [ ] Complete a real flow → land on payment page with placeholder div.

#### Minimal Tests
- None automated. The five manual flows above are the entire confidence-building surface for this scope.

#### Cover-and-Move
- Verified before next scope: page renders only with a fully valid session slice; no external call has happened yet, so adding the Sanity call in Scope 3 is the next responsibility-add.

---

### Scope Contract 3 — Sanity reality check + master calculation

**Source tasks:** Task 5, Task 6 from `tasks-decomposition.md`. Tests 4, 4.5, 4.6, 5, 6, 7, 7.5 from `acceptance-tests.md`.

#### UX Slice
- User with an out-of-stock item is redirected to `/basket?error=out_of_stock&id=<productId>`.
- User with an invalid total (e.g. zero-priced basket + free shipping) is redirected to `/basket?error=invalid_total`.
- User with a corrupted basket (productId not in Sanity, or product with null price) sees the recoverable error component — not a generic 500.

#### Architecture Slice
- **Blocking deliverable**: open `sanity-cms/schemaTypes/productType.ts` and `sanity.types.ts`; pin the exact field paths for `price_data.unit_amount` and `stock` (TS types + GROQ paths). If the observed paths differ, update the GROQ below and re-pin in `tasks-decomposition.md` Task 5.0.
- GROQ: `*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount }, stock }`.
- Data integrity guard: `if (sanityProducts.length !== session.basket.length) throw new Error('Product mismatch — basket contains unknown product IDs')`.
- Stock guard: `if (any product.stock === 0) redirect('/basket?error=out_of_stock&id=<product._id>')`.
- Price validity guard (must run before any arithmetic): `if (!Number.isFinite(product.price_data?.unit_amount)) throw new Error('Product <id> has invalid price')`.
- Subtotal: `Σ(product.price_data.unit_amount × session_item.quantity)` (grosz, integer).
- Grand total: `Math.round(subtotal + session.shippingCost)`.
- Recoverable: `if (grandTotal < 1) redirect('/basket?error=invalid_total')`.

#### Human Verification Checklist (<5 min)
- [ ] Real flow → server logs show GROQ called, count matches basket, subtotal + grandTotal printed as integers.
- [ ] Seed `invalid-product-id` → `/checkout/payment` renders the CheckoutError component (NOT global 500). No Stripe call in logs.
- [ ] Manually clear `price_data.unit_amount` on one test product in Sanity → add to basket → `/checkout/payment` renders CheckoutError. **Restore the field after.**
- [ ] Set one product's `stock` to 0 → add to basket → redirected to `/basket?error=out_of_stock&id=<that_product_id>`.
- [ ] Seed `grand-total-zero` → redirected to `/basket?error=invalid_total`. No Stripe call.

#### Minimal Tests
- None automated. PII in dev logs gated by `NODE_ENV !== 'production'` if a log statement contains `session.address`.

#### Cover-and-Move
- Verified before next scope: `grandTotal` is a positive integer in grosz; safe to pass to Stripe's `amount`.

---

### Scope Contract 4 — Idempotent Stripe PaymentIntent (create / update / recover)

**Source tasks:** Task 7, Task 8 from `tasks-decomposition.md`. Test 8 (all three sub-scenarios) + Test 13 from `acceptance-tests.md`.

#### UX Slice
- Refreshing the payment page never creates a duplicate PaymentIntent (Stripe Dashboard shows one PI per checkout attempt).
- Editing upstream (address / basket / shipping) then returning to payment refreshes the existing PI with the new amount + metadata; never leaves a stale PI at confirmation time.

#### Architecture Slice
- Build flattened metadata from `session.address` (5 string keys: `regionCode`, `postalCode`, `street`, `streetNumber`, `city`). *(Tech debt: this should be Stripe `shipping` parameter; blocked on address page collecting `name`. Tracked, not fixed here.)*
- **Branch A** (`session.paymentIntentId` exists):
  - `try { result = await stripe.paymentIntents.update(id, { amount: grandTotal, metadata }) }`
  - `catch { session.paymentIntentId = undefined; fall through to Branch B }` *(tracer: catch-all; production should narrow to `payment_intent_unexpected_state`)*
- **Branch B** (no id, or just cleared):
  - `result = await stripe.paymentIntents.create({ amount, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata })`
  - `session.paymentIntentId = result.id`
- Converge: `if (!result.client_secret) throw new Error('Stripe did not return client_secret')`; `await session.save()` unconditionally.
- Create a stub `PaymentForm.client.tsx` (just renders `clientSecret` length) so the props contract is real but no Stripe Elements yet.

#### Human Verification Checklist (<5 min)
- [ ] Fresh flow → server logs show `paymentIntents.create()`; `paymentIntentId` appears in browser cookie inspector after save.
- [ ] Refresh page → server logs show `paymentIntents.update()` (NOT create); Stripe Dashboard shows one PI; client_secret extracted from update response.
- [ ] Seed `succeeded-pi` → visit `/checkout/payment` → server logs show update catch fired → create with fresh PI → new id stored.
- [ ] Edit address → shipping cascade clears `shippingCost` → guard redirects to `/checkout/shipping` → re-select shipping → return to payment → server logs show `update()` (same id) with NEW amount + address metadata. Stripe Dashboard confirms updated PI.
- [ ] Stripe Dashboard → PI metadata shows all 5 address fields as strings.

#### Minimal Tests
- None automated. The "stale PI invariant" (Test 13 in `acceptance-tests.md`) is the single load-bearing manual check above.

#### Cover-and-Move
- Verified before next scope: `clientSecret` is a typed non-null string when the Server Component finishes; Client Component can rely on it.

---

### Scope Contract 5 — Client Component: Elements + PaymentElement (billing suppressed) + execution

**Source tasks:** Task 9, Task 10, Task 11 from `tasks-decomposition.md`. Tests 9, 10, 11, 12 from `acceptance-tests.md`.

#### UX Slice
- User sees Stripe's payment form (Card, Blik, optional Apple Pay) but **no billing-address fields** (already collected at `/checkout/address`).
- Pay button is disabled and shows loading state during submission.
- On decline / SDK error: inline message appears; Pay button re-enables; user stays on page.
- On success: browser is redirected by Stripe to `/api/checkout/return` (handled by the next sprint).

#### Architecture Slice
- `PaymentForm.client.tsx` — first line `'use client'`.
- Outside component: `const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)`.
- Guard: `if (!clientSecret) return <p>Loading payment form…</p>` (defensive; Server Component should never pass empty).
- Mount: `<Elements stripe={stripePromise} options={{ clientSecret, currency: 'pln' }}>`.
- Render: `<PaymentElement options={{ fields: { billingDetails: { address: 'never' } } }} />`.
- State: `isLoading: boolean`, `error: string | null`.
- On Pay click:
  1. `if (!stripe || !elements) return`
  2. `setIsLoading(true); setError(null)`
  3. `const { error: submitError } = await elements.submit()`; if present → `setError(submitError.message ?? 'Please check your payment details.')`; `setIsLoading(false)`; return.
  4. Build `billing_details` from the `address` prop:
     ```ts
     const billing_details = { address: { line1: `${a.street} ${a.streetNumber}`, postal_code: a.postalCode, city: a.city, state: a.regionCode, country: 'PL' } }
     ```
  5. `const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: \`${window.location.origin}/api/checkout/return\`, payment_method_data: { billing_details } } })`
  6. `setError(error?.message ?? 'Payment failed. Please try again.')` (keep `?.`); `setIsLoading(false)`.

#### Human Verification Checklist (<5 min)
- [ ] Page loads; PaymentElement iframe renders with Card + Blik tabs visible. **NO billing-address inputs.**
- [ ] Enter Stripe test card `4242 4242 4242 4242` → click Pay → Pay disabled with loading state → browser URL becomes `/api/checkout/return?payment_intent=pi_xxx&...`. (Route Handler not yet implemented — expect a 404 here; that's the next sprint.)
- [ ] Enter decline card `4000 0000 0000 0002` → click Pay → inline error renders ("Your card was declined." or similar); Pay re-enables; URL unchanged.
- [ ] Click Pay before iframe fully loads (fast double-click test) → handler returns early; no crash.
- [ ] Stripe Dashboard: succeeded PI shows `metadata` with 5 address fields AND PaymentMethod's `billing_details.address` matching `session.address` (line1 = `${street} ${streetNumber}`, country = `PL`).

#### Minimal Tests
- None automated. The five manual flows are the entire surface; automating Stripe Elements + iframe interactions would exceed human readability for a tracer.

#### Cover-and-Move
- Verified by end-to-end: Stripe successfully redirects on success → Route Handler at `/api/checkout/return` becomes the next sprint's entry point.

---

## PHASE 4: Continuous Verification

After EACH scope contract above:
1. Run the human verification checklist immediately.
2. Run minimal tests (if any). For this sprint: there are none — manual checklists are the load-bearing proof.
3. Confirm out loud: **"Is this the simplest possible way?"** If a guard, branch, or abstraction can be removed without losing the contract, remove it before proceeding.
4. Only then start the next scope contract.

**No batched verification.** No "implement all five then test." No deferred unit/integration test split.

---

## PHASE 5: Final Human Check

After Scope Contract 5 passes its checklist:

### End-to-End Walkthrough
1. Clear cookies. Add a real product to basket. Complete address. Complete shipping. Land on `/checkout/payment`.
2. **UX flows match Phase 1 target state** (re-read Phase 1 — every step renders).
3. PaymentElement renders without billing-address inputs.
4. Pay → Stripe redirects to `/api/checkout/return` (404 expected; next sprint).
5. Refresh during step 4 attempt → same PI is reused (verify in Stripe Dashboard).
6. Edit address → shipping reset → re-select shipping → back on payment → PI updated, NOT replaced.
7. `npx tsc --noEmit` passes.
8. `npm run build` succeeds.

### Sprint Done When
- [ ] All five scope contracts pass their human checklists.
- [ ] End-to-end walkthrough above is clean.
- [ ] `app/checkout/error.tsx` exists and was proven to catch throws.
- [ ] `app/(test)/checkout-seed/route.ts` is two-gate-protected; `CHECKOUT_SEED_SECRET` is in `.env.local` only.
- [ ] No new tests created beyond what the manual checklists need.

---

## PHASE 6: Simplicity Guardrails (live during execution)

- **Single source of truth**: iron-session for state; `lib/stripe.ts` for the Stripe client; `lib/session.ts` for the type. Anything else is a candidate for deletion.
- **Two endpoints, not one**: never write `/checkout/return` (it does not exist). Always `/api/checkout/return` for the Route Handler.
- **Guard order is contract**: top-to-bottom, all before external calls. Reordering them is a contract change, not a refactor.
- **Recoverable redirects vs throws**: user-recoverable conditions (out_of_stock, invalid_basket, invalid_total) MUST use `redirect`. Data corruption (product mismatch, NaN price, missing client_secret) MUST `throw` to `error.tsx`. Never invert this.
- **Currency unit**: integer grosz everywhere. If a number becomes a float, the design is wrong.
- **Logging discipline**: any log line containing `session.address` or basket items is dev-only — gate with `process.env.NODE_ENV !== 'production'` before merging.

**Five-minute rule:** if a sub-task takes longer than five minutes to *explain* to a colleague, it is too complex; split it or simplify it before continuing.

---

## PHASE 7: Execution Protocol (per scope contract)

```
1. Read the scope contract's UX Slice + Architecture Slice.
2. Implement only what's in those two slices. Nothing else.
3. Run the Human Verification Checklist immediately. Stop on first fail.
4. Ask: "Is this the simplest possible way?" Remove anything that did not earn its place.
5. Only then move to the next scope contract.
```

### Delegation
- **Implementation:** `/implement Scope Contract <N> from _project/sprints/payment-page-tracer.md`
- **Verification:** the human checklist for that scope contract (above)
- **Final check:** PHASE 5 walkthrough

---

## PHASE 8: Post-Sprint /learn

Trigger: PHASE 5 walkthrough passes.

Run `/learn` and answer:
- Did the funnel-guard-first ordering catch any production-bug class?
- Did the dev seed route save time vs ad-hoc cookie editing?
- Did the manual checklists catch what automated tests would have missed (Stripe iframe behavior, billing suppression visual check)?
- Did the "no `/checkout/return` path" constraint hold under pressure?
- Did the `paymentIntentId` idempotency invariant survive the "edit address mid-flow" path?

---

## Out of Scope (DO NOT touch in this sprint)

- `/api/checkout/return` Route Handler — next sprint.
- `/checkout/success` Server Component — next sprint.
- Stripe webhook handler at `app/api/webhooks/stripe/route.ts` — separate scope; pre-existence is a Phase-1 precondition (Test 0 webhook checklist) but implementation is not in this sprint.
- Sanity order schema authoring — webhook scope.
- Migration of address from `metadata` to Stripe `shipping` parameter — blocked on address page collecting `name`; tracked as tech debt.

---

## Hard Dependencies (must exist BEFORE scope 4)

- `lib/stripe.ts` exporting `stripe` instance backed by `STRIPE_SECRET_KEY`.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`.
- Stripe Dashboard payment methods enabled (PLN: Card + Blik) — Test 0.
- Stripe webhook endpoint registered (`payment_intent.succeeded`, `STRIPE_WEBHOOK_SECRET`) — needed so end-to-end Test 14 will eventually pass when the return + webhook sprints land. Not blocking for this sprint's PHASE 5 walkthrough.

---

## Source of Truth

When this sprint contradicts itself or another doc, the precedence is:
1. `docs/checkout/payment/framed-objective.md` (lifecycle table is authoritative)
2. `docs/checkout/payment/tasks-decomposition.md`
3. `docs/checkout/payment/acceptance-tests.md`
4. This sprint file

Drift in either direction = contract violation. Fix the implementation, never the contract.
