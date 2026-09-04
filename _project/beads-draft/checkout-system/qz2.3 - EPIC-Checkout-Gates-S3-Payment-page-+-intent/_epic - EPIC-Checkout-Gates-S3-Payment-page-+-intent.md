# sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:47Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:16Z |
| parent | sang-logium-qz2 |

## dependencies

- blocks: sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping
- parent-child: sang-logium-qz2 — EPIC Checkout System Proof of Professional Level

## description

SINGLE RESPONSIBILITY: Verify slice S3 on the running checkout: from /checkout/payment load with a basket, address and stored delivery cost until clicking Pay hands me to Stripe and on to the return URL.

PRECONDITIONS (once, before the children)
• Fresh localhost:3000 dev server in Stripe TEST mode; Stripe test dashboard (Payments) open in another tab.
• Basket + address + delivery option saved (S1 and S2 happy path).
• Chrome DevTools open. On load the payment step sends one POST to /api/checkout/payment-intent-session with body {grandTotal, metadata}; Copy as fetch → edit → replay from the Console.
• Stripe test cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (declined inline), 4000 0000 0000 3220 (3-D Secure challenge — "Fail" gives a declined return).

ACCEPTANCE TESTS (epic level)
• When every child issue below is closed with a written pass/fail verdict for each of its checks, then this slice's gating questions are all honestly answered on a fresh localhost:3000.
• When any check answers no, then a separate bug issue exists for that defect, linked back to the child that found it.

CHILD ISSUES — run in this order (each is blocked by the previous one)
• sang-logium-qz2.3.1 — [S3 Payment] Amount integrity against client and catalogue changes
• sang-logium-qz2.3.2 — [S3 Payment] Provider and catalogue failure handling
• sang-logium-qz2.3.3 — [S3 Payment] Access guards and per-item cap
• sang-logium-qz2.3.4 — [S3 Payment] Paying with test cards
• sang-logium-qz2.3.5 — [S3 Payment] Trust copy, VAT, invoice and instalments
• sang-logium-qz2.3.6 — [S3 Payment] Layout, Stripe theming and forced states

CORRECTIONS MADE TO THE ORIGINAL LIST (2026-09-03 review)
• "Tamper the checkout cookie" removed — the cookie is encrypted; a human can only delete or corrupt it (covered in S6). Replaced with localStorage tampering after reaching payment.
• Apple Pay / Google Pay sheets removed — not reliably available on http://localhost; card, BLIK and 3-D Secure test flows cover decline/cancel.
• "Catalogue unreachable", "Stripe unreachable", "item deleted", "price lost" each given a concrete way to produce the state (hosts file / Studio).
• Card-decline split into inline decline (4000…0002) and redirect decline (3-D Secure fail), since only the latter exercises the return URL.
• Instalment message given its real threshold (50,00 zł) so presence and absence can both be checked.

RISK ASSESSMENT
Outcome risks:
• Scope creep into fixing everything a failing check reveals. Mitigation: children only produce pass/fail verdicts on the live checkout; each real defect found is filed as its own separate bug issue.
• Boundary crossing into an adjacent slice. Mitigation: only exercise interactions inside this slice's boundary; a failure whose cause lives in another slice is noted and filed against that slice.
• False positives from a stale build. Mitigation: the human runs each check against a fresh localhost:3000 and confirms the observed outcome in words.
Execution risks:
• Lean-path mandate (Issue Risk Protocol Part B): edit source only, hand every live check to the human on localhost:3000. No next build, no tsc/ts-check, no project lint, no test runs, no agent-run dev server, no browser automation for verification, no npm install, no git. Mitigation: if a "no" genuinely blocks the work, stop and say so in one line.
• hosts-file, .env and Studio edits made for a check must be reverted afterwards; the dev server restarted for hosts/.env changes.

OUT OF SCOPE
• The delivery option list.
• The order write, stock, the receipt email.
• The confirmation screen.
• The shared checkout shell / stepper / error screen.

CURRENT STATUS: not started

SOURCE: slice S3 of docs/checkout/checkout-gating-questions.html
