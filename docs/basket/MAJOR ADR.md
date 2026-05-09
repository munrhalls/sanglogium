# Major ADR: Split Basket Feature into Two Subproducts

## ADR #0: Data Fetching Library Selection (SWR vs React Query)

## Context
BasketManager needs to fetch CMS product data for items in the basket. The fetch should only trigger when new items are added, not on every basket change (removal, quantity changes).

## Decision
Use SWR instead of React Query. React Query's queryKey changes on every basket change (add, remove, quantity change), causing unnecessary refetches. The "only fetch when array grows" requirement requires manual tracking (useRef + useEffect + useState pattern) in both libraries. Switching to React Query would add a new dependency, provider setup, and test migration without removing any core logic.

## Consequences
- Positive: Avoids new dependency, no provider setup overhead, existing SWR implementation is already minimal correct solution
- Negative: Manual deduplication logic required (~15 lines), but this is inherent to the business requirement, not a library limitation

## Context
Basket feature combines global state management (persistence, cross-tab sync, product controls) with basket page rendering (inventory sync, item display). These have different technical concerns, failure modes, and user contexts.

## Decision
Split basket into two independent PRDs:
- non-local-basket: Global state, persistence, cross-tab sync, product controls
- basket-page: Dedicated page, CMS inventory fetch, available/unavailable item display

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

## ~~ADR #4: Removal of Cross-Tab Synchronization~~

## Context
Cross-tab synchronization was implemented using browser storage event API (ADR #3). However, this caused a critical race condition bug: storage events fire in ALL tabs including the originating tab, not just other tabs as incorrectly documented. The event handler would overwrite in-memory state with stale localStorage data, causing UI/storage mismatches (e.g., UI showing 11 items while localStorage contained 1 item with quantity 9).

## Decision
Remove cross-tab synchronization entirely. The feature is not critical for core basket functionality and introduces state corruption bugs. Single-tab persistence via Zustand persist middleware is sufficient for the use case.

## Consequences
- Positive: Eliminates race condition bug, simpler codebase, removes unnecessary complexity
- Negative: No automatic sync across browser tabs (users must refresh to see changes from other tabs)
