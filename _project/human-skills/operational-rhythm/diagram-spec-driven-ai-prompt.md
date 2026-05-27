# Spec-Driven AI Prompt Pyramid

## Purpose
Vague prompts yield "I don't know" responses. Spec-driven prompts yield implementation. The journal's 11:40 failure was a specification failure, not a Claude failure.

```mermaid
graph BT
    classDef large font-size:20px,padding:15px,stroke-width:2px;
    classDef logic fill:#fff4dd,stroke:#d4a017,font-size:20px;
    classDef state fill:#e1f5fe,stroke:#01579b,font-size:20px;
    classDef action fill:#e8f5e9,stroke:#2e7d32,font-size:20px;
    classDef danger fill:#ffebee,stroke:#b71c1c,font-size:20px;
    classDef success fill:#e8f5e9,stroke:#1b5e20,font-size:20px;

    A1([Output Format]):::state --> B1([Acceptance Criteria]):::logic
    B1 --> C1([Test Contract]):::logic
    C1 --> D1([File + Function]):::action
    D1 --> E1([Context Boundaries]):::action

    E1 --> PROMPT([SPEC-DRIVEN PROMPT<br/>Yields implementation]):::success

    A2([Make it work]):::danger --> B2([Fix this]):::danger
    B2 --> C2([Do something<br/>with logs]):::danger
    C2 --> D2([N-th attempt]):::danger

    D2 --> VAGUE([VAGUE PROMPT<br/>Yields "I don't know"]):::danger
```

## Template

```
Given [file:A] at [path],
implement [function/B] to satisfy [test:C].

Acceptance:
- [specific output / return value / side effect]
- [schema / type / validation rule]

If blocked:
- Ask for [schema/spec], not "what to do"
- Abort and refine contract
```

## Journal Evidence

| Prompt Type | Time | Result |
|-------------|------|--------|
| "One big prompt to claude" | 11:40 | "I don't know what to do now" |
| "retry a lot" | 11:40 | Repeated failure, no specification |
| "gemini fix prompt" | 14:20 | "Still nonsense and bollocks" |
| "N-th attempt: docs trace -> code trace -> logging system simplest possible" | 14:28 | Abandoned — still no acceptance criteria |

**Root cause:** Not one prompt contained a verifiable acceptance condition.
