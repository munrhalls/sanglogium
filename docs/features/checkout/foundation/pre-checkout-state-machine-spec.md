# Pre-Checkout State Machine Specifications

**Version:** 2.0 (fixed)
**Scope:** The phase between the user clicking "Checkout" on the basket page and successful navigation to the Stripe hosted checkout URL.

---

## 1. Scope of Basket Processing

**Included operations and constraints:**

- **Idempotency:** All validation requests must include a unique idempotency key. The key is a UUIDv4 generated fresh on every `START_VALIDATION` call and stored in the machine's context. It is not derived from the basket ID. This ensures that retries reuse the same key (safe for network retries), while any new `START_VALIDATION` call — including after basket mutation — generates a new key, preventing stale cache hits on Stripe or the inventory service. See Section 4 for full key lifecycle rules.

- **Validation:** Checking basket line items against Sanity CMS for price matches and active inventory.

- **Reservation:** Soft-locking inventory for 15 minutes upon successful validation.

- **Lock Expiry (Out-of-Band):** Lock expiration is handled server-side via Inngest. It is the canonical safety net for abandoned locks. The client does not poll or manage lock TTL.

- **Timeout:** The client enforces a strict 10-second timeout on the `PROCESSING` state. The timer is owned by the state machine itself via an `AbortController` passed to the server action — not by a component `useEffect`. If the component unmounts during `PROCESSING`, the `AbortController` signal fires, the in-flight request is aborted, and the machine transitions to `ERROR_NETWORK` via the same `FAIL_NETWORK` path. See Section 6 for implementation notes.

- **Redirect responsibility:** The server action returns a Stripe URL. The client executes `window.location.assign(stripeUrl)` within `SUCCESS` state entry. The state machine does not perform a server-side `redirect()`.

---

## 2. States

| State | Description |
|---|---|
| **IDLE** | Baseline state. User is reviewing their basket. All interactive elements are enabled. |
| **PROCESSING** | System is validating basket contents, reserving inventory, and generating a Stripe session. A 10-second abort timer is active. |
| **ERROR_NETWORK** | Recoverable failure: timeout or 5xx reaching the validation server, CMS, or Stripe. |
| **ERROR_VALIDATION** | Recoverable failure: basket data is invalid — price mismatch or inventory shortage. Basket has not yet been corrected. |
| **SUCCESS** | Validation and reservation passed, Stripe URL received. Redirect is in progress. If redirect does not complete within 5 seconds, machine auto-transitions to `ERROR_NETWORK` via an internal `FAIL_REDIRECT` event. |

---

## 3. Events

| Event | Origin State(s) | Destination State | Side Effects / Notes |
|---|---|---|---|
| `START_VALIDATION` | `IDLE`, `ERROR_NETWORK` | `PROCESSING` | Generates and stores a fresh idempotency key in context. Starts 10-second abort timer. |
| `START_VALIDATION` | `ERROR_VALIDATION` | `PROCESSING` | **Guard required:** basket store must have been mutated (prices/quantities corrected) before this event fires. Generates a fresh idempotency key. See Section 7. |
| `FAIL_NETWORK` | `PROCESSING`, `SUCCESS` | `ERROR_NETWORK` | Triggered by 5xx, 10-second client abort, or 5-second redirect timeout. Clears idempotency key from context. |
| `FAIL_VALIDATION` | `PROCESSING` | `ERROR_VALIDATION` | Receives and stores discrepancy payload in context. Clears idempotency key from context. |
| `PASS_VALIDATION` | `PROCESSING` | `SUCCESS` | Receives and stores Stripe URL in context. Triggers `window.location.assign(stripeUrl)`. Starts 5-second redirect watchdog timer. |
| `RESET` | `ERROR_VALIDATION`, `ERROR_NETWORK` | `IDLE` | Clears discrepancy payload and idempotency key from context. No server call needed. |
| `RESET` | `SUCCESS` | `IDLE` | **Fire-and-forget** async call to release inventory lock. Transition to `IDLE` is not blocked by the outcome of this call. Inngest server-side expiry is the safety net if the call fails. Clears Stripe URL and idempotency key from context. |

### Why `SUCCESS` can still emit `FAIL_NETWORK`

`PASS_VALIDATION` triggers `window.location.assign()`. This is a client-side navigation — it can be silently blocked (pop-up blockers in some contexts, browser security policies, or a JS error thrown before the call executes). The 5-second watchdog timer catches this. If the user is still on the basket page after 5 seconds, the machine fires `FAIL_NETWORK` internally, which releases the inventory lock via the same path as a `RESET` from `SUCCESS` and surfaces an error the user can act on.

---

## 4. Idempotency Key Lifecycle

| Moment | Key Action | Reason |
|---|---|---|
| `START_VALIDATION` fires (from any origin) | Generate fresh UUIDv4; store in machine context | Guarantees each distinct checkout attempt is uniquely identified. Prevents stale cache hits after basket mutation. |
| Server action retried within same `PROCESSING` invocation (internal) | Reuse existing key from context | Safe retry semantics — server returns the same cached result. |
| `FAIL_NETWORK` or `FAIL_VALIDATION` received | Clear key from context | Force fresh key on next attempt. |
| `RESET` received | Clear key from context | Session is abandoned. |
| `PASS_VALIDATION` received | Retain key in context until `RESET` | Key may be needed to identify session for lock release. |

**Key is a UUIDv4, not the basket ID.** The basket ID is a stable identifier for the basket's contents. Using it as an idempotency key would cause a 15-minute cache collision if the user modifies the basket and retries. A per-attempt UUIDv4 removes this risk entirely. Stripe explicitly recommends this strategy for cases where the parameters of a request may change between attempts.

---

## 5. Data Processing and Payload Contracts

| Processing Operation | Server Result | Triggered Event | Resulting State |
|---|---|---|---|
| Sanity data fetch | 5xx or 10-second client abort | `FAIL_NETWORK` | `ERROR_NETWORK` |
| Sanity data fetch | 200 OK with price/stock mismatch | `FAIL_VALIDATION` | `ERROR_VALIDATION` |
| Inventory reservation | 400 (stock unavailable) | `FAIL_VALIDATION` | `ERROR_VALIDATION` |
| Inventory reservation | 200 OK | *(proceed to Stripe)* | `PROCESSING` |
| Stripe session create | 5xx or timeout | `FAIL_NETWORK` | `ERROR_NETWORK` |
| Stripe session create | 400 (invalid params — e.g., bad currency, missing line item) | `FAIL_VALIDATION` | `ERROR_VALIDATION` |
| Stripe session create | 200 OK with URL | `PASS_VALIDATION` | `SUCCESS` |

**Note on Stripe 400s:** A Stripe 400 indicates a content error in the session creation request — malformed line items, unsupported currency, or invalid metadata. This is not a transient error and retrying with the same parameters will produce the same failure. It is therefore treated as `FAIL_VALIDATION`, not `FAIL_NETWORK`. The discrepancy payload for this case uses `type: "STRIPE_CONFIG"` (see below). The user is shown a generic "something went wrong with your order" message and offered a path to contact support.

### Discrepancy Payload Contract (`FAIL_VALIDATION`)

```typescript
type DiscrepancyPayload =
  | {
      type: "INVENTORY";
      items: Array<{
        id: string;
        name: string;
        issue: string;          // Human-readable: "Only 2 left in stock"
        available: number;      // Required when type is INVENTORY
      }>;
    }
  | {
      type: "PRICE";
      items: Array<{
        id: string;
        name: string;
        issue: string;          // Human-readable: "Price changed"
        expected: number;       // Required when type is PRICE — price client had
        actual: number;         // Required when type is PRICE — current server price
      }>;
    }
  | {
      type: "STRIPE_CONFIG";
      items: Array<{
        id: string;
        issue: string;          // Generic message only; no price/quantity fields
      }>;
    };
```

`expected`/`actual` are not optional for `PRICE` type — they are required. `available` is not optional for `INVENTORY` type — it is required. The discriminated union enforces this at the type level. A single payload may only carry one `type`; if both price and inventory issues exist on the same validation pass, the server returns them as separate items within the appropriate single type, or splits them across two sequential responses if the validation pipeline is ordered (inventory first, then price).

---

## 6. Timeout and Abort Architecture

The 10-second processing timeout is owned by the server action call site, not by a React component effect.

**Implementation pattern:**

```typescript
// In the client-side machine action that invokes the server action:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10_000);

try {
  const result = await validateBasket(basketPayload, idempotencyKey, {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  // dispatch PASS_VALIDATION or FAIL_VALIDATION based on result
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === "AbortError") {
    // dispatch FAIL_NETWORK — timeout path
  } else {
    // dispatch FAIL_NETWORK — 5xx or other network path
  }
}
```

The `AbortController` is created at the point of the call, not stored in component state. If the component unmounts, the `setTimeout` fires naturally (it is not tied to the component lifecycle), the controller aborts the request, and the machine receives `FAIL_NETWORK`. The component is no longer mounted to render the error state, but the machine state is consistent and the basket store is not left in a locked limbo.

**Redirect watchdog (5-second):**

```typescript
// In the SUCCESS state entry action:
window.location.assign(stripeUrl);

const watchdogId = setTimeout(() => {
  // If we are still here after 5 seconds, the redirect did not complete.
  // Dispatch FAIL_NETWORK. This also triggers inventory lock release.
  dispatch({ type: "FAIL_NETWORK" });
}, 5_000);

// Store watchdogId in machine context so it can be cleared
// if RESET is dispatched manually before the watchdog fires.
```

---

## 7. "Accept & Continue" Precondition

The `START_VALIDATION` event from `ERROR_VALIDATION` is only valid after the basket store has been mutated to reflect the accepted discrepancies. This is a **guard condition**, not merely a UI convention.

**What "accepted" means by type:**

| Discrepancy type | Required basket mutation before `START_VALIDATION` |
|---|---|
| `PRICE` | Update the stored unit price for each affected item to the `actual` value from the payload. |
| `INVENTORY` | Remove or reduce quantity of each affected item to the `available` value from the payload. If `available` is 0, the item must be removed entirely. |
| `STRIPE_CONFIG` | No basket mutation is meaningful. User must be offered a path to contact support. `START_VALIDATION` should not be re-triggered for this type. |

The "Accept & Continue" button is responsible for:
1. Applying the mutations to the basket store.
2. Confirming all mutations succeeded.
3. Only then dispatching `START_VALIDATION`.

If the mutation step fails for any reason, the button must not dispatch `START_VALIDATION`.

**"Retry" vs "Accept & Continue" are distinct actions:**

- **"Retry"** is valid only from `ERROR_NETWORK`. It dispatches `START_VALIDATION` without any basket mutation. The basket has not changed; only the network conditions may have changed.
- **"Accept & Continue"** is valid only from `ERROR_VALIDATION`. It requires prior basket mutation as described above.

These two actions must not be presented to the user in each other's error state. The transition table in Section 3 reflects this distinction.

---

## 8. State to UI Presentation Mapping

| State | UI Presentation |
|---|---|
| **IDLE** | Standard basket view. All interactive elements enabled: quantity selectors, remove buttons, checkout button. |
| **PROCESSING** | Basket is fully locked. Spinner or "Processing..." text visible. Checkout button disabled. No interactive basket elements. |
| **ERROR_NETWORK** | "Connection failed" banner visible. A **"Retry"** button is the sole call to action. No basket editing while in this state — user must retry or manually navigate away. |
| **ERROR_VALIDATION** | "Your basket has been updated" banner. Exact inventory and/or price changes displayed (parsed from discrepancy payload). **"Accept & Continue"** and **"Update basket"** buttons visible. "Accept & Continue" is disabled until the basket store reflects the mutations. |
| **SUCCESS** | Basket locked. "Redirecting to payment..." message visible. No interactive elements. If redirect watchdog fires, transitions to `ERROR_NETWORK` and the lock release call is dispatched. |

---

## 9. Transition to Action Mapping

| Event | Triggering Action | Notes |
|---|---|---|
| `START_VALIDATION` | User clicks **"Checkout"** (from IDLE) | Fresh idempotency key generated. |
| `START_VALIDATION` | User clicks **"Retry"** (from ERROR_NETWORK only) | Fresh idempotency key generated. |
| `START_VALIDATION` | User clicks **"Accept & Continue"** (from ERROR_VALIDATION only) | Basket mutation must have completed first. Fresh idempotency key generated. |
| `FAIL_NETWORK` | Server action catches 5xx, `AbortError` from 10-second timeout, or 5-second redirect watchdog fires | Client-side only. Server action must not expose this event to the client from a 4xx. |
| `FAIL_VALIDATION` | Server action returns 400 with discrepancy payload, or Stripe returns 400 | Payload stored in machine context for UI rendering. |
| `PASS_VALIDATION` | Server action returns 200 with Stripe URL | Stripe URL stored in context. `window.location.assign()` called on state entry. |
| `RESET` | User clicks **"Update basket"** from `ERROR_VALIDATION` | Returns to IDLE for basket editing. No server call. |
| `RESET` | User clicks browser back from Stripe (cancel URL lands back on basket page) | Must be wired to fire `RESET` on page entry if machine is in `SUCCESS`. Triggers fire-and-forget lock release. |

### Cancel URL and back-navigation

The Stripe session must be created with a `cancel_url` pointing back to the basket page with a query parameter, e.g. `?checkout=cancelled`. When the basket page mounts and detects this parameter:

1. If machine state is `SUCCESS`, dispatch `RESET` (which triggers lock release and returns to `IDLE`).
2. Remove the query parameter from the URL to prevent re-triggering on subsequent renders.

This is the only reliable mechanism for detecting that the user returned from Stripe without completing payment.

---

## 10. Machine Context Shape

```typescript
interface PreCheckoutContext {
  idempotencyKey: string | null;       // UUIDv4; null when not in an active attempt
  stripeUrl: string | null;            // Set on PASS_VALIDATION; cleared on RESET
  discrepancy: DiscrepancyPayload | null; // Set on FAIL_VALIDATION; cleared on RESET
  redirectWatchdogId: number | null;   // setTimeout handle; set on SUCCESS entry; cleared on RESET or FAIL_NETWORK
}
```

All context fields are cleared on `RESET` from any origin. This ensures the machine returns to a fully clean initial state and no stale payload influences the next checkout attempt.
