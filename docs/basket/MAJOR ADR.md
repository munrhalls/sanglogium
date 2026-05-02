# Major ADR: Split Basket Feature into Two Subproducts

## Context
Basket feature combines global state management (persistence, cross-tab sync, product controls) with basket page rendering (inventory sync, item display). These have different technical concerns, failure modes, and user contexts.

## Decision
Split basket into two independent PRDs:
- non-local-basket: Global state, persistence, cross-tab sync, product controls
- basket-page: Dedicated page, CMS inventory sync, item sync comparision display, freeze checkout button until sync completes

## Consequences
- Positive: Clear separation of concerns, independent development streams, simpler testing, focused failure handling
- Negative: Two PRDs to maintain, coordination needed for shared interfaces
