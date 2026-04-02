# Checkout & Payments Flow - Complete File Inventory

**Date:** 2026-04-02
**Scope:** End-to-end checkout → payments flow (orders management excluded)
**Purpose:** Opus audit and research input

---

## Core Checkout Flow Files

### 1. API Routes
```
c:\webdev\sang-logium\app\api\checkout\route.ts
- Main checkout API endpoint
- Handles basket validation, stock checking, Stripe session creation
- Contains critical TODOs for stock reservation system

c:\webdev\sang-logium\app\api\webhook\route.ts
- Stripe webhook handler (currently commented out)
- Processes payment completion events
- Creates orders in Sanity

c:\webdev\sang-logium\app\api\order\route.ts
- Order management API
```

### 2. Checkout Pages (App Router)
```
c:\webdev\sang-logium\app\(store)\checkout\
├── page.tsx - Checkout entry point
├── layout.tsx - Checkout layout wrapper
├── loading.tsx - Loading state
├── CheckoutProvider.tsx - Checkout state management
├── checkout.types.ts - TypeScript definitions
├── payment\
│   ├── page.tsx - Payment page
│   └── EmbeddedCheckoutForm.tsx - Stripe embedded form
├── shipping\
│   ├── page.tsx - Shipping address page
│   ├── FormView.tsx - Address form
│   ├── ConfirmationView.tsx - Address confirmation
│   └── DisplayAddress.tsx - Address display
└── return\
    ├── page.tsx - Payment return/success page
    └── components\
        ├── SuccessMessage.tsx
        └── OrderSuccessClient.tsx
```

### 3. Actions & Business Logic
```
c:\webdev\sang-logium\app\actions\checkout\
├── checkout.ts - (empty, placeholder)
└── getOrderBySession.ts - Order retrieval by session

c:\webdev\sang-logium\app\actions\address\address.ts
- Address validation and submission
```

### 4. State Management
```
c:\webdev\sang-logium\store\store.ts
- Zustand basket store (feeds checkout)

c:\webdev\sang-logium\app\(store)\checkout\CheckoutProvider.tsx
- Checkout-specific state management
```

### 5. Integration Components
```
c:\webdev\sang-logium\app\hooks\useInitializeCheckoutCart.ts
- Initializes checkout with basket data

c:\webdev\sang-logium\app\components\CheckoutForm.tsx
- Legacy checkout form (may be archived)

c:\webdev\sang-logium\app\(store)\basket\BasketSummary.tsx
- Basket summary that links to checkout
```

---

## Stripe Integration Files

### 1. Stripe Configuration
```
c:\webdev\sang-logium\lib\stripe\stripe.js
c:\webdev\sang-logium\lib\stripe\stripe-client.ts
- Stripe client initialization
```

### 2. Webhook Handlers (Archived)
```
c:\webdev\sang-logium\app\api\webhooks\stripe\ARCHIVED.ts
c:\webdev\sang-logium\app\api\webhooks\stripe\archived helpers.ts
- Previous webhook implementations
```

---

## Sanity CMS Schema & Types

### 1. Order Schema
```
c:\webdev\sang-logium\sanity\schemaTypes\orderType.ts
- Complete order document schema
- Includes items, addresses, pricing, status, timestamps
- Critical for understanding data structure

c:\webdev\sang-logium\sanity\lib\orders\
├── orderTypes.ts - Order type definitions
├── index.ts - Order utilities
└── addOrder.ts - Order creation helper
```

### 2. Generated Types
```
c:\webdev\sang-logium\sanity.types.ts
- Generated Sanity types (includes Order, Product)
```

---

## Authentication & User Management

### 1. User Profile Integration
```
c:\webdev\sang-logium\app\hooks\useUserProfile.ts
- User profile data for checkout

c:\webdev\sang-logium\sanity\lib\profiles\
├── fetchProfileByClerkId.ts
└── createUserProfile.ts
```

### 2. Auth Components
```
c:\webdev\sang-logium\app\components\features\auth\AuthMenu.tsx
- Auth state in checkout flow
```

---

## Configuration & Environment

### 1. Next.js Config
```
c:\webdev\sang-logium\next.config.ts
- Contains Stripe and other configurations

c:\webdev\sang-logium\middleware.ts
- Route protection and middleware
```

### 2. Utilities
```
c:\webdev\sang-logium\lib\utils\cookies.ts
- Cookie utilities for checkout persistence
```

---

## Test Files

### 1. Integration Tests
```
c:\webdev\sang-logium\tests\address\address.integration.test.ts
- Address validation tests

c:\webdev\sang-logium\tests\basket\
├── store.unit.test.ts
└── data-flow.integration.test.ts
- Basket to checkout data flow tests
```

### 2. E2E Tests
```
c:\webdev\sang-logium\tests\e2e\checkout\
- End-to-end checkout flow tests
```

---

## Key Data Structures for Audit

### 1. Checkout Types (checkout.types.ts)
```typescript
type Address = {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

type Status = "EDITING" | "LOADING" | "FIX" | "CONFIRM" | "ACCEPT";

type ServerProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  stripePriceId: string;
  _rev: string;
};

type BasketCheckoutItem = {
  _id: string;
  quantity: number;
};
```

### 2. Order Schema Highlights (orderType.ts)
- Customer info (guest checkout supported)
- Order items with snapshots
- Shipping/billing addresses
- Pricing breakdown
- Order status FSM
- Payment metadata
- Returns/refunds structure

---

## Critical Issues to Audit

### 1. Stock Reservation System
- Location: `app/api/checkout/route.ts` lines 44-52
- Status: TODO - Not implemented
- Impact: Race conditions, overselling

### 2. Webhook Handler
- Location: `app/api/webhook/route.ts`
- Status: Commented out
- Impact: No order creation on payment

### 3. Two-Phase Commit
- Location: `app/api/checkout/route.ts` lines 24-30
- Status: TODO - Not implemented
- Impact: Payment/stock inconsistency

### 4. Error Handling
- Location: Throughout checkout flow
- Status: Inconsistent
- Impact: Poor UX, lost sales

---

## Dependencies & External Services

1. **Stripe** - Payment processing
2. **Clerk** - Authentication
3. **Sanity** - CMS & data storage
4. **Zustand** - State management
5. **Next.js 15** - App Router

---

## Security Considerations for Audit

1. Payment flow security
2. Webhook signature verification
3. User data handling
4. CSRF protection
5. Rate limiting
6. Input validation
