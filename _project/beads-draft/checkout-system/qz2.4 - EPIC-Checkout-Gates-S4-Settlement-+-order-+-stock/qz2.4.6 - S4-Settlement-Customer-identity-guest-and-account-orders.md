# sang-logium-qz2.4.6 — [S4 Settlement] Customer identity: guest and account orders

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:12Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:47Z |
| parent | sang-logium-qz2.4 |

## dependencies

- parent-child: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock
- blocks: sang-logium-qz2.4.5 — [S4 Settlement] References, receipt email and data hygiene

## description

SINGLE RESPONSIBILITY: Prove every order is attributable to a customer and reachable by them.

ACCEPTANCE TESTS
• When I complete a GUEST checkout (signed out), then somewhere before paying I was asked for an email and the Order's customerEmail holds it; if no email field exists anywhere, that is the fail.
• When a guest Order has no customerEmail, then that gap is visible to the owner in Studio (highlighted/flagged), not a silent blank.
• When I check out SIGNED IN, then the Order carries my userId with isGuest = false and appears under /account/orders.
• When I check out as a guest with an email on the order, then create and verify an account with that same email, then the order appears in /account/orders.
• When a guest's later sign-up uses a different email, or the guest order had no email, then the customer is told somewhere how to claim that order, rather than it never appearing.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
