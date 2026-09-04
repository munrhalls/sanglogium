# sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:46Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:15Z |
| parent | sang-logium-qz2 |

## dependencies

- blocks: sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address
- parent-child: sang-logium-qz2 — EPIC Checkout System Proof of Professional Level

## description

SINGLE RESPONSIBILITY: Verify slice S2 on the running checkout: from /checkout/shipping load with an address present until a delivery option and its price are stored and I am redirected to /checkout/payment.

PRECONDITIONS (once, before the children)
• Fresh localhost:3000 dev server with AlleKurier credentials configured (options appear on the shipping step); dev terminal visible.
• A basket + valid address already saved (S1 happy path).
• Chrome DevTools open. The "Przejdź do płatności" click sends one server-action POST whose body is a JSON array [rateId, priceInCents, methodName, carrier, estimatedDays]. Right-click it → Copy → "Copy as fetch" to replay with edited values from the Console.

ACCEPTANCE TESTS (epic level)
• When every child issue below is closed with a written pass/fail verdict for each of its checks, then this slice's gating questions are all honestly answered on a fresh localhost:3000.
• When any check answers no, then a separate bug issue exists for that defect, linked back to the child that found it.

CHILD ISSUES — run in this order (each is blocked by the previous one)
• sang-logium-qz2.2.1 — [S2 Shipping] Delivery price integrity and guards
• sang-logium-qz2.2.2 — [S2 Shipping] Carrier unreachable, hanging or misconfigured
• sang-logium-qz2.2.3 — [S2 Shipping] Parcel data, basket size and address changes
• sang-logium-qz2.2.4 — [S2 Shipping] Option list layout and states
• sang-logium-qz2.2.5 — [S2 Shipping] Option copy, estimates and Polish wording

CORRECTIONS MADE TO THE ORIGINAL LIST (2026-09-03 review)
• "Intercept the request" made concrete (Copy as fetch → edit → replay) so a human can actually do it.
• "Carrier returns an incomplete or malformed list" — a human cannot make AlleKurier return malformed JSON; replaced with the observable outcome (no "Unknown"/blank rows) plus the wrong-credentials path.
• "Carrier slow" made concrete via a non-routable hosts entry so the ~15 s cutoff is exercised.
• "Delivery size cannot be computed" made concrete: clear parcel data on one product in Studio.
• Polish grammar check given the concrete expected string ("5 dni roboczych").

RISK ASSESSMENT
Outcome risks:
• Scope creep into fixing everything a failing check reveals. Mitigation: children only produce pass/fail verdicts on the live checkout; each real defect found is filed as its own separate bug issue.
• Boundary crossing into an adjacent slice. Mitigation: only exercise interactions inside this slice's boundary; a failure whose cause lives in another slice is noted and filed against that slice.
• False positives from a stale build. Mitigation: the human runs each check against a fresh localhost:3000 and confirms the observed outcome in words.
Execution risks:
• Lean-path mandate (Issue Risk Protocol Part B): edit source only, hand every live check to the human on localhost:3000. No next build, no tsc/ts-check, no project lint, no test runs, no agent-run dev server, no browser automation for verification, no npm install, no git. Mitigation: if a "no" genuinely blocks the work, stop and say so in one line.
• hosts-file, .env and Studio edits made for a check must be reverted afterwards; the dev server restarted for hosts/.env changes.

OUT OF SCOPE
• Address validation.
• The payment total, the order write, stock, the receipt email.
• The shared checkout shell / stepper / error screen.

CURRENT STATUS: not started

SOURCE: slice S2 of docs/checkout/checkout-gating-questions.html
