# sang-logium-qz2.6.3 — [S6 Flow] Isolation, concurrency and large baskets

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:27Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:15Z |
| parent | sang-logium-qz2.6 |

## dependencies

- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting
- blocks: sang-logium-qz2.6.2 — [S6 Flow] Session expiry and return

## description

SINGLE RESPONSIBILITY: Prove checkouts never leak into each other and large baskets are handled or refused clearly.

ACCEPTANCE TESTS
• When two browsers (normal + Incognito) run checkout at once with different baskets and addresses, then each only ever sees its own data on every step and after refresh.
• When the next person starts a checkout in the same browser after someone got partway (new session after cookie expiry/deletion), then they get their own basket and an empty address form.
• When I have payment open in tab A and change the basket quantity in tab B, then pay in tab A, then the amount I confirm equals what the payment screen shows — never a figure matching neither basket.
• When I check out with 15 or more distinct products (quantities 1-3), then every item carries through to the Order in Studio — or I am told clearly what the limit is — with nothing silently dropped and no step erroring.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
