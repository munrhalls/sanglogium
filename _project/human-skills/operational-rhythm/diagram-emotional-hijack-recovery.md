# Emotional Hijack Recovery Protocol

## Purpose
Trauma processing inside work blocks destroys cognitive throughput. Compartmentalize or abort — never "push through."

```mermaid
graph TD
    classDef large font-size:20px,padding:15px,stroke-width:2px;
    classDef logic fill:#fff4dd,stroke:#d4a017,font-size:20px;
    classDef state fill:#e1f5fe,stroke:#01579b,font-size:20px;
    classDef action fill:#e8f5e9,stroke:#2e7d32,font-size:20px;
    classDef danger fill:#ffebee,stroke:#b71c1c,font-size:20px;
    classDef success fill:#e8f5e9,stroke:#1b5e20,font-size:20px;

    START([Hijack Detected<br/>rage / shame / spiral]):::danger --> LOG([Log to<br/>personal file<br/>NOT work journal]):::action

    LOG --> CHOICE{Can you<br/>return to contract<br/>in 5 min?}:::logic

    CHOICE -->|Yes| RECOVER([10 deep breaths<br/>Neutral awareness<br/>Focus on seams]):::action
    RECOVER --> RESUME([Resume work block<br/>Self 2 executes]):::success

    CHOICE -->|No| ABORT([ABORT work block<br/>State: cognitive<br/>throughput = 0]):::danger
    ABORT --> PROCESS([Process trauma<br/>in dedicated<br/>support space]):::state
    PROCESS --> RE_SCHEDULE([Reschedule work<br/>when clear]):::success

    subgraph Forbidden [FORBIDDEN — "Push Through"]
        direction LR
        F1[Keep coding]:::danger --> F2[Shame spiral]:::danger
        F2 --> F3[More breaks]:::danger
        F3 --> F4[Abandon work]:::danger
    end
```

## Journal Evidence

**06:10–06:37:** 27 minutes rage-processing "mother" trauma. No corrective move specified. Cognitive state degraded for entire morning.

**Cost of "pushing through":**
- 06:37: "not calm" — continues into 07:02 work start
- 11:40: "I don't know what to do now" — ambiguity compounds degraded state
- 14:30: Full shame spiral — "WHY DO I HAVE NO SKILL"

## Elite Pattern

Personal trauma is processed *outside* work blocks or in pre-scheduled therapy/support. Work blocks are treated as inviolable cognitive space.
