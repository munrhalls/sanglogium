# Payment Slice — Chunk Decomposition

## Existing Foundation (already implemented, not part of any chunk)

- **Checkout queue** (`lib/queue/processor.ts`) — creates `basketReservation` documents in Sanity with `basketReservation[]`, `createdAt`, `expiresAt`
- **Address slice** — saves validated `shippingAddress` to reservation via `PATCH /api/basket-reservations/[id]`
- **Shipping slice** — saves selected `shippingChoice` to reservation via `PATCH /api/basket-reservations/[id]`, then redirects to `/checkout/payment`
- **Cleanup job** (`lib/queue/cleanup.ts`) — releases `reservedStock` and deletes expired reservations
- **Stripe packages** already installed (`stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Placeholder payment page** at `app/(store)/checkout/payment/page.tsx` (just renders `<div>page</div>`)
- **Existing return page** at `app/(store)/checkout/return/page.tsx` (uses old `session_id` pattern — needs adaptation)

---

## Chunk 1: PaymentIntent API Endpoint

**Files:** `app/api/checkout/payment-intent/route.ts`, `lib/stripe.ts` (new — Stripe server client init)

**What it does:** Receives `{ basketReservationId }`, fetches the reservation from Sanity, fetches current `price_data` for each product, computes `total = Σ(unit_amount × quantity) + shippingChoice.amount`, validates currency consistency, calls `stripe.paymentIntents.create()`, returns `{ clientSecret }`.

**Rationale for being first:** This is the foundation. Everything downstream depends on the `clientSecret`. It can be implemented and verified entirely in isolation — testable with curl or a REST client against Stripe test mode. No UI needed.

**Key details:**
- Error classification: `VALIDATION` (missing/invalid reservation), `COMPUTATION` (price/currency mismatch), `STRIPE` (Stripe API errors)
- Stores `basketReservationId` in PaymentIntent `metadata` for webhook idempotency
- Uses `automatic_payment_methods: { enabled: true }`
- Initializes Stripe server client from `STRIPE_SECRET_KEY` in a shared `lib/stripe.ts` module

**Verification:** POST to the endpoint with a valid `basketReservationId` → receive `{ clientSecret }`. POST with invalid/missing data → receive classified error.

---

## Chunk 2: Payment Page UI

**Files:** `app/(store)/checkout/payment/page.tsx` (replace placeholder), new `PaymentForm` component, new `OrderSummary` component

**Depends on:** Chunk 1 (needs the API to get `clientSecret`)

**What it does:** On mount, reads `basketReservationId` from `sessionStorage`, calls the PaymentIntent API, initializes Stripe `Elements` provider with `clientSecret`, renders `PaymentElement` + `OrderSummary` (basket items, shipping, computed total), handles `stripe.confirmPayment()` on submit with a `return_url` pointing to `/checkout/return`.

**Rationale for being second:** Once the API returns a `clientSecret`, the UI is a straightforward Stripe Elements integration. The shipping page already redirects here after saving the shipping choice, so the entry point exists.

**Key details:**
- States: loading (while creating PaymentIntent), error (API failure), payment form (ready), processing (during confirmPayment)
- `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` for client-side initialization
- `return_url` set to `/checkout/return?payment_intent={id}`
- 3D Secure / SCA handled automatically by Payment Element — no custom code
- `OrderSummary` reads reservation data to display line items and total before payment

**Verification:** Navigate through full flow (basket → address → shipping → payment), see Payment Element rendered, enter Stripe test card `4242...`, confirm payment, get redirected to return URL.

---

## Chunk 3: Webhook Handler & Order Creation

**Files:** `app/api/checkout/webhook/route.ts`

**Depends on:** Chunk 2 (payment must be confirmable to trigger webhook events)

**What it does:** Receives Stripe webhook events, verifies signature via `STRIPE_WEBHOOK_SECRET`, filters for `payment_intent.succeeded`, extracts `basketReservationId` from metadata, fetches the reservation, creates an order document in Sanity, finalizes stock (decrements `stock` by reserved quantities and zeros out `reservedStock`), deletes the reservation document.

**Rationale for being third:** This is the server-side integrity piece — the "actually complete the purchase" logic. It's naturally after the payment UI because webhooks are triggered by real payments. Testable independently with Stripe CLI's `stripe trigger payment_intent.succeeded` or `stripe listen --forward-to`.

**Key details:**
- Signature verification via `stripe.webhooks.constructEvent()`
- Idempotency: checks if an order already exists for this `basketReservationId` before creating a duplicate
- Stock finalization: `stock -= reservedStock`, `reservedStock = 0` (different from cleanup job which only releases `reservedStock`)
- Order document includes: items, quantities, prices, shipping choice, shipping address, payment intent ID, timestamp
- Returns `200` immediately to acknowledge receipt

**Verification:** Use Stripe CLI to forward webhooks to local endpoint, trigger a test `payment_intent.succeeded` event, verify order created in Sanity, stock deducted, reservation deleted. Send the same event twice → verify no duplicate order.

---

## Chunk 4: Return / Success Page Adaptation

**Files:** `app/(store)/checkout/return/page.tsx` (adapt existing)

**Depends on:** Chunk 3 (webhook creates the order, but page must not depend on it synchronously)

**What it does:** Adapts the existing return page from the old `session_id`-based Stripe Checkout Session pattern to the new PaymentIntent flow. Shows a static success confirmation — does NOT fetch the order from Sanity (the webhook may not have fired yet). Displays the payment intent ID from the query param for reference.

**Rationale for being last:** This is the final UX touchpoint. The existing page already has good UI (CheckCircle icon, "What happens next" steps, links). The adaptation is minimal — remove `session_id` logic, remove the order fetch, show a clean success state.

**Key details:**
- Reads `payment_intent` from query params (set by Stripe's redirect)
- Shows static success message — no API call to fetch order (avoids race condition with webhook)
- Preserves existing UI: CheckCircle, next steps, "View My Orders" / "Continue Shopping" links
- Clears basket state on mount

**Verification:** Complete a full test payment → get redirected to `/checkout/return?payment_intent=pi_xxx` → see success page with correct payment intent ID. Page loads instantly (no spinner waiting for order).

---

## Ordering Validation

| Chunk | Can be implemented in isolation? | Can be verified in isolation? | Blocks any later chunk? |
|---|---|---|---|
| 1. PaymentIntent API | Yes — pure server endpoint | Yes — curl / REST client | Blocks 2 (needs clientSecret) |
| 2. Payment Page UI | No — needs Chunk 1 API | Yes — with Chunk 1 + Stripe test mode | Blocks 3 (needs real payments for webhooks) |
| 3. Webhook Handler | Yes — pure server endpoint | Yes — Stripe CLI webhook forwarding | Blocks 4 (order creation completes the flow) |
| 4. Return Page | Yes — static page | Yes — manual navigation with query param | Nothing |

Each chunk cumulatively advances toward the complete feature without requiring any chunk to be revisited. No circular dependencies.

---

## Design Notes (for sprint creation)

- **Race condition (Chunk 4):** The return page loads before the webhook fires. Do not fetch the order — show a static success page. This is simpler and more robust.
- **Stock finalization (Chunk 3):** Distinct from the cleanup job. Cleanup releases `reservedStock` back to available. Webhook deducts both `stock` and `reservedStock` (actual purchase).
- **Shared Stripe client (Chunk 1):** Initialize once in `lib/stripe.ts` using `STRIPE_SECRET_KEY`, following the same pattern as `sanity-cms/lib/backendClient.ts`.
- **Error classification consistency:** All chunks use the same error taxonomy: `VALIDATION`, `COMPUTATION`, `STRIPE`.
