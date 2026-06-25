# 07 — Return Handler: Session Lifecycle

`/api/checkout/return` receives the redirect from Stripe, retrieves the Payment Intent status, then decides what to clear from session.

```mermaid
flowchart TD
    A["GET /api/checkout/return<br/>?payment_intent=pi_xxx"] --> B["Retrieve PI from Stripe API"]
    B --> C{"PI.status"}

    C -->|succeeded| D["Clear session:"]
    D --> D1["paymentIntentId = undefined"]
    D --> D2["basket = []"]
    D --> D3["address = undefined"]
    D --> D4["shippingCode = undefined"]
    D --> D5["shippingCost = undefined"]
    D --> D6["completedPaymentIntentId = pi.id"]
    D6 --> S1["redirect /checkout/success?payment_intent=pi_xxx"]

    C -->|requires_payment_method<br/>(failed)| E["Clear: paymentIntentId only"]
    E --> E1["completedPaymentIntentId = pi.id"]
    E1 --> S2["redirect /checkout/success?status=failed"]

    C -->|canceled| F["Clear: paymentIntentId only"]
    F --> F1["completedPaymentIntentId = pi.id"]
    F1 --> S3["redirect /checkout/success?status=canceled"]

    C -->|processing| G["Keep everything"]
    G --> G1["completedPaymentIntentId = pi.id"]
    G1 --> S4["redirect /checkout/success?status=processing"]
```

**Why partial clear on failure?** If the card was declined, the user still has their basket, address, and shipping selected. They can just try again — no re-typing.

**Why set `completedPaymentIntentId` on ALL paths?** The success page uses it as a privacy guard. If someone lands on `/checkout/success?payment_intent=pi_xxx` without `completedPaymentIntentId` matching, they get redirected to `/basket`.
