# sang-logium-qz2.2.3 — [S2 Shipping] Parcel data, basket size and address changes

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:52Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:36Z |
| parent | sang-logium-qz2.2 |

## dependencies

- parent-child: sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping
- blocks: sang-logium-qz2.2.2 — [S2 Shipping] Carrier unreachable, hanging or misconfigured

## description

SINGLE RESPONSIBILITY: Prove options are computed for the real basket and the real address.

ACCEPTANCE TESTS
• When one basket product has no parcel dimensions or weight in Studio (clear them on a test product), then the shipping step shows a clear message and a way forward, not the generic "Something went wrong" screen.
• When the basket is heavy enough to need several parcels (e.g. quantity 10 of a heavy product), then options still show sane prices, or an explicit "contact us for a quote" — never an empty list or 0,00 zł.
• When I go back, change the postal code to a different city, re-submit and return to shipping, then the options and prices are for the new postcode (compare with a screenshot of the old list).
• When I reached shipping via the S1 escape hatch with a real-but-unusual address, then I still get usable options or a clear message, not a blank dead-end.
• When I choose an option and continue, then the payment step shows the same carrier, service level, price and delivery estimate.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
