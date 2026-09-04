# sang-logium-qz2.6.2 — [S6 Flow] Session expiry and return

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:25Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:17Z |
| parent | sang-logium-qz2.6 |

## dependencies

- blocks: sang-logium-qz2.6.1 — [S6 Flow] Funnel guards and corrupted state
- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting

## description

SINGLE RESPONSIBILITY: Prove an expired or resumed checkout is always explained. Session lifetime is 1 hour; delete the "checkout_session" cookie to simulate expiry.

ACCEPTANCE TESTS
• When I delete the cookie while on the address step and press "Continue to Shipping", then I get a screen that says my checkout session expired and what to do — not a silent drop onto the basket.
• When I delete the cookie while on the payment step and reload, then the same: a stated "session expired, start again".
• When I abandon at shipping and return after expiry (delete cookie), then I get a clean fresh checkout or a clear "your previous checkout expired" — never a half-populated or erroring page.
• When I return within the hour (close the tab, reopen /checkout/payment), then I am back on the step I reached with basket, address and delivery filled, without redoing earlier steps.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
