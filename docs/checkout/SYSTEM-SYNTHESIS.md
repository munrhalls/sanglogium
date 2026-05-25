# Checkout System Synthesis

## Tech Stack

**Core Framework**
- Next.js 15.5.9 (App Router, Server Components)
- TypeScript 5
- React 18.3.1

**Session Management**
- iron-session 8.0.4 (encrypted HTTP-only cookie, AES-GCM, max 4KB, 1 hour TTL)

**Payment Processing**
- Stripe 19.1.0 (Payment Intents, Elements)
- @stripe/react-stripe-js 5.3.0
- @stripe/stripe-js 8.11.0

**Content & Data**
- Sanity CMS 3.74.1 (products, prices, stock, parcel data)
- next-sanity 9.12.3

**Shipping**
- AlleKurier API (real-time shipping rates)
- Google Address Validation API (@googlemaps/addressvalidation 3.2.1)

## 4-Layer Architecture

1. **Routing & Orchestration** (Server Components - page.tsx): Security checkpoint, reads iron-session, fetches data, renders layout
2. **Presentation & Capture** (Client Components): Pure user interaction, displays data, collects input
3. **Mutation & Session Gateway** (Server Actions): Bridge for user inputs, validates, mutates iron-session, redirects
4. **Secure Service Infrastructure** (Core SDKs): Hard data access layer, wraps Sanity/Stripe/shipping APIs

## Session Structure (iron-session)

**Location:** Encrypted HTTP-only cookie named `checkout_session`

**Interface:** `CheckoutSession`
```typescript
{
  basket: Array<{ productId: string; quantity: number }>;
  address?: {
    regionCode: string;
    postalCode: string;
    street: string;
    streetNumber: string;
    city: string;
  };
  shippingCode?: string;
  shippingCost?: number; // cents
  paymentIntentId?: string;
  completedPaymentIntentId?: string;
}
```

**Cascade Invalidation Rules:**
- Address edit → clears shippingCode, shippingCost
- Payment succeeded → clears basket, address, shippingCode, shippingCost, paymentIntentId
- Payment failed/canceled → clears paymentIntentId only (keeps basket, address, shipping)

## Component Parts

### 1. Address Slice

**Files:**
- `app/(store)/checkout/address/page.tsx` (Server Component)
- `app/(store)/checkout/address/AddressForm.tsx` (Client Component)
- `app/actions/checkout/index.ts` → `saveAddress` (Server Action)
- `app/actions/address/address.ts` → `submitShippingAction` (Google Validation)

**Flow:**
1. Server component guards: redirects to `/basket` if no session.basket
2. Client form captures: regionCode, postalCode, street, streetNumber, city
3. Server action `saveAddress`:
   - Calls Google Address Validation API
   - On ACCEPT: saves address to session, clears shipping data (cascade invalidation)
   - On FIX: returns error to user
   - Redirects to `/checkout/shipping`

**Validation:** Google Address Validation API via `@googlemaps/addressvalidation`

### 2. Shipping Slice

**Files:**
- `app/(store)/checkout/shipping/page.tsx` (Server Component)
- `app/(store)/checkout/shipping/ShippingPageClient.tsx` (Client Component)
- `app/actions/checkout/index.ts` → `saveShippingAction` (Server Action)
- `lib/shipping/allekurier-rates.ts` (AlleKurier API client)
- `lib/shipping/parcel-calculator.ts` (Package calculation utility)
- `sanity-cms/lib/products/getProductsByIds.ts` (Product data fetcher)

**Flow:**
1. Server component guards: redirects to `/checkout/address` if no session.address
2. Server component:
   - Fetches parcel data from Sanity for basket products
   - Calculates packages via `calculatePackages(basket, products)`
   - Calls AlleKurier API with address + packages
   - Transforms response to shipping options
   - Passes options to client component
3. Client displays: provider, service name, price (PLN), delivery estimate
4. Server action `saveShippingAction`:
   - Rebuilds payload (fetches parcel data again server-side)
   - Recalculates packages
   - Calls AlleKurier API again (server-side verification)
   - Filters for selected rateId
   - Saves shippingCode + shippingCost (cents) to session
   - Redirects to `/checkout/payment`

**Shipping API:** AlleKurier.pl (POST https://allekurier.pl/api_v1/service_list, username/password auth)

**Package Calculation:** `lib/shipping/parcel-calculator.ts`
- Aggregates weight/volume from basket items
- Splits into multiple parcels if exceeds 25kg or 99,000 cm³
- Returns array of {weight (kg), width/height/length (cm)}

### 3. Payment Slice

**Files:**
- `app/(store)/checkout/payment/page.tsx` (Server Component)
- `app/(store)/checkout/payment/PaymentForm.client.tsx` (Client Component)
- `app/api/checkout/payment-intent/session/route.ts` (API Route - Payment Intent creation)

**Flow:**
1. Server component guards:
   - Redirects to `/basket` if no basket or invalid quantities
   - Redirects to `/checkout/address` if no address
   - Redirects to `/checkout/shipping` if no shippingCost
2. Server component:
   - Fetches live prices/stock from Sanity for basket products
   - Validates: all products exist, prices finite, stock > 0
   - Calculates: subtotal = Σ(Sanity price × session quantity)
   - Calculates: grandTotal = subtotal + session.shippingCost
   - Calls `/api/checkout/payment-intent/session` with grandTotal + address metadata
   - Passes clientSecret to client component
3. API route `/api/checkout/payment-intent/session`:
   - Creates or updates Stripe Payment Intent (PLN currency)
   - Saves paymentIntentId to session
   - Returns clientSecret
4. Client component:
   - Wraps in Stripe Elements provider with clientSecret
   - Renders PaymentElement (handles Blik/Apple Pay/CC)
   - On submit: calls `stripe.confirmPayment()` with billing details from session.address
   - Stripe redirects to `/api/checkout/return` on completion

**Payment Flow:** Stripe Payment Intents (not Charges), automatic_payment_methods enabled

### 4. Return Slice

**Files:**
- `app/api/checkout/return/route.ts` (API Route - Payment result handler)
- `app/(store)/checkout/success/page.tsx` (Server Component - Success page)
- `app/(store)/checkout/success/OrderDetails.tsx` (Server Component - Order details)
- `app/(store)/checkout/success/RefreshButton.tsx` (Client Component - Refresh for processing status)

**Flow:**
1. Stripe redirects to `/api/checkout/return?payment_intent=pi_xxx`
2. API route:
   - Extracts payment_intent from URL
   - Retrieves Payment Intent from Stripe API
   - Sets session.completedPaymentIntentId (always)
   - Partial-clear based on status:
     - `succeeded`: clears basket, address, shippingCode, shippingCost, paymentIntentId
     - `requires_payment_method`: clears paymentIntentId only (keeps data for retry)
     - `canceled`: clears paymentIntentId only
     - `processing`: keeps everything (async confirmation)
   - Redirects to `/checkout/success?payment_intent=pi_xxx` with status hint
3. Success page (Server Component):
   - Privacy guard: redirects to `/basket` if payment_intent missing or doesn't match session.completedPaymentIntentId
   - Verifies Payment Intent status server-side via Stripe API
   - Renders appropriate UI based on status:
     - `succeeded`: displays confirmation amount, payment method hint, order details
     - `requires_payment_method`: displays decline message with retry link
     - `canceled`: displays cancellation message with retry link
     - `processing`: displays processing message with refresh button
     - `verification_failed`/Stripe API down: displays error with support contact

**Payment Verification:** Server-side Stripe API call (not client-side redirect_status)

**Missing Component:** `/api/order` endpoint referenced in legacy return page does not exist; current success page uses OrderDetails component directly

## Session Cascade Validation (Funnel Guards)

**Permissive Backwards Navigation:** Back button works, data persists

**Guarded Forward Navigation:**
- `/checkout/payment` requires: basket, address, shippingCost
- `/checkout/shipping` requires: basket, address
- `/checkout/address` requires: basket

**Action Invalidators:**
- Address edit → clears shippingCode, shippingCost (user must re-select shipping)
- Payment failed → clears paymentIntentId only (user can retry payment)

## Data Flow Summary

**Basket → Address:**
- Basket IDs stored in session.basket
- Address validated via Google API
- Address stored in session.address

**Address → Shipping:**
- Session.address + session.basket used
- Parcel data fetched from Sanity
- Packages calculated
- AlleKurier API called with address + packages
- Shipping option selected → shippingCode + shippingCost stored in session

**Shipping → Payment:**
- Session.basket + session.address + session.shippingCost used
- Live prices/stock re-fetched from Sanity
- Total calculated server-side
- Stripe Payment Intent created with total + address metadata
- paymentIntentId stored in session

**Payment → Return:**
- Stripe redirects with payment_intent
- Payment Intent verified server-side
- Session partially cleared based on status
- User redirected to success page

## API Call Tally (Per Checkout)

**Sanity Reads:** 3
- Shipping page: parcel data for basket products
- Payment page: live prices/stock for basket products
- Shipping action: parcel data (server-side verification)

**Sanity Writes:** 0 (no order creation in current implementation - webhook missing)

**Shipping API Calls:** 2
- Shipping page: fetch rates for display
- Shipping action: fetch rates for verification (server-side)

**Stripe Calls:** 2
- Payment page: create/update Payment Intent
- Return handler: retrieve Payment Intent for verification

**Google API Calls:** 1
- Address action: validate address

## Key Security Principles

1. **Server-Side Calculation:** Totals calculated on server using trusted session data + live Sanity prices, not client input
2. **Encrypted Session:** iron-session AES-GCM encryption prevents client tampering
3. **Funnel Guards:** Prevents skipping checkout steps
4. **Server-Side Verification:** Shipping rates re-fetched server-side on selection
5. **Payment Intent Verification:** Return handler verifies payment status via Stripe API, not URL params
