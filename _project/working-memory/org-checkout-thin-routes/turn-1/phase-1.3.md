AXIS org-checkout-thin-routes | TURN 1 of 1 | TASK AREA: checkout routes only compose (audit H2, M7 .frozen) | PHASE 1.3 of 4 — success page thinned, .frozen suffix removed

Prerequisite: phases 1.1 and 1.2 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
app/checkout/success/page.tsx keeps only: the privacy guard, session/claim gate, logging, the Stripe status lookup and the status branching. All presentation and the payment-method label logic live in the feature.

TASKS (in order)
1. Create pure presentational components in features/checkout/ui/, JSX moved verbatim (same classNames, same icons, same copy) from app/checkout/success/page.tsx. No "use client" (none use hooks). Icons import from '@phosphor-icons/react/dist/ssr' as today.
   - PaymentVerificationFailed.tsx — prop paymentIntentId: string. This markup appears twice in the page (the error === 'verification_failed' branch and the retrievePaymentIntent catch branch); both use this one component.
   - PaymentDeclined.tsx — prop message: string.
   - PaymentCanceled.tsx — no props.
   - PaymentProcessing.tsx — prop paymentIntentId: string; renders the existing RefreshButton from "./RefreshButton".
   - PaymentUnexpectedStatus.tsx — prop paymentIntentId: string.
   - OrderDetailsSkeleton.tsx — the OrderDetailsSkeleton function from the page.
   - OrderNextSteps.tsx — the right-hand "flex flex-col gap-4" column of the succeeded view (What happens next card, Continue shopping / View my orders links, Need help card).
2. Create features/checkout/domain/paymentMethodHint.ts: export function getPaymentMethodHint(latestCharge: Stripe.PaymentIntent['latest_charge']): string | null, with "import type Stripe from 'stripe'" (type-only; lib/stripe.ts uses the same default import). Body = the IIFE from the page, verbatim (charge object check, type switch for blik/p24/paypal/klarna/link/card, wallet and brand+last4 branches, default returns type ?? null).
3. Create features/checkout/ui/PaymentConfirmed.tsx (server-safe, imports OrderDetails from "./OrderDetails", OrderDetailsSkeleton, OrderNextSteps, SuccessAnalytics from "./SuccessAnalyticsClient", Suspense from react, formatPrice from "@/lib/utils/price"). Props: { paymentIntentId: string; amount: number; latestCharge: Stripe.PaymentIntent['latest_charge'] }. It renders the whole succeeded view verbatim from the page: SuccessAnalytics transactionId={paymentIntentId} value={amount}, the "Payment confirmed" card with formatPrice(amount) and the hint from getPaymentMethodHint(latestCharge), and the two-column grid with Suspense around OrderDetails (paymentIntentId, fallbackTotal={amount}) and OrderNextSteps.
4. Exports. features/checkout/index.ts: add PaymentVerificationFailed, PaymentDeclined, PaymentCanceled, PaymentProcessing, PaymentUnexpectedStatus, OrderDetailsSkeleton, OrderNextSteps and getPaymentMethodHint (explicit named exports). features/checkout/server.ts: add PaymentConfirmed (it pulls in the server-only OrderDetails, so it is server-entry only).
5. app/checkout/success/page.tsx: rewrite the body to use the new components. Keep exactly: redirect when payment_intent is missing; getCheckoutSession and traceId; all logCheckoutEvent calls and their event names; hasSessionClaim and the Sanity-order fallback gate (using getOrderByPaymentIntentId from "@/features/checkout/server"); the retrievePaymentIntent try/catch; the succeeded / requires_payment_method / canceled / processing / unexpected branching and the logging line before the non-succeeded branches; the declineMessage derivation. Remove unused imports (Suspense, icons, formatPrice, RefreshButton, SuccessAnalytics, Link if unused).
6. features/checkout/actions.ts and the .frozen module. git mv features/checkout/adapters/googleAddressValidator.frozen.ts features/checkout/adapters/googleAddressValidator.ts (a suffix is not a mechanism; the code is already gated by ADDRESS_VERIFY_MODE === "google"). Update the import in actions.ts and the two comments that cite "google-address-validator.frozen.ts" so they name googleAddressValidator.ts. In the moved file's header comment fix the stale paths: the TERYT verifier is features/checkout/adapters/terytValidator.ts and the caller is features/checkout/actions.ts (not lib/address/teryt-validator.ts / address.ts). Keep the "NOT in active use / re-enable with ADDRESS_VERIFY_MODE=google" warning text.
7. features/checkout/adapters/allekurierRates.ts near line 199: the comment cites the non-existent docs/checkout/shipping/Q & A.md. If docs/checkout/allekurier-rate-validation-criteria.md contains the mapping, point to it; otherwise delete the path sentence. (docs/ is edited by another axis; do not edit docs.)

DONE CRITERIA
- [ ] app/checkout/success/page.tsx is at most 110 lines and contains no JSX card markup except the component calls and the Suspense-free structure
- [ ] each moved JSX block is verbatim: pick three distinctive className strings per new component (e.g. "card-base", "type-section-sub", "bg-success-500") and confirm each still appears in exactly the new component, not duplicated in the page
- [ ] git grep -n "frozen" -- features app shows no filename reference to a .frozen file
- [ ] git ls-files features/checkout/adapters lists googleAddressValidator.ts and no *.frozen.ts
- [ ] PaymentConfirmed is exported from server.ts only; the other new components and getPaymentMethodHint from index.ts
- [ ] OrderDetailsSkeleton contains its h-4 / h-3 / h-px / h-5 classes unchanged (mention in the PR body for the owner's height/sizing review)

OWNER LIVE CHECK (for the PR body)
- Complete one Stripe test payment: the success page shows "Payment confirmed", amount, "via <method>", the order details (skeleton first, then details), the next-steps column.
- With a test card that declines (4000 0000 0000 0002), the declined card shows with "Try again". Load /checkout/success?payment_intent=<an old id> in a fresh session: redirected to /basket.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Moved JSX stays verbatim (no className edits, no reformatting). Mandatory height/sizing review: this PR moves classNames under features/**/ui/** without editing them; say so in the PR body.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
