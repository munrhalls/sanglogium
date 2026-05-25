# Q & A - CRITICAL Q'S ONLY INTELLIGENCE GATHERING - Return Page

## Foundational Clarifications

**Q6: Stripe webhook + order persistence in this sprint scope?**
- Status: ✅ RESOLVED
- Decision: THIS IS PART OF CHECKOUT SYSTEM HAPPY PATH ONLY GUEST CHECKOUT ONLY TRACER
- Implementation: Webhook handler is IN SCOPE for this tracer (not deferred)
- Scope: Webhook creates order document in Sanity, decrements stock on payment_intent.succeeded

---

## Return Page Role in 4-Layer Architecture

### Layer Assignment

**Layer 1: Routing & Orchestration** (`/checkout/return/page.tsx`)
- Server Component that reads URL params and verifies payment
- Fetches order data from Sanity
- Renders confirmation or error state

**Layer 2: Presentation & Capture**
- None. Return page is pure display. No user input required.

**Layer 3: Mutation & Session Gateway**
- None. No server actions on return page.
- Session is read-only for verification purposes.

**Layer 4: Secure Service Infrastructure**
- Stripe API: Verify payment intent status
- Sanity: Fetch order document (created by webhook)

---

## Data Flow and Verification

### How Payment Verification Works

**User Arrival:**
- Stripe redirects user to `/checkout/return?payment_intent=pi_xxx&payment_intent_client_secret=pi_xxx_secret_xxx`

**Server Verification (Layer 1 → Layer 4):**
1. Extract `payment_intent` from URL params
2. Call `stripe.paymentIntents.retrieve(paymentIntentId)` to verify status
3. If status != `succeeded`, show error (don't fetch order)

**Order Fetch (Layer 1 → Layer 4):**
1. Use `paymentIntentId` to query Sanity for order document
2. Order document was created by Stripe webhook (async)
3. Display order confirmation if found

**Why This Architecture:**
- Never trust URL params alone - always verify with Stripe API
- Order data from Sanity is the single source of truth (webhook already validated Stripe signature)
- Return page is idempotent - safe to refresh

---

## Session Handling

### Session State on Return Page

**Payment Intent ID in Session:**
- Payment page stored `paymentIntentId` in session during Stripe Intent creation
- Return page reads this to cross-reference with URL param (security check)

**Session Handling (Next.js 15 Constraint):**
- Do NOT destroy session on return page
- Next.js 15 Server Components (page.tsx) are read-only during rendering
- Attempting session.destroy() in Server Component throws runtime error

**Session Lifecycle:**
- Session remains intact after successful return
- Next checkout cycle overwrites session via initCheckoutSession Server Action
- This naturally clears old paymentIntentId and basket data

**Why This Approach:**
- Zero additional client components needed
- Zero useEffects or client-side mutation logic
- Return Page stays 100% pure read-only Server Component
- Fits "simplest possible" tracer bullet requirement

**Failed Payment:**
- If payment failed/cancelled: session remains intact
- User can navigate back to payment page to retry
- Session still has basket, address, shipping data

---

## Error States

### Payment Status Handling

**Payment Succeeded:**
- Verify with Stripe API
- Fetch order from Sanity
- Display order confirmation
- Do NOT destroy session (Next.js 15 constraint)

**Payment Failed:**
- Verify with Stripe API (status = `requires_payment_method` or similar)
- Display error message with Stripe's error description
- Link back to payment page (session intact for retry)
- Do NOT destroy session

**Payment Cancelled:**
- Verify with Stripe API (status = `canceled`)
- Display cancellation message
- Link back to basket (start over)
- Do NOT destroy session (Next.js 15 constraint)

**Payment Processing:**
- Verify with Stripe API (status = `processing`)
- Display "payment processing" state
- Simple refresh button (no complex polling)
- Do NOT destroy session

**Invalid Payment Intent:**
- URL param missing or invalid
- Redirect to basket with error
- Do NOT destroy session (Next.js 15 constraint)

---

## Order Data Display

### What User Sees on Success

**Order Information (from Sanity order document):**
- Order ID (Sanity document `_id`)
- Item list (products, quantities, prices)
- Total amount paid (from Sanity order, cross-checked with Stripe)
- Shipping address (from Sanity order - flattened string fields)
- Order date/time
- Estimated delivery (if available from shipping API)

**Why Fetch from Sanity:**
- Webhook already created order with validated data
- Single source of truth for order state
- Decouples return page from payment page session data
- Allows order history features later

---

## Idempotency and Refresh

### Safe Refresh Behavior

**Return Page is Idempotent:**
- No mutations occur on page load
- Only reads: Stripe verification, Sanity fetch
- User can refresh safely without side effects

**Order Not Found (Webhook Lag):**
- Stripe shows `succeeded` but Sanity order not created yet
- Server-side solution: Add 2000ms delay before Sanity query
- Why delay: Webhook typically completes in 1-3 seconds, Server Component renders in milliseconds
- This guarantees webhook writes to Sanity before first render

**Why Server-Side Delay (Not Manual Refresh):**
- Manual refresh buttons complicate UI and break happy path experience
- Server Component beats webhook 99% of time without delay
- 2-second delay is invisible to user (server-side, not client loading)
- Eliminates need for "Refresh" button component entirely
- Fits "simplest possible" tracer bullet requirement

---

## Navigation Guards

### Post-Completion Navigation

**After Successful Return:**
- Session intact (contains old basket, address, shipping, paymentIntentId)
- User can navigate back to payment (will see old order attempt)
- User can navigate to basket (start new checkout)
- User can navigate to homepage

**After Failed Payment:**
- Session intact
- User can navigate back to payment (retry with same session)
- User can navigate to basket (abandon checkout)

**After Cancellation:**
- Session intact
- User can navigate to basket (start fresh)
- User can navigate to payment (will see old order attempt)

**Why This Pattern:**
- Next.js 15 constraint: Server Components cannot mutate cookies
- Session cleanup deferred to next checkout cycle (initCheckoutSession overwrites)
- Allows retry on failure (good UX)
- "Ghost forward" attacks prevented by paymentIntentId terminal state handling (see payment page Q&A)

---

## API Call Tally for Return Page

### Optimized External Calls

| Phase | Stripe API Calls | Sanity Calls | Session Operations |
|-------|------------------|--------------|-------------------|
| Return Page (Success) | 1 (verify payment intent) | 1 (fetch order) | 0 (read-only) |
| Return Page (Failed) | 1 (verify payment intent) | 0 | 0 (read-only) |
| Return Page (Cancelled) | 1 (verify payment intent) | 0 | 0 (read-only) |

**Total per visit:** 1-2 calls (minimal, efficient)

**Why This is Optimal:**
- Single Stripe verification call (no duplicate work)
- Single Sanity read (order already created by webhook)
- No shipping API calls (shipping data already in order)
- Matches system-level architecture pattern (minimal external calls)

---

## Webhook Race Condition

### Handling Async Order Creation

**The Race:**
- User completes payment → Stripe redirects immediately
- Stripe webhook fires asynchronously → creates order in Sanity
- User arrives at return page before webhook completes

**The Solution (Server-Side Delay):**
1. Verify payment with Stripe API (fast, synchronous)
2. If status === 'succeeded': await 2000ms (sequence buffer)
3. Try to fetch order from Sanity using `paymentIntentId`
4. If order found: display confirmation
5. If order not found after delay: display "processing" state with fallback

**Why Server-Side Delay:**
- Webhook completes in 1-3 seconds, Server Component renders in milliseconds
- Without delay, Server Component beats webhook 99% of time
- 2-second delay guarantees webhook writes to Sanity before first render
- Eliminates need for manual refresh button component
- Fits "simplest possible" tracer bullet requirement

**Fallback (If Webhook Fails):**
- Display payment intent data directly from Stripe verification
- Show "order confirmation pending" message
- Provide support contact
- This is a catastrophic failure mode (webhook infrastructure down), not a normal flow

---

## Security Considerations

### Return Page Security Checklist

**URL Param Trust:**
- Never trust `payment_intent` query param alone
- Always verify with Stripe API before displaying anything
- Cross-reference with session `paymentIntentId` if available

**Data Sources:**
- Order data from Sanity (trusted - webhook already validated Stripe signature)
- Payment status from Stripe API (trusted - direct API call)
- Never use client-side state for verification

**Session Security:**
- Session is read-only on return page (Next.js 15 constraint)
- Session is encrypted (iron-session) - client cannot tamper
- Session cleanup deferred to next checkout cycle (initCheckoutSession overwrites)
- PaymentIntentId terminal state prevents replay (see payment page Q&A)

**Sensitive Data:**
- No sensitive data in URL (payment_intent ID is public, not secret)
- Order details fetched from server (not exposed in URL)
- Address stored in Sanity order (not in session after completion)

**Why This is Secure:**
- Server-side verification for all critical data
- No client-side trust assumptions
- PaymentIntentId terminal state prevents replay (payment page handles update/create logic)
- Single source of truth (Sanity order document)

---

## The Corrected, Safe 2026 Flow (Tracer Bullet)

### Return Page Flow

**User Arrival:**
1. Stripe redirects to `/checkout/return?payment_intent=pi_xxx&payment_intent_client_secret=pi_xxx_secret_xxx`

**Server Verification:**
2. Server Component extracts `payment_intent` from URL
3. Server calls `stripe.paymentIntents.retrieve(paymentIntentId)`
4. If status != `succeeded`: display error, preserve session, link to retry

**Sequence Buffer (Webhook Lag Prevention):**
5. If status === 'succeeded': await 2000ms (allow webhook to write to Sanity)

**Order Display:**
6. Server queries Sanity for order with `paymentIntentId`
7. If order found: display order confirmation (items, total, address)
8. If order not found after delay: display "processing" state with fallback

**Session Handling:**
9. Do NOT destroy session (Next.js 15 Server Component constraint)
10. Session remains intact for next checkout cycle to overwrite

**Error Handling:**
11. Payment failed: show error, preserve session, link to payment page
12. Payment cancelled: show cancellation, preserve session, link to basket
13. Invalid intent: redirect to basket with error, preserve session

---
