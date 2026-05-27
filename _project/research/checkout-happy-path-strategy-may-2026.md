# Checkout System: Current Status → Professional Happy Path Strategy

> **Research Date:** May 26, 2026
> **Decay Risk:** Medium — architecture decisions are durable; Stripe API specifics may evolve
> **Scope:** Evidence-based diagnostic of current checkout system + progressive implementation strategy for happy path completion, then edge cases
> **Target Audience:** Solo developer using Windsurf Cascade for checkout completion
> **Out of scope:** Multi-currency, subscriptions, BNPL, guest vs authenticated user split, marketing/analytics integrations

---

## Research Scope Contract

- **Topic:** Diagnose the current checkout system against its documented architecture (4-layer vertical slice, iron-session flow) and identify every gap blocking a professional, zero-red-flag happy path, then map progressive steps to resolve them.
- **First Principles:**
  1. A checkout system has ONE authoritative state model — two competing state models create silent failures at integration boundaries
  2. Security invariants (encryption, idempotency, signature verification) are binary: present and correct, or absent and dangerous — there is no "mostly secure"
  3. The webhook is the source of truth for order fulfillment — if the webhook cannot create orders from the active payment flow, the system cannot complete transactions
- **Fundamentals:** Next.js 15 Server Components + Server Actions, iron-session encrypted cookies, Stripe PaymentIntents API, Sanity CMS document model, webhook signature verification
- **Scope Boundary:** Does NOT cover post-purchase flows (returns, refunds), admin dashboards, or analytics. Focuses exclusively on basket → address → shipping → payment → success → webhook order creation.
- **Decay Risk:** Medium — Stripe API version is pinned; iron-session v8 is stable; Next.js 15 patterns are current

---

## Phase 1: Codebase Diagnostic — What Is Actually Built

### Architecture as Documented

The `docs/checkout/payment/framed-objective.md` and `docs/checkout/payment/tasks-decomposition.md` describe a **single, coherent iron-session flow**:

```
Basket (iron-session: [{productId, qty}])
  → Address Page → saveAddress Server Action → iron-session.address
  → Shipping Page → saveShippingAction Server Action → iron-session.shippingCode + shippingCost
  → Payment Page → initPaymentAction Server Action → stripe.paymentIntents.create/update
  → PaymentForm.client.tsx → stripe.confirmPayment → /api/checkout/return Route Handler
  → /checkout/success/page.tsx → render confirmation
  → Stripe Webhook → payment_intent.succeeded → create Sanity order + decrement stock
```

### Architecture as Implemented

The codebase contains **TWO competing, incompatible checkout flows** that do not connect at the payment-to-webhook boundary:

---

#### Flow A: Iron-Session Flow (Partially Implemented, Documented)

| Layer | File | Status | Evidence |
|-------|------|--------|----------|
| Server Component — Basket | `app/(store)/checkout/page.tsx` | ✅ Exists | `CheckoutButton.tsx` → `initCheckoutSession` |
| Server Component — Address | `app/(store)/checkout/address/page.tsx` | ✅ Exists | Funnel guard: basket check; renders `AddressForm.tsx` |
| Client Component — Address | `app/(store)/checkout/address/AddressForm.tsx` | ✅ Exists | 5 fields: regionCode, postalCode, street, streetNumber, city |
| Server Action — Address | `app/actions/checkout/index.ts:saveAddress` | ✅ Exists | Google validation, session.address, cascade invalidation |
| Server Component — Shipping | `app/(store)/checkout/shipping/page.tsx` | ✅ Exists | Funnel guard: address check; AlleKurier rates fetch |
| Client Component — Shipping | `app/(store)/checkout/shipping/ShippingPageClient.tsx` | ✅ Exists | Select option → `saveShippingAction` |
| Server Action — Shipping | `app/actions/checkout/index.ts:saveShippingAction` | ✅ Exists | Validates price, saves shippingCode + shippingCost |
| Server Component — Payment | `app/(store)/checkout/payment/page.tsx` | ✅ Exists | Funnel guards, Sanity reality check, calls `initPaymentAction` |
| Server Action — Payment | `app/actions/checkout/index.ts:initPaymentAction` | ✅ Exists | PI create/update with metadata, session.paymentIntentId |
| Client Component — Payment | `app/(store)/checkout/payment/PaymentForm.client.tsx` | ✅ Exists | Stripe Elements, confirmPayment, billing_details |
| Route Handler — Return | `app/api/checkout/return/route.ts` | ✅ Exists | Session lifecycle management, redirect to success |
| Server Component — Success | `app/(store)/checkout/success/page.tsx` | ✅ Exists | Privacy guard, PI verification, status branches |
| Webhook Handler | `app/api/webhooks/stripe/route.ts` | ✅ Exists | Signature verification, idempotent order creation |

#### Flow B: Basket Reservation Flow (Legacy/Parallel, Undocumented)

| Layer | File | Status | Evidence |
|-------|------|--------|----------|
| Layout (Client) | `app/(store)/checkout/layout.tsx` | ✅ Exists | Reads `sessionStorage.getItem('basketReservationId')`; patches reservation via API |
| Client Component — Payment | `app/(store)/checkout/payment/PaymentPageClient.tsx` | ✅ Exists | Reads basketReservationId from sessionStorage; calls `POST /api/checkout/payment-intent` |
| Route Handler — Payment Intent | `app/api/checkout/payment-intent/route.ts` | ✅ Exists | Creates PI with `basketReservationId` + `checkoutSessionId` in metadata |
| Client Component — Payment Form | `app/(store)/checkout/payment/_components/PaymentForm.tsx` | ✅ Exists | Stripe Elements with broken return_url placeholder |
| Client Component — Order Summary | `app/(store)/checkout/payment/_components/OrderSummary.tsx` | ✅ Exists | Fetches reservation data from `/api/basket-reservations/${id}` |
| API — Basket Reservations | `app/api/basket-reservations/route.ts` | ✅ Exists | GET all / DELETE all |
| API — Single Reservation | `app/api/basket-reservations/[id]/route.ts` | ✅ Exists | GET / PATCH individual reservation |

---

### Critical Finding: The Two Flows Do Not Connect

**Flow A (iron-session)** creates PaymentIntents via `initPaymentAction` with this metadata:
```typescript
metadata: {
  regionCode, postalCode, street, streetNumber, city, email,
  checkoutSessionId
}
```

**Flow B (basket reservation)** creates PaymentIntents via `POST /api/checkout/payment-intent` with this metadata:
```typescript
metadata: {
  basketReservationId,
  checkoutSessionId  // optional
}
```

**The webhook handler expects `basketReservationId`:**
```@c:\webdev\sang-logium\app\api\webhooks\stripe\route.ts:61
const basketReservationId = pi.metadata?.basketReservationId
if (!basketReservationId) {
  // ... skip order creation entirely
  return
}
```

**Result:** A payment made through Flow A (iron-session) reaches the webhook, but the webhook finds NO `basketReservationId` in metadata and **silently skips order creation**. The customer is charged. No order is created. Stock is not decremented.

This is a **complete transaction failure** for the documented happy path.

---

## Phase 2: Gap Inventory — Evidence-Based

### Category: Architecture (Complete System Failure)

| # | Gap | Severity | Evidence | Impact |
|---|-----|----------|----------|--------|
| A1 | **Two competing flows with no integration point** | P0 | `initPaymentAction` puts address in metadata; webhook expects `basketReservationId`; `PaymentPageClient.tsx` is orphaned; `layout.tsx` reads sessionStorage basketReservationId while child pages use iron-session | Happy path cannot complete an order |
| A2 | **`PaymentPageClient.tsx` is dead code** | P1 | Never imported by any page; exists alongside `page.tsx` which renders `PaymentForm.client.tsx` directly | Code clutter; risk of accidental activation |
| A3 | **`layout.tsx` is a Client Component with mixed concerns** | P1 | `'use client'` layout wraps checkout pages; it expects `sessionStorage.basketReservationId` but address/shipping pages use iron-session; `validateShipping` patches reservation but doesn't use iron-session | Contextual confusion; layout may throw if no reservation in sessionStorage |
| A4 | **`OrderSummary` component requires `basketReservationId`** | P1 | `app/(store)/checkout/payment/_components/OrderSummary.tsx:28` takes `basketReservationId: string`; iron-session flow has no reservation ID | OrderSummary is unusable in iron-session flow |

### Category: Security

| # | Gap | Severity | Evidence | Impact |
|---|-----|----------|----------|--------|
| S1 | **Hardcoded iron-session fallback password** | P0 | `lib/session.ts:27` — `password: process.env.SESSION_SECRET \|\| "fallback-secret-change-in-production"` | Anyone reading source can decrypt all checkout sessions; already tracked in beads 8l3 |
| S2 | **No idempotency key on PI create** | P1 | `app/actions/checkout/index.ts:184,189` — `stripe.paymentIntents.create({...})` with no `{ idempotencyKey }` option; same gap in `app/api/checkout/payment-intent/route.ts:150` | Network retry creates duplicate PIs; already tracked in beads 80l |
| S3 | **`_components/PaymentForm.tsx` broken return_url** | P1 | Line 37: `return_url: \`${window.location.origin}/checkout/return?payment_intent={CHECKOUT_SESSION_ID}\`` — `{CHECKOUT_SESSION_ID}` is a Stripe **Checkout Session** placeholder, not a PaymentIntent placeholder | Payment redirect goes to wrong URL or with wrong ID; this component is used by Flow B only |

### Category: Functional (Happy Path Breaks)

| # | Gap | Severity | Evidence | Impact |
|---|-----|----------|----------|--------|
| F1 | **Webhook cannot create orders from iron-session flow** | P0 | `app/api/webhooks/stripe/route.ts:61` — `pi.metadata?.basketReservationId` is undefined for Flow A PIs | Customer charged, no order created, stock not decremented |
| F2 | **Address form does not collect firstName, lastName, phone** | P1 | `AddressForm.tsx:19-25` — form state has only 5 fields; `CheckoutSession` interface expects `firstName`, `lastName`, `phone` | Cannot send `shipping.name` to Stripe; cannot include customer name in order; blocks beads 5hf |
| F3 | **Payment page metadata missing firstName, lastName, phone** | P1 | `app/(store)/checkout/payment/page.tsx:90-98` — metadata only has regionCode, postalCode, street, streetNumber, city, email | Contradicts tasks-decomposition.md which lists all 8 address fields + email in metadata |
| F4 | **No email capture in payment form** | P1 | `PaymentForm.client.tsx` has no email input; `tasks-decomposition.md:231-235` Task 10 requires it; `session.email` is never set | Webhook hardcodes `customerEmail: 'guest@checkout'`; no order confirmation possible |
| F5 | **OrderSummary not rendered on payment page** | P2 | `app/(store)/checkout/payment/page.tsx:102` — only renders `<PaymentForm>`; no `<OrderSummary>` | Users cannot verify what they're paying for before confirming |
| F6 | **No stock decrement guard against negative stock** | P2 | `app/api/webhooks/stripe/route.ts:182-188` — `backendClient.patch(item._id).dec({ stock: item.quantity }).commit()` with no pre-check | Stock can go negative if concurrent purchases race |
| F7 | **`saveAddress` does not clear `paymentIntentId`** | P2 | `app/actions/checkout/index.ts:83-85` — clears `shippingCode` and `shippingCost` but NOT `paymentIntentId` | Old PI reused after address change; amount may be stale |
| F8 | **`initPaymentAction` catch-all error handling** | P2 | `app/actions/checkout/index.ts:181-187` — catches ALL errors and creates new PI; should only catch `payment_intent_unexpected_state` | Network errors, auth errors silently create new PI instead of failing loud |
| F9 | **Webhook `country` field uses `regionCode`** | P2 | `app/api/webhooks/stripe/route.ts:125` — `country: addr.regionCode` (regionCode = "PL" for Poland, but this is coincidental) | Wrong country code for non-PL addresses; shipping labels incorrect |
| F10 | **Return handler redirect to `/checkout/success` has no query params for failed/canceled** | P2 | `app/api/checkout/return/route.ts:93-99` — redirects with `status=failed` etc., but `success/page.tsx` only reads `payment_intent` and `error` from searchParams | Failed payment status hints may not be parsed correctly |
| F11 | **Shipping page uses AlleKurier but tests reference Shippo** | P2 | `shipping-page.spec.ts:4-11` — comments mention "Shippo API"; actual code uses AlleKurier | Test comments are stale; may confuse future maintenance |

### Category: Data Integrity

| # | Gap | Severity | Evidence | Impact |
|---|-----|----------|----------|--------|
| D1 | **Price calculation mismatch risk** | P2 | Payment page calculates subtotal from Sanity prices × session quantities; webhook calculates from `reservation.basketReservation[].verifiedPrice`; if these diverge, order total ≠ PI amount | Customer charged different amount than order shows; legal/compliance risk |
| D2 | **Sanity product stock read uses public client (no CDN)** | P2 | `app/(store)/checkout/payment/page.tsx:47-50` — uses `client` from `sanity-cms/lib/client.ts` with `useCdn: true` | Stock may be stale due to CDN cache; should use `writeClient` or backendClient |

### Category: Testing

| # | Gap | Severity | Evidence | Impact |
|---|-----|----------|----------|--------|
| T1 | **No automated test for the iron-session happy path** | P1 | `tests/checkout/e2e/` — address-flow.spec.ts exists but tests basket reservation flow (sessionStorage injection) | Cannot verify the documented happy path works after changes |
| T2 | **Checkout seed endpoint exists but may be unverified** | P2 | `app/(test)/checkout-seed/` referenced in tasks-decomposition.md but not found in file search | Manual testing infrastructure may be incomplete |
| T3 | **Payment page has no tests** | P2 | `tests/checkout/e2e/` — no payment flow test file found | Cannot verify PI creation, confirmation, or return handler |

---

## Phase 3: Web Research — Best Practices & First Principles

### Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Stripe PaymentIntents API Docs | docs.stripe.com/payments/payment-intents | Official | Canonical | 2026-05 | "Provide idempotency key to prevent duplicate PIs; reuse PI on interrupted checkout" | ✅ Confirmed against code gap |
| Stripe Metadata Docs | docs.stripe.com/metadata | Official | Canonical | 2026-05 | "Metadata for app-specific tracking; use `shipping` for structured address" | ✅ Confirms beads 5hf |
| Next.js + Stripe 2026 Guide | dev.to/sameer_saleem | Community | Medium | 2026-05 | "Server Actions standard for 2026; Embedded Checkout preferred over redirect" | ⚠️ Context-dependent — we use PaymentElement, not Embedded |
| Tim Deschryver Agentic AI | timdeschryver.dev | Community | High | 2026-05 | "Spec-driven for large features; AGENTS.md for persistent context" | ✅ Already have AGENTS.md |
| GoGloby AI Workflow 2026 | gogloby.com | Industry | Medium | 2026-05 | "Small chunks, diff-first, verification gates" | ✅ Our strategy aligns |
| Stripe Radar Docs | stripe.com/guides/radar-rules-101 | Official | Canonical | 2026-05 | "Radar uses structured `shipping` data for fraud scoring; metadata invisible" | ✅ Confirms beads 5hf motivation |

### First Principles Analysis

**Core Problem:** Two checkout state models (iron-session vs basket reservation) create a boundary where payment succeeds but order fulfillment fails.

**Underlying Constraints:**
1. Next.js App Router Server Components cannot write cookies; only Server Actions and Route Handlers can
2. iron-session cookies are encrypted and max 4KB — cannot store full product data, only IDs and quantities
3. Stripe webhooks are asynchronous and at-least-once — idempotency is mandatory
4. The webhook is the ONLY place where order creation and stock decrement happen — if it fails, money is taken with no record

**Inherent Tradeoffs:**

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Iron-session only** (Flow A) | Simple, no DB writes until webhook, fast page loads | Session cookie max 4KB; no server-side basket persistence for webhook recovery | Standard e-commerce where webhook is reliable |
| **Basket reservation only** (Flow B) | Full basket persisted server-side; webhook can recover without session | Requires DB writes at every step; more complex; sessionStorage is fragile | High-value transactions requiring audit trail |
| **Hybrid** (current state) | None — this is the worst of both | Two code paths, two PI creation sites, webhook only works with one | ❌ Never — this is accidental complexity |

**Failure Modes:**
1. **Misapplication:** Keeping both flows "just in case" — doubles maintenance, guarantees integration bugs
2. **Over-application:** Adding basket reservations to every step when iron-session is sufficient
3. **Under-application:** Not providing webhook with enough data to create orders independently of the session

---

## Phase 4: Progressive Strategy — Happy Path First, Then Edge Cases

### Decision: Consolidate to ONE Flow

**Verdict:** The iron-session flow (Flow A) is the documented, simpler, and more aligned with the 4-layer architecture. The basket reservation flow (Flow B) must be **deprecated and removed**, not extended.

**Rationale:**
- Flow A is documented in `framed-objective.md` and `tasks-decomposition.md`
- Flow A follows the 4-layer architecture (Server Component → Server Action → Stripe SDK)
- Flow A has funnel guards, cascade invalidation, and session management already working
- Flow B's `PaymentPageClient.tsx` is orphaned (never imported)
- Flow B's `_components/PaymentForm.tsx` has a broken return_url
- The webhook can be adapted to work with Flow A by including `basketReservationId` in metadata OR by including all order data in metadata

**But wait — can the webhook work without basket reservations?**

Option 1: Include full address + basket + shipping in PI metadata (large, but metadata limit is 50 keys × 500 chars each = 25KB, well within limits)
Option 2: Create a basket reservation in `initPaymentAction` before PI creation, pass reservation ID in metadata
Option 3: Adapt webhook to read all needed data from PI metadata (no reservation needed)

**Recommendation: Option 3 for happy path, then Option 2 for edge case recovery.**

Why:
- Option 3 requires no new DB writes during checkout — keeps the flow simple
- The webhook already reads `shippingAddress` from the reservation; we can flatten it into metadata instead
- For edge cases (user closes browser), the webhook has everything it needs from metadata
- Option 2 (reservation) can be added later for audit trail and recovery without blocking happy path

---

### Progressive Implementation Plan

#### Step 0: Pre-Work (30 minutes)
1. **Create beads issue for Flow B deprecation** — document removal of `PaymentPageClient.tsx`, `_components/PaymentForm.tsx`, `OrderSummary.tsx` (or adapt)
2. **Create beads issue for `layout.tsx` simplification** — remove basket reservation dependency from layout
3. **Verify which tests actually run** — `npm test` or `npm run test:e2e` to see current state

#### Step 1: Security Foundation (Session 1 — beads 8l3)
- Fix `lib/session.ts:27` — remove fallback password
- Verification: `npm run build`, temporarily unset `SESSION_SECRET` → must throw
- **This is P0 and blocks all other work** — insecure session = nothing else matters

#### Step 2: Fix the Webhook for Iron-Session Flow (Session 2 — NEW ISSUE)
- Modify `initPaymentAction` to include ALL order data in PI metadata:
  - `items` (JSON string of productId, name, quantity, price)
  - `shippingAddress` (JSON string of full address)
  - `shippingCost`
  - `customerEmail`
- Modify webhook to read order data from PI metadata when `basketReservationId` is absent
- Fallback: if `basketReservationId` exists, use current logic (backward compatibility)
- Verification: End-to-end test with Stripe test card → verify order created in Sanity

#### Step 3: Idempotency Keys (Session 3 — beads 80l)
- Add `idempotencyKey` to `stripe.paymentIntents.create()` in `initPaymentAction`
- Format: `checkout-${session.checkoutSessionId}-${Date.now()}`
- Verify `update()` path does NOT need idempotency key
- Verification: Refresh payment page → verify same PI ID in Stripe Dashboard

#### Step 4: Address Form Completion (Session 4 — NEW ISSUE)
- Add `firstName`, `lastName`, `phone` fields to `AddressForm.tsx`
- Update `Address` type in `checkout.types.ts`
- Update `saveAddress` Server Action to accept and store these fields
- Update `CheckoutSession` interface (already has them; just need the form to collect)
- Verification: Submit address → verify session has all 8 fields

#### Step 5: Email Capture + Order Summary (Session 5 — NEW ISSUE)
- Add email input to `PaymentForm.client.tsx`
- Create Server Action to save email to session
- Pass email to `initPaymentAction` metadata
- Adapt `OrderSummary` component to accept iron-session data (or create new `OrderSummary`)
- Render `OrderSummary` on payment page
- Verification: Payment page shows itemized total; email captured and sent to webhook

#### Step 6: Shipping Parameter Migration (Session 6a+6b — beads 5hf)
- Part 1: Construct `shipping: { name, address }` in `initPaymentAction`
- Part 2: Remove address fields from metadata; keep only app-specific keys
- Part 3: Update webhook to read address from `paymentIntent.shipping`
- Verification: Stripe Dashboard Shipping section shows address; Radar active

#### Step 7: Cascade Invalidation Fix (Session 7 — NEW ISSUE)
- Clear `session.paymentIntentId` in `saveAddress` when address changes
- Clear `session.paymentIntentId` in `saveShippingAction` when shipping changes
- Verification: Edit address → return to payment → verify new PI created with updated amount

#### Step 8: Stock Decrement Guard (Session 8 — NEW ISSUE)
- Before `patch(item._id).dec({ stock })`, verify current stock ≥ quantity
- If insufficient, log error and do NOT create order ( Stripe will retry webhook)
- Verification: Test with product stock=1, two concurrent checkouts

#### Step 9: Remove Flow B Artifacts (Session 9 — NEW ISSUE)
- Delete `PaymentPageClient.tsx`
- Delete `_components/PaymentForm.tsx` (after confirming PaymentForm.client.tsx is the active one)
- Simplify `layout.tsx` — remove basket reservation and sessionStorage logic
- Delete unused basket reservation API endpoints if no longer needed
- Verification: `npm run build` passes; no 404s in checkout flow

#### Step 10: End-to-End Happy Path Test (Session 10 — NEW ISSUE)
- Create Playwright test: basket → address → shipping → payment (test card) → success
- Verify: order created in Sanity, stock decremented, PI has correct total
- Run test against local Stripe test mode

#### Step 11-15: Edge Cases (Post-Happy Path)
- Out-of-stock mid-checkout
- Payment declined → retry
- Session timeout
- User navigates back from payment → edits address → forward again
- Concurrent checkouts on last item
- Webhook retry (duplicate event)
- Stock negative guard
- PII logging cleanup (production gating)
- Error boundary verification
- Checkout seed endpoint security audit

---

## Phase 5: Risk Assessment & Stop Rules

### What Could Go Wrong

1. **Webhook migration breaks existing basket reservation tests** — Mitigation: Keep backward-compatible webhook logic (check for basketReservationId first)
2. **Removing Flow B components breaks something unexpectedly** — Mitigation: Search for all imports before deleting; use `grep` to confirm no references
3. **Address form changes break shipping page** — Mitigation: `Address` type is shared; update all consumers in one session
4. **Adding email capture to PaymentForm changes component props** — Mitigation: PaymentForm.client.tsx is only used by payment page; prop changes are local
5. **Stripe `shipping` parameter requires different address shape** — Mitigation: Test with Stripe test mode before committing

### Stop Rules

**STOP and re-scope if:**
- Any session requires touching >3 files (split into smaller issues)
- A change breaks the existing shipping page tests (don't proceed until fixed)
- The webhook migration cannot be made backward-compatible (requires deeper architectural decision)
- `npm run build` fails after any change (fix before continuing)

---

## Phase 6: Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Two competing flows exist | Flow A: `initPaymentAction` metadata ≠ Flow B: `POST /api/checkout/payment-intent` metadata | Code inspection |
| Webhook requires basketReservationId | `app/api/webhooks/stripe/route.ts:61` | Code inspection |
| Iron-session flow cannot complete orders | `initPaymentAction` metadata lacks `basketReservationId` | Logical deduction from code |
| Fallback password exists | `lib/session.ts:27` | Code inspection |
| No idempotency key | `app/actions/checkout/index.ts:184,189` | Code inspection |
| Address form missing 3 fields | `AddressForm.tsx:19-25` has 5 fields; `CheckoutSession` expects 8 | Code inspection |
| Payment page metadata incomplete | `page.tsx:90-98` vs `tasks-decomposition.md:150-161` | Code inspection |
| `_components/PaymentForm.tsx` broken return_url | Line 37 uses `{CHECKOUT_SESSION_ID}` placeholder | Code inspection |
| `OrderSummary` requires reservation | `OrderSummary.tsx:28` prop type | Code inspection |
| `layout.tsx` mixes both flows | Reads sessionStorage.basketReservationId; address page uses iron-session | Code inspection |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Keep both flows" | Two flows = 2× maintenance, guaranteed integration bugs at boundary | ❌ Abandoned — consolidate to one |
| "Basket reservation flow is more robust" | It has broken return_url, orphaned component, no funnel guards | ❌ Abandoned — iron-session is more complete |
| "Webhook can be fixed by adding reservation creation to initPaymentAction" | This adds DB write to every PI creation; more complex than metadata approach | ⚠️ Deferred — metadata-first for happy path, reservation later for edge cases |
| "Remove basket reservation API entirely" | Tests and layout depend on it; must deprecate gradually | ⚠️ Modified — keep API during transition, remove in Step 9 |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Stripe API specifics (idempotency, shipping param) | Medium | Quarterly or after API version change |
| Next.js Server Action / cookie patterns | Low | Stable in v15 |
| iron-session configuration | Low | v8 is stable |
| AlleKurier API integration | High | External service; may change |
| Sanity schema (order, basketReservation) | Medium | Schema changes require webhook updates |

---

## Phase 7: Synthesis — Actionable Takeaways

### For Our Project: The Single Most Important Decision

**Consolidate to the iron-session flow. Deprecate the basket reservation flow. Adapt the webhook to read order data from PI metadata.**

This decision resolves the #1 blocker (orders cannot be created) and simplifies the architecture from two flows to one.

### Immediate Actions (Tomorrow's Work)

1. **Create beads issues for gaps not yet tracked:**
   - Issue: Fix webhook for iron-session flow (orders cannot be created)
   - Issue: Complete address form (add firstName, lastName, phone)
   - Issue: Add email capture + OrderSummary to payment page
   - Issue: Fix cascade invalidation (clear paymentIntentId on upstream changes)
   - Issue: Add stock decrement guard
   - Issue: Deprecate Flow B artifacts

2. **Execute beads 8l3 (fallback password) first** — 10 minutes, 1 file, zero risk

3. **Execute beads 80l (idempotency key) second** — 20 minutes, 2 files, low risk

4. **Execute webhook fix third** — This is the critical path to a working happy path

### Session Template for Each Issue

```
Implement beads issue [ID]: [Title]

Spec (from this research artifact):
- File(s): [exact paths]
- Current code: [line numbers and content]
- Required change: [specific diff]
- Constraints: [what NOT to change]
- Verification: [how to confirm it works]
```

### Token Cost Estimate for Full Happy Path

| Step | Sessions | Est. Tokens | Cost |
|------|----------|-------------|------|
| Security (8l3) | 1 | 500 | $0.05 |
| Webhook fix | 1 | 2,000 | $0.20 |
| Idempotency (80l) | 1 | 1,500 | $0.15 |
| Address completion | 1 | 2,000 | $0.20 |
| Email + OrderSummary | 1 | 2,500 | $0.25 |
| Shipping param (5hf) | 2 | 4,000 | $0.40 |
| Cascade invalidation | 1 | 1,000 | $0.10 |
| Stock guard | 1 | 1,500 | $0.15 |
| Flow B cleanup | 1 | 2,000 | $0.20 |
| **Total** | **10** | **~17,000** | **~$1.70** |

### Open Questions for Next Session

1. Does `PaymentPageClient.tsx` render anywhere? (grep says no imports found)
2. How are basket reservations created in the current test flow? (tests create them directly via Sanity writeClient)
3. Is `app/api/checkout/payment-intent/route.ts` called from anywhere other than `PaymentPageClient.tsx`?
4. Does the `AddressForm.tsx` already have hidden firstName/lastName/phone fields that weren't shown in the code read?
5. What is the current Stripe test environment status? Can we run end-to-end tests with test cards?
6. Are there existing orders in Sanity that we should not disturb during testing?

### Success Criteria for "Happy Path Complete"

- [ ] User can go from basket → address → shipping → payment → success
- [ ] Order is created in Sanity with correct items, total, address
- [ ] Product stock is decremented
- [ ] Stripe Dashboard shows PaymentIntent with correct amount and status
- [ ] No console errors in dev mode
- [ ] `npm run build` passes
- [ ] No hardcoded secrets or fallback passwords
- [ ] Idempotency key prevents duplicate PIs on refresh
- [ ] Webhook signature verification is active

### Beyond Happy Path (Edge Cases — Post Completion)

- [ ] Payment declined → user can retry with same or different card
- [ ] User edits address mid-flow → shipping recalculated, PI refreshed
- [ ] Out of stock at payment page → redirect to basket with clear message
- [ ] Concurrent checkouts on last item → only one succeeds
- [ ] Webhook retry → order created idempotently (no duplicates)
- [ ] Session expires mid-checkout → graceful redirect to basket
- [ ] Shipping API down → clear error message, retry option
- [ ] Production PII logging gated — no addresses in server logs
