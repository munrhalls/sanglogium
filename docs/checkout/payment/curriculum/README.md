# Payment Page — Visual Curriculum

**Goal:** Learn how the payment page works, from iron-session cookie to Stripe webhook, in 9 visual steps.

**Stack:** Next.js 15 App Router / iron-session / Stripe Payment Intents + Elements / Sanity CMS

---

## Quick Start

Read in order. Each file is one diagram + 2-3 sentences of context. ~2 minutes each.

| # | File | What You'll Learn |
|---|---|---|
| 1 | [01-architecture.md](01-architecture.md) | The 4-layer trust architecture — why the client never touches prices |
| 2 | [02-session.md](02-session.md) | What lives in the encrypted iron-session cookie |
| 3 | [03-funnel.md](03-funnel.md) | Session cascade guards — editing address forces re-selecting shipping |
| 4 | [04-server-flow.md](04-server-flow.md) | How the Server Component queries Sanity and calculates totals |
| 5 | [05-client-mount.md](05-client-mount.md) | How PaymentForm mounts Stripe Elements (the cookie bridge) |
| 6 | [06-confirm-payment.md](06-confirm-payment.md) | What happens when the user clicks Pay |
| 7 | [07-return-handler.md](07-return-handler.md) | How `/api/checkout/return` manages session lifecycle |
| 8 | [08-webhook.md](08-webhook.md) | The webhook order-creation gap (active P0 bug) |
| 9 | [09-end-to-end.md](09-end-to-end.md) | Full flow map — every file and its layer |

---

## One-Line Summary

> The client renders the form. The server calculates the total. Stripe handles the money. The webhook creates the order.
