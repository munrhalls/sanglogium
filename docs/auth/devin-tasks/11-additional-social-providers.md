# Phase 11 — Additional social providers (Apple, GitHub, etc.)

**Priority: lowest — optional.** Only do this if explicitly requested; the original audit lists it as a gap but does not mark it urgent, and it has no functional/security implications the way phases 1–7 do.
**Depends on:** nothing technically. Reuses the exact pattern from phase 1's Google gating fix — do phase 1 first.
**Closes:** G8.

---

## Pattern to copy exactly

`lib/auth.ts`'s `socialProviders` block already establishes the correct pattern for optional providers:
```ts
socialProviders: {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
    : {}),
},
```

## What to build, per additional provider (repeat for each requested)

1. Add the same conditional spread to `socialProviders` for the new provider (e.g. `apple`, `github`), gated on that provider's required env vars (check better-auth's docs/types for the exact field names each provider needs — Apple in particular requires more than a client ID/secret pair, typically also a team ID and key ID; verify against `node_modules/better-auth/dist` types for the specific fields required before assuming it's a simple two-var pattern like Google).
2. Extend phase 1's `isGoogleAuthEnabled()` helper into a more general shape, e.g. `getEnabledSocialProviders(): string[]`, and pass that down to `SignInForm.tsx` instead of a single boolean, so the form can render a button per actually-configured provider.
3. Add a button per enabled provider, following the exact visual/structural pattern of the existing Google button.

## Acceptance criteria

- Each new provider's button appears only when its required env vars are all present.
- Existing Google behavior (including phase 1's conditional gating) is unaffected.
- No provider-specific secret is ever sent to the client — only the enabled/disabled boolean per provider.
