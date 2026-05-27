# Stripe Payment Intent Session Security Patterns in Next.js 15

> **Research Date:** May 26, 2026
> **Decay Risk:** Medium — Stripe API evolves quarterly; Next.js App Router patterns are stabilizing
> **Scope:** Secure checkout session management using Stripe Payment Intents + iron-session in Next.js 15 App Router
> **Out of scope:** Stripe Checkout Sessions API, subscription billing, non-PLN currencies

---

## Research Scope Contract

- **Topic:** Secure handling of Stripe Payment Intents within encrypted iron-session cookies in Next.js 15 Server Components / Server Actions, with authoritative verification of payment status and webhook-driven fulfillment.
- **First Principles:**
  1. The server is the only trusted authority — client-side state is always suspect
  2. Payment status must be verified independently, never assumed from URL parameters
  3. Session cookies must be encrypted, httpOnly, and time-bounded
- **Fundamentals:** iron-session seal mechanics, Stripe PI lifecycle, webhook signature verification, idempotency keys, Next.js 15 Server Component cookie constraints
- **Scope Boundary:** Does NOT cover Stripe Checkout Sessions (hosted), subscription webhooks, or third-party payment providers
- **Target Audience:** Developers implementing `/checkout/payment` and `/api/checkout/return` in the Sang Logium codebase
- **Decay Risk:** Medium — Stripe API versions change; iron-session v8 is current

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Stripe Docs — Payment Intents API | docs.stripe.com/payments/payment-intents | Official | Canonical | 2026-05 | "Store PI ID on cart/session to reuse; use idempotency keys" | ✅ Verified |
| Stripe Docs — Idempotent Requests | docs.stripe.com/api/idempotent_requests | Official | Canonical | 2026-05 | "Idempotency keys prevent duplicate operations; use V4 UUIDs" | ✅ Verified |
| Stripe Docs — Payment Status Updates | docs.stripe.com/payments/payment-intents/verifying-status | Official | Canonical | 2026-05 | "Don't handle fulfillment client-side; use webhooks" | ✅ Verified |
| Stripe Docs — Handle Payment Events | docs.stripe.com/webhooks/handling-payment-events | Official | Canonical | 2026-05 | "Webhook endpoints must verify Stripe signature" | ✅ Verified |
| Stripe — Secure Checkout Guide | stripe.com/resources/more/how-to-create-a-secure-checkout-for-your-business | Official | Canonical | 2026-05 | "Tokenization is mandatory; never touch raw card data" | ✅ Verified |
| iron-session GitHub | github.com/vvo/iron-session | Source of Truth | Canonical | 2026-05 | "Encrypted and signed seals; NOT JWT" | ✅ Verified |
| Next.js Auth Guide | nextjs.org/docs/app/guides/authentication | Official | Canonical | 2026-05 | "Recommend iron-session or Jose; Server Actions for cookie writes" | ✅ Verified |
| DEV Community — Notrab | dev.to/notrab/working-with-stripe-payment-intents-and-next-js-106h | Community | Medium | 2024-XX | "Store paymentIntentId in cookie, reuse on refresh" | ⚠️ Outdated (Pages Router) |
| Digital Applied — Stripe Guide 2026 | digitalapplied.com/blog/stripe-payment-integration-developer-guide-2026 | Blog | Medium | 2026-05 | "Pin to specific API version; 3+ month advance notice on breaking changes" | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
E-commerce checkout requires maintaining payment intent state across a multi-step funnel (basket → address → shipping → payment) while preventing tampering, double-charging, and orphaned payments when users navigate away mid-flow.

### Underlying Constraints
1. **HTTP is stateless** — each request must carry or reconstruct session context
2. **Client-side JavaScript is untrusted** — any data in the browser can be inspected or modified
3. **Payment networks are asynchronous** — bank authorization, 3D Secure, and webhooks happen outside the request/response cycle
4. **Next.js 15 Server Components cannot write cookies** — cookie mutations must happen in Server Actions or Route Handlers
5. **iron-session has no server-side invalidation** — sessions are stateless; revocation requires application-level checks

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **iron-session (encrypted cookie)** | Zero infrastructure; encrypted; works at Edge | 4KB limit; no instant revocation; cookie overhead | Solo/small teams; checkout flows under 4KB |
| **Database session (Redis/Postgres)** | Instant revocation; larger payloads; audit trail | Infrastructure dependency; latency; complexity | Multi-device sessions; admin dashboards |
| **JWT (stateless token)** | Standard; cross-service; widely supported | NOT encrypted by default (payload visible); larger size | Service-to-service auth; NOT for sensitive checkout data |
| **Stripe Checkout Sessions** | Hosted; PCI scope minimal; fastest integration | Less control; redirects away from site; branding limits | MVP launches; low customization needs |
| **Payment Intents + Elements** | Full UI control; native to site; supports BLIK | More implementation; PCI responsibility (though Elements reduce it) | Custom checkout; PLN market; Apple Pay/Google Pay |

### Failure Modes
1. **Misapplication:** Using JWT instead of iron-session for checkout — JWT payload is readable by anyone who inspects the cookie; paymentIntentId and address are exposed
2. **Over-application:** Storing entire product catalog in session — exceeds 4KB cookie limit, causes truncated/invalid seals
3. **Under-application:** Trusting client-side payment status from `return_url` query params — a user could forge `?payment_intent=pi_xxx` and view another user's success page without the privacy guard

---

## Code Fundamentals

### Fundamental: iron-session Encryption vs JWT

**Claim:** "iron-session encrypts and signs data; JWT only signs"

**Verification:**
- ✅ Located in our codebase: `lib/session.ts`
- ✅ Source inspected: github.com/vvo/iron-session FAQ section
- ✅ Stripe docs confirm: metadata should not contain PII; iron-session encryption prevents cookie inspection

**Actual Behavior:**
- iron-session uses `@hapi/iron` to create **encrypted and signed** seals. The cookie payload is opaque — even if someone captures the cookie, they cannot read or modify it without the `password`.
- JWT tokens are **signed but NOT encrypted** by default. The payload is Base64-encoded and readable by anyone. JWE (JWT with encryption) is required to match iron-session's security properties.

**Edge Cases:**
1. **Weak password:** `fallback-secret-change-in-production` in `lib/session.ts:27` is a critical vulnerability — must be removed before any production deployment
2. **Cookie size:** iron-session seal overhead adds ~30-40% to payload size. With `basket[]`, `address`, metadata, and PI IDs, stay well under 4KB
3. **TTL:** `maxAge: 60 * 60` (1 hour) is reasonable for checkout — prevents long-lived stale sessions

### Fundamental: Next.js 15 Server Component Cookie Constraints

**Claim:** "Server Components cannot write cookies; Server Actions and Route Handlers can"

**Verification:**
- ✅ Located in our codebase: `docs/checkout/payment/framed-objective.md:62` notes this constraint
- ✅ Official docs: nextjs.org/docs/app/guides/authentication confirms cookie writes must happen server-side via `cookies()` API in Server Actions/Route Handlers
- ✅ Code pattern in our tasks-decomposition: PI create/update + session.save() handled in `initPaymentAction` Server Action

**Actual Behavior:**
- `getIronSession(cookies(), ...)` in a Server Component **reads** the session.
- To **write** `session.paymentIntentId`, you must call `await session.save()` inside a Server Action or Route Handler.
- `app/checkout/payment/page.tsx` (Server Component) → calls Server Action → Server Action writes cookie → page re-renders with updated session.

**Edge Cases:**
1. **Stale session on first render:** After Server Action saves the cookie, the Server Component doesn't automatically re-run with the new cookie in the same request. The user sees the result on next navigation/render.
2. **Concurrent writes:** Two tabs both calling payment Server Actions can race on cookie updates. iron-session is atomic per-request, but cross-request races are possible.

### Fundamental: PaymentIntent Reuse and Idempotency

**Claim:** "Reuse PaymentIntents for the same cart/session; use idempotency keys to prevent duplicates"

**Verification:**
- ✅ Stripe docs: "If the checkout process is interrupted and resumes later, attempt to reuse the same PaymentIntent"
- ✅ Stripe docs: "Remember to provide an idempotency key to prevent the creation of duplicate PaymentIntents"
- ✅ Our codebase: `docs/checkout/payment/framed-objective.md:22-26` implements reuse via `session.paymentIntentId` with update/create fallback

**Actual Behavior:**
- `stripe.paymentIntents.update(piId, { amount, metadata })` refreshes an existing PI with new cart totals.
- If `update()` throws (e.g., PI in terminal state like `canceled` or `succeeded`), fall through to `create()`.
- **Idempotency key** must be provided on `create()` to prevent duplicate PIs if the request retries due to network failure.

**Our Current Gap:**
- `lib/stripe.ts` and `docs/checkout/payment/tasks-decomposition.md` do NOT mention idempotency keys. This is a production bug risk — network timeouts during `create()` could result in multiple PaymentIntents for the same checkout.

**Implementation:**
```typescript
const idempotencyKey = `checkout-${session.checkoutSessionId}-${Date.now()}`
await stripe.paymentIntents.create({
  amount: grandTotal,
  currency: 'pln',
  automatic_payment_methods: { enabled: true },
  metadata: flattenedMetadata
}, { idempotencyKey })
```

### Fundamental: Webhook-Driven Fulfillment (NOT Return URL)

**Claim:** "Authoritative order creation must happen in a webhook, not in the return flow"

**Verification:**
- ✅ Stripe docs: "Don't attempt to handle order fulfillment on the client side because customers can leave the page after payment is complete"
- ✅ Stripe docs: "Polling is much less reliable and might cause rate limiting issues"
- ✅ Our codebase: `docs/checkout/payment/framed-objective.md:67` explicitly states "order persistence is webhook-driven, NOT return-flow-driven"

**Actual Behavior:**
- `/api/checkout/return` (Route Handler) verifies PI status and redirects — it does NOT create the order.
- Stripe's `payment_intent.succeeded` webhook → `app/api/webhooks/stripe/route.ts` → idempotent find-or-create order in Sanity.
- The webhook may fire **before, during, or after** the user reaches `/checkout/success`.

**Critical Security Pattern — Webhook Signature Verification:**
```typescript
const payload = await req.text()
const sig = req.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)
// NEVER trust the body without signature verification — anyone can POST to your webhook endpoint
```

**Edge Cases:**
1. **Webhook delivery failure:** Stripe retries with exponential backoff. Your handler MUST be idempotent (find-or-create by `paymentIntentId`).
2. **Webhook arrives before redirect:** User hits `/checkout/success` before webhook writes the order. Success page must show "processing" placeholder, then poll or refresh.
3. **Webhook arrives after redirect:** Order already exists when webhook fires. Idempotent handler must detect existing order and skip creation/stock-decrement.

### Fundamental: Return URL Privacy Guard

**Claim:** "Anyone with a leaked PI id can forge access to a success page without a privacy guard"

**Verification:**
- ✅ Our codebase: `docs/checkout/payment/framed-objective.md:83-96` implements `completedPaymentIntentId` session check
- ✅ Stripe docs confirm `payment_intent` query param is passed to `return_url` — this is public knowledge from URL history/referer

**Actual Behavior:**
- After Stripe redirects to `/checkout/success?payment_intent=pi_xxx`, a malicious user could share or leak that URL.
- Without `completedPaymentIntentId` check in session, anyone visiting that URL sees the order details.
- The Route Handler at `/api/checkout/return` sets `session.completedPaymentIntentId = pi.id` BEFORE redirecting. The success page checks `searchParams.payment_intent === session.completedPaymentIntentId`.

**Edge Cases:**
1. **Session expired before redirect:** If cookie expires between Stripe redirect and success page load, the privacy guard fails and user sees an error. This is acceptable — better than leaking data.
2. **Shared device:** Two users on same browser, second user visits leaked URL but has different session — guard correctly blocks.

---

## Best Practices (Verified)

### Practice: Use PaymentElement with Billing Address Suppressed

**Consensus:** High — Stripe docs + our implementation both recommend this

**Supporting Evidence:**
- Stripe docs: `fields: { billingDetails: { address: 'never' } }` prevents duplicate address entry
- Our codebase: `docs/checkout/payment/framed-objective.md:74` implements exactly this

**Counter-Evidence (Falsification Attempts):**
- If address is NOT passed in `confirmParams.payment_method_data.billing_details`, the PaymentMethod will have no address. This breaks Radar fraud scoring.
- **Mitigation:** Our code passes canonical `session.address` via `confirmParams` — verified in `docs/checkout/payment/framed-objective.md:77`

**Verdict:** ✅ Recommended

**When to Use:** When you already have a verified address from a prior checkout step
**When to Skip:** When you want Stripe to collect and validate the address (e.g., for AVS checks on cards)

### Practice: Flatten Address into Metadata (Current) vs Stripe `shipping` Parameter (Target)

**Consensus:** Medium — our docs acknowledge this as technical debt

**Supporting Evidence:**
- Stripe docs: `shipping: { name, address: { line1, postal_code, city, state, country } }` is the correct first-class parameter
- Radar fraud signals use structured shipping address
- Our codebase: `docs/checkout/payment/framed-objective.md:61` documents this debt

**Counter-Evidence:**
- Metadata flattening works functionally — Dashboard shows metadata, order reconciliation is possible
- Migration requires upstream address page to collect `firstName` + `lastName` as a combined `name` field

**Verdict:** ⚠️ Context-Dependent — acceptable for tracer, must migrate before production

**Implementation path:**
1. Address page collects `firstName`, `lastName` (already does)
2. Payment page constructs `shipping.name = `${firstName} ${lastName}``
3. Payment page passes `shipping.address.line1 = `${street} ${streetNumber}``
4. Metadata keeps app-specific keys only: `basketHash`, `checkoutSessionId`, `email`

### Practice: Verify Sanity Prices Server-Side Before PI Creation

**Consensus:** High — our implementation + Stripe security principles

**Supporting Evidence:**
- Our codebase: `docs/checkout/payment/framed-objective.md:52-55` implements data integrity + price validity guards
- Stripe docs: amount must be a positive integer; invalid amounts fail with opaque errors

**Counter-Evidence:**
- Some implementations trust client-provided totals. This is faster but insecure — client could send `amount: 1` for a 1000 PLN cart.

**Verdict:** ✅ Recommended — our implementation is correct

**Key guards:**
1. `sanityProducts.length !== session.basket.length` → prevents silent under-charging from unknown productIds
2. `!Number.isFinite(product.price_data?.unit_amount)` → prevents NaN from corrupting the total
3. `grandTotal < 1` → prevents zero/negative amounts reaching Stripe

### Practice: Funnel Guards Ordered Before External Calls

**Consensus:** High — our implementation follows this precisely

**Supporting Evidence:**
- Our codebase: `docs/checkout/payment/framed-objective.md:46-49` specifies exact guard order
- Performance: invalid quantity guard prevents unnecessary Sanity API call

**Verdict:** ✅ Recommended — our implementation is correct

---

## Common Solutions Landscape

### Solution: Store PaymentIntent ID in React Context / LocalStorage

**Prevalence:** Common in tutorials (DEV Community, YouTube)
**Type:** Anti-pattern for e-commerce

**Pros:**
- Simple to implement
- Survives page refreshes

**Cons:**
- LocalStorage is readable by any JavaScript (XSS vulnerability)
- React Context is lost on hard refresh
- No server-side validation
- Multiple tabs create multiple PIs

**Real-World Pain Points:**
- User opens checkout in two tabs → two PaymentIntents created → abandoned PI pollutes Stripe Dashboard
- XSS payload reads `localStorage.getItem('paymentIntentId')` and cancels/refunds the payment

**Recommendation:** ❌ Avoid — use iron-session cookie instead

### Solution: Create New PaymentIntent on Every Page Load

**Prevalence:** Ubiquitous in beginner tutorials
**Type:** Anti-pattern

**Pros:**
- Simpler code — no update/retrieve logic

**Cons:**
- Abandoned PIs accumulate in Stripe Dashboard
- Loses payment attempt history (e.g., failed card → retry with new PI)
- Wastes Stripe API quota

**Real-World Pain Points:**
- Stripe Dashboard becomes cluttered with hundreds of `incomplete` PIs
- Customer support cannot trace retry history for a single cart

**Recommendation:** ❌ Avoid — reuse PIs per session as our implementation does

### Solution: Trust `payment_intent` Query Param for Success Page Access

**Prevalence:** Common in basic integrations
**Type:** Anti-pattern

**Pros:**
- Simple — just render the PI details from the URL

**Cons:**
- URL parameters are forgeable and shareable
- Leaked success URL reveals order details to anyone
- No session binding = no user verification

**Real-World Pain Points:**
- Customer shares success page screenshot → URL in browser bar is visible → anyone can view their order
- Referer header leaks PI id to third-party analytics

**Recommendation:** ❌ Avoid — implement `completedPaymentIntentId` privacy guard as our docs specify

### Solution: Use Server Actions for PI Create + Session Save

**Prevalence:** Emerging in Next.js 15 community
**Type:** Idiomatic

**Pros:**
- Respects Next.js 15 Server Component cookie constraints
- CSRF protection built into Server Actions
- Secret key never reaches client

**Cons:**
- Requires understanding of Server Action invocation from Server Component
- Extra round-trip: Server Component → Server Action → re-render

**Real-World Pain Points:**
- Confusion about why `session.save()` throws in a Server Component
- Race conditions if user rapidly refreshes payment page

**Recommendation:** ✅ Recommended — our `initPaymentAction` approach is correct

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| iron-session encrypts + signs data | github.com/vvo/iron-session FAQ | Source inspection |
| JWT is NOT encrypted by default | github.com/vvo/iron-session FAQ; JWT.io spec | Source inspection |
| Server Components cannot write cookies in Next.js 15 | nextjs.org/docs/app/guides/authentication | Official docs |
| PaymentIntent should be reused for same cart | docs.stripe.com/payments/payment-intents | Official docs |
| Idempotency keys prevent duplicate PIs | docs.stripe.com/api/idempotent_requests | Official docs |
| Webhooks are authoritative for fulfillment | docs.stripe.com/payments/payment-intents/verifying-status | Official docs |
| Webhook signature verification is mandatory | docs.stripe.com/webhooks/handling-payment-events | Official docs |
| PaymentElement billing address suppression is supported | docs.stripe.com/payments/build-a-two-step-confirmation | Official docs |
| Metadata should not contain sensitive PII | docs.stripe.com/payments/payment-intents (metadata section) | Official docs |
| `fallback-secret-change-in-production` is a vulnerability | iron-session docs: password must be strong, unique, and secret | Logical deduction from source |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Client-side payment status check is sufficient" | Stripe docs explicitly warn against this; users leave before fulfillment initiates | ❌ Abandoned |
| "Return URL query params can be trusted" | `payment_intent` is passed in URL — public, forgeable, shareable | ❌ Abandoned |
| "JWT is fine for checkout sessions" | JWT payload is readable; iron-session is encrypted | ❌ Abandoned |
| " iron-session fallback secret is acceptable for development" | Even in dev, it trains muscle memory and may accidentally deploy; seal is only as strong as password | ⚠️ Modified — must be fixed immediately |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Stripe API version (`2025-10-29.clover`) | Medium | When Stripe announces new version |
| iron-session API | Low | v8 is stable; check on major version bumps |
| Next.js 15 Server Component cookie rules | Low | App Router is stable; unlikely to change |
| Stripe webhook event types | Medium | New events added periodically |
| PLN payment method availability | Low | Blik, cards are stable in Poland |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Remove `fallback-secret-change-in-production`** | Critical security vulnerability — iron-session seal is only as strong as the password | `lib/session.ts:27` — throw if `SESSION_SECRET` is missing instead of falling back |
| **Add idempotency keys to PI create** | Prevents duplicate PIs on network retry | `lib/stripe.ts` or payment Server Action — use `checkoutSessionId + timestamp` as key |
| **Keep PI reuse via `session.paymentIntentId`** | Stripe best practice; tracks retry history | Already implemented in docs — verify in code |
| **Implement webhook signature verification** | Without it, anyone can POST fake events to your endpoint | `app/api/webhooks/stripe/route.ts` — use `stripe.webhooks.constructEvent()` |
| **Keep `completedPaymentIntentId` privacy guard** | Prevents leaked PI ids from accessing order pages | Already specified in docs — verify in code |
| **Suppress billing address in PaymentElement** | Prevents duplicate entry and address divergence | Already specified in docs — verify in code |
| **Migrate address from metadata to `shipping` parameter** | Radar fraud signals; Dashboard Shipping section | Issue already tracked in `docs/checkout/payment/framed-objective.md:61` |

### Immediate Actions

1. **Fix `lib/session.ts` password fallback** — replace `|| "fallback-secret..."` with a thrown error if `SESSION_SECRET` is missing. This is a one-line security fix.
2. **Add idempotency key to PI create call** — in the payment Server Action, pass `{ idempotencyKey: \`checkout-${session.checkoutSessionId}-${Date.now()}\` }` as the second argument to `stripe.paymentIntents.create()`.
3. **Verify webhook endpoint exists and checks signature** — before payment page ships, confirm `app/api/webhooks/stripe/route.ts` uses `stripe.webhooks.constructEvent(payload, sig, secret)`.
4. **Add `apiVersion` pinning check** — `lib/stripe.ts:9` pins to `2025-10-29.clover`. Document this version in deployment notes; review Stripe changelog quarterly.

### Open Questions

1. What is the Stripe webhook endpoint URL in production? Has it been registered in Stripe Dashboard with `payment_intent.succeeded` event?
2. Is `STRIPE_WEBHOOK_SECRET` configured in production environment variables?
3. Are PLN payment methods (Card, Blik) enabled in Stripe Dashboard for this account?
4. Has the `shipping` parameter migration issue been filed as a beads issue? (Upstream dependency: address page collecting name)

---

## Security Checklist for `/checkout/payment` Go-Live

- [ ] `SESSION_SECRET` is strong (≥32 chars, random) and identical across all server instances
- [ ] `lib/session.ts` has NO fallback password — throws if env var is missing
- [ ] Stripe webhook endpoint registered and verified with signature check
- [ ] `STRIPE_WEBHOOK_SECRET` in production env vars
- [ ] PLN payment methods enabled in Stripe Dashboard
- [ ] `app/checkout/error.tsx` exists (handles unhandled errors gracefully)
- [ ] Idempotency keys used on all PI `create()` calls
- [ ] `completedPaymentIntentId` privacy guard implemented in success page
- [ ] PII (address fields) NOT logged in production server logs
- [ ] HTTPS enforced in production (Stripe rejects non-HTTPS return URLs in live mode)
