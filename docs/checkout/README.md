# Checkout Documentation

## Quick orientation

| File / Folder | What it is |
|---|---|
| [`CHECKOUT-SYNOPSIS.md`](./CHECKOUT-SYNOPSIS.md) | **Source truth.** Full system trace — session, guards, all pages, external services, diagrams. 100% accurate to current source code. Start here. |
| [`ADR-002-checkout-inventory-concurrency.md`](./ADR-002-checkout-inventory-concurrency.md) | Architecture decision record for the tiered inventory concurrency strategy (OCC vs. soft reservation). |
| [`Q & A.md`](./Q%20%26%20A.md) | **Main Q&A intelligence document.** 65KB of design Q&A covering the full checkout system — what it should be and why. |
| [`Q & A - audit.md`](./Q%20%26%20A%20-%20audit.md) | Audit of the Q&A — gaps and red flags identified during design review. |
| [`q & a/`](./q%20%26%20a/) | Q&A by section (system architecture, basket, address, shipping, payment, return). |
| [`basket-page/`](./basket-page/) | UX/visual intelligence for the basket page. |
| [`global/`](./global/) | Global UX intelligence applying across all checkout steps. |
| [`payment/`](./payment/) | UX, data-functionality, implementation, and portfolio-evaluation intelligence for the payment page. |
| [`return/`](./return/) | UX/visual intelligence for the return + success flow. |
| [`shipping/`](./shipping/) | UX intelligence for the shipping page. |
| [`address/legacy_archived/`](./address/legacy_archived/) | Pre-archived address slice planning docs (Data Flow Whiteboard, Execution Plan, etc.). |
| [`_archive/`](./_archive/) | Archived outdated docs (old system synthesis, technical diagrams, slice planning specs, curriculum, acceptance tests). Do not reference for current state. |

## What's in `_archive/`

Planning-era and now-superseded documents:

- **Root:** `SYSTEM-SYNTHESIS.md` (outdated session interface + file paths), `TECHNICAL_DIAGRAM.md` (references Shippo, old webhook-only architecture), `Checkout plan.md` (reservation-based flow), `checkout-system-objective.md`, `definition-of-done.md`, `order-creation-preparedness-diagram.md`
- **payment/:** vertical slice specs (`01-foundation` → `04-integration`), curriculum, edge-cases.md
- **return/:** vertical slice specs (`01-foundation` → `05-integration`)
- **shipping/:** acceptance-tests, framed-objective, tasks-decomposition, pm-evaluation-trace
- **address/:** acceptance-tests, framed-objective, tasks-decomposition
- **basket-page/:** acceptance-tests, framed-objective
