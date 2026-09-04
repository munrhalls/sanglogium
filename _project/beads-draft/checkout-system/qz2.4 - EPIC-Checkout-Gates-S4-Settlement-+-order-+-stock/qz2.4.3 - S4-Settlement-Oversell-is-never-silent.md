# sang-logium-qz2.4.3 — [S4 Settlement] Oversell is never silent

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:07Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:52Z |
| parent | sang-logium-qz2.4 |

## dependencies

- parent-child: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock
- blocks: sang-logium-qz2.4.2 — [S4 Settlement] Exactly one order and one stock decrement

## description

SINGLE RESPONSIBILITY: Prove the owner can see every oversell in Studio, not only in a terminal.

ACCEPTANCE TESTS
• When two Incognito windows each check out the last unit (stock 1) and pay within seconds, then the owner is not silently oversold: one order is refused/held, or the second is visibly flagged in Studio.
• When an order is placed for more units than exist (set stock to 1 in Studio while the shopper has quantity 2 on payment, then pay), then that Order stands out in the Studio list as needing attention.
• When any settlement would drive stock negative, then it is surfaced in Studio (flag / status / note on order or product), not only as an "order_stock_insufficient" terminal line.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
