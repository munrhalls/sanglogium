# Gap Analysis: Missing Topics in Stripe Payment Intents + Payment Elements Research

> **Date:** 2026-05-21
> **Scope:** Topics NOT covered in the main research artifact that are directly relevant to our checkout system's Stripe integration
> **Severity:** 🔴 = Critical gap | 🟡 = Important gap | 🟢 = Minor gap

---

## 🔴 Critical Gaps

### Gap 1: `payment/page.tsx` Architecture Is Entirely Client-Side

**What we missed:** The parent page that renders `PaymentForm` is a Client Component (`"use client"`), not a Server Component. It gets `basketReservationId` from `sessionStorage`, then makes 4 sequential network requests before rendering the payment form.

**Why it matters:**
- `sessionStorage` is tab-scoped and cleared on session end. If the user refreshes the payment page, the reservation ID may be lost, redirecting them to `/basket`.
- Client-side fetching means the page shows a loading spinner while 4 requests resolve. A Server Component could fetch everything server-side and render immediately.
- The `clientSecret` could be fetched in a Server Action or Server Component and passed as a prop, eliminating the `useEffect` waterfall.

**File evidence:**
```typescript
@/c:/webdev/sang-logium/app/(store)/checkout/payment/page.tsx:1-3
"use client";
import { useEffect, useState } from "react";
```

**4 network requests made:**
1. `POST /api/checkout/payment-intent` (creates PI)
2. `GET /api/basket-reservations/${id}` (page.tsx calculates total)
3. `GET /api/basket-reservations/${id}` (OrderSummary.tsx fetches again)
4. `GET /api/basket/products?ids=...` (OrderSummary.tsx fetches products)

**Recommendation for research:** Analyze whether this page should be a Server Component using Next.js App Router patterns.

---

### Gap 2: Existing Webhook Sprint Document Was Not Referenced

**What we missed:** There is a pre-existing sprint document `_project/sprints/12_webhook_handler_order_creation.md` that already designs the webhook handler architecture in detail.

**Why it matters:** Our research recommended creating a webhook handler as if it were a new idea, but the team already has a detailed design document with:
- Event-state flow diagram
- Stock finalization logic (`stock -= reservedStock`, `reservedStock = 0`)
- Idempotency strategy (query orders by `stripePaymentIntentId`)
- Sanity transaction patterns
- Integration test specification

**File evidence:**
```
_project/sprints/12_webhook_handler_order_creation.md — 287 lines
```

The sprint document specifies the webhook endpoint as `app/api/checkout/webhook/route.ts`, but `package.json` has `"webhook": "stripe listen --forward-to localhost:3000/api/webhook"`. There's a **path mismatch** between the CLI forwarding target and the sprint's planned endpoint.

**Recommendation for research:** The research should reference this document, note the path mismatch, and build on the existing design rather than reinventing it.

---

### Gap 3: No Authentication on PaymentIntent Creation Endpoint

**What we missed:** `app/api/checkout/payment-intent/route.ts` accepts ANY `basketReservationId` string from ANY requester. No session validation, no ownership check.

**Why it matters:**
- An attacker could POST with any valid `basketReservationId` and create a PaymentIntent for someone else's reservation.
- The endpoint has no rate limiting. An attacker could spam it to create thousands of PaymentIntents in Stripe.
- The `basketReservationId` comes from `sessionStorage` on the client, but the server never validates that the requesting user owns that reservation.

**File evidence:**
```typescript
@/c:/webdev/sang-logium/app/api/checkout/payment-intent/route.ts:34-45
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { basketReservationId } = body
  // No auth check, no session validation, no rate limiting
```

**Recommendation for research:** Research Stripe's recommended auth patterns for PaymentIntent creation endpoints.

---

### Gap 4: No Analysis of Payment Intent Status Lifecycle

**What we missed:** We mentioned `succeeded` and `payment_failed` but didn't cover the full status lifecycle or what each state means for our return page.

**Stripe PaymentIntent statuses (verified from docs):**
| Status | Meaning | What Our Return Page Should Do |
|--------|---------|--------------------------------|
| `requires_payment_method` | Initial state; no payment method attached | Show payment form (shouldn't happen on return page) |
| `requires_confirmation` | Created but not confirmed | Show payment form (shouldn't happen on return page) |
| `requires_action` | 3D Secure or other authentication needed | Show authentication UI (Stripe handles this before redirect) |
| `processing` | Payment submitted, awaiting bank confirmation (e.g., bank transfer) | Show "processing" message; webhook will notify when complete |
| `succeeded` | Funds captured | Show success, clear basket |
| `canceled` | Explicitly canceled by merchant | Show "canceled" message |

Our research's return page only handles `succeeded` vs `failure`. It should also handle `processing` (show a "payment is processing" state) rather than treating it as failure.

**Recommendation for research:** Document the full lifecycle and how each state maps to our return page UX.

---

### Gap 5: No Coverage of 3D Secure / `requires_action`

**What we missed:** For European cards and some other regions, `stripe.confirmPayment` may trigger 3D Secure authentication BEFORE redirecting. The user may see a modal or full-page auth challenge.

**Why it matters:**
- With `automatic_payment_methods: { enabled: true }`, Stripe decides which payment methods to show. If a European customer uses a card, 3D Secure may trigger.
- The research assumes `confirmPayment` either errors immediately or redirects. The `requires_action` path (intermediate auth before redirect) was not covered.
- Our return page assumes the redirect always happens. If `confirmPayment` returns `requires_action`, Stripe handles the auth UI, but our code doesn't account for this path.

**Recommendation for research:** Document how `confirmPayment` handles `requires_action` and what the return page should expect.

---

## 🟡 Important Gaps

### Gap 6: No Analysis of `automatic_payment_methods` Dashboard Configuration

**What we missed:** We used `automatic_payment_methods: { enabled: true }` but didn't verify:
- What payment methods this actually enables (depends on Stripe Dashboard settings)
- Whether payment methods must be manually enabled in the Dashboard
- Whether this affects PCI compliance scope (SAQ A-EP vs SAQ A)
- Whether `automatic_payment_methods` works with our Stripe API version (`2025-10-29.clover`)

**Why it matters:** If the Dashboard has no payment methods enabled, `automatic_payment_methods: { enabled: true }` may still only show cards. For iDEAL, Sofort, etc., they must be explicitly enabled.

**Recommendation for research:** Verify Stripe Dashboard requirements for `automatic_payment_methods`.

---

### Gap 7: No Coverage of `stripe.confirmPayment` Error Type Taxonomy

**What we missed:** We mentioned "immediate errors" but didn't document the specific error types Stripe returns:

| Error Type | Cause | User Action |
|------------|-------|-------------|
| `card_error` | Card declined, expired, invalid CVC | Ask user to check card details |
| `validation_error` | Missing required field, invalid format | Ask user to complete form |
| `api_error` | Stripe API outage, rate limit | Retry or show generic error |
| `idempotency_error` | Duplicate idempotency key | Retry with new key |
| `rate_limit_error` | Too many requests | Back off and retry |

Our `PaymentForm.tsx` does `console.error(error)` and sets `processing = false`, but doesn't show a user-facing error message (no error state in UI).

**Recommendation for research:** Document error types and map each to a user-facing message.

---

### Gap 8: `sessionStorage` Fragility for Reservation ID

**What we missed:** `payment/page.tsx` reads `basketReservationId` from `sessionStorage`:

```typescript
@/c:/webdev/sang-logium/app/(store)/checkout/payment/page.tsx:24
const id = sessionStorage.getItem("basketReservationId");
```

**Why it matters:**
- `sessionStorage` is tab-scoped. If the user opens payment in a new tab, it's empty.
- `sessionStorage` is cleared when the tab closes. If the browser crashes or is closed, the ID is lost.
- The fallback is `router.push("/basket")` — a redirect that loses the user's checkout progress.
- `localStorage` would persist across tabs and sessions. A URL query parameter would be shareable/refresh-safe.

**Recommendation for research:** Analyze alternatives to `sessionStorage` for passing `basketReservationId`.

---

### Gap 9: No Coverage of PaymentIntent Amount Update

**What we missed:** If the user goes back from payment to shipping and changes their shipping method, the existing PaymentIntent has the OLD amount. Stripe allows updating a PI's amount.

**Why it matters:** Our flow creates a new PI every time the payment page loads. This leaves orphaned PIs in Stripe. Updating the existing PI (if we stored its ID) would be cleaner.

**Stripe docs claim (verified):** "If the amount changes, you can update its amount."

**Recommendation for research:** Document `stripe.paymentIntents.update(id, { amount: newAmount })` as an alternative to creating new PIs.

---

### Gap 10: No Analysis of `appearance` and `loader` APIs for Payment Element

**What we missed:** Stripe's Payment Element supports `appearance` (customization) and `loader: 'auto'` (skeleton UI).

**Why it matters:**
- `loader: 'auto'` shows a skeleton loader while Stripe.js initializes, improving perceived performance.
- `appearance` allows theming the Payment Element to match our brand colors.
- Without these, the Payment Element may look visually jarring or take time to appear with no loading indicator.

**Canonical source:** `@stripe/react-stripe-js` README minimal example includes `appearance: { /*...*/ }` and `loader` options.

**Recommendation for research:** Document `appearance` and `loader` configuration for our Payment Element.

---

### Gap 11: No Coverage of `setup_future_usage` for Saved Payment Methods

**What we missed:** We didn't cover whether logged-in users should have their payment methods saved for future purchases.

**Why it matters:**
- `setup_future_usage: 'on_session'` on the PaymentIntent saves the card for future on-session payments.
- This requires a Stripe Customer ID to be associated with the PaymentIntent.
- Our codebase has `@clerk/nextjs` for auth — we could link Clerk users to Stripe Customers.
- Without this, returning customers must re-enter card details every time.

**Recommendation for research:** Document `setup_future_usage` and whether it fits our product requirements.

---

### Gap 12: No Analysis of Reservation Expiration During Payment

**What we missed:** Basket reservations have `expiresAt`. What happens if the reservation expires while the user is on the payment page?

**Why it matters:**
- The PaymentIntent was created with a reservation that may have expired.
- The webhook handler (when implemented) will try to fetch the reservation by ID — it may be already deleted by the cleanup job.
- The stock was reserved but if the reservation expires, the cleanup job releases `reservedStock`. The webhook might then try to finalize stock from a non-existent reservation.
- There's no check in `payment-intent/route.ts` that the reservation is still valid (not expired) before creating the PI.

**File evidence:**
```typescript
@/c:/webdev/sang-logium/app/api/checkout/payment-intent/route.ts:54-56
const reservation = await backendClient.fetch<ReservationData>(reservationQuery, {
  id: basketReservationId,
})
// No check for reservation.expiresAt > now
```

**Recommendation for research:** Document the expiration race condition and how to handle it.

---

### Gap 13: No Coverage of `window.location.reload()` Anti-Pattern

**What we missed:** `payment/page.tsx` uses `window.location.reload()` for retry:

```typescript
@/c:/webdev/sang-logium/app/(store)/checkout/payment/page.tsx:77
window.location.reload();
```

**Why it matters:**
- This is a full browser reload, not a Next.js navigation. It resets all React state, re-fetches all data, and causes a full re-render.
- A better pattern would be to reset component state (`setStatus("loading")`) and re-trigger the `initializePayment` function.
- In a Next.js SPA, `router.push("/checkout/payment")` or state reset is preferred.

**Recommendation for research:** Note this as a code quality issue.

---

## 🟢 Minor Gaps

### Gap 14: No Analysis of `stripe` Package Version Compatibility

**What we missed:** `stripe` npm package is `^19.1.0` but API version is `'2025-10-29.clover'`. Does this package version support this API version?

**Why it matters:** If the package is older than the API version, some features may not work or types may be incorrect.

**Recommendation for research:** Verify compatibility matrix.

---

### Gap 15: No Coverage of `PaymentElement` Layout Options

**What we missed:** `PaymentElement` supports `layout: { type: 'tabs' | 'accordion' }`.

**Why it matters:** This controls how payment methods are displayed (tabs vs accordion). The default may not match our design.

**Recommendation for research:** Document layout options.

---

### Gap 16: No Mention of Webhook Endpoint Path Mismatch

**What we missed:**
- `package.json` script: `--forward-to localhost:3000/api/webhook`
- Sprint document plans: `app/api/checkout/webhook/route.ts`
- These are DIFFERENT paths.

**Why it matters:** When someone runs `npm run webhook`, Stripe CLI forwards to `/api/webhook`, but the handler will be at `/api/checkout/webhook`. The webhook events will 404.

**Recommendation for research:** Flag this as an existing infrastructure bug.

---

## Summary Table

| # | Gap | Severity | Source of Evidence |
|---|-----|----------|-------------------|
| 1 | `payment/page.tsx` is entirely client-side with 4 network requests | 🔴 Critical | Direct file read |
| 2 | Existing webhook sprint document not referenced | 🔴 Critical | Direct file read (`_project/sprints/...`) |
| 3 | No auth on PaymentIntent creation endpoint | 🔴 Critical | Direct file read |
| 4 | No PI status lifecycle coverage | 🔴 Critical | Stripe docs |
| 5 | No 3D Secure / `requires_action` coverage | 🔴 Critical | Stripe docs |
| 6 | No `automatic_payment_methods` dashboard config analysis | 🟡 Important | Stripe docs |
| 7 | No error type taxonomy | 🟡 Important | Stripe docs |
| 8 | `sessionStorage` fragility | 🟡 Important | Direct file read |
| 9 | No PI amount update coverage | 🟡 Important | Stripe docs |
| 10 | No `appearance`/`loader` API coverage | 🟡 Important | Stripe docs + samples |
| 11 | No `setup_future_usage` coverage | 🟡 Important | Stripe docs |
| 12 | No reservation expiration race condition analysis | 🟡 Important | Direct file read + architecture |
| 13 | `window.location.reload()` anti-pattern | 🟡 Important | Direct file read |
| 14 | `stripe` package version compatibility | 🟢 Minor | Package analysis |
| 15 | No `PaymentElement` layout options | 🟢 Minor | Stripe docs |
| 16 | Webhook endpoint path mismatch | 🟢 Minor | `package.json` + sprint doc |
