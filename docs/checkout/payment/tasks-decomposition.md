# Payment Page - Tasks Decomposition

**Happy path tracer only.**

## Task Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOUNDATION LAYER                             │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 1: Set up iron-session types for payment page
│   └── Define TypeScript interface for checkout session
│       └── basket: { id: string, quantity: number }[]
│       └── address: { city, street, postalCode, ... }
│       └── shippingCode: string
│       └── shippingCost: number (cents)
│
└── Task 2: Create Stripe utility wrapper (Layer 4)
    └── lib/stripe.ts - initialize Stripe client with secret key
    └── Export createPaymentIntent function

┌─────────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENT LAYER                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 3: Create payment page server component skeleton
│   └── app/checkout/payment/page.tsx
│   └── Import getCheckoutSession from lib/session
│
├── Task 4: Implement funnel guards (Lead Domino)
│   └── Check session.address exists → redirect to /checkout/address if missing
│   └── Check session.shippingCost exists → redirect to /checkout/shipping if missing
│   └── Test guards by manually navigating with empty session
│
├── Task 5: Implement Sanity reality check
│   └── Query Sanity for product prices/stock using session.basket IDs
│   └── If any item stock = 0 → redirect to /basket?error=out_of_stock
│
├── Task 6: Implement master calculation
│   └── Calculate subtotal: Σ(Sanity Price × Session Quantity)
│   └── Calculate grand total: subtotal + session.shippingCost
│
├── Task 7: Integrate Stripe Payment Intent creation
│   └── Call stripe.paymentIntents.create() with grand total
│   └── Append session.address to metadata
│   └── Extract client_secret from response
│
└── Task 8: Handoff to Client Component
    └── Create PaymentForm.client.tsx skeleton
    └── Pass client_secret as prop
    └── Render PaymentForm in page.tsx

┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENT LAYER                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 9: Set up Stripe Elements provider
│   └── Install @stripe/stripe-js and @stripe/react-stripe-js
│   └── Wrap PaymentForm in <Elements> with client_secret
│
├── Task 10: Render Stripe PaymentElement
│   └── Use <PaymentElement /> from @stripe/react-stripe-js
│   └── This handles Blik/Apple Pay/credit cards + billing address UI
│
└── Task 11: Implement payment execution
    └── Add Pay button
    └── On click: call stripe.confirmPayment()
    └── On success: Stripe redirects to /checkout/return

┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION & TESTING                        │
└─────────────────────────────────────────────────────────────────┘
│
├── Task 12: Test funnel guards
│   └── Navigate to /checkout/payment with empty session
│   └── Verify redirect to /checkout/address
│
├── Task 13: Test payment flow end-to-end
│   └── Complete basket → address → shipping → payment
│   └── Verify Stripe Payment Intent created with correct total
│   └── Verify address metadata in Stripe Dashboard
│
└── Task 14: Test session cascade validation
    └── Edit address on address page
    └── Verify shippingCost cleared from session
    └── Verify redirect to shipping page when trying to access payment
