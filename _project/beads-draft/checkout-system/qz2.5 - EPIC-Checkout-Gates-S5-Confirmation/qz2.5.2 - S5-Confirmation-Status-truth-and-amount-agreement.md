# sang-logium-qz2.5.2 — [S5 Confirmation] Status truth and amount agreement

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:15Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:05Z |
| parent | sang-logium-qz2.5 |

## dependencies

- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation
- blocks: sang-logium-qz2.5.1 — [S5 Confirmation] Access gate and data exposure

## description

SINGLE RESPONSIBILITY: Prove the page never says "confirmed" unless Stripe did, and every amount agrees.

ACCEPTANCE TESTS
• When I open the success URL of a declined (4000…3220 → Fail) or canceled (P24 cancel) PaymentIntent I own, then it never renders "Payment confirmed" with an amount.
• When I hand-create an Order in Studio whose paymentIntentId is a CANCELED test PI, then open its success URL in Incognito, then the page refuses to present it as a completed purchase. Delete the hand-made Order afterwards.
• When I read the amount in the green "Payment confirmed" card and the "Total" in Order Details, then they show the same figure.
• When I compare the confirmed amount to the PaymentIntent in the Stripe dashboard, then they match.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
