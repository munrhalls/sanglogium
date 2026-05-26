# Acceptance Tests - Payment Page

**Happy path tracer only. Manual verification on dev server.**

*Important*: session refers to iron-session, the checkout session

*PII in dev logs*: Several tests below assert that the server logs `session.address` and basket items in full. These assertions are **dev-only**. Before the code ships, gate the address log behind `process.env.NODE_ENV !== 'production'` (or remove it). Address fields are PII and must not be written to production log aggregators in plain text.

*Return-flow naming — used consistently below*:
- `/api/checkout/return` = Route Handler (`app/api/checkout/return/route.ts`). Stripe's `return_url` target. Verifies PI server-side, manages session lifecycle, redirects to `/checkout/success`.
- `/checkout/success` = Server Component (`app/checkout/success/page.tsx`). Privacy-guarded display surface. Only renders if URL `payment_intent` matches `session.completedPaymentIntentId` set by the Route Handler.
- The path `/checkout/return` does **not** exist anywhere; never use it.

*Order persistence is webhook-driven, not return-flow-driven*: this payment-page tracer assumes a Stripe webhook handler (`app/api/webhooks/stripe/route.ts`, separate doc) listens for `payment_intent.succeeded` and idempotently writes the order to Sanity (find-or-create by `paymentIntentId`) + decrements stock. `/checkout/success` only reads the resulting order. None of these tests verify order creation directly — that belongs to the webhook doc. If the webhook does not exist, successful payments produce charges with no order record. Test 14 is the cross-scope reachability check.

*Session injection for manual tests*: iron-session is an encrypted cookie — you cannot edit it from the browser. To execute the edge-case tests below, use the dev-only seed route `app/(test)/checkout-seed/route.ts?scenario=<name>&secret=<CHECKOUT_SEED_SECRET>` (see Task 12 in tasks-decomposition.md). The route writes scenario state into the session and redirects to `/checkout/payment`. **Two gates required**: (1) `NODE_ENV !== 'production'`, AND (2) query `secret` matches `process.env.CHECKOUT_SEED_SECRET`. `CHECKOUT_SEED_SECRET` MUST be unset in production AND preview environments — set only in `.env.local` for local dev.

## Test 0: Stripe Dashboard preconditions (run ONCE before any other test)
- Stripe Dashboard → Settings → Payment methods. For currency `PLN`:
  - [ ] **Card** is enabled
  - [ ] **Blik** is enabled
  - [ ] (optional) Apple Pay / Google Pay enabled
  *(With `automatic_payment_methods: { enabled: true }` and zero enabled methods, `<PaymentElement />` renders an EMPTY form with no client-side error. Skipping this check leads to false-positive bug reports.)*
- Stripe Dashboard → Developers → Webhooks. Confirm:
  - [ ] Endpoint URL points at `app/api/webhooks/stripe/route.ts` (production URL or local-dev tunnel via `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
  - [ ] Subscribed event: `payment_intent.succeeded`
  - [ ] `STRIPE_WEBHOOK_SECRET` is in `.env.local` for signature verification
  *(Without this, paid orders are never written to Sanity — Test 14 will always fail.)*

## Test 1: Payment page guard redirects to basket if session missing
- Clear session, navigate to /checkout/payment
- [ ] Redirects to /basket
  *(basket guard fires first — no session means no/empty basket; basket is the funnel entry point)*

## Test 1.5: Payment page guard redirects to basket if basket is empty
- Session has address and shippingCost, but basket array is empty
- [ ] Redirects to /basket

## Test 1.6: Payment page guard redirects to address if address missing
- Session has non-empty basket but no address
- [ ] Redirects to /checkout/address

## Test 2: Payment page guard redirects to shipping if shippingCost missing
- Session has basket + address but `shippingCost === undefined`, navigate to /checkout/payment
- [ ] Redirects to /checkout/shipping
  *(guard uses `=== undefined` — not truthiness — so `shippingCost: 0` (free shipping) is valid and does NOT redirect)*

## Test 2.5: Payment page accepts shippingCost = 0 (free shipping)
- **Setup**: hit `/checkout-seed?scenario=shipping-zero&secret=$CHECKOUT_SEED_SECRET` (writes basket + address + `shippingCost: 0` into session)
- Then navigate to /checkout/payment
- [ ] Does NOT redirect to /checkout/shipping
- [ ] Grand total = subtotal (no shipping added)

## Test 3: Server Component reads session correctly
- Navigate to /checkout/payment with valid session (basket, address, shippingCode, shippingCost)
- [ ] Server logs show session.basket (array of `{ productId, quantity }`)
- [ ] Server logs show session.address (all 5 fields: regionCode, postalCode, street, streetNumber, city)
- [ ] Server logs show session.shippingCode
- [ ] Server logs show session.shippingCost (integer in grosz)
- [ ] After first PI creation: server logs show session.paymentIntentId

## Test 4: Server Component fetches product prices from Sanity
- On payment page with valid session
- [ ] Server logs show productIds extracted from session.basket
- [ ] Server logs show Sanity response: each product has `_id`, `price_data.unit_amount`, `stock`
- [ ] Server logs show prices extracted as integers (grosz)
- [ ] Server logs show `sanityProducts.length === session.basket.length`
  *(count mismatch indicates productId/_id mapping bug or unknown product in basket — must throw, never silently under-charge)*

## Test 4.5: Sanity result count mismatch is fatal
- **Setup**: hit `/checkout-seed?scenario=invalid-product-id&secret=$CHECKOUT_SEED_SECRET` (writes a known-bad productId into session.basket alongside one valid item)
- Then navigate to /checkout/payment
- [ ] Server throws `Product mismatch — basket contains unknown product IDs`
- [ ] CheckoutError boundary (`app/checkout/error.tsx`) renders — NOT the global Next.js 500 page
- [ ] Subtotal is NOT silently calculated from the partial result set

## Test 4.6: Sanity product with null/undefined unit_amount is fatal
- **Setup**: in Sanity Studio, temporarily clear `price_data.unit_amount` on a test product, add it to a basket via normal flow, then navigate to /checkout/payment. (Restore the field after the test.)
- [ ] Server throws `` Product <id> has invalid price ``
- [ ] CheckoutError boundary renders
- [ ] No Stripe Payment Intent call is made
  *(without this guard, `NaN` arithmetic silently bypasses `grandTotal < 1` because `NaN < 1` is false, and Stripe rejects with an opaque "Invalid integer" error)*

## Test 5: Server Component checks stock availability
- On payment page with valid session
- [ ] Server logs show stock check for each item (product.stock)
- [ ] If any item stock = 0, redirect to /basket?error=out_of_stock&id={product._id}
  *(product._id must identify the specific out-of-stock item)*

## Test 6: Server Component calculates subtotal
- On payment page with valid session
- [ ] Server logs show subtotal: Σ(price_data.unit_amount × session quantity)
- [ ] Subtotal is an integer (grosz)

## Test 6.5: Basket quantity guard rejects zero/negative/non-integer quantities
- **Setup**: hit `/checkout-seed?scenario=zero-quantity&secret=$CHECKOUT_SEED_SECRET` (writes a basket item with `quantity: 0`)
- Then navigate to /checkout/payment
- [ ] Redirects to `/basket?error=invalid_basket`
- [ ] **NO Sanity query is made** (server logs show no GROQ call) — the guard runs in Task 4 funnel guards, BEFORE the Sanity reality check in Task 5
- [ ] No subtotal arithmetic runs; no Stripe call is made
- [ ] Repeat with `quantity: -1` and `quantity: 1.5` — same redirect

## Test 7: Server Component calculates grand total
- On payment page with valid session
- [ ] Server logs show grand total: Math.round(subtotal + session.shippingCost)
- [ ] Grand total is an integer (grosz)

## Test 7.5: grandTotal < 1 redirect (recoverable, no unhandled throw)
- **Setup**: hit `/checkout-seed?scenario=grand-total-zero&secret=$CHECKOUT_SEED_SECRET` (seeds a basket of zero-priced items + `shippingCost: 0`). If no zero-priced product exists in Sanity, the seed route may instead mock the Sanity response for this scenario.
- Then navigate to /checkout/payment
- [ ] Redirects to `/basket?error=invalid_total`
- [ ] No Stripe Payment Intent call is made
- [ ] User remains inside the funnel (no error.tsx, no global 500 page)

## Test 8: Stripe Payment Intent — idempotent create/update
- **First visit** (no paymentIntentId in session):
  - [ ] Server logs show stripe.paymentIntents.create() called
  - [ ] amount = grand total (integer), currency = 'pln'
  - [ ] Metadata shows all 8 address fields + email as strings (firstName, lastName, phone, regionCode, postalCode, street, streetNumber, city, email)
  - [ ] Server logs show client_secret is not null
  - [ ] Server logs show client_secret extracted
  - [ ] paymentIntentId stored in session
- **Second visit** (refresh / back-forward, paymentIntentId already in session):
  - [ ] Server logs show stripe.paymentIntents.update() called — NOT create()
  - [ ] Update includes both amount AND metadata (all 5 address fields)
  - [ ] Server logs show client_secret extracted from update() response
  - [ ] Stripe Dashboard shows only ONE Payment Intent for this order attempt
- **After a terminal-state PI** (session has paymentIntentId of a `succeeded` or `canceled` PI — e.g. from an abandoned previous attempt):
  - **Setup**: hit `/checkout-seed?scenario=succeeded-pi&secret=$CHECKOUT_SEED_SECRET` to write a known-terminal `paymentIntentId` directly. *(Note: the "complete a real payment first" path is architecturally unreachable — the Route Handler at `/api/checkout/return` clears `paymentIntentId` during Stripe's redirect, before the user can navigate anywhere; the seed route is the only way to construct this state.)*
  - [ ] update() throws — server logs show catch triggered
  - [ ] paymentIntentId cleared from session
  - [ ] Server logs show stripe.paymentIntents.create() called with fresh PI
  - [ ] New paymentIntentId stored in session

## Test 9: Client Component mounts Stripe Elements
- On payment page
- [ ] Page renders without errors
- [ ] If clientSecret were missing: loading placeholder shown (not a crash)
- [ ] Stripe Elements iframe loads with valid clientSecret
- [ ] PaymentElement displays (card input, Blik, Apple Pay options)

## Test 9.5: Email field capture
- [ ] Payment page renders email input field
- [ ] Email field is required (cannot submit without email)
- [ ] Email validation rejects invalid email format
- [ ] Email is saved to session.email on form submission
- [ ] session.email is included in Stripe PaymentIntent metadata for order tracking

## Test 9.6: Itemized order summary display
- [ ] Payment page displays itemized order summary before payment button
- [ ] Order summary shows: product name, quantity, price per item, line total for each item
- [ ] Order summary shows subtotal, shipping cost, grand total
- [ ] Order summary is positioned above payment button for user verification
- [ ] Order summary data matches session.basket and session.shippingCost

## Test 10: Payment execution — happy path
- Wait for PaymentElement to fully initialize, enter valid test card details, click Pay
- [ ] Pay button is disabled and shows loading state during processing
  *(if Pay clicked before Stripe.js loads, handler returns early — no crash)*
- [ ] PaymentElement does NOT render its own billing-address inputs (the user types their address only ONCE, at `/checkout/address`) — confirms the `fields.billingDetails.address: 'never'` suppression
- [ ] elements.submit() is called successfully (no validation errors)
- [ ] Stripe confirms payment
- [ ] Browser redirects to **`/api/checkout/return`** (the Route Handler), NOT `/checkout/return` (which does not exist)
- [ ] The Route Handler verifies the PI, then redirects to `/checkout/success?payment_intent=...`
- [ ] After landing on `/checkout/success`: server-side, the Route Handler has already cleared `basket`, `address`, `shippingCode`, `shippingCost`, `paymentIntentId`, and stored `paymentIntentId` into `session.completedPaymentIntentId` for the success-page privacy guard

## Test 11: Payment execution — error inline display
- Enter a Stripe test decline card (e.g. 4000000000000002), click Pay
- [ ] confirmPayment() returns (does not redirect) — destructured as `const { error } = await stripe.confirmPayment(...)`
- [ ] Pay button re-enables after error
- [ ] Inline error message displayed via `setError(error?.message ?? 'Payment failed. Please try again.')` *(optional chaining mandatory — `error` may be undefined in edge SDK cases; without `?.`, runtime crash on `.message`)*
- [ ] If `elements.submit()` returns an error with undefined `message`, fallback 'Please check your payment details.' is displayed (no silent failure)
- [ ] User is NOT redirected

## Test 12: Stripe Dashboard verification
- After successful payment
- **How to navigate**: Stripe Dashboard → Developers → **Payments** (or **Payment Intents** under Developers → Events → filter by `payment_intent.succeeded`) → find the PI by amount + timestamp → click the row → scroll to the **Metadata** section.
- [ ] Stripe Dashboard shows PaymentIntent with correct integer amount (grosz)
- [ ] Stripe Dashboard shows currency = pln
- [ ] Stripe Dashboard shows all 8 address metadata fields + email as strings
  (firstName, lastName, phone, regionCode, postalCode, street, streetNumber, city, email)
- *(Known technical debt: address belongs in Stripe's first-class `shipping` parameter, not `metadata`. Blocked on collecting a Stripe-compatible full `name`. Until then, metadata is the documented fallback. See framed-objective.md.)*

## Test 13: Stale-PI invariant after upstream edits
- Complete address → shipping → land on /checkout/payment (PI created, paymentIntentId in session)
- Navigate back to address page, edit a field, save — shipping-page cascade clears `shippingCost`
- Navigate forward to /checkout/payment
- [ ] Guard redirects to /checkout/shipping (shippingCost missing)
- Re-select shipping → land back on /checkout/payment
- [ ] Server logs show `stripe.paymentIntents.update()` called (NOT create) — same paymentIntentId reused
- [ ] Updated PI in Stripe Dashboard shows the new address in metadata and the recalculated amount
  *(invariant: PI is refreshed on every payment-page render via update(); never stale at the moment of confirmation)*

## Test 14: Order persistence (cross-cut — webhook contract)
- This test belongs to the webhook handler doc; included here only as a reachability check, paired with Test 6 in `docs/checkout/return/acceptance-tests.md`.
- After a successful payment (Test 10), open Sanity Studio and query for `*[_type == "order" && paymentIntentId == "<the_pi_id>"][0]`.
- [ ] Order document exists with: `paymentIntentId` (string, matches Stripe), `items` (array matching session.basket at confirmation time), `total` (integer grosz, matches the amount Stripe charged), `address` (the 5 fields from session.address), `orderDate` (ISO timestamp at or after the Stripe `created` time)
- [ ] Sanity field name on the order document is exactly `paymentIntentId` (NOT `payment_intent_id` or `stripePaymentIntentId`) — the success page and webhook MUST agree on this name; mismatch silently breaks Test 6 in the return scope.
- [ ] Product `stock` values in Sanity have been decremented by the basket quantities
- [ ] If Stripe redelivered the webhook event, only ONE order document exists (idempotency by `paymentIntentId`)
- [ ] If neither order nor stock decrement is observed, the Stripe webhook is missing or broken — STOP and fix that before continuing. Successful payments without orders are unrecoverable customer-trust failures.
