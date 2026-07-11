# Phase 3 — Profile editing: email change

**Depends on:** Phase 2 (profile section already exists on `/account` to extend).
**Closes:** G3.

---

## What already exists in better-auth (confirmed in `node_modules/better-auth/dist/api/routes/update-user.d.mts`)

better-auth core ships a `/change-email` endpoint (`newEmail`, optional `callbackURL`) and expects a `user.changeEmail` config block with a `sendChangeEmailVerification` callback. **This is not currently configured in `lib/auth.ts`** — there is no `user:` top-level key at all, only `databaseHooks.user.create`. This phase adds it.

Flow once configured: user submits new email → better-auth emails a confirmation link to the **new** address (not the old one) → user clicks it → email is swapped only after that click. This is the standard secure pattern (prevents someone from hijacking an account by changing the email to one they don't control) — do not build a simpler "just update it" version.

## What to build

1. **`lib/auth.ts`** — add a `user` block (sits alongside the existing `emailAndPassword`/`emailVerification` blocks):
   ```ts
   user: {
     changeEmail: {
       enabled: true,
       sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
         await sendChangeEmailVerification({ user, newEmail, token });
       },
     },
   },
   ```
   Import `sendChangeEmailVerification` from `lib/email.ts` (new function, next step).

2. **`lib/email.ts`** — add `sendChangeEmailVerification`, following the exact structure of the existing `sendVerificationEmail`/`sendResetPasswordEmail` (same `resend`/`logDevEmail` fallback pattern, same `baseUrl` construction):
   ```ts
   export async function sendChangeEmailVerification(data: {
     user: EmailUser;
     newEmail: string;
     token: string;
   }): Promise<void> {
     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
     const confirmUrl = `${baseUrl}/api/auth/change-email/callback?token=${encodeURIComponent(data.token)}`;
     if (!resend) {
       logDevEmail("Change Email Confirmation", data.newEmail, confirmUrl);
       return;
     }
     await resend.emails.send({
       from: resendFromEmail,
       to: data.newEmail,
       subject: "Confirm your new email — Sang Logium",
       html: `<p>Click to confirm this is your new email address for Sang Logium:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
     });
   }
   ```
   Verify the actual callback route path against better-auth's generated routes for this version (it's exposed through the same catch-all `app/api/auth/[...all]/route.ts` already in place — no new route file needed, only confirm the exact path segment by checking `node_modules/better-auth/dist/api/routes/update-user.d.mts` / `index.d.mts` for the `changeEmail` endpoint path, which was `/change-email` at last check).

3. **Sanity mirror** — better-auth's own `user.email` updates automatically via its own flow; the Sanity `userProfile.email` copy will NOT update itself. Add a `databaseHooks.user.update.after` hook in `lib/auth.ts` (new hook, alongside the existing `user.create.after`) that patches `userProfile.email` in Sanity whenever the auth user record changes:
   ```ts
   databaseHooks: {
     user: {
       create: { after: async (user) => { /* existing code, unchanged */ } },
       update: {
         after: async (user) => {
           try {
             const profile = await backendClient.fetch(
               `*[_type == "userProfile" && authId == $authId][0]{_id}`,
               { authId: user.id }
             );
             if (profile?._id) {
               await backendClient.patch(profile._id).set({ email: user.email, name: user.name || "" }).commit();
             }
           } catch (error) {
             console.error("[AUTH] HOOK FAILED: userProfile sync on update.", { authId: user.id, error });
           }
         },
       },
     },
   },
   ```
   This one hook now covers **both** name changes (Phase 2) and email changes (this phase) — if you add this hook, the manual Sanity patch inside Phase 2's `updateName` server action becomes redundant. Simplify Phase 2's action to just call `auth.api.updateUser` and let this hook handle the Sanity mirror, if Phase 2 hasn't already shipped when you reach this point. If Phase 2 already shipped with its own inline patch, that's harmless (idempotent double-write of the same value) — no need to go back and remove it, but note it in the commit message.

4. **UI** — extend the same profile section from Phase 2 with an "Email" field. Follow the `requireFreshSession()` reauth pattern already used by `AccountActions.client.tsx`'s password-change action (fresh session check before allowing the change — email change is exactly the kind of sensitive action OWASP says should require it). On submit: call `authClient.changeEmail({ newEmail, callbackURL: "/account?emailChanged=true" })`. Show a "Check your new inbox to confirm" success state — the email does **not** change immediately, so don't update the displayed email until the user actually confirms via the link.

## Acceptance criteria

- Submitting a new email does not immediately change `session.user.email`.
- A confirmation email is sent (or console-logged in dev) to the **new** address, not the old one.
- Clicking the confirmation link updates `user.email` in the auth DB and `userProfile.email` in Sanity.
- Attempting the change without a fresh session redirects to `/sign-in` (same behavior as the existing change-password guard).
- Old email confirmation link, if better-auth also sends a heads-up to the old address by default, is left as default framework behavior — don't suppress it.
