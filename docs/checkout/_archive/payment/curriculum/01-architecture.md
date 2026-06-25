# 01 — The 4-Layer Trust Architecture

**Rule: Never trust the client with money.**

All price calculation happens server-side. The client only renders what the server tells it to.

```mermaid
flowchart TB
    subgraph L1["Layer 1: Routing & Security (Server Component)"]
        P1["/checkout/payment<br/>page.tsx"]
    end

    subgraph L2["Layer 2: Presentation & Capture (Client Component)"]
        P2["PaymentForm.client.tsx"]
    end

    subgraph L3["Layer 3: Session Gateway (Route Handler)"]
        P3["/api/checkout/payment-intent-session"]
    end

    subgraph L4["Layer 4: Secure Infrastructure (Core SDKs)"]
        P4["Stripe API"]
        P5["Sanity CMS"]
    end

    User -->|HTTPS| P1
    P1 -->|props: grandTotal + metadata| P2
    P2 -->|POST grandTotal + metadata| P3
    P3 -->|reads iron-session cookie| L1
    P3 -->|creates PaymentIntent| P4
    P3 -->|returns clientSecret| P2
    P2 -->|confirmPayment| P4
    P4 -->|redirects to| Return["/api/checkout/return"]
```

**Why this shape?**

- **Layer 1** validates the user is allowed to be on this page (guards)
- **Layer 2** is purely presentation — it cannot create a Payment Intent, only display one
- **Layer 3** bridges browser → server — it has cookie access, the Client Component does not
- **Layer 4** is the hard boundary — Stripe and Sanity are the sources of truth
