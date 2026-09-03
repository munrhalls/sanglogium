# S1 — Entry + Address slice · Gating questions

Deliverable of `sang-logium-vdq.2`. Cluster for the **Entry + Address** slice.
Rubric, question format and leanness test: `00-rubric-and-slice-map.md`.

**Slice boundary.** From the **"Checkout"** click on the basket page → until a
validated (or escape-hatched) address is stored and I am redirected to the
shipping step. Not the basket page's own correctness (pricing display, quantity
steppers, stock badges — those are the basket slice), not the shipping step's
internals (S2 → `vdq.3`), not the checkout shell / stepper / re-entry web
(S6 → `vdq.7`).

**Grounding for the question-writer** — scaffolding only, *not* part of the
deliverable; no term here may appear in a question. Written against
`app/components/features/checkout/{reservation/CheckoutButton,CheckoutPanel}.tsx`,
`app/components/features/basket/BasketSummary.tsx`, `app/actions/checkout/index.ts`
(`initCheckoutSession`, `saveAddress`), `app/actions/address/address.ts`,
`lib/address/teryt-validator.ts`, `app/checkout/{page,address/page,address/AddressForm}.tsx`,
`app/checkout/_components/CheckoutStepper.tsx`, `lib/session.ts`:

- The "Checkout" button sends `{ productId, quantity }` per line and nothing
  else — no price, no currency, no stock. `initCheckoutSession` writes that array
  straight into the session cookie with **no validation**: no productId
  existence check, no quantity clamp (negative / zero / huge all pass), no
  de-duplication, no stock check. Then it redirects to `/checkout/address`.
- The button is client-disabled while processing and when every line is
  out-of-stock (`availableStock === 0`); a tampered or replayed request is not
  subject to that guard. The address page's only guard is "basket array empty →
  `/basket`". There is **no** server-side out-of-stock guard on entry.
- Money is re-derived downstream from live catalogue prices at the payment-intent
  step; the shipping rate price is taken from the client and only checked as a
  positive integer. Stock is checked (non-atomically, non-blocking) only at
  settlement. So a planted price dies at entry, but a bad **quantity**, a
  duplicated line, an out-of-stock line, or a bogus productId is carried forward.
- Address form (English UI): first name, last name, phone, country
  (**Poland only** — the select has one real option), city, street, street
  number, postal code. All eight are HTML-`required`. No client-side postal
  pattern, no trim — a spaces-only value satisfies `required`.
- Submit → address checker. The **active** checker verifies the street + city +
  postal code against the official Polish address registry. Outcomes: `ACCEPT`
  (saved, redirect to shipping), `FIX` (form shows an inline banner + a
  "Continue with entered address" button appears). A `CONFIRM`-style verdict is
  possible from the frozen alternate checker but **the form only renders a
  message for `FIX`** — any other non-`ACCEPT` verdict re-enables the button with
  no message and no escape-hatch button.
- If the checker **throws / network-errors**, it fails soft → `ACCEPT` as
  entered. If it **hangs** (no timeout anywhere in the call path), the submit
  button sits on "Verifying…" indefinitely.
- The "Continue with entered address" escape hatch resubmits with validation
  skipped → `ACCEPT` as entered.
- On `ACCEPT`: the address is saved and **all previously chosen shipping fields
  are cleared** (`shippingCode/Cost/MethodName/Carrier/EstimatedDays`).
- The form re-hydrates from the **saved** address on mount (Back from shipping),
  but only if the user has not yet typed in the current visit. Un-saved edits
  are never persisted — only an `ACCEPT` writes the address.
- `saveEmailToSession` exists but is never called — no email is collected in
  this slice.
- Stepper: `CheckoutStepper currentStep={1}` → "Address" active, "Basket" passed.

`answer:` stays `unknown` — filling it in is the downstream stress-test epic.

---

## A. Basket contents can't be inflated, forged, or slipped past stock

### A1. A planted price never changes what I pay
**Q.** When I intercept the "Checkout" request and add or alter a price / currency
/ unit-amount field on a line, is the amount I am eventually asked to pay still
the real catalogue price of exactly what was in my basket?
`dim: security` · `evidence: DevTools → intercept the checkout button's request, inject "unit_amount": 1, proceed to the payment page, read the total; cross-check the PaymentIntent amount in the Stripe dashboard` · `coordinates with vdq.4`
`answer: unknown`

### A2. A tampered quantity can't produce an insane charge or order
**Q.** When I put a negative, zero, or absurdly large quantity on a line in the
"Checkout" request, am I stopped before payment with a clear message — rather
than that quantity travelling silently into the amount charged and the final
order row?
`dim: security, robustness` · `evidence: intercept the request, set quantity to -3, then 0, then 999999; proceed; inspect the address step, the payment total, and the order row in Sanity Studio`
`answer: unknown`

### A3. Duplicated or injected lines don't reach my order
**Q.** When I duplicate a basket line or add a product id that was never in my
basket to the "Checkout" request, do the payment total and the final order still
reflect only the items and quantities I actually had?
`dim: security` · `evidence: intercept the request, duplicate a line and append a foreign product id, complete checkout, compare the order row to the basket I started from`
`answer: unknown`

### A4. An out-of-stock item can't be forced onto the address step
**Q.** When I start checkout with an item that is out of stock — via a stale tab,
a double-submit, or an edited request — am I sent back to the basket rather than
allowed onto the address step?
`dim: security, robustness` · `evidence: open the basket with an in-stock item, let another tab sell it out (or edit the request), click Checkout, observe where I land`
`answer: unknown`

### A5. I can see what I'm buying before I enter personal data
**Q.** Before I commit my name, phone and address, can I see the items and
quantities I'm about to pay for — on the address step or one click away — so I'm
not entering personal data blind?
`dim: trust` · `evidence: reach the address step, look for an order summary or a way back to review without losing the form`
`answer: unknown`

---

## B. Address validation gives honest verdicts and never dead-ends

### B1. A genuine Polish address is accepted on the first try
**Q.** When I enter a real, deliverable Polish address correctly, is it accepted
and I move to the shipping step **without** needing the "Continue with entered
address" fallback?
`dim: robustness, trust` · `evidence: type a known-good Warsaw address (street, number, city, postal code) on :3000 and submit once`
`answer: unknown`

### B2. Every rejection says specifically what to check
**Q.** When my address is rejected, do I get a specific message naming what to
correct (street / city / postal code) rather than a bare "error", and is a way
to proceed always offered?
`dim: trust, robustness` · `evidence: submit an address with a real city but a nonexistent street; read the message and check that "Continue with entered address" appears`
`answer: unknown`

### B3. "Please fix" and "please confirm" are not the same message — and both let me through
**Q.** If the checker returns a "correct this" verdict versus a "confirm this
looks right" verdict, do I see a clearly different message for each, and in both
cases can I always continue (correct-and-resubmit, or accept-as-is) rather than
the button silently re-enabling with nothing shown?
`dim: robustness, trust` · `evidence: drive a FIX verdict and (if reachable) a CONFIRM verdict; after each, check whether a message and a forward action are present`
`answer: unknown`

### B4. A slow or unreachable checker doesn't strand me
**Q.** When the address check is slow, hanging, or down, can I still complete the
address step within a reasonable wait and with a clear explanation — rather than
the "Verifying…" button spinning forever with no way forward?
`dim: robustness, trust` · `evidence: in DevTools, first block the checker's host, then separately throttle it to hang; submit a valid address each time and wait`
`answer: unknown`

### B5. The escape hatch carries a bad address visibly, not silently
**Q.** When I use "Continue with entered address" with obviously wrong data, does
checkout still behave (no later crash) **and** is that address shown back to me
on the shipping and payment steps so I can still catch and fix it — not quietly
carried toward payment?
`dim: robustness, security` · `evidence: escape-hatch a deliberately broken address, continue, and read the address shown on the shipping and payment screens`
`answer: unknown`

---

## C. What I type into address fields is handled safely

### C1. Markup in an address field is inert everywhere it's later shown
**Q.** When I put HTML or a script snippet into any name / street / city field,
does it display as plain text — with nothing executing — everywhere it later
appears: the shipping step, the payment step, the order confirmation, the order
list, and the confirmation email?
`dim: security` · `evidence: submit "<img src=x onerror=alert(1)>" as the street, then walk every later surface and view source` · `coordinates with vdq.5, vdq.6`
`answer: unknown`

### C2. Whitespace-only required fields are rejected
**Q.** When I fill a required field with only spaces, am I stopped with a
specific message — rather than the blank value being saved and later showing as
an empty name or street on my order?
`dim: robustness` · `evidence: enter "   " in first name and in street, submit, then (if it passes) check the order row`
`answer: unknown`

### C3. A malformed Polish postal code is caught at the form
**Q.** When I enter a postal code that isn't in `NN-NNN` form, am I told
specifically that the postal code is wrong (not a generic address failure)?
`dim: robustness` · `evidence: enter "1234" / "00 000" / "abcde" as the postal code and submit`
`answer: unknown`

### C4. Empty required fields are blocked at the form with the field indicated
**Q.** When I leave any required field empty, is submission blocked and the
missing field pointed out, before any network request?
`dim: robustness` · `evidence: clear each field in turn and try to submit`
`answer: unknown`

---

## D. Double-submit and the Back button behave

### D1. Double-click or a slow connection lands me on exactly one address screen
**Q.** When I double-click "Checkout", or click it on a slow connection, do I
land on exactly one address screen — no duplicate start, no stuck spinner, no
second navigation?
`dim: robustness` · `evidence: throttle the network, double-click Checkout, watch navigation and the button state`
`answer: unknown`

### D2. Back from shipping keeps everything I typed, including un-saved edits
**Q.** When I press Back from the shipping step, is the address form still filled
with what I typed — including edits I made but had not successfully saved — not
blanked and not reverted to an older address?
`dim: robustness, trust` · `evidence: on the address step, change the city, trigger a rejection so the save doesn't complete, then navigate forward and Back; check the field values`
`answer: unknown`

---

## E. Changing my address invalidates stale downstream choices

### E1. Editing the address clears a shipping option already chosen
**Q.** When I go back and change my address after a shipping option was already
selected, is the old shipping method and price cleared, so I cannot pay against a
rate quoted for a different address?
`dim: security, robustness` · `evidence: pick a shipping option, return to the address step, change the city, resubmit; inspect the shipping and payment screens for the old rate`
`answer: unknown`

---

## F. Visual polish

### F1. Address form at 375 / 768 / 1440
**Q.** At each of 375, 768 and 1440 px, does the address form render with no
overlap, no clipped labels, no horizontal page scroll, and the paired fields
(first/last name, street/number) reflow to a single column on mobile?
`dim: visual` · `evidence: resize the address step at the three widths`
`answer: unknown`

### F2. Error banner and "Verifying…" state are unbroken
**Q.** Do the rejection banner and the loading ("Verifying…") button state each
render cleanly at 375 / 768 / 1440 with no layout jump and no awkward button
resize?
`dim: visual` · `evidence: force a rejection and watch a submit at each width`
`answer: unknown`

### F3. The escape-hatch button is visibly secondary
**Q.** Is "Continue with entered address" clearly secondary to the primary
"Continue to Shipping" button — lighter weight / colour, not competing for the
eye?
`dim: visual, trust` · `evidence: trigger a rejection so both buttons show, compare them at each width`
`answer: unknown`

### F4. The step indicator shows the right step
**Q.** On the address step, does the progress indicator mark Address as the
current step, Basket as done, and Shipping / Payment as pending?
`dim: visual` · `evidence: read the stepper on the address step`
`answer: unknown`

---

## G. UX clarity & trust

### G1. "Poland only" is clear before I fill the whole form
**Q.** Is it obvious, before I complete the form, that the store only ships within
Poland — rather than something I discover only when I open the country list and
find one option?
`dim: trust` · `evidence: land on the address step fresh and look for a stated shipping-region limit above the form`
`answer: unknown`

### G2. The reason a phone number is required is stated
**Q.** Is it stated, near the phone field, why a phone number is required (e.g.
courier contact) — rather than an unexplained mandatory personal detail?
`dim: trust` · `evidence: read the address step around the phone field`
`answer: unknown`

### G3. The escape hatch reads as a safe fallback, not "give up"
**Q.** Does "Continue with entered address" read as a safe option for a correct
address the checker didn't recognise — not as "proceed at your own risk" or "give
up on validation"?
`dim: trust` · `evidence: trigger a rejection and read the escape-hatch button and any surrounding copy`
`answer: unknown`

---

## Handed to adjacent slices (not answered here)

- **The amount is re-derived correctly** from live prices at the payment step,
  and **stock is enforced** at settlement → `vdq.4` / `vdq.5`. A1–A4 here only
  check that entry doesn't *pre-authorise* a bad number; the enforcement point is
  downstream.
- **Markup rendered on the confirmation page / order list / email** → `vdq.5`,
  `vdq.6`. C1 originates the injection in this slice and names the surfaces to
  walk.
- **Re-entering checkout with a changed basket while a stale shipping cost is
  still stored** (address is re-confirmed, but shipping may not be) → `vdq.7`
  (cross-cutting re-entry). E1 here only covers the in-slice address edit.
- **The shared checkout shell, `error.tsx`, header, fonts, language consistency**
  on the address step → `vdq.7`.

## Leanness note

26 candidates were drafted; 4 were cut by the leanness test (22 remain):
- "Does the country select default to Poland?" — subsumed by G1 (disclosure) and
  F1 (form correctness).
- "Is the traceId / correlation id present on the address request?" — R3, not
  observable; a customer never sees it.
- "Does the address step set a page `<title>`?" — idle test, answerable without
  running checkout.
- "Is there a 'same as billing' checkbox?" — R6, presumes a billing-address flow
  the store doesn't have (billing is derived from shipping).

Every remaining question names a specific victim on a "no": the customer
overcharged, undercharged into a rejected order, stranded on a spinner, shown an
unexplained rejection, blind to what they're buying, or served executing markup;
or the owner with an order for a negative / out-of-stock quantity, or an order
paid against a stale shipping rate.
