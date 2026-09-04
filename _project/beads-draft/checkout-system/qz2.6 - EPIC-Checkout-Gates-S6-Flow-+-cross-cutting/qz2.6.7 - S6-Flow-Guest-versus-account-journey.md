# sang-logium-qz2.6.7 — [S6 Flow] Guest versus account journey

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:34Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:08Z |
| parent | sang-logium-qz2.6 |

## dependencies

- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting
- blocks: sang-logium-qz2.6.6 — [S6 Flow] Language and currency consistency

## description

SINGLE RESPONSIBILITY: Prove a guest can buy, and can later find the order.

ACCEPTANCE TESTS
• When I am signed out and go from basket to payment, then guest checkout is visibly offered and I am never forced to create an account to pay.
• When I place a guest order, then I am given an order number plus a lookup or a confirmation email that lets me check it later without signing in — if no email was ever asked for, that is the fail.
• When I place a guest order that has an email, then create and verify an account with that same email, then the order appears in /account/orders.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
