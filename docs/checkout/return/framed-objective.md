# Return Flow - Framed Objective

**Happy path tracer only.**

The return flow is **two endpoints**, never one:

1. **`/api/checkout/return`** — Route Handler at `app/api/checkout/return/route.ts`. Stripe's `return_url` target. Verifies the PaymentIntent server-side, manages `iron-session` lifecycle, redirects to `/checkout/success`. **Mutating endpoint** — the only place the return flow touches the session.
2. **`/checkout/success`** — Server Component at `app/checkout/success/page.tsx`. Privacy-guarded read-only display surface. Renders payment confirmation (from Stripe) and order details (from Sanity, via Suspense).

The previous single-page design at `/checkout/return` does **not** exist. Every reference must use one of the two paths above.

---

## Route Handler `/api/checkout/return`

- Reads `payment_intent` from `URL.searchParams`. If missing → `redirect('/basket?error=missing_intent')`.
- Calls `stripe.paymentIntents.retrieve(payment_intent)` — the URL param is untrusted; status MUST come from Stripe API, not from `redirect_status` (which Stripe also appends but is client-controllable).
- **Wraps the retrieve in `try/catch`**. Route Handlers do NOT bubble to `app/checkout/error.tsx`. An unhandled throw becomes a raw 500 page — with a successful charge already on the user's card. On catch: `redirect('/checkout/success?payment_intent=<id>&error=verification_failed')`. The success page renders a recoverable error state with support-contact instructions; the user is never left on a blank 500.
- **Status-driven session lifecycle (canonical, single source of truth — same table appears in `docs/checkout/payment/framed-objective.md` and must stay in sync)**:
  - The Route Handler ALWAYS sets `session.completedPaymentIntentId = pi.id` first, regardless of status. This is the privacy-guard key for `/checkout/success`; uniform-across-statuses ensures the failed/canceled/processing display branches can also render (without it, the privacy guard would redirect those users to `/basket` instead of showing them the retry path).
  - Then the per-status partial-clear table:
  | PI `status` | `completedPaymentIntentId` | `paymentIntentId` | `basket`/`address`/`shippingCode`/`shippingCost` | Redirect |
  |---|---|---|---|---|
  | `succeeded` | set to `pi.id` | clear | clear | `/checkout/success?payment_intent=<id>` |
  | `requires_payment_method` | set to `pi.id` | clear | **KEEP** — user can retry payment in one click | `/checkout/success?payment_intent=<id>&status=failed` |
  | `canceled` | set to `pi.id` | clear | **KEEP** | `/checkout/success?payment_intent=<id>&status=canceled` |
  | `processing` | set to `pi.id` | KEEP — async confirmation may still resolve | KEEP | `/checkout/success?payment_intent=<id>&status=processing` |
  | any other | set to `pi.id` | clear | KEEP | `/basket?error=unexpected_status` |
  - Use partial-clear (`session.fieldName = undefined; await session.save()`) NOT `session.destroy()`. Partial-clear preserves the cookie shell so the next request can write into it.
- The Route Handler picks the redirect destination; it does NOT delegate status decoding to the success page. The success page reads the status it needs back from Stripe (Test 5) plus the `status` query param for display branching.
- `payment_intent_client_secret` is also appended by Stripe to the redirect URL. The Route Handler **ignores** it; we use the secret-key Stripe SDK server-side and do not need the client_secret for retrieval.

## Success Page `/checkout/success`

- Server Component, no `'use client'`.
- **Privacy guard (mandatory)** — first thing the page does:
  ```ts
  const { payment_intent } = await searchParams
  if (!payment_intent) redirect('/basket')
  const session = await getCheckoutSession()
  if (session.completedPaymentIntentId !== payment_intent) redirect('/basket')
  ```
  Without this guard, anyone with a valid PI id (URL leakage via referer, browser history, link sharing, analytics pixels) can render another user's order. `session.completedPaymentIntentId` is set only by the Route Handler immediately before redirect, so the guard implicitly proves the user just came through the Route Handler.
- Calls `stripe.paymentIntents.retrieve(payment_intent)` for amount + status display. Wrap in `try/catch`; Server Component throws DO bubble to `app/checkout/error.tsx`, but the user-facing message must be actionable.
- On `succeeded` status: renders an `<OrderDetails paymentIntentId={...} />` async Server Component **inside `<Suspense fallback="…" />`**. Main page renders instantly with Stripe-derived confirmation (amount, last4 if available); order details stream in when the webhook has written the Sanity document.
- On non-`succeeded` status (read from `searchParams.status` and re-verified via Stripe API): renders the matching error state with `role="alert"` for accessibility, no Sanity query.
- **Loads instantly** — the page must NOT do a server-side `setTimeout` waiting for the webhook. Suspense + fallback is the single mechanism for handling webhook lag.
- After the page renders successfully, `session.completedPaymentIntentId` may persist until the cookie expires or the next checkout overwrites it. Refreshing the page is idempotent (Test 15 in acceptance-tests.md).

## Order Details Component (`<OrderDetails />`)

- Async Server Component, separate file.
- GROQ: `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{ _id, items, total, address, orderDate }` — field name is exactly `paymentIntentId` (not snake_case, not `stripePaymentIntentId`); cross-confirmed with payment Test 14 and the webhook scope.
- Returns `null` if the order document does not yet exist (webhook lag).
- On `null`: renders the "Payment successful — generating invoice…" placeholder with a refresh control. The refresh control is a tiny `'use client'` component (`router.refresh()`) so the user can re-trigger the Server Component fetch without a full page reload.
- On non-`null`: renders order ID, item list, total (display in PLN, internally grosz), address (5 flattened fields), order date, and a link to `/basket` for next checkout.

## Cross-cut invariants (single source of truth)

- **paymentIntentId lifecycle** — see `docs/checkout/payment/framed-objective.md`. Both scopes share the canonical lifecycle table.
- **Webhook ordering**: Stripe's `payment_intent.succeeded` may land before, during, or after the user's browser reaches `/checkout/success`. The `<OrderDetails />` Suspense + null-handling MUST cover all three orderings. The webhook handler itself is a separate scope (`docs/checkout/webhook/`, when created).
- **Webhook idempotency**: Stripe delivers events at-least-once. The webhook handler must `find-or-create` the order keyed on `paymentIntentId` and reject duplicate stock decrements. The success page assumes this; without it, refreshes during a webhook redelivery can momentarily show two orders.
- **Currency unit**: integer grosz throughout (smallest PLN unit). Never "cents", never "złoty as float". Stripe's `amount` field is grosz; Sanity `price_data.unit_amount` is grosz; the order document `total` is grosz.

## Error boundary

- `app/checkout/error.tsx` (the same file required by the payment scope) covers Server Component throws on `/checkout/success` (e.g. Stripe API down at retrieval time).
- The Route Handler at `/api/checkout/return` does NOT use `error.tsx` — it has its own `try/catch` and redirects on failure (see Route Handler section above).

## PII discipline

- Tests below assert "server logs show payment_intent / address fields". These are **dev-only assertions**. Before shipping, gate verbose logs behind `process.env.NODE_ENV !== 'production'`. PaymentIntent IDs and address fields are PII and must not appear in production log aggregators in plain text.

## Architecture

- 4-layer architecture (Routing → Presentation → Mutation → Service Infrastructure).
- The Route Handler at `/api/checkout/return` is the **Mutation** layer; the success page is the **Routing/Presentation** layer; `lib/stripe.ts` and the Sanity client are **Service Infrastructure**.
- Vertical slicing (tracer bullet): build Layer 4 → Route Handler → success page → Suspense → error states, in that order.
