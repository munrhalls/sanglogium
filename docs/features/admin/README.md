# Admin area
Owner-only area under `/manager`, and the emails that tell the owner what needs them. `requireOwner` in `features/admin/server.ts` decides who the owner is; anyone else gets Next's "page not found": no page, no data, no hint the page exists. Every claim here is proved in the [proof book](proof-book.md).

## Who is the owner
A signed-in account is the owner only when all of these hold:
- its email, trimmed and lower-cased, equals an entry of `OWNER_EMAILS` (comma-separated; each entry trimmed and lower-cased; empty entries dropped; `platform/utils/ownerList.ts`). Exact equality only; an empty email never matches;
- `emailVerified` is true and `twoFactorEnabled` is true;
- every linked sign-in method is `"credential"` and there is at least one (Better Auth asks for the two-factor code only on email sign-in, so an account that can sign in with Google is refused);
- the sign-in was at most 60 minutes ago (`now - signedInAt <= 3_600_000`).

The facts come from `getSignInFacts` (`features/auth/server.ts`), which reads the sign-in database itself, never Better Auth's 5-minute cookie copy. If `OWNER_EMAILS` is unset or empty, nobody is the owner.

## Configuration
- `OWNER_EMAILS`: comma-separated emails of the shop owner(s). They may open `/manager`, and the owner emails go to them.

## Pages
- `/manager` lists paid Stripe payments of the last 30 days with no Sanity order, leaving out payments refunded in full (read only; `getPaymentsWithoutOrder` checks the owner first). `next.config.ts` serves every `/manager` path as `private, no-store`.

## Owner emails
- `placeOrderFromPayment` (`features/checkout/commands/`) sends them through `sendOwnerNotice` (`features/checkout/adapters/resend/ownerNoticeEmail.ts`), so the browser return, the Stripe webhook and the daily sweep all tell the owner.
- A placed order: "New order … to pack", or "New order … is short of stock" with a `<product>: <n> missing` line per short item. It is sent only while the order is under 23 hours old (`features/checkout/core/rules/ownerNotice.ts`), so the daily sweep never repeats it.
- A payment whose order could not be made: "Payment … has no order: check it".
- Each email carries a Resend key (`order-placed/<payment>`, `payment-without-order/<payment>`), so the copies sent by retries within 24 hours go out once. If the order email fails, or no owner address is set, the webhook answers 500 and Stripe retries.
- The emails carry no customer name, email, address or phone.

## Proof
`node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/admin/load.mjs tests/admin/admin.test.ts`. See the [proof book](proof-book.md). GitHub runs it twice on every change (`.github/workflows/admin-proof.yml`).
