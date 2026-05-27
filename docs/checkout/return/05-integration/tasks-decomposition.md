# Return Flow Integration - Tasks Decomposition

**Happy path tracer only.**

**Scope:** End-to-end verification, contract alignment, and cleanup only. No new implementation.

## Tasks Graph

```
A[Test full happy path] --> B[Align cross-scope contracts]
B --> C[Remove legacy return page]
C --> D[Verify scope boundaries]
```

## Task Details

### Task 1: Test full happy path
- Complete flow: basket → address → shipping → payment → Stripe redirect → Route Handler → success page
- [ ] Route Handler redirects correctly
- [ ] Success page privacy guard passes
- [ ] Order details render (or lag state if webhook is not yet implemented)
- [ ] Sanity order document exists with matching `paymentIntentId` (when webhook is active)

### Task 2: Align cross-scope contracts
| Contract | Pinned value | Co-asserted in |
|---|---|---|
| Stripe `return_url` | `${origin}/api/checkout/return` | `docs/checkout/payment/03-client-form/` |
| Privacy-guard key | `session.completedPaymentIntentId` | `docs/checkout/payment/02-server-component/` |
| Sanity order field | `paymentIntentId` (camelCase) | `docs/checkout/payment/` acceptance tests |
| Currency | integer grosz | `docs/checkout/payment/`, `docs/checkout/return/` all slices |

- [ ] All contracts match between payment and return scopes

### Task 3: Remove legacy return page
- Delete `app/(store)/checkout/return/page.tsx`
- This file is a `'use client'` component using `session_id` from Stripe Checkout (old architecture)
- It conflicts with the new Route Handler + success page architecture
- Verify no other imports reference it

### Task 4: Verify scope boundaries
- [ ] Return flow docs do NOT describe webhook handler implementation
- [ ] Return flow docs do NOT describe PaymentIntent creation (that's payment scope)
- [ ] Return flow docs do NOT describe order creation (that's webhook scope)
- [ ] Success page does NOT write to Sanity
