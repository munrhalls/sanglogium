# sang-logium-qz2.5.4 — [S5 Confirmation] Re-entry: Try again, Back, reload

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:18Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:02Z |
| parent | sang-logium-qz2.5 |

## dependencies

- blocks: sang-logium-qz2.5.3 — [S5 Confirmation] Order-write failures and uncertain states
- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation

## description

SINGLE RESPONSIBILITY: Prove leaving and returning to the confirmation never breaks state or charges twice.

ACCEPTANCE TESTS
• When I click "Try again" on the declined screen, then I return to a working payment step with basket and address present, not an emptied basket.
• When I press Back once after a confirmed order, then I see a coherent screen (basket or "checkout already complete"), not a broken payment page and not a second charge.
• When I reload the confirmed page 5 times and re-open it later, then it shows the same one order; Studio has one Order; Stripe one charge.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
