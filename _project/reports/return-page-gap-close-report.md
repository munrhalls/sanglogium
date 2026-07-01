# Return Page — Gap-Close Report

**Scope:** Return handler (`/api/checkout/return`), Success page (`/checkout/success`), Order creation, Webhook fallback. Data + functionality layers only. PL happy path.

**Method:** Trace every file in the return flow, compare against should-be spec field-by-field, line-by-line. Identify every gap. Determine system-aligned close.

---

## Gap 1 — CRITICAL: `completedPaymentIntentId` Never Set on PI Retrieve Failure

**What the should-be says:**
> "If retrieve throws: log error; **set `completedPaymentIntentId`**; redirect to `/checkout/success?payment_intent=<id>&error=verification_failed`"

**What the code does:**
```ts
@/app/api/checkout/return/route.ts:28-50
  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>>;
  try {
    pi = await retrievePaymentIntent(payment_intent);
    // ...
  } catch (err) {
    // ...
    redirect(`/checkout/success?payment_intent=${payment_intent}&error=verification_failed`);
  }

  // Step 1: set completedPaymentIntentId ALWAYS, regardless of status
  session.completedPaymentIntentId = pi.id;  // ← AFTER try/catch
```

On `retrievePaymentIntent` failure, `pi` is never assigned. `session.completedPaymentIntentId` is never set.

**Impact:**
- Success page privacy guard (`session.completedPaymentIntentId !== payment_intent`) evaluates `undefined !== "pi_xxx"` → `true`.
- User is redirected to `/basket` instead of the "We couldn't verify your payment status" recovery UI.
- The `error === 'verification_failed'` branch in `app/checkout/success/page.tsx:53-76` is **dead code** — unreachable in any real flow.

**Root cause:** Assignment of `completedPaymentIntentId` is placed after the try/catch that can fail.

**System-aligned close:**
Move the assignment to the URL param value (`payment_intent`) into the catch block **before** the redirect:
```ts
} catch (err) {
  session.completedPaymentIntentId = payment_intent;  // add this
  await session.save();                               // add this
  redirect(`/checkout/success?payment_intent=${payment_intent}&error=verification_failed`);
}
```
Why the URL param value? Because `pi.id` is unavailable — the Stripe API call failed. The URL param is the best available identifier. It matches what the success page will compare against.

**Coherence check:** Rule 2 from should-be: "`completedPaymentIntentId` must always be written before any redirect from the return handler." This gap violates that rule.

---

## Gap 2 — MEDIUM: Return Handler Never Verifies `session.paymentIntentId` Against Incoming Param

**What the should-be says:**
> "**Reads (for verification):** `session.paymentIntentId` — to match against the incoming `payment_intent` param"

**What the code does:**
```ts
@/app/api/checkout/return/route.ts:16-19
  if (!payment_intent) {
    redirect("/basket?error=missing_intent");
  }
  // No check of session.paymentIntentId
```

The return handler never compares `session.paymentIntentId` to the incoming `payment_intent`.

**Impact:**
- Low direct impact. The success page's `completedPaymentIntentId` guard prevents unauthorized access.
- However, defense-in-depth is weakened. A user with a valid checkout session (any `paymentIntentId` in their session) could be redirected with a crafted `payment_intent` param and would pass the return handler. They'd fail at the success page, but the extra hop is unnecessary noise.
- More importantly: **the should-be explicitly states this verification exists.** If the spec was written to prevent a specific attack vector, the absence is a security gap.

**System-aligned close:**
Add verification after the missing-intent guard:
```ts
if (session.paymentIntentId && session.paymentIntentId !== payment_intent) {
  await logCheckoutEvent({ ...event: 'return_handler_intent_mismatch' ... });
  redirect("/basket?error=intent_mismatch");
}
```

**Coherence check:** This aligns with the 4-layer architecture's "Security checkpoint" principle for Server Components/routes.

---

## Gap 3 — SPEC DRIFT: Env Var `SANITY_WRITE_TOKEN` Does Not Exist in Codebase

**What the should-be says:**
> "`SANITY_WRITE_TOKEN` — Authenticated Sanity write for order creation and stock decrement"

**What the code uses:**
- `SANITY_STUDIO_READ_WRITE` — `sanity-cms/lib/backendClient.ts:9`
- `SANITY_API_TOKEN` — `sanity-cms/lib/checkoutClient.ts`
- `SANITY_STUDIO_READ_WRITE_CREATE` — mentioned in `sanity-cms/lib/client.ts:25` as fallback, but **verified expired/invalid** (see memory: SANITY_STUDIO_READ_WRITE_CREATE token in .env is invalid/expired)

**Impact:**
- **No runtime impact.** The correct token (`SANITY_STUDIO_READ_WRITE`) is used and verified to have create/delete permissions.
- Documentation/spec drift causes confusion for operators and future developers.

**System-aligned close:**
Update should-be spec to use the actual env var names:
- `SANITY_STUDIO_READ_WRITE` — for backend write operations (order creation, stock decrement)
- `SANITY_API_TOKEN` — for checkout-specific write operations
- Remove `SANITY_WRITE_TOKEN` from the spec entirely.

---

## Gap 4 — SPEC DRIFT: OrderItem Field Names in Spec Don't Match Schema/Code

**What the should-be says:**
> OrderItem shape: `productId`, `name`, `quantity`, `unitPrice`, `lineTotal`

**What the schema defines:**
```ts
@/sanity-cms/schemaTypes/orderType.ts:79-145
  productId: "string"
  name: "string"
  price: "number"   // ← not "unitPrice"
  quantity: "number"
  subtotal: "number" // ← not "lineTotal"
```

**What `createOrderFromPaymentIntent` creates:**
```ts
@/lib/checkout/createOrderFromPaymentIntent.ts:76-87
  return {
    productId: item.productId,
    name: product?.name ?? item.productId,
    quantity: item.quantity,
    price,            // ← not "unitPrice"
    subtotal: price * item.quantity,  // ← not "lineTotal"
    returnStatus: 'none' as const,
  }
```

**Impact:**
- No runtime impact. Code and schema are internally consistent.
- Spec drift causes confusion when reading code or writing queries against the schema.
- `fetchOrderByPaymentIntentId` query uses `price` and `subtotal` — matching the schema.

**System-aligned close:**
Update should-be spec OrderItem shape to:
```
productId, name, quantity, price, subtotal
```

---

## Gap 5 — SPEC DRIFT: `shippingMethod` Shape in Spec Doesn't Match Schema/Code

**What the should-be says:**
> `{ code, cost, methodName, carrier, estimatedDays }`

**What the schema defines:**
```ts
@/sanity-cms/schemaTypes/orderType.ts:266-277
  shippingMethod: {
    name: "string"
    price: "number"   // ← not "cost"
    estimatedDays: "number"
    carrier: "string"
    trackingNumber: "string"
    trackingUrl: "url"
  }
```

**What `createOrderFromPaymentIntent` creates:**
```ts
@/lib/checkout/createOrderFromPaymentIntent.ts:90-95
  const shippingMethod = shippingMethodName ? {
    name: shippingMethodName,       // ← not "methodName"
    carrier: shippingCarrier || shippingCode,
    price: parseInt(shippingCostStr, 10) || 0,  // ← not "cost"
    estimatedDays: parseInt(shippingEstimatedDaysStr, 10) || undefined,
  } : undefined
```

**Impact:**
- No runtime impact. Code and schema are internally consistent.
- Spec drift. No `code` or `cost` field exists anywhere.

**System-aligned close:**
Update should-be spec `shippingMethod` shape to:
```
{ name, price, carrier, estimatedDays }
```

---

## Gap 6 — DEAD CODE: `addOrder.ts` / `createOrder` Function Is Never Called

**What exists:**
```ts
@/sanity-cms/lib/orders/addOrder.ts
export async function createOrder(options: CreateOrderOptions): Promise<CreateOrderResponse>
export const addOrder = createOrder;
```

**What the return flow actually uses:**
```ts
@/lib/checkout/createOrderFromPaymentIntent.ts
export async function createOrderFromPaymentIntent(pi: Stripe.PaymentIntent): Promise<void>
```

**Verification:**
Grep for all imports/calls of `addOrder`, `createOrder` (the one from `addOrder.ts`): **zero results** across the entire codebase.

**Impact:**
- `addOrder.ts` sets `status: "pending_payment"` while `createOrderFromPaymentIntent` sets `status: "processing"`.
- If someone accidentally imports and calls `addOrder` in the future, they'd create orders with wrong status and without the PI-metadata-driven data flow.
- File clutter. Mental overhead.

**System-aligned close:**
Delete `sanity-cms/lib/orders/addOrder.ts`. It is orphaned. The return flow's canonical order creation is `createOrderFromPaymentIntent`. If the `addOrder` API is needed for admin/manual order creation, it should be rebuilt to use the same `createOrderFromPaymentIntent` pattern or explicitly documented as a separate concern.

---

## Gap 7 — MINOR: Schema `status` initialValue Is `"pending_payment"` But Code Always Sets `"processing"`

**What the schema says:**
```ts
@/sanity-cms/schemaTypes/orderType.ts:339
  initialValue: "pending_payment",
```

**What `createOrderFromPaymentIntent` sets:**
```ts
@/lib/checkout/createOrderFromPaymentIntent.ts:150
  status: 'processing' as const,
```

**Impact:**
- None at runtime. Code always overrides the schema default.
- The should-be spec correctly says `"processing"`.
- If someone creates an order document manually via Sanity Studio (without the code path), it would default to `"pending_payment"`.

**System-aligned close:**
Update schema `initialValue` from `"pending_payment"` to `"processing"` to match the should-be spec and the actual code behavior. This ensures consistency even for manual/admin-created orders.

---

## Verified Alignments (No Gaps)

These areas match the should-be spec exactly:

1. **Double verification** — Return handler verifies PI, success page verifies again. ✅
2. **`completedPaymentIntentId` always written on success paths** — Before any redirect from return handler on non-error paths. ✅
3. **Order creation failure is non-blocking in return handler** — Caught, logged, redirect proceeds. Webhook is fallback. ✅
4. **Webhook returns 500 on order creation failure** — Triggers Stripe retry. ✅
5. **Stock decrement inside idempotency-guarded function** — `createOrderFromPaymentIntent` checks for existing order first, then decrements. ✅
6. **OrderDetails fallback for webhook lag** — Renders "Generating your order receipt…" with refresh button. No polling timer. ✅
7. **PI metadata is order source of truth** — Basket, address, shipping all from PI metadata. ✅
8. **Order number format** — `ORD-YYYY-NNNN`, 4-digit zero-padded, count-based within year. ✅
9. **`isGuest: true` hardcoded** — No auth-linked order history. ✅
10. **Success page branches** — All 6 branches present: succeeded, failed, canceled, processing, verification_failed, unexpected. ✅
11. **Payment method hint derivation** — Matches spec exactly (BLIK, Przelewy24, Apple Pay, Google Pay, card brand+last4). ✅
12. **`redirect_status` not trusted** — Return handler never reads it from query params. ✅ (Even safer than spec)
13. **Session writes per PI status** — Match spec table exactly for all 4 statuses. ✅
14. **`retrievePaymentIntent` uses `expand: ['latest_charge']`** — ✅
15. **`fetchOrderByPaymentIntentId` uses read client, CDN, no token** — ✅
16. **Idempotency query** — Checks for existing order by `paymentIntentId` before creating. ✅
17. **Order creation logs every step** — `logCheckoutEvent` at every step. ✅
18. **Event logger is console-only, gated by `LOG_LEVEL`** — ✅
19. **Iron-session config** — `checkout_session` cookie, 1 hour, httpOnly, lax, secure in production. ✅
20. **No `clientSecret` or card details logged** — ✅

---

## Summary Table

| # | Gap | Severity | Close Action | File to Edit |
|---|-----|----------|--------------|--------------|
| 1 | `completedPaymentIntentId` not set on PI retrieve failure | **CRITICAL** | Set `session.completedPaymentIntentId = payment_intent` and `await session.save()` in catch block before redirect | `app/api/checkout/return/route.ts` |
| 2 | `session.paymentIntentId` not verified against incoming param | MEDIUM | Add `if (session.paymentIntentId && session.paymentIntentId !== payment_intent)` guard | `app/api/checkout/return/route.ts` |
| 3 | Env var `SANITY_WRITE_TOKEN` doesn't exist | SPEC DRIFT | Update spec to `SANITY_STUDIO_READ_WRITE` | Should-be spec only |
| 4 | OrderItem fields: `unitPrice`/`lineTotal` vs `price`/`subtotal` | SPEC DRIFT | Update spec to `price`/`subtotal` | Should-be spec only |
| 5 | `shippingMethod` shape mismatch | SPEC DRIFT | Update spec to `{ name, price, carrier, estimatedDays }` | Should-be spec only |
| 6 | `addOrder.ts` orphaned, never called | DEAD CODE | Delete `sanity-cms/lib/orders/addOrder.ts` | `sanity-cms/lib/orders/addOrder.ts` |
| 7 | Schema `status` initialValue `"pending_payment"` vs code `"processing"` | MINOR | Change `initialValue` to `"processing"` | `sanity-cms/schemaTypes/orderType.ts` |

---

## Coherence Check

**System Coherence Rules from should-be, post-gap-close:**

1. **Double verification** — Unaffected. Still intact. ✅
2. **`completedPaymentIntentId` always written before redirect** — Gap 1 fixes the violation. After close: ✅
3. **Order creation failure non-blocking** — Unaffected. ✅
4. **Webhook returns 500 on failure** — Unaffected. ✅
5. **Stock decrement inside idempotency guard** — Unaffected. ✅
6. **OrderDetails fallback is valid transient state** — Unaffected. ✅
7. **PI metadata is source of truth** — Unaffected. ✅
8. **Order number format** — Unaffected. ✅
9. **`isGuest: true` hardcoded** — Unaffected. ✅

All rules pass after applying closes for gaps 1 and 2.
