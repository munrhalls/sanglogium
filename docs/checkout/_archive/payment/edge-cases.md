# Payment Page — Edge Cases

**Status:** LOCKED until Scope 1 (Core payment flow) and Scope 2 (Visual design alignment) are complete.

---

## 1. Stripe Idempotency Keys

**What:** Prevent duplicate PaymentIntents on network retry.

**Current state:** `initPaymentAction` in `app/actions/checkout/index.ts` calls `stripe.paymentIntents.create()` without an idempotency key.

**Should be:** Generate a unique idempotency key (e.g., `checkoutSessionId + timestamp`) and pass it to `stripe.paymentIntents.create()`.

**Live check:** Simulate network retry; verify no duplicate PIs are created.

---

## 2. Cascade Invalidation

**What:** Clear `session.paymentIntentId` when upstream data changes.

**Current state:** Not implemented.

**Should be:** On basket, address, or shipping mutation, delete `session.paymentIntentId` before save. This forces PI recreation with updated totals.

**Live check:** Change basket after PI created → verify new PI is created with the updated total.

---

## 3. Payment Failure / Retry UX

**What:** Handle declined cards, 3D Secure challenges, and expired cards.

**Current state:** Stripe handles most failure messaging. Custom retry UI is not yet implemented.

**Should be:** Review whether Stripe's default error display is sufficient or if a custom retry flow is needed.

---

## 4. Basket Reservation Flow Cleanup

**What:** Remove deprecated Flow B artifacts.

**Current state:**
- `app/(store)/checkout/payment/PaymentPageClient.tsx` reads `sessionStorage.basketReservationId`
- `app/(store)/checkout/payment/_components/*` requires `basketReservationId`
- These components are orphaned — the current iron-session flow does not use them

**Should be:** Remove or archive Flow B artifacts. Keep only the iron-session checkout flow.

**Live check:** Iron-session checkout flow still works end-to-end after cleanup.
