# Non-Local Basket

## Overview

The non-local basket provides persistent shopping cart functionality across page navigation and browser tabs. Users can add products from any page, see basket counts update in real-time, and have their items preserved across reloads and tab switches. The implementation uses Zustand for state management with localStorage persistence and cross-tab synchronization.

## Architecture

```mermaid
sequenceDiagram
    participant User as User
    participant Store as Zustand Store
    participant Zod as Zod Validation
    participant Storage as localStorage/sessionStorage
    participant Event as Storage Event
    participant OtherTab as Other Tab Store
    
    User->>Store: addProduct/increment/decrement/remove
    Store->>Zod: Validate input
    Zod-->>Store: Valid/Invalid
    Store->>Store: Update state
    Store->>Storage: Persist state
    Storage->>Event: Fire storage event
    Event->>OtherTab: Receive event
    OtherTab->>Storage: Re-hydrate from storage
    Storage->>Zod: Validate data
    Zod-->>OtherTab: Valid/Invalid
    OtherTab->>User: UI updates
```

## Key Components

- **basketStore.ts** (`store/basketStore.ts`) - Zustand store with persist middleware
- **Zod Schema** - Input validation for basket items (productId, quantity)
- **Fallback Storage** - localStorage → sessionStorage graceful degradation
- **Storage Event Listener** - Cross-tab synchronization
- **Selectors** - Computed values (totalItems, hasItem, itemQuantity)

## Data Flow

1. User triggers action (add, increment, decrement, remove)
2. Zod schema validates input (productId string, positive integer quantity)
3. Store updates state atomically
4. Persist middleware writes to storage
5. Storage writes fallback: localStorage → sessionStorage → silent fail
6. Storage event fires on write, other tabs receive event
7. Other tabs re-hydrate from storage with Zod validation
8. UI updates reflect new state

## Validation Strategy

- **Input Validation:** Zod schema validates all user actions before state update
- **Read Validation:** Storage data validated on hydration, reset to empty on failure
- **Write Resilience:** localStorage → sessionStorage fallback with console warnings
- **Type Safety:** TypeScript types inferred from Zod schema

## Tech Stack

- **Zustand** - State management with persist middleware
- **Zod** - Runtime validation and type inference
- **TypeScript** - Type safety
- **localStorage/sessionStorage** - Browser storage APIs

## Related Documentation

- [PRD](./1. PRD.md) - Product requirements and definition of done
- [Technical Solution](./2. Minimal Viable Solution Design.md) - Detailed technical design
- [UI Plan](./3. UI Plan.md) - HTML structure for basket controls
