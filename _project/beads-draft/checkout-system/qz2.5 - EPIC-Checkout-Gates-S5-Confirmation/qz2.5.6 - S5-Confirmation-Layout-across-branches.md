# sang-logium-qz2.5.6 — [S5 Confirmation] Layout across branches

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:21Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:59Z |
| parent | sang-logium-qz2.5 |

## dependencies

- blocks: sang-logium-qz2.5.5 — [S5 Confirmation] Purchase analytics event
- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation

## description

SINGLE RESPONSIBILITY: Prove every confirmation branch renders as one designed family at every width.

ACCEPTANCE TESTS
• When I view the confirmed screen at 375, 768 and 1440 px, then the success card and Order Details / "What happens next" render with no overlap, no clipped text, no horizontal scroll, one column at 375.
• When I view declined, canceled, verification-failed, Stripe-unreachable and "Unexpected payment status" at 375 px, then all share the same card width and spacing in one readable column.
• When I eyeball each branch, then icon and colour match the state (success green, hard error red, canceled neutral), with no green check on any non-confirmation screen.
• When I throttle the network (DevTools → Slow 3G) and watch the Order Details skeleton swap to content, then the skeleton has roughly the same height and shape, so the page does not jump.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
