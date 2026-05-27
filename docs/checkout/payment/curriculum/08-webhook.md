# 08 — Webhook: Order Creation (Active P0 Bug)

After Stripe confirms payment server-side, it sends a webhook. This is where the order should be persisted in Sanity.

```mermaid
sequenceDiagram
    participant Stripe as Stripe API
    participant WH as /api/webhooks/stripe
    participant Sanity as Sanity CMS

    Stripe->>WH: POST payment_intent.succeeded<br/>+ stripe-signature header
    WH->>WH: Verify signature with STRIPE_WEBHOOK_SECRET
    WH->>Sanity: Check if order already exists for this PI
    Sanity-->>WH: exists? → skip (idempotency)

    WH->>WH: Read basketReservationId from PI metadata
    Note over WH: CURRENT BUG:<br/>Metadata has basket/address/shipping<br/>but NOT basketReservationId
    WH->>Sanity: Try fetch basketReservation by ID
    Sanity-->>WH: null → skip order creation

    Note over WH, Sanity: FIX NEEDED:<br/>Webhook should read basket/address/shipping<br/>from PI metadata directly,<br/>not depend on basketReservation
```

**The mismatch:**

| What the Route Handler puts in metadata | What the webhook looks for |
|---|---|
| `basket` (JSON string) | `basketReservationId` |
| `address` (JSON string) | `basketReservation` document |
| `shippingCode`, `shippingCost` | `shippingChoice` subdocument |
| `email` | (not referenced) |

**Fix direction:** The webhook should build the order directly from `pi.metadata.basket`, `pi.metadata.address`, etc. — no `basketReservation` lookup needed. The metadata already contains everything required.
