# Phase 10 — Two-factor authentication + "remember this device"

**Priority: low-medium.** Do not start until phases 1–7 are shipped and verified. This is the largest single phase in this set — if the agent's context budget is tight, split step 1 (plugin wiring) and steps 2–4 (UI) into two separate feeds.
**Depends on:** nothing technically.
**Closes:** G9, G10.

---

## What to build

### 1. Enable the plugin (server-side)

better-auth ships a `twoFactor()` plugin (check `node_modules/better-auth/dist` for the exact import path and config shape for this installed version — likely `better-auth/plugins`). Add it to `lib/auth.ts`'s `plugins: [nextCookies(), twoFactor({...})]` array. Standard config: TOTP-based (authenticator app), with backup codes. Do not build a custom TOTP implementation — use the plugin's.

### 2. Auth client

`lib/auth-client.ts`'s `createAuthClient` needs the matching client plugin (`twoFactorClient()` from `better-auth/client/plugins` or equivalent for this version) added to its plugin list so `authClient.twoFactor.*` methods become available.

### 3. UI — enrollment

New section on `/account` ("Two-Factor Authentication"): a "Set up 2FA" flow — request a TOTP secret/QR code from the plugin's enrollment endpoint, show the QR code (a small QR-rendering dependency may be needed — check if one is already in `package.json` before adding a new one), user confirms with a code from their authenticator app, plugin issues backup codes which must be displayed **once** with a clear "save these somewhere safe" warning.

### 4. UI — sign-in with 2FA

`SignInForm.tsx` needs a second step: after successful password verification, if the plugin reports 2FA is required, show a code-entry form instead of redirecting. Follow the existing `useActionState` two-phase pattern already used elsewhere in this form (it already branches on error states — extend that branching, don't rewrite the form).

### 5. "Remember this device" (G10)

The 2FA plugin typically supports a "trusted device" cookie so a user isn't asked for a code on every sign-in from the same browser. Wire this in as a checkbox on the 2FA code-entry step ("Remember this device for 30 days" or the plugin's default). This closes G10 (the audit's "no persistent-login control" gap) as a side effect of the 2FA work — a standalone "remember me" control unrelated to 2FA is not worth building separately since the session is already fixed at a reasonable 7 days.

## Acceptance criteria

- User can enroll in 2FA via an authenticator app QR code.
- Backup codes are shown exactly once at enrollment.
- Sign-in with 2FA enabled requires the TOTP code before granting a session.
- "Remember this device" skips the code prompt on a subsequent sign-in from the same browser within the configured window.
- Existing password-only sign-in flow is unaffected for users who haven't enrolled in 2FA.
