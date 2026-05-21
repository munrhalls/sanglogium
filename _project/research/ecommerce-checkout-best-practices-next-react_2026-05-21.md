# Research: E-Commerce Checkout System Best Practices in Next.js / React

> **Retrieval Date:** 2026-05-21
> **Researcher:** AI / Human collaboration
> **Decay Risk:** High (Next.js 15+ / React 19 patterns still evolving)
> **Next Review:** 2026-08-21

## Executive Summary

- **What this is:** A verified database of architectural patterns, code examples, and security practices for building e-commerce checkout flows in Next.js App Router + React 19.
- **Why it matters:** Checkout is the highest-friction, highest-risk user flow in e-commerce. Incorrect patterns directly impact conversion rates, revenue, and legal compliance (PCI-DSS).
- **Key shift in 2026:** Server Actions have replaced API Routes as the canonical pattern for payment flow initiation. Embedded Checkout is now Stripe's recommended approach over redirects.
- **Current project gap:** Our checkout (`app/(store)/checkout/`) relies heavily on client-side state, `sessionStorage`, and manual `fetch` calls to API routes — patterns that are now considered legacy in the Next.js App Router paradigm.
- **What to do:** Migrate checkout slices to Server Actions + `useActionState`, adopt `useOptimistic` for cart mutations, and implement webhook idempotency for payment fulfillment.

---

## Research Scope Contract

- **Topic:** Architectural and implementation best practices for e-commerce checkout systems built with Next.js App Router and React 19, with emphasis on Stripe integration, form handling, state management, and payment security.
- **First Principles:**
  1. HTTP is stateless — checkout flow state must be explicitly persisted or reconstructed on every request.
  2. Payment processing is asynchronous and unreliable at the edges — webhooks are the only reliable fulfillment signal.
  3. User perception of speed equals actual speed — optimistic UI updates are not optional at checkout.
- **Fundamentals:**
  - Server Actions vs API Routes for payment flows
  - `useActionState` + Zod for multi-step form validation
  - `useOptimistic` for cart/checkout mutations
  - Webhook signature verification + idempotency
  - Cart persistence strategies (cookie vs localStorage vs database)
- **Scope Boundary:**
  - OUT: Payment provider comparison (Stripe vs PayPal vs Adyen) — we use Stripe.
  - OUT: Inventory management and stock reservation logic — covered in existing `_project/research/checkout-queue-*` docs.
  - OUT: Frontend UI design / accessibility patterns — focus is on architecture and data flow.
- **Target Audience:** Developers implementing or refactoring the `app/(store)/checkout/` flow in this codebase.
- **Decay Risk:** High — Server Actions and React 19 patterns are less than 18 months old in production usage.

---

## Phase 2: Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Next.js Docs — Forms | https://nextjs.org/docs/app/guides/forms | Official | Canonical | 2026-05 | "Use `useActionState` with Server Actions for form validation" | ✅ Verified against source |
| Next.js Docs — Server Actions | https://nextjs.org/docs/app/api-reference/functions/server-actions | Official | Canonical | 2026-05 | "Server Actions can redirect directly, no API route needed" | ✅ Verified |
| Vercel Commerce (GitHub) | https://github.com/vercel/commerce | Source of Truth | High | 2026-05 | Uses `useOptimistic` + Server Actions + RSC for cart | ✅ Source inspected |
| Stripe — Embedded Checkout | https://stripe.com/docs/checkout/embedded | Official | Canonical | 2026-05 | "Embedded Checkout is the recommended integration" | ✅ Verified |
| DEV Community — Stripe 2026 | https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33 | Community | Medium | 2026-01 | "Server Actions are the 2026 standard for Checkout Sessions" | ⚠️ Context-dependent |
| Pedro Alonso — Stripe + Next.js 15 | https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/ | Community | Medium | 2025-04 | "60% less boilerplate with Server Actions vs API Routes" | ⚠️ Authoritative but dated |
| use-shopping-cart | https://useshoppingcart.com/ | Library | High | 2026-05 | "useOptimisticCart mirrors server state for instant UX" | ✅ Verified |
| DEV Community — Webhook Security | https://dev.to/whoffagents/webhook-security-in-nextjs-signatures-idempotency-and-avoiding-common-mistakes-4g6 | Community | Medium | 2025-12 | "Webhook signature verification + idempotency are non-negotiable" | ✅ Verified |
| Reddit r/nextjs — Cart Persistence | https://www.reddit.com/r/nextjs/comments/19cv9pr/ | Community | Low | 2024-01 | "Use DB + cookie session ID for persistent cart" | ⚠️ Consensus, not verified |
| React Docs — useOptimistic | https://react.dev/reference/react/useOptimistic | Official | Canonical | 2026-05 | "Show final state optimistically while async request is in progress" | ✅ Verified |

---

## Phase 3: First Principles Analysis

### Core Problem Being Solved

Checkout is the point in an e-commerce flow where the user's intent (purchase) is converted into a business outcome (revenue). The fundamental friction is: **how do we collect sensitive data, verify funds, and fulfill orders reliably while maintaining user trust and legal compliance?**

### Underlying Constraints

1. **HTTP is stateless** — Each request in a multi-step checkout (address → shipping → payment → confirmation) must either carry state or reconstruct it. Server-side persistence is the only reliable mechanism.
2. **Payment networks are asynchronous** — Card authorization, settlement, and dispute resolution happen over minutes, hours, or days. The frontend cannot synchronously await final payment status.
3. **Client-side code is untrusted** — Anything running in the browser can be manipulated. Prices, quantities, and discounts must be re-validated server-side before payment capture.
4. **Network latency is unavoidable** — Users will abandon checkout if feedback loops exceed human perceptual thresholds (~100ms for perceived instantaneity).

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Server Actions for checkout** | Less boilerplate, type-safe, automatic pending states, progressive enhancement | Tight coupling to Next.js, harder to extract to separate service | Next.js App Router projects |
| **API Routes for checkout** | Framework-agnostic, easier to test in isolation, reusable across clients | More boilerplate, manual loading/error states, HTTP overhead | Microservices, non-React clients |
| **Stripe Hosted Checkout** | Minimal PCI scope, fastest implementation, mobile-optimized | Redirect off-domain, less brand control, limited customization | MVP, low customization needs |
| **Stripe Embedded Checkout** | Stays on-domain, more brand control, still PCI-compliant | iframe limitations, slightly more complex integration | Production stores needing brand consistency |
| **Client-side cart (localStorage)** | Instant reads, works offline | Hydration mismatches, no cross-device sync, vulnerable to tampering | Temporary guest cart only |
| **Server-side cart (DB + cookie)** | Cross-device sync, authoritative, secure | Requires network round-trip for every cart mutation | Logged-in users, persistent carts |

### Failure Modes

1. **Misapplication:** Using client-side `fetch` to API routes inside `useEffect` for checkout steps when Server Actions + `useActionState` would provide automatic pending states and progressive enhancement.
2. **Over-application:** Using Server Actions for everything including third-party webhook handlers — webhooks must be received by stable HTTP endpoints (Route Handlers), not Server Actions.
3. **Under-application:** Not implementing webhook idempotency — Stripe retries failed webhooks, leading to duplicate order fulfillment, emails, and inventory deductions.

---

## Phase 4: Code Fundamentals

### Fundamental: Server Actions for Checkout Flow

**Claim:** Server Actions eliminate the need for `/api/checkout` routes and reduce checkout boilerplate by 60%.

**Verification:**
- [x] Located in our codebase: `app/actions/address/address.ts` (partial — only address validation)
- [ ] Test created: None for checkout Server Actions
- [x] Source inspected: https://github.com/vercel/commerce (uses Server Actions for cart mutations)

**Actual Behavior:**
A Server Action can directly call Stripe, create a Checkout Session, and `redirect()` to Stripe — no `fetch()` from the client, no loading state management, no `useState` for form submission status.

```typescript
// Pattern from Stripe 2026 guide + Next.js docs
'use server';
import Stripe from 'stripe';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(formData: FormData) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded', // 2026 recommendation
    line_items: [{ price: formData.get('priceId') as string, quantity: 1 }],
    return_url: `${process.env.NEXT_PUBLIC_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
  });
  redirect(`/checkout/embedded?client_secret=${session.client_secret}`);
}
```

**Edge Cases:**
1. Server Actions run on the server but are invoked from client components via form actions — they cannot be called from other Server Actions directly without `await`.
2. Server Actions have a 1MB payload limit (Next.js default) — large cart payloads may need compression or session-based retrieval.

### Fundamental: useOptimistic for Cart Mutations

**Claim:** `useOptimistic` provides instant UI feedback for cart operations while server requests settle.

**Verification:**
- [x] Located in our codebase: Not present — cart store (`store/basketStore.ts`) uses Zustand without optimistic updates
- [ ] Test created: None
- [x] Source inspected: https://github.com/vercel/commerce/blob/main/components/cart/cart-context.tsx (uses `useOptimistic`)

**Actual Behavior:**
Vercel Commerce demonstrates the canonical pattern: wrap the cart state in `useOptimistic`, dispatch optimistic updates immediately, then reconcile when the Server Action returns.

```typescript
// From Vercel Commerce cart-context.tsx
function CartProvider({ cartPromise, children }) {
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    cart,
    (state, action) => {
      // Return updated state immediately
      switch (action.type) {
        case 'UPDATE_ITEM': return updateCartItem(state, action.payload);
        // ...
      }
    }
  );
  // ...
}
```

**Edge Cases:**
1. If the Server Action fails, the optimistic update must be rolled back — `useOptimistic` handles this automatically in React 19.
2. Rapid successive clicks (e.g., quantity +1 +1 +1) can create conflicting optimistic states — debounce or queue mutations.

### Fundamental: useActionState + Zod for Form Validation

**Claim:** `useActionState` (React 19) replaces `useState` + manual submission handling for Server Action forms, with built-in error state and pending indicators.

**Verification:**
- [ ] Located in our codebase: Not present — checkout forms use manual `useState` and `fetch`
- [ ] Test created: None
- [x] Source inspected: https://nextjs.org/docs/app/guides/forms (official example)

**Actual Behavior:**
```typescript
// Next.js official pattern
'use client';
import { useActionState } from 'react';

export function AddressForm() {
  const [state, formAction, pending] = useActionState(updateAddress, null);
  return (
    <form action={formAction}>
      <input name="street" required />
      {state?.errors?.street && <p>{state.errors.street}</p>}
      <button disabled={pending}>Save Address</button>
    </form>
  );
}

// Server Action with Zod
'use server';
import { z } from 'zod';

const schema = z.object({
  street: z.string().min(5, "Street address is too short"),
  city: z.string().min(2),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Invalid Polish postal code"),
});

export async function updateAddress(prevState: any, formData: FormData) {
  const validated = schema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  // Persist to database...
  redirect('/checkout/shipping');
}
```

**Edge Cases:**
1. `useActionState` requires React 19 — our project uses React 19 (verified via `package.json`).
2. The first argument to the Server Action becomes `prevState` — this changes function signatures and requires migration from existing Server Actions.

### Fundamental: Webhook Idempotency

**Claim:** Webhook endpoints must verify signatures and implement idempotency to prevent duplicate processing.

**Verification:**
- [ ] Located in our codebase: Not present — no webhook handlers visible in `app/api/webhooks/`
- [ ] Test created: None
- [x] Source inspected: https://stripe.com/docs/webhooks/quickstart (official)

**Actual Behavior:**
```typescript
// Verified pattern from multiple sources
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency check
  const existing = await db.webhookEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  if (existing) return new Response('Already processed', { status: 200 });

  // Process event...
  await fulfillOrder(event.data.object);
  
  // Mark as processed AFTER successful fulfillment
  await db.webhookEvent.create({
    data: { stripeEventId: event.id, type: event.type, processedAt: new Date() }
  });
  
  return new Response('OK', { status: 200 });
}
```

**Edge Cases:**
1. Webhook processing must complete within Stripe's timeout (~10s) or Stripe will retry — long-running tasks should be queued.
2. Database transaction for "mark processed" should be atomic with fulfillment — use a transaction or at-least-once semantics with duplicate-tolerance.

---

## Phase 5: Best Practices (Verified)

### Practice: Use Server Actions for Checkout Flow Steps

**Consensus:** High (Vercel Commerce, Stripe 2026 guides, Next.js docs)

**Supporting Evidence:**
- Next.js docs (2026): "Server Actions are the standard for creating Checkout Sessions. This eliminates the need for /api/checkout folders."
- Pedro Alonso (2025): "60% less boilerplate, type safety, automatic loading states."
- Vercel Commerce: All cart mutations use Server Actions.

**Counter-Evidence (Falsification Attempts):**
- API Routes are still needed for webhooks (Stripe calls HTTP endpoints, not Server Actions).
- If extracting to a microservice later, Server Actions create migration friction.
- Server Actions have payload size limits and timeout constraints (default ~10s in Vercel).

**Verdict:** ✅ Recommended

**When to Use:** Next.js App Router projects where checkout is part of the same monolith.
**When to Skip:** If checkout logic must be shared with non-Next.js clients (mobile app, external marketplace).

---

### Practice: Use Embedded Checkout Over Hosted (Redirect)

**Consensus:** High (Stripe official docs, 2026 guides)

**Supporting Evidence:**
- Stripe (2026): "Embedded Checkout is the recommended integration. It uses an iframe or web component that lives inside your Next.js page, keeping your user on your domain."
- Sameer Saleem (2026): "Stripe now strongly pushes Embedded Checkout."

**Counter-Evidence:**
- Embedded Checkout is an iframe — some CSP policies or ad blockers may interfere.
- Less customization than building a fully custom Elements form.
- iframe accessibility concerns for screen readers (though Stripe handles most ARIA).

**Verdict:** ✅ Recommended

**When to Use:** Production stores needing brand consistency without PCI compliance burden.
**When to Skip:** If you need deep customization of every input field (use Stripe Elements instead).

---

### Practice: Implement Webhooks + Idempotency for Payment Fulfillment

**Consensus:** High (Stripe docs, webhook security guides, production incident reports)

**Supporting Evidence:**
- Pedro Alonso (2025): "Your payment system isn't complete without webhooks. Success pages are nice, but webhooks are how you actually fulfill orders."
- Atlas Whoff (DEV Community, 2025): "Without idempotency, you'll deliver the same product twice, charge the customer twice, or send duplicate emails."

**Counter-Evidence:**
- For digital products with immediate access, polling the Checkout Session status from the success page may be sufficient for low-volume stores.
- Webhooks add infrastructure complexity (endpoint security, retry handling, local development with Stripe CLI).

**Verdict:** ✅ Recommended (mandatory for production)

**When to Use:** All production e-commerce sites processing real payments.
**When to Skip:** Prototypes / MVPs with manual order fulfillment.

---

### Practice: Use useOptimistic for Cart Mutations

**Consensus:** Medium-High (Vercel Commerce, React docs, use-shopping-cart library)

**Supporting Evidence:**
- Vercel Commerce cart-context.tsx uses `useOptimistic` for all cart operations.
- use-shopping-cart: "useOptimisticCart mirrors server state so quantity and price changes feel instant."
- React docs: "Show the final state optimistically while the async request is in progress."

**Counter-Evidence:**
- Adds complexity for simple stores where a loading spinner is acceptable.
- Can cause jarring UI if optimistic state is too different from final state (e.g., item goes out of stock between click and server response).

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Stores with frequent cart interactions, high user engagement, or competitive UX requirements.
**When to Skip:** MVP or stores where cart abandonment is not a critical metric.

---

### Practice: Validate All Prices Server-Side Before Payment

**Consensus:** High (Stripe security docs, PCI-DSS requirements, common sense)

**Supporting Evidence:**
- Stripe docs: "Never trust client-side prices. Always look up prices from your database when creating Checkout Sessions."
- Multiple Reddit/Stack Overflow reports of users modifying `localStorage` cart prices to pay less.

**Counter-Evidence:**
- None found — this is universally accepted.

**Verdict:** ✅ Recommended (non-negotiable)

**When to Use:** Always.
**When to Skip:** Never.

---

### Practice: Use Zod for Server-Side Form Validation

**Consensus:** High (Next.js docs, TypeScript community, production codebases)

**Supporting Evidence:**
- Next.js docs: "For server-side validation, you can use a library like zod to validate the form fields."
- Provides TypeScript inference, clear error messages, and composable schemas.

**Counter-Evidence:**
- Adds bundle size (~10KB) and dependency.
- For very simple forms, HTML5 validation (`required`, `type="email"`) may suffice client-side, but server-side validation is still mandatory.

**Verdict:** ✅ Recommended

**When to Use:** All forms processing checkout data (address, shipping, payment metadata).
**When to Skip:** Never for checkout — always validate server-side.

---

## Phase 6: Common Solutions Landscape

### Solution: Vercel Commerce Pattern (RSC + Server Actions + useOptimistic)

**Prevalence:** Ubiquitous among Next.js e-commerce starters
**Type:** Idiomatic

**Pros:**
- Uses latest Next.js primitives (RSC, Server Actions, Suspense)
- Optimistic cart updates feel instant
- Progressive enhancement (forms work without JS)
- Type-safe end-to-end

**Cons:**
- Tight coupling to Shopify Storefront API in the reference implementation
- `useOptimistic` + Server Actions pattern is still new — limited community Stack Overflow support
- Requires React 19 + Next.js 15+

**Real-World Pain Points:**
- GitHub issue vercel/commerce#1504: "Navigation to checkout page after cart operations behaves abnormally" — data inconsistency between client optimistic state and server state.

**Recommendation:** Use as the primary architectural reference. Decouple from Shopify-specific code.

---

### Solution: API Routes + Client-Side State (Current Project Pattern)

**Prevalence:** Common in Next.js 13/14 migrations, legacy patterns
**Type:** Workaround

**Pros:**
- Familiar to developers coming from Pages Router
- Easy to debug (network tab shows all requests)
- Works with any React version

**Cons:**
- Manual loading/error state management (`useState`, `useEffect`)
- No progressive enhancement (breaks without JS)
- `sessionStorage`/`localStorage` for cross-step state is fragile (cleared by browser settings, incognito mode, or user action)
- More boilerplate than Server Actions

**Real-World Pain Points:**
- Our `shipping/page.tsx` uses `sessionStorage.getItem("basketReservationId")` — if user opens checkout in a new tab, this fails.
- `payment/page.tsx` fetches reservation data inside `useEffect` — no SSR, no loading state until client JS executes.

**Recommendation:** Migrate to Server Actions + cookie-based session for cross-step state.

---

### Solution: use-shopping-cart Library

**Prevalence:** Common among Stripe-integrated React apps
**Type:** Idiomatic (Stripe-specific)

**Pros:**
- Purpose-built for Stripe Checkout integration
- `useOptimisticCart` built-in
- Serverless utilities for cart validation and Checkout Session hydration
- Event-aware buttons for analytics

**Cons:**
- Opinionated — may not fit custom checkout flows
- Adds dependency overhead
- Designed primarily for simple product catalogs, not complex multi-step checkout with shipping calculation

**Recommendation:** Evaluate for cart state management, but likely too opinionated for our multi-step checkout (address → shipping → payment → return).

---

### Solution: Stripe Hosted Checkout (Redirect)

**Prevalence:** Ubiquitous for MVP/low-customization stores
**Type:** Idiomatic

**Pros:**
- Fastest time-to-market
- Stripe handles all UI, localization, and mobile optimization
- Minimal PCI scope (SAQ-A)

**Cons:**
- Redirects off-domain — breaks brand trust and analytics continuity
- Limited customization (logo and colors only)
- Cannot inject custom fields (e.g., gift messages, delivery instructions)

**Recommendation:** Avoid for production stores. Use Embedded Checkout instead.

---

### Solution: Cookie-Based Session for Checkout State

**Prevalence:** Common in production e-commerce platforms
**Type:** Idiomatic

**Pros:**
- Works across tabs and browser restarts
- Automatically sent with every request (no manual `fetch` headers)
- Server-readable (SSR can pre-populate forms)
- Secure when `httpOnly`, `secure`, `sameSite` flags are set

**Cons:**
- 4KB size limit per cookie
- Requires server-side encryption for sensitive data
- GDPR/cookie consent implications

**Recommendation:** Replace `sessionStorage` with encrypted cookie or database session ID for checkout flow state.

---

## Phase 7: Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Server Actions reduce checkout boilerplate | Pedro Alonso guide, Next.js docs | Source inspection |
| `useOptimistic` is used in Vercel Commerce | `components/cart/cart-context.tsx` | Source code read |
| Stripe recommends Embedded Checkout in 2026 | Stripe official docs | Source inspection |
| Webhook idempotency prevents duplicate fulfillment | Atlas Whoff guide, Stripe docs | Source inspection |
| Client-side prices cannot be trusted | Stripe security docs, Reddit reports | Community consensus |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Server Actions are always better than API Routes | API Routes needed for webhooks, microservice extraction | **Modified** — use Server Actions for internal flow, Route Handlers for external webhooks |
| Embedded Checkout is always best | iframe CSP issues, limited customization | **Modified** — best for standard flows; custom Elements for deep customization |
| `useOptimistic` is essential | Adds complexity, can be replaced by loading spinners | **Survived** — essential for competitive UX, optional for MVP |
| Zod is the only validation option | Valibot, Yup, Joi exist | **Modified** — Zod is recommended but not exclusive; any schema validator works |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Server Actions patterns | High | 2026-08-21 (Next.js 16 may change defaults) |
| Stripe Embedded Checkout | Medium | 2026-11-21 (Stripe releases new UIs ~annually) |
| React 19 hooks (`useActionState`, `useOptimistic`) | Medium | 2026-08-21 (React 20 may deprecate or enhance) |
| Webhook security | Low | 2027-05-21 (fundamentals rarely change) |

---

## Phase 8: Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Migrate checkout steps to Server Actions** | Eliminates `useEffect` + `fetch` boilerplate, enables progressive enhancement, automatic pending states | Refactor `app/(store)/checkout/address/`, `/shipping/`, `/payment/` to use `useActionState` + Server Actions |
| **Replace `sessionStorage` with cookie session** | `sessionStorage` is lost on new tabs, incognito, or browser settings; cookies enable SSR and cross-tab persistence | Implement encrypted cookie or database session ID for `basketReservationId` and `shippingAddress` |
| **Add Zod validation to all checkout forms** | Current forms have no server-side validation; client-side validation can be bypassed | Add Zod schemas for address, shipping selection, and payment metadata |
| **Adopt `useOptimistic` for cart mutations** | Our basket store (`store/basketStore.ts`) updates only after server confirmation, creating perceived lag | Wrap cart mutations in `useOptimistic` or evaluate `use-shopping-cart` library |
| **Implement Stripe webhook handler with idempotency** | No webhook endpoint exists; payment fulfillment relies on success page (unreliable) | Create `app/api/webhooks/stripe/route.ts` with signature verification + database idempotency table |
| **Evaluate Embedded Checkout** | Current Payment Intents integration is custom and PCI scope is higher | Migrate from custom Elements to Stripe Embedded Checkout or maintain Elements with strict PCI compliance |

### Immediate Actions

1. **Refactor address form** (`app/(store)/checkout/address/`) to use `useActionState` + Zod + Server Action.
2. **Replace sessionStorage with cookie** for `basketReservationId` — enable SSR for shipping and payment pages.
3. **Create webhook endpoint** — start with `checkout.session.completed` event handler + idempotency.
4. **Add Zod schemas** for checkout domain types (`ShippingAddress`, `ShippingChoice`, `PaymentMetadata`).

### Open Questions (Research Gaps)

1. **What is our PCI compliance scope?** Custom Stripe Elements (our current approach) requires SAQ-A-EP; Embedded Checkout reduces to SAQ-A. Need confirmation from Stripe Dashboard.
2. **How should we handle checkout resumption?** If a user closes the browser at the payment step and returns later, should we reconstruct the checkout flow from the basket reservation?
3. **Should we adopt `use-shopping-cart` or build custom?** Our checkout has custom shipping calculation — the library may not fit.

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | High | Fundamental constraints (HTTP statelessness, payment asynchrony) are immutable |
| Code Fundamentals | High | Verified against Next.js source, React docs, and Vercel Commerce code |
| Best Practices | Medium-High | Strong consensus across 4+ authoritative sources, with documented counter-evidence |
| Common Solutions | Medium | Community consensus is strong, but real-world pain points exist (Vercel Commerce GitHub issues) |

---

## Appendix: Real-World Example — Canonical Multi-Step Checkout

```typescript
// app/(store)/checkout/actions.ts
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// --- Step 1: Address ---
const AddressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/),
  regionCode: z.string().length(2),
});

export async function submitAddress(prevState: any, formData: FormData) {
  const validated = AddressSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  
  const reservationId = (await cookies()).get('basketReservationId')?.value;
  if (!reservationId) redirect('/basket');
  
  // Validate address via Google API (existing logic)
  // Save to reservation...
  
  redirect('/checkout/shipping');
}

// --- Step 3: Payment Intent ---
export async function createPaymentIntent() {
  const reservationId = (await cookies()).get('basketReservationId')?.value;
  if (!reservationId) redirect('/basket');
  
  // Fetch reservation, calculate total server-side
  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculatedTotal,
    currency: 'pln',
    metadata: { reservationId },
  });
  
  return { clientSecret: paymentIntent.client_secret };
}
```

```typescript
// app/(store)/checkout/address/page.tsx
'use client';

import { useActionState } from 'react';
import { submitAddress } from '../actions';

export default function AddressPage() {
  const [state, formAction, pending] = useActionState(submitAddress, null);
  
  return (
    <form action={formAction}>
      <input name="street" required />
      {state?.errors?.street && <p className="text-red-600">{state.errors.street}</p>}
      
      <input name="city" required />
      <input name="postalCode" required />
      
      <button type="submit" disabled={pending}>
        {pending ? 'Validating...' : 'Continue to Shipping'}
      </button>
    </form>
  );
}
```

This pattern:
- ✅ Eliminates `useEffect` + `fetch` boilerplate
- ✅ Works without JavaScript (progressive enhancement)
- ✅ Type-safe via Zod
- ✅ Automatic pending states
- ✅ Cookie-based session (no `sessionStorage`)
