# sang-logium-qz2.3.5 — [S3 Payment] Trust copy, VAT, invoice and instalments

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:02Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:41Z |
| parent | sang-logium-qz2.3 |

## dependencies

- blocks: sang-logium-qz2.3.4 — [S3 Payment] Paying with test cards
- parent-child: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

## description

SINGLE RESPONSIBILITY: Prove nothing on the payment step overclaims.

ACCEPTANCE TESTS
• When I note the "VAT (included)" figure, then the same tax figure appears in the Studio order (pricing → tax) and on the confirmation screen.
• When I read the step as a company buyer, then it states that billing uses the delivery address and whether/how I can get an invoice with different billing details — not silent.
• When I check "Secure payment encrypted by Stripe" and the "Visa · Mastercard · BLIK" row, then each is literally accurate (Stripe hosts the fields; those brands are enabled in the Stripe test account).
• When the total is at least 50,00 zł, then the Klarna pay-later message shows a real offer for that amount in PLN; when below 50,00 zł it is absent.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
