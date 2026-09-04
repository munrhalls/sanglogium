# sang-logium-qz2 — EPIC Checkout System Proof of Professional Level

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:43Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:25Z |
| parent | None |

## description

ACCEPTANCE TESTS
• When every slice epic below is closed, then every gating question about the checkout — from the basket "Checkout" click to the order in Studio and the confirmation screen — has been answered yes on a fresh localhost:3000, so no customer and no store owner has a legitimate complaint about checkout.
• When any check answers no, then a separate bug issue exists for that specific defect, linked back to the child issue that found it, and the check is re-run after the fix.

CURRENT STATUS: not started

STRUCTURE
Master epic → 6 slice epics (run in order, each blocked by the previous) → 36 child issues of 3-5 live checks each (each blocked by the previous child in its slice). Splitting was done on 2026-09-03 so that no single issue carries more than ~5 checks and the human can stop, file bugs and resume at any point without losing sequence.

SLICE EPICS (in order)
• sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address (5 children)
• sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping (5)
• sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent (6)
• sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock (6)
• sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation (7)
• sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting (7)

SOURCE
Translated from docs/checkout/checkout-gating-questions.html (6 clusters, ~150 binary gating questions) into end-user acceptance tests for a human live check, then audited against the live code on 2026-09-03 (see each slice epic's CORRECTIONS MADE). Rubric and slice map in _project/checkout-gating-questions/00-rubric-and-slice-map.md. Supersedes the closed epic sang-logium-vdq.

## notes

2026-09-03 review: all 6 children's acceptance tests audited against the live checkout code. Removed/rewrote non-viable or hallucinated checks (Checkout-request price injection — no price in request; cookie price editing — cookie is encrypted and priceless; soft-vs-hard address verdict — only one verdict exists; Apple/Google Pay on localhost; processing-state branch; 30-40 product basket; screen-reader step). Every remaining check now states how a human produces the state (localStorage, hosts file, Studio, Stripe test cards/CLI). Each child has a CORRECTIONS MADE section.
