# Checkout Handshake: Server-Secured Payment Intent

## 1. Purpose
To transition the user from an unverified client-side basket to a server-secured Payment Intent. This Handshake acts as the lead domino, ensuring stock availability and price integrity through a server-side "Check-and-Lock" (Optimistic Concurrency Control) before any user data is collected.

## 2. Input Contract (Client-to-Server)
* **Trigger:** Terminal interaction via button element invoking the `handleCheckout` function.
* **Constraint:** Link-based navigation to `/checkout` is strictly prohibited.
* **Guard:** Access to `/checkout/*` is guarded by the presence of a valid `stripe_intent_id` cookie.
* **Zero-Trust Rule:** Server must reject any payload containing price, total, or name. All financial data must be derived from Sanity and verified against the Stripe Price registry.

### Payload Schema
{
  "publicBasket": [
    { "_id": "string", "quantity": "number" }
  ]
}

---

## 3. Execution Contract (The "Bus Stop" Sequence)
The server logic follows a strict Optimistic Locking pattern to maintain the "Mathematical Reality" of inventory and pricing.

| Bus Stop | Action | Expected State / Invariant |
| :--- | :--- | :--- |
| **1. Ingress** | Rate limit check + Schema validation. | Request is well-formed and non-malicious. |
| **2. Fetch Truth** | Query Sanity for `stock`, `reservedStock`, `_rev`, AND `price` (joined with Stripe Price IDs). | Current state of inventory and financial truth is retrieved. |
| **3. Logic Check** | Calculate `available = stock - reservedStock` AND verify `Sanity Price == Stripe Price`. | `available >= requested_quantity` AND `price_match == true`. |
| **4. Opti-Lock** | Patch `reservedStock` with `.ifRevisionId(_rev)`. | Mutation succeeds only if `_rev` hasn't changed. |
| **5. Anchor** | Create `stripe.paymentIntents.create`. | Financial contract is locked at Stripe. |
| **6. Persist** | Set `stripe_intent_id` HttpOnly Cookie. | The "Baton" is ready for the next flow chunk. |

---

## 4. Case Branches & Output Contract

| Case Branch | Logical Trigger | HTTP | Output / Side Effect |
| :--- | :--- | :--- | :--- |
| **SUCCESS** | Validation Passed + Lock Succeeded + Intent Created | 200 | `{ "client_secret": "string" }` + Set-Cookie |
| **SYNC REQUIRED** | `available < qty` OR `CMS Price != Stripe Price` | 409 | `{ "error": "sync_required", "updatedBasket": [...] }` |
| **RACE CONDITION** | `ifRevisionId` mismatch (Stale Rev) | 409 | `{ "error": "transaction_conflict" }` -> Auto-Retry |
| **STRIPE FAIL** | Payment Intent creation error | 500 | Immediate Rollback: Decrement `reservedStock` in Sanity. |

---

## 5. UI Synchronization Loop (The Recovery Path)
In the event of a `409 Sync Required` conflict, the state machine consolidates all discrepancies into a single atomic update:
1. **Sync:** Client-side store (Zustand) updates automatically with the `updatedBasket` (containing current stock/prices) from the 409 response.
2. **Notify:** A blocking Modal/Overlay appears explaining the changes (e.g., "Price updated" or "Stock adjusted").
3. **Recurse:** Clicking "Proceed" re-triggers `handleCheckout` with the now-synchronized data.

---

## 6. Architecture (Mermaid)
```mermaid
sequenceDiagram
    autonumber
    participant B as Basket (Client)
    participant API as Handshake API
    participant S as Sanity CMS
    participant P as Stripe API

    B->>API: POST /api/checkout (IDs/Qtys)
    Note over API: Bus Stop 1: Validation
    API->>S: Fetch Stock, Rev, & Prices (Bus Stop 2)
    S-->>API: Returns current Truth

    alt Sync Required (Stock or Price Conflict)
        API-->>B: 409 Conflict { updatedBasket } (Bus Stop 3)
        Note over B: Update Store & Show Consolidated Sync Modal
    else Success Path
        Note over API: Bus Stop 4: Optimistic Lock
        API->>S: Patch reservedStock
        S-->>API: Mutation Success
        API->>P: Create Payment Intent (Bus Stop 5)
        P-->>API: client_secret
        API-->>B: 200 OK + Cookie (Bus Stop 6)
        Note over B: Move to 04_2_address
    end