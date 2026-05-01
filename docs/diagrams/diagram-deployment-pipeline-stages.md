# Deployment Pipeline Stages

```mermaid
graph TD
    classDef large font-size:20px,padding:15px,stroke-width:2px;
    classDef logic fill:#fff4dd,stroke:#d4a017,font-size:20px;
    classDef state fill:#e1f5fe,stroke:#01579b,font-size:20px;
    classDef action fill:#e8f5e9,stroke:#2e7d32,font-size:20px;

    A([Developer Commit]):::state --> B([Automated Build]):::action
    B --> C{Build Passes?}:::logic
    C -->|Yes| D([Unit Tests]):::action
    D --> E{Tests Pass?}:::logic
    E -->|Yes| F([Integration Tests]):::action
    F --> G([Deploy to Stage]):::action
    G --> H([Smoke Tests]):::action
    H --> I([Deploy Prod]):::action
    C -->|No| J([[Fail Fast]]):::state
    E -->|No| J
```
