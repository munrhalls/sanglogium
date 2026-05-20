# Shipping Cost Display - Technical Diagrams

## Sequence Diagram: Basket Page Shipping Cost Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Page as Basket Page
    participant Manager as BasketManager
    participant Detector as CountryDetector
    participant API as /api/basket/shipping-rates
    participant AlleKurier as AlleKurier API
    participant UI as BasketSummary

    User->>Page: Add/remove basket item
    Page->>Manager: Update basket state
    Manager->>Manager: Calculate parcel data
    Manager->>Manager: Set shippingCost = null
    Manager->>UI: Update shipping cost
    UI->>UI: Display "Calculating..."
    Note over Manager: Start 500ms debounce timer
    Manager->>Detector: detectCountry()
    Detector->>Detector: Check localStorage cache
    alt Cache hit and valid
        Detector-->>Manager: Return cached country
    else Cache miss or expired
        Detector->>Detector: Fetch ipapi.co/json/
        Detector->>Detector: Parse country code
        alt Valid country (PL/GB/DE)
            Detector->>Detector: Cache result (1 hour)
            Detector-->>Manager: Return country
        else Invalid country
            Detector->>Detector: Try browser locale
            alt Valid locale
                Detector-->>Manager: Return country
            else Invalid locale
                Detector-->>Manager: Return default PL
            end
        end
    end
    Note over Manager: 500ms debounce delay completes
    Manager->>API: POST { parcelData, countryCode }
    API->>API: Aggregate parcels (sum weights, max dimensions)
    API->>API: Calculate total volume
    API->>API: Calculate parcel count (weight/volume limits)
    alt Single parcel
        API->>AlleKurier: POST { packages: [parcel] }
    else Multiple parcels
        API->>AlleKurier: POST { packages: [parcel1, parcel2, ...] }
    end
    AlleKurier-->>API: Return shipping options
    API->>API: Select cheapest option
    API-->>Manager: Return { rate: { amount, currency } }
    Manager->>Manager: Set shippingCost = amount
    Manager->>UI: Update shipping cost
    UI->>UI: Display shipping cost
    UI->>UI: Update total (subtotal + shipping)
```

## Flowchart: Parcel Splitting Logic

```mermaid
flowchart TD
    A[Start: Receive parcelData] --> B[Calculate total weight]
    A --> C[Calculate total volume]
    B --> D[Parcels by weight = ceil total weight / 25000]
    C --> E[Parcels by volume = ceil total volume / 99000]
    D --> F[Total parcels = max parcels by weight, parcels by volume, 1]
    E --> F
    F --> G{Total parcels > 1?}
    G -->|No| H[Use single aggregated parcel]
    G -->|Yes| I[Calculate items per parcel = ceil parcelData length / total parcels]
    I --> J[Loop through parcels]
    J --> K[Get subset of items for this parcel]
    K --> L[Aggregate subset: sum weights, max dimensions]
    L --> M[Add to packages array]
    M --> N{More parcels to process?}
    N -->|Yes| J
    N -->|No| O[Send packages array to AlleKurier]
    H --> O
    O --> P[Return total cost = sum of all parcel rates]
```

## Component Architecture Diagram

```mermaid
graph TD
    UI[Basket Page] --> BM[BasketManager]
    BM --> CD[CountryDetector]
    BM --> SRA[Shipping Rates API]
    BM --> BS[BasketSummary]
    SRA --> AK[AlleKurier API]
    CD --> Cache[localStorage Cache]
    SRA --> Env[Environment Variables]

    BM -->|parcelData| SRA
    BM -->|countryCode| SRA
    SRA -->|cheapest rate| BM
    BM -->|shippingCost| BS
    BS -->|Calculating... / Cost| UI
    CD -->|country| BM
    Env -->|sender address| SRA
```

## State Diagram: Shipping Cost State

```mermaid
stateDiagram-v2
    [*] --> Calculating: Basket changes
    Calculating --> Fetching: 500ms debounce completes
    Fetching --> Success: API returns rate
    Fetching --> Error: API fails
    Error --> Calculating: User changes basket
    Success --> Calculating: User changes basket
    Calculating --> [*]: Basket empty
    Success --> [*]: Basket empty
```

## Data Flow Diagram

```mermaid
graph LR
    A[Basket Items] --> B[Parcel Data Calculation]
    B --> C[Shipping Rates API]
    D[Country Detection] --> C
    C --> E[AlleKurier API]
    E --> C
    C --> F[Cheapest Rate]
    F --> G[BasketManager State]
    G --> H[BasketSummary Display]
    H --> I[User Sees Shipping Cost]
```
