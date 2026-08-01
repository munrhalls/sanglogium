# Request for Proposal — Independent Checkout System Audit

## 1. Introduction

Sang Logium operates a Next.js e-commerce storefront with an integrated checkout system that carries customers from the basket page through address capture, shipping selection, payment, and post-purchase order visibility.

To ensure that no customer experiences a failure on either the happy path or at critical edge cases, we are seeking an independent, external auditor to conduct a thorough functional audit of the checkout system and produce a remediation-ready report.

## 2. Audit objectives

The primary objective is to verify that the checkout system is functionally complete, resilient, and safe for customers under all realistic scenarios.

Specifically, the auditor shall:

1. Validate the end-to-end happy path: basket → address → shipping → payment → success → order confirmation.
2. Identify failures, dead ends, data-loss risks, or incorrect pricing at every step.
3. Test edge cases including:
   - Empty, partial, or invalid baskets reaching checkout.
   - Stock changes, price changes, and product removal between basket and payment.
   - Shipping address validation failures and resubmission.
   - Payment declined, cancelled, processing, and unexpected status states.
   - Session expiry and multi-tab behaviours.
   - Guest checkout and authenticated-user checkout.
   - Mobile and desktop form-factor differences.
   - Concurrent payment-intent creation and duplicate order creation.
4. Assess the reliability of order creation, including both the synchronous return-handler path and the asynchronous Stripe webhook path.
5. Review the correctness of the order list and order-detail pages.
6. Confirm that recovery flows guide the user back to the correct step without data loss.

## 3. Scope

### In scope

- **Client pages**
  - `/basket`
  - `/checkout` (redirect to address)
  - `/checkout/address`
  - `/checkout/shipping`
  - `/checkout/payment`
  - `/checkout/success`
  - `/account/orders`
  - `/account/orders/[orderNumber]`

- **State and session**
  - `store/basketStore.ts`
  - `lib/session.ts` (iron-session checkout session)

- **Server actions**
  - `app/actions/checkout/index.ts`

- **API routes**
  - `app/api/basket/products/route.ts`
  - `app/api/basket/shipping-rates/route.ts`
  - `app/api/checkout/payment-intent-session/route.ts`
  - `app/api/checkout/return/route.ts`
  - `app/api/webhooks/stripe/route.ts`

- **Order creation**
  - `lib/checkout/createOrderFromPaymentIntent.ts`
  - `lib/checkout/mergeGuestOrders.ts`
  - Sanity order schema and related queries

- **Payment integration**
  - Stripe PaymentElement / ExpressCheckoutElement configuration
  - Payment-intent lifecycle (create, confirm, return, webhook)

### Out of scope

- Non-checkout areas of the site.
- CMS content migration or product-data quality beyond relevance to checkout.
- Marketing analytics and third-party tracking.

## 4. Deliverables

1. **Audit findings report** in plain English, including:
   - Executive summary with risk severity (critical / high / medium / low).
   - Step-by-step walkthrough of the happy path with evidence.
   - Catalogue of edge-case failures, attempted reproductions, and observed behaviour.
   - Root-cause analysis for each significant issue.
   - Prioritised remediation recommendations, including file/function references where applicable.

2. **Traceability matrix** mapping each tested scenario to the relevant pages, APIs, and business rules.

3. **Evidence package** with screenshots, logs, network traces, and test commands used.

4. **Regression test recommendations** for the checkout happy path and the highest-risk edge cases.

## 5. Access and environment

- Source code repository: `C:\webdev\sang-logium` (or equivalent Git remote).
- Staging environment with Stripe test-mode keys, test products, and test shipping rates.
- Credentials and permissions for authenticated-user checkout and order viewing.
- Access to checkout-event logs and Stripe Dashboard for test mode.

## 6. Timeline

- **Kick-off and access setup:** 1 business day.
- **Audit execution and testing:** 5 business days.
- **Report drafting and review:** 2 business days.
- **Total estimated duration:** 8 business days.

## 7. Acceptance criteria

The audit will be considered complete when:

- The happy path is documented and confirmed functional end-to-end.
- All edge cases in Section 2 have been exercised and documented.
- No critical or high-severity issues remain without a documented remediation plan or a management-approved risk acceptance.
- The deliverables listed in Section 4 are accepted by Sang Logium's product and engineering leads.

## 8. Proposal submission

Interested auditors should submit a proposal including:

- Approach and methodology.
- Estimated effort and cost.
- Relevant e-commerce or checkout-audit experience.
- Availability to start and projected completion date.

Please direct questions and proposals to [contact email].

---

**Sang Logium — Checkout System Audit Request**
