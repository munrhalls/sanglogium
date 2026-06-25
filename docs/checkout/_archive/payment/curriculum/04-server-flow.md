# 04 — Server Component Data Flow

After guards pass, the Server Component queries Sanity for live prices and stock, then calculates totals.

```mermaid
sequenceDiagram
    participant User
    participant Page as page.tsx<br/>(Server Component)
    participant Sanity as Sanity CMS
    participant Client as PaymentForm.client.tsx

    User->>Page: GET /checkout/payment
    Page->>Page: Guard checks (4 gates)
    Page->>Sanity: GROQ: products by basket IDs
    Sanity-->>Page: [{_id, price_data, stock}]
    Page->>Page: Count mismatch? → throw
    Page->>Page: Invalid price? → throw
    Page->>Page: Stock = 0? → redirect
    Page->>Page: Σ(price × qty) + shippingCost = grandTotal
    Page->>Page: Build metadata from address + email
    Page-->>Client: Props: {grandTotal, metadata, address, traceId}
```

**Why throw vs redirect?**

| Scenario | Action | Why |
|----------|--------|-----|
| Count mismatch (basket has unknown product ID) | `throw new Error` | Data corruption — error boundary |
| Invalid price (not a number) | `throw new Error` | Data corruption — error boundary |
| Stock = 0 | `redirect /basket` | User recoverable — they can remove item |
| Grand total < 1 | `redirect /basket` | Edge case — prevents $0 charge |

**Amounts are integer grosz** (1 PLN = 100 grosz). `price_data.unit_amount` from Sanity is already in grosz. No floating-point math on money.
