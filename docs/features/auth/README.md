# auth

Next in this group: [account](../account/README.md)

**Under construction.**
- Done: Better Auth on Turso with required email verification, per-endpoint rate limits, optional TOTP two-factor, account-deletion hooks.
- Left: user and profile creation are not atomic; a missing profile is created on the next authenticated page load (comment in auth.ts).
