# sang-logium-qz2.5.7 — [S5 Confirmation] Promises, support links and next steps

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:23Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:57Z |
| parent | sang-logium-qz2.5 |

## dependencies

- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation
- blocks: sang-logium-qz2.5.6 — [S5 Confirmation] Layout across branches

## description

SINGLE RESPONSIBILITY: Prove every sentence and link on the confirmation branches is true and works.

ACCEPTANCE TESTS
• When Order Details show "Confirmation sent to: <email>", then an order-confirmation email actually reached that inbox (or, without RESEND_API_KEY, was printed to the dev terminal with that address).
• When I read "Tracking number will appear here once shipped" and "Estimated delivery date shown in order details", then each is something the order system actually does — no promise that can never be kept.
• When I click every support / contact link on every failure branch, then each resolves to a real page or working mailto — not a 404 (check /support in particular).
• When I compare the help affordance across branches, then the confirmed "Need help?" and every failure branch point to the same support destination.
• When I act on every affordance of the verification-failed and Stripe-unreachable screens, then I can copy the payment reference and reach support; and the confirmed screen says in plain words that nothing further is required from me.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
