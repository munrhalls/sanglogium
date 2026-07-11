# Phase 6 — Account deletion + data export (GDPR)

**Depends on:** nothing technically, but do phases 1–5 first — this is destructive functionality and should land on a stable, already-tested account section.
**Closes:** G5. This is a compliance gap, not just a UX one: `app/(store)/privacy-policy/page.tsx` already asserts "Under the GDPR you have the right to access, correct, delete... your data" with no mechanism behind it today.

---

## What already exists in better-auth (confirmed in `node_modules/better-auth/dist/api/routes/update-user.d.mts`)

A `/delete-user` endpoint that accepts an optional `password` (reauth) and optional `token` (for the email-confirmation variant), plus a `/delete-user/callback` endpoint for the token flow, and expects a `user.deleteUser` config block with `sendDeleteAccountVerification`, and optional `beforeDelete`/`afterDelete` hooks. None of this is configured in `lib/auth.ts` today — add it, don't reinvent deletion logic by hand.

## What to build

### 1. `lib/auth.ts` — add deletion config

```ts
user: {
  changeEmail: { /* from phase 3, if shipped */ },
  deleteUser: {
    enabled: true,
    sendDeleteAccountVerification: async ({ user, url, token }) => {
      await sendDeleteAccountVerification({ user, token });
    },
    beforeDelete: async (user) => {
      // last chance to block deletion (e.g. open orders) — see "Business rule" below
    },
    afterDelete: async (user) => {
      // Sanity cleanup — see step 3
    },
  },
},
```

### 2. `lib/email.ts` — add `sendDeleteAccountVerification`

Same structure as `sendChangeEmailVerification` from phase 3 (or as `sendResetPasswordEmail` if phase 3 hasn't shipped yet) — `resend`/`logDevEmail` fallback, build the confirmation URL from `token`, point it at better-auth's `/delete-user/callback` endpoint through the existing catch-all route.

### 3. Sanity cleanup in `afterDelete` — anonymize, don't hard-delete order history

**Business rule:** `order` documents must survive account deletion for accounting/tax reasons (this is standard e-commerce practice, not a Sang-Logium-specific opinion — most jurisdictions require retaining transaction records regardless of account status). So:
- Delete the `userProfile` document (`backendClient.delete(profileId)`) — this one is fine to hard-delete, it holds no legally-required history.
- On `order` documents matching `userId == user.id`: do **not** delete them. Instead `backendClient.patch({query: ...}).set({ isGuest: true })` and leave `userId` in place as a historical record, OR null it out and keep `customerEmail` as the only remaining identifier — pick whichever the project's existing data-retention stance implies; if there's no documented stance, null the `userId` and keep `customerEmail` (matches "the account is gone, the transaction record persists" without leaving a live foreign key to a deleted user).
- Do not touch Stripe customer records in this phase — that's a separate, higher-stakes integration point; flag it as a follow-up rather than guessing at Stripe deletion semantics.

### 4. UI

New "Danger Zone" section on `/account`, visually separated (e.g. a bordered section below Session Management, using an existing error/warning color token like `border-error-500`) with two actions:
- **Export my data** — a button that calls a new Route Handler `app/api/account/export/route.ts` (`getSession()` guard, returns 401 if none) which fetches the user's `userProfile` and all their `order` documents by `userId`, and returns them as a downloadable JSON file (`Content-Disposition: attachment`). This is the minimal viable "data export" — a formatted PDF/CSV is not required for GDPR compliance, a complete machine-readable export is.
- **Delete my account** — a confirmation dialog requiring the user to type their password (reuse the same `requireFreshSession()` pattern as password change), then calls `authClient.deleteUser({ password })`. Show a clear "this cannot be undone" warning before the confirm step — do not make this a single accidental click.

## Acceptance criteria

- Clicking "Export my data" downloads a JSON file containing the profile and order history for the signed-in user only.
- Deleting the account requires password confirmation (fresh session), removes the `userProfile` document, anonymizes rather than deletes `order` documents, and signs the user out.
- Attempting deletion without a fresh session redirects to `/sign-in` first, same as the existing change-password guard.
- Privacy policy's GDPR claim is now backed by an actual mechanism.
