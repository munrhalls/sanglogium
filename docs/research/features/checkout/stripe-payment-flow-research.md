# Research: Stripe PaymentIntent + React Elements — Checkout Flow (Sang-Logium)

> **Retrieval Date:** 2026-04-10
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Medium (Stripe API versioning; Next.js minor releases)
> **Next Review:** 2026-10-01
> **Stack Context:** Next.js 15 App Router, React 18, Server Actions, guest-session guest-JWT checkout

---

## Executive Summary

- Stripe's own docs **conflict internally** on when to create a PaymentIntent: the "accept a payment" canonical guide says *create early* (at checkout start); the "deferred intent" guide says *create late* (at submit). Both are officially supported. Neither is universally superior.
- The proposed flow (create PaymentIntent at address-submit) is **correct and sound**, not just a developer preference — it solves the "incomplete PI pollution" problem and prevents stock reservations from racing ahead of a committed payment.
- React 18 StrictMode + `react-stripe-js` **has known interaction bugs** around `Elements` re-mounting. The canonical fix is well-understood: `loadStripe` outside render (module-scope singleton) + `options` object stabilised with `useMemo` + conditionally rendering `<Elements>` only when `clientSecret` is defined.
- Server Actions + Stripe on Next.js 15 is the **2026 recommended pattern**. Route Handlers are still required for webhook endpoints only.
- The proposed FSM (idle → processing → complete) is minimal, sufficient, and correct for a three-slice multi-page flow.

---

## Research Scope Contract

- **Topic:** Optimal Stripe PaymentIntent + React Elements checkout flow per UX slice (basket → address → payment) on Next.js 15 / React 18
- **First Principles:** (1) Amount must be known server-side before PI creation. (2) PI lifecycle is a state machine that must never fork (one PI per cart session, reuse on retry). (3) React StrictMode mounts effects twice in development — integrations that fire side-effects in render or `useEffect` without cleanup will double-fire.
- **Fundamentals:** PI creation timing, `Elements` provider stability, idempotency key placement, stock reservation atomicity, webhook role
- **Scope Boundary:** OUT — Stripe Radar fraud rules, saved payment methods / Customer objects, subscription billing, mobile SDKs
- **Target Audience:** sang-logium developers implementing guest checkout
- **Decay Risk:** Medium — Stripe API version `2025-09-30.preview` → `2026-03-25.dahlia` in active flux; `automatic_payment_methods` default behaviour changed in recent versions

---

## Phase 1 — First Principles Analysis

### Core Problem Being Solved
A multi-page checkout must create exactly one PaymentIntent per cart session, initialise `PaymentElement` only after a valid `clientSecret` is available, and release reserved stock if the payment never completes.

### Underlying Constraints
1. **Stripe enforces server-side amount authority** — `clientSecret` must come from a server-trusted environment; the client must never compute the charge amount.
2. **`Elements` provider requires a stable `clientSecret` or stable deferred-mode options** — re-instantiating `options` on every render causes the `StripeElements` instance to be recreated, breaking `confirmPayment` with `"elements should have a mounted Payment Element"`.
3. **React 18 StrictMode double-invokes** render functions, `useMemo`, and `useEffect` in dev. Any code that creates a PI inside an effect or render will fire twice in development unless guarded.

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|---|---|---|---|
| **Early PI** (on basket click) | Stripe funnel tracking from step 1; PI exists before form load | Incomplete PIs pollute dashboard; PI created before amount is fully validated | Large analytics need; single-page checkout |
| **Late PI / Deferred** (on address submit or payment submit) | No zombie PIs; clean dashboard; amount known with certainty before PI is created | Slight extra latency at address step; slightly more complex flow | Multi-step checkout, stock-reservation flow (sang-logium's case) |
| **Deferred client-side** (PI created inside `elements.submit` handler) | Fastest "no-PI-until-needed"; works without any page-nav | Cannot attach `Customer` object; `customer_balance` payment method unavailable | Anonymous guest, no saved-method requirement |
| **Deferred server-side** (Server Action creates PI, returns `clientSecret` to client) | Customer object attachable; full server authority; reusable pattern | One extra server round-trip vs client-side deferred | ✅ **Recommended for sang-logium** |

### Failure Modes
1. **Misapplication:** Creating PI inside `useEffect` without a stable ref guard → double PI in StrictMode dev (appears fine in production because StrictMode is dev-only, but confusing noise).
2. **Over-application of idempotency key to PI creation:** Using the same idempotency key for both stock reservation and PI creation is fine, but the key must be scoped to `(sessionId, checkoutAttempt)` — not just `sessionId` — so a user can retry a failed checkout.
3. **Under-application of webhook:** Relying solely on `stripe.confirmPayment()` success return for order fulfilment. Network errors can drop the success response. Webhook `payment_intent.succeeded` must be the authoritative fulfilment trigger.

---

## Phase 2 — Code Fundamentals Verification

### Fundamental: `loadStripe` Singleton Pattern

**Claim (Stripe docs + Vercel KB):** Call `loadStripe` outside of a component's render to avoid recreating the Stripe object on every render.

**Verified:** ✅ Canonical across all official Stripe docs and examples (2022–2026). The module-scope singleton pattern is the universal recommendation.

```typescript
// stripe-promise.ts  (module-scope, imported by payment page)
import { loadStripe } from '@stripe/stripe-js';
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

**Actual Behaviour:** `loadStripe` caches internally; calling it again returns the same instance. However, placing it inside a component body means the reference is recreated on every render, which can cause `Elements` to re-initialise unnecessarily.

**Edge Cases:**
1. Next.js App Router SSR will attempt to evaluate module-scope code server-side. Use `@stripe/stripe-js/pure` import + `loadStripe` lazily if SSR errors are encountered. More commonly, placing the file in a `"use client"` component is sufficient.
2. In development with HMR, the singleton may be recreated on hot reload — this is expected and harmless.

---

### Fundamental: `Elements` Provider Stability

**Claim (GitHub issue #296 + official docs):** If `options` passed to `<Elements>` is a new object reference on every render, `react-stripe-js` recreates the `StripeElements` instance, causing `"elements should have a mounted Payment Element"` on `confirmPayment`.

**Verification:** ✅ Confirmed via GitHub `stripe/react-stripe-js#296` (reported 2022, still relevant 2024). Fix: wrap `options` in `useMemo`.

```tsx
// payment-page.tsx
"use client";
const CheckoutWrapper = ({ clientSecret }: { clientSecret: string }) => {
  const options = useMemo(
    () => ({ clientSecret, appearance: { theme: 'stripe' } }),
    [clientSecret]   // only recreate if clientSecret changes
  );
  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm />
    </Elements>
  );
};
```

**Critical guard:** Only render `<Elements>` when `clientSecret` is defined:
```tsx
{clientSecret ? <CheckoutWrapper clientSecret={clientSecret} /> : <Spinner />}
```
Rendering `Elements` without `clientSecret` (or with `undefined`) causes an `IntegrationError`.

**Edge Cases:**
1. StrictMode double-mount: because `Elements` uses `useEffect` internally to create the `StripeElements` instance, StrictMode will mount/unmount/remount in dev. The current `react-stripe-js` version handles this correctly as long as `options` is stable.
2. Passing `stripe={stripePromise}` (a Promise) vs `stripe={await stripePromise}` (a Stripe instance) — both work, but the Promise form avoids a race condition where `stripe` is `null` on first render.

---

### Fundamental: `elements.submit()` Before PI Creation (Deferred Flow)

**Claim (Stripe docs "collect payment details before creating an Intent"):** In the deferred-intent pattern, call `elements.submit()` first to trigger Stripe-side form validation and wallet (Apple Pay / Google Pay) collection, *then* create the PI, *then* call `stripe.confirmPayment()` with the `clientSecret`.

**Verified:** ✅ This is the exact sequence in the official deferred-intent example (docs.stripe.com/payments/accept-a-payment-deferred).

```typescript
// In payment form submit handler:
const { error: submitError } = await elements.submit();
if (submitError) { setError(submitError.message); return; }

// Only now hit server to create/retrieve PI
const { clientSecret } = await createPaymentIntent(basket, sessionId);

const { error } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: { return_url: `${origin}/order/success` },
  redirect: 'if_required',
});
```

**Edge Cases:**
1. `elements.submit()` failing for digital wallets (Apple Pay) before PI exists is the primary reason this step exists. Do not skip it.
2. `redirect: 'if_required'` is critical for multi-step pages — without it, card payments immediately redirect to `return_url`, bypassing your FSM success handling.

---

### Fundamental: Idempotency Keys

**Claim (Stripe docs):** Use V4 UUIDs or `(sessionId + checkoutAttempt)` as idempotency keys. Keys expire after 24 hours. Stripe saves the result of the first request and replays it on retry.

**Verified:** ✅ Confirmed in `docs.stripe.com/api/idempotent_requests`. Stripe recommends UUIDs.

**Critical nuance:** The idempotency key should be passed in the **Stripe API call options**, not as a metadata field on the PI.

```typescript
const paymentIntent = await stripe.paymentIntents.create(
  { amount, currency: 'pln', automatic_payment_methods: { enabled: true } },
  { idempotencyKey: `checkout_${sessionId}_${attemptId}` }  // ← here
);
```

**Edge Cases:**
1. Using the same key for a *different* set of params (e.g. different amount) causes Stripe to return a 400 error — the idempotency layer validates param consistency.
2. After 24 hours, a key is pruned and a new request is treated as fresh. For long-lived sessions, generate a new attempt-scoped key.

---

## Phase 3 — Critical Bug Registry: `react-stripe-js` + React 18

These are known, documented issues that have burned developers repeatedly:

### Bug B-1: Multiple `StripeElements` instances (GH #296)
- **Trigger:** `options` object is recreated on every render (e.g. inline `options={{ clientSecret }}`)
- **Symptom:** `"Invalid value for stripe.confirmPayment(): elements should have a mounted Payment Element"`
- **Fix:** `useMemo` on `options`, or render `<Elements>` only once with a stable parent

### Bug B-2: StrictMode double-effect (`useEffect` creating PI twice)
- **Trigger:** PI creation inside `useEffect` without abort/cleanup
- **Symptom (dev only):** Two incomplete PIs created per page load
- **Fix:** Either create PI in the Server Action called from event handler (not `useEffect`), or add an abort signal / ref guard:
```typescript
useEffect(() => {
  let cancelled = false;
  fetchClientSecret().then(cs => { if (!cancelled) setClientSecret(cs); });
  return () => { cancelled = true; };
}, []);
```

### Bug B-3: `clientSecret` undefined at `Elements` mount
- **Trigger:** Rendering `<Elements options={{ clientSecret: undefined }}>` while PI is loading
- **Symptom:** `IntegrationError: In order to create a payment element, you must pass a valid PaymentIntent client secret`
- **Fix:** Conditional render — gate `<Elements>` behind `clientSecret &&`

### Bug B-4: `loadStripe` inside component body
- **Trigger:** `const stripe = loadStripe(key)` inside a functional component
- **Symptom:** New `Stripe` object on every render; `Elements` remounts; wallet collection reset
- **Fix:** Module-scope singleton (`stripe-promise.ts` file pattern)

### Bug B-5: Using `automatic_payment_methods` with client-side deferred intent + Customer
- **Trigger:** Creating PI on client side with a `Customer` ID
- **Symptom:** Stripe API returns error — client-side deferred flow cannot include a Customer object
- **Fix:** Create PI server-side when a Customer must be attached (sang-logium's guest model doesn't need Customer objects, so this is lower risk — but relevant if adding saved-payment features later)

---

## Phase 4 — Best Practices (Verified)

### Practice: Server Actions for PI creation
**Consensus:** High (2026 community + Vercel KB + DEV community guides)
**Supporting Evidence:**
- Vercel Knowledge Base (Nov 2025): recommends Server Actions over API routes for PI creation in Next.js 15
- DEV Community "Ultimate Guide to Stripe + Next.js (2026 Edition)" (Feb 2026): "Server Actions are the standard for creating Checkout Sessions... This eliminates the need for /api/checkout folders"
**Counter-Evidence:** Route Handlers must still be used for webhooks (Stripe needs a static public URL to POST to; Server Actions don't expose one)
**Verdict:** ✅ Recommended for PI creation; ❌ not applicable for webhooks

### Practice: Late PaymentIntent creation (at address/payment submit, not basket click)
**Consensus:** High for multi-step flows
**Supporting Evidence:**
- Stripe "collect payment details before creating an Intent" (deferred intent) guide — GA, not beta as of 2025
- Community consensus: avoids "Incomplete" PI pollution, reduces wasted Stripe API calls from bounce-rate users
**Counter-Evidence:** Stripe's own "payment intents lifecycle" guide recommends creating PI "as soon as you know the amount... to help track your purchase funnel". This is valid for analytics-heavy single-page flows.
**Verdict:** ✅ Recommended for sang-logium's multi-step flow where amount is only finalised after address validation

### Practice: Webhook as authoritative fulfilment trigger
**Consensus:** High (universal Stripe documentation)
**Supporting Evidence:**
- All Stripe payment guides: "listen for `payment_intent.succeeded` to fulfil the order"
- `payment_intent.payment_failed` for stock release
**Counter-Evidence:** None — this is non-negotiable for production reliability
**Verdict:** ✅ Required. Client-side `confirmPayment` success must only update UI state, never write orders to DB.

### Practice: `redirect: 'if_required'` in `confirmPayment`
**Consensus:** High for custom multi-page checkout UIs
**Supporting Evidence:** Stripe docs: "If you want to keep the same checkout flow for card payments and only redirect for redirect-based payment methods, set redirect to if_required"
**Counter-Evidence:** Omitting it causes card payments to immediately redirect, which breaks FSM navigation
**Verdict:** ✅ Required for sang-logium's client-side navigation model

---

## Phase 5 — Falsification of the Proposed Flow

### Claim: "Atomic stock reservation + PaymentIntent creation in single operation at address submit" (Step 8)
**Falsification attempt:** Stripe PI creation is a network call (~200–500ms). A Lua script in Redis and a Stripe API call cannot truly be "atomic" — they are two separate I/O operations. If the Redis reservation succeeds but the Stripe call fails, you have reserved stock with no PI. If the Stripe call succeeds but the Redis write fails, you have a PI with no reservation record.

**Verdict:** ⚠️ Modified. True atomicity across Redis and Stripe is impossible. The correct approach is:
1. Reserve stock in Redis **first** (fast, local)
2. Then create PI in Stripe
3. If Stripe creation fails: **immediately release** Redis reservation
4. Wrap in try/catch with compensation logic

The flow comment "ATOMIC" is aspirational shorthand, not technically accurate. The code must implement explicit compensation.

### Claim: "Generate FRESH idempotency key (UUIDv4) on basket click" (Step 2)
**Falsification attempt:** Stripe's idempotency keys work at the **Stripe API call level**, not at the application session level. Generating a key at basket click but using it at address submit (step 6) is fine — but the key must be passed to the Stripe PI creation call specifically, not just stored in FSM context for general use.

**Verdict:** ✅ Survived with clarification: the key must be forwarded to `stripe.paymentIntents.create({ ... }, { idempotencyKey })` in the Server Action.

### Claim: "FSM states: idle / processing / complete" is sufficient
**Falsification attempt:** What about `error` state? `processing` conflates both "waiting for server" and "waiting for Stripe confirmation". If `confirmPayment` fails, the FSM should return to `idle` with an error message, but `processing` doesn't distinguish between the server and Stripe legs.

**Verdict:** ⚠️ Modified. Add an `error` sub-state or an `errorMessage` field alongside the three states. The three-state FSM is fine as long as error state is represented as `{ status: 'idle', error: string | null }` pattern.

---

## Phase 6 — Synthesis: Optimal Flow Per UX Slice

### Key Decisions

| Decision | Rationale | Implementation |
|---|---|---|
| Create PI at **address submit** (not basket click) | Amount known with certainty after address validation; avoids zombie PIs | Server Action called from address form handler |
| Use **server-side deferred intent** (not client-side) | Guest session needs potential Customer attachment later; server authority on amount | `'use server'` action returns `clientSecret` |
| `loadStripe` as module-scope singleton | Prevents re-instantiation bugs | `/lib/stripe-promise.ts` |
| Wrap `options` in `useMemo` | Prevents StripeElements remount bug B-1 | `useMemo(() => ({ clientSecret }), [clientSecret])` |
| Gate `<Elements>` on `clientSecret` truthy | Prevents IntegrationError bug B-3 | Conditional render |
| `redirect: 'if_required'` | Keeps card payments in-app for FSM control | `stripe.confirmPayment({ ..., redirect: 'if_required' })` |
| `elements.submit()` before PI retrieval | Required for wallet collection; Stripe-recommended order | In payment submit handler, before `confirmPayment` |
| Webhook as fulfilment authority | Resilience against dropped success responses | Route Handler at `/api/webhooks/stripe` |
| Redis reservation before Stripe PI, with compensation on Stripe failure | Closest to atomic; prevents overselling | try/catch releasing reservation if PI creation throws |

---

## Optimal Flow: Per UX Slice

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLICE 1: BASKET PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. User clicks "Checkout"
   ↓
2. Client-side only (no server call):
   - Generate idempotencyKey = crypto.randomUUID()
   - Ensure guestJwt exists (create if missing, store in httpOnly cookie)
   - Validate basket locally:
       * All items have productId, quantity > 0, price
       * No quantity > some sane max (e.g. 99)
   - Disable checkout button, show loading state
   - Store idempotencyKey in FSM context
   ↓
3. Client: Navigate to /checkout/address
   - Pass idempotencyKey via router state or cookie
   - FSM: status → 'idle'

NOTE: NO server call, NO PaymentIntent, NO stock reservation at this stage.
The basket page only gates obviously invalid states.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLICE 2: ADDRESS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. User fills address form and submits
   ↓
5. Client: FSM status → 'processing', disable submit button
   ↓
6. Client calls Server Action: submitAddressAndReserve({
     idempotencyKey,        // from FSM context
     guestJwt,              // from cookie
     sessionId,             // from cookie
     addressData,           // validated client-side first
     basketItems            // from client state
   })
   ↓
7. Server: Check idempotency cache (Redis)
   CACHE HIT (same key) → Return cached { clientSecret, reservationId, expiresAt }
   Skip to step 13.

   CACHE MISS → Continue to step 8.
   ↓
8. Server: Validate basket prices (parallel):
   - Fetch current prices from Sanity for each productId
   - Compare against client-submitted prices
   - If mismatch: return { error: 'PRICE_MISMATCH', updatedPrices }
   ↓
9. Server: Reserve stock in Redis (Lua script for atomicity within Redis):
   - CHECK each item's available stock
   - If any item insufficient: return { error: 'OUT_OF_STOCK', itemId }
   - DECREMENT stock for all items
   - SET reservation TTL = 15 minutes
   - Record reservationId = `reserve_${sessionId}_${Date.now()}`
   ↓
10. Server: Create Stripe PaymentIntent:
    try {
      const pi = await stripe.paymentIntents.create(
        {
          amount: calculateAmountInGrosze(validatedBasket),
          currency: 'pln',
          automatic_payment_methods: { enabled: true },
          metadata: { reservationId, sessionId },
        },
        { idempotencyKey: `pi_${idempotencyKey}` }   // scoped to PI creation
      );
    } catch (stripeError) {
      // COMPENSATION: release Redis reservation immediately
      await releaseReservation(reservationId);
      return { error: 'PAYMENT_SETUP_FAILED' };
    }
   ↓
11. Server: Store in guest session (Redis/cookie):
    { paymentIntentId, clientSecret, reservationId, expiresAt: now + 15min }
   ↓
12. Server: Cache result keyed by idempotencyKey (TTL 30 min):
    { clientSecret, reservationId, expiresAt }
   ↓
13. Server returns to client:
    { clientSecret, reservationId, expiresAt }
   ↓
14. Client: Store { clientSecret, reservationId, expiresAt } in FSM context
    FSM status → 'idle'
    Navigate to /checkout/payment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLICE 3: PAYMENT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

15. Payment page mounts
    ↓
16. Client: Check expiresAt from FSM context
    - If expired (or missing): redirect back to basket with error toast
    - Show countdown timer to user (optional UX improvement)
    ↓
17. Client: Initialise Stripe
    // stripe-promise.ts (module scope — NOT inside component)
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

    // PaymentPage component:
    const options = useMemo(
      () => ({ clientSecret, appearance: { theme: 'stripe' } }),
      [clientSecret]   // stable reference — prevents StripeElements remount
    );

    // Only render <Elements> once clientSecret is available:
    {clientSecret
      ? <Elements stripe={stripePromise} options={options}><PaymentForm /></Elements>
      : <Spinner />
    }
    ↓
18. User submits payment form
    ↓
19. Client: FSM status → 'processing', disable submit button
    ↓
20. Client: Validate Stripe form + collect wallets:
    const { error: submitError } = await elements.submit();
    if (submitError) { FSM status → 'idle' with error; return; }
    ↓
21. Client: Confirm payment:
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,                          // from FSM context
      confirmParams: {
        return_url: `${origin}/checkout/success`,
      },
      redirect: 'if_required',              // keep card payments in-app
    });
    ↓
22. Client response handling:
    ERROR (immediate) → FSM status: 'idle', errorMessage: error.message
    SUCCESS (paymentIntent.status === 'succeeded' or 'processing') → FSM status: 'complete'
      → Navigate to /checkout/success
    REDIRECT (3D Secure etc.) → Stripe handles automatically; user lands on return_url

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBHOOK HANDLERS (Route Handler: /api/webhooks/stripe)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALWAYS verify Stripe-Signature header before processing.
Process idempotently (check if event.id already processed).

payment_intent.succeeded
  → Commit reservation (mark as permanent in DB)
  → Create order record
  → Send confirmation email
  → Release idempotency cache entry (optional — keeps it for replay safety)

payment_intent.payment_failed
  → Release Redis stock reservation
  → Update guest session: clear paymentIntentId

payment_intent.canceled
  → Release Redis stock reservation

(Reservation TTL = 15 min auto-releases via Redis TTL as safety net)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FSM STATE SHAPE (recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type CheckoutState = {
  status: 'idle' | 'processing' | 'complete';
  errorMessage: string | null;            // null when no error
  idempotencyKey: string | null;
  clientSecret: string | null;
  reservationId: string | null;
  expiresAt: number | null;               // Unix timestamp ms
};

// status: 'idle' covers both "ready" and "error" states
// Check errorMessage !== null to display error UI
// This avoids a 4th 'error' state while still representing errors cleanly
```

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|---|---|---|
| `loadStripe` must be module-scope | Stripe docs + Vercel KB | Official documentation |
| `options` must be stable (useMemo) | GH stripe/react-stripe-js#296 | GitHub issue + community workaround |
| `elements.submit()` before PI creation in deferred flow | docs.stripe.com/payments/accept-a-payment-deferred | Official documentation |
| Server Actions replace API routes for PI creation (Next.js 15) | DEV Community 2026, Vercel KB | Community guide + official KB |
| Route Handlers still needed for webhooks | DEV Community 2026 | Community confirmation |
| Idempotency keys on POST to Stripe API | docs.stripe.com/api/idempotent_requests | Official documentation |
| Webhook as authoritative fulfilment trigger | All Stripe payment guides | Official documentation |
| `redirect: 'if_required'` for in-app card handling | Stripe migration guide | Official documentation |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|---|---|---|
| "Atomic" Redis + Stripe operation | Two separate I/O calls cannot be truly atomic across systems | ⚠️ Modified: use compensation pattern (release reservation if PI fails) |
| FSM with 3 states is complete | `error` is a distinct user-facing state | ⚠️ Modified: keep 3 status values but add `errorMessage` field |
| Late PI creation is always better | Stripe docs recommend early creation for funnel analytics | ✅ Survived: late creation is correct for sang-logium's multi-step flow |

### Knowledge Decay Assessment

| Section | Risk | Review Date | Reason |
|---|---|---|---|
| Server Actions for PI creation | Low | 2027-01 | Stable Next.js App Router feature |
| `automatic_payment_methods` default behaviour | Medium | 2026-10 | Stripe API versioning (changed defaults recently) |
| `react-stripe-js` useMemo/StrictMode bugs | Low | 2027-01 | Fixed in maintained lib; monitor changelog |
| Stripe API version strings | High | 2026-07 | Stripe releases new API versions frequently |

---

## Open Questions (Research Gaps)

1. **Redis TTL vs explicit release race:** If the webhook `payment_intent.payment_failed` fires *after* the Redis TTL already released the reservation, the webhook handler will attempt to release an already-gone reservation. Need to confirm idempotent release handling.
2. **Guest session cookie security model:** The research did not verify httpOnly/Secure/SameSite attributes for the guest cookie pattern. Needs separate security review.
3. **PLN (Polish Złoty) decimal handling:** Stripe amounts are in the smallest currency unit. PLN uses grosze (1 PLN = 100 grosze). Confirm no zero-decimal edge cases — PLN is NOT a zero-decimal currency (confirmed: PLN uses 2 decimal places like USD/EUR).
4. **`paymentIntent.status === 'processing'` on `confirmPayment` return:** For asynchronous payment methods (BLIK, bank transfers), `confirmPayment` may return `processing` rather than `succeeded`. The success navigation must handle both `succeeded` and `processing` as "proceed to success page" states, with the webhook as the definitive confirmation.

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|---|---|---|
| First Principles (PI lifecycle, StrictMode behaviour) | High | React docs + Stripe lifecycle docs |
| Known Bugs (B-1 through B-5) | High | GitHub issues + community reproduction |
| Best Practices (Server Actions, late PI, webhook) | High | Official 2025–2026 docs + community guides |
| Compensation pattern for Redis + Stripe | Medium | Engineering principle; no specific Stripe doc |
| FSM state shape recommendation | Medium | Design judgment; not from a specific source |
