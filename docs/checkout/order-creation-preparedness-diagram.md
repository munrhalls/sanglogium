# Order Creation Preparedness — Visual Assessment

> Generated from source-code analysis of the checkout system.
> Green = verified working. Red = gap or dead code. Yellow = caution.

---

## 1. End-to-End Happy Path (The Working Chain)

```mermaid
flowchart LR
    subgraph BASKET["Basket Page"]
        B1["CheckoutButton.tsx"]
    end

    B1 -->|"Server Action: initCheckoutSession(items, traceId)"| ADDR

    subgraph ADDR["/checkout/address"]
        A1["AddressForm.tsx (Client)"]
        A2["saveAddress(address)"]
        A3["Google Address Validation API"]
    end

    A1 -->|"form submit"| A2
    A2 -->|"POST"| A3
    A3 -->|"ACCEPT / FIX"| A2
    A2 -->|"redirect"| SHIP

    subgraph SHIP["/checkout/shipping"]
        S1["shipping/page.tsx (Server)"]
        S2["AlleKurier API"]
        S3["ShippingPageClient.tsx (Client)"]
        S4["saveShippingAction(code, price)"]
    end

    S1 -->|"fetch products → calculate packages"| S2
    S2 -->|"rates[]"| S1
    S1 -->|"props"| S3
    S3 -->|"user selects → POST"| S4
    S4 -->|"redirect"| PAY

    subgraph PAY["/checkout/payment"]
        P1["payment/page.tsx (Server)"]
        P2["Sanity: prices + stock check"]
        P3["PaymentForm.client.tsx"]
        P4["/api/checkout/payment-intent-session"]
        P5["Stripe: PaymentIntent.create/update"]
    end

    P1 -->|"guards + GROQ query"| P2
    P2 -->|"products[]"| P1
    P1 -->|"grandTotal, metadata"| P3
    P3 -->|"POST {grandTotal, metadata}"| P4
    P4 -->|"enrich metadata with basket/address/shipping"| P5
    P5 -->|"clientSecret"| P4
    P4 -->|"JSON {clientSecret}"| P3
    P3 -->|"stripe.confirmPayment()"| RET

    subgraph RET["/api/checkout/return"]
        R1["GET route.ts"]
        R2["retrievePaymentIntent(id)"]
        R3["session save + redirect"]
    end

    RET -->|"redirect"| SUCCESS

    subgraph SUCCESS["/checkout/success"]
        U1["success/page.tsx (Server)"]
        U2["OrderDetails.tsx"]
        U3["Sanity: fetchOrderByPaymentIntentId"]
    end

    U1 -->|"verify PI status + privacy guard"| U2
    U2 -->|"Suspense: fetch order"| U3

    subgraph WH["Stripe Webhook"]
        W1["api/webhooks/stripe/route.ts"]
        W2["handlePaymentIntentSucceeded"]
        W3["Sanity: backendClient.create(orderDoc)"]
        W4["Sanity: patch(product).dec({stock})"]
    end

    P5 -.->|"async webhook: payment_intent.succeeded"| W1
    W1 -->|"idempotency check"| W2
    W2 -->|"build order from PI metadata"| W3
    W3 -->|"order created"| W4
```

---

## 2. Session State Machine (Iron-Session Cookie)

```mermaid
stateDiagram-v2
    [*] --> BasketSet: initCheckoutSession(items)

    BasketSet --> AddressSet: saveAddress(validated)
    BasketSet --> BasketSet: address validation FAIL (FIX)

    AddressSet --> ShippingSet: saveShippingAction(code, price)
    AddressSet --> AddressSet: edit address (clears shipping)

    ShippingSet --> PaymentIntentCreated: payment-intent-session API
    ShippingSet --> ShippingSet: edit address (clears shipping)

    PaymentIntentCreated --> Succeeded: stripe.confirmPayment() OK
    PaymentIntentCreated --> Failed: card declined
    PaymentIntentCreated --> Canceled: user canceled
    PaymentIntentCreated --> Processing: async confirmation

    Succeeded --> [*]: clear ALL session data
    Failed --> PaymentIntentCreated: retry (keep basket/address/shipping)
    Canceled --> PaymentIntentCreated: retry (keep basket/address/shipping)
    Processing --> [*]: keep everything, wait for webhook
```

**Session keys:** `basket`, `address`, `email`, `shippingCode`, `shippingCost`, `paymentIntentId`, `completedPaymentIntentId`, `checkoutSessionId`

---

## 3. Data Flow — PaymentIntent Metadata Enrichment

```mermaid
sequenceDiagram
    autonumber
    participant C as PaymentForm.client.tsx
    participant PI as /api/checkout/payment-intent-session
    participant S as Iron Session
    participant STR as Stripe API

    C->>PI: POST {grandTotal, metadata: {regionCode, postalCode, street, streetNumber, city, email}}
    PI->>S: read session
    S-->>PI: {basket, address, shippingCode, shippingCost, email}
    PI->>PI: enrich metadata += {<br/>basket: JSON.stringify(basket),<br/>address: JSON.stringify(address),<br/>shippingCode, shippingCost, email}
    PI->>STR: paymentIntents.create/update<br/>(amount=grandTotal, currency=pln, metadata=enriched)
    STR-->>PI: {id, client_secret}
    PI->>S: save paymentIntentId
    PI-->>C: {clientSecret}
```

> This metadata is the **sole data source** for the webhook when building the order.
> No dependency on `basketReservation` documents at order creation time.

---

## 4. Webhook Order Creation Pipeline

```mermaid
flowchart TD
    A["Stripe Event:<br/>payment_intent.succeeded"] --> B{"Idempotency:<br/>order already exists?"}
    B -->|Yes| C["Skip — return 200"]
    B -->|No| D["Parse PI.metadata:<br/>basket, address, shippingCode, shippingCost, email"]
    D --> E{"Parse OK?<br/>basket.length > 0?"}
    E -->|No| F["Log error — return 500<br/>(Stripe retries)"]
    E -->|Yes| G["Sanity GROQ:<br/>fetch product names & prices<br/>by basket productIds"]
    G --> H["Build items[]:<br/>{productId, name, quantity, price, subtotal}"]
    H --> I["Map address → shippingAddress:<br/>{name, line1, city, state, postalCode, country}"]
    I --> J["Compute pricing:<br/>subtotal + shipping = total<br/>trust pi.amount as authority"]
    J --> K["Generate orderNumber:<br/>ORD-YYYY-NNNN"]
    K --> L["Sanity create:<br/>backendClient.create(orderDoc)"]
    L --> M["Stock decrement:<br/>Promise.all(patch(product).dec({stock: qty}))"]
    M --> N["Log: webhook_order_created"]

    style C fill:#90ee90
    style L fill:#90ee90
    style M fill:#90ee90
    style F fill:#ff9999
```

---

## 5. Gap Map — Dead Code & Unwired Paths

```mermaid
flowchart LR
    subgraph LIVE["Live Data Flow"]
        L1["CheckoutButton → initCheckoutSession"]
        L2["PaymentForm.client → /api/checkout/payment-intent-session"]
        L3["Webhook → inline orderDoc → backendClient.create"]
    end

    subgraph DEAD["Dead / Unwired Code"]
        D1["/checkout/return/page.tsx<br/>(orphaned — calls non-existent /api/order)"]
        D2["sanity-cms/lib/orders/addOrder.ts<br/>(createOrder fn — never called)"]
        D3["app/actions/checkout/index.ts<br/>initPaymentAction — never called"]
        D4["/api/checkout/payment-intent/route.ts<br/>(basketReservation-based — unused)"]
        D5["/api/checkout/payment-intent/session/route.ts<br/>(dupe logic, no metadata enrichment)"]
    end

    style DEAD fill:#ffcccc
    style LIVE fill:#ccffcc
```

---

## 6. Field Coverage — What the Order Actually Contains

```mermaid
flowchart TD
    subgraph ORDER["Order Document (Webhook-Created)"]
        ID["orderNumber ✅<br/>orderId ✅<br/>paymentIntentId ✅"]
        CUST["customerEmail ✅<br/>isGuest: true ✅<br/>clerkUserId: undefined ⚠️"]
        ITEMS["items[] ✅<br/>(productId, name, qty, price, subtotal)"]
        ADDR["shippingAddress ✅<br/>billingAddress: undefined ⚠️"]
        PRICE["pricing ✅<br/>(subtotal, shipping, tax=0, total, currency)"]
        STAT["status: 'processing' ✅"]
        DATES["dates.orderedAt ✅<br/>dates.paidAt ✅"]
        PAY["payment.stripePaymentIntentId ✅"]
        META["metadata: undefined ⚠️"]
        SHIP["shippingMethod: undefined ❌"]
    end

    style SHIP fill:#ffcccc
    style META fill:#ffffcc
    style CUST fill:#ffffcc
```

---

## 7. Architecture Overview (4-Layer)

```mermaid
flowchart TB
    subgraph L1["Layer 1: Routing & Orchestration<br/>(Server Components — page.tsx)"]
        P_ADDR["address/page.tsx"]
        P_SHIP["shipping/page.tsx"]
        P_PAY["payment/page.tsx"]
        P_SUCC["success/page.tsx"]
    end

    subgraph L2["Layer 2: Presentation & Capture<br/>(Client Components / Forms)"]
        C_ADDR["AddressForm.tsx"]
        C_SHIP["ShippingPageClient.tsx"]
        C_PAY["PaymentForm.client.tsx"]
        C_SUCC["OrderDetails.tsx"]
    end

    subgraph L3["Layer 3: Mutation & Session Gateway<br/>(Server Actions + Route Handlers)"]
        A_CHK["app/actions/checkout/index.ts"]
        A_ADDR["app/actions/address/address.ts"]
        R_PI1["/api/checkout/payment-intent-session"]
        R_RET["/api/checkout/return"]
        R_WH["/api/webhooks/stripe"]
    end

    subgraph L4["Layer 4: Secure Service Infrastructure<br/>(Core SDKs)"]
        S_SANITY["Sanity Client<br/>(read + write + backend)"]
        S_STRIPE["Stripe SDK"]
        S_ALLEK["AlleKurier API"]
        S_GOOGLE["Google Address Validation"]
        S_REDIS["Redis / Queue<br/>(cleanup jobs)"]
    end

    P_ADDR --> C_ADDR
    P_SHIP --> C_SHIP
    P_PAY --> C_PAY
    P_SUCC --> C_SUCC

    C_ADDR -->|"saveAddress()"| A_CHK
    C_SHIP -->|"saveShippingAction()"| A_CHK
    C_PAY -->|"POST /api/checkout/payment-intent-session"| R_PI1
    C_PAY -->|"stripe.confirmPayment()"| S_STRIPE

    A_CHK -->|"iron-session"| L4
    A_ADDR -->|"POST"| S_GOOGLE
    R_PI1 -->|"paymentIntents.create/update"| S_STRIPE
    R_RET -->|"retrieve + session save"| L4
    R_WH -->|"backendClient.create + patch"| S_SANITY
    R_WH -->|"decrement stock"| S_SANITY

    P_SHIP -->|"fetchAlleKurierRates"| S_ALLEK
    P_PAY -->|"client.fetch(prices+stock)"| S_SANITY
```

---

## 8. Critical Path Decision Tree

```mermaid
flowchart TD
    START["User clicks Checkout"] --> B{"Basket empty?"}
    B -->|Yes| BASKET_REDIRECT["Redirect /basket ❌"]
    B -->|No| ADDR{"Address valid?<br/>Google API"}
    ADDR -->|FIX| ADDR_RETRY["Show errors → retry"]
    ADDR -->|ACCEPT| SHIP{"Shipping selected?"}
    SHIP -->|No| SHIP_WAIT["Show options → wait"]
    SHIP -->|Yes| PAY_GUARDS{"Payment guards:"}

    PAY_GUARDS -->|"!basket"| BASKET_REDIRECT
    PAY_GUARDS -->|"!address"| ADDR_REDIRECT["Redirect /checkout/address ❌"]
    PAY_GUARDS -->|"!shippingCost"| SHIP_REDIRECT["Redirect /checkout/shipping ❌"]
    PAY_GUARDS -->|"stock == 0"| OOS_REDIRECT["Redirect /basket?error=out_of_stock ❌"]
    PAY_GUARDS -->|"All pass ✅"| PI_CREATE["Create/update PaymentIntent"]

    PI_CREATE --> CONFIRM["stripe.confirmPayment()"]
    CONFIRM --> RET{"PI status?"}
    RET -->|succeeded| CLEAR["Clear session<br/>Show success page ✅"]
    RET -->|requires_payment_method| FAIL["Keep basket/address/shipping<br/>Show 'Try again' ❌"]
    RET -->|canceled| CANCEL["Keep basket/address/shipping<br/>Show 'Try again' ⚠️"]
    RET -->|processing| WAIT["Keep everything<br/>Show 'Processing…' ⏳"]

    WH_EVENT["Webhook:<br/>payment_intent.succeeded"] --> IDEMPOTENT{"Order exists?"}
    IDEMPOTENT -->|Yes| WH_SKIP["Skip ✅"]
    IDEMPOTENT -->|No| WH_CREATE["Create order +<br/>decrement stock ✅"]
```

---

## Summary Table

| Component | Status | File |
|-----------|--------|------|
| Basket → Session init | Ready | `app/actions/checkout/index.ts` |
| Address form + validation | Ready | `address/AddressForm.tsx` + `actions/address/address.ts` |
| Shipping rates (AlleKurier) | Ready | `shipping/page.tsx` |
| Shipping selection save | Ready | `actions/checkout/index.ts:saveShippingAction` |
| Payment page guards | Ready | `payment/page.tsx` |
| PaymentIntent create/update | Ready | `/api/checkout/payment-intent-session/route.ts` |
| Stripe confirmPayment | Ready | `PaymentForm.client.tsx` |
| Return handler (PI verify) | Ready | `/api/checkout/return/route.ts` |
| Success page (PI status) | Ready | `success/page.tsx` |
| Webhook order creation | Ready | `/api/webhooks/stripe/route.ts` |
| Stock decrement | Ready | Webhook `patch(product).dec({stock})` |
| Success page order lookup | Ready | `OrderDetails.tsx` + `fetchOrderByPaymentIntentId` |
| **Orphaned /checkout/return** | **Dead code** | `return/page.tsx` calls non-existent `/api/order` |
| **createOrder() utility** | **Dead code** | `sanity-cms/lib/orders/addOrder.ts` |
| **initPaymentAction()** | **Dead code** | `app/actions/checkout/index.ts` |
| **Basket store clear** | **Missing** | `basketStore.ts:clear()` never called post-payment |
| **Guest name/phone** | **Missing** | Address form does not collect firstName/lastName/phone |
| **shippingMethod on order** | **Missing** | Webhook orderDoc omits it |
