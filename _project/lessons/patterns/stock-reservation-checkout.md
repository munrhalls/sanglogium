# Stock Reservation Pattern for E-commerce Checkout

**Date:** 2026-04-02
**Source:** Checkout Payments Sprint
**Severity:** High
**Frequency:** Systemic (applies to all checkout flows with inventory)

## The Pattern

Stock management during checkout requires a **reservation pattern** to handle race conditions without overselling:

```
Available Stock = stock - reservedStock
```

## Implementation Architecture

### 1. Product Schema
```typescript
// Add reservedStock field to product schema
defineField({
  name: "reservedStock",
  title: "Reserved Stock",
  type: "number",
  initialValue: 0,
  validation: (Rule) => Rule.min(0),
})
```

### 2. Checkout Route — Reservation Phase
```typescript
// Calculate available stock
const availableStock = stock - (reservedStock || 0);

// Validate before reserving
if (availableStock < requestedQuantity) {
  return { error: "Insufficient stock", status: 409 };
}

// Atomically increment reservedStock (NOT decrement stock!)
await checkoutClient
  .patch(productId)
  .inc({ reservedStock: quantity })
  .ifRevisionId(revisionId)  // Critical: prevents race conditions
  .commit();
```

### 3. Webhook — Finalization Phase
On `checkout.session.completed`:
```typescript
// Decrement BOTH stock AND reservedStock
const transaction = checkoutClient.transaction();
for (const item of items) {
  transaction.patch(item.productId, (p) =>
    p.dec({ stock: item.quantity, reservedStock: item.quantity })
  );
}
await transaction.commit();
```

### 4. Webhook — Release Phase
On `checkout.session.expired` or `async_payment_failed`:
```typescript
// Only decrement reservedStock (release reservation)
await checkoutClient
  .patch(productId)
  .dec({ reservedStock: quantity })
  .commit();
```

### 5. Rollback on Stripe Failure
```typescript
let session;
try {
  session = await stripe.checkout.sessions.create({...});
} catch (stripeError) {
  // MUST rollback reservations
  await rollbackReservations(reservedItems);
  return { error: "Payment session failed", status: 500 };
}
```

## Critical Rules

| Rule | Violation Consequence |
|------|----------------------|
| `NEVER dec({ stock })` in checkout route | Race condition: two users can't checkout simultaneously |
| `ifRevisionId` is MANDATORY | Without it, concurrent requests oversell |
| Rollback on ANY Stripe failure | Phantom reservations accumulate, blocking sales |
| Use `checkoutClient` (useCdn: false) | CDN doesn't reflect mutations fast enough |
| ReservedStock release NOT stock | Releasing stock would double-count inventory |

## Prevention

**MANDATORY:** For any checkout flow:
1. Add `reservedStock` field to product schema
2. Use atomic `inc({ reservedStock })` during checkout initiation
3. Use `dec({ stock, reservedStock })` in webhook success handler
4. Implement rollback on Stripe failure
5. Use `ifRevisionId` for all reservation patches

## Applicability

**When to apply:**
- Any e-commerce checkout with limited inventory
- Event ticket sales (limited seats)
- Booking systems (limited slots)
- Any "hold inventory while payment processes" flow

**Keywords:** ["stock-reservation", "inventory-management", "checkout", "race-condition", "sanity-transaction", "two-phase-commit"]
