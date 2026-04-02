# Payments → Orders Management → User Account - File Inventory

**Date:** 2026-04-02
**Scope:** Payment completion through order lifecycle to user account integration
**Purpose:** Opus audit and research input

---

## Core Order Management Files

### 1. Order Schema & Types
```
c:\webdev\sang-logium\sanity\schemaTypes\orderType.ts
- Complete order document schema
- Order status FSM definition
- User linking (clerkUserId)
- Payment metadata structure
- Return/refund tracking

c:\webdev\sang-logium\sanity.types.ts
- Generated types including Order, User
- Type definitions for order operations
```

### 2. Order Management API
```
c:\webdev\sang-logium\app\api\order\route.ts
- Order CRUD operations
- Status update endpoints
- User order access control

c:\webdev\sang-logium\app\api\webhook\route.ts
- Payment completion webhook
- Order creation trigger
- Status synchronization
```

### 3. Order Utilities & Libraries
```
c:\webdev\sang-logium\sanity\lib\orders\
├── orderTypes.ts - Order type definitions
├── index.ts - Order utilities
└── addOrder.ts - Order creation helper

c:\webdev\sang-logium\app\actions\checkout\getOrderBySession.ts
- Order retrieval by payment session
```

---

## User Account Integration Files

### 1. User Profile Management
```
c:\webdev\sang-logium\app\hooks\useUserProfile.ts
- User profile data fetching
- Order history integration

c:\webdev\sang-logium\sanity\lib\profiles\
├── fetchProfileByClerkId.ts
└── createUserProfile.ts
- User profile CRUD
- Order linking capabilities
```

### 2. Authentication Integration
```
c:\webdev\sang-logium\app\components\features\auth\AuthMenu.tsx
- Auth state in order context

c:\webdev\sang-logium\middleware.ts
- Route protection for orders
```

---

## Order UI Components

### 1. Order Display Components
```
c:\webdev\sang-logium\app\(store)\checkout\return\
├── page.tsx - Order success/return page
└── components\
    ├── SuccessMessage.tsx
    └── OrderSuccessClient.tsx
- Post-payment order display
```

### 2. Order Management UI (Future)
```
Note: No dedicated order management UI found
Gap: Users cannot view order history
Gap: No order tracking interface
```

---

## Payment Integration Files

### 1. Payment Processing
```
c:\webdev\sang-logium\lib\stripe\stripe.js
c:\webdev\sang-logium\lib\stripe\stripe-client.ts
- Stripe integration
- Payment verification
```

### 2. Payment Webhooks
```
c:\webdev\sang-logium\app\api\webhooks\stripe\ARCHIVED.ts
c:\webdev\sang-logium\app\api\webhooks\stripe\archived helpers.ts
- Previous webhook implementations
- Reference for payment handling
```

---

## Configuration & Environment

### 1. System Configuration
```
c:\webdev\sang-logium\next.config.ts
- Order-related configurations

c:\webdev\sang-logium\sanity\env.ts
- Sanity environment for orders
```

---

## Test Files

### 1. Order Tests
```
c:\webdev\sang-logium\tests\e2e\checkout\
- End-to-end order tests

Note: Limited order-specific test coverage
Gap: No order state machine tests
Gap: No user-order access tests
```

---

## Key Data Structures

### 1. Order Schema (orderType.ts)
```typescript
// Core Fields
orderNumber: string
orderId: string
clerkUserId: string (nullable for guests)
customerEmail: string
isGuest: boolean

// Status FSM
status: "pending_payment" | "processing" | "packed" | 
        "shipped" | "out_for_delivery" | "delivered" | 
        "cancelled" | "refunded" | "failed"

// Items with snapshots
items: [{
  productRef: reference
  productId: string (snapshot)
  name: string (snapshot)
  price: number (snapshot)
  quantity: number
  returnStatus: string
}]

// Addresses (snapshots)
shippingAddress: object
billingAddress: object

// Pricing
pricing: {
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
}

// Payment metadata
payment: {
  stripePaymentIntentId: string
  stripeCustomerId: string
  stripeCheckoutSessionId: string
  method: string
}

// Timestamps
dates: {
  orderedAt: datetime
  paidAt: datetime
  shippedAt: datetime
  deliveredAt: datetime
}
```

### 2. User-Order Linking
```typescript
// Order side
clerkUserId: string // Links to Clerk user

// User side (implied)
// Need: User profile with order references
// Need: GROQ queries for user orders
```

---

## Critical Gaps Identified

### 1. Order State Machine
- **Location**: `orderType.ts` status field
- **Issue**: FSM defined but not enforced in code
- **Risk**: Invalid transitions possible

### 2. User-Order Bidirectional Sync
- **Location**: User profile system
- **Issue**: No order references in user profile
- **Risk**: Cannot fetch user orders efficiently

### 3. Order Management UI
- **Location**: Entire UI layer
- **Issue**: No order history or tracking interface
- **Risk**: Poor user experience

### 4. Payment Webhook
- **Location**: `app/api/webhook/route.ts`
- **Issue**: Commented out, not functional
- **Risk**: No order creation on payment

### 5. Order Access Control
- **Location**: API routes
- **Issue**: No user-based order filtering
- **Risk**: Users can access any order

---

## Integration Points

### 1. Sanity CMS
- Order storage and retrieval
- User profile linking
- GROQ query optimization needed

### 2. Clerk Authentication
- User identification
- Order access control
- Session management

### 3. Stripe Payments
- Payment verification
- Webhook processing
- Refund handling

### 4. Next.js App Router
- Route protection
- Server-side data fetching
- Streaming order updates
