# Technical Diagrams: Basket Feature

## Non-Local Basket

```mermaid
sequenceDiagram
    participant User as User
    participant Store as Zustand Store
    participant LocalStorage as localStorage
    
    User->>Store: addProduct/increment/decrement/remove
    Store->>Store: Update state
    Store->>LocalStorage: Persist state
    Store->>User: UI updates
```

## Basket Page: CMS Fetch Flow

```mermaid
sequenceDiagram
    participant Page as Basket Page
    participant Store as Zustand Store
    participant Sanity as Sanity CMS
    participant UI as UI Components

    Page->>Store: Get basket items
    Store-->>Page: Return items (productId, quantity)
    Page->>Sanity: Fetch products by IDs
    Sanity-->>Page: Return product data (name, price, stock)
    Page->>Page: Check availability (stock > 0)
    Page->>UI: Render available items
    Page->>UI: Render unavailable items
```