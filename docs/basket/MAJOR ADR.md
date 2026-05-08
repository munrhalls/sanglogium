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


## ADR #2: ~~Snapshot Data for Discrepancy Display~~ (REMOVED)

## ~~Context~~
~~Users add items at one price/stock level, but CMS data may change before checkout. Users need transparency about what changed since adding items.~~

## ~~Decision~~
~~Store displayPriceAtAdd and availableStockAtAdd at add time to compare with current CMS data on basket page, showing users discrepancies via strikethrough display before checkout.~~

## ~~Consequences~~
~~- Positive: Transparency (users see changes), simple implementation, no complex diffing~~
~~- Negative: Larger localStorage footprint, data stale until basket page visit~~

## Updated Decision
Removed snapshot data feature as overcomplication. Price and stock are now fetched live from CMS at display time, reducing complexity and localStorage footprint.


## ADR #3: Cross-Tab Synchronization Strategy

## Context
Users may have multiple tabs open; basket state changes in one tab should reflect in others automatically.

## Decision
Use browser storage event API for automatic cross-tab synchronization when localStorage changes via Zustand persist middleware. Events only fire in other tabs (not originating tab), sufficient for sync needs. Simpler than BroadcastChannel.

## Consequences
- Positive: Automatic sync, simple implementation, no additional dependencies
- Negative: Events only fire in other tabs, requires modern browser, manual refresh fallback

