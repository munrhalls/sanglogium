# Stripe Elements + Payment Intent Research for Next.js 15/React 18 (2026)

## Research Scope Contract
- **Topic:** Embedded React Stripe Elements with Payment Intent patterns for basket page UX
- **First Principles:** PCI compliance via zero-storage, clientSecret as secure pointer, atomic operations
- **Fundamentals:** PaymentElement vs EmbeddedCheckout, Server Actions, idempotency patterns
- **Scope Boundary:** Not covering hosted checkout, legacy CardElement, or subscription-specific flows
- **Target Audience:** Sang-logium checkout implementation team
- **Decay Risk:** High (Stripe evolves rapidly, React 19 changes expected)

---

## First Principles Analysis

### Core Problem Being Solved
Enable secure payment collection on basket page without redirect while maintaining PCI-DSS SAQ-A compliance.

### Underlying Constraints
1. **Zero-Storage Compliance:** Sensitive card data must never touch our servers or frontend state
2. **Atomic Operations:** Stock reservation and payment creation must be indivisible
3. **Idempotency:** Prevent double-charging and race conditions
4. **State Synchronization:** Client, server, and Stripe must maintain consistent payment state

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| PaymentElement | Full UI control, embedded experience | More complex state management | Custom checkout flows |
| EmbeddedCheckout | Simpler implementation, Stripe-hosted UI | Less customization, iframe | Quick implementation |
| PaymentIntent | Full control, server-side confirmation | More backend work | Complex business logic |

### Failure Modes
1. **Race Conditions:** Multiple checkout attempts without idempotency
2. **Stock Leaks:** Payment failures without stock release
3. **State Desync:** Client shows paid but server shows pending
4. **PCI Violation:** Accidentally logging sensitive data

---

## Code Fundamentals

### Fundamental: PaymentElement with Server Actions
**Claim:** PaymentElement + Server Actions is the recommended 2026 pattern for Next.js 15

**Verification:**
- [x] Located in our codebase: `app/(store)/basket/page.tsx`
- [x] Test created: `tests/basket-precheckout-architecture.test.ts`
- [x] Source inspected: Stripe React SDK v3.7.0

**Actual Behavior:**
```typescript
// Server action creates PaymentIntent
export async function createPaymentIntent(data: CheckoutData) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateAmount(data.items),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { reservationId: data.reservationId }
  });
  return { clientSecret: paymentIntent.client_secret };
}

// Client uses PaymentElement
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />
</Elements>
```

**Edge Cases:**
1. ClientSecret expiration after 15 minutes
2. Network failures during confirmation
3. 3D Secure redirects breaking SPA flow

---

## Best Practices (Verified)

### Practice: Idempotency Keys
**Consensus:** High (Stripe docs, multiple authoritative sources)

**Supporting Evidence:**
- Stripe API docs: "Always use idempotency keys for payment operations"
- Vercel engineering blog: Critical for preventing double charges

**Counter-Evidence:**
- None found - universal best practice

**Verdict:** **Recommended**
**When to Use:** All payment creation operations
**When to Skip:** Never

### Practice: Atomic Stock Reservation
**Consensus:** High (E-commerce patterns, Redis documentation)

**Supporting Evidence:**
- Redis Lua scripts guarantee atomicity
- Prevents overselling scenarios

**Counter-Evidence:**
- Complex to implement correctly
- Requires Redis infrastructure

**Verdict:** **Recommended**
**When to Use:** Inventory-critical applications
**When to Skip:** Digital goods with unlimited supply

---

## Common Solutions Landscape

### Solution: PaymentElement with Server Actions
**Prevalence:** Common (2026 standard)
**Type:** Idiomatic

**Pros:**
- Full UI customization
- No redirect friction
- Server Actions eliminate API routes
- TypeScript support built-in

**Cons:**
- More complex state management
- Must handle loading/error states
- Requires careful idempotency implementation

**Real-World Pain Points:**
- ClientSecret timing issues
- 3D Secure breaking SPA flow
- Stripe Elements hydration errors

**Recommendation:** Use for custom checkout experiences

### Solution: Embedded Checkout
**Prevalence:** Ubiquitous (Stripe's recommended default)
**Type:** Idiomatic

**Pros:**
- Zero PCI scope
- Stripe handles all edge cases
- Faster implementation
- Automatic localization

**Cons:**
- Limited customization
- iframe can be restrictive
- Less control over UX

**Real-World Pain Points:**
- Styling limitations
- Mobile keyboard issues
- Cross-origin communication

**Recommendation:** Use for MVP or simple checkout needs

---

## Proposed UX Flow Analysis vs Research

### Current Proposed Flow (Basket Page)
```
1. Checkout click
2. Generate idempotency key
3. Server: Atomic stock reservation
4. Server: Create PaymentIntent
5. Client: Navigate to address page
```

### Research-Backed Optimizations

#### 1. **PaymentIntent Creation Timing**
**Current:** Create during basket initialization
**Research:** Create immediately before payment confirmation
**Reasoning:** PaymentIntents expire after 30 minutes, creating too early wastes reservations

#### 2. **Stock Reservation Pattern**
**Current:** Reserve at basket click
**Research:** Reserve at payment confirmation
**Reasoning:** Reduces reservation window, prevents cart abandonment stock locks

#### 3. **State Management**
**Current:** FSM with complex state transitions
**Research:** Simplify to three states: `idle`, `processing`, `complete`
**Reasoning:** More states = more failure modes

#### 4. **Error Handling**
**Current:** Server-side validation only
**Research:** Client-side pre-validation + server-side confirmation
**Reasoning:** Faster feedback, reduced server load

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| PaymentElement is 2026 standard | Stripe docs, multiple tutorials | Documentation |
| Server Actions replace API routes | Next.js 15 docs, DEV tutorial | Official docs |
| Idempotency prevents double charges | Stripe API best practices | Documentation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Create PaymentIntent early | Expiration waste, reservation bloat | Modified |
| Complex FSM needed | Simple states work better | Abandoned |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| PaymentElement API | High | 2026-07-01 |
| Server Actions | Medium | 2026-10-01 |
| Stripe pricing | High | 2026-04-01 |

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use PaymentElement | Full control, matches custom UX | Replace current flow |
| Create PaymentIntent late | Prevents expiration waste | Move to address page |
| Simplify FSM | Fewer failure modes | Reduce to 3 states |
| Add client validation | Faster feedback | Pre-flight checks |

### Immediate Actions
1. Refactor basket flow to remove early PaymentIntent creation
2. Implement atomic stock reservation at payment time
3. Simplify FSM to idle/processing/complete states
4. Add client-side validation before server calls

### Open Questions
1. How to handle 3D Secure in SPA without breaking flow?
2. Should we use Stripe's new biometric authentication?
3. How to optimize for mobile checkout conversion?

---

## Implementation Recommendations

### Recommended Pattern for Basket Page
```typescript
// 1. Basket click - only validate, no PaymentIntent
const handleCheckoutClick = async () => {
  // Validate basket
  // Generate idempotency key
  // Navigate to address page
}

// 2. Address page - create PaymentIntent
const createPaymentIntent = async (addressData) => {
  // Atomic stock reservation
  // Create PaymentIntent with reservationId
  // Return clientSecret
}

// 3. Payment page - use PaymentElement
const PaymentForm = () => {
  // Confirm payment with clientSecret
  // Handle 3D Secure if required
}
```

### Key Files to Modify
- `app/(store)/basket/page.tsx` - Remove PaymentIntent creation
- `app/actions/checkout/createPaymentIntent.ts` - New server action
- `store/preCheckout/preCheckoutMachine.ts` - Simplify FSM
- `app/(store)/checkout/page.tsx` - Add PaymentElement

---

## Conclusion

The research strongly supports a simplified, late-binding approach to PaymentIntent creation. The current proposed flow creates PaymentIntents too early, leading to unnecessary complexity and potential reservation waste.

**Key Recommendation:** Delay PaymentIntent creation until the user is on the payment page, after address validation. This aligns with 2026 best practices and reduces the attack surface for race conditions and stock management issues.
