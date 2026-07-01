# Devin Task: Create Orchestration Diagrams

## Task Overview

Create a folder and Markdown file with 6 Mermaid diagrams that visually represent the parallel-track execution plan. The diagram content has been fully designed — your job is mechanical file creation only.

---

## Scope

- **Repo:** `C:\webdev\sang-logium`
- **Create folder:** `C:\webdev\sang-logium\orchestration-diagrams\`
- **Create file:** `C:\webdev\sang-logium\orchestration-diagrams\diagrams.md`
- **Do not touch:** Any existing source code, `_project` folder, or any other file

---

## Steps

1. Create the folder `orchestration-diagrams` at the root of `C:\webdev\sang-logium`
2. Create `diagrams.md` inside it with the **exact content** in the EXACT FILE CONTENT section below — copy it verbatim, do not modify any diagram code
3. Verify the file exists at the correct path

---

## Acceptance Criteria

- [ ] Folder `C:\webdev\sang-logium\orchestration-diagrams\` exists
- [ ] File `C:\webdev\sang-logium\orchestration-diagrams\diagrams.md` exists
- [ ] File contains all 6 diagram sections with Mermaid code blocks intact
- [ ] No other files modified

**Done signal:** Confirm exact file path and that all 6 `mermaid` code blocks are present in the file.

---

## EXACT FILE CONTENT

Write the following content verbatim to `diagrams.md`:

---

```
# Orchestration Diagrams

> Visual reference for the parallel-track execution plan.  
> Read alongside `_project/orchestration-plan.md`.

---

## 1 · The Domino Chain

The complete milestone sequence from zero to offer. The **red node** is the lead domino — nothing deploys until the video exists.

` ` `mermaid
flowchart TD
    A["🛍️ Accessories Section Full"] --> B["📱 Mobile + Search + Checkout QA Pass"]
    B --> C["🎬  VIDEO RECORDED AND EDITED\n─────────────────────\nLEAD DOMINO"]
    C --> D["🌐 Portfolio Homepage Live\nwith video embedded"]
    D --> E["📄 CV Polished"]
    E --> F["📨 Apply at Volume — 10+ apps/day"]
    E --> G["📝 LinkedIn Article 1\nStore Video Reveal"]
    F --> H["📞 Technical Screens\n2–3 weeks after applying"]
    G --> H
    H --> I["✅ Pass Technical Screens\nDSA daily reps carry this"]
    I --> J["🎤 Full Interview Rounds\nSTAR stories + Sanglogium as system design"]
    J --> K["🎯 OFFER"]

    style C fill:#e63946,color:#ffffff,font-weight:bold
    style K fill:#2d6a4f,color:#ffffff,font-weight:bold
    style A fill:#457b9d,color:#ffffff
    style F fill:#e76f51,color:#ffffff
` ` `

---

## 2 · Track Dependency Graph

Which tracks block which. Tracks in the **Always Parallelizable** group run any time. Tracks in the **Sequential Gate** group are blocked until VID is done.

` ` `mermaid
flowchart LR
    subgraph IND["⟳  Always Parallelizable"]
        direction TB
        CV["📄 CV\nCurriculum Vitae"]
        DSA["🧮 DSA\nDaily Algo"]
        TR["📚 TR\nTech Review"]
    end

    subgraph REPO["🔀  Repo-Safe Parallel — different codebases"]
        direction TB
        SL["🛍️ SL\nsang-logium repo"]
        PF15["🎨 PF-1→5\nportfolio repo"]
    end

    subgraph GATE["🚪  Sequential Gate — blocked until VID done"]
        direction TB
        VID["🎬 VID\nHuman-only recording"]
        PF6["🎥 PF-6\nVideo Embed"]
        PF7["🚀 PF-7\nDeploy to Production"]
        LI["📝 LI\nLinkedIn Article 1"]
    end

    SL --> VID
    PF15 --> PF6
    VID --> PF6
    VID --> LI
    PF6 --> PF7
    PF7 --> APPLY["📨 APPLY\nat volume"]
    LI --> APPLY
    CV --> APPLY
    APPLY --> STAR["🎤 STAR\nInterview Stories"]
    APPLY --> TR

    style VID fill:#e63946,color:#ffffff
    style APPLY fill:#2d6a4f,color:#ffffff,font-weight:bold
    style PF7 fill:#457b9d,color:#ffffff
` ` `

---

## 3 · Parallel Execution Timeline

Approximate calendar view. **SL and PF run in parallel from day 1.** VID is the hard gate at the midpoint. Apply phase starts the day PF-7 deploys.

` ` `mermaid
gantt
    title Parallel Execution Timeline
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section 🛍️ Track SL
    Accessories Population       :sl2, 2026-07-01, 2d
    Mobile QA Pass               :sl3, after sl2, 2d
    Search + Checkout E2E        :sl4, after sl3, 2d
    Sanity CMS Cleanup           :sl5, after sl4, 1d

    section 🎨 Track PF
    PF-1 Intelligence Scan       :pf1, 2026-07-01, 1d
    PF-2 Hero + Structure        :pf2, after pf1, 2d
    PF-3 Remove Diamond          :pf3, after pf2, 1d
    PF-4 Diamond to Tech Section :pf4, after pf3, 1d
    PF-5 Mobile Layout           :pf5, after pf4, 1d
    PF-6 Video Embed             :pf6, 2026-07-12, 1d
    PF-7 Deploy to Production    :pf7, after pf6, 1d

    section 📄 Track CV
    CV-1 Intel + Draft           :cv1, 2026-07-01, 2d
    CV-3 Polish                  :cv2, after cv1, 2d

    section 🎬 Track VID
    VID-1 Script Finalized       :vid1, 2026-07-09, 1d
    VID-2 Rehearsal x3           :vid2, after vid1, 1d
    VID-3 Record                 :vid3, after vid2, 1d
    VID-4 Edit + Export          :vid4, after vid3, 1d

    section 📝 Track LI
    LI-1 Article Draft + Publish :li1, 2026-07-13, 2d

    section 📨 Apply Phase
    Apply 10+ apps per day       :apply, 2026-07-14, 30d
` ` `

---

## 4 · Orchestration Loop

How the three actors interact. The critical insight: **while Devin executes Track X, Claude is already prepping Track Y** — zero dead time between phases.

` ` `mermaid
sequenceDiagram
    participant Y as 🧑 You (Orchestrator)
    participant C as 🧠 Claude (Power Model)
    participant D as 🤖 Devin (Free Model)

    Y->>C: Feed intelligence prompt — Track X
    activate C
    C->>C: Audit current state
    C->>C: Identify gaps, make decisions
    C->>C: Write self-contained Devin task
    C-->>Y: Intelligence scan + task package
    deactivate C

    Y->>Y: Review output (~5-10 min)
    Y->>D: Feed task to Devin
    activate D

    Note over Y,C: While Devin executes Track X...
    Y->>C: Feed intelligence prompt — Track Y
    activate C
    C->>C: Design Track Y phases + tasks
    C-->>Y: Track Y task package ready
    deactivate C

    Note over Y,D: Track Y is ready the moment Devin finishes Track X
    D-->>Y: Done signal — acceptance criteria met
    deactivate D

    Y->>Y: Verify acceptance criteria
    Y->>D: Feed Track Y task — zero wait
` ` `

---

## 5 · Handoff Protocol

The Claude → Devin handoff flow. Every phase follows this loop. Correction cycles stay tight because acceptance criteria are defined upfront.

` ` `mermaid
flowchart TD
    A["🧑 Orchestrator\nidentifies next phase"] --> B
    B["🧠 Claude: Intelligence Scan\n• Audit current state\n• Identify gaps\n• Make decisions"] --> C
    C["🧠 Claude: Write Devin Task\n• Exact file scope\n• Step-by-step actions\n• Acceptance criteria\n• Do-not-touch list"] --> D
    D["🧑 Orchestrator\nreviews output\n~5 min"] --> E
    E{Approved?}
    E -->|"✅ Yes"| F["🤖 Devin executes"]
    E -->|"❌ Needs revision"| B
    F --> G["🤖 Devin\nsignals done"]
    G --> H["🧑 Orchestrator\nverifies acceptance criteria"]
    H --> I{Criteria met?}
    I -->|"✅ Yes"| J["Mark phase complete\nQueue next phase"]
    I -->|"❌ Not met"| K["Feed correction\ntask to Devin"]
    K --> F
    J --> A

    style B fill:#6d28d9,color:#ffffff
    style C fill:#6d28d9,color:#ffffff
    style F fill:#1d4ed8,color:#ffffff
    style J fill:#2d6a4f,color:#ffffff
    style A fill:#374151,color:#ffffff
` ` `

---

## 6 · Workload Distribution by Window

What each actor is doing in each execution window. This is the maximum parallelism view — three tracks active simultaneously at all times.

` ` `mermaid
flowchart TD
    subgraph W1["🪟 Window 1 — Store Building  (Days 1–7)"]
        direction LR
        W1D["🤖 Devin\nSL: Accessories → Mobile → Search\n→ Checkout → Sanity Cleanup"]
        W1C["🧠 Claude\nPF-1 Intel Scan\nCV-1 Intel + Draft"]
        W1Y["🧑 You\nFeed prompts, review outputs\nDSA block 3 daily"]
    end

    subgraph W2["🪟 Window 2 — Portfolio Building  (Days 5–10)"]
        direction LR
        W2D["🤖 Devin\nPF-2 Hero → PF-3 Diamond\n→ PF-4 Tech Section → PF-5 Mobile"]
        W2C["🧠 Claude\nVID-1 Script Finalization\nCV-1 continued if needed"]
        W2Y["🧑 You\nVID Rehearsal x3\nCV-3 Polish\nDSA block 3 daily"]
    end

    subgraph W3["🪟 Window 3 — Video Day  (Days 9–12)"]
        direction LR
        W3D["🤖 Devin\nPF-4 + PF-5 polish\n(non-blocking)"]
        W3C["🧠 Claude\nLI-1 Article Draft"]
        W3Y["🧑 You\n🎬 VID: Record + Edit\nDSA block 3 daily"]
    end

    subgraph W4["🪟 Window 4 — Launch  (Days 12–14)"]
        direction LR
        W4D["🤖 Devin\nPF-6 Embed + PF-7 Deploy\nLI: Publish"]
        W4C["🧠 Claude\nSTAR story drafts\nTR study notes"]
        W4Y["🧑 You\n📨 Apply 10+ per day\nDSA + TR Review"]
    end

    W1 --> W2 --> W3 --> W4

    style W1 fill:#1e3a5f,color:#ffffff
    style W2 fill:#1e3a5f,color:#ffffff
    style W3 fill:#1e3a5f,color:#ffffff
    style W4 fill:#1a3a2a,color:#ffffff
` ` `
```

---

## Notes for Devin

- The triple backtick sequences in the content above use spaces between the backticks as an escaping artifact — when writing the actual file, every ` ` ` mermaid block must use real triple backticks (```) with no spaces
- Do not add any content beyond what is specified
- Do not modify diagram code — copy it exactly
- The file should render cleanly in any Markdown viewer that supports Mermaid (GitHub, Obsidian, VS Code with Mermaid plugin)
