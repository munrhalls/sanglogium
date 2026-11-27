# Admin area
Owner-only area under `/manager`. `requireOwner` in `features/admin/server.ts` decides who the owner is; anyone else gets Next's "page not found" — no page, no data, no hint the page exists.

## Who is the owner
A signed-in account is the owner only when all of these hold:
- its email, trimmed and lower-cased, equals an entry of `OWNER_EMAILS` (comma-separated; each entry trimmed and lower-cased; empty entries dropped). Exact equality only; an empty email never matches;
- `emailVerified` is true and `twoFactorEnabled` is true;
- every linked sign-in method is `"credential"` and there is at least one (Better Auth asks for the two-factor code only on email sign-in, so an account that can sign in with Google is refused);
- the sign-in was at most 60 minutes ago (`now - signedInAt <= 3_600_000`).

If `OWNER_EMAILS` is unset or empty, nobody is the owner.

## Configuration
- `OWNER_EMAILS`: comma-separated emails of the shop owner(s) allowed into `/manager`.

## Pages
- the `/manager` page lists paid Stripe payments of the last 30 days with no Sanity order (read only; `getPaymentsWithoutOrder` checks the owner first).

## Proof
```
node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/admin/load.mjs tests/admin/admin.test.ts
```
