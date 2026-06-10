# User Account System — Complete Intelligence
## Sang Logium · Next.js 15 / React 19 / Better Auth v1.6.11 / Turso / Sanity CMS v3
**Date:** June 2026  
**Method:** Full source trace, file-by-file, call-site verified  
**Purpose:** Basis for development of user account system. Must be 100% accurate.  
**Scope:** Intelligence only — no implementation directives.

---

## 1. Architecture: Dual-Session System

The system runs two independent sessions in parallel. This is the most critical architectural fact for all account system development.

| Session | Technology | Cookie | Purpose | Lifetime |
|---|---|---|---|---|
| **Auth session** | Better Auth (Turso SQLite) | `better-auth.session_token` (HTTP-only) | Identity — who is the user | 7 days, refreshes daily |
| **Checkout session** | iron-session | `checkout-session` (HTTP-only) | Checkout funnel state (basket, address, shipping, PI) | Until cleared |

**These two sessions are completely independent.** The auth session knows nothing about checkout. The checkout session knows nothing about who the user is (no `userId` field).

**Key implication:** To link a completed order to an account, the `userId` from the auth session must be explicitly read and passed to order creation. It is never transferred automatically.

---

## 2. System Map — All Auth Files (Verified)

### 2.1 Auth Infrastructure

| File | Role |
|---|---|
| `lib/auth.ts` | Better Auth config — DB adapter, session params, rate limits, email verification, hooks |
| `lib/auth-client.ts` | Browser-side auth client — `createAuthClient` from `better-auth/react` |
| `lib/auth/dal.ts` | Server-only DAL — `verifySession()`, `getSession()`, `requireSession()` |
| `app/api/auth/[...all]/route.ts` | Better Auth route handler — single pass-through via `toNextJsHandler(auth)` |

### 2.2 Auth Pages

| Route | File | Type |
|---|---|---|
| `/sign-up` | `app/(store)/sign-up/SignUpForm.tsx` | Client Component |
| `/sign-in` | `app/(store)/sign-in/SignInForm.tsx` | Client Component |
| `/verify-email` | `app/(store)/verify-email/VerifyEmailForm.tsx` | Client Component |
| `/forgot-password` | `app/(store)/forgot-password/ForgotPasswordForm.tsx` | Client Component |
| `/reset-password` | `app/(store)/reset-password/ResetPasswordForm.tsx` | Client Component |
| `/account` | `app/(store)/account/page.tsx` | Server Component |
| `/account/orders` | `app/(store)/account/orders/page.tsx` | Server Component |

### 2.3 Nav / Session Surface

| File | Role |
|---|---|
| `app/components/layout/header/NavbarActionsServer.tsx` | Server Component — reads session cookie, passes `isAuthenticated` to client |
| `app/components/layout/header/NavbarActions.tsx` | Client Component — renders nav state, dropdown, sign-out |
| `middleware.ts` | Edge middleware — protects `/account/*` via cookie presence check |

### 2.4 Sanity Schemas

| Schema | Fields relevant to account |
|---|---|
| `userProfile` (`sanity-cms/schemaTypes/userType.ts`) | `authId` (FK to Better Auth), `email`, `name`, `stripeCustomerId`, `addresses[]` |
| `order` (`sanity-cms/schemaTypes/orderType.ts`) | `userId` (optional, guest-nullable), `customerEmail`, `isGuest` |

---

## 3. Complete Happy Path Trace

### Step 1: Registration

**Entry point:** Link at bottom of `/sign-in` form ("Don't have an account? Sign up")  
**Nav entry:** ❌ NavbarActions shows only "Sign In" icon when unauthenticated — NO "Create Account" / "Sign Up" link in nav.

**Form:** `SignUpForm.tsx`  
- Collects: name, email, password (minLength=8)  
- Reads `?email` from URL → pre-fills email field  
- Calls `authClient.signUp.email({ email, password, name })`  

**On success:**
- Renders "Check your email" state with address and 1-hour expiry ✓  
- Does NOT redirect to `/account` (this was a previous bug; now fixed) ✓  
- Does NOT call `createUserProfile` from `actions.ts` (see dead code note below)  

**Profile creation — 2-layer system:**
- **Layer 1 (primary):** `lib/auth.ts` `databaseHooks.user.create.after` → creates `userProfile` in Sanity immediately after Better Auth user is persisted. Fires on every registration path (email + Google).  
- **Layer 2 (healing):** `lib/auth/dal.ts` `ensureUserProfile()` inside `verifySession()` → auto-creates missing profile on first protected page load. Idempotent. Never throws.  
- `app/(store)/sign-up/actions.ts` `createUserProfile()` → **DEAD CODE. Never imported. Never called.**

**Auth config at sign-up time:**
- `requireEmailVerification: true` → no session created at sign-up; user must verify first  
- `emailVerification.sendOnSignUp: true` → verification email sent immediately  
- `emailVerification.expiresIn: 3600` → token expires in 1 hour  

---

### Step 2: Email Verification

**Email URL built by:** `lib/email.ts` `sendVerificationEmail` → `${baseURL}/verify-email?token=${encodeURIComponent(token)}`  
**Note:** `sendVerificationEmail` ignores `data.url` and builds its own URL from `data.token`. This is intentional and correct.

**Form:** `VerifyEmailForm.tsx`  
- Reads `?token` from URL  
- If no token: error state with link to `/sign-in` ✓  
- If token present: immediately executes `window.location.href` to:  
  `/api/auth/verify-email?token=...&callbackURL=/sign-in?verified=true`  
- Appends `callbackURL=/sign-in?verified=true` ✓ (this was a previous gap; now fixed)

**Better Auth at `/api/auth/verify-email`:**
- Validates token against DB  
- Marks `user.emailVerified = true`  
- Does NOT auto-sign-in (`autoSignInAfterVerification` not configured → defaults false)  
- Redirects to `/sign-in?verified=true`  

---

### Step 3: Sign-In

**Form:** `SignInForm.tsx`  
- Shows "Email verified successfully. Please sign in to continue." when `?verified=true` ✓  
- Collects: email, password  
- Calls `authClient.signIn.email({ email, password })`  
- Detects `EMAIL_NOT_VERIFIED` error code → shows resend link ✓  
- Shows Google OAuth button (always visible regardless of env var state — see risk #4)

**On success:**  
- `useEffect` triggers `router.push("/account")`  
- **Always routes to `/account`** regardless of where the user was before or what middleware intercepted  
- No `returnTo` / `redirect_back` logic anywhere in the system  

**Google sign-in:**  
- `authClient.signIn.social({ provider: "google", callbackURL: "/account" })`  
- callbackURL hardcoded to `/account` ✓  

---

### Step 4: Account Dashboard

**Page:** `app/(store)/account/page.tsx` (Server Component)  
**Guard:** `verifySession()` → redirects to `/sign-in` if no session; also runs `ensureUserProfile()` healing

**Content:**  
- `Welcome, {session.user.name || session.user.email}!`  
- Link to "My Orders" (`/account/orders`)  
- `AccountActionsClient` component: Change Password form, Sign Out button, Sign Out All Devices button  

**Missing from account page:**
- No profile editing (name, email)  
- No address book (schema has `addresses[]` but nothing populates or reads it)  
- No Stripe customer linkage display  

---

### Step 5: Orders Page

**Page:** `app/(store)/account/orders/page.tsx` (Server Component)  
**Guard:** `verifySession()` ✓  

**Current content:**
```tsx
<p className="text-gray-500">No orders yet.</p>
```
**This is a hardcoded placeholder. No Sanity query. No order data. Not implemented.**

---

### Step 6: Sign Out

**Two mechanisms exist with different behaviors:**

| Location | Code | Destination |
|---|---|---|
| Navbar dropdown | `authClient.signOut()` + `router.refresh()` | **Stays on current page** (just refreshes nav state) |
| Account page button | `authClient.signOut()` + `window.location.href = "/sign-in"` | Redirects to `/sign-in` |

**Nav state after sign-out:** `router.refresh()` triggers Server Component re-render of `NavbarActionsServer` → cookie is gone → `isAuthenticated = false` → nav reverts correctly ✓

---

## 4. PM Question Answers (Source-Based, Binary)

### Q1 — Registration entry point
**From main nav: ❌ NO**  
NavbarActions shows only a Sign In link (`href="/sign-in"`) when unauthenticated. There is no "Create Account" or "Sign Up" link in the navigation.  
From sign-in page: ✓ YES — "Don't have an account? Sign up" link at bottom of form.  
**Verdict: Partial.** Professional standard requires the nav to offer both Sign In and Create Account.

### Q2 — Email verification UX
**✓ YES**  
- Sign-up shows "Check your email" with address + 1-hour expiry  
- Verification link routes to `/sign-in?verified=true`  
- Sign-in page shows "Email verified successfully. Please sign in to continue." banner  
- Unverified sign-in attempts show resend link  

### Q3 — Post-login destination
**❌ NO — always `/account`, no context awareness**  
- Email sign-in: `router.push("/account")`  
- Google sign-in: `callbackURL: "/account"`  
- Middleware redirect to `/sign-in` passes no `returnTo` parameter  
- Sign-in form reads no `returnTo` parameter  
**If middleware intercepts `/account/orders` → after login, user lands on `/account`, not `/account/orders`.**

### Q4 — Authentication state visibility
**✓ YES (functionally)**  
- `NavbarActionsServer` reads `getSessionCookie(headers)` on every SSR request  
- Shows UserIcon + "Account" + dropdown (My Account, Orders, Sign Out) when authenticated  
- Shows SignInIcon + "Sign In" link when not authenticated  
- Sign-out does `router.refresh()` → nav updates immediately  
- Sign-in does `router.push("/account")` → navigation causes re-render → nav updates  

### Q5 — Account page value
**⚠ MINIMAL — passes bare minimum**  
- Shows name/email: ✓  
- Shows "My Orders" link: ✓  
- Shows Change Password: ✓  
- Shows Sign Out: ✓  
Missing: profile editing, address book  

### Q6 — Order history — real data
**❌ NO — hardcoded placeholder**  
`app/(store)/account/orders/page.tsx` renders `"No orders yet."` with no Sanity query.  
Not implemented. Will require both this page AND Q7 (checkout linkage) to be fixed first.

### Q7 — Checkout → account linkage
**❌ CRITICAL BLOCKER — orders are ALWAYS guest orders**  
Source trace:  
- `lib/checkout/createOrderFromPaymentIntent.ts:251` → `isGuest: true` hardcoded  
- `OrderSessionData` interface has no `userId` field  
- `app/api/checkout/return/route.ts` (the caller) never reads auth session, never passes `userId`  
- `app/api/webhooks/stripe/route.ts` (fallback caller) has no auth context  
- `order` schema has `userId` field (nullable) — the plumbing exists but is never populated  

**No order in the system is currently linked to a user account.**

### Q8 — Session persistence
**✓ YES**  
- 7-day expiry, daily refresh  
- Cookie cache: 5 minutes (fast nav reads)  
- `verifySession()` does full DB check on every protected page load  
- Middleware: cookie-only check (not DB-verified, but standard Better Auth pattern)  

### Q9 — Sign out flow
**⚠ INCONSISTENT**  
- Functionally works: session cleared, nav updates  
- Two different destinations: stays on page (navbar) vs redirects to `/sign-in` (account page)  
- Professional standard: consistent post-sign-out destination

---

## 5. Critical Blockers

### Blocker 1: Orders never linked to user accounts (Q7)
**Severity: CRITICAL**  
**Root cause:** `createOrderFromPaymentIntent` always sets `isGuest: true` and never sets `userId`. The return route handler (`app/api/checkout/return/route.ts`) never reads the auth session.  
**What's needed:**  
1. Return route must call `getSession()` from `lib/auth/dal.ts` (available — it's a Route Handler, can use `headers()`)  
2. `OrderSessionData` interface must accept optional `userId`  
3. `createOrderFromPaymentIntent` must set `userId` and `isGuest: false` when `userId` is present  
4. Webhook path (`app/api/webhooks/stripe/route.ts`) has no auth context — must carry `userId` via Stripe metadata if the webhook fires before the return handler  
**Note:** Return handler already runs synchronously before redirect (line 122-129 of return/route.ts) and is the primary order creation path.

### Blocker 2: Orders page is a placeholder (Q6)
**Severity: CRITICAL — dependent on Blocker 1**  
**Root cause:** `app/(store)/account/orders/page.tsx` has no Sanity query.  
**What's needed:** GROQ query: `*[_type == "order" && userId == $userId] | order(dates.orderedAt desc)` using `session.userId` from `verifySession()`.  
**Note:** This only works if Blocker 1 is fixed first. With all orders as `isGuest: true` and no `userId`, the query returns nothing even if implemented.

---

## 6. Pre-Requirements

Before the order history feature can work end-to-end:

1. **Blocker 1 must ship first** — orders must be linked to user accounts at creation time
2. **Historical orders are unrecoverable** — existing orders in Sanity have `isGuest: true` and no `userId`. They cannot be retroactively linked without a migration script that matches `customerEmail` to user accounts. This is an irreversible data state.
3. **Turso production DB** — `DATABASE_URL` must be `libsql://` + `TURSO_AUTH_TOKEN` for Vercel deployment. Serverless ephemeral filesystem makes `file:./better-auth.db` non-viable.
4. **RESEND_API_KEY** — without this, verification and reset emails are console-logged only (local dev). Production requires a valid Resend key and a verified sender domain.

---

## 7. Critical Questions and Answers

### Q: At what point does the return route have access to the auth session?
**Answer:** The return route is a Route Handler (`app/api/checkout/return/route.ts`). Route Handlers can call `getSession()` from `lib/auth/dal.ts` which uses `auth.api.getSession({ headers: await headers() })`. The auth session IS accessible here. No architectural changes required — just call it.

### Q: What happens if the user is unauthenticated at checkout completion?
**Answer:** Guest checkout is fully supported and already the default (`isGuest: true`). If `getSession()` returns null in the return route, order is created with `isGuest: true`, no `userId`. This is correct behavior for guest checkout — no change needed.

### Q: How does the webhook path handle userId?
**Answer:** The Stripe webhook (`app/api/webhooks/stripe/route.ts`) has no auth session. It creates orders from PI metadata. To carry `userId` through the webhook path, the payment intent metadata must include `userId` when the PI is created (on the payment page, before submission). This requires the payment page to read the auth session and include `userId` in PI metadata. The webhook then reads `userId` from `pi.metadata.userId`.

### Q: What is the correct query to fetch orders for a user?
**Answer:** `*[_type == "order" && userId == $userId] | order(dates.orderedAt desc){ orderNumber, status, pricing, dates, items }` using `backendClient` (not public client — orders are private data requiring the SANITY_STUDIO_READ_WRITE token).

### Q: Does address pre-fill (from saved addresses) need to happen before order history?
**Answer:** No. Address pre-fill uses `userProfile.addresses[]` which is a separate, independent feature. Order history requires only `userId` on the order document. These are parallel work streams.

### Q: Should Google OAuth users get a userProfile?
**Answer:** Yes. `databaseHooks.user.create.after` fires for ALL user creation paths including Google OAuth. The healing layer in `verifySession()` also covers Google users. This is already correctly handled.

---

## 8. System Coherence

### 8.1 What is coherent today
- Auth sign-up → email verification → sign-in flow: complete and correct  
- Route protection: middleware (fast) + `verifySession()` (authoritative) dual layer  
- Session persistence: 7 days, daily refresh, 5-minute cookie cache  
- userProfile creation: dual-layer (databaseHooks primary, ensureUserProfile healing)  
- Forgot password / reset password: complete  
- Nav auth state: accurate on every page load  
- Sign-out: functionally works from both surfaces  

### 8.2 What breaks coherence
1. **Orders are always guest** → account page cannot meaningfully show purchase history → orders page is a dead-end feature until fixed
2. **No returnTo on sign-in** → users bounced to sign-in by middleware always land on `/account` regardless of destination intent → minor but noticeable friction
3. **Sign-out inconsistency** → navbar: stays on page; account page: goes to `/sign-in` → unpredictable for users
4. **Nav has no "Create Account" entry** → acquisition funnel requires users to notice the small link at bottom of sign-in form → lower conversion
5. **Google button shown unconditionally** → if `GOOGLE_CLIENT_ID` env var is absent, clicking fails silently → environment-dependent breakage
6. **Dead code in `sign-up/actions.ts`** → `createUserProfile` exported but never called; profile creation is handled entirely by `databaseHooks` → confusion, maintenance risk
7. **`userProfile.stripeCustomerId`** → schema field exists, never written — Stripe customer linkage not implemented
8. **`userProfile.addresses[]`** → schema field exists, never written or read from checkout — address book not implemented

### 8.3 Coherence to ensure during development

**Order of implementation matters:**
- Q7 (checkout→account linkage) MUST ship before Q6 (orders page) — orders page with real data only works if orders have `userId`
- Address pre-fill is independent of both — can be done in parallel
- `returnTo` on sign-in is low-effort, high-polish — good companion to any sign-in work

**Data contract to maintain:**
- All writes to `userProfile` must use `backendClient` (SANITY_STUDIO_READ_WRITE token) — never the public client
- `userId` on orders = Better Auth user ID (from `session.user.id`) — this is a string UUID, not the Sanity userProfile `_id`
- `authId` on `userProfile` = Better Auth user ID — same value, different field name

---

## 9. Dead Code

| File | Status | Notes |
|---|---|---|
| `app/(store)/sign-up/actions.ts` | Dead code | `createUserProfile()` exported but never imported anywhere. Profile creation handled by `databaseHooks` in `lib/auth.ts`. Safe to delete or repurpose. |

---

## 10. Environment Variables Required

| Variable | Local State | Production Required | Notes |
|---|---|---|---|
| `BETTER_AUTH_SECRET` | Set | ✓ | 32+ chars |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://sanglogium.com` | Update for production |
| `DATABASE_URL` | `file:./better-auth.db` | `libsql://...` (Turso) | **PRODUCTION BLOCKER** — SQLite file not viable on Vercel serverless |
| `TURSO_AUTH_TOKEN` | Missing | Required with Turso | **PRODUCTION BLOCKER** |
| `RESEND_API_KEY` | Check .env | Required | Without it, emails are console-logged only |
| `NEXT_PUBLIC_BASE_URL` | `https://sanglogium.com` | ✓ | Used in email link construction |
| `GOOGLE_CLIENT_ID` | Set | Set | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Set | Set | Google OAuth |

---

## 11. Source References (All Verified)

| File | Lines Checked |
|---|---|
| `lib/auth.ts` | Full — config, databaseHooks, session, rate limits |
| `lib/auth-client.ts` | Full |
| `lib/auth/dal.ts` | Full — verifySession, getSession, requireSession, ensureUserProfile |
| `app/(store)/sign-up/SignUpForm.tsx` | Full |
| `app/(store)/sign-up/actions.ts` | Full — confirmed dead code |
| `app/(store)/sign-in/SignInForm.tsx` | Full |
| `app/(store)/verify-email/VerifyEmailForm.tsx` | Full |
| `app/(store)/forgot-password/ForgotPasswordForm.tsx` | Full |
| `app/(store)/reset-password/ResetPasswordForm.tsx` | Full |
| `app/(store)/account/page.tsx` | Full |
| `app/(store)/account/AccountActions.client.tsx` | Full |
| `app/(store)/account/orders/page.tsx` | Full — confirmed placeholder |
| `app/components/layout/header/NavbarActionsServer.tsx` | Full |
| `app/components/layout/header/NavbarActions.tsx` | Full |
| `middleware.ts` | Full |
| `sanity-cms/schemaTypes/userType.ts` | Full |
| `sanity-cms/schemaTypes/orderType.ts` | Full |
| `lib/checkout/createOrderFromPaymentIntent.ts` | Full — confirmed isGuest:true, no userId |
| `app/api/checkout/return/route.ts` | Full — confirmed no auth session read |

---

*All source references verified against HEAD as of June 2026. No assumptions. Every finding has a source citation.*
