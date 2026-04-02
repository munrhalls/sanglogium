# Research & Audit: Payments → Orders Management → User Account

> **Retrieval Date:** 2026-04-02
> **Researcher:** AI/Human collaboration (Cascade)
> **Decay Risk:** Medium (Stripe API versioning, Next.js 15 patterns)
> **Next Review:** 2026-07-01

---

## Executive Summary

- The payment-to-order pipeline **works for the happy path** (checkout → webhook → order creation → stock finalization)
- The order schema is **well-designed but not registered** in Sanity — `orderType` is missing from `sanity/schemaTypes/index.ts`
- FSM is **designed in documentation** (19 states) but **implemented as a flat dropdown** (9 states, no transition enforcement)
- User-order linking is **one-directional only** — orders store `clerkUserId` but users have **zero order visibility**
- Admin UI is **empty shells** — manager and packer pages return placeholder divs
- `backendClient` uses `useCdn: true` — **stale reads for order operations**
- **No audit trail, no email notifications, no refund API, no Inngest integration** despite specs mentioning all of these
- Overall system maturity: **~25% of professional standard** — payment capture works, everything after is scaffolding

---

## Research Scope Contract

- **Topic:** End-to-end architecture of payment completion → order lifecycle → user account integration
- **First Principles:** (1) Payment is the genesis event; orders must be created idempotently from webhooks. (2) Order state is a finite state machine; invalid transitions corrupt business data. (3) Users must have secure, immediate access to their order data.
- **Fundamentals:** Stripe webhook idempotency, FSM enforcement patterns, CMS-as-order-store tradeoffs, Clerk-Sanity user linking
- **Scope Boundary:** Checkout flow (cart → payment initiation) is OUT OF SCOPE. Starts at `checkout.session.completed` webhook.
- **Target Audience:** Sprint planning for order management system completion
- **Decay Risk:** Medium — Stripe API versions change quarterly, Next.js App Router patterns evolving

---

## First Principles Analysis

### Core Problem Being Solved
Converting a successful payment event into a tracked, manageable order that both the business and customer can observe and act upon throughout its lifecycle.

### Underlying Constraints
1. **Webhooks are asynchronous and unreliable** — may arrive late, duplicate, or out of order
2. **CMS is not a database** — Sanity is optimized for content, not transactional order management
3. **State transitions must be atomic** — partial updates create inconsistent orders
4. **Users expect immediate feedback** — order confirmation must appear before webhook completes
5. **Financial data requires audit trails** — every state change must be recorded with actor/timestamp

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Sanity as order store | Single CMS, simple stack | No ACID transactions, CDN caching issues, no real-time subscriptions | MVP/low-volume (<100 orders/day) |
| Dedicated DB (Postgres) | ACID, real-time, proper indexing | Additional infrastructure, sync complexity | Scale/reliability requirements |
| Hybrid (Sanity + queue) | Best of both, Inngest for async | Complexity, two sources of truth risk | Current project target |

### Failure Modes
1. **Misapplication:** Using CDN-cached reads (`useCdn: true`) for order operations — stale data
2. **Over-application:** Building full ERP in Sanity when simple order tracking suffices
3. **Under-application:** No FSM enforcement — anyone can set any status via Studio

---

## Code Fundamentals Verification

### Fundamental 1: Webhook Idempotency
**Claim:** Stripe recommends idempotent fulfillment — handle duplicate `checkout.session.completed` events safely.

**Verification:**
- [x] Located in codebase: `app/api/webhook/route.ts:74-82`
- [ ] Test created: No webhook tests exist
- [x] Source inspected: Stripe docs confirm requirement (docs.stripe.com/checkout/fulfillment)

**Actual Behavior:**
The webhook checks for existing orders before creating:
```typescript
// app/api/webhook/route.ts:74-77
const existingOrder = await backendClient.fetch(
  `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]`,
  { sessionId: sessionData.id }
);
```
**CRITICAL BUG:** `backendClient` uses `useCdn: true` (sanity/lib/backendClient.ts:9). CDN cache can be up to 60 seconds stale. If Stripe retries within that window, a duplicate order WILL be created because the idempotency check reads stale data.

**Edge Cases:**
1. Duplicate webhook within CDN cache window → duplicate order creation
2. `checkout.session.async_payment_succeeded` NOT handled → delayed payment methods (ACH, bank transfers) will never create orders

### Fundamental 2: Order Schema Registration
**Claim:** Order documents can be created and queried in Sanity.

**Verification:**
- [x] Schema defined: `sanity/schemaTypes/orderType.ts` (479 lines)
- [x] Creation works: `sanity/lib/orders/addOrder.ts` uses `backendClient.create()`
- [x] Schema index checked: `sanity/schemaTypes/index.ts`

**Actual Behavior:**
**CRITICAL:** `orderType` is NOT imported or registered in `sanity/schemaTypes/index.ts:10-12`:
```typescript
export const schema = {
  types: [heroType, catalogueItemType, productType, homepageDataType, categoryFiltersType, categorySortablesType, brandType],
};
```
Orders can still be created via `backendClient.create()` (schemaless write) but:
- No Studio visibility/editing
- No schema validation on write
- No preview configuration active
- Data integrity relies entirely on application-level validation

### Fundamental 3: FSM State Enforcement
**Claim:** ORDER_MANAGEMENT_SYSTEM.md defines a 19-state FSM with strict transitions.

**Verification:**
- [x] Design doc: `sanity/ORDER_MANAGEMENT_SYSTEM.md` — 19 states across 5 phases
- [x] Schema implementation: `sanity/schemaTypes/orderType.ts:321-340` — 9 simplified states
- [ ] Transition enforcement: **DOES NOT EXIST**

**Actual Behavior:**
The schema defines a flat dropdown with no transition rules:
```typescript
// orderType.ts:325-337
options: {
  list: [
    { title: "Pending Payment", value: "pending_payment" },
    { title: "Processing", value: "processing" },
    { title: "Packed", value: "packed" },
    { title: "Shipped", value: "shipped" },
    { title: "Out for Delivery", value: "out_for_delivery" },
    { title: "Delivered", value: "delivered" },
    { title: "Cancelled", value: "cancelled" },
    { title: "Refunded", value: "refunded" },
    { title: "Failed", value: "failed" },
  ],
}
```
Any status can transition to any other status. No code enforces valid transitions. The 19-state FSM from the design doc has been reduced to 9 states with no enforcement layer.

### Fundamental 4: User-Order Linking
**Claim:** Users can see their orders; orders are linked to user accounts.

**Verification:**
- [x] Order stores userId: `orderType.ts:30-36` — `clerkUserId` field
- [x] Webhook sets userId: `webhook/route.ts:140` — from session metadata
- [ ] User can query orders: **NO IMPLEMENTATION EXISTS**
- [ ] Profile links to orders: **NO IMPLEMENTATION EXISTS**

**Actual Behavior:**
- Orders store `clerkUserId` (one-directional)
- `userProfile` schema is NOT registered in Sanity (not in index.ts)
- Profile system exists (`sanity/lib/profiles/`) but has zero order-related fields or queries
- No `/account/orders` page exists
- No `getOrdersByUserId` function exists
- `app/actions/user.ts` is empty: `// TODO user actions`

---

## Evaluation Metrics — All Ratings with Evidence

### Data Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Order data structure integrity | **5/10** | Schema well-designed (`orderType.ts`) but NOT registered in Sanity. Schemaless writes bypass validation. |
| User-account data consistency | **2/10** | `clerkUserId` stored in orders but no bidirectional sync. `userProfile` schema not registered. `app/actions/user.ts` is empty TODO. |
| Data validation robustness | **6/10** | `addOrder.ts:32-81` validates email, items, address, pricing. But no schema-level validation (unregistered). |
| State synchronization | **2/10** | Order created in webhook, displayed on return page via separate query. No real-time sync. CDN caching creates stale reads. |
| Data persistence strategy | **4/10** | Sanity as sole order store. `useCdn: true` on `backendClient` for order reads. No backup/export strategy. |

### Architecture Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Order-state separation of concerns | **3/10** | No FSM module. Status is a plain string field. No transition logic anywhere in codebase. |
| User-account dependency patterns | **3/10** | Clerk → Sanity profile creation works (`useUserProfile.ts`). But no order → profile linkage. Two disconnected systems. |
| Modularity of order workflows | **5/10** | `sanity/lib/orders/` is well-structured (addOrder, orderTypes). But webhook handler does too much (stock + order + validation in one function). |
| CMS integration layering | **4/10** | Three Sanity clients (`client`, `backendClient`, `checkoutClient`) with different configs. `backendClient` CDN issue is architectural. |
| Code organization structure | **5/10** | Clean file structure but scattered: order creation in `sanity/lib/`, order display in `app/(store)/checkout/return/`, order API in `app/api/order/` (commented out). |

### Performance Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Order query optimization | **3/10** | Only one order query exists (`getOrderBySession.ts`). No indexing strategy. `backendClient` uses CDN (inappropriate for orders). |
| User account lookup efficiency | **4/10** | Profile lookup by clerkId works (`fetchProfileByClerkId.ts`). But uses CDN client for reads that should be fresh. |
| Data fetching patterns | **4/10** | Webhook fetches session + products + existing order check sequentially (waterfall). No parallel fetching. |
| Caching strategy for orders | **2/10** | CDN caching on `backendClient` is WRONG for order reads. No explicit cache invalidation. No ISR/revalidation strategy. |
| Memory usage optimization | **6/10** | Order data is reasonably sized. No obvious memory leaks. Zustand store cleared on success (`OrderSuccessClient.tsx`). |

### Security Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Order access control | **1/10** | **CRITICAL.** No authorization on `getOrderBySession`. Anyone with a session_id can view any order. `app/api/order/route.ts` is entirely commented out. No user-scoped order queries. |
| User authentication integration | **4/10** | Clerk middleware exists (`middleware.ts`) but doesn't protect order endpoints. `/checkout/return` has no auth check. |
| Payment data boundaries | **7/10** | Stripe handles PCI. Only `last4` and `brand` stored in Sanity. Payment intent IDs stored (acceptable). |
| Order information disclosure | **2/10** | `getOrderBySession` returns full order data including email, address, pricing to anyone with session_id URL parameter. |
| Security headers implementation | **3/10** | Basic middleware exists. No CSP headers. No rate limiting on webhook endpoint. No IP allowlisting for Stripe webhooks. |

### Robustness Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Order-state error handling | **4/10** | Webhook has try/catch blocks. `createOrder` returns typed errors. But no dead letter queue for failed orders. |
| Payment failure coverage | **6/10** | `checkout.session.expired` and `async_payment_failed` handled — release reservations. But `async_payment_succeeded` NOT handled. |
| Resilience to system failures | **3/10** | Stock finalization (`finalizeStock`) uses Sanity transaction (good). But no retry logic if Sanity is down during webhook. Stripe will retry but CDN idempotency check may fail. |
| Order-user consistency guarantees | **1/10** | No guarantees. Order can exist without user knowing. No notification system. No user order query. |
| Order recovery mechanisms | **2/10** | Idempotency check exists but flawed (CDN cache). No reconciliation job. No orphan order detection. |

### Integration Layer Metrics

| Metric | Rating | Evidence |
|--------|--------|----------|
| Payment-to-order API coherence | **6/10** | Webhook → createOrder pipeline is clean. Amount verification exists. Product snapshot captured. |
| User-account contract | **1/10** | No contract. Orders and user profiles are completely disconnected systems. |
| CMS integration safety | **4/10** | Three clients with different purposes. But `backendClient` CDN issue undermines order operations. Schema unregistered. |
| Order-state communication | **2/10** | No event system. No pub/sub. No Inngest (mentioned in SPEC.md but not implemented). Status changes are silent. |
| System-wide consistency | **2/10** | ORDER_MANAGEMENT_SYSTEM.md describes 19 states. Schema has 9 states. No timeline field exists despite design doc requiring it. |

### Overall Assessment

| Metric | Rating | Evidence |
|--------|--------|----------|
| Relative to professional order management standards | **3/10** | Happy path works. Everything else (FSM, access control, audit trail, user visibility, admin UI) is missing or skeletal. |
| Relative to system scalability requirements | **3/10** | Sanity CDN caching, no pagination on order queries, no indexing strategy. Won't scale past ~100 concurrent orders. |
| Relative to maintainability and technical debt | **4/10** | TypeScript types exist. Code is readable. But archived code (`ARCHIVED.ts`), commented-out API routes, and schema/doc drift create confusion. |
| Overall architectural coherence | **3/10** | Design docs (ORDER_MANAGEMENT_SYSTEM.md, SPEC.md) are excellent. Implementation is ~25% of design. |

---

## Critical Gaps Analysis

### G-01: CRITICAL — Order Schema Not Registered in Sanity
- **Current:** `orderType` defined in `sanity/schemaTypes/orderType.ts` but NOT imported in `index.ts`
- **Impact:** No Studio visibility, no schema validation, no preview
- **File:** `sanity/schemaTypes/index.ts:10-12`
- **Fix:** Single-line import + add to types array

### G-02: CRITICAL — backendClient Uses CDN for Order Operations
- **Current:** `backendClient` has `useCdn: true` (`sanity/lib/backendClient.ts:9`)
- **Impact:** Stale reads break webhook idempotency (duplicate orders within CDN cache window)
- **File:** `sanity/lib/backendClient.ts:9`
- **Fix:** Create `orderClient` with `useCdn: false` for all order operations

### G-03: CRITICAL — Zero Order Access Control
- **Current:** `getOrderBySession` (`app/actions/checkout/getOrderBySession.ts`) has no auth check. Anyone with session_id URL can view any order.
- **Impact:** PII exposure (email, address, order details)
- **File:** `app/actions/checkout/getOrderBySession.ts`, `app/(store)/checkout/return/page.tsx`
- **Fix:** Verify Clerk userId matches order's clerkUserId before returning data

### G-04: CRITICAL — No FSM Transition Enforcement
- **Current:** Status is a plain string dropdown. Any value can transition to any other.
- **Impact:** Invalid state transitions, data corruption, business logic violations
- **Files:** `sanity/schemaTypes/orderType.ts:320-340`, no transition module exists
- **Fix:** Create `lib/orders/fsm.ts` with transition map and validation function

### G-05: CRITICAL — No User Order Visibility
- **Current:** `app/actions/user.ts` is `// TODO user actions`. No order history page. No `getOrdersByUserId` function.
- **Impact:** Users cannot see their orders after payment
- **Files:** `app/actions/user.ts`, no `/account/orders` route exists
- **Fix:** Create order history server action + page

### G-06: HIGH — checkout.session.async_payment_succeeded Not Handled
- **Current:** Webhook handles `completed`, `expired`, `async_payment_failed` but NOT `async_payment_succeeded`
- **Impact:** Delayed payment methods (ACH, bank transfers) will never create orders
- **File:** `app/api/webhook/route.ts:38-42`
- **Fix:** Add to permitted events and route to `handleCheckoutCompleted`

### G-07: HIGH — No Audit Trail / Timeline
- **Current:** ORDER_MANAGEMENT_SYSTEM.md describes timeline array. Schema has no timeline field.
- **Impact:** No accountability for state changes. Cannot debug order issues. Cannot detect fraud.
- **File:** `sanity/schemaTypes/orderType.ts` — missing `timeline` field
- **Fix:** Add timeline array field to order schema

### G-08: HIGH — FSM State Mismatch Between Design and Implementation
- **Current:** Design doc has 19 states (CREATED_UNPAID, PAYMENT_FAILED, PAID_CONFIRMED, TO_PACK, PACKING_LOCKED, etc.). Schema has 9 simplified states (pending_payment, processing, packed, shipped, etc.)
- **Impact:** Cannot implement packer/manager workflows as designed
- **Files:** `sanity/ORDER_MANAGEMENT_SYSTEM.md` vs `sanity/schemaTypes/orderType.ts:326-337`
- **Fix:** Align schema status values with FSM design doc

### G-09: HIGH — Admin UI Empty Shells
- **Current:** `app/(admin)/manager/page.tsx` returns `<div>manager ux</div>`. `app/(admin)/packer/page.tsx` returns `<div>packer</div>`.
- **Impact:** No order management capability for warehouse operations
- **Files:** `app/(admin)/manager/page.tsx`, `app/(admin)/packer/page.tsx`
- **Fix:** Build per SPEC.md requirements (queue view, order locking, checklist, label printing)

### G-10: HIGH — No Email Notification System
- **Current:** Zero email sending capability. No transactional email provider integrated.
- **Impact:** Users get no order confirmation, no shipping updates, no status change notifications
- **Fix:** Integrate Resend/SendGrid + create email templates

### G-11: HIGH — No Inngest Integration
- **Current:** SPEC.md states "actions are idempotent via inngest" but Inngest is not installed or configured
- **Impact:** No background job processing for state-change side effects
- **Fix:** Install Inngest, create order event functions

### G-12: HIGH — Order API Route Commented Out
- **Current:** `app/api/order/route.ts` — entire GET handler body is commented out (lines 12-36)
- **Impact:** No REST API for order retrieval
- **File:** `app/api/order/route.ts`
- **Fix:** Implement with proper auth and Sanity query

### G-13: MEDIUM — userProfile Schema Not Registered
- **Current:** Profile CRUD functions exist (`sanity/lib/profiles/`) but schema not in `index.ts`
- **Impact:** No Studio management of user profiles
- **File:** `sanity/schemaTypes/index.ts`
- **Fix:** Create and register userProfile schema type

### G-14: MEDIUM — No Refund API Integration
- **Current:** Order schema has refund fields (`returnStatus`, `refundedAmount`, `returns` array) but no Stripe refund API calls
- **Impact:** Cannot process refunds programmatically
- **Fix:** Create refund server action using `stripe.refunds.create()`

### G-15: MEDIUM — Webhook Handler Not Async-First
- **Current:** Webhook does all processing synchronously before returning 200
- **Impact:** Risk of Stripe timeout (webhook should return 2xx quickly per Stripe best practices)
- **File:** `app/api/webhook/route.ts`
- **Fix:** Return 200 immediately, process via Inngest background job

### G-16: MEDIUM — No Stripe IP Allowlisting
- **Current:** Webhook verifies signature but doesn't check source IP
- **Impact:** Reduced security posture (signature verification is primary defense, IP is defense-in-depth)
- **File:** `app/api/webhook/route.ts`
- **Fix:** Add Stripe IP allowlist check in middleware

### G-17: MEDIUM — Stock Release Not Transactional
- **Current:** `releaseReservations` (line 196-211) patches items sequentially, not in a transaction
- **Impact:** Partial release if one item fails
- **File:** `app/api/webhook/route.ts:196-211`
- **Fix:** Use `checkoutClient.transaction()` like `finalizeStock` does

### G-18: LOW — Webhook Error Logging Insufficient
- **Current:** `console.error` only. No structured logging. No alerting.
- **Impact:** Failed orders may go unnoticed
- **Fix:** Add structured logging with order context, integrate monitoring

### G-19: LOW — Order Number Generation Race Condition
- **Current:** `generateOrderNumber()` counts orders then increments — not atomic
- **Impact:** Duplicate order numbers under concurrent webhook processing
- **File:** `sanity/lib/orders/addOrder.ts:7-19`
- **Fix:** Use UUID-based order numbers or atomic counter

### G-20: LOW — OrderSummary Component Type Mismatch
- **Current:** `OrderSummary.tsx` expects `{ items: OrderItem[]; amountTotal: number }` but `getOrderBySession` returns `{ items; pricing: { total } }`
- **Impact:** Potential runtime type mismatch
- **Files:** `app/(store)/checkout/return/components/OrderSummary.tsx:8-11` vs `app/actions/checkout/getOrderBySession.ts:14-31`
- **Fix:** Align component props with server action return type

---

## Implementation Roadmap

### Phase 1: Foundation Fixes (CRITICAL — Do First)

**1.1 Register Order Schema**
- File: `sanity/schemaTypes/index.ts`
- Add: `import { orderType } from "./orderType";` + add to types array
- Time: 5 minutes
- Dependencies: None

**1.2 Fix backendClient CDN Issue**
- File: `sanity/lib/backendClient.ts`
- Create: `sanity/lib/orderClient.ts` with `useCdn: false`
- Update: All order-related queries to use `orderClient`
- Files affected: `app/api/webhook/route.ts`, `app/actions/checkout/getOrderBySession.ts`, `sanity/lib/orders/addOrder.ts`
- Time: 30 minutes
- Dependencies: None

**1.3 Add Order Access Control**
- File: `app/actions/checkout/getOrderBySession.ts`
- Add: Clerk `auth()` check, verify `clerkUserId` matches or is guest session
- File: `app/(store)/checkout/return/page.tsx`
- Add: Auth guard for non-guest orders
- Time: 1 hour
- Dependencies: None

**1.4 Handle async_payment_succeeded**
- File: `app/api/webhook/route.ts:38-42`
- Add: `"checkout.session.async_payment_succeeded"` to permitted events
- Route to `handleCheckoutCompleted`
- Time: 15 minutes
- Dependencies: None

### Phase 2: FSM & State Management (HIGH)

**2.1 Create FSM Module**
```
lib/orders/fsm.ts
├── ORDER_STATES (enum matching ORDER_MANAGEMENT_SYSTEM.md)
├── VALID_TRANSITIONS (Map<State, State[]>)
├── validateTransition(currentState, nextState) → boolean
├── getAvailableTransitions(currentState) → State[]
└── transitionOrder(orderId, nextState, actor, note) → Order
```
- Time: 2 hours
- Dependencies: G-01 (schema registered)

**2.2 Align Schema Status Values with FSM Design**
- File: `sanity/schemaTypes/orderType.ts:325-337`
- Update status list to match ORDER_MANAGEMENT_SYSTEM.md phases
- Time: 1 hour
- Dependencies: 2.1

**2.3 Add Timeline/Audit Trail to Schema**
- File: `sanity/schemaTypes/orderType.ts`
- Add `timeline` array field: `[{ timestamp, status, actor, note }]`
- Time: 30 minutes
- Dependencies: G-01

**2.4 Create Order Status Update Server Action**
```
app/actions/orders/updateOrderStatus.ts
├── Validates FSM transition
├── Updates status field
├── Appends to timeline
├── Returns updated order
```
- Time: 1.5 hours
- Dependencies: 2.1, 2.3

### Phase 3: User-Order Integration (HIGH)

**3.1 Create User Order History Server Action**
```
app/actions/orders/getOrdersByUserId.ts
├── Auth check via Clerk
├── GROQ query: *[_type == "order" && clerkUserId == $userId] | order(dates.orderedAt desc)
├── Pagination support
└── Returns sanitized order list
```
- Time: 1 hour
- Dependencies: 1.2

**3.2 Create Order History Page**
```
app/(store)/account/orders/page.tsx (Server Component)
├── Auth guard
├── Fetch orders via server action
├── OrderList component
└── Empty state handling
```
- Time: 2 hours
- Dependencies: 3.1

**3.3 Create Order Detail Page**
```
app/(store)/account/orders/[orderId]/page.tsx
├── Auth guard + ownership check
├── Order detail display
├── Status timeline visualization
├── Tracking info display
```
- Time: 2 hours
- Dependencies: 3.1, 2.3

### Phase 4: Async Processing & Notifications (HIGH)

**4.1 Integrate Inngest**
- Install: `npm install inngest`
- Create: `inngest/client.ts`, `app/api/inngest/route.ts`
- Time: 1 hour
- Dependencies: None

**4.2 Move Webhook Processing to Background**
- Webhook returns 200 immediately
- Sends event to Inngest: `order/checkout.completed`
- Inngest function handles: order creation, stock finalization, email
- Time: 2 hours
- Dependencies: 4.1

**4.3 Integrate Email Provider**
- Install: Resend (`npm install resend`)
- Create email templates: order confirmation, status update, shipping
- Time: 3 hours
- Dependencies: 4.1

**4.4 Create State-Change Side Effects**
- Inngest functions for each state transition:
  - `processing` → send confirmation email
  - `shipped` → send tracking email
  - `delivered` → send review request
  - `cancelled` → trigger refund
  - `refunded` → send refund confirmation
- Time: 3 hours
- Dependencies: 4.1, 4.3, 2.1

### Phase 5: Admin UI (HIGH)

**5.1 Manager Dashboard**
- File: `app/(admin)/manager/page.tsx`
- Order queue with filters by status
- Order detail view with status controls
- FSM-enforced transition buttons
- Time: 4 hours
- Dependencies: 2.1, 2.4

**5.2 Packer UI**
- File: `app/(admin)/packer/page.tsx`
- TO_PACK queue view
- Order locking (PACKING_LOCKED state)
- Item checklist
- Label generation trigger
- Time: 4 hours
- Dependencies: 2.1, 5.1

**5.3 Admin Auth**
- Protect admin routes via Clerk organization roles
- Add to middleware.ts matcher
- Time: 1 hour
- Dependencies: None

### Phase 6: Robustness & Cleanup (MEDIUM)

**6.1 Refund API**
- Create: `app/actions/orders/processRefund.ts`
- Stripe: `stripe.refunds.create({ payment_intent })`
- Update order status and timeline
- Time: 2 hours
- Dependencies: 2.1, 2.4

**6.2 Fix Stock Release Transaction**
- File: `app/api/webhook/route.ts:196-211`
- Convert to `checkoutClient.transaction()` pattern
- Time: 15 minutes
- Dependencies: None

**6.3 Order Reconciliation Job**
- Cron job comparing Stripe payments to Sanity orders
- Detect orphaned payments, missing orders
- Time: 3 hours
- Dependencies: 3.1

**6.4 Delete Archived Webhook Code**
- File: `app/api/webhooks/stripe/ARCHIVED.ts`
- Remove dead code to prevent confusion
- Time: 5 minutes
- Dependencies: None

---

## End-to-End Specifications — Bus Stop Maps

### Flow 1: Payment Completion → Order Creation

```
[BUS STOP 1: Stripe Webhook Received]
  ↓ POST /api/webhook
  ↓ Verify signature (stripe.webhooks.constructEvent)
  ↓ Expected: 200 response within 5 seconds
  ↓ CURRENT: ✅ Works (route.ts:10-36)
  
[BUS STOP 2: Event Routing]
  ↓ Switch on event.type
  ↓ Expected: Route checkout.session.completed + async_payment_succeeded
  ↓ CURRENT: ⚠️ Missing async_payment_succeeded (route.ts:38-42)
  
[BUS STOP 3: Idempotency Check]
  ↓ Query existing order by stripeCheckoutSessionId
  ↓ Expected: Skip if order exists, create if not
  ↓ CURRENT: ❌ BROKEN — uses CDN-cached read (backendClient useCdn:true)
  
[BUS STOP 4: Session Retrieval + Validation]
  ↓ Retrieve full session with line_items expanded
  ↓ Verify amount_total matches calculated total
  ↓ Expected: Reject on mismatch
  ↓ CURRENT: ✅ Works (route.ts:84-98)
  
[BUS STOP 5: Product Data Enrichment]
  ↓ Parse productsIntent metadata
  ↓ Fetch product details from Sanity
  ↓ Build order items with snapshots
  ↓ Expected: Complete product snapshot (name, slug, image, price)
  ↓ CURRENT: ✅ Works (route.ts:100-125)
  
[BUS STOP 6: Order Creation]
  ↓ Generate order number + ID
  ↓ Validate all fields
  ↓ Create order document in Sanity
  ↓ Expected: Order document with status "pending_payment" → immediately "processing"
  ↓ CURRENT: ⚠️ Creates with "pending_payment" but never transitions to "processing"
  
[BUS STOP 7: Stock Finalization]
  ↓ Decrement stock and reservedStock via transaction
  ↓ Expected: Atomic stock update
  ↓ CURRENT: ✅ Works — uses transaction (route.ts:214-226)
  
[BUS STOP 8: Side Effects]
  ↓ Send confirmation email
  ↓ Update user profile with order reference
  ↓ Log to audit trail
  ↓ Expected: User notified, order visible in account
  ↓ CURRENT: ❌ NONE IMPLEMENTED — no email, no user linking, no audit trail
```

**Code Requirements per Stop:**

| Stop | File | Current | Required |
|------|------|---------|----------|
| 1 | `app/api/webhook/route.ts` | ✅ | Add IP allowlisting |
| 2 | `route.ts:38-42` | ⚠️ | Add `async_payment_succeeded` |
| 3 | `route.ts:74-82` | ❌ | Use `orderClient` (useCdn: false) |
| 4 | `route.ts:84-98` | ✅ | No change |
| 5 | `route.ts:100-125` | ✅ | No change |
| 6 | `route.ts:139-167` | ⚠️ | Transition to "processing" after creation |
| 7 | `route.ts:214-226` | ✅ | No change |
| 8 | Does not exist | ❌ | Inngest events + email + user linking |

**Error Handling per Stop:**

| Stop | Error | Current Handling | Required |
|------|-------|-----------------|----------|
| 1 | Invalid signature | Return 400 ✅ | Add rate limiting |
| 3 | Duplicate event | Skip creation ⚠️ (CDN stale) | Fresh read required |
| 4 | Amount mismatch | Throw error ✅ | Add alerting |
| 6 | Creation fails | Throw error → 500 | Add retry + dead letter |
| 7 | Stock update fails | Transaction rollback | Add order status update to "failed" |

### Flow 2: Order Status Updates (Admin)

```
[BUS STOP 1: Admin Authenticates]
  ↓ Manager/Packer logs in
  ↓ Expected: Role-verified access
  ↓ CURRENT: ❌ No admin auth (empty layout, no role checks)

[BUS STOP 2: View Order Queue]
  ↓ Query orders by status filter
  ↓ Expected: Paginated, filterable order list
  ↓ CURRENT: ❌ No admin UI (placeholder divs)

[BUS STOP 3: Select Order]
  ↓ View order details
  ↓ Expected: Full order info + available transitions
  ↓ CURRENT: ❌ No order detail view

[BUS STOP 4: Trigger State Transition]
  ↓ Click transition button (e.g., "Mark as Packed")
  ↓ Expected: FSM validates transition, updates status, appends timeline
  ↓ CURRENT: ❌ No FSM, no transition API, no timeline

[BUS STOP 5: Side Effects Execute]
  ↓ Email customer, update tracking, adjust inventory
  ↓ Expected: Idempotent background processing via Inngest
  ↓ CURRENT: ❌ No Inngest, no emails, no automation

[BUS STOP 6: Audit Trail Updated]
  ↓ Timeline entry with actor, timestamp, note
  ↓ Expected: Append-only history
  ↓ CURRENT: ❌ No timeline field in schema
```

**Every stop is ❌ NOT IMPLEMENTED for this flow.**

### Flow 3: User Order History

```
[BUS STOP 1: User Authenticates]
  ↓ Clerk sign-in
  ↓ Expected: Redirect to account page
  ↓ CURRENT: ✅ Clerk auth works

[BUS STOP 2: Navigate to Orders]
  ↓ /account/orders route
  ↓ Expected: Order history page with list
  ↓ CURRENT: ❌ Route does not exist

[BUS STOP 3: Fetch User Orders]
  ↓ Server action: getOrdersByUserId(clerkUserId)
  ↓ Expected: Paginated orders, newest first
  ↓ CURRENT: ❌ Function does not exist

[BUS STOP 4: View Order Detail]
  ↓ /account/orders/[orderId]
  ↓ Expected: Full order with timeline, tracking
  ↓ CURRENT: ❌ Route does not exist

[BUS STOP 5: Reorder / Cancel]
  ↓ Action buttons based on order status
  ↓ Expected: FSM-validated actions
  ↓ CURRENT: ❌ No implementation
```

**Every stop except authentication is ❌ NOT IMPLEMENTED.**

### Flow 4: Order Cancellation / Returns

```
[BUS STOP 1: User Requests Cancellation]
  ↓ Button on order detail page
  ↓ Expected: Validate eligibility (only before "shipped")
  ↓ CURRENT: ❌ No cancellation UI or logic

[BUS STOP 2: FSM Validates Transition]
  ↓ Check current status allows cancellation
  ↓ Expected: Reject if shipped/delivered
  ↓ CURRENT: ❌ No FSM

[BUS STOP 3: Process Cancellation]
  ↓ Update status → cancelled
  ↓ Release reserved stock
  ↓ Trigger refund via Stripe
  ↓ Expected: Atomic operation
  ↓ CURRENT: ❌ No cancellation handler

[BUS STOP 4: Refund Processing]
  ↓ stripe.refunds.create({ payment_intent })
  ↓ Expected: Full or partial refund
  ↓ CURRENT: ❌ No Stripe refund integration

[BUS STOP 5: Notifications]
  ↓ Email customer refund confirmation
  ↓ Update timeline
  ↓ Expected: User sees refund status
  ↓ CURRENT: ❌ No email, no timeline
```

**Entire flow is ❌ NOT IMPLEMENTED.**

---

## Schema Updates Required

### 1. Register orderType
```typescript
// sanity/schemaTypes/index.ts — ADD:
import { orderType } from "./orderType";

export const schema = {
  types: [...existing, orderType],
};
```

### 2. Add Timeline to Order Schema
```typescript
// Add to orderType.ts fields array:
defineField({
  name: "timeline",
  title: "Order Timeline",
  type: "array",
  readOnly: true,
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        { name: "timestamp", type: "datetime", title: "When" },
        { name: "status", type: "string", title: "Status" },
        { name: "previousStatus", type: "string", title: "Previous Status" },
        { name: "actor", type: "string", title: "Who" },
        { name: "actorType", type: "string", title: "Actor Type", description: "system|admin|packer|customer" },
        { name: "note", type: "text", title: "Note" },
      ],
    }),
  ],
}),
```

### 3. Align Status Values with FSM Design
```typescript
// Replace existing status options with:
options: {
  list: [
    // Phase 1: Payment
    { title: "Created Unpaid", value: "created_unpaid" },
    { title: "Payment Failed", value: "payment_failed" },
    { title: "Paid Confirmed", value: "paid_confirmed" },
    // Phase 2: Warehouse
    { title: "To Pack", value: "to_pack" },
    { title: "Packing Locked", value: "packing_locked" },
    { title: "Packed Label Generated", value: "packed_label_generated" },
    { title: "Shipped In Transit", value: "shipped_in_transit" },
    { title: "Delivered", value: "delivered_success" },
    // Phase 3: Holds
    { title: "Hold: Inventory Missing", value: "hold_inventory_missing" },
    { title: "Hold: Address Invalid", value: "hold_address_invalid" },
    { title: "Hold: Customer Choice", value: "hold_waiting_customer_choice" },
    { title: "Hold: Payment Balance", value: "hold_waiting_payment_balance" },
    // Phase 4: Cancellation
    { title: "Cancelled: Pending Unpack", value: "cancelled_pending_unpack" },
    { title: "Cancelled: Restocked", value: "cancelled_restocked" },
    { title: "Refunded: No Restock", value: "refunded_no_restock" },
    // Phase 5: Returns
    { title: "Return Requested", value: "return_requested" },
    { title: "Return: Pending Inspection", value: "return_received_pending_inspection" },
    { title: "Returned: Restocked", value: "returned_restocked" },
    { title: "Returned: Discarded", value: "returned_discarded" },
    // Meta
    { title: "Completed", value: "completed" },
  ],
},
initialValue: "created_unpaid",
```

### 4. Create userProfile Schema Type
```typescript
// sanity/schemaTypes/userProfileType.ts
import { defineType, defineField } from "sanity";

export const userProfileType = defineType({
  name: "userProfile",
  title: "User Profile",
  type: "document",
  fields: [
    defineField({ name: "clerkId", type: "string", title: "Clerk User ID", validation: r => r.required() }),
    defineField({ name: "displayName", type: "string", title: "Display Name" }),
    defineField({
      name: "primaryAddress",
      type: "object",
      title: "Primary Address",
      fields: [
        { name: "streetAddress", type: "string", title: "Street" },
        { name: "city", type: "string", title: "City" },
        { name: "state", type: "string", title: "State" },
        { name: "postalCode", type: "string", title: "Postal Code" },
        { name: "country", type: "string", title: "Country" },
      ],
    }),
    defineField({
      name: "preferences",
      type: "object",
      title: "Preferences",
      fields: [
        { name: "receiveMarketingEmails", type: "boolean", title: "Marketing Emails" },
        { name: "darkMode", type: "boolean", title: "Dark Mode" },
        { name: "savePaymentInfo", type: "boolean", title: "Save Payment Info" },
      ],
    }),
    defineField({ name: "createdAt", type: "datetime", title: "Created" }),
    defineField({ name: "updatedAt", type: "datetime", title: "Updated" }),
  ],
});
```

---

## API Specifications

### 1. Order Status Update (Server Action)
```typescript
// app/actions/orders/updateOrderStatus.ts
"use server";
// Input: { orderId: string, newStatus: OrderStatus, actor: string, actorType: string, note?: string }
// Validation: FSM transition check, auth check (admin role)
// Output: { success: boolean, order?: Order, error?: string }
// Side effects: Append timeline entry, trigger Inngest event
```

### 2. Get User Orders (Server Action)
```typescript
// app/actions/orders/getOrdersByUserId.ts
"use server";
// Input: { page?: number, limit?: number }
// Auth: Clerk auth() → userId
// Query: *[_type == "order" && clerkUserId == $userId] | order(dates.orderedAt desc) [$start...$end]
// Output: { orders: Order[], total: number, page: number }
```

### 3. Cancel Order (Server Action)
```typescript
// app/actions/orders/cancelOrder.ts
"use server";
// Input: { orderId: string, reason: string }
// Auth: Clerk userId must match order.clerkUserId
// Validation: FSM allows cancellation from current status
// Side effects: Stripe refund, stock release, email, timeline
// Output: { success: boolean, error?: string }
```

### 4. Process Refund (Server Action)
```typescript
// app/actions/orders/processRefund.ts
"use server";
// Input: { orderId: string, amount?: number (partial), reason: string }
// Auth: Admin role required
// Action: stripe.refunds.create({ payment_intent, amount })
// Side effects: Update order status, timeline, send email
// Output: { success: boolean, refundId?: string, error?: string }
```

---

## FSM Transition Map Specification

```typescript
// lib/orders/fsm.ts
export const VALID_TRANSITIONS: Record<string, string[]> = {
  // Payment phase
  created_unpaid: ["paid_confirmed", "payment_failed"],
  payment_failed: ["paid_confirmed", "created_unpaid"],
  
  // Forward pipe
  paid_confirmed: ["to_pack"],
  to_pack: ["packing_locked", "hold_inventory_missing", "hold_address_invalid", "cancelled_pending_unpack", "refunded_no_restock"],
  packing_locked: ["packed_label_generated", "hold_inventory_missing", "to_pack"],
  packed_label_generated: ["shipped_in_transit"],
  shipped_in_transit: ["delivered_success", "hold_address_invalid"],
  delivered_success: ["completed", "return_requested"],
  
  // Holds
  hold_inventory_missing: ["to_pack", "hold_waiting_customer_choice", "cancelled_pending_unpack"],
  hold_address_invalid: ["to_pack", "cancelled_pending_unpack"],
  hold_waiting_customer_choice: ["to_pack", "cancelled_pending_unpack"],
  hold_waiting_payment_balance: ["paid_confirmed", "cancelled_pending_unpack"],
  
  // Cancellation
  cancelled_pending_unpack: ["cancelled_restocked"],
  cancelled_restocked: [], // Dead state
  refunded_no_restock: [], // Dead state
  
  // Returns
  return_requested: ["return_received_pending_inspection"],
  return_received_pending_inspection: ["returned_restocked", "returned_discarded"],
  returned_restocked: [], // Dead state
  returned_discarded: [], // Dead state
  
  // Meta
  completed: ["return_requested"],
};
```

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Webhook creates orders idempotently | `route.ts:74-82` checks existing order | Code review — BUT CDN caching breaks it |
| Order schema is comprehensive | `orderType.ts` — 479 lines, items/address/pricing/payment/returns | Code review ✅ |
| Stripe signature verification works | `route.ts:24-27` uses `stripe.webhooks.constructEvent` | Code review ✅ |
| Amount verification exists | `route.ts:88-98` compares calculated vs session total | Code review ✅ |
| Stock finalization is transactional | `route.ts:214-226` uses `checkoutClient.transaction()` | Code review ✅ |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Idempotency works" | `backendClient.useCdn: true` means stale reads | **Modified** — works after CDN invalidation (~60s), fails within window |
| "Order schema is registered" | Not in `schemaTypes/index.ts` | **Abandoned** — schema exists but is not active in Sanity |
| "FSM is implemented" | Only design doc exists, no code enforcement | **Abandoned** — flat dropdown only |
| "User can see orders" | Zero order history code | **Abandoned** — confirmed non-existent |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Stripe API patterns | Medium | 2026-07 (API version changes) |
| FSM design | Low | Stable architectural pattern |
| Next.js 15 patterns | Medium | 2026-07 (framework evolution) |
| Inngest integration | High | 2026-06 (new dependency, may have breaking changes) |

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | High | Well-established e-commerce patterns |
| Code Fundamentals | High | Direct codebase analysis, every file read |
| Gap Analysis | High | Systematic comparison of design docs vs implementation |
| Implementation Roadmap | Medium | Sequencing is sound but time estimates are approximate |
| FSM Specification | High | Based on project's own ORDER_MANAGEMENT_SYSTEM.md |

---

## Synthesis: Actionable Takeaways

### For This Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Fix CDN client for orders IMMEDIATELY | Duplicate orders = financial liability | Create `orderClient` with `useCdn: false` |
| Register schemas before any new work | Unregistered schemas = no Studio, no validation | Add orderType + userProfileType to index.ts |
| FSM enforcement is non-negotiable | Unvalidated state transitions = data corruption | Create `lib/orders/fsm.ts` before admin UI |
| Inngest before email | Background processing prevents webhook timeouts | Install Inngest, move webhook processing async |
| User order history before admin UI | Customer-facing value > internal tooling | Build /account/orders first |

### Priority Sequence
1. **Foundation** (Phase 1): Schema registration, CDN fix, access control, async_payment — **1 day**
2. **FSM + State** (Phase 2): Transition map, timeline, status update action — **1 day**
3. **User Orders** (Phase 3): Order history page, order detail — **1 day**
4. **Async + Email** (Phase 4): Inngest, webhook refactor, email templates — **2 days**
5. **Admin UI** (Phase 5): Manager + Packer dashboards — **2 days**
6. **Robustness** (Phase 6): Refunds, reconciliation, cleanup — **2 days**

### Open Questions
1. Should existing orders with simplified status values be migrated to new FSM states?
2. Is Sanity the long-term order store or should we plan for Postgres migration?
3. What email provider preference? (Resend recommended for Next.js ecosystem)
4. Should guest orders be linkable to accounts created later?
