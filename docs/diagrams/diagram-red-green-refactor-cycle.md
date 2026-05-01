# Red Green Refactor Cycle

```mermaid
graph TD
    classDef large font-size:20px,padding:15px,stroke-width:2px;
    classDef logic fill:#fff4dd,stroke:#d4a017,font-size:20px;
    classDef state fill:#e1f5fe,stroke:#01579b,font-size:20px;
    classDef action fill:#e8f5e9,stroke:#2e7d32,font-size:20px;

    A([Write Failing Test]):::action --> B{Test Passes?}:::logic
    B -->|No| C([Write Minimal Code]):::action
    C --> B
    B -->|Yes| D([Refactor Cleanly]):::action
    D --> E{Tests Still Pass?}:::logic
    E -->|Yes| A
    E -->|No| F([[Revert Changes]]):::state
```
