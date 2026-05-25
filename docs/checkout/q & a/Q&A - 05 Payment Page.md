# Q & A - CRITICAL Q'S ONLY INTELLIGENCE GATHERING - Payment Page

## Foundational Clarifications

**Q2: If guest: email capture location (address page or payment page)?**
- Status: ✅ RESOLVED
- Decision: ON PAYMENT PAGE
- Implementation: Payment form must capture email field for order confirmations and support
- Session impact: session.email added to CheckoutSession interface (not yet added to lib/session.ts - needs update)

**Q3: Itemized order summary before final payment button?**
- Status: ✅ RESOLVED
- Decision: YES. THAT SHOULD BE THERE. THIS IS PART OF CHECKOUT SYSTEM HAPPY PATH ONLY GUEST CHECKOUT ONLY TRACER
- Implementation: Payment page must display itemized order summary before payment button
- Purpose: Users verify what they're paying for before final payment (reduces chargebacks and support tickets)

---

# Centerpiece - The Payment Page: Stripe Payment Intent + Stripe Elements

## Session Requirements

When the user arrives at `/checkout/payment`, the encrypted iron-session cookie MUST contain:

- **basket:** `[{ id, quantity }]` (From Basket)
- **address:** `{ city, street, postalCode, ... }` (From Address)
- **shippingCode:** e.g., `"dpd"` (From Shipping)
- **shippingCost:** e.g., `1899` in cents (From Shipping)

---

## The 2026 Standard: The Payment Page Blueprint

The Payment Page in a Next.js 15 / Sanity v3 stack consists of two distinct layers working in tandem.

### Layer 1: Server Component (`/checkout/payment/page.tsx`)

**Step A: The Funnel Guards**
- Reads the iron-session cookie
- If `!session.address`, triggers `redirect("/checkout/address")`
- If `!session.shippingCost`, triggers `redirect("/checkout/shipping")`

**Step B: The Reality Check (Sanity)**
- Queries Sanity for the current price and stock using the IDs from `session.basket`
- Completely ignores parcelData because shipping is already locked
- If any item's stock is 0, triggers `redirect("/basket?error=out_of_stock")`

**Step C: The Master Calculation**
- Calculates the subtotal: `(Live Sanity Price * Session Quantity)`
- Calculates the Grand Total: `Subtotal + session.shippingCost`

**Step D: The Stripe Intent**
- Calls the Stripe Node.js SDK: `stripe.paymentIntents.create()`
- Passes the Grand Total and appends `session.address` directly into the Stripe shipping metadata
- This ensures Stripe's fraud detection and receipt generation have the verified address from Step 2

**Step E: The Handoff**
- Stripe returns a secure `client_secret`
- The Server Component passes this string down to Layer 2 as a React prop

---

### Layer 2: Client Component (`/checkout/payment/PaymentForm.client.tsx`)

This is a Client Component (`"use client"`). Its only job is to mount the secure Stripe iframe and handle the submit event.

**Step A: Mount Stripe Elements**
- Wraps its children in the Stripe `<Elements>` provider
- Initialized exclusively with the `client_secret` passed from Layer 1

**Step B: Render the UI**
- Renders Stripe's native `<PaymentElement />`
- This element automatically provides the UI for Blik, Apple Pay, or credit cards
- Crucially, it includes Stripe's native "Billing Address matches Shipping Address" checkbox
- You do not build billing address forms; Stripe handles it

**Step C: Execute Payment**
- The user clicks "Pay"
- The component calls `stripe.confirmPayment()`
- On success, the user is forcefully redirected by Stripe to `/checkout/return`

---

## The Lead Domino

Inside the `/checkout/payment/page.tsx` Server Component, write the strict if/else redirect guards that check for the existence of `session.address` and `session.shippingCost`.

By building the guards first, you ensure the funnel is mathematically locked. You can test this immediately by manually navigating to `/checkout/payment` in your browser with an empty session and watching the server bounce you back to the Address page. Once the guards hold, generating the Stripe Intent becomes a safely isolated operation.



## The "Bus Stop" Trace: The Checkout Funnel

What happens at each "bus stop" of checkout? Here is the exact technical execution of how data is persisted across your specific scope.

### Stop 4: The Payment Intent Page (Stripe)

**Action:** The Server Component for the payment page loads.

**How Data Moves:** The server reads the final `checkout_session` cookie. This is where the magic happens.

- The server queries Sanity using the basket IDs to get the true product prices.
- The server calculates the true shipping cost using the `shipping_id`.
- The server calculates the final total: (Products Total + Shipping).
- The server creates the Stripe PaymentIntent passing the final total and the address as metadata.

**Persistence:** The server passes the Stripe `client_secret` to the client. Stripe Elements mounts, and the transaction is securely locked in.

---
