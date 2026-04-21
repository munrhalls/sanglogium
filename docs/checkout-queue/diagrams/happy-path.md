```mermaid
flowchart LR
    UI[UI] --> Queue[Queue<br/>one at a time]
    Queue --> Atomic[Atomic<br/>processing]
    Atomic --> CMS[Sanity CMS]
    CMS --> Pop[Queue<br/>pop]
    Pop --> Response[UI response]
    Response --> Session[Session<br/>save basket reservation ID]
    Session --> Navigate[Navigate<br/>to checkout address]
```
