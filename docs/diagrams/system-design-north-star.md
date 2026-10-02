# System Design — Target State (Diagrams)

Mermaid renderings of the North Star design only. Every diagram shows what the system
*should* be; none of the "Now:" gaps are drawn. Source of truth: `docs/design-system.md`.

---

## 1. Shape — runtime context

```mermaid
flowchart LR
    Browser["Browser<br/>(basket in localStorage)"]
    CDN["Vercel CDN"]
    Next["Next.js 15 App Router<br/>stateless functions"]

    Browser --> CDN --> Next

    Next -->|"content · price · stock · orders<br/>(one private dataset)"| Sanity["Sanity"]
    Next -->|"identity · sessions · account data (SQL)"| Turso["Turso"]
    Next -->|"money"| Stripe["Stripe"]
    Stripe -->|"signed webhook → order creation"| Next
    Next -->|"email"| Resend["Resend"]
    Next -->|"rates"| Carriers["Carriers<br/>(AlleKurier, Packlink)"]
    Next -->|"address check"| Teryt["GUS TERYT"]

    Cookie["Checkout state between steps:<br/>encrypted cookie (iron-session, 1 h)"]
    Browser <-.->|"checkoutSessionId = trace id"| Cookie
    Cookie <-.-> Next
```

---

## 2. Data ownership — one writer of record per datum

```mermaid
flowchart TB
    subgraph Sanity["Sanity (private dataset)"]
        Product["product<br/>content · price_data.unit_amount · stock"]
        Order["order<br/>_id = order_&lt;pi&gt;<br/>immutable snapshot + fulfilment status"]
    end

    subgraph Turso["Turso (SQL, ACID, FK + cascade)"]
        User["user / sessions / credentials / 2FA<br/>(Better Auth)"]
        Account["addresses · wishlist · opt-in · stripeCustomerId<br/>FK → user, cascade on delete"]
        User --> Account
    end

    subgraph StripeS["Stripe"]
        PI["PaymentIntent<br/>priced order snapshot in metadata"]
        Charge["Charge<br/>refunded · disputed"]
    end

    subgraph Browser["Browser"]
        LS["localStorage basket<br/>(advisory; re-priced server-side)"]
    end

    Build["catalogue-index.json<br/>(materialised at build)"]
    Cookie["Encrypted cookie (1 h)<br/>basket snapshot · address · quoted options · chosen option · PI id"]

    Editors["Editors (Studio)"] --> Product
    Product --> Build
    LS -->|"IDs + quantities only"| PI
    Product -->|"server derives price · shipping · VAT"| PI
    PI -->|"webhook → idempotent creator"| Order
    Order -->|"stock decrement in same transaction"| Product
```

---

## 3. Checkout — trust boundary & payment sequence

Every action validates input with zod, authorises with `requireSession`, and never accepts a money value from the client.

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as Server Actions / Routes
    participant C as Checkout Cookie
    participant S as Sanity
    participant St as Stripe

    B->>A: initCheckoutSession(items)
    A->>A: zod: integer qty 1..max, ≤ max lines
    A->>C: basket snapshot

    B->>A: address step (autocomplete / TERYT)
    A->>C: validated address

    B->>A: saveShippingAction(optionId)
    A->>A: quote rates server-side (carriers)
    A->>C: quoted options + chosen optionId

    B->>A: create PaymentIntent
    A->>S: uncached read (useCdn=false):<br/>prices · stock check
    A->>A: derive total; stock short →<br/>reject lines / flag
    A->>St: create PI (idempotency key,<br/>priced snapshot in metadata lines_0..n)
    St-->>A: clientSecret
    A-->>B: render payment

    B->>St: confirm payment
    St->>A: payment_intent.succeeded (signed webhook)
    A->>S: ONE transaction:<br/>create order_&lt;pi&gt; + decrement<br/>each product (ifRevisionID)
    S-->>A: committed
    A->>A: send confirmation email<br/>(marker confirmationSentAt +<br/>Resend idempotency key)
```

---

## 4. Async work — Stripe is the queue

```mermaid
flowchart LR
    Stripe["Stripe<br/>(redelivers on non-2xx, up to 3 days)"]

    subgraph Webhook["Signed webhook handler"]
        PIS["payment_intent.succeeded"]
        CR["charge.refunded"]
        CD["charge.dispute.created"]
    end

    subgraph Sanity["Sanity"]
        Tx["order_&lt;pi&gt; create +<br/>stock decrements<br/>(atomic, idempotent)"]
        OrderDoc["order<br/>status · confirmationSentAt"]
    end

    Email["Confirmation email<br/>(marker + provider idempotency key)"]
    Sweep["Daily Vercel cron<br/>(CRON_SECRET): succeeded PIs last 7 days<br/>→ ensure order + email"]
    ReturnH["Return handler<br/>(fast path → same idempotent creator)"]

    Stripe --> PIS --> Tx --> OrderDoc
    Stripe --> CR --> OrderDoc
    Stripe --> CD --> OrderDoc
    ReturnH --> Tx
    Tx --> Email
    Sweep --> Tx
    Sweep --> Email

    SanityHook["Sanity signed webhook"] --> Rev["revalidateTag"]
    SanityPub["Sanity publish<br/>(catalogue docs)"] --> Deploy["Deploy hook →<br/>rebuild catalogue-index.json"]
```

Dedup assumptions: duplicate delivery is assumed everywhere; ordering is assumed nowhere.
A refund event arriving before its order returns 500 so Stripe redelivers.

---

## 5. Caching — one layer owns freshness per path

```mermaid
flowchart TB
    Sanity["Sanity<br/>(useCdn: false on tagged fetches;<br/>bypassed entirely on money/stock reads)"]

    subgraph Next["Next.js"]
        DC["Data cache, tagged:<br/>product · product:&lt;id&gt; · homepage<br/>(staleness: seconds after publish<br/>+ 1 h safety net)"]
        Router["Client router cache<br/>staleTimes.dynamic = 30 s"]
    end

    Hook["Sanity signed webhook<br/>→ revalidateTag"]
    Hook -.->|invalidates| DC

    Sanity --> DC --> Pages["Listings · PDP · homepage<br/>(dynamic pages, cached fetches)"]
    Sanity -->|"never cached"| Money["Price / stock decisions"]
    Personal["Account · basket API · checkout ·<br/>auth · export"] -->|"private, no-store (default)"| Browser
    Images["Images: Sanity asset CDN<br/>(content-addressed)"]
    Build["catalogue-index.json<br/>build artifact → deploy hook"]
    Session["Auth session<br/>signed cookie cache ≤ 5 min"]
```

---

## 6. Failure & degradation

```mermaid
flowchart TB
    subgraph Deps["Outbound calls — explicit timeout, defined degradation"]
        SR["Sanity read → serve stale cache;<br/>error boundary if none"]
        SW["Sanity write (order) → 500,<br/>Stripe redelivers; return handler<br/>logs + still redirects"]
        ST["Stripe API → retryable checkout error"]
        TU["Turso (auth) → sign-in unavailable,<br/>checkout continues as guest"]
        TG["GUS TERYT (~3 s) → accept address as entered"]
        CA["Carrier rates → retryable error,<br/>never guess a price"]
        RE["Resend → marker stays unset,<br/>webhook/sweep retries"]
        AC["Autocomplete (4 s) → manual entry"]
    end

    subgraph Invariant["Partial failure on money paths"]
        P1["Paid, order write failed →<br/>redelivery + sweep + alert"]
        P2["Paid, stock short → order created,<br/>flagged + alert (human decides<br/>refund vs backorder)"]
        P3["Committed, email failed →<br/>marker drives retry"]
        P4["Deleted, anonymisation failed →<br/>alert + idempotent re-run"]
    end
```

---

## 7. Observability — the minimal set

```mermaid
flowchart LR
    subgraph Paths["Money & privacy paths"]
        Err["Every caught error →<br/>Sentry.captureException<br/>before swallow/status"]
        Log["One JSON line per event<br/>correlationId = checkoutSessionId<br/>basket → PI → webhook → order<br/>(order_created at info)"]
    end

    Alerts["Alerts (business invariants)<br/>1. succeeded PIs without order = 0<br/>2. webhook non-2xx rate<br/>3. flagged oversold orders"]
    Traces["Sentry traces<br/>10% server sampling"]
```

---

## 8. Scale limits & invariants

- Invariants (I1–I6): one order per succeeded PI; server-derived charge; atomic stock decrement; deny-by-default privacy; one writer per datum; no silent money/privacy failure.
- Real limits, in order: Sanity metered requests → tagged data cache; Sanity document cap → revisit trigger for moving orders+stock to Turso together; cookie 4 KB → explicit line cap; Stripe metadata → chunked keys; public `/api/*` abuse → WAF rate limits.
- Stateless functions; Better Auth rate limits use `storage: "database"`.
