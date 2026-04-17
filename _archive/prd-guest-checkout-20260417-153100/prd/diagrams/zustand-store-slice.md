# Zustand Store Slice Diagram

## Store Structure Overview

```mermaid
graph TD
    subgraph "Zustand Store"
        A[ReservedBasketState] --> B[State]
        A --> C[Actions]
        A --> D[Computed]
    end
    
    subgraph "State Properties"
        B --> B1[reservedBasket: ReservedBasket | null]
        B --> B2[isLoading: boolean]
        B --> B3[error: string | null]
        B --> B4[operationInProgress: boolean]
    end
    
    subgraph "Actions"
        C --> C1[setReservedBasket]
        C --> C2[setLoading]
        C --> C3[setError]
        C --> C4[setOperationInProgress]
        C --> C5[clearReservedBasket]
    end
    
    subgraph "Computed Properties"
        D --> D1[hasReservedBasket: boolean]
        D --> D2[basketStatus: 'none' | 'full' | 'decremented' | 'empty']
    end
```

## Reserved Basket Data Structure

```mermaid
graph TD
    subgraph "ReservedBasket"
        A[reservationToken: string]
        B[idempotencyKey: string]
        C[expiresAt: string]
        D[amountPln: number]
        E[products: ReservedProduct[]]
        F[createdAt: string]
        F2[updatedAt: string]
    end
    
    subgraph "ReservedProduct"
        G[id: string]
        H[name: string]
        I[stripePriceId: string]
        J[requestedQuantity: number]
        K[reservedQuantity: number]
        L[availableQuantity: number]
        M[pricePln: number]
        N[totalPricePln: number]
        O[imageUrl: string | null]
        P[slug: string]
        Q[brand: BrandRef]
    end
    
    subgraph "BrandRef"
        Q --> Q1[id: string]
        Q --> Q2[name: string]
        Q --> Q3[slug: string]
    end
```

## State Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> Empty: Initial State
    
    Empty --> Loading: Click Checkout
    Loading --> Success: Reservation Created
    Loading --> Error: Network Error
    
    Success --> Loading: Modify Basket
    Success --> Empty: Cancel/Timeout
    
    Error --> Loading: Retry
    Error --> Empty: Clear Error
    
    note right of Success
        basketStatus = 'full' | 'decremented' | 'empty'
    end note
    
    note right of Loading
        operationInProgress = true
        checkoutButton.disabled = true
    end note
```

## Action Flow

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Store as Zustand Store
    participant API as CMS API
    participant Local as localStorage
    
    UI->>Store: setReservedBasket(basket)
    Store->>Local: Persist via middleware
    Store->>UI: Update UI state
    
    UI->>Store: clearReservedBasket()
    Store->>Local: Clear persisted data
    Store->>UI: Reset to empty state
    
    UI->>Store: setOperationInProgress(true)
    Store->>UI: Disable buttons
    Store->>UI: Show loading state
    
    API->>Store: setReservedBasket(response)
    Store->>UI: Update with reserved data
```

## Persistence Layer

```mermaid
graph LR
    subgraph "Client Side"
        A[Zustand Store] --> B[Persist Middleware]
        B --> C[localStorage]
    end
    
    subgraph "Storage Structure"
        C --> D["guest-checkout-reserved-basket"]
        D --> E[version: 1]
        D --> F[state: {...}]
        D --> G[timestamp: ...]
    end
    
    subgraph "Cross-tab Sync"
        B --> H[BroadcastChannel]
        H --> I[Other Tabs]
        I --> J[Store Update]
    end
```

## Event Deduplication

```mermaid
graph TD
    subgraph "Deduplication System"
        A[User Click] --> B[EventDeduplicator]
        B --> C{Last Click < 1s?}
        C -->|Yes| D[Block Event]
        C -->|No| E[Process Event]
        E --> F[Update Last Click Time]
        F --> G[Execute Action]
    end
    
    subgraph "State Protection"
        G --> H{Operation in Progress?}
        H -->|Yes| I[Ignore Request]
        H -->|No| J[Execute Request]
        J --> K[Set Operation In Progress]
        K --> L[API Call]
        L --> M[Reset Operation In Progress]
    end
```

## Integration Points

```mermaid
graph TB
    subgraph "UI Layer"
        A[Checkout Button] --> B[Store Actions]
        C[Cancel Button] --> B
        D[Retry Button] --> B
    end
    
    subgraph "Zustand Store"
        B --> E[State Management]
        E --> F[Persistence]
    end
    
    subgraph "External Systems"
        G[Sanity CMS] --> E
        H[Redis TTL] --> E
        I[Stripe] --> E
    end
    
    subgraph "State Synchronization"
        F --> J[localStorage]
        E --> K[BroadcastChannel]
        K --> L[Other Tabs]
    end
```
