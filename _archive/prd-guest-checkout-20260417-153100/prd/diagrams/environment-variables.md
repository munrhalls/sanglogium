# Environment Variables Diagram

## Variable Categories

```mermaid
graph TD
    subgraph "Required Variables"
        A[Sanity CMS] --> A1[PROJECT_ID]
        A --> A2[DATASET]
        A --> A3[TOKEN]
        A --> A4[API_VERSION]
        
        B[Redis] --> B1[HOST]
        B --> B2[PORT]
        B --> B3[PASSWORD]
        B --> B4[DB]
        
        C[Stripe] --> C1[SECRET_KEY]
        C --> C2[WEBHOOK_SECRET]
        C --> C3[API_VERSION]
    end
    
    subgraph "Optional Variables"
        D[Queue Config] --> D1[CONCURRENCY]
        D --> D2[TIMEOUT]
        D --> D3[RETRY_SETTINGS]
        
        E[TTL Config] --> E1[RESERVATION_TTL]
        E --> E2[IDEMPOTENCY_TTL]
        
        F[Logging] --> F1[LOG_LEVEL]
        F --> F2[LOG_FORMAT]
    end
```

## Configuration Loading Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Env as .env File
    participant Validator as Joi Schema
    participant Config as Config Loader
    
    App->>Env: Load Environment
    Env->>Validator: Validate Variables
    Validator->>Validator: Check Required Fields
    Validator->>Validator: Validate Types
    alt Validation Success
        Validator->>Config: Load Configuration
        Config->>App: Return Config Object
    else Validation Error
        Validator->>App: Throw Error
    end
```

## Environment-Specific Configurations

```mermaid
graph TD
    subgraph "Development"
        A[NODE_ENV=development]
        A --> B[Debug Mode]
        A --> C[Local Redis]
        A --> D[Development Dataset]
        A --> E[Verbose Logging]
    end
    
    subgraph "Production"
        F[NODE_ENV=production]
        F --> G[Optimized Mode]
        F --> H[Redis Cluster]
        F --> I[Production Dataset]
        F --> J[Error Logging Only]
    end
    
    subgraph "Test"
        K[NODE_ENV=test]
        K --> L[Mock Mode]
        K --> M[Test Redis DB]
        K --> N[Test Dataset]
        K --> O[Silent Logging]
    end
```

## Variable Validation Schema

```mermaid
graph TD
    subgraph "Validation Rules"
        A[Required Check] --> B{Variable Present?}
        B -->|Yes| C[Type Validation]
        B -->|No| D[Throw Error]
        
        C --> E{Correct Type?}
        E -->|Yes| F[Range Check]
        E -->|No| G[Convert/Throw Error]
        
        F --> H{In Valid Range?}
        H -->|Yes| I[Valid]
        H -->|No| J[Use Default/Error]
    end
    
    subgraph "Type Examples"
        K[String] --> L[PROJECT_ID, DATASET]
        M[Number] --> L
        M --> N[PORT, CONCURRENCY]
        O[Boolean] --> P[DEBUG, USE_TLS]
    end
```

## Security Configuration

```mermaid
graph TD
    subgraph "Sensitive Variables"
        A[Sanity Token] --> B[Base64 Encoded]
        C[Stripe Secret] --> B
        D[Redis Password] --> B
        E[Encryption Key] --> B
    end
    
    subgraph "Encryption Flow"
        F[Plain Text] --> G[AES-256-GCM]
        G --> H[Encrypted Value]
        H --> I[Store in .env]
        I --> J[Runtime Decryption]
    end
    
    subgraph "Access Control"
        K[Environment Files] --> L[.gitignore]
        M[Runtime Access] --> N[Process.env Only]
        O[Logging] --> P[Redact Sensitive Values]
    end
```

## Docker Configuration

```mermaid
graph TD
    subgraph "Dockerfile"
        A[ENV NODE_ENV=production]
        B[ENV GUEST_CHECKOUT_QUEUE_CONCURRENCY=5]
        C[ENV GUEST_CHECKOUT_RESERVATION_TTL=600]
        D[ENV GUEST_CHECKOUT_LOG_LEVEL=warn]
    end
    
    subgraph "docker-compose.yml"
        E[Environment File] --> F[.env.production]
        G[Service Dependencies] --> H[Redis Container]
        I[Volume Mounts] --> J[Config Files]
    end
    
    subgraph "Container Runtime"
        K[Docker Build] --> L[Config Validation]
        L --> M[Start Application]
        M --> N[Health Checks]
    end
```

## Runtime Configuration Updates

```mermaid
graph TD
    subgraph "File Watching"
        A[.env File] --> B[File Watcher]
        B --> C{File Changed?}
        C -->|Yes| D[Reload Variables]
        C -->|No| E[Continue]
        D --> F[Validate New Config]
        F --> G{Valid?}
        G -->|Yes| H[Update Runtime Config]
        G -->|No| I[Keep Old Config]
    end
    
    subgraph "Component Notification"
        H --> J[Notify Watchers]
        J --> K[Update Services]
        K --> L[Reconfigure Logging]
        L --> M[Adjust Queue Settings]
    end
```

## Configuration Hierarchy

```mermaid
graph TD
    subgraph "Priority Order"
        A[1. Process.env] --> B[Highest Priority]
        C[2. .env File] --> D[Medium Priority]
        E[3. Default Values] --> F[Lowest Priority]
    end
    
    subgraph "Merge Logic"
        G[Start with Defaults] --> H[Apply .env Values]
        H --> I[Apply Process.env]
        I --> J[Final Config]
    end
    
    subgraph "Validation Point"
        J --> K[Schema Validation]
        K --> L{Valid?}
        L -->|Yes| M[Use Config]
        L -->|No| N[Error Exit]
    end
```

## Feature Flags

```mermaid
graph LR
    subgraph "Feature Toggle Variables"
        A[GUEST_CHECKOUT_ENABLE_QUEUE] --> B[Queue Processing]
        C[GUEST_CHECKOUT_ENABLE_CIRCUIT_BREAKER] --> D[Retry Logic]
        E[GUEST_CHECKOUT_ENABLE_RETRY_LOGIC] --> F[Backoff Strategy]
        G[GUEST_CHECKOUT_DEBUG_MODE] --> H[Verbose Output]
    end
    
    subgraph "Runtime Check"
        I[process.env.FEATURE_FLAG] --> J{Value === 'true'?}
        J -->|Yes| K[Enable Feature]
        J -->|No| L[Disable Feature]
    end
```

## Environment Setup Script

```mermaid
graph TD
    subgraph "Setup Script"
        A[Check .env Exists] --> B{File Found?}
        B -->|No| C[Copy .env.example]
        B -->|Yes| D[Validate Variables]
        
        C --> E[Prompt for Values]
        E --> F[Create .env]
        F --> D
        
        D --> G{All Required?}
        G -->|Yes| H[Setup Complete]
        G -->|No| I[Show Missing]
        I --> J[Exit with Error]
    end
    
    subgraph "Validation Steps"
        K[Check Sanity Token] --> L[Test Connection]
        M[Check Redis] --> N[Ping Test]
        O[Check Stripe] --> P[Validate Key Format]
    end
```
