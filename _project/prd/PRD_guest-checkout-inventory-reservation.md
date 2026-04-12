# PRD: Guest Checkout Client Basket -> Reserved Basket

# Scope
Solution design for invariant relationship between client basket, reserved basket, idempotent FIFO CMS create/delete requests queue for reserved basket, immutable client reserved basket state, ui, delete (rollback reserved basket) timeout. UX slice 1 - basket page, checkout ui interaction.

# Out of scope
Further checkout ux slices, payment intent, embedded react stripe elements, anything other that reservation and rollback solution design based on mapping invariant relationships.
Payment success - explicitly out of scope.

# Description
Clicking checkout sends client basket as payload to CMS checkout queue. CMS processes first request from queue fully, atomic. CMS returns reserved basket data with unique reservation token. UI is temporarily locked and processes reserved basket data onto immutable client state, which can be:
1) reserved basket fully available, user moved to next checkout slice
2) reserved basket had decrements based on available stock, user shown updates message and data in checkout panel with "Approve & Proceed" and "Cancel" buttons,
3) reserved basket has 0 available products in stock, user shown clear message.

Payment success (future PRD) will trigger reservation realize via Stripe webhook metadata passing to priority queue.

UI cancel button, reserved basket rollback timeout - both add reserved basket request to single CMS FIFO queue.

CMS FIFO queue: both cancel and rollback and any reserved basket request, whether new one to reserve or rollback, are processed in singular FIFO queue. Checkout UI temporarily blocked between request and response.

Client basket is 100% separate from reserved basket at all times, regardless of anything.

Reserved basket always reflects the latest, true state of CMS stock availability and price data based on stripePriceId check, on each of reserved basket products. Reserved basket is NEVER influenced by client basket in any way. Reserved basket immutable state is always pure reflection of latest CMS state and nothing more. Reserved basket is only acquired from CMS response.

Reserved basket request to queue should be idempotent up to 3 tries. CMS always processes first FIFO queue request until finished. After 3 tries, first request deleted from queue, error payload response.


# Core requirements - execution flow
- click checkout -> freeze checkout ui -> generate UUIDv4 idempotency key -> send client basket payload + idempotency key to CMS FIFO queue -> handle response with reservation token as reserved basket -> display proper 1 or 2 or 3 or 4 checkout ui based on reserved basket
- click cancel - generate UUIDv4 idempotency key -> send reservation token + idempotency key to CMS FIFO queue for rollback
- timeout - cancelled by external success signal (payment success PRD to plug in here), which generates UUIDv4 idempotency key -> sends reservation token + idempotency key to CMS PRIORITY queue to realize reserved basket - decrementing real stock counts on products  (priority queue processed before regular FIFO queue)

# Requirements
- Reserved basket persisted in localStorage via Zustand persist middleware for UX continuity
- CMS returns unique reservation token (UUID) on successful reservation, used for all rollback/realize requests
- Client generates UUIDv4 idempotency key for each request, CMS stores key with result for 24 hours
- Payment realize requests use separate priority queue processed before regular FIFO queue
- Stripe webhook passes reservation token via metadata for payment realize requests
- Webhook signature verification replaces authentication for payment realize requests
- Backend enforces one active operation per reservation token to prevent multi-tab race conditions
- CMS tracks reservation token state (FREE/RESERVING/ACTIVE/CANCELLING) with atomic transitions
- Rollback requests use exponential backoff: 1s base delay, 30s max delay, ±25% jitter, max 10 retries
- Circuit breaker opens after 5 consecutive failures, 30s cooldown, fails fast during open state
- Transient errors (network, timeout) trigger retry with backoff, non-transient errors fail immediately
- All UI enabled events have strict deduplication to prevent double requests on user spam clicks or any user-issued events

# Important
- zero cookies usage
- no guest JWT cookie or authentication of any kind

# DoD

## API & State Management
- [x] Click checkout button sends POST to CMS queue API with UUIDv4 idempotency key, response with reservation token saved to immutable reserved basket state
- [x] Zustand store mirrors create/delete operations exactly: saves on create, deletes on rollback
- [x] Document.cookie is never set, no Set-Cookie headers in responses
- [x] CMS generates unique reservation token (UUID) on successful reservation, stored with reserved basket
- [x] CMS stores idempotency key with response for 24 hours, returns cached response on duplicate keys
- [x] Stripe webhook signature verification validates payment realize requests without authentication

## UI Behavior
- [x] Checkout button disabled during CMS queue processing, re-enabled only if client basket modified after reserved basket created; cancel button remains available, sends rollback request on click
- [x] Clicking re-enabled checkout sends two separate atomic requests: rollback first, then new reservation request
- [x] All UI enabled events implement strict deduplication with 0 possibility of creating double requests on user spam clicks or any user-issued events

## UI States
- [x] UI state 1: Reserved basket fully available - user proceeds to next checkout slice automatically
- [x] UI state 2: Reserved basket has stock decrements - user shown updates with "Approve & Proceed" and "Cancel" buttons and "We've had to revise your basket based on latest inventory check." message.
- [x] UI state 3: Reserved basket has 0 available products - user shown clear out of stock message, "We apologize - these products are out of stock."
- [x] UI state 4: Network failure - user shown retry button with automatic retry up to 3 attempts
- [x] UI state 5: Operation in progress - user shown "Please wait, operation in progress in another tab" message when concurrent operation detected

## CMS Queue & Inventory
- [x] Cancel button sends reservation token to CMS queue for rollback, CMS restores product stock counts
- [x] Server-side 10-minute TTL triggers automatic rollback if not cancelled by external success signal (payment success PRD plug point)
- [x] CMS queue processes requests sequentially, second reservation fails if first reserved last item
- [x] CMS queue processes one request at a time using FIFO order
- [x]  Queue is implemented with Redis Streams (or BullMQ) for persistence, atomic processing, and priority support.
- [x] Priority queue processes payment realize requests before regular FIFO queue
- [x] Stripe webhook metadata passes reservation token for payment realize requests
- [x] Backend rejects concurrent operations on same reservation token with "operation_in_progress" error
- [x] CMS tracks reservation token state atomically to prevent multi-tab race conditions
- [x] CMS implements server-side 10-minute TTL on reservation token (Redis TTL) that automatically issues rollback if state remains ACTIVE
- [x] All queue operations are atomic within a single database transaction; reservation token state transitions guarded by DB-level locks
- [x] On idempotency key collision, CMS returns cached response only if request parameters exactly match original (parameter fingerprint validation)
- [x] All stock updates are performed via Redis + Sanity in a two-phase pattern: first atomically reserve in Redis (with lock), then patch Sanity. Queue processor uses Redis `WATCH` / `MULTI` for optimistic locking.
- [x] All stock updates are performed via Redis + Sanity in a two-phase pattern: first atomically reserve in Redis (with lock), then patch Sanity. Queue processor uses Redis `WATCH` / `MULTI` for optimistic locking.
+ [x] Product documents in Sanity use two fields: `stock` (total inventory) and `reservedStock` (currently reserved). `availableStock` is computed as `stock - reservedStock`.
+ [x] Reservation only increments `reservedStock` (never touches `stock`).
+ [x] Payment success (realize) decrements **both** `stock` and `reservedStock`.
+ [x] Rollback / timeout only decrements `reservedStock`.

## Retry Logic
- [x] Create requests retry up to 3 times with exponential backoff (1s base, ±25% jitter), after 3 failures return clear error to user
- [x] Delete (rollback) requests retry up to 10 times with exponential backoff (1s base, 30s max, ±25% jitter), log as stuck-reservation after max retries
- [x] Circuit breaker opens after 5 consecutive failures, returns "service_temporarily_unavailable", closes after 30s cooldown
- [x] Transient errors (network, timeout, 5xx) trigger retry with backoff, non-transient errors (4xx, invalid token) fail immediately
- [x] CMS validates request parameters match original when using same idempotency key