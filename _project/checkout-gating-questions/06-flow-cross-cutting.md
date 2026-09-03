# S6 — Flow + cross-cutting · Gating questions

Deliverable of `sang-logium-vdq.7`. Cluster for the **seams**, not the screens —
every adjacent transition, the shared shell / stepper / error screen, the
checkout state as one object, the guest-vs-account journey, and the happy path
end to end. Rubric, question format and leanness test: `00-rubric-and-slice-map.md`.
Written last, once clusters 01–05 exist, so it covers only what falls between or
across slices.

**Slice boundary.** Anything a customer experiences *between* two checkout
screens or *across all* of them: arriving at a step by URL, back / forward /
refresh / re-entry, session expiry and abandon-and-return, checkout state that is
too big or hand-edited, redirect loops, the step indicator, the shared header /
layout / fonts, the checkout-wide error screen, the English/Polish mix as a
whole, and the guest → account order journey. **Not** any single screen's
internal correctness — a broken address verdict is S1 (`vdq.2`), a silent
carrier-outage state is S2 (`vdq.3`), the payment total is S3 (`vdq.4`), the
order write is S4 (`vdq.5`), a success-branch's own rendering is S5 (`vdq.6`).

**Grounding for the question-writer** — scaffolding only, *not* part of the
deliverable; no term here may appear in a question. Written against
`lib/session.ts`, `app/checkout/{layout,error,page}.tsx`,
`app/checkout/_components/CheckoutStepper.tsx`, the guard blocks at the top of
`app/checkout/{address,shipping,payment,success}/page.tsx` and
`app/checkout/address/AddressForm.tsx` / `shipping/ShippingPageClient.tsx`,
`lib/checkout/mergeGuestOrders.ts`, `lib/auth.ts`:

- **All checkout state is one browser cookie** `checkout_session`: 1-hour
  lifetime, `httpOnly`, `sameSite: lax`, `secure` only in production, ~4KB
  browser ceiling. Its signing secret falls back to a shipped placeholder string
  when the real one is unset. It holds the basket (`{productId, quantity}` per
  line), the address, shipping fields, up to three payment-intent ids, and a
  trace id. There is no server-side copy — nothing reconstructs a lost or
  corrupted cookie.
- **The basket in the cookie is a snapshot taken at the "Checkout" click.**
  Changing the site basket afterwards (another tab, another device) does not
  update it. Prices are re-derived from the live catalogue at the payment step;
  quantities and line identity are whatever the snapshot holds.
- **Guards per step (redirect on failure):**
  `/checkout` → always `/checkout/address`.
  `/checkout/address` → no basket → `/basket`.
  `/checkout/shipping` → no address → `/checkout/address`; no basket → `/basket`.
  `/checkout/payment` → no basket → `/basket`; non-integer / <1 quantity →
  `/basket?error=invalid_basket`; no address → `/checkout/address`; no shipping
  cost → `/checkout/shipping`; **any line quantity > 10** →
  `/basket?error=excessive_quantity`; unknown product id or bad price → throws
  (checkout error screen); zero stock → `/basket?error=out_of_stock`; total < 1 →
  `/basket?error=invalid_total`.
  `/checkout/success` → no `payment_intent` → `/basket`; no session claim **and**
  no matching order → `/basket`.
- Choosing (re-saving) an address **clears any shipping option already stored**.
  Re-entering `/checkout/payment` after that lands on the no-shipping-cost guard
  → `/checkout/shipping`.
- **Shared shell** (`layout.tsx`): a minimal centered header holding only the
  brand logo (links to `/`), dark theme (`bg-brand-800`), `<html lang="en">`
  fixed for every step. No "exit checkout", no cart summary, no footer.
- **Stepper** (`CheckoutStepper`): four steps — Basket, Address, Shipping,
  Payment — rendered on the address (index 1), shipping (index 2) and payment
  (index 3) screens; **absent** on `/checkout` and on `/checkout/success`. Step
  **labels and the `aria-current` marker are hidden below the `lg` breakpoint** —
  on a phone only four icons show, with no text. "Basket" is never the active
  step (the basket page is outside the checkout layout).
- **Checkout-wide error screen** (`error.tsx`): a light-theme stock layout —
  grey body text, a black button, grey borders — on the otherwise dark checkout;
  English copy "Something went wrong", a "Try again" reset and a "Back to basket"
  link. It is what the customer sees when a step throws.
- **Language by step:** address screen English; shipping screen Polish
  (headings, buttons, helper text, empty/error copy); payment screen mostly
  English with some Polish payment-method wording; success and error screens
  English.
- **Address checker has no timeout anywhere**; a hung check leaves the submit
  button on "Verifying…" with no way forward.
- **Guest order → account merge:** fires from an auth hook when a user's email
  becomes verified — it re-assigns every order with `isGuest == true`, a matching
  `customerEmail`, and no owner, to that user. It does **not** run on plain
  sign-in without an email-verification event. Deleting an account strips the
  owner id back off the orders.
- Displayed currency was recently centralised through one formatter; carrier
  quotes and the charge itself are in PLN.

`answer:` stays `unknown` — filling it in is the downstream stress-test epic.

---

## A. I can't jump ahead by URL, or re-drive a finished checkout

### A1. Typing a later step's URL with an empty or partial checkout never reaches a pay screen
**Q.** When I open `/checkout/shipping`, `/checkout/payment` or `/checkout/success`
by typing the address directly — with nothing in checkout, or with only a basket,
or with a basket and address but no delivery chosen — am I always taken to the
earliest step I have not completed, and never shown a payment form or a
confirmation screen?
`dim: security, robustness` · `evidence: clear the checkout cookie (DevTools → Application → Cookies), then visit each of the three URLs in turn; repeat after completing only the address, then only address + shipping`
`answer: unknown`

### A2. Walking back through checkout URLs after a completed order can't create a second order or charge
**Q.** After I complete a payment, when I navigate back to `/checkout/payment`,
`/checkout/shipping` or `/checkout/address` by URL or the browser Back button, do
I get a coherent screen (a fresh checkout, my basket, or a "this checkout is
finished" notice) with **no** second Stripe charge and **no** duplicate order?
`dim: security, robustness` · `evidence: complete a test payment, then hand-type each earlier checkout URL and press Back repeatedly; check the Stripe dashboard for extra PaymentIntents and Sanity Studio for duplicate order docs` · `coordinates with vdq.4, vdq.5, vdq.6`
`answer: unknown`

### A3. A quantity limit that will block me is enforced before I spend time on address and shipping
**Q.** If there is an upper limit on how many of one item I can buy, do I hit it
in the basket with a stated reason — rather than passing address entry and
delivery selection and only then being bounced back to the basket?
`dim: robustness, trust` · `evidence: put 25 of one item in the basket, go through address and shipping, and see at which point I am stopped and what it tells me` · `coordinates with vdq.4` · policy-neutral per R6 — asks whether the limit is disclosed and applied early, not whether "10" is the right number
`answer: unknown`

---

## B. One person's checkout never leaks into another's

### B1. Two customers checking out at the same time never see each other's data
**Q.** When two people run checkout simultaneously, does each only ever see their
own basket, name, address and delivery choice — never the other person's, on any
step or after a refresh?
`dim: security` · `evidence: start checkout as two different people in two separate browsers (or one normal + one private window), advance both to the payment step, refresh each, compare what each shows`
`answer: unknown`

### B2. A new customer on a shared device does not inherit the previous person's checkout
**Q.** On a device where someone already went partway through checkout, when the
next person starts a new checkout, do they get a clean flow — their own basket,
an empty address form — rather than the previous person's address, basket or
step?
`dim: security, trust` · `evidence: fill the address step, abandon, then from the basket start checkout again as if a different customer; check the address form and basket contents`
`answer: unknown`

---

## C. Hand-edited or foreign checkout state is ignored, not trusted

### C1. Editing the checkout cookie to change the price or the items changes nothing I'm charged or sent
**Q.** When I hand-edit my checkout cookie to lower a price, raise a quantity,
add an item, or swap a product id, does the next screen — and the amount finally
charged and the final order — reflect only the real catalogue goods and prices
for what I legitimately put in my basket?
`dim: security` · `evidence: edit the checkout cookie value in DevTools, reload the payment step, read the total, complete payment, compare the Stripe amount and the Sanity order row to the basket I started with — **run this against the deployed site, not only localhost**` · `coordinates with vdq.4, vdq.5`
`answer: unknown`

### C2. A corrupted or foreign checkout cookie fails safe, not into a broken or trusting state
**Q.** When my checkout cookie is truncated, scrambled, or replaced with one
made elsewhere, am I sent cleanly back to the start of checkout (or the basket) —
rather than shown a stack trace, a blank page, or a checkout that proceeds on the
planted contents?
`dim: security, robustness` · `evidence: in DevTools replace the checkout cookie with a random string and with a base64 blob from another environment, then load each checkout step`
`answer: unknown`

---

## D. Session expiry and abandon-and-return explain themselves

### D1. When my checkout expires mid-flow I get an explanation, not a silent dump
**Q.** When my checkout has expired (I left it more than an hour), and I then act
on the page I was on — submit the address, click through to payment, or reload
the payment step — do I get a screen that says my checkout session expired and
what to do, rather than being dropped without a word onto the basket or the
address form?
`dim: robustness, trust` · `evidence: reach the shipping step, then the payment step; delete the checkout cookie (simulating expiry) or wait out the hour; interact with the page and observe where I land and what it says`
`answer: unknown`

### D2. Abandon and come back an hour later gives a clear state, not a half-filled ruin
**Q.** When I abandon checkout and return after the session has lapsed, do I get
either a clean fresh checkout or a clear "your previous checkout expired, start
again" message — never a page that is half-populated, stuck, or erroring from
stale fragments?
`dim: robustness, trust` · `evidence: complete address + shipping, close the tab, return after expiry via the basket "Checkout" button and via the `/checkout/payment` URL`
`answer: unknown`

### D3. Coming back within the hour resumes where I left off with my data
**Q.** When I return to checkout before the session expires, am I put back on the
step I reached with my basket, address and delivery choice still filled in —
without redoing earlier steps?
`dim: robustness, trust` · `evidence: reach the payment step, close the tab, reopen `/checkout/payment` (and the basket "Checkout" button) a few minutes later`
`answer: unknown`

---

## E. A large basket does not silently break checkout

### E1. A basket big enough to strain checkout storage keeps all its items or says so
**Q.** When I check out with a large basket (many distinct products, high
quantities), do all the items I had carry through every step and onto the order —
or, if that is too much for checkout to carry, am I told clearly — with nothing
silently dropped and no step suddenly erroring?
`dim: robustness` · `evidence: add 30–40 distinct products to the basket, start checkout, and at each step compare the item list / count against the basket; complete the order and check the order row`
`answer: unknown`

---

## F. Back, forward, refresh and re-entry keep my place and my data

### F1. Back and forward across every adjacent step pair preserves what I entered
**Q.** For each adjacent pair — address↔shipping, shipping↔payment — when I go
forward then Back (and forward again), is everything I entered still there: the
address fields, the selected delivery option, and the basket?
`dim: robustness, trust` · `evidence: walk the whole flow, then at each step use the browser Back and Forward buttons and check every field and selection`
`answer: unknown`

### F2. Refreshing any step keeps me on it with my data intact
**Q.** When I press reload on the address, shipping or payment step, do I stay on
that same step with my entered data still present — not bounced to an earlier
step and not shown an empty form?
`dim: robustness` · `evidence: reload each of the three steps after filling it`
`answer: unknown`

### F3. Changing the basket in another tab never leaves me paying an amount I did not see and approve
**Q.** When I have checkout open on the payment step and I change my basket in
another tab (or on my phone), is the amount I am asked to confirm always one that
matches what this checkout screen shows me — never a figure that reflects neither
the old basket nor the new one?
`dim: robustness, security` · `evidence: reach the payment step, in a second tab add/remove an item and change a quantity, return to the payment tab, reload, and compare the shown total, the Stripe PaymentIntent amount, and both basket states` · `coordinates with vdq.4`
`answer: unknown`

---

## G. The redirect web and the step indicator behave

### G1. Guard redirects never loop
**Q.** Is there any checkout state — a present address but empty basket, a
stored delivery choice but no address, a cleared cookie — that makes the browser
bounce between two checkout URLs or report "too many redirects" instead of
settling on one screen?
`dim: robustness` · `evidence: construct each partial state by editing the cookie, then load `/checkout/shipping` and `/checkout/payment` and watch the address bar`
`answer: unknown`

### G2. The step indicator always matches the screen I'm on, and tells me how far I am — on mobile too
**Q.** On every checkout screen, does the progress indicator mark the step I am
actually on, show which steps are done and which remain, and stay readable at
375 px — rather than showing icons with no labels, marking the wrong step, or
disappearing entirely on some screens?
`dim: trust, visual` · `evidence: walk address → shipping → payment → success at 375 px and at 1440 px, reading the indicator on each; note that the success screen has no indicator and mobile hides the step names`
`answer: unknown`

### G3. Changing my address after choosing delivery sends me back through delivery, not straight to payment on a stale rate
**Q.** When I go back and re-save my address after a delivery option was already
chosen, does checkout route me through the shipping step again to re-pick — never
letting me reach payment with a delivery price quoted for the earlier address?
`dim: security, robustness` · `evidence: pick a delivery option, return to the address step, re-submit a different city, then try to reach `/checkout/payment` directly; check which step I land on and what delivery price shows` · `coordinates with vdq.2, vdq.3`
`answer: unknown`

---

## H. The four steps look like one checkout

### H1. Header, background, stepper, cards and buttons are identical across address, shipping and payment
**Q.** At 375, 768 and 1440 px, do the address, shipping and payment steps share
the same header, background, progress indicator position, card style, primary
button style and page width — with no step that looks like it came from a
different design?
`dim: visual` · `evidence: screenshot all three steps at each width and compare side by side`
`answer: unknown`

### H2. The checkout error screen looks like the rest of checkout
**Q.** When a checkout step fails and the error screen appears, is it styled like
the surrounding checkout — same dark theme, same typography, same button
treatment, readable contrast — rather than a plain light-theme page that looks
unfinished?
`dim: visual, trust` · `evidence: force a step to throw (e.g. edit the cookie basket to reference an unknown product id, load `/checkout/payment`) and compare the error screen to the normal steps`
`answer: unknown`

### H3. Typography and spacing are consistent screen to screen at every breakpoint
**Q.** Walking the whole flow at 375, 768 and 1440 px, are heading sizes, body
text, field spacing and vertical rhythm consistent from screen to screen — no
step with noticeably tighter, looser, or differently-sized text?
`dim: visual` · `evidence: walk address → shipping → payment → success at each width, watching headings and spacing`
`answer: unknown`

---

## I. The bilingual store reads as deliberate

### I1. The English/Polish mix reads as an intentional bilingual store, not a half-done translation
**Q.** Walking basket → address (English) → shipping (Polish) → payment → success
(English), does the language mix read as a deliberate choice a real bilingual
store made — rather than one screen that somebody forgot to translate?
`dim: trust, visual` · `evidence: walk the full flow and note the language of every heading, button, helper line and error message` · `coordinates with vdq.3 (G1)`
`answer: unknown`

### I2. The page's declared language matches what is actually on screen
**Q.** On the Polish shipping step, does the browser (and a screen reader, and
the "translate this page?" prompt) treat the page as the language it is actually
written in — rather than announcing or offering to translate it as English?
`dim: trust` · `evidence: load `/checkout/shipping` in Chrome and watch for the translate prompt; run VoiceOver / NVDA on it and hear which language it reads`
`answer: unknown`

### I3. The amount is shown in one currency across every step, and it is the currency I'm charged in
**Q.** Do the delivery price, the payment-step total, the amount on the Stripe
sheet, and the confirmation figure all use the same currency and symbol — and is
that the currency my card is actually charged in?
`dim: trust, security` · `evidence: note the currency symbol on the shipping option, the payment total, the Stripe payment sheet, and the success screen; check the charged currency in the Stripe dashboard` · `coordinates with vdq.3, vdq.4, vdq.6`
`answer: unknown`

---

## J. The guest journey is honoured end to end

### J1. Guest checkout is clearly offered — I'm never forced to create an account to pay
**Q.** From the basket through to payment, can I complete the purchase without
creating an account, with the guest option visible and not buried under a
sign-in wall?
`dim: trust` · `evidence: sign out, start checkout, and go through to the payment step looking for any forced-registration gate`
`answer: unknown`

### J2. A guest order shows up in my account after I sign up with that email
**Q.** When I place an order as a guest and later create an account (or verify
my email) using the same address I checked out with, does that order appear in my
account's order history?
`dim: trust` · `evidence: complete a guest order with a given email, then register that email, verify it, and open the account orders page`
`answer: unknown`

### J3. A guest can find their order again without an account
**Q.** After a guest order, am I given something — an order number plus a lookup,
or a confirmation email with the details — that lets me check that order later
without signing in?
`dim: trust` · `evidence: complete a guest order and look at the confirmation screen and email for a way back to the order` · `coordinates with vdq.6 (F1)`
`answer: unknown`

---

## Handed to adjacent slices (not answered here)

- **A single step's internal correctness** — address verdicts (`vdq.2`), carrier
  outage / empty states (`vdq.3`), the payment total and intent (`vdq.4`), the
  order write and stock (`vdq.5`), each success branch's own rendering (`vdq.6`).
  This cluster only tests the transitions between them and what they share.
- **Whether the payment step re-derives the amount correctly** → `vdq.4`. F3 and
  C1 here establish that the seam hands a snapshot forward; the enforcement point
  is downstream.
- **Whether the guest order document is written correctly / the confirmation
  email is actually sent** → `vdq.5`. J2/J3 assume the order and email exist and
  only test that the guest can reach them.
- **The success page's own access gate and per-branch copy** → `vdq.6`. A2 here
  covers only re-entering the *earlier* checkout URLs after completion.

## Leanness note

29 candidates were drafted; 6 were cut by the leanness test (23 remain):

- "Is the checkout state stored server-side rather than in a cookie?" — R3,
  names a mechanism; the customer-visible concerns (forged contents, lost
  session, size limits) are C1, C2, D1 and E1 as outcomes.
- "Is the session cookie signed with a non-default secret?" — R3, names a
  secret. Its only observable consequence is "a customer can forge checkout
  state", which is C1.
- "Does the cookie set `httpOnly` / `secure` / `sameSite`?" — R3, cookie flags;
  a customer never inspects them. The outcomes (cross-site leakage, tampering)
  are B1/B2 and C1.
- "Is there a `loading.tsx` for each checkout route?" — idle test, answerable
  without running checkout; per-step loading behaviour is each slice's question.
- "Does the checkout layout render a footer / full site nav?" — R6-adjacent and
  subsumed: whether an exit affordance is needed is covered by J1 (not trapped)
  and the abandon path in D2.
- "Is `<html lang>` set correctly per route?" — rewritten as the observable I2
  (translate prompt + screen-reader language) rather than an attribute check.

Every remaining question names a specific victim on a "no": the customer who
skipped to a pay screen with a forged basket, saw another person's address,
was charged an amount they never approved, was dumped to the basket with no
explanation when their session lapsed, lost a full address form to a Back
button, got stranded in a redirect loop, could not tell which step they were on,
met a checkout that looks half-built or half-translated, was forced to register,
or lost track of a guest order; or the store owner underpaid via an edited
cookie, or holding an order for 40 items when only 12 were shipped.
