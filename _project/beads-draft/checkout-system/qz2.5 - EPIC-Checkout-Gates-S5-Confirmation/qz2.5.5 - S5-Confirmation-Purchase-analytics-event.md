# sang-logium-qz2.5.5 — [S5 Confirmation] Purchase analytics event

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:19Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:00Z |
| parent | sang-logium-qz2.5 |

## dependencies

- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation
- blocks: sang-logium-qz2.5.4 — [S5 Confirmation] Re-entry: Try again, Back, reload

## description

SINGLE RESPONSIBILITY: Prove the purchase event is correct, single, and PII-free. Only checkable if NEXT_PUBLIC_GA_MEASUREMENT_ID is set in .env — otherwise close as N/A with a note.

ACCEPTANCE TESTS
• When I reload the succeeded page several times, then window.dataLayer (Console) shows one "purchase" entry per load, and the Network request to google-analytics.com/g/collect shows one purchase per completed order across reloads — not one per reload.
• When I inspect the purchase entry, then items lists the order's line items and value equals the paid total in PLN — not items: [] and not currency "USD".
• When I inspect the collect request and its Referer, then it carries no name, email or address — only transaction id and amount.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
