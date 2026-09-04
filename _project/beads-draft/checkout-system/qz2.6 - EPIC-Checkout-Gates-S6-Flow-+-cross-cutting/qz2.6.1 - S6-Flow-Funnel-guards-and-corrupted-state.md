# sang-logium-qz2.6.1 — [S6 Flow] Funnel guards and corrupted state

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:24Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:18Z |
| parent | sang-logium-qz2.6 |

## dependencies

- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting

## description

SINGLE RESPONSIBILITY: Prove no checkout URL can be reached out of order or with broken state.

The whole checkout state is one encrypted cookie "checkout_session" (DevTools → Application → Cookies): it can only be deleted, truncated or replaced with garbage.

ACCEPTANCE TESTS
• When I type /checkout/shipping, /checkout/payment or /checkout/success directly with (a) no cookie, (b) only a basket, (c) basket + address but no delivery, then I am always taken to the earliest incomplete step and never shown a payment form or a confirmation.
• When I construct each partial state and load /checkout/shipping and /checkout/payment, then the browser settles on one URL with no bounce and no "too many redirects".
• When I navigate to /checkout/payment, /checkout/shipping or /checkout/address by URL or Back after completing a payment, then I get a coherent screen (fresh checkout, basket, or "this checkout is finished") — no second charge, no duplicate Order.
• When I truncate the cookie value to half, or replace it with "abc", and load each checkout step, then I am sent cleanly back to the start or the basket — no stack trace, no blank page.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
