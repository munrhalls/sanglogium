# Sprint: Return Flow — Stripe Redirect + Success Page (Happy Path)

**Happy path tracer only.** Source documents: `docs/checkout/return/{framed-objective.md, tasks-decomposition.md, acceptance-tests.md}`. Scope is the **two-endpoint return flow**: Route Handler at `/api/checkout/return` and Server Component at `/checkout/success`. The payment page is a hard upstream dependency (separate, completed sprint at `_project/sprints/payment-page-tracer.md`). The Stripe webhook handler is a separate downstream scope referenced here only as a cross-cut precondition.

---

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` found. Skipping automated lesson retrieval.

**Manually retained constraints from prior sprints** (payment + shipping + address):
- iron-session is the single source of truth between checkout pages; reads via `getCheckoutSession()`.
- All prices stored as **integer grosz**. Never floats. Never "cents".
- **Route Handlers do NOT bubble to `app/checkout/error.tsx`.** An unhandled throw in a Route Handler becomes a raw 500 — with a successful charge already on the user's card. Therefore: `try/catch` is mandatory in the Route Handler; on catch, redirect to the success page's recoverable error state. (Server Components DO bubble to `error.tsx`, so the success page can use a throw — but only for unrecoverable failures.)
- The path `/checkout/return` does NOT exist anywhere. Stripe's `return_url` from the payment page is `${origin}/api/checkout/return` (the Route Handler).

---

## PHASE 1: UX Flows First

### Current State (Payment Page Complete)
1. User completes payment on `/checkout/payment` → Stripe `confirmPayment` succeeds.
2. Stripe redirects the browser to `${origin}/api/checkout/return?payment_intent=pi_xxx&payment_intent_client_secret=...&redirect_status=...`.
3. **Today: that Route Handler does not exist — 404.** This sprint creates it and everything downstream.

### Target State (After Sprint)
1. Stripe redirects → `/api/checkout/return` runs server-side → verifies the PI with `stripe.paymentIntents.retrieve()` → mutates iron-session per the canonical lifecycle table → redirects to `/checkout/success`.
2. User lands on `/checkout/success` — page loads instantly with Stripe-derived payment confirmation (amount, status).
3. **If payment succeeded**:
   - Order details stream in via Suspense when the webhook has written the Sanity order document.
   - User sees order ID, items, total, address, date, and a link to `/basket` for the next checkout.
   - If the webhook is still pending: "Payment successful — generating your invoice…" placeholder renders with a refresh button; clicking it re-runs the server fetch without a full page reload.
4. **If payment failed / canceled**: a `role="alert"` retry surface renders ("Payment was declined." with `last_payment_error` message; or "Payment was canceled."). Basket + address + shipping are PRESERVED in session — user can click "Try again" → land on `/checkout/payment` and re-submit in one click.
5. **If payment is processing** (async settlement): a `role="alert"` "Payment is processing" surface renders with the same refresh button.
6. **If Stripe verification fails** (Stripe API down during retrieve): a `role="alert"` recoverable error renders with the `payment_intent` as a support reference and links to `/basket` and a support page. **The user is never left on a raw 500 with a successful charge.**
7. **Direct navigation to `/checkout/success` by anyone without the privacy-guard key**: redirects to `/basket`. Leaked PI IDs (referer, history, link sharing) cannot render another user's order.

### End-State Overview
After completing payment, the user sees their order confirmation immediately, with items streaming in as the webhook lands — and if anything goes wrong (decline, cancel, async processing, Stripe API down), they get a clear, actionable retry surface instead of a generic error page. The basket survives every non-success path so retry is one click. Direct-link sharing of the success URL is blocked at the server. The single source of truth is iron-session, mutated only by the Route Handler.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow
```
Event: Stripe redirects browser to /api/checkout/return?payment_intent=pi_xxx&...
State: Route Handler reads URL.searchParams
Side Effect 1 (guard): if (!payment_intent) → redirect /basket?error=missing_intent
Side Effect 2 (verify, try/catch):
  try { pi = await stripe.paymentIntents.retrieve(payment_intent) }
  catch { redirect /checkout/success?payment_intent=<id>&error=verification_failed }
Side Effect 3 (session lifecycle — ALWAYS, then per-status):
  session.completedPaymentIntentId = pi.id    // uniform; privacy-guard key
  switch (pi.status) {
    'succeeded':              clear basket, address, shippingCode, shippingCost, paymentIntentId
    'requires_payment_method': clear paymentIntentId only (KEEP basket+address+shipping)
    'canceled':               clear paymentIntentId only (KEEP)
    'processing':             KEEP everything (clear nothing)
    default:                  clear paymentIntentId only → redirect /basket?error=unexpected_status
  }
  await session.save()
Result Event: redirect /checkout/success?payment_intent=<id>[&status=<failed|canceled|processing>]

Event: User lands on /checkout/success?payment_intent=pi_xxx&status=?
State: Server Component reads searchParams + session
Side Effect 1 (privacy guard, FIRST):
  if (!payment_intent) → redirect /basket
  if (session.completedPaymentIntentId !== payment_intent) → redirect /basket
Side Effect 2 (verify status, try/catch):
  try { pi = await stripe.paymentIntents.retrieve(payment_intent) }
  catch { render verification_failed branch (no throw — user already paid) }
Result Event: switch on pi.status:
  'succeeded'                → render <Suspense fallback="Fetching order details…">
                                <OrderDetails paymentIntentId={...} fallbackTotal={pi.amount} />
                              </Suspense>
  'requires_payment_method'  → render failed branch (role=alert; retry link to /checkout/payment)
  'canceled'                 → render canceled branch (role=alert; retry link)
  'processing'               → render processing branch (role=alert; <RefreshButton />)
  verification_failed        → render verification branch (role=alert; PI id + support link)

Event: <OrderDetails /> async Server Component runs
State: GROQ fetch by paymentIntentId
Result Event:
  order found  → render _id, items, total (grosz → PLN), address, orderDate, link to /basket
  order null   → render "Payment successful — generating your invoice…" + fallbackTotal + <RefreshButton />

Event: User clicks <RefreshButton /> (only 'use client' code in this scope)
State: router.refresh()
Result Event: Server Component fetch re-runs; if webhook landed, full order renders
```

### Events + Payloads
```typescript
// iron-session — fields touched by this sprint (already declared by payment sprint Scope 1)
interface CheckoutSession {
  basket: Array<{ productId: string; quantity: number }>
  address?: { regionCode, postalCode, street, streetNumber, city: string }
  shippingCode?: string
  shippingCost?: number
  paymentIntentId?: string
  completedPaymentIntentId?: string  // SET by Route Handler on every status; READ by /checkout/success privacy guard
}

// Route Handler URL contract (from Stripe)
interface ReturnHandlerSearchParams {
  payment_intent?: string                  // REQUIRED — basis for retrieve
  payment_intent_client_secret?: string    // IGNORED (server-side uses secret key)
  redirect_status?: string                 // IGNORED (client-controllable; trust Stripe API only)
}

// Success page URL contract (from Route Handler)
interface SuccessPageSearchParams {
  payment_intent: string
  status?: 'failed' | 'canceled' | 'processing'   // display-branch hint; pi.status is the truth
  error?: 'verification_failed'                   // set ONLY by Route Handler catch path
}

// OrderDetails Sanity contract (GROQ)
// *[_type == "order" && paymentIntentId == $paymentIntentId][0]{ _id, items, total, address, orderDate }
interface OrderDocument {
  _id: string
  items: Array<{ productId, quantity, lineTotal: number }>  // schema pinned in Scope 1
  total: number                                              // grosz
  address: { regionCode, postalCode, street, streetNumber, city: string }
  orderDate: string                                          // ISO
}
```

### Transition Table (Route Handler — canonical lifecycle, must match all three return docs + payment framed-objective)
| PI `status` | `completedPaymentIntentId` | `paymentIntentId` | `basket` / `address` / `shippingCode` / `shippingCost` | Redirect |
|---|---|---|---|---|
| `succeeded` | set to `pi.id` | clear | clear | `/checkout/success?payment_intent=<id>` |
| `requires_payment_method` | set to `pi.id` | clear | **KEEP** — user can retry payment in one click | `/checkout/success?payment_intent=<id>&status=failed` |
| `canceled` | set to `pi.id` | clear | **KEEP** | `/checkout/success?payment_intent=<id>&status=canceled` |
| `processing` | set to `pi.id` | KEEP — async confirmation may still resolve | KEEP | `/checkout/success?payment_intent=<id>&status=processing` |
| any other | set to `pi.id` | clear | KEEP | `/basket?error=unexpected_status` |

### Hard Architecture Contracts (must not drift)
1. **Route Handler `try/catch` is mandatory** around `stripe.paymentIntents.retrieve()`. On catch → redirect to `/checkout/success?...&error=verification_failed`. NEVER let it 500.
2. **`session.completedPaymentIntentId` is ALWAYS set** on every status (uniform privacy-guard key). The per-status table only varies `paymentIntentId` and the upstream funnel fields.
3. **Use partial-clear (`session.x = undefined`)** NOT `session.destroy()`. Partial-clear preserves the cookie shell for the next request.
4. **Success page privacy guard FIRST**: before any Stripe call, compare `searchParams.payment_intent === session.completedPaymentIntentId`. Mismatch → redirect `/basket`.
5. **Privacy guard does NOT depend on PI status** — failed/canceled/processing branches need the guard too (that's why `completedPaymentIntentId` is set on every status).
6. **No server-side `setTimeout`** in the success page. Suspense + null-handling is the single mechanism for webhook lag.
7. **Only `RefreshButton.tsx` carries `'use client'`** in this scope. Everything else is Server Components.
8. **Sanity order field name is `paymentIntentId`** (camelCase). Cross-asserted with payment Test 14.
9. **Currency unit = integer grosz** throughout. Display conversion to PLN is presentation-only.
10. **The path `/checkout/return` does NOT exist.** Every reference is `/api/checkout/return` (Route Handler) or `/checkout/success` (display) or `docs/checkout/return/` (doc folder).

### Simplicity Guardrail
"If a branch can be expressed by setting a different `status` query param + reading it once in the success page, do it that way — don't introduce a state machine."

---

## PHASE 3: Scope Contracts

Four contracts, executed in order. Each is self-contained and verifies the ground for the next.

---

### Scope Contract 1 — Service Infrastructure + Sanity order schema pinning

**Source tasks:** Task 1.1, Task 1.2 (BLOCKING DELIVERABLE), Task 1.3 from `tasks-decomposition.md`.

#### UX Slice
- No user-visible UX change yet.
- After this scope: pure server-side helpers exist; one runtime check confirms a real order document can be fetched.

#### Architecture Slice
- Verify or add `retrievePaymentIntent(paymentIntentId)` to `lib/stripe.ts` — thin wrapper around `stripe.paymentIntents.retrieve()` that returns the full PI object and lets SDK errors throw (callers wrap in their own `try/catch` per their boundary rules).
- **Blocking deliverable** (do NOT skip — Task 1.2): open `sanity-cms/schemaTypes/` and locate the order document type (or confirm it must be created in this scope). Fill in the table — all five lines must have real values before any code below runs:
  - Verified order `_type`: ____________________
  - `paymentIntentId` field path: ____________________ (MUST be camelCase)
  - `items` field path + shape: ____________________
  - `total` field path + type: ____________________ (integer grosz)
  - `address` field path + shape: ____________________ (5 flat string fields)
  - `orderDate` field path + type: ____________________ (ISO datetime)
- If the schema does not yet exist, create the minimum order schema in `sanity-cms/schemaTypes/orderType.ts` and add to `schema.ts` exports. Pin the result back into `tasks-decomposition.md` Task 1.2 + payment Test 14.
- Add `fetchOrderByPaymentIntentId(paymentIntentId)` to a new `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts` (or wherever the project's order fetchers live). Uses the existing read client (anonymous, useCdn). GROQ exactly:
  ```
  *[_type == "order" && paymentIntentId == $paymentIntentId][0]{
    _id, items, total, address, orderDate
  }
  ```
  Returns the document or `null`.

#### Human Verification Checklist (<5 min)
- [ ] `lib/stripe.ts` exports `retrievePaymentIntent`; `npx tsc --noEmit` passes.
- [ ] Sanity order schema fields pinned in `tasks-decomposition.md` Task 1.2 — all 6 values filled. Field name is exactly `paymentIntentId` (camelCase).
- [ ] In a scratch script or `app/(test)` route: call `fetchOrderByPaymentIntentId('does-not-exist')` → returns `null` (not a throw).
- [ ] Manually create one test order document in Sanity Studio with a known `paymentIntentId`; call the fetcher → returns the document with all six fields populated.

#### Minimal Tests
- None automated. The two manual fetcher calls above are the entire confidence-building surface.

#### Cover-and-Move
- Verified before next scope: any caller can `retrievePaymentIntent(id)` (and handle its throws) and `fetchOrderByPaymentIntentId(id)` (and handle null). The schema field name will not silently drift later.

---

### Scope Contract 2 — Route Handler `/api/checkout/return` (mutating endpoint, lifecycle table)

**Source tasks:** Task 2.1, Task 2.2, Task 2.3 from `tasks-decomposition.md`. Tests 1, 2, 3, 4 (all rows), 4.5 from `acceptance-tests.md`.

#### UX Slice
- After payment, Stripe's redirect to `/api/checkout/return` no longer 404s — the browser is forwarded to `/checkout/success` with the right query params.
- If Stripe's API is down at redirect time, the user is redirected to `/checkout/success?error=verification_failed` (not a raw 500).

#### Architecture Slice
- Create `app/api/checkout/return/route.ts` with `export async function GET(request: Request)`.
- Read `payment_intent` from `new URL(request.url).searchParams`. Guard: missing → `redirect('/basket?error=missing_intent')`.
- Ignore `payment_intent_client_secret` and `redirect_status` (read them for logs if useful, but never branch on them).
- Wrap retrieve in `try/catch`:
  ```ts
  let pi
  try { pi = await retrievePaymentIntent(payment_intent) }
  catch { redirect(`/checkout/success?payment_intent=${payment_intent}&error=verification_failed`) }
  ```
- Apply the canonical lifecycle (PHASE 2 table) in three steps:
  1. `session.completedPaymentIntentId = pi.id` (ALWAYS, regardless of status).
  2. Switch on `pi.status` — partial-clear `paymentIntentId` and conditionally the upstream funnel fields per the table.
  3. `await session.save()`.
- Redirect to the success page (or `/basket?error=unexpected_status` for unknown statuses) with the appropriate `status` query param.

#### Human Verification Checklist (<5 min)
- [ ] Navigate directly to `/api/checkout/return` (no query) → redirects to `/basket?error=missing_intent`. Browser cookie inspector shows session unchanged.
- [ ] Complete a real payment with card `4242 4242 4242 4242` → URL during redirect shows `/api/checkout/return?payment_intent=pi_xxx&...` then `/checkout/success?payment_intent=pi_xxx`. **Cookie inspector**: `completedPaymentIntentId` set; `basket`, `address`, `shippingCode`, `shippingCost`, `paymentIntentId` ALL CLEARED. (Success page may 404 if Scope 3 not done — expected.)
- [ ] Decline card `4000 0000 0000 0002` → URL ends `/checkout/success?payment_intent=pi_xxx&status=failed`. Cookie inspector: `completedPaymentIntentId` set, `paymentIntentId` cleared, **`basket`/`address`/`shippingCode`/`shippingCost` PRESERVED** (re-verify in `Application` → `Cookies` → decoded session content).
- [ ] Cancel during Stripe flow → URL ends `&status=canceled`. Same cookie shape as the failed path.
- [ ] Temporarily break `STRIPE_SECRET_KEY` in `.env.local` (e.g. append a `_BROKEN` suffix) → redo a payment → URL ends `/checkout/success?...&error=verification_failed`. **No raw 500.** Restore the env var.
- [ ] `grep -n 'session.destroy' app/api/checkout/return/route.ts` → no matches (partial-clear only).

#### Minimal Tests
- None automated. The five manual flows above + the destroy-grep are the entire surface; mocking Stripe statuses would exceed human readability for a tracer.

#### Cover-and-Move
- Verified before next scope: `session.completedPaymentIntentId` reliably equals the URL's `payment_intent` whenever the success page renders. The privacy guard in Scope 3 can rely on this invariant.

---

### Scope Contract 3 — Success page shell, privacy guard, happy-path Suspense + OrderDetails

**Source tasks:** Task 3 (all sub-tasks), Task 4 (4.1, 4.2, 4.3) from `tasks-decomposition.md`. Tests 5, 6, 7, 12, 13 from `acceptance-tests.md`.

#### UX Slice
- Successful payment → user lands on `/checkout/success`, sees the Stripe-derived confirmation (amount + status) instantly, sees a Suspense fallback while order details fetch, then the order details stream in.
- Webhook-lag state (order not yet written): "Payment successful — generating your invoice…" + amount from Stripe + a refresh button that re-runs the server fetch.
- Direct navigation by anyone without the privacy-guard key: redirected to `/basket`.

#### Architecture Slice
- Create `app/checkout/success/page.tsx` — Server Component, NO `'use client'`.
  - Signature: `export default async function SuccessPage({ searchParams }: { searchParams: Promise<SuccessPageSearchParams> })`.
  - Privacy guard FIRST:
    ```ts
    const { payment_intent, status, error } = await searchParams
    if (!payment_intent) redirect('/basket')
    const session = await getCheckoutSession()
    if (session.completedPaymentIntentId !== payment_intent) redirect('/basket')
    ```
  - Verify PI status (try/catch — but DON'T throw on catch; render the verification_failed branch, which is Scope 4):
    ```ts
    let pi
    try { pi = await retrievePaymentIntent(payment_intent) }
    catch { /* Scope 4: render verification_failed branch */ }
    ```
  - **In this scope, only implement the `pi.status === 'succeeded'` branch.** The other branches are placeholders (`return <p>TODO scope 4</p>`).
  - Happy-path render:
    - Stripe-derived header: amount formatted as PLN (grosz / 100, locale `pl-PL`), payment method last4 / Blik / etc.
    - `<Suspense fallback={<p>Fetching order details…</p>}><OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} /></Suspense>`.
- Create `app/checkout/success/OrderDetails.tsx` — async Server Component, NO `'use client'`.
  - Calls `fetchOrderByPaymentIntentId(paymentIntentId)`.
  - Found → render `_id`, items list (productId × qty + line price in PLN), total (grosz → PLN), address (5 fields), `orderDate`, link to `/basket` for next checkout.
  - Null → render "Payment successful — generating your invoice…" + `fallbackTotal` (PLN) + `<RefreshButton />`.
- Create `app/checkout/success/RefreshButton.tsx` — the **only** `'use client'` file in this scope.
  ```tsx
  'use client'
  import { useRouter } from 'next/navigation'
  export function RefreshButton() {
    const router = useRouter()
    return <button onClick={() => router.refresh()}>I've waited — refresh</button>
  }
  ```
- Do NOT add any `await new Promise(r => setTimeout(r, ...))` server-side. Suspense + null-handling is the single lag mechanism.

#### Human Verification Checklist (<5 min)
- [ ] Clear cookies. Visit `/checkout/success?payment_intent=pi_FAKE` → redirected to `/basket`. (Privacy guard, no session.)
- [ ] Seed `succeeded-pi` via `/checkout-seed?scenario=succeeded-pi&secret=...` WITHOUT going through Route Handler → visit `/checkout/success?payment_intent=<the_seeded_id>` → redirected to `/basket`. (Privacy guard — seed sets `paymentIntentId` but NOT `completedPaymentIntentId`; only the Route Handler does.)
- [ ] Complete a real payment → land on `/checkout/success` → page renders instantly with PLN amount; Suspense fallback briefly visible; order details stream in.
- [ ] `grep -rn "use client" app/checkout/success/` → only `RefreshButton.tsx` matches.
- [ ] `grep -rn "setTimeout\|setInterval" app/checkout/success/` → no matches.
- [ ] Stripe Dashboard → Developers → Webhooks → temporarily disable the endpoint → complete a payment → on `/checkout/success`: lag state renders ("generating your invoice…" + amount + refresh button). Re-enable endpoint, click refresh → full order details render without a full page reload (network tab confirms RSC payload, not a full HTML).
- [ ] Press F5 on the successful page → re-renders cleanly; no duplicate Sanity writes (success page never writes); no Stripe state mutation (retrieve is idempotent).

#### Minimal Tests
- None automated. The manual webhook-disable flow above is the load-bearing proof of the Suspense + null-handling contract.

#### Cover-and-Move
- Verified before next scope: privacy guard rejects unauthorized navigation across every test setup; happy-path renders work end-to-end including the webhook-lag refresh. Scope 4 only needs to fill the three remaining `pi.status` branches and the verification-failed branch.

---

### Scope Contract 4 — Failed / Canceled / Processing / Verification-Failed branches

**Source tasks:** Task 3.5 (verification_failed), Task 5 (all sub-tasks 5.1–5.4) from `tasks-decomposition.md`. Tests 8, 9, 10, 11 from `acceptance-tests.md`.

#### UX Slice
- Failed payment (`requires_payment_method`): `role="alert"` "Payment was declined" with the Stripe-provided reason; "Try again" link to `/checkout/payment`; basket survives, so retry is one click.
- Canceled payment: `role="alert"` "Payment was canceled"; same retry path.
- Processing payment: `role="alert"` "Payment is processing"; refresh button (reuses `<RefreshButton />` from Scope 3).
- Verification-failed (Stripe API down at retrieve time): `role="alert"` with the `payment_intent` visible as a support reference; links to `/basket` and a support page.

#### Architecture Slice
- In `app/checkout/success/page.tsx`, replace the three `TODO scope 4` placeholders with real renders. No new files except optional inline error components.
- **Failed branch** (`pi.status === 'requires_payment_method'`):
  ```tsx
  <section role="alert">
    <h1>Payment was declined</h1>
    <p>{pi.last_payment_error?.message ?? 'Payment was declined.'}</p>
    <a href="/checkout/payment">Try again</a>
  </section>
  ```
- **Canceled branch** (`pi.status === 'canceled'`):
  ```tsx
  <section role="alert">
    <h1>Payment was canceled</h1>
    <a href="/checkout/payment">Try again</a>
  </section>
  ```
- **Processing branch** (`pi.status === 'processing'`):
  ```tsx
  <section role="alert">
    <h1>Payment is processing</h1>
    <p>We'll email a confirmation when settled.</p>
    <RefreshButton />
  </section>
  ```
- **Verification-failed branch** (catch on retrieve, OR `searchParams.error === 'verification_failed'`):
  ```tsx
  <section role="alert">
    <h1>We couldn't verify your payment status right now</h1>
    <p>Your card may have been charged. Please contact support with this reference:</p>
    <code>{payment_intent}</code>
    <a href="/basket">Return to basket</a>
    <a href="/support">Contact support</a>
  </section>
  ```
- Do NOT issue any Sanity query in non-`succeeded` branches.

#### Human Verification Checklist (<5 min)
- [ ] Decline card `4000 0000 0000 0002` → land on `/checkout/success?...&status=failed` → failed branch renders with `role="alert"`, Stripe's decline message, and a "Try again" link. Click → land on `/checkout/payment` with basket + address + shipping still intact (no funnel re-entry).
- [ ] Cancel during Stripe redirect flow → canceled branch renders; retry link works; basket preserved.
- [ ] Async-confirmation card (or seed `processing-pi` — add to seed route if absent) → processing branch renders with `<RefreshButton />`.
- [ ] Trigger verification_failed (break `STRIPE_SECRET_KEY`, redo a payment) → verification-failed branch renders. The literal `payment_intent` ID is visible (copy-paste-able). Links to `/basket` and `/support` present. Restore env var.
- [ ] Browser DevTools → Accessibility tree → each error region is announced (`role="alert"`).
- [ ] No Sanity queries in network/server logs for any non-`succeeded` branch.

#### Minimal Tests
- None automated. Accessibility + retry flows are entirely visual + interactive.

#### Cover-and-Move
- This is the last scope. Verified before final check: every PI-status branch has its rendering, the verification-failed safety net catches Stripe outages, and every non-success branch preserves the basket for one-click retry.

---

## PHASE 4: Continuous Verification

After EACH scope contract above:
1. Run the human verification checklist immediately.
2. Run minimal tests (if any). For this sprint: there are none — manual checklists are the load-bearing proof.
3. Confirm out loud: **"Is this the simplest possible way?"** If a branch, abstraction, or layer can be removed without losing the contract, remove it.
4. Only then start the next scope contract.

**No batched verification.** No "implement all four then test." No deferred test split.

---

## PHASE 5: Final Human Check

After Scope Contract 4 passes its checklist:

### End-to-End Walkthrough
1. Clear cookies. Complete a real flow basket → address → shipping → payment with `4242 4242 4242 4242`. Land on `/checkout/success`.
   - [ ] Page loads instantly; PLN amount + Suspense fallback; order details stream in.
   - [ ] Cookie inspector: `completedPaymentIntentId` set; `basket` / `address` / `shippingCode` / `shippingCost` / `paymentIntentId` cleared.
2. Repeat with decline card → failed branch + retry path works; basket preserved.
3. Repeat with cancel mid-flow → canceled branch + retry path works.
4. Repeat with async-confirmation card → processing branch + refresh button.
5. Disable webhook in Stripe Dashboard → repeat success flow → lag state + refresh button works; re-enable webhook + refresh → full order renders without page reload.
6. Break `STRIPE_SECRET_KEY` → repeat → verification_failed branch renders cleanly; PI id visible; restore env.
7. Try to share the success URL: open it in an incognito window → redirected to `/basket`.
8. `npx tsc --noEmit` passes.
9. `npm run build` succeeds.
10. `grep -rn '/checkout/return\b' app/ docs/` → only matches are inside `/api/checkout/return` paths or explicit "does not exist" disambiguations or `docs/checkout/return/` folder references.

### Sprint Done When
- [ ] All four scope contracts pass their human checklists.
- [ ] End-to-end walkthrough above is clean.
- [ ] No automated tests added beyond what the manual checklists need.
- [ ] Payment Test 14 (cross-scope reachability) finally passes: a real successful payment writes a Sanity order with `paymentIntentId` matching Stripe, and the success page displays it.

---

## PHASE 6: Simplicity Guardrails (live during execution)

- **Single mutating endpoint**: only `/api/checkout/return` writes to the session in this sprint. The success page is pure read.
- **Two endpoints, never one**: a single `/checkout/return` page would mix the mutating concern (session lifecycle) with the read concern (display) — that's why we split. Don't be tempted to merge them.
- **Privacy guard is one line**: `if (session.completedPaymentIntentId !== payment_intent) redirect('/basket')`. Anything more elaborate (signed tokens, time-bound nonces) is a separate decision; this tracer ships the simplest correct version.
- **Suspense is the lag mechanism, full stop**: no polling, no setTimeout, no client-side state machines for webhook ordering. If the order document is null, render the placeholder + a refresh button. That's the contract.
- **`'use client'` budget = 1 file**: `RefreshButton.tsx`. If you find yourself adding a second client component, ask whether `router.refresh()` covers the case.
- **Five-minute rule**: if a sub-task takes longer than five minutes to *explain* to a colleague, it's too complex; split or simplify before continuing.

---

## PHASE 7: Execution Protocol (per scope contract)

```
1. Read the scope contract's UX Slice + Architecture Slice.
2. Implement only what's in those two slices. Nothing else.
3. Run the Human Verification Checklist immediately. Stop on first fail.
4. Ask: "Is this the simplest possible way?" Remove anything that did not earn its place.
5. Only then move to the next scope contract.
```

### Delegation
- **Implementation:** `/implement Scope Contract <N> from _project/sprints/return-flow-tracer.md`
- **Verification:** the human checklist for that scope contract (above)
- **Final check:** PHASE 5 walkthrough

---

## PHASE 8: Post-Sprint /learn

Trigger: PHASE 5 walkthrough passes.

Run `/learn` and answer:
- Did the uniform `completedPaymentIntentId` (set on every status) actually pay off in the failed / canceled branches, or did it feel like overkill?
- Did the Route Handler `try/catch` + verification_failed redirect ever fire in real testing? If yes — was the resulting UX truly recoverable?
- Did the Suspense + RefreshButton webhook-lag pattern feel natural, or did testers reach for polling?
- Did partial-clear (vs `session.destroy()`) cause any "stale cookie" surprises on the next checkout cycle?
- Did the cross-scope contract (Sanity field name = `paymentIntentId`, currency = grosz) survive contact with reality, or did naming drift creep in?

---

## Out of Scope (DO NOT touch in this sprint)

- Stripe webhook handler at `app/api/webhooks/stripe/route.ts` — separate scope. Its existence + idempotency (find-or-create by `paymentIntentId`) is a Phase-0 precondition for end-to-end happy path; Scope 1 + Scope 3 webhook-lag flow tolerate its absence.
- Email confirmation / receipt generation — out of scope; the "Payment successful — generating your invoice" copy is a placeholder until the webhook + email service land.
- Order list page / "View my orders" — out of scope; the only link on the success page is back to `/basket`.
- Refund / partial-refund flow — out of scope.
- Migration from flattened address metadata to Stripe `shipping` parameter — tracked tech debt; blocked on address page collecting `name`.

---

## Hard Dependencies (must exist BEFORE Scope 2)

- **Payment sprint completed** (`_project/sprints/payment-page-tracer.md`): `session.paymentIntentId` is set, Stripe redirects to `/api/checkout/return`, `session.completedPaymentIntentId` field is already declared in `CheckoutSession`.
- `lib/stripe.ts` exporting the `stripe` instance with `STRIPE_SECRET_KEY`.
- `getCheckoutSession()` returns a writable, savable `iron-session` instance.
- Stripe Dashboard webhook endpoint registered with `payment_intent.succeeded` (and `STRIPE_WEBHOOK_SECRET` in `.env.local`) — needed before Scope 3 happy-path Test 6 will fully pass. Scope 3 lag-state still works without it; Test 14 (cross-scope, in payment acceptance-tests) does not pass until the webhook handler scope lands.

---

## Source of Truth

When this sprint contradicts itself or another doc, the precedence is:
1. `docs/checkout/return/framed-objective.md` (lifecycle table is authoritative)
2. `docs/checkout/return/tasks-decomposition.md`
3. `docs/checkout/return/acceptance-tests.md`
4. `docs/checkout/payment/framed-objective.md` (the cross-scope contract table at the end of return acceptance-tests must match)
5. This sprint file

Drift in either direction = contract violation. Fix the implementation, never the contract.
