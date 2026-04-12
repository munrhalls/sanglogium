# Audit: Checkout Flow with Stripe Integration

## Research Scope Contract
- **Topic:** Professional checkout flow using React, Next.js 15, and Stripe Payment Intent / Embedded Checkout
- **First Principles:** 
  1. PCI compliance is non-negotiable — Stripe Elements/Embedded Checkout offload this burden
  2. Idempotency prevents double-charges and inventory issues
  3. Stock reservation must happen BEFORE payment intent creation
  4. Webhooks are the source of truth for payment status (client can lie)
- **Fundamentals:** Server Actions vs API Routes, PaymentIntent lifecycle, FSM state management, Redis stock reservations
- **Scope Boundary:** OUT — hosted checkout (redirect), subscription flows, multi-currency complexities
- **Target Audience:** Developer implementing/fixing checkout UX
- **Decay Risk:** Medium (Stripe APIs evolve, but core patterns stable)

---

## 1. End-State Delineation

### Current Implementation Overview

The codebase implements a **hybrid checkout approach** with two competing patterns:

**Pattern A: Custom Payment Element Flow (ACTIVE in `/checkout/payment`)**
```
[Basket] 
  → [Address Form] 
    → Server Action: reserveStock() 
      → Redis stock reservation + Stripe PaymentIntent creation
        → [/checkout/payment?sessionId=xxx]
          → PaymentElement form
            → stripe.confirmPayment()
              → [Success/Failure]
```

**Pattern B: Embedded Checkout Flow (EXISTS but UNUSED in `EmbeddedCheckoutForm.tsx`)**
```
[Basket]
  → [Embedded Checkout Modal]
    → /api/checkout creates Checkout Session
      → Stripe Embedded Checkout iframe
        → [Return URL handling]
```

### Target Professional Flow (2026 Best Practice)
```
[Basket Review Page]
  → [Shipping Address Collection + Method Selection]
    → Server Action: validateAndReserve()
      → Atomic stock reservation (Redis transaction)
        → Stripe PaymentIntent with shipping cost
          → [Payment Page with Express Checkout (Apple/Google Pay)]
            → Real-time validation + fraud signals
              → Webhook confirmation → Order creation
                → [Order Confirmation]
```

---

## 2. Spatial Architecture

### User Flow Groups

| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Basket Review | `/basket` | Review items, edit quantities, remove items | Address Entry |
| Address Entry | `/checkout/address` | Enter shipping details, validate address | Payment Setup |
| Payment | `/checkout/payment` | Enter card/wallet, confirm payment | Success/Failure |
| Post-Purchase | `/checkout/success` | Order confirmation, email receipt | Browse/Home |

### Component Hierarchy
```
CheckoutLayout (Server)
├── CheckoutProvider (Client Context)
│   ├── Address Page
│   │   └── AddressFormClient
│   │       └── AddressForm
│   │           └── [Form Fields]
│   ├── Payment Page (Server)
│   │   └── PaymentFormClient
│   │       └── StripePaymentForm
│   │           └── Elements (Stripe)
│   │               └── PaymentForm
│   │                   └── PaymentElement
│   └── Success/Return Pages
```

---

## 3. Gap Analysis (G-XX)

### G-01: DUAL PATTERN FRAGMENTATION
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Architecture | Two competing patterns (PaymentIntent + Embedded) | Single unified pattern | **CRITICAL** |
| Location | `EmbeddedCheckoutForm.tsx` + `PaymentForm.tsx` | One consistent flow | |
| Impact | Code maintenance burden, confused debugging | Clear single path | |

**Evidence:**
- `EmbeddedCheckoutForm.tsx:1` — Unused embedded checkout component
- `PaymentForm.tsx:1` — Active PaymentElement flow
- Both have different webhook expectations

---

### G-02: NO EXPRESS CHECKOUT (WALLET PAYMENTS)
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Apple/Google Pay | Missing | Integrated via PaymentElement | **HIGH** |
| Location | `PaymentForm.tsx` | Should auto-show if available | |
| Impact | Lower conversion, friction for mobile users | One-tap payment option | |

**Evidence:**
- `PaymentForm.tsx:91` — Only `<PaymentElement />`, no Express Checkout Element
- Stripe PaymentElement includes wallets automatically BUT requires `elements.submit()` pattern

---

### G-03: MISSING SHIPPING COST IN PAYMENTINTENT
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Shipping | Calculated after payment | Part of PaymentIntent amount | **HIGH** |
| Location | `reserveStock.ts:175` | Should include shipping calculation | |
| Impact | Price shock at payment, cart abandonment | Total transparency | |

**Evidence:**
```typescript
// reserveStock.ts:175-186
paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount,  // ONLY product total, no shipping
  currency: 'pln',
  // ... missing shipping calculation
})
```

---

### G-04: NO ADDRESS VALIDATION
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Address | Basic HTML5 validation | Stripe Address Element or validation API | **MEDIUM** |
| Location | `AddressForm.tsx:45-48` | Real-time validation | |
| Impact | Invalid addresses cause delivery issues | Verified deliverable addresses | |

**Evidence:**
- `AddressForm.tsx:112-167` — Raw HTML inputs, no verification
- No integration with address validation services

---

### G-05: WEBHOOK MISSING `CHECKOUT_SESSION` EVENTS
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Webhook Events | `payment_intent.*` only | Match implementation pattern | **MEDIUM** |
| Location | `app/api/webhooks/stripe/route.ts` | Consistent with flow choice | |
| Impact | If using Embedded Checkout, events won't fire | Proper event handling | |

**Evidence:**
- `app/api/webhooks/stripe/route.ts:157-206` — Only PaymentIntent events
- `app/api/webhook/route.ts:47-77` — Has Checkout Session events (unused?)

---

### G-06: NO PROGRESS INDICATOR / STEP UI
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Navigation | URL changes only | Visual step indicator (1-2-3) | **LOW** |
| Location | All checkout pages | Persistent header with progress | |
| Impact | User uncertainty about checkout progress | Confidence, lower abandonment | |

---

### G-07: NO ORDER REVIEW BEFORE PAYMENT
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Review Step | Basket → Address → Payment | Basket → Address → Review → Payment | **MEDIUM** |
| Location | Missing intermediate step | Final confirmation screen | |
| Impact | Users can't verify order before paying | Error prevention | |

---

### G-08: REDIS STOCK RACE CONDITION RISK
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Stock Check | Sequential loop with rollback | Atomic Lua script or transaction | **HIGH** |
| Location | `reserveStock.ts:125-147` | Redis transaction or Lua | |
| Impact | Race conditions under high load | Atomic guarantee | |

**Evidence:**
```typescript
// reserveStock.ts:125-147 — Non-atomic multi-item reservation
for (const item of request.basketData) {
  let currentStock = await redis.hget('product_stock', item._id);  // Race condition window
  // ... check and decrement
  await redis.hincrby('product_stock', item._id, -item.quantity);  // Another window
}
```

---

### G-09: NO PAYMENT RETRY MECHANISM
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| Failed Payment | Redirect to basket with error | Inline retry with reservation extension | **MEDIUM** |
| Location | `PaymentForm.tsx:63-66` | Preserve reservation, allow retry | |
| Impact | Lost sales on temporary failures | Recovery opportunity | |

---

### G-10: FSM STATE PERSISTENCE GAP
| Field | Current | Target | Severity |
|-------|---------|--------|----------|
| State | In-memory React state | Persisted to session/URL | **MEDIUM** |
| Location | `checkoutMachine.ts` | URL params or session storage | |
| Impact | Refresh = lost checkout progress | Resilient to refresh | |

---

## 4. RWD Strategy

| Component | Desktop (1280px) | Mobile (375px) | Implementation |
|-----------|------------------|----------------|----------------|
| Address Form | 2-column layout | Single column | `grid-cols-1 md:grid-cols-2` |
| Payment Form | Centered, max-w-md | Full width with padding | `max-w-md mx-auto` / `w-full px-4` |
| Success Page | Order details + summary stacked | Same, optimized spacing | Flexbox column |
| Express Checkout | Horizontal button row | Vertical stack | `flex-col md:flex-row` |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `reserveStock.ts` | Core payment logic | Add comprehensive tests before changes |
| `PaymentForm.tsx` | Active payment UI | Maintain `elements.submit()` pattern |
| `checkoutMachine.ts` | FSM state logic | Version state schema for migrations |
| `stripe/route.ts` | Webhook processing | Keep backward-compatible event handling |
| `basket/page.tsx` | Entry point | Ensure redirect params remain compatible |

---

## 6. Research Summary: Professional Patterns

### Verified Best Practices (2026)

| Pattern | Current Status | Recommendation |
|---------|---------------|----------------|
| **Embedded Checkout** | Exists but unused | Choose ONE: either full Embedded Checkout OR custom PaymentElement |
| **Server Actions** | Used in `reserveStock.ts` | ✅ Correct — prefer over API routes |
| **PaymentIntent** | Used | ✅ Correct for custom flows |
| **Express Checkout** | Missing | Add Express Checkout Element for wallets |
| **Address Element** | Not used | Consider Stripe Address Element for validation |
| **Idempotency Keys** | Implemented | ✅ Critical for retry safety |
| **Webhook Signature** | Verified | ✅ Security requirement |
| **Stock Reservation** | Implemented | Needs atomic transaction (G-08) |

### Recommended Architecture Decision

**Option A: Stripe Embedded Checkout (Simpler)**
- Use `EmbeddedCheckoutForm.tsx` pattern
- Stripe handles: UI, validation, wallets, tax, shipping
- You handle: stock reservation, order creation
- Best for: Standard e-commerce, quick implementation

**Option B: Custom PaymentElement (More Control)**
- Current pattern in `PaymentForm.tsx`
- You handle: UI, validation, shipping calculation
- Stripe handles: PCI compliance, payment processing
- Best for: Complex shipping rules, custom UX requirements

**Current state: Hybrid confusion. Pick one.**

---

## 7. Verification Commands

```bash
# Pre-sprint regression
npm run build

# Test stock reservation
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"publicBasket":[{"_id":"test","quantity":1}]}'

# Webhook testing (requires Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Manual verification flow
# 1. Add item to basket
# 2. Navigate to /checkout/address?sessionId=test&idempotencyKey=test
# 3. Submit address → verify stock reserved in Redis
# 4. Complete payment → verify order created in Sanity
```

---

## 8. Severity Summary

| Severity | Count | Items |
|----------|-------|-------|
| **CRITICAL** | 1 | G-01 (Dual Pattern) |
| **HIGH** | 3 | G-02 (Express Checkout), G-03 (Shipping Cost), G-08 (Race Condition) |
| **MEDIUM** | 4 | G-04 (Address Validation), G-05 (Webhook), G-07 (Order Review), G-09 (Retry), G-10 (FSM Persistence) |
| **LOW** | 1 | G-06 (Progress UI) |

**Recommended Priority:**
1. **Immediate:** G-01 (choose single pattern)
2. **Sprint 1:** G-08 (atomic stock), G-02 (Express Checkout)
3. **Sprint 2:** G-03 (shipping), G-07 (review step), G-04 (address validation)
