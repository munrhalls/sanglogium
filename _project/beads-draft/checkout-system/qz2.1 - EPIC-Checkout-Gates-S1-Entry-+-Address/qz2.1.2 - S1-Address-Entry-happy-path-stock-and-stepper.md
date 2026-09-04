# sang-logium-qz2.1.2 — [S1 Address] Entry happy path, stock and stepper

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:43Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:30Z |
| parent | sang-logium-qz2.1 |

## dependencies

- parent-child: sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address
- blocks: sang-logium-qz2.1.1 — [S1 Address] Basket input integrity before checkout

## description

SINGLE RESPONSIBILITY: Prove the normal entry into the address step is correct and stock changes are honoured.

ACCEPTANCE TESTS
• When I double-click "Checkout" on the basket, then I land on exactly one address screen with no stuck "Processing…" and the Network tab shows one server-action POST.
• When I reach the address step, then I can see the items and quantities I am about to pay for (on the step or one obvious click away) before typing anything.
• When I enter a real, deliverable Polish address correctly, then it is accepted on the first "Continue to Shipping" and the "Continue with entered address" button never appears.
• When I set a basket product's stock to 0 in Studio (/studio → Product) while on the address step, then submit and continue through shipping, then I am sent back to the basket with a stated reason, never onto the payment form.
• When I am on the address step, then the progress indicator marks Address as current, Basket as done, Shipping / Payment as pending.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
