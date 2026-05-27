# 06 — The Pay Button: confirmPayment

When the user clicks Pay, Stripe validates the payment method, then redirects the browser.

```mermaid
sequenceDiagram
    participant User
    participant CF as PaymentFormInner
    participant Stripe as Stripe.js
    participant StripeAPI as Stripe API

    User->>CF: Click "Pay"
    CF->>Stripe: elements.submit()
    Stripe-->>CF: {error?} — validates form
    CF->>Stripe: stripe.confirmPayment({<br/>elements,<br/>confirmParams: {<br/>return_url: "/api/checkout/return",<br/>payment_method_data: { billing_details }<br/>}})
    Stripe->>StripeAPI: Process payment
    StripeAPI-->>Stripe: Result

    alt Success
        Stripe->>User: Browser redirect to /api/checkout/return?payment_intent=pi_xxx
    else Card declined / validation error
        Stripe-->>CF: {error} — stays on page, shows error
    end
```

**The `return_url` is a Route Handler, not a page.** Stripe needs an endpoint it can POST to. After handling, that endpoint redirects to `/checkout/success`.

**Billing address suppression:** `PaymentElement` renders with `fields: { billingDetails: { address: 'never' } }` — the user already typed their address on the address page. We pass it as `billing_details` in `confirmPayment` instead.

**On success, code below `confirmPayment` does NOT run.** The browser navigates away. Error handling only covers the failure path.
