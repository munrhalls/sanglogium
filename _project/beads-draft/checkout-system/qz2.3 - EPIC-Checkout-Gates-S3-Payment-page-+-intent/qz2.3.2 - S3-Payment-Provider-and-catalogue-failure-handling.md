# sang-logium-qz2.3.2 — [S3 Payment] Provider and catalogue failure handling

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:57Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:45Z |
| parent | sang-logium-qz2.3 |

## dependencies

- parent-child: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent
- blocks: sang-logium-qz2.3.1 — [S3 Payment] Amount integrity against client and catalogue changes

## description

SINGLE RESPONSIBILITY: Prove every upstream failure on the payment step is a clear, recoverable message — never the generic error screen.

ACCEPTANCE TESTS
• When I make Stripe unreachable (hosts: "127.0.0.1 api.stripe.com", restart dev server) and load /checkout/payment, then after the quiet retries I see the "Payment Error" card with a "Try Again" that actually re-attempts — not endless "Preparing secure payment…".
• When I make the catalogue unreachable (hosts: "127.0.0.1 <projectId>.api.sanity.io" and "127.0.0.1 <projectId>.apicdn.sanity.io"; projectId from .env NEXT_PUBLIC_SANITY_PROJECT_ID) and load /checkout/payment, then I get a clear "try again in a moment" with basket intact — not "Something went wrong".
• When I unpublish one basket product in Studio between shipping and loading /checkout/payment, then I get a clear message naming what to fix — not "Something went wrong" and not a total that silently drops the item.
• When I clear a basket product's price in Studio and load /checkout/payment, then the same: a clear message, not an error screen.
Revert hosts and Studio changes afterwards.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
