# 05 — Client Component Mount Sequence

The Client Component cannot call a Server Action directly during mount (it runs in the browser). Instead it fetches a Route Handler, which has cookie access.

```mermaid
sequenceDiagram
    participant CF as PaymentForm.client.tsx
    participant RH as /api/checkout/payment-intent-session
    participant Session as iron-session
    participant Stripe

    CF->>CF: useEffect: POST {grandTotal, metadata}
    CF->>RH: POST + cookie (auto-sent)
    RH->>Session: getCheckoutSession() reads cookie
    RH->>RH: Enrich metadata with basket, address, shipping, email
    RH->>Stripe: paymentIntents.create OR update
    Stripe-->>RH: {id, client_secret}
    RH->>Session: save paymentIntentId
    RH-->>CF: {clientSecret}

    alt clientSecret received
        CF->>CF: <Elements stripe={stripePromise} options={clientSecret}>
        CF->>CF: <PaymentElement> renders (Card/Blik/Apple Pay)
    else error
        CF->>CF: Show error message
    end
```

**Idempotency:** If `session.paymentIntentId` already exists, `update` is called with the new `grandTotal` and `metadata`. This handles the "user went back to shipping, changed option, returned to payment" scenario.

**Why not call `initPaymentAction` directly?** Server Actions are callable from Client Components, but during the initial mount the component doesn't have the full context. The Route Handler pattern separates concerns cleanly: the Client Component passes computed data, the Route Handler handles the cookie + Stripe interaction.
