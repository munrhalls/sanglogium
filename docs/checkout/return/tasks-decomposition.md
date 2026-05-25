# Tasks Decomposition - Return Flow

**Happy path tracer only. Manual verification on dev server.**

*Important*: session refers to iron-session, the checkout session. The return flow is **two endpoints** — a Route Handler (`/api/checkout/return`) and a Server Component (`/checkout/success`). The path `/checkout/return` does not exist anywhere; never use it.

---

## Task 1: Layer 4 — Service Infrastructure

### 1.1 Stripe PaymentIntent retrieval helper
- Verify or add `retrievePaymentIntent(paymentIntentId)` in `lib/stripe.ts`:
  - Calls `stripe.paymentIntents.retrieve(paymentIntentId)`
  - Returns the full PaymentIntent object (status, amount, currency, metadata, latest_charge)
  - Lets Stripe SDK errors throw — callers (Route Handler and success page) wrap in their own `try/catch` per their boundary rules.

### 1.2 Sanity order schema verification (BLOCKING DELIVERABLE — mirrors payment Task 5.0)
- Open `sanity-cms/schemaTypes/` and locate the order document type (or confirm it must be created).
- Fill in the exact field paths and TypeScript types observed; do not proceed until all four lines have real values:
  ```
  Verified order _type:                ____________________  (e.g. order)
  Verified paymentIntentId field path: ____________________  (must be `paymentIntentId`, not snake_case)
  Verified items field path:           ____________________  (e.g. items)
  Verified total field path:           ____________________  (e.g. total — integer grosz)
  Verified address field path:         ____________________  (e.g. address — 5 flat string fields)
  Verified orderDate field path:       ____________________  (e.g. orderDate — ISO datetime)
  ```
- If field names diverge, update both this doc, payment Test 14, and the GROQ query below.
- The payment-page Test 14 and the success page Test 6 will silently disagree if the field names are not pinned here.

### 1.3 Sanity order fetch helper
- Add a server-only fetch (use the existing read client — anonymous, useCdn: true) that runs the GROQ query:
  ```
  *[_type == "order" && paymentIntentId == $paymentIntentId][0]{
    _id, items, total, address, orderDate
  }
  ```
- Returns the order document or `null` (webhook lag is a normal state, not an error).

---

## Task 2: Route Handler at `/api/checkout/return`

### 2.1 Create `app/api/checkout/return/route.ts`
- Export `async function GET(request: Request) { ... }`.
- Read `payment_intent` from `new URL(request.url).searchParams`. If missing → `redirect('/basket?error=missing_intent')`.
- Ignore `payment_intent_client_secret` (Stripe also appends it; we don't need it server-side).
- Ignore `redirect_status` (client-controllable; status MUST come from Stripe API).

### 2.2 Verify the PaymentIntent server-side, with try/catch
- Wrap in `try/catch`:
  ```ts
  let pi
  try {
    pi = await retrievePaymentIntent(payment_intent)
  } catch {
    redirect(`/checkout/success?payment_intent=${payment_intent}&error=verification_failed`)
  }
  ```
- Route Handlers do NOT bubble to `app/checkout/error.tsx`. An unhandled throw becomes a raw 500 — with a successful charge already on the user's card. The catch + redirect to the success page (which renders an actionable error state) is the single recovery mechanism.

### 2.3 Status-driven session lifecycle (canonical — do not deviate)
- Acquire the session via `getCheckoutSession()`.
- **Step 1 (always, regardless of status)**: `session.completedPaymentIntentId = pi.id`. This is the privacy-guard key for `/checkout/success`; uniform across statuses so failed/canceled/processing branches can also render (without it the success page would redirect those users to `/basket` instead of showing the retry state).
- **Step 2 (per-status partial-clear)** — apply this table exactly:
  | PI `status` | `paymentIntentId` | `basket`/`address`/`shippingCode`/`shippingCost` | Redirect |
  |---|---|---|---|
  | `succeeded` | clear | clear | `/checkout/success?payment_intent=${pi.id}` |
  | `requires_payment_method` | clear | **KEEP** — user can retry payment in one click | `/checkout/success?payment_intent=${pi.id}&status=failed` |
  | `canceled` | clear | **KEEP** | `/checkout/success?payment_intent=${pi.id}&status=canceled` |
  | `processing` | KEEP — async confirmation may still resolve | KEEP | `/checkout/success?payment_intent=${pi.id}&status=processing` |
  | any other | clear | KEEP | `/basket?error=unexpected_status` |
- **Step 3**: `await session.save()`.
- Use partial-clear (`session.fieldName = undefined`) NOT `session.destroy()`. `destroy()` deletes the entire cookie; partial-clear preserves the cookie shell so the next request still has a session to write into.
- The Route Handler chooses the redirect; the success page does not re-route based on status.
- **This table is the canonical contract — same table appears in `framed-objective.md` (this scope) and `docs/checkout/payment/framed-objective.md` and must stay in sync across all three.**

---

## Task 3: Success Page at `/checkout/success`

### 3.1 Create `app/checkout/success/page.tsx`
- Server Component. No `'use client'`.
- Signature: `export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ payment_intent?: string; status?: string; error?: string }> })`.
- Read `payment_intent`, `status`, `error` from `await searchParams`.

### 3.2 Privacy guard (FIRST thing the page does)
```ts
if (!payment_intent) redirect('/basket')
const session = await getCheckoutSession()
if (session.completedPaymentIntentId !== payment_intent) redirect('/basket')
```
- Without this, anyone with a leaked PI id (referer headers, browser history, link sharing, analytics) can render another user's order.
- `session.completedPaymentIntentId` is set only by the Route Handler. The guard implicitly proves the user just came through the Route Handler.

### 3.3 Verify status server-side
- Call `retrievePaymentIntent(payment_intent)` inside `try/catch`. On catch, render the `error=verification_failed` state (see 3.5) without throwing — we already have a paying customer; never show them a generic 500.
- Trust the Stripe-returned status over the URL `status` query param for decision-making; use the URL `status` only for display branching when Stripe returns the same value.

### 3.4 Render branches (`switch` on Stripe-returned status)
- `succeeded`: render the `<OrderDetails />` Suspense slot (Task 4).
- `requires_payment_method` / `canceled` / `processing`: render the matching error state (Task 5). No Sanity query.
- Anything else (or `error=verification_failed`): render the verification-failed state with support contact instructions.

### 3.5 Recoverable error state (`error=verification_failed`)
- Display: "We couldn't verify your payment status right now. Your card may have been charged. Please contact support with this reference: `<payment_intent>`."
- `role="alert"`; no automatic redirect; provide explicit links to `/basket` and to a support page.

---

## Task 4: `<OrderDetails />` with React Suspense

### 4.1 Create the async Server Component
- Separate file (e.g. `app/checkout/success/OrderDetails.tsx`). Server Component, no `'use client'`.
- Props: `{ paymentIntentId: string; fallbackTotal: number }` (fallback total comes from the Stripe PI for the lag-state display).
- Calls the Sanity helper from Task 1.3.
- If document found: render `_id`, `items` (product × qty × line total in grosz, plus PLN display), `total` (grosz → PLN), `address` (5 flat fields), `orderDate`, and a link to `/basket` for the next checkout.
- If document is `null`: render the lag state (Task 4.3).

### 4.2 Wrap in Suspense
- In `page.tsx`:
  ```tsx
  <Suspense fallback={<p>Fetching order details…</p>}>
    <OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />
  </Suspense>
  ```
- The page itself MUST NOT `await new Promise(setTimeout, 2000)`. Suspense + null-handling is the single mechanism for webhook lag. A server-side delay penalises every user, including those whose webhook has already landed.

### 4.3 Webhook-lag fallback (when OrderDetails fetch returns `null`)
- Display: "Payment successful — generating your invoice…"
- Show fallback amount (from Stripe `pi.amount`, formatted PLN).
- Render a tiny `'use client'` refresh component:
  ```tsx
  // RefreshButton.tsx
  'use client'
  import { useRouter } from 'next/navigation'
  export function RefreshButton() {
    const router = useRouter()
    return <button onClick={() => router.refresh()}>I've waited — refresh</button>
  }
  ```
- `router.refresh()` re-runs the Server Component fetch without a full page reload. This is the only client-side code in the success scope.

---

## Task 5: Error state renderings (no separate routing — the page handles them)

### 5.1 `requires_payment_method` (failed)
- `role="alert"` region.
- Display Stripe error message via `pi.last_payment_error?.message ?? 'Payment was declined.'`.
- Link to `/checkout/payment` (the basket / address / shipping data is still in the session by Route Handler design — user can retry payment).

### 5.2 `canceled`
- `role="alert"` region.
- Display "Payment was canceled."
- Link to `/checkout/payment` (same retry path as 5.1; basket data preserved).

### 5.3 `processing`
- `role="alert"` region.
- Display "Payment is processing. We'll email a confirmation when settled."
- Render the same `<RefreshButton />` from 4.3.

### 5.4 `verification_failed` (Stripe API down at retrieval)
- See Task 3.5.

---

## Task 6: Acceptance Testing
See `acceptance-tests.md`. Tests are numbered to mirror the payment scope (`X`, `X.5`, etc.) where decimal sub-numbers indicate scenarios that depend on session injection or specific PI states.

---

## Dependencies (load-bearing prerequisites)

- **Payment scope** (`docs/checkout/payment/`) implements the canonical paymentIntentId lifecycle, sets `session.paymentIntentId`, and uses `return_url: ${origin}/api/checkout/return` (NOT `/checkout/return`).
- **Stripe webhook** at `app/api/webhooks/stripe/route.ts` (IN SCOPE for this tracer, not deferred):
  - Verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
  - Listens for `payment_intent.succeeded`.
  - **Idempotently** finds-or-creates the Sanity order keyed on `paymentIntentId` (Stripe delivers events at-least-once).
  - Decrements product stock exactly once per PaymentIntent.
  - Handles new session fields: address.firstName, address.lastName, address.phone, session.email
  - Without this, Test 6 (order details displayed) and payment Test 14 always fail.
- **Sanity order schema**: `_type` and field names pinned in Task 1.2.
- **iron-session**: configured per `lib/session.ts`. The `CheckoutSession` interface must include `completedPaymentIntentId?: string`.
- **`app/checkout/error.tsx`**: must exist (created by payment Task 2.5). Covers Server Component throws on `/checkout/success`. Does NOT cover the Route Handler — the Route Handler has its own try/catch.

---

## Cross-cut hard-coded contracts (must not drift)

| Contract | Pinned value | Where else asserted |
|---|---|---|
| Stripe `return_url` | `${origin}/api/checkout/return` | payment framed-objective, payment Task 11, payment Test 10 |
| Sanity order field name | `paymentIntentId` (camelCase) | payment Test 14, this doc Task 1.2, this doc Task 1.3 GROQ |
| Currency unit | integer grosz | every doc; never "cents", never PLN float |
| Privacy guard key | `session.completedPaymentIntentId` | payment framed-objective lifecycle table, this doc Task 2.3 + 3.2 |

---

## Vertical Slicing Order

1. Task 1.1, 1.2, 1.3 (Service Infrastructure + schema verification)
2. Task 2 (Route Handler) — verify session mutations with browser cookie inspection
3. Task 3 (Success Page) — stub Order Details first (just render PI confirmation)
4. Task 4 (Suspense + OrderDetails) — add Sanity fetch, test webhook-lag fallback
5. Task 5 (Error states) — test each Stripe test card
6. Task 6 (Acceptance Testing)

Stop and test after each task.
