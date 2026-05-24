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
│
└── Task 2: Verify Stripe and env setup
    └── lib/stripe.ts already exists — exports `stripe` instance, no changes needed
    └── Verify .env.local contains:
        └── STRIPE_SECRET_KEY  (server-side, already guarded in lib/stripe.ts)
        └── NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (client-side, needed by Task 9)
        // Missing NEXT_PUBLIC key causes loadStripe(undefined) — Elements silently fails

┌─────────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENT LAYER                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 3: Create payment page server component skeleton
│   └── app/checkout/payment/page.tsx
│   └── Import getCheckoutSession from lib/session
│   └── Import stripe from lib/stripe
│
├── Task 4: Implement funnel guards (Lead Domino)
│   └── Check session.address exists → redirect to /checkout/address if missing
│   └── Check session.shippingCost exists → redirect to /checkout/shipping if missing
│   └── Note: shippingCode is NOT guarded here — only required for post-order record keeping
│   └── Test: navigate to /checkout/payment with empty session → expect /checkout/address
│
├── Task 5: Implement Sanity reality check
│   └── Extract productIds from session.basket: session.basket.map(item => item.productId)
│   └── GROQ query: *[_type == "product" && _id in $ids]{ _id, price_data { unit_amount }, stock }
│       // field names confirmed: price_data.unit_amount (integer grosz), stock (integer)
│   └── If any product's stock = 0 → redirect to /basket?error=out_of_stock&id={product._id}
│
├── Task 6: Implement master calculation
│   └── Match each session.basket item to its Sanity product by productId / _id
│   └── Subtotal: Σ(product.price_data.unit_amount × session_item.quantity)
│       // price_data.unit_amount is already an integer in grosz — no conversion needed
│   └── Grand total: Math.round(subtotal + session.shippingCost)
│       // Math.round() is a safety net — Stripe requires a positive integer amount
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
│   │
│   └── Branch A — session.paymentIntentId exists:
│       └── try:
│           └── result = await stripe.paymentIntents.update(session.paymentIntentId, {
│                 amount: grandTotal,
│                 metadata: flattenedMetadata
│               })
│       └── catch (Stripe throws if PI is in succeeded/cancelled terminal state):
│           └── session.paymentIntentId = undefined  // clear stale id
│           └── fall through to Branch B
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
│
└── Task 8: Handoff to Client Component
    └── Create PaymentForm.client.tsx skeleton
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
├── Task 10: Render Stripe PaymentElement
│   └── Use <PaymentElement /> from @stripe/react-stripe-js
│   └── This handles Blik/Apple Pay/credit cards + billing address UI
│
└── Task 11: Implement payment execution
    └── const stripe = useStripe()
    └── const elements = useElements()
    └── Add isLoading (boolean) + error (string | null) state (useState)
    └── Add Pay button — disabled while isLoading = true
    └── On click:
        └── if (!stripe || !elements) return
            // hooks return null until Stripe.js finishes loading — guard before use
        └── Set isLoading = true, clear error
        └── const result = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}/checkout/return`
                // must be absolute URL — window.location.origin handles dev + prod
              }
            })
        └── // confirmPayment() ONLY returns if there is an error
            // On success: Stripe redirects the browser — code below never runs
        └── setError(result.error?.message ?? 'Payment failed. Please try again.')
        └── setIsLoading(false)
    └── Dependency: /checkout/return must exist — it is the Stripe redirect target
        and handles the payment_intent query param that Stripe appends on redirect

┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION & TESTING                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 12: Test funnel guards
│   └── Navigate to /checkout/payment with empty session
│   └── Verify redirect to /checkout/address (address is checked first)
│
├── Task 13: Test payment flow end-to-end
│   └── Complete basket → address → shipping → payment
│   └── Verify Stripe Payment Intent created with correct total (integer grosz), currency: pln
│   └── Verify address metadata in Stripe Dashboard (5 flattened string fields)
│   └── Verify refreshing payment page does not create a second Payment Intent
│
└── Task 14: Test session cascade validation
    └── Edit address on address page
    └── Verify shippingCost cleared from session
    └── Verify redirect to shipping page when trying to access payment
```
