# End-User UX Acceptance Tests — Checkout System (as a Whole)
*Stack context: Next 15, React 19, iron-session, Stripe Elements, Google Address Validation, AlleKurier, Sanity CMS*
*Funnel: Basket → Address → Shipping → Payment → Return → Success*

**Funnel Navigation & Back/Forward Behavior**
- When I click "Checkout" from my basket, I see the address step immediately, with my basket items already accounted for.
- When I press the browser back button from the address step, I see my basket exactly as I left it.
- When I press the browser back button from the shipping step, I see my previously entered address still filled in on the address form.
- When I press the browser back button from the payment step, I see my previously selected shipping option still highlighted.
- When I try to jump straight to the shipping, payment, or success page by typing the URL directly (without completing the step before it), I am sent back to the step I actually need to complete first.
- When my basket is empty and I try to open any checkout step directly, I am sent back to my basket.
- When I refresh the page on any checkout step, I see my progress preserved, not an empty form or a restart from the beginning.
- When I look at the checkout page, I see a clear stepper showing which step I'm on and which steps are done, so I always know where I am.

**Address Step**
- When I open the address step, I see any address I entered before already filled in.
- When I submit an address, I see it accepted and I move to shipping automatically, without extra clicks.
- When I enter an address that can't be verified or is incomplete, I see a clear message telling me what to fix, not a generic error.
- When I fix a flagged address and resubmit, I see it accepted without needing to re-enter everything from scratch.
- When I go back and change my address after already choosing a shipping method, I see that I need to re-select shipping, and I am not charged for a shipping option that no longer matches my new address.
- When I enter my address, I only see the fields relevant to my country, not a generic form with fields that don't apply to me.

**Shipping Step**
- When I open the shipping step, I see real delivery options with real prices for my actual address and basket, not placeholder or generic pricing.
- When I select a shipping option, I see it clearly highlighted as chosen.
- When I pick a shipping method and continue, I see that exact method and price carried through to the payment step.
- When shipping rates take a moment to load, I see a clear loading state, not a blank or frozen screen.
- When shipping rates fail to load, I see a clear message and a way to retry, without losing my address.
- When my order is heavy or split across multiple parcels, I still see a single clear price and set of options, not confusing duplicate line items.
- When I use the shipping step on mobile, I can see and compare all delivery options without the page feeling cramped, and the continue button stays easy to reach.

**Payment Step**
- When I reach the payment step, I see a clear summary of exactly what I'm paying for: items, quantities, shipping method, and total price.
- When I look at the total on the payment page, I see it matches what I saw during shipping selection, with no surprise changes.
- When I open the payment step, I see the payment form ready to use within a moment, not stuck on a loading spinner.
- When my card, BLIK, or other local payment method is available, I see it offered as an option alongside card payment.
- When I'm on a device that supports Apple Pay or Google Pay, I see that option offered as a fast way to pay.
- When I enter invalid card details, I see a clear, specific error near the field that's wrong, not a generic "payment failed" message.
- When my payment is declined, I see why in plain language and I can immediately try a different payment method without restarting checkout.
- When I submit payment, I see a clear "processing" state so I know not to click again or close the tab.
- When I accidentally click "Pay" twice, I am not charged twice.
- When my payment takes a while to confirm (e.g. BLIK), I see a clear "processing" screen rather than an error or a stuck page.

**Order Confirmation & Success**
- When my payment succeeds, I land on a confirmation page showing my order number, items, total paid, and shipping address.
- When I see my order confirmation, I see an estimate of when my order will arrive.
- When I receive my order confirmation, I also receive a confirmation email with the same details.
- When I refresh the confirmation page, I still see my order details, not an error or blank page.
- When my payment is still processing at the moment I land on the confirmation page, I see a clear "we're confirming your payment" state with a way to check again, not a false failure message.
- When my payment fails or is canceled, I see a clear explanation and an easy way to go back and try again without re-entering my basket, address, or shipping choice.
- When I checked out as a guest, I see an easy option to create an account using the email I already provided, without retyping my order details.

**Time UX — Perceived Speed & Responsiveness**
- When I move from one checkout step to the next, I see the next step appear quickly, without a jarring full-page reload feeling.
- When any step is fetching data (address validation, shipping rates, payment setup), I see an immediate loading indicator, never a silent pause.
- When I type in a form field, I see my input register instantly, with no lag.
- When I click a primary action button (continue, select shipping, pay), I see immediate visual feedback that my click registered, before the next screen appears.
- When a background request fails (e.g. fetching a payment client secret), I see this handled gracefully with an automatic retry, not a frozen button.

**Error & Recovery**
- When any step fails to load due to a connection issue, I see a friendly message and a way to retry without losing what I already entered.
- When my session expires or times out mid-checkout, I see a clear explanation and I am guided back to a sensible restart point, not a cryptic error.
- When something goes wrong with my order after payment (e.g. an item went out of stock), I am told clearly what happened and what happens next, not left guessing.
- When I close the tab mid-checkout and come back later, I see my progress as I left it, as long as it hasn't expired.

**Trust & Clarity**
- When I go through checkout, I never see unexplained fees appear at a later step; totals only ever change when I change something myself (address, shipping, quantity).
- When I look at any price on any checkout step, I see it broken down clearly (subtotal, shipping, tax) so I understand what I'm paying for.
- When I'm asked for payment details, I see clear signals that the page is secure (e.g. recognizable payment provider UI, HTTPS).
- When I complete checkout, I see the same total I agreed to on the payment step reflected exactly on my confirmation and in my email.

**Mobile-Specific UX**
- When I go through checkout on mobile, every step's primary action button stays easy to reach with one hand, typically fixed near the bottom of the screen.
- When I fill in address or payment forms on mobile, I see the correct keyboard type for each field (e.g. numeric keyboard for postal code and card number).
- When I use the checkout stepper on mobile, I can still tell which step I'm on without it taking up excessive screen space.
- When I use Apple Pay or Google Pay on mobile, I can complete payment without ever typing my card details manually.

**Why this is better than a purely technical checklist**
- Every item describes a user action and an observable outcome, never internal implementation detail like "iron-session," "idempotency key," or "webhook."
- It treats the funnel as one continuous experience: back/forward, refresh, and session persistence are tested end-to-end, not just per-page.
- It tests trust and clarity as first-class UX concerns (price consistency, security signals, no surprise fees), which matter as much as raw functionality in a payment flow.
- It covers failure and edge paths (declined payment, expired session, out-of-stock after payment, double-click) as real user moments, not just the happy path.
- It covers mobile as real UX (reachable CTAs, correct keyboards, wallet payments), not just "responsive" as a buzzword.
- It avoids prescribing how developers should build it; it tells the team what a shopper must experience at every step of paying for their order.
