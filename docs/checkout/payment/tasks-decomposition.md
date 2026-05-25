# Payment Page - Tasks Decomposition

**Happy path tracer only.**

## Task Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOUNDATION LAYER                             │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 1: Update iron-session types to include paymentIntentId
│   └── Edit CheckoutSession interface in lib/session.ts
│       └── basket: { productId: string, quantity: number }[]
│           // field is productId — NOT id
│       └── address?: {
│               regionCode: string,
│               postalCode: string,
│               street: string,
│               streetNumber: string,
│               city: string
│             }
│       └── shippingCode?: string
│       └── shippingCost?: number  // in grosz — smallest PLN unit
│       └── paymentIntentId?: string  // Stripe PI id, add this field
│       └── completedPaymentIntentId?: string  // privacy-guard key for /checkout/success
│           // Set by the Route Handler at /api/checkout/return on every redirect
│           // (regardless of PI status). The success page checks
│           // searchParams.payment_intent === session.completedPaymentIntentId
│           // before rendering — prevents anyone with a leaked PI id (referer,
│           // history, link sharing) from rendering another user's order page.
│           // See docs/checkout/return/ for the full contract.
│
├── Task 2: Verify Stripe and env setup
│   └── lib/stripe.ts already exists — exports `stripe` instance, no changes needed
│   └── Verify .env.local contains:
│       └── STRIPE_SECRET_KEY  (server-side, already guarded in lib/stripe.ts)
│       └── NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (client-side, needed by Task 9)
│       // Missing NEXT_PUBLIC key causes loadStripe(undefined) — Elements silently fails
│   └── BLOCKING DELIVERABLE — verify Stripe Dashboard configuration (NOT just env vars):
│       Open Stripe Dashboard → Settings → Payment methods. For currency PLN, confirm:
│           [ ] Card (credit / debit) is enabled
│           [ ] Blik is enabled
│           [ ] (optional) Apple Pay / Google Pay enabled
│       With `automatic_payment_methods: { enabled: true }` and zero enabled methods,
│       <PaymentElement /> renders an EMPTY form with no client-side error. This is
│       the #1 cause of "the payment form is blank" reports.
│   └── BLOCKING DELIVERABLE — verify Stripe webhook endpoint registered:
│       Stripe Dashboard → Developers → Webhooks. Confirm:
│           [ ] Endpoint URL points at app/api/webhooks/stripe/route.ts (production URL or
│               local-dev tunnel via `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
│           [ ] Subscribed event: payment_intent.succeeded
│           [ ] STRIPE_WEBHOOK_SECRET is in .env.local for signature verification
│       Without a working webhook, paid orders are never written to Sanity. The
│       payment-page tracer is a dead end without this. (Webhook handler itself is
│       a separate scope — see docs/checkout/webhook/ when created. Until then,
│       Test 14 in acceptance-tests.md is the cross-scope reachability check.)
│
└── Task 2.5: Create checkout error boundary (BLOCKING dependency)
    └── Create app/checkout/error.tsx — minimal Client Component error boundary
        'use client'
        export default function CheckoutError({ error, reset }: { error: Error, reset: () => void }) {
          return (
            <div>
              <h2>Something went wrong in checkout.</h2>
              <p>{error.message}</p>
              <button onClick={reset}>Try again</button>
              <a href="/basket">Return to basket</a>
            </div>
          )
        }
    └── Required BEFORE Task 5 or 6 ships: Task 5 throws on product mismatch and
        Task 7 throws on missing client_secret. Without error.tsx at the /checkout
        segment, these throws render the global Next.js 500 page and lose all
        checkout context.
    └── Test: temporarily add `throw new Error('test')` in app/checkout/payment/page.tsx,
        load the page — verify CheckoutError component renders (not the global 500).

┌─────────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENT LAYER                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 3: Create payment page server component skeleton
│   └── app/checkout/payment/page.tsx
│   └── Import getCheckoutSession from lib/session
│   └── Import stripe from lib/stripe
│
├── Task 4: Implement funnel guards (Lead Domino) — ALL guards run BEFORE any external call (Sanity/Stripe)
│   └── ORDER MATTERS — evaluated top-to-bottom:
│       1. if (!session.basket?.length) redirect('/basket')
│          // basket is the funnel entry point — fires first; empty session = empty basket
│       2. if (session.basket.some(item => !Number.isInteger(item.quantity) || item.quantity < 1))
│            redirect('/basket?error=invalid_basket')
│          // INPUT VALIDATION — must run BEFORE the Sanity query in Task 5.
│          // Reasons:
│          //   (a) avoid an unnecessary network round trip for an already-bad input;
│          //   (b) the count-mismatch guard in Task 5 cannot detect bad quantities
│          //       (the item exists in both session and Sanity — only quantity is wrong).
│       3. if (!session.address) redirect('/checkout/address')
│       4. if (session.shippingCost === undefined || session.shippingCost === null) redirect('/checkout/shipping')
│          // MUST NOT use truthiness — 0 is falsy but valid (free shipping scenario)
│   └── Note: shippingCode is NOT guarded here — only required for post-order record keeping
│   └── Test: navigate to /checkout/payment with empty session → expect /basket (basket guard fires first)
│
├── Task 5: Implement Sanity reality check
│   └── STEP 5.0 (BLOCKING DELIVERABLE — must be filled in before any code is written):
│       Open sanity-cms/schemaTypes/productType.ts and sanity.types.ts.
│       Locate the price and stock fields. Fill in the exact paths and TypeScript
│       types observed; do not proceed until both lines have real values:
│           Verified price field path:  ____________________  (e.g. price_data.unit_amount)
│           Verified price TS type:     ____________________  (e.g. number)
│           Verified stock field path:  ____________________  (e.g. stock)
│           Verified stock TS type:     ____________________  (e.g. number)
│       If observed paths differ from `price_data.unit_amount` / `stock`, update the
│       GROQ query below AND every reference in framed-objective.md and acceptance-tests.md.
│       This forcing function exists because "confirmed" in a comment will be skipped
│       under time pressure; a fill-in-the-blank deliverable cannot be skipped silently.
│   └── Extract productIds from session.basket: session.basket.map(item => item.productId)
│   └── GROQ query: *[_type == "product" && _id in $ids]{ _id, price_data { unit_amount }, stock }
│   └── Verify and document explicitly: Confirm session.basket[].productId matches Sanity _id.
│   └── DATA INTEGRITY GUARD (mandatory):
│       if (sanityProducts.length !== session.basket.length)
│         throw new Error('Product mismatch — basket contains unknown product IDs')
│       // Without this guard, a productId-not-in-Sanity silently skips that item in the
│       // subtotal loop → user pays less than they should. Must be detected, never silent.
│   └── If any product's stock = 0 → redirect to /basket?error=out_of_stock&id={product._id}
│   └── Note: Unhandled errors propagate to Next.js error boundary (see Task 3 note re: error.tsx).
│
├── Task 6: Implement master calculation
│   └── (Quantity validation already enforced by Task 4 funnel guard — not repeated here)
│   └── PRICE VALIDITY GUARD (mandatory — run before any arithmetic):
│       for (const product of sanityProducts) {
│         if (!Number.isFinite(product.price_data?.unit_amount))
│           throw new Error(`Product ${product._id} has invalid price`)
│       }
│       // Sanity fields are optional by default. A null/undefined unit_amount
│       // produces NaN in arithmetic. NaN < 1 is FALSE — it bypasses every numeric
│       // guard and only fails at Stripe with an opaque "Invalid integer" error.
│       // Surfacing it here turns silent corruption into a recoverable error.
│   └── Match each session.basket item to its Sanity product by productId / _id
│   └── Subtotal: Σ(product.price_data.unit_amount × session_item.quantity)
│       // price_data.unit_amount is already an integer in grosz — no conversion needed
│   └── Grand total: Math.round(subtotal + session.shippingCost)
│       // Math.round() is a safety net — Stripe requires a positive integer amount
│   └── If grandTotal < 1 → redirect('/basket?error=invalid_total')
│       // Recoverable, user-facing: a throw in a Server Component renders error.tsx
│       // with no recovery path. Redirect keeps the user inside the funnel.
│
├── Task 7: Idempotent Stripe Payment Intent
│   └── Build flattenedMetadata from session.address:
│       {
│         regionCode: address.regionCode,
│         postalCode: address.postalCode,
│         street: address.street,
│         streetNumber: address.streetNumber,
│         city: address.city
│       }
│       // all 5 address fields — do NOT pass address object directly (Stripe metadata = strings)
│       // TECHNICAL DEBT (tracked, not fixed in this tracer):
│       //   Stripe's first-class `shipping: { name, address: { line1, postal_code,
│       //   city, state, country } }` parameter is the correct destination for
│       //   structured address (Dashboard Shipping section, Radar fraud signals).
│       //   `shipping.name` is REQUIRED. lib/session.ts CheckoutSession.address has
│       //   no name field today — the address page must collect one first. Until
│       //   that upstream change lands, address stays flattened into metadata.
│       //   Migration issue: "Address page collects name → payment page moves
│       //   address from metadata to Stripe `shipping` parameter."
│   │
│   └── Branch A — session.paymentIntentId exists:
│       └── try:
│           └── result = await stripe.paymentIntents.update(session.paymentIntentId, {
│                 amount: grandTotal,
│                 metadata: flattenedMetadata
│               })
│       └── catch (err):
│           └── session.paymentIntentId = undefined  // clear stale id
│           └── fall through to Branch B
│           // NOTE: catches ALL Stripe errors, not only terminal-state
│           // (payment_intent_unexpected_state). Network failures, invalid keys,
│           // rate limits also fall through and silently create a new PI.
│           // Acceptable for tracer. Production: inspect err.code and only fall
│           // through for payment_intent_unexpected_state; rethrow others.
│   │
│   └── Branch B — no paymentIntentId (or just cleared in catch):
│       └── result = await stripe.paymentIntents.create({
│               amount: grandTotal,
│               currency: 'pln',
│               automatic_payment_methods: { enabled: true },
│               // required for PaymentElement (Blik, Apple Pay, cards)
│               metadata: flattenedMetadata
│             })
│       └── session.paymentIntentId = result.id
│   │
│   └── After both branches converge:
│       └── const { client_secret } = result
│           // both create() and update() return a full PaymentIntent object with client_secret
│       └── if (!client_secret) throw new Error('Stripe did not return client_secret')
│           // client_secret is typed string | null — guard before passing to client
│       └── await session.save()  // unconditional — persists paymentIntentId in all cases
│           // NOTE: on the update path, paymentIntentId is unchanged — this save()
│           // is a redundant cookie write. Deliberate trade-off for simplicity.
│           // Production: skip save() when no session field changed.
│   └── Note: Unhandled Stripe API errors propagate to Next.js error boundary.
│
└── Task 8: Handoff to Client Component
    └── Create PaymentForm.client.tsx skeleton
    └── FIRST LINE OF FILE MUST BE: 'use client'
        // Mandatory in Next.js 15 — without it, useState/useStripe/useElements
        // throw a server-context error. The .client.tsx filename is human
        // convention only; Next.js enforces the directive, not the filename.
    └── Pass client_secret as prop (typed string — null already guarded above)
    └── Render PaymentForm in page.tsx

┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENT LAYER                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 9: Set up Stripe Elements provider
│   └── Install @stripe/stripe-js and @stripe/react-stripe-js (if not already installed)
│   └── Initialize outside component (avoids re-init on renders):
│       const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
│   └── In PaymentForm component — guard before mounting Elements:
│       if (!clientSecret) return <p>Loading payment form…</p>
│       // prevents useStripe() returning null and crashing on submit
│   └── Mount Elements:
│       <Elements stripe={stripePromise} options={{ clientSecret, currency: 'pln' }}>
│       // currency: 'pln' pre-filters payment methods before form renders
│
├── Task 10: Add email field capture
│   └── Render email input field in PaymentForm component
│   └── Validate email format (Zod schema or HTML5 email validation)
│   └── Save email to session.email on form submission via Server Action
│   └── Email is required field for order confirmations and support

├── Task 11: Render itemized order summary
│   └── Create OrderSummary component (Server Component or Client Component)
│   └── Display basket items with: product name, quantity, price per item, line total
│   └── Display subtotal, shipping cost, grand total
│   └── Position order summary before payment button for user verification
│   └── Purpose: Users verify what they're paying for before final payment (reduces chargebacks)

├── Task 12: Render Stripe PaymentElement
│   └── Use <PaymentElement /> from @stripe/react-stripe-js
│   └── SUPPRESS billing address collection — we already have it in session.address:
│       <PaymentElement options={{ fields: { billingDetails: { address: 'never' } } }} />
│       // Without this, Stripe's element renders its own billing-address inputs and
│       // the user types the address twice; the version stored on the resulting
│       // PaymentMethod will diverge from session.address. Suppressing pushes the
│       // single canonical address (session.address) into the PaymentIntent at
│       // confirm time via confirmParams.payment_method_data (Task 13).
│
└── Task 13: Implement payment execution
    └── const stripe = useStripe()
    └── const elements = useElements()
    └── Add isLoading (boolean) + error (string | null) state (useState)
    └── Add Pay button — disabled while isLoading = true
    └── On click:
        └── if (!stripe || !elements) return
            // hooks return null until Stripe.js finishes loading — guard before use
        └── Set isLoading = true, clear error
        └── const { error: submitError } = await elements.submit()
            if (submitError) {
              setError(submitError.message ?? 'Please check your payment details.')
              // StripeError.message is typed string | undefined — fallback prevents
              // setError(undefined) which renders nothing (silent failure)
              setIsLoading(false)
              return
            }
        └── // Build billing_details from the session.address prop passed by the Server Component:
            const billingDetails = {
              address: {
                line1: `${a.street} ${a.streetNumber}`,
                postal_code: a.postalCode,
                city: a.city,
                state: a.regionCode,
                country: 'PL',
              },
            }
            const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}/api/checkout/return`,
                // CRITICAL: must be the Route Handler path /api/checkout/return
                // (not /checkout/return — that path does not exist). The Route
                // Handler verifies the PI server-side, manages session lifecycle,
                // and redirects to /checkout/success.
                payment_method_data: { billing_details: billingDetails },
                // Pushes the canonical session.address into the PaymentMethod
                // since PaymentElement billing collection was suppressed.
              }
            })
            // Destructure directly — type-safe; confirmPayment() ONLY returns on error.
            // On success: Stripe redirects the browser — code below never runs.
        └── setError(error?.message ?? 'Payment failed. Please try again.')
            // Keep optional chaining: even after destructuring, `error` is not
            // guaranteed populated across all SDK versions/edge cases. Never
            // call .message on a possibly-undefined value.
        └── setIsLoading(false)
    └── Dependency: the Route Handler at app/api/checkout/return/route.ts must exist —
        it is the Stripe redirect target (return_url above), it verifies the PI
        server-side, manages session lifecycle (see paymentIntentId lifecycle in
        framed-objective.md), and redirects to app/checkout/success/page.tsx for
        display. See docs/checkout/return/ for the full contract.

┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION & TESTING                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 12: Test funnel guards + error boundary
│   └── Verify app/checkout/error.tsx renders by inserting a temporary throw
│       in app/checkout/payment/page.tsx — confirm CheckoutError UI appears,
│       NOT the global Next.js 500 page. Remove the temporary throw after.
│   └── Empty session → expect /basket (basket guard fires first)
│   └── Basket with quantity: 0 → expect /basket?error=invalid_basket (NO Sanity call)
│   └── Basket only (no address) → expect /checkout/address
│   └── Basket + address, shippingCost === undefined → expect /checkout/shipping
│   └── Basket + address + shippingCost === 0 → expect payment page renders (free shipping is valid)
│   └── SESSION INJECTION FOR MANUAL TESTS (iron-session is encrypted; cannot edit from browser):
│       Create app/(test)/checkout-seed/route.ts — dev-only helper that writes
│       scenario state into the checkout session and redirects to /checkout/payment.
│       Scenarios:
│         /checkout-seed?scenario=missing-address&secret=$CHECKOUT_SEED_SECRET
│         /checkout-seed?scenario=shipping-zero&secret=$CHECKOUT_SEED_SECRET
│         /checkout-seed?scenario=invalid-product-id&secret=$CHECKOUT_SEED_SECRET
│         /checkout-seed?scenario=zero-quantity&secret=$CHECKOUT_SEED_SECRET
│         /checkout-seed?scenario=grand-total-zero&secret=$CHECKOUT_SEED_SECRET
│         /checkout-seed?scenario=succeeded-pi&secret=$CHECKOUT_SEED_SECRET
│           // writes a known-succeeded paymentIntentId into session for Test 8 third scenario
│       SECURITY GATING (BOTH gates required — NODE_ENV alone is insufficient):
│         (1) if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 })
│             // Vercel preview deployments run NODE_ENV=production too — this gate
│             // alone is insufficient on its own.
│         (2) if (!process.env.CHECKOUT_SEED_SECRET ||
│                 searchParams.get('secret') !== process.env.CHECKOUT_SEED_SECRET)
│               return new Response(null, { status: 403 })
│             // CHECKOUT_SEED_SECRET MUST be unset in production AND preview
│             // environments (Vercel: do not add it to Preview/Production env vars).
│             // Set it only in .env.local for local dev.
│       Required to execute Tests 1.6, 2.5, 4.5, 6.5, 7.5, and Test 8 third scenario.
│
├── Task 13: Test payment flow end-to-end
│   └── Complete basket → address → shipping → payment
│   └── Verify Stripe Payment Intent created with correct total (integer grosz), currency: pln
│   └── Verify address metadata in Stripe Dashboard (5 flattened string fields)
│   └── Verify the PaymentMethod's billing_details.address matches session.address (line1
│       = `${street} ${streetNumber}`, postal_code, city, state = regionCode, country = PL)
│       — this confirms the suppress-and-pass pattern wired up correctly.
│   └── Verify Stripe redirects the browser to /api/checkout/return (the Route Handler),
│       NOT to /checkout/return (the legacy/non-existent path).
│   └── Verify refreshing payment page does not create a second Payment Intent
│
├── Task 14: Test funnel guard cascade validation
│   └── Edit address on address page
│   └── Verify shippingCost cleared from session
│   └── Verify redirect to shipping page when trying to access payment
│   └── Verify paymentIntentId survives upstream edits (NOT cleared) and is
│       refreshed via stripe.paymentIntents.update() on the next visit to
│       /checkout/payment — confirming the PI is never stale at confirmation time.
│
└── Task 15: Cross-cut verifications (NOT implemented in this tracer — prerequisites)
    └── Order persistence (CRITICAL — must exist before this tracer ships):
        └── Stripe webhook handler at app/api/webhooks/stripe/route.ts must:
            - verify the Stripe signature using STRIPE_WEBHOOK_SECRET
            - listen for `payment_intent.succeeded`
            - idempotently find-or-create the order document in Sanity, keyed on
              `paymentIntentId` (Stripe delivers each event at-least-once; duplicate
              deliveries must NOT create duplicate orders or double-decrement stock)
            - create the order document in Sanity (items, total, address, paymentIntentId)
            - decrement product stock
        └── /checkout/success reads the resulting order; neither it nor the Route
            Handler at /api/checkout/return creates it. Without the webhook, a user
            who closes the browser before redirect is still charged with no order
            record. See docs/checkout/return/ for the return-flow contract.
    └── PII in server logs (production gating):
        └── The acceptance tests assert "server logs show session.address (all 5 fields)".
            These logs are DEV-ONLY. Before this code ships, either gate the address
            log behind `process.env.NODE_ENV !== 'production'` or remove it. Address
            data is PII and must not be written to production log aggregators in plain
            text.
```
