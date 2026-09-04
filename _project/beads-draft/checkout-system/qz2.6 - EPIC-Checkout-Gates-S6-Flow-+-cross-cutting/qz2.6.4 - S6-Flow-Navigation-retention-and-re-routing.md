# sang-logium-qz2.6.4 — [S6 Flow] Navigation retention and re-routing

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:29Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:13Z |
| parent | sang-logium-qz2.6 |

## dependencies

- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting
- blocks: sang-logium-qz2.6.3 — [S6 Flow] Isolation, concurrency and large baskets

## description

SINGLE RESPONSIBILITY: Prove Back, Forward and reload never lose data or let stale choices through.

ACCEPTANCE TESTS
• When I go forward then Back (and forward again) across address → shipping and shipping → payment, then the address fields, selected delivery option and basket are all still there.
• When I reload the address, shipping and payment steps, then I stay on that step with my data present, not bounced earlier and not shown an empty form.
• When I go back and re-save my address after a delivery option was chosen, then I am routed through shipping again (payment unreachable by URL until I re-pick), never reaching payment with a price quoted for the old address.
• When I set quantity 11 in "basket-storage" before clicking Checkout, then I am stopped in the basket with a stated reason, not passed through address and delivery and then bounced to a basket that shows nothing.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
