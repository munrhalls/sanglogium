# SOP: Zero-Waste Prompting (The Information Lead Domino)

## 1. The Pre-Flight Interrogation (Before the Prompt)
**Goal:** Never prompt blindly.
* **Action:** Extract raw system data, terminal outputs, or asset metadata before opening the chat. You must know the exact "State Zero" of the system.

## 2. Define Physics, Not Tooling (Inside the Prompt)
**Goal:** Leverage AI logic, do not constrain it with human assumptions.
* **Action:** Provide the exact input state data. Define the exact required output state.
* **Constraint:** Do not dictate the specific functions, methods, or flags the AI should use unless you possess 100% mechanical awareness of them.

## 3. Raw Data Over Interpretation (Inside the Prompt)
**Goal:** Eliminate ambiguity.
* **Action:** Replace human adjectives ("it looks slightly gray", "it's broken") with machine data ("the background is RGB 252,252,252", "the console threw Error Code 500 at Line 42").

## 4. Observable Feedback Loop (After the Output)
**Goal:** Force the AI to correct mathematical logic, not guess visual outcomes.
* **Action:** Test the AI's output using CLI tools or system logs first. If it fails, feed the exact error log or data discrepancy directly back into the next prompt.
