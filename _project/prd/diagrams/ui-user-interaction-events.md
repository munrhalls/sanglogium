# UI User Interaction Events Diagram

## Event Flow Architecture

```mermaid
graph TD
    subgraph "User Interface"
        A[User Action] --> B[Event Handler]
        B --> C[Deduplicator]
        C --> D[State Check]
        D --> E[API Call]
        E --> F[UI Update]
    end
    
    subgraph "Deduplication Layer"
        C --> G[1-Second Debounce]
        G --> H[Last Click Time]
        H --> I{Time < 1s?}
        I -->|Yes| J[Block Event]
        I -->|No| K[Process Event]
    end
```

## Button Event Handlers

```mermaid
graph TD
    subgraph "Checkout Button"
        A[Click Event] --> B[Check Processing State]
        B --> C{Is Processing?}
        C -->|Yes| D[Ignore Click]
        C -->|No| E[Check Last Click]
        E --> F{Time < 1s?}
        F -->|Yes| D
        F -->|No| G[Disable Button]
        G --> H[Create Reservation]
        H --> I[Handle Response]
        I --> J[Update UI State]
    end
    
    subgraph "Cancel Button"
        K[Click Event] --> L[Show Confirmation]
        L --> M{User Confirms?}
        M -->|No| N[Close Dialog]
        M -->|Yes| O[Send Rollback]
        O --> P[Clear Reservation]
        P --> Q[Enable Checkout]
    end
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: Initial State
    
    Idle --> Processing: Click Checkout
    Processing --> Success: Reservation Created
    Processing --> Error: Network Error
    Processing --> Idle: Cancel
    
    Success --> Idle: Cancel/Timeout
    Error --> Processing: Retry
    Error --> Idle: Clear Error
    
    note right of Processing
        - Button disabled
        - Loading indicator
        - Operation in progress
    end note
    
    note right of Success
        - Show reserved basket
        - Enable cancel
        - Show proceed options
    end note
```

## Event Deduplication System

```mermaid
graph TD
    subgraph "EventDeduplicator"
        A[Event Received] --> B[Generate Key]
        B --> C[Check Queue]
        C --> D{Key Exists?}
        D -->|Yes| E[Check Timestamp]
        D -->|No| F[Process Event]
        
        E --> G{Time < 1000ms?}
        G -->|Yes| H[Block Event]
        G -->|No| I[Update Timestamp]
        I --> F
        
        F --> J[Set Timestamp]
        J --> K[Execute Handler]
        K --> L[Cleanup Old Keys]
    end
```

## UI State Transitions

```mermaid
sequenceDiagram
    participant User as User
    participant UI as UI Component
    participant Store as Zustand Store
    participant API as CMS API
    
    User->>UI: Click Checkout
    UI->>UI: Deduplicate Event
    UI->>Store: setOperationInProgress(true)
    Store->>UI: Disable Button
    UI->>API: Create Reservation
    API-->>UI: Reserved Basket
    UI->>Store: setReservedBasket(data)
    Store->>UI: Update Display
    
    User->>UI: Click Cancel
    UI->>UI: Show Confirmation
    User->>UI: Confirm Cancel
    UI->>API: Rollback Request
    API-->>UI: Success
    UI->>Store: clearReservedBasket()
    Store->>UI: Reset State
```

## Modal Dialog Flows

```mermaid
graph TD
    subgraph "Modification Dialog"
        A[Stock Decrement] --> B[Show Dialog]
        B --> C[Display Changes]
        C --> D[User Choice]
        D --> E[Approve]
        D --> F[Cancel]
        
        E --> G[Proceed to Next Step]
        F --> H[Rollback Reservation]
    end
    
    subgraph "Cancel Confirmation"
        I[Cancel Click] --> J[Show Warning]
        J --> K[Explain Consequences]
        K --> L[User Choice]
        L --> M[Confirm Cancel]
        L --> N[Keep Reservation]
        
        M --> O[Send Rollback]
        N --> P[Close Dialog]
    end
```

## Error Handling Flow

```mermaid
graph TD
    A[API Error] --> B{Error Type}
    
    B -->|Network| C[Show Retry Button]
    B -->|Validation| D[Show Field Error]
    B -->|Conflict| E[Show Operation In Progress]
    B -->|Server| F[Show Generic Error]
    
    C --> G[Enable Retry]
    G --> H[Retry Request]
    
    D --> I[Highlight Invalid Field]
    I --> J[Show Error Message]
    
    E --> K[Disable Actions]
    K --> L[Show Waiting Message]
    
    F --> M[Show Error Message]
    M --> N[Enable Retry]
```

## Notification System

```mermaid
graph LR
    subgraph "Notification Types"
        A[Success] --> B[Green Banner]
        C[Warning] --> D[Yellow Banner]
        E[Error] --> F[Red Banner]
        G[Info] --> H[Blue Banner]
    end
    
    subgraph "Auto-Hide Timing"
        B --> I[3 seconds]
        D --> J[4 seconds]
        F --> K[5 seconds]
        H --> L[Manual Close]
    end
```

## Accessibility Flow

```mermaid
graph TD
    subgraph "Keyboard Navigation"
        A[Tab Key] --> B[Focus Button]
        B --> C[Enter/Space]
        C --> D[Trigger Action]
        D --> E[Update ARIA]
    end
    
    subgraph "Screen Reader Support"
        F[Button State] --> G[aria-disabled]
        H[Loading State] --> I[aria-busy]
        J[Error Message] --> K[aria-describedby]
        L[Success Message] --> M[aria-live]
    end
```

## Component Integration

```mermaid
graph TB
    subgraph "UI Components"
        A[CheckoutButton] --> B[EventDeduplicator]
        C[CancelButton] --> B
        D[RetryButton] --> B
        E[ApproveButton] --> B
    end
    
    subgraph "State Management"
        B --> F[UIStateStore]
        F --> G[ReservedBasketStore]
        G --> H[Persist Middleware]
    end
    
    subgraph "External Services"
        F --> I[NotificationSystem]
        G --> J[CMS API]
        H --> K[localStorage]
    end
```

## Cross-Tab Synchronization

```mermaid
graph TD
    subgraph "Tab 1"
        A[User Action] --> B[Update Store]
        B --> C[Persist to localStorage]
        C --> D[Broadcast Change]
    end
    
    subgraph "Tab 2"
        E[Listen for Changes] --> F[Receive Broadcast]
        F --> G[Update Store]
        G --> H[Refresh UI]
    end
    
    subgraph "BroadcastChannel"
        D --> I[Channel Message]
        I --> F
    end
```
