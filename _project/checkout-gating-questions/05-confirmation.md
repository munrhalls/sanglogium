# S5 — Confirmation slice · Gating questions

Deliverable of `sang-logium-vdq.6`. Cluster for the **Confirmation** slice.
Rubric, format and leanness test: `00-rubric-and-slice-map.md`.

**Slice boundary.** From `/checkout/success` load with a `payment_intent` param →
until the user leaves. Every status branch's rendering, the access gate, the
analytics event. Not the settlement / order-write / stock path (that is S5→`vdq.5`),
not the cross-cutting shell, stepper or headers (S6→`vdq.7`).

**Source it is written against**
(`app/checkout/success/{page,OrderDetails,RefreshButton,SuccessAnalytics.client}.tsx`,
`app/api/checkout/return/route.ts`, `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts`,
`lib/stripe.ts`):

- Guard order: no `payment_intent` → `/basket`. Then the **access gate** —
  `hasSessionClaim` = `session.completedPaymentIntentId === pi` **or**
  `session.lastPaymentIntentId === pi`. `lastPaymentIntentId` is set by the return
  handler for **any** PI it processes (declined, canceled, processing included),
  not only succeeded.
- **Sanity fallback (H-04).** If the session claim fails, the page queries
  `*[_type == "order" && paymentIntentId == $pi][0]`. Any match → the page renders;
  no match → `/basket`. The query does **not** check that the viewer owns the order.
- PI is retrieved server-side with `expand: ['latest_charge']` in `try/catch`; the
  catch renders a "we couldn't verify" card. `error=verification_failed` (set by
  the return handler's own catch) is checked **before** the PI retrieve and renders
  the same card.
- Branches keyed on live `pi.status`: `succeeded`, `requires_payment_method`
  (declined), `canceled`, `processing` (`RefreshButton`), plus verification-failed,
  Stripe-unreachable, and an "unexpected status" safety net. The `status` query
  param from the return handler is **not read** — only `pi.status` drives the UI.
- Succeeded branch shows `pi.amount` (Stripe, authoritative) formatted `pl-PL` /
  `PLN`, a payment-method hint from `latest_charge.payment_method_details`, a Suspense
  `<OrderDetails>` (re-queries the same Sanity order, `fallbackTotal={pi.amount}`),
  a static 4-step "what happens next" list, and Continue-shopping / View-my-orders /
  `mailto:` support links.
- `SuccessAnalytics` fires GA `gtag('event','purchase', { transaction_id: pi.id,
  value: pi.amount/100, currency:'PLN', items: [] })`, guarded by a `useRef` that
  resets on every fresh mount.
- Failure branches link support to **`/support`** — that route does not exist
  (`/contact` does). The succeeded branch's help card uses `mailto:support@sanglogium.com`.

`answer:` stays `unknown` — filling it in is the downstream stress-test epic.

---

## A. Access gate & confidentiality

### A1. Another customer's confirmation via their PI id
**Q.** Given a `payment_intent` id for someone else's order (Stripe ids are not
guessable, but they leak — a forwarded link, a `Referer` header, a shared screen, a
log line), when I open `/checkout/success?payment_intent=<that id>` while signed out
or signed in as a different account, am I sent to `/basket` instead of shown that
order?
`dim: security` · `evidence: copy a real completed-order PI id from one browser profile, paste the success URL in a fresh profile with no checkout cookie`
`answer: unknown`

### A2. What the fallback path exposes
**Q.** On that same non-owner view, does `OrderDetails` withhold the other person's
name, street address, e-mail and purchased items — i.e. is nothing beyond a generic
acknowledgement rendered?
`dim: security` · `evidence: same repro as A1, read the order-details card and page source`
`answer: unknown`

### A3. Query-param tampering can fake a failure
**Q.** When I take my own genuine confirmed order and append `&error=verification_failed`
(or another hand-picked param) to the URL, does the page still show my real
confirmation — rather than switching to the "your card may have been charged" screen
on attacker-controlled input?
`dim: robustness, security` · `evidence: open my own succeeded success URL, then reload it with &error=verification_failed added by hand`
`answer: unknown`

### A4. No card data beyond brand + last4
**Q.** Is the succeeded screen (rendered HTML and page source) free of any card
detail beyond brand + last-4 / wallet name — no PAN, expiry, CVC, or raw
`payment_method` / customer id?
`dim: security, trust` · `evidence: view-source and DOM dump of the succeeded page`
`answer: unknown`

---

## B. "Confirmed" means paid, and the amount is true

### B1. "Payment confirmed" never shown for a non-succeeded PI
**Q.** Does `/checkout/success` ever render "Payment confirmed" with an amount for a
`payment_intent` whose live Stripe status is `canceled`, `processing`,
`requires_payment_method` or anything other than `succeeded`?
`dim: trust, security` · `evidence: open the success URL for a canceled PI, a processing PI and a declined PI that I own`
`answer: unknown`

### B2. Charged but shown a failure page
**Q.** If Stripe reports the PI as `succeeded` but the return handler's catch fired
(so the URL carries `error=verification_failed`), does the screen still make clear the
payment likely went through and give a copyable reference and a working way to
confirm — rather than reading as an outright failure?
`dim: trust, robustness` · `evidence: force the return handler's PI-retrieve to throw once (block the Stripe host during the return hop), then land on /checkout/success`
`answer: unknown`

### B3. Card amount vs order-details total
**Q.** For one order, do the amount in the green confirmation card and the "Total"
in the order-details card show the same figure (or is any difference explicitly
explained)?
`dim: trust` · `evidence: read both numbers on one succeeded page`
`answer: unknown`

### B4. Amount comes from Stripe's captured record
**Q.** Is the confirmed amount the value Stripe actually captured for the PI, not a
session- or client-supplied figure?
`dim: trust, security` · `evidence: compare the displayed amount to the PI amount in the Stripe dashboard for the same order`
`answer: unknown`

### B5. Charged, but the order document is never written
**Q.** If the payment succeeds and both order-creation paths (return handler + webhook)
fail permanently, does the page still confirm the payment, show the amount, and show a
support reference — rather than sitting forever on "Generating your order receipt…"?
`dim: robustness, trust` · `evidence: block the Sanity order write, complete a test payment, wait on the success page`
`answer: unknown`

### B6. Order row exists but PI is not succeeded
**Q.** If a Sanity order document exists for a PI whose Stripe status is not
`succeeded` (stale write, manual row), does the page refuse to present it as a
completed purchase?
`dim: robustness, trust` · `evidence: point the success URL at a PI that has an order row but a canceled Stripe status`
`answer: unknown`

---

## C. Every branch reachable, correct, recoverable

### C1. Each status has an intentional screen
**Q.** Does every status I can actually arrive with — succeeded, declined, canceled,
processing, verification-failed, Stripe-unreachable — render a distinct, deliberate
screen with no raw stack trace, no blank page, and no infinite spinner?
`dim: robustness, visual` · `evidence: drive each case with Stripe test payment methods / by blocking the Stripe host, land on the success page each time`
`answer: unknown`

### C2. processing → Refresh → confirmed
**Q.** On the processing screen, when I press Refresh after the bank settles, does the
page move to the confirmed screen without a manual full reload and without a dead end?
`dim: robustness` · `evidence: pay with a delayed-settlement test method, click Refresh on the processing screen`
`answer: unknown`

### C3. "Try again" after a decline keeps the basket
**Q.** On the declined screen, does "Try again" return me to a working payment page
with my basket and address still present — not an emptied basket?
`dim: robustness, trust` · `evidence: decline a test card, click Try again, inspect the payment page`
`answer: unknown`

### C4. Back button after a confirmed order
**Q.** After a confirmed order, pressing the browser Back button once shows a coherent
screen (basket, or a "checkout already complete" notice) — not a broken payment page
and not a re-submitted charge?
`dim: robustness` · `evidence: complete a payment, press Back once on the success page`
`answer: unknown`

### C5. Reloading the confirmed page is idempotent
**Q.** Reloading or re-opening the confirmed success page repeatedly keeps showing the
same one order, with no duplicate order, no error screen, and no second charge?
`dim: robustness` · `evidence: reload the succeeded page five times, check Sanity for duplicate order docs`
`answer: unknown`

### C6. Order written late by the webhook
**Q.** When the order row is not yet written at first paint, does the "Generating your
order receipt…" state carry a working Refresh affordance and resolve to the real order
on the next refresh once the webhook lands, within a reasonable wait?
`dim: robustness, visual` · `evidence: open the success page immediately after payment (before the webhook), then refresh`
`answer: unknown`

---

## D. Analytics integrity

### D1. purchase event fires exactly once
**Q.** Does the GA `purchase` event fire once per completed order and not again on a
page reload or a `router.refresh()` of the success page?
`dim: robustness, trust` · `evidence: GA DebugView / network tab — reload the succeeded page and count purchase hits for the same transaction_id`
`answer: unknown`

### D2. purchase event carries the real basket and value
**Q.** Does the `purchase` payload include the order's line items and the correct PLN
value, so the owner's revenue and product reports are accurate — rather than
`items: []`?
`dim: trust` · `evidence: inspect the purchase event payload in GA DebugView`
`answer: unknown`

### D3. Nothing but id + amount leaves in the analytics payload
**Q.** Is the outbound `purchase` request (and the `Referer` header on it) free of
customer PII — no e-mail, name or address, and the `payment_intent` id present only
as the intended `transaction_id`?
`dim: security` · `evidence: DevTools network tab on the succeeded page, inspect the gtag request URL, body and Referer`
`answer: unknown`

---

## E. Visual polish

### E1. Confirmed screen at 375 / 768 / 1440
**Q.** At each of 375, 768 and 1440 px, does the confirmed screen — success card, then
the order-details / "what happens next" area — render with no overlap, no clipped
text, no horizontal page scroll, and collapse to a single column on mobile?
`dim: visual` · `evidence: resize the succeeded page at the three widths`
`answer: unknown`

### E2. Failure branches share one layout
**Q.** Do the declined, canceled, processing, verification-failed, Stripe-down and
unexpected screens all use the same card, width and spacing, and each stay within one
readable column at 375 px?
`dim: visual` · `evidence: view each branch at 375 px`
`answer: unknown`

### E3. Icon and colour match meaning
**Q.** On every branch, do the icon and colour match the state — success green,
hard error red, canceled neutral, processing "in progress" — with no green check on
any screen that is not a confirmation?
`dim: visual, trust` · `evidence: eyeball each branch`
`answer: unknown`

### E4. Skeleton matches the real order card
**Q.** Is the order-details loading skeleton the same shape and footprint as the
resolved order card, so the confirmed screen does not visibly jump when the order
loads?
`dim: visual` · `evidence: throttle the network, watch the skeleton→content swap`
`answer: unknown`

---

## F. Copy honesty & reaching a human

### F1. "Confirmation sent to" is only shown when a mail was sent
**Q.** Does "Confirmation sent to: &lt;email&gt;" appear only when an order-confirmation
e-mail was actually dispatched to that address?
`dim: trust` · `evidence: complete a guest checkout, check whether the shown address receives an e-mail` · `coordinates with vdq.5 (email path)`
`answer: unknown`

### F2. "What happens next" promises only what the store delivers
**Q.** Does the "what happens next" copy promise only things that actually happen —
no "tracking number will appear here" if there is no tracking, no delivery-date range
that is not real?
`dim: trust` · `evidence: read the copy against what the order system actually produces`
`answer: unknown`

### F3. Every failure branch has a link to a human that resolves
**Q.** On each non-succeeded branch, is there a "contact support" affordance whose
link resolves to a real page (not a 404)?
`dim: trust` · `evidence: click every support / contact link on every failure branch — note that failure branches currently link to /support, which 404s`
`answer: unknown`

### F4. Support destination is consistent across the slice
**Q.** Do the confirmed screen's "Need help?" and every failure branch point the
customer to the same support destination, rather than a `mailto:` in one place and a
broken `/support` in another?
`dim: trust` · `evidence: compare the help affordance across all branches`
`answer: unknown`

### F5. The "card may have been charged" screens are not a dead end
**Q.** On the verification-failed and Stripe-unreachable screens, can I both copy the
payment reference and reach support, so I am not stranded with a possible charge and
no next step?
`dim: trust, robustness` · `evidence: open the verification-failed screen, try to act on every affordance it offers`
`answer: unknown`

### F6. Confirmed vs processing state the opposite thing about my next action
**Q.** Does the confirmed screen say, in plain language, that nothing further is
required from me, while the processing screen clearly says the payment is not yet
settled?
`dim: trust` · `evidence: read both screens`
`answer: unknown`

---

## Handed to adjacent slices (not answered here)

- **Stepper / shell chrome** on the success page (should the checkout progress
  stepper be absent, is the shell right) → `vdq.7` (S6).
- **`Referer` / `Referrer-Policy` on all outbound requests** as a cross-cutting
  header concern → `vdq.7`; D3 covers only the analytics payload itself.
- **Whether the order document is written correctly / exactly once / stock
  decremented** → `vdq.5` (S5). B5, B6 and C6 here only test how the success page
  *behaves* when that path is slow or fails.
- **`/checkout/payment` re-entry rendering** after "Try again" → `vdq.4` (S3); C3
  here only checks the basket survives.

## Leanness note

31 candidates were drafted; 2 were cut by the leanness test (29 remain) — "does the page set a
`<title>`" (idle test — answerable without running checkout) and "is the success route
statically cached" (implementation, R3). Every remaining question names a specific
victim on a "no": the customer stranded, mischarged, shown someone else's data, or
misinformed; or the owner with corrupted analytics or an underpaid / unfulfilled order.
