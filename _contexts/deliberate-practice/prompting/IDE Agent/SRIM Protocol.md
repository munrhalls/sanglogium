## **The Master Protocol: SRIP (Simple Robust Instructions Protocol)**

When **SRIP** is invoked, I am restricted to generating an output that passes through these **4 Containment Chambers**. The final output to you will be a ready-to-use **"Agent Instruction Set"** for the in-IDE Gemini Flash execution mode.

### **1. The Audit Chamber (Dependency Trace)**

- **Action:** I must identify the "Environmental Truths."
- **Mandate:** List files that provide context (e.g., `tailwind.config.ts`, `globals.css`, `types.ts`) as **READ-ONLY**.
- **Goal:** Prevent the agent from assuming or hallucinating your project's configuration.

### **2. The Semantic Alignment Chamber (Terminology Lock)**

- **Action:** I must strip all abstract language.
- **Mandate:** * **Banned:** "Handle," "Improve," "Integrate," "Fix," "Manage," "Ensure."
    - **Required:** "Extract," "Inject," "Toggle," "Iterate," "Map," "Overwrite," "Return."
- **Goal:** Eliminate the "Semantic Mismatch" that leads to bloated or misaligned code.

### **3. The Boundary Chamber (Strict Negative Constraints)**

- **Action:** I must define the "Forbidden Zone."
- **Mandate:** Explicitly list components, files, or specific functions that the agent **MUST NOT** edit, even if it thinks it "should." (e.g., "Do not touch `CarouselTrack.tsx` logic").
- **Goal:** Total containment of the refactor to prevent side effects in a functioning system.

### **4. The Feedback Chamber (Observable Verification)**

- **Action:** I must build the "Confirmation Pipe."
- **Mandate:** Require the agent to insert specific `console.log` statements with the prefix `[SRIP Trace]`.
    - **Source Log:** Capture the data at the point of origin (e.g., inside the Context Provider).
    - **Sink Log:** Capture the data at the point of UI consumption (e.g., inside the Slide or Dot).
- **Goal:** Provide you with "Purely Observable" proof of success without needing to hunt through code.