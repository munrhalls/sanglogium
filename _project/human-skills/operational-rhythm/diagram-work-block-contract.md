# Work Block Contract

## Purpose
Eliminate ambiguity *before* the clock starts. Elite practitioners specify outcomes in writing; amateurs specify at the moment of frustration.

```mermaid
graph TD
    classDef large font-size:20px,padding:15px,stroke-width:2px;
    classDef logic fill:#fff4dd,stroke:#d4a017,font-size:20px;
    classDef state fill:#e1f5fe,stroke:#01579b,font-size:20px;
    classDef action fill:#e8f5e9,stroke:#2e7d32,font-size:20px;
    classDef danger fill:#ffebee,stroke:#b71c1c,font-size:20px;
    classDef success fill:#e8f5e9,stroke:#1b5e20,font-size:20px;

    START([Clock Starts]):::state --> Q1{Can you write<br/>the contract?}:::logic

    Q1 -->|No| BLOCKED([STOP.<br/>Do not start.]):::danger
    Q1 -->|Yes| WRITE([Write: In 90 min<br/>I will deliver [X]<br/>that satisfies [Y]]):::action

    WRITE --> Q2{Acceptance<br/>verifiable?}:::logic
    Q2 -->|No| REFINE([Add:<br/>file, test,<br/>output format]):::action
    REFINE --> Q2

    Q2 -->|Yes| LOCK([Lock in.<br/>No other tabs.<br/>No other topics.]):::success
    LOCK --> WORK([Execute<br/>one domain only]):::action
    WORK --> DONE{Definition<br/>of done met?}:::logic
    DONE -->|No| WORK
    DONE -->|Yes| CLOSE([Close loop.<br/>Verify. Document.]):::success
    CLOSE --> NEXT([Next block only<br/>after close]):::state
```

## Contract Template (Copy-Paste)

```
In the next ___ minutes I will deliver [file/test/state] that [verifiable condition].
- Acceptance: [specific output / test passes / visual state]
- If blocked: [specific escalation — ask for schema, spec, or abort]
```

## Anti-Patterns (from journal)
- "Get logging working" → Wish, not a contract.
- "One big prompt to Claude" → No specification, no acceptance criteria.
- "I don't know what to do now" → Ambiguity discovered mid-flight, not pre-flight.
