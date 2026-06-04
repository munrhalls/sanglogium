# Auth — Data & Functional Intelligence

## Library Decision

**Chosen:** Better Auth

**Why:** Auth.js v5 was taken over by the Better Auth team in September 2025 and is now in security-patch mode only. Better Auth is the actively developed, framework-native alternative, recommended by Auth.js maintainers and listed as a recommended library by Next.js itself.

**Sources:**
- https://github.com/nextauthjs/next-auth/discussions/13252

## Architecture

**Dual database strategy:**
- **Better Auth** owns identity (users, sessions, credentials)
- **Sanity** owns user profiles (name, email, addresses, order history)
- Link via `authId` field on `userProfile` document

**Guest checkout remains untouched.** No auth required to browse or purchase.

## Database Strategy

| Environment | Database | Adapter |
|-------------|----------|---------|
| Local dev   | SQLite (`better-auth.db`) | `better-sqlite3` via Kysely |
| Production  | Turso (libSQL) | `kysely-libsql` |

`lib/auth.ts` auto-detects `DATABASE_URL` prefix: `libsql://` → Turso, otherwise SQLite.

## Key Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Better Auth configuration, DB adapter setup |
| `lib/auth-client.ts` | Frontend auth client |
| `lib/auth/dal.ts` | Server-side `verifySession()` |
| `app/api/auth/[...all]/route.ts` | Better Auth API handler |
| `app/(store)/sign-in/` | Sign-in page + form |
| `app/(store)/sign-up/` | Sign-up page + form + server action |
| `app/(store)/account/` | Protected account page |
| `middleware.ts` | Route protection for `/account/*` |
| `sanity-cms/schemaTypes/userType.ts` | `userProfile` schema |

## Auth Features Configured

- Email + password registration/sign-in
- Google OAuth (conditional on env vars)
- Rate limiting: 10 requests per 60s window
- Auto-sign-in after registration
- No email verification required

## Gap-Close Audit — May 31, 2026

**CLOSED:**
1. middleware.ts + NavbarActionsServer.tsx hardcoded cookie name → fixed with `getSessionCookie()` from `better-auth/cookies`
2. SignInForm had no redirect after login → added `router.push("/account")`
3. SignUpPage missing Suspense for `useSearchParams` → added
4. `@better-auth/kysely-adapter` missing from package.json → added v1.6.11
5. Dead `AuthMenu.tsx` with `alert()` stubs → deleted

**OPEN (manual):**
- Production `.env` `DATABASE_URL=file:./better-auth.db` is **FATAL on Vercel serverless**. Must create Turso database and set `DATABASE_URL=libsql://...` + `TURSO_AUTH_TOKEN=...` in Vercel env vars. `lib/auth.ts` adapter logic already handles `libsql://` correctly.

