# Checkout System — beads draft

Exported unmodified from beads on 2026-09-04, then removed from the tracker.
Tree mirrors the epic hierarchy: master epic + 6 slice epics + 36 child issues.

- **qz2** — EPIC Checkout System Proof of Professional Level  (`qz2 - EPIC-Checkout-System-Proof-of-Professional-Level.md`)
  - **qz2.1** — EPIC Checkout Gates S1 Entry + Address
    - qz2.1.1 — [S1 Address] Basket input integrity before checkout
    - qz2.1.2 — [S1 Address] Entry happy path, stock and stepper
    - qz2.1.3 — [S1 Address] Field validation and unsafe input
    - qz2.1.4 — [S1 Address] Registry outage, escape hatch and explanatory copy
    - qz2.1.5 — [S1 Address] Back navigation and responsive layout
  - **qz2.2** — EPIC Checkout Gates S2 Shipping
    - qz2.2.1 — [S2 Shipping] Delivery price integrity and guards
    - qz2.2.2 — [S2 Shipping] Carrier unreachable, hanging or misconfigured
    - qz2.2.3 — [S2 Shipping] Parcel data, basket size and address changes
    - qz2.2.4 — [S2 Shipping] Option list layout and states
    - qz2.2.5 — [S2 Shipping] Option copy, estimates and Polish wording
  - **qz2.3** — EPIC Checkout Gates S3 Payment page + intent
    - qz2.3.1 — [S3 Payment] Amount integrity against client and catalogue changes
    - qz2.3.2 — [S3 Payment] Provider and catalogue failure handling
    - qz2.3.3 — [S3 Payment] Access guards and per-item cap
    - qz2.3.4 — [S3 Payment] Paying with test cards
    - qz2.3.5 — [S3 Payment] Trust copy, VAT, invoice and instalments
    - qz2.3.6 — [S3 Payment] Layout, Stripe theming and forced states
  - **qz2.4** — EPIC Checkout Gates S4 Settlement + order + stock
    - qz2.4.1 — [S4 Settlement] Only genuine payments become orders
    - qz2.4.2 — [S4 Settlement] Exactly one order and one stock decrement
    - qz2.4.3 — [S4 Settlement] Oversell is never silent
    - qz2.4.4 — [S4 Settlement] Order content matches what was paid
    - qz2.4.5 — [S4 Settlement] References, receipt email and data hygiene
    - qz2.4.6 — [S4 Settlement] Customer identity: guest and account orders
  - **qz2.5** — EPIC Checkout Gates S5 Confirmation
    - qz2.5.1 — [S5 Confirmation] Access gate and data exposure
    - qz2.5.2 — [S5 Confirmation] Status truth and amount agreement
    - qz2.5.3 — [S5 Confirmation] Order-write failures and uncertain states
    - qz2.5.4 — [S5 Confirmation] Re-entry: Try again, Back, reload
    - qz2.5.5 — [S5 Confirmation] Purchase analytics event
    - qz2.5.6 — [S5 Confirmation] Layout across branches
    - qz2.5.7 — [S5 Confirmation] Promises, support links and next steps
  - **qz2.6** — EPIC Checkout Gates S6 Flow + cross-cutting
    - qz2.6.1 — [S6 Flow] Funnel guards and corrupted state
    - qz2.6.2 — [S6 Flow] Session expiry and return
    - qz2.6.3 — [S6 Flow] Isolation, concurrency and large baskets
    - qz2.6.4 — [S6 Flow] Navigation retention and re-routing
    - qz2.6.5 — [S6 Flow] Shared shell, stepper and error screen
    - qz2.6.6 — [S6 Flow] Language and currency consistency
    - qz2.6.7 — [S6 Flow] Guest versus account journey
