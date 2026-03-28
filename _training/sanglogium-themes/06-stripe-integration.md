# Theme 06: Stripe Integration & Payments

## SangLogium Context
Payments are handled via Stripe with embedded checkout sessions. Idempotency is guaranteed via Inngest to ensure exactly-once execution for critical operations like refunds. The architecture prioritizes security by keeping sensitive payment data server-side.

**Critical Files:**
- `app/(store)/checkout/payment/EmbeddedCheckoutForm.tsx` — Stripe embedded form
- `app/api/checkout/route.ts` — Checkout session creation
- `app/api/webhook/route.ts` — Stripe webhook handler
- `sanity/lib/stripe/` — Stripe client utilities
- `sanity/lib/orders/` — Order lifecycle integration

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at documentation. Binary pass/fail.

#### Stripe Fundamentals
- [ ] What is a Payment Intent vs a Checkout Session?
- [ ] What is the difference between "authorize" and "capture"?
- [ ] What are Stripe webhooks and why are they needed?
- [ ] What is idempotency and why does it matter for payments?
- [ ] What is PCI compliance and how does Stripe help?

#### Checkout Flow
- [ ] When is a Stripe Checkout Session created?
- [ ] Who creates it: client or server?
- [ ] What data is passed to Stripe during checkout creation?
- [ ] What happens after successful payment?
- [ ] What happens after failed payment?

#### Webhooks
- [ ] What webhook events does SangLogium listen for?
- [ ] Why verify webhook signatures?
- [ ] What happens if a webhook is missed or fails?
- [ ] How do you handle webhook retries?

#### Idempotency & Reliability
- [ ] What is the Inngest idempotency pattern?
- [ ] Why use background jobs for refunds?
- [ ] What happens if refund webhook fails?
- [ ] How do you ensure "exactly-once" execution?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Stripe Architecture Overview

**Key Concepts:**

1. **Payment Intent**
   - Lower-level API for custom payment flows
   - Direct control over authorize/capture
   - Requires more PCI compliance work

2. **Checkout Session**
   - Pre-built, hosted payment page
   - Stripe handles PCI compliance
   - SangLogium uses embedded version

3. **Webhooks**
   - Asynchronous events from Stripe
   - Essential for reliable state updates
   - Must verify signatures for security

**SangLogium Flow:**
```
1. Server creates Checkout Session
2. Client embeds Stripe form
3. Customer completes payment
4. Stripe redirects to success URL
5. Webhook confirms payment (async)
6. Order transitions to PAID_CONFIRMED
```

---

### Module 2: Secure Checkout Implementation

**Server-Side Session Creation:**
```typescript
// app/api/checkout/route.ts
export async function POST(request: Request) {
  const { items, shippingAddress } = await request.json();
  
  // 1. Validate cart (prices, availability)
  const validatedCart = await validateCart(items);
  
  // 2. Calculate totals
  const { subtotal, shipping, tax, total } = calculateTotals(validatedCart);
  
  // 3. Create order in Sanity (unpaid state)
  const order = await createOrder({
    items: validatedCart,
    shippingAddress,
    pricing: { subtotal, shipping, tax, total },
    status: 'CREATED_UNPAID'
  });
  
  // 4. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.price * 100, // Stripe uses cents
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: order._id, // Link Stripe session to our order
    },
    success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/checkout/cancel`,
  });
  
  return Response.json({ sessionId: session.id });
}
```

**Client-Side Embedding:**
```typescript
// EmbeddedCheckoutForm.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function EmbeddedCheckoutForm({ sessionId }: { sessionId: string }) {
  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: sessionId }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
```

**Key Security Principles:**
- Never create sessions client-side (price manipulation risk)
- Always validate cart on server before creating session
- Use metadata to link Stripe session to internal order

---

### Module 3: Webhook Handling

**Webhook Endpoint:**
```typescript
// app/api/webhook/route.ts
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  // 1. Verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }
  
  // 2. Handle event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

**Critical Events:**

| Event | When | Action |
|-------|------|--------|
| `checkout.session.completed` | Payment successful | Transition order to PAID_CONFIRMED |
| `payment_intent.payment_failed` | Card declined | Allow retry, notify customer |
| `charge.refunded` | Refund processed | Update order, restore inventory |
| `invoice.payment_failed` | Subscription payment fails | Notify customer, retry logic |

**Why Webhooks Matter:**
- Customer might close browser before redirect
- Webhook ensures order is updated even if redirect fails
- Source of truth for payment status

---

### Module 4: Idempotency with Inngest

**The Problem:**
```typescript
// Without idempotency:
async function processRefund(orderId: string) {
  // 1. Call Stripe to refund
  await stripe.refunds.create({ payment_intent: order.paymentIntentId });
  
  // 2. Update order status
  await updateOrderStatus(orderId, 'REFUNDED');
  
  // 3. Restore inventory
  await restoreInventory(order.items);
}
// If step 2 fails and we retry, customer gets double refund!
```

**The Solution (Inngest):**
```typescript
// Define idempotent job
export const processRefundJob = inngest.createFunction(
  { id: 'process-refund' },
  { event: 'order/refund-requested' },
  async ({ event, step }) => {
    const { orderId } = event.data;
    
    // 1. Idempotent Stripe refund
    const refund = await step.run('stripe-refund', async () => {
      return stripe.refunds.create(
        { payment_intent: order.paymentIntentId },
        { idempotencyKey: `refund-${orderId}` } // Stripe idempotency
      );
    });
    
    // 2. Update order (only runs if step 1 succeeded)
    await step.run('update-order', async () => {
      return updateOrderStatus(orderId, 'REFUNDED', { refundId: refund.id });
    });
    
    // 3. Restore inventory (only runs if step 2 succeeded)
    await step.run('restore-inventory', async () => {
      return restoreInventory(order.items);
    });
    
    return { success: true };
  }
);
```

**Idempotency Guarantees:**
1. **Stripe idempotency key:** Same key = same refund (no double-charge)
2. **Inngest step tracking:** Each step runs exactly once
3. **Automatic retries:** Failed steps retry with backoff
4. **Exactly-once semantics:** Whole job succeeds or fails atomically

---

## Layer 2: Integration Examination

### Integration Challenge 1: Complete Checkout Flow

**Scenario:** Implement end-to-end checkout

**Requirements:**
1. Server endpoint that creates Stripe session
2. Cart validation (prices match, items in stock)
3. Order creation in Sanity before Stripe
4. Webhook handling for completion
5. Order status transition on payment

**Flow:**
```
Customer → Server: Create checkout with cart
Server → Sanity: Create order (CREATED_UNPAID)
Server → Stripe: Create Checkout Session
Server → Customer: Return session ID
Customer → Stripe: Complete payment form
Stripe → Webhook: checkout.session.completed
Webhook → Sanity: Update order (PAID_CONFIRMED)
```

**Verification:**
- [ ] Prices cannot be manipulated client-side
- [ ] Order exists before payment attempt
- [ ] Webhook updates order even if redirect fails
- [ ] Failed payments allow retry
- [ ] Duplicate webhooks are idempotent

---

### Integration Challenge 2: Refund System

**Scenario:** Build the refund workflow

**Requirements:**
1. Trigger refund from admin UI
2. Idempotent Stripe refund (no double-charge)
3. Order status update
4. Inventory restoration
5. Customer notification

**States:**
- `REFUND_REQUESTED` → `REFUND_PROCESSING` → `REFUNDED`/`REFUND_FAILED`

**Constraints:**
- Must be idempotent (retry-safe)
- Must handle partial refunds
- Must restore inventory only on full refund
- Must notify customer of refund status

**Success Criteria:**
- [ ] Same refund request processed once
- [ ] Order reflects refund status
- [ ] Inventory updated correctly
- [ ] Customer receives confirmation
- [ ] Failed refunds are retryable

---

## Layer 3: Systems Examination

### Systems Challenge: Inventory Locking Strategy

**Scenario:** Prevent overselling during checkout

**The Problem:**
1. Customer A adds last widget to cart
2. Customer B adds same widget to cart
3. Both check out simultaneously
4. Both payments succeed
5. Only one widget exists = oversell

**Solution Options:**

**Option 1: Pessimistic Locking**
- Lock inventory when added to cart
- Expire lock after timeout
- Con: Locks held too long, abandoned carts lock inventory

**Option 2: Optimistic Locking**
- Check availability at checkout
- Reserve during payment
- Con: Race condition still possible

**Option 3: Authorization Pattern**
- Authorize payment (hold funds)
- Reserve inventory
- Capture payment after confirmation
- Con: More complex, requires Payment Intent API

**SangLogium's Approach:**
- Check availability at checkout creation
- Reserve inventory during payment window
- Release if payment not completed in 30 minutes

**Design Your Solution:**
1. Choose approach with justification
2. Define reservation/timeout mechanism
3. Handle edge cases (abandoned carts, failed payments)
4. Implement recovery for stuck reservations

---

## Stress Test Scenarios

### Scenario 1: Webhook Failure Cascade

**Given:**
- `checkout.session.completed` webhook fails
- Order stuck in `CREATED_UNPAID`
- Customer sees success page but no confirmation email
- Customer contacts support

**Investigation:**
1. Check webhook logs (Stripe dashboard)
2. Verify webhook endpoint responding
3. Check order status in Sanity
4. Identify why webhook failed

**Recovery:**
1. Manually verify payment in Stripe dashboard
2. Manually transition order to `PAID_CONFIRMED`
3. Replay webhook or trigger order processing
4. Send confirmation email manually

**Prevention:**
- Add webhook monitoring/alerting
- Implement dead letter queue
- Add manual recovery tool

---

### Scenario 2: Duplicate Refund Bug

**Given:**
- Customer requests refund
- Refund button clicked twice rapidly
- Two refund jobs created
- Customer receives double refund

**Root Cause:**
- No idempotency key on refund initiation
- Race condition between click and job creation

**Fix:**
- Add client-side debounce
- Use idempotency key based on order ID + timestamp
- Verify no pending refund before creating new one

---

## Quick Reference: Stripe Checklist

| Concern | Implementation |
|---------|---------------|
| Price security | Server-side session creation only |
| Cart validation | Validate on server before Stripe |
| Payment confirmation | Webhook as source of truth |
| Idempotency | Inngest jobs with idempotency keys |
| Error handling | Retry with exponential backoff |
| PCI compliance | Use Stripe Checkout ( Stripe handles it) |
| Testing | Stripe test mode + webhook testing |

---

## Completion Checklist

- [ ] Can explain Payment Intent vs Checkout Session
- [ ] Can implement secure server-side checkout
- [ ] Can handle Stripe webhooks with signature verification
- [ ] Can implement idempotent refund processing
- [ ] Can design inventory locking strategy
- [ ] Can debug webhook failures
- [ ] Can handle payment edge cases (failures, retries)

---

*Next: Theme 07 — Clerk Authentication*
