# Theme 07: Clerk Authentication

## SangLogium Context
Clerk handles all authentication—users, sessions, role-based access. It integrates with Next.js middleware for protected routes and with Sanity for user profiles. The auth boundary between storefront (public) and admin (protected) is critical.

**Critical Files:**
- `middleware.ts` — Route protection and role checks
- `app/components/features/auth/AuthMenu.tsx` — Auth UI components
- `sanity/lib/profiles/` — User profile CRUD
- `lib/clerk/warning-suppressor.ts` — Clerk config
- `app/(admin)/` — Protected route group

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at code. Binary pass/fail.

#### Clerk Fundamentals
- [ ] What is Clerk vs NextAuth vs custom auth?
- [ ] How does Clerk handle sessions?
- [ ] What is the difference between `auth()` and `currentUser()`?
- [ ] How do you protect a route with Clerk?
- [ ] How do you access user data in a Server Component?

#### Middleware & Protection
- [ ] What does `middleware.ts` do in Next.js?
- [ ] How do you redirect unauthenticated users?
- [ ] How do you check roles in middleware?
- [ ] What is `matcher` config in middleware?
- [ ] How do you make public routes vs protected routes?

#### User Profiles
- [ ] Why store user profiles in Sanity AND Clerk?
- [ ] What data lives in Clerk vs Sanity?
- [ ] How do you sync user data between systems?
- [ ] What happens when a new user signs up?
- [ ] How do you handle guest checkout (no account)?

#### Integration Patterns
- [ ] How do you get the current user in an API route?
- [ ] How do you protect Server Actions?
- [ ] How do you handle auth in Client Components?
- [ ] What is the `useUser()` hook for?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Clerk Architecture

**Clerk Concepts:**

1. **Authentication** — Who are you?
   - Email/password, social OAuth, magic links
   - Session management with JWTs
   - Automatic token refresh

2. **Authorization** — What can you do?
   - Roles (admin, manager, packer)
   - Permissions (read, write, delete)
   - Route-level and component-level

3. **User Management**
   - User profiles in Clerk
   - Extended profiles in Sanity
   - Organization/team support

**SangLogium Setup:**
```typescript
// lib/clerk/warning-suppressor.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

### Module 2: Middleware & Route Protection

**Basic Protection:**
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/studio(.*)',
  '/manager(.*)',
  '/packer(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // Redirects to sign-in if not authenticated
  }
  
  return NextResponse.next();
});
```

**Role-Based Protection:**
```typescript
// middleware.ts with roles
const isAdminRoute = createRouteMatcher(['/manager(.*)', '/studio(.*)']);
const isPackerRoute = createRouteMatcher(['/packer(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  
  // Admin routes require specific role
  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata?.role;
    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  // Packer routes
  if (isPackerRoute(req)) {
    const role = sessionClaims?.metadata?.role;
    if (!['admin', 'manager', 'packer'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  return NextResponse.next();
});
```

---

### Module 3: Server Components & API Routes

**Server Component Auth:**
```typescript
// app/(admin)/manager/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function ManagerDashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    return <div>Please sign in</div>;
  }
  
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  
  // Fetch data based on role
  const orders = await getOrdersForRole(role);
  
  return <Dashboard orders={orders} role={role} />;
}
```

**API Route Auth:**
```typescript
// app/api/orders/route.ts
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Fetch user's orders
  const orders = await getOrdersForUser(userId);
  return Response.json(orders);
}
```

**Server Actions:**
```typescript
// app/actions/orders.ts
'use server';

import { auth } from '@clerk/nextjs/server';

export async function updateOrderStatus(orderId: string, status: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // Verify user has permission to update this order
  const canUpdate = await checkOrderPermission(userId, orderId);
  if (!canUpdate) {
    throw new Error('Permission denied');
  }
  
  return updateOrder(orderId, status);
}
```

---

### Module 4: User Profiles in Sanity

**Why Two Systems?**

| Data | Lives In | Why |
|------|----------|-----|
| Email, password | Clerk | Security-critical |
| Sessions, MFA | Clerk | Clerk handles complexity |
| Order history | Sanity | Tied to order data |
| Addresses | Sanity | Complex structure |
| Preferences | Sanity | App-specific |
| Role | Both | Needed in both contexts |

**Profile Sync Pattern:**
```typescript
// sanity/lib/profiles/createUserProfile.ts
export async function createUserProfile(clerkUser: User) {
  const profile = await sanityClient.create({
    _type: 'userProfile',
    clerkUserId: clerkUser.id,
    email: clerkUser.emailAddresses[0].emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    role: clerkUser.publicMetadata.role || 'customer',
    createdAt: new Date().toISOString(),
  });
  
  return profile;
}

// Called when user first signs up
// via Clerk webhook
```

**Webhook Integration:**
```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(request: Request) {
  const event = await verifyClerkWebhook(request);
  
  switch (event.type) {
    case 'user.created':
      await createUserProfile(event.data);
      break;
      
    case 'user.updated':
      await updateUserProfile(event.data);
      break;
      
    case 'user.deleted':
      await deactivateUserProfile(event.data.id);
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

---

## Layer 2: Integration Examination

### Integration Challenge 1: Role-Based Dashboard

**Scenario:** Build a dashboard that shows different content per role

**Requirements:**
1. Read user role from Clerk session
2. Fetch data appropriate to role:
   - OWNER: All orders, revenue, analytics
   - MANAGER: Active orders, inventory, returns
   - PACKER: TO_PACK queue, holds, my locked orders
3. UI adapts to show relevant actions
4. API routes enforce role permissions

**Test Cases:**
- Packer accessing `/manager` → 403 or redirect
- Manager accessing `/packer` → Allowed (higher privilege)
- Guest accessing any admin route → Redirect to sign-in

**Success Criteria:**
- [ ] Role read correctly from session
- [ ] Data fetching scoped to role
- [ ] UI reflects role permissions
- [ ] API routes enforce role checks
- [ ] Unauthorized access handled gracefully

---

### Integration Challenge 2: Guest Checkout Flow

**Scenario:** Allow checkout without creating account

**Requirements:**
1. Storefront accessible without auth
2. Cart persists for guests
3. Checkout collects email (but no account created)
4. Order created with `isGuest: true`
5. Post-purchase: Option to create account from order

**Data Model:**
```typescript
// Order schema
{
  clerkUserId: null, // No user for guests
  isGuest: true,
  customerEmail: 'guest@example.com',
  // ...
}
```

**Flow:**
```
Guest browses → Adds to cart → Enters email at checkout
→ Pays via Stripe → Order created (isGuest: true)
→ Email confirmation with "Create Account" link
→ Clicking link pre-fills account with order history
```

**Success Criteria:**
- [ ] Guest can complete full checkout
- [ ] Order linked to email for lookup
- [ ] Account creation imports order history
- [ ] No orphaned guest data

---

## Layer 3: Systems Examination

### Systems Challenge: Multi-Tenant Architecture

**Scenario:** SangLogium needs to support multiple "stores" (B2B clients)

**Options:**

**Option 1: Clerk Organizations**
- Native multi-tenancy in Clerk
- Each org = one store
- Users belong to orgs
- Pros: Built-in, secure
- Cons: Paid feature, complex migration

**Option 2: Custom Tenant ID**
- Add `tenantId` to all documents
- Filter all queries by tenant
- Pros: Simple, flexible
- Cons: Easy to forget filters (security hole)

**Option 3: Separate Sanity Datasets**
- One dataset per tenant
- Complete isolation
- Pros: Maximum security
- Cons: Complexity, cost

**Design Your Solution:**
1. Choose approach with justification
2. Define data model changes
3. Design middleware/auth changes
4. Plan migration strategy
5. Address security concerns

---

## Stress Test Scenarios

### Scenario 1: Session Expiry Bug

**Given:**
- User has admin dashboard open
- Session expires while they're working
- User clicks "Update Order"
- Error: "Unauthorized" but no redirect

**Problem:**
- Client doesn't know session expired
- Server rejects request
- Poor UX: silent failure

**Fix:**
- Add session expiry check on client
- Auto-refresh token before expiry
- On 401, redirect to sign-in with return URL
- Use Clerk's built-in session handling

---

### Scenario 2: Role Sync Lag

**Given:**
- Manager promoted to Admin in Clerk
- User still sees Manager dashboard
- Refresh doesn't update role

**Problem:**
- Role cached in session
- Session not refreshed after role change

**Fix:**
- Invalidate sessions on role change
- Or: Check role fresh on each request (slower)
- Or: Short session expiry with refresh

---

## Quick Reference: Auth Patterns

| Context | Get User | Protect | Notes |
|---------|----------|---------|-------|
| Server Component | `auth()` or `currentUser()` | `auth.protect()` | Async |
| API Route | `auth()` | Manual check | Return 401 |
| Server Action | `auth()` | Throw on fail | Try/catch in client |
| Client Component | `useUser()` | `<SignedIn>` | Reactive |
| Middleware | `auth()` | `auth.protect()` | Runs on every request |

---

## Completion Checklist

- [ ] Can implement route protection with Clerk
- [ ] Can check roles in middleware and components
- [ ] Can get user data in Server Components
- [ ] Can protect API routes and Server Actions
- [ ] Can sync user profiles between Clerk and Sanity
- [ ] Can handle guest checkout flows
- [ ] Can debug session/auth issues

---

*Next: Theme 08 — Tailwind Design Systems*
