---
description: Basket page data flow — from page mount to render, including High Water Mark pattern and mutation handling
---

# Basket Data Flow

```mermaid
graph LR
    A[1. Page Mounts] --> B{BasketManager<br/>Has items?}
    B -->|No| C[EmptyBasket]
    B -->|Yes| D[2. Read BasketStore]
    D --> E[3. Build trackedIds<br/>High Water Mark]
    E --> F{SWR Cache<br/>Data cached?}
    F -->|Miss| G["/api/basket/products"]
    G --> H[Sanity CMS]
    H --> I[4. Return price,<br/>stock, reservedStock]
    F -->|Hit| I
    I --> J[5. Parser:<br/>cents → zloty]
    J --> K[6. Availability:<br/>available / unavailable]
    K --> L[7. Render<br/>BasketItem + Summary]

    L --> M{User action?}
    M -->|Qty / Remove| N[8. Update Store<br/>+ localStorage]
    N --> O[trackedIds unchanged<br/>No re-fetch]
    O --> L
    M -->|Add new| P[9. trackedIds expands]
    P --> E
```

## Steps

1. **Page Mounts** — Route entry point (`app/(store)/basket/page.tsx`) mounts.
2. **Read BasketStore** — `BasketManager` reads product IDs and quantities from the Zustand store.
3. **Build trackedIds** — High Water Mark pattern: `useState` only ever adds IDs, never subtracts.
4. **Return product data** — SWR fetches from `/api/basket/products` (cache miss) or returns cached data (cache hit).
5. **Parser** — Converts CMS price from cents to display currency.
6. **Availability** — Splits items into available vs. unavailable based on live stock.
7. **Render** — `BasketItem` and `BasketSummary` components render with live CMS data.
8. **Update Store** — Quantity changes or removals update Zustand + `localStorage`. `trackedIds` stays unchanged, so **no re-fetch** occurs.
9. **trackedIds expands** — Adding a new product grows `trackedIds` during render phase. SWR key changes, triggering a re-fetch.
