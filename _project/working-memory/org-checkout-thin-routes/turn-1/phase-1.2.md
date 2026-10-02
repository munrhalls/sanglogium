AXIS org-checkout-thin-routes | TURN 1 of 1 | TASK AREA: checkout routes only compose (audit H1 checkout parts, H2) | PHASE 1.2 of 4 — queries into the data layer, payment page thinned

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1 (eslint.config.mjs is no longer touched).

GOAL
app/checkout/payment/page.tsx and app/api/checkout/payment-intent-session/route.ts contain no GROQ. The payment page holds guards, logging, redirects and composition only; price/label/total logic is pure feature code.

TASKS (in order)
1. Create sanity-cms/lib/products/getPaymentProducts.ts: export interface PaymentProduct { _id: string; name: string | null; price_data: { unit_amount: number } | null; stock: number | null; imageUrl: string | null } and export async function getPaymentProducts(ids: string[]): Promise<PaymentProduct[]> using client from "@/sanity-cms/lib/client" and the exact groq query now in app/checkout/payment/page.tsx. Import groq the same way the page does. Do NOT import from @/features here (the data layer does not depend on features).
2. Create sanity-cms/lib/products/getProductUnitAmountsByIds.ts: export async function getProductUnitAmountsByIds(ids: string[]): Promise<{ _id: string; price_data: { unit_amount: number } | null }[]> using getBackendClient() (same client the route uses today) and the exact query now in the payment-intent route.
3. app/api/checkout/payment-intent-session/route.ts: replace the getBackendClient().fetch(groq...) call with getProductUnitAmountsByIds(ids); remove the groq and getBackendClient imports if nothing else uses them.
4. Create features/checkout/domain/shippingLabel.ts: export function dedupeShippingLabel(carrier?: string, method?: string): string — body moved verbatim from the page.
5. Create features/checkout/domain/paymentSummary.ts (pure, no imports from server/sanity):
   - export interface PaymentProductInput { _id: string; name: string | null; price_data: { unit_amount: number } | null; imageUrl: string | null } (structural; PaymentProduct from the fetcher satisfies it)
   - export interface PaymentLineItem { productId: string; name: string; condition?: string; imageUrl: string | null; quantity: number; unitPrice: number; lineTotal: number }
   - export function buildPaymentLineItems(basket: { productId: string; quantity: number }[], products: PaymentProductInput[]): PaymentLineItem[] — the items mapping moved verbatim from the page, including the "Open Box" regex and displayName/condition logic.
   - export function calculateGrandTotal(subtotal: number, shippingCost: number): number — Math.round(subtotal + shippingCost).
   - export function computePaymentTotals(items: PaymentLineItem[], shippingCost: number): { subtotal: number; grandTotal: number; vatAmount: number } — subtotal = sum of lineTotal; grandTotal = calculateGrandTotal(subtotal, shippingCost); vatAmount = grandTotal - Math.round(grandTotal / 1.23). Formulas exactly as in the page today.
6. features/checkout/index.ts: add explicit named exports for dedupeShippingLabel, buildPaymentLineItems, calculateGrandTotal, computePaymentTotals and the types PaymentLineItem, PaymentProductInput (client-safe, pure).
7. app/api/checkout/payment-intent-session/route.ts: replace its final-rounding expression with calculateGrandTotal(subtotal, session.shippingCost) so the displayed total and the charged total share one formula. No other logic change in the route.
8. app/checkout/payment/page.tsx: use getPaymentProducts(ids); use buildPaymentLineItems and computePaymentTotals and dedupeShippingLabel from "@/features/checkout"; delete the local PaymentProduct interface, the local dedupeShippingLabel helper, the items mapping, the subtotal/grandTotal/vatAmount lines, and the imports of client and groq. Keep every guard, redirect, logCheckoutEvent call, the invalid-total redirect, the [PAYMENT PAGE] dev log, the metadata object and all JSX.
9. In the same page delete the dev-only block that starts at the comment "LIVE AUDIT CHECK LOGS" and ends at its closing brace (about 22 console.log lines listing "FIX #1 ... FIX #16"). It is stale debug output.

DONE CRITERIA
- [ ] git grep -n "_type ==\|from \"groq\"\|from 'groq'" -- app/checkout app/api/checkout prints nothing
- [ ] git grep -n "LIVE AUDIT CHECK" -- app prints nothing
- [ ] the three money formulas (sum of lineTotal, Math.round(subtotal + shippingCost), grandTotal - Math.round(grandTotal / 1.23)) each appear exactly once in the repo (features/checkout/domain/paymentSummary.ts)
- [ ] the page imports nothing from "@/sanity-cms" except getPaymentProducts; the route imports nothing from groq
- [ ] app/checkout/payment/page.tsx is at most 150 lines
- [ ] both fetcher query strings are byte-identical to the originals

OWNER LIVE CHECK (for the PR body)
- Add two products (one "Open Box" if available) to the basket, go through address -> shipping -> payment: line items, Open Box badge, shipping label, VAT row and grand total look exactly as before; the Stripe element renders; a Stripe test payment succeeds.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Behaviour must not change: moved logic stays verbatim, money formulas stay identical.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
