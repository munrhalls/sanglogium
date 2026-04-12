# PaymentElement + Payment Intent Architecture Documentation
# =====================================================
# Created: 2026-04-11T21:15:00+02:00
# Status: Active Implementation
# Pattern: Custom Payment UI with Stripe PaymentElement
# Webhook Events: checkout.session.* (NOT payment_intent.*)

## Architecture Overview

### Core Pattern
**PaymentElement** (client-side) + **Embedded Checkout Session** (server-side)
- Client: Custom UI with Stripe React Elements
- Server: Creates Embedded Checkout session with `ui_mode: "embedded"`
- Webhook: Handles `checkout.session.*` events
- Return: `/checkout/return?session_id={CHECKOUT_SESSION_ID}`

### Key Components

#### 1. Client-Side Flow (`PaymentForm.tsx`)
```typescript
// Step 18: Validate form + collect wallets
const { error: submitError } = await elements.submit();

// Step 19: Confirm payment with Stripe
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  clientSecret: checkout.clientSecret!,
  confirmParams: {
    return_url: `${window.location.origin}/checkout/success`,
  },
  redirect: 'if_required',  // Keeps card payments in-app
});

// Step 20: Navigate to success page
router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
```

**Critical Details:**
- Uses `stripe.confirmPayment()` with `elements` (NOT `stripe.createPaymentIntent()`)
- `redirect: 'if_required'` prevents redirect for card payments
- Still navigates to `/checkout/success` with `payment_intent` param
- Client secret comes from Embedded Checkout session (see server flow)

#### 2. Server-Side Flow (`/api/checkout/route.ts`)
```typescript
// Creates Embedded Checkout session
session = await stripe.checkout.sessions.create({
  ui_mode: "embedded",
  line_items: lineItems,
  mode: "payment",
  return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
  metadata: {
    productsIntent: publicBasket
      .map((item) => `${item._id}:${item.quantity}`)
      .join(","),
    clerkUserId: user?.id || "guest",
  },
  expires_at: Math.floor(Date.now() / 1000) + 25 * 60,
});

// Returns client_secret for PaymentElement
return NextResponse.json({ client_secret: session.client_secret });
```

**Critical Details:**
- Creates Embedded Checkout session (`ui_mode: "embedded"`)
- Returns `client_secret` for PaymentElement to use
- Session expires in 25 minutes
- Metadata stores basket for order creation

#### 3. Webhook Flow (`/api/webhook/route.ts`)
```typescript
// Handles checkout.session.completed
async function handleCheckoutCompleted(sessionData: Stripe.Checkout.Session) {
  // Check for existing order (idempotency)
  const existingOrder = await backendClient.fetch(
    `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]{ _id, status }`,
    { sessionId: sessionData.id }
  );

  // Create order if doesn't exist
  const result = await createOrder(orderOptions);
  
  // Finalize stock (atomic transaction)
  await finalizeStock(productQuantities);
  
  // Mark order as paid
  await backendClient
    .patch(result.order._id)
    .set({ status: "paid" })
    .commit();
}
```

**Critical Details:**
- Handles `checkout.session.completed` (NOT `payment_intent.succeeded`)
- Creates order from session metadata
- Finalizes stock in transaction
- Updates order status to "paid"

## Data Flow Sequence

```
1. Client: Basket ready + Address confirmed
   -> POST /api/checkout with basket

2. Server: Reserve stock + Create Embedded Checkout session
   <- Return { client_secret }

3. Client: PaymentForm mounts with PaymentElement
   -> User submits payment

4. Client: stripe.confirmPayment() with elements
   <- Returns paymentIntent

5. Client: Navigate to /checkout/success?payment_intent=pi_xxx
   -> Display success page

6. Stripe: Sends checkout.session.completed webhook
   -> Server creates order + finalizes stock
```

## State Machine Integration

### Entry State C-2 (Payment)
- **Requirement**: Basket non-empty AND address status === "ACCEPT"
- **Current**: Handled by client-side navigation guards

### Exit State C-2 (Payment Complete)
- **Requirement**: Stripe session created OR PaymentIntent created
- **Current**: PaymentElement creates PaymentIntent within Embedded Checkout session

### Critical Invariants
1. **Stock Reservation**: Happens BEFORE Stripe session creation (L164-168 in route.ts)
2. **Atomic Stock Finalization**: Uses Sanity transaction (L283-298 in webhook)
3. **Idempotency**: Checks for existing order before creating (L83-109 in webhook)
4. **reservedStock >= 0**: Safe decrement prevents negatives (L254-255, L289-290 in webhook)

## Security Implementation

### SG-01: Non-Atomic Order+Stock (FIXED)
- **Before**: Order creation and stock finalization were separate
- **After**: Stock finalized in transaction before order marked "paid"
- **Location**: Lines 196-210 in webhook

### SG-02: reservedStock Negativity Guard (FIXED)
- **Implementation**: `Math.min(item.quantity, currentReservedStock)`
- **Location**: Lines 254-255 and 289-290 in webhook
- **Prevents**: reservedStock going negative on race conditions

### SG-03: JWT Dev-Secret Fallback (DOCUMENTED)
- **Location**: Lines 11-16 in webhook
- **Action**: Documented, requires env var setup

## Architecture Benefits

### 1. Full UI Control
- Custom payment form styling
- Express Checkout integration possible
- In-app payment flow (no redirects for cards)

### 2. PCI Compliance
- Sensitive data never touches server
- Stripe handles card data directly
- SAQ A-EP compliance level

### 3. Webhook Reliability
- Embedded Checkout sessions trigger reliable webhooks
- Session metadata contains all order data
- Idempotent order creation

## Architecture Tradeoffs

### 1. Implementation Complexity
- Requires client-side Stripe Elements
- Must handle both redirect and in-app flows
- Webhook handling required for order finalization

### 2. Express Checkout Requires Extra Work
- Must manually configure Apple Pay/Google Pay
- Need to handle wallet-specific flows
- Not built-in like Stripe Checkout

## Comparison with Alternative Patterns

| Pattern | Current Implementation | Webhook Events | UI Control | Express Checkout |
|---------|----------------------|----------------|------------|------------------|
| PaymentElement + Embedded Checkout | **ACTIVE** | checkout.session.* | Full | Manual |
| Stripe Checkout (Redirect) | Unused | checkout.session.* | Minimal | Built-in |
| PaymentElement + Direct PaymentIntent | Not implemented | payment_intent.* | Full | Manual |

## Migration Considerations

### Current State is Viable
- PaymentElement is actively used
- Embedded Checkout sessions work
- Webhook handling is implemented
- Stock atomicity is fixed

### No Immediate Migration Required
- Pattern is functional and secure
- Only missing Express Checkout UI
- Webhook events are consistent
- Architecture is sound

## Recommended Next Steps

1. **Add Express Checkout Element** to PaymentForm
2. **Configure Apple Pay/Google Pay** domains
3. **Add Express Checkout tests** to test suite
4. **Monitor webhook reliability** in production

## Conclusion

The PaymentElement + Embedded Checkout architecture is:
- **Secure**: PCI compliant with webhook verification
- **Atomic**: Stock reservations and finalization are atomic
- **Idempotent**: Duplicate webhooks handled safely
- **Extensible**: Can add Express Checkout without breaking changes

The dual pattern confusion (G-01) is resolved - PaymentElement is the chosen pattern and Embedded CheckoutForm.tsx should be removed.
