# 09 — Full End-to-End Flow

Every file and its layer in one map.

```mermaid
flowchart LR
    subgraph Browser["User's Browser"]
        B1["Basket"]
        B2["Address Form"]
        B3["Shipping Selection"]
        B4["Payment Page"]
        B5["Stripe PaymentElement"]
    end

    subgraph NextJS["Next.js App"]
        S1["page.tsx<br/>(Server Component)"]
        S2["PaymentForm.client.tsx"]
        S3["/api/checkout/payment-intent-session<br/>(Route Handler)"]
        S4["/api/checkout/return<br/>(Route Handler)"]
        S5["/api/webhooks/stripe<br/>(Route Handler)"]
    end

    subgraph External["External APIs"]
        E1["Sanity CMS"]
        E2["Stripe API"]
    end

    B1 -->|POST| S1
    S1 -->|Guard fail| B1
    S1 -->|Props| S2
    S2 -->|POST| S3
    S3 -->|read/write| E2
    S3 -->|clientSecret| S2
    S2 -->|confirmPayment| E2
    E2 -->|redirect| S4
    S4 -->|verify + clear session| S4
    S4 -->|redirect| B4
    E2 -->|webhook| S5
    S5 -->|create order| E1
```

---

## File Reference

| File | Layer | Job |
|------|-------|-----|
| `lib/session.ts` | Foundation | Defines `CheckoutSession` shape + iron-session config |
| `app/(store)/checkout/payment/page.tsx` | Layer 1 | Guards → Sanity query → calculate → pass props |
| `PaymentForm.client.tsx` | Layer 2 | Fetch PI → mount Elements → render form → confirmPayment |
| `/api/checkout/payment-intent-session` | Layer 3 | Bridge: reads cookie, creates/updates PI, returns secret |
| `/api/checkout/return` | Layer 3 | Receives Stripe redirect, manages session lifecycle |
| `/api/webhooks/stripe` | Layer 3 | Receives async confirmation, creates order in Sanity |
| `lib/stripe.ts` | Layer 4 | Stripe SDK instance + `retrievePaymentIntent` helper |

---

## One-Line Summary

> The client renders the form. The server calculates the total. Stripe handles the money. The webhook creates the order.
