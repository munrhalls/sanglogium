Refined Scope
To build a professional, systematic /Implement command, we will design a multi-phase system prompt that forces the SWE 1.5 agent to behave deterministically. The scope is refined into the following phases:

Context & Boundary Lockdown: Explicitly define read-only files versus read-write files.

Pre-Execution Planning: Force the agent to state its understanding and step-by-step plan before writing code.

Test-Driven Verification: Require the agent to run existing tests or write a reproduction script to prove the baseline state.

Isolated Execution: Implement the DoDs strictly sequentially.

Post-Execution Validation: Require a terminal run (PowerShell) of linters, build steps, or tests to prove zero regressions.


Definitions of Done (DoDs)
To achieve the refined scope, we will execute the following DoDs in order:

DoD 1: Define the required input variables for the /Implement template (e.g., [Target Files], [Reference Files], [DoDs]).

DoD 2: Draft the "Hard Constraints" section of the command to prevent hallucinations and out-of-scope edits.

DoD 3: Draft the "Execution Sequence" section (Plan → Baseline Test → Code → Verify).

DoD 4: Assemble the final /Implement command text, optimized for token efficiency and SWE 1.5 parsing.




Treść wiadomości Gemini
The mathematical reality of the input and target states is now completely clear. Your sequence is perfectly aligned with The One Thing. By systematizing how SWE 1.5 ingests intent and contains its own blast radius, all subsequent development on sanglogium becomes exponentially faster and safer.

Evaluation of Your Strategy
Your approach of providing "rough scope" and asking the agent to optimize it into mechanical steps while strictly forbidding regressions is highly professional. However, relying purely on abstract instructions like "ensure 0 regressions" is not robust for an LLM agent. SWE 1.5 needs mechanical constraints, not just semantic warnings.

The Gap: LLMs are eager to please and will often proactively fix "nearby" issues they spot while implementing a DoD, leading to scope creep and regressions.

The Gap-Closing Solution: We must structure the /Implement command to force SWE 1.5 into a rigid, sequential state machine. It must explicitly declare its exact operational boundaries before it is allowed to write a single line of code.

Gap-Closing Steps for Implement.md
To achieve the fully simple, robust, professional standard, the Implement.md file must force the following sequence:

Ingestion & Translation: The agent reads the rough scope and DoDs, translating them into an optimized, atomic checklist.

Strict Boundary Declaration: The agent must explicitly output the exact file paths it will read and the exact file paths it is allowed to modify. Any file not on the 'Modify' list is strictly read-only.

Baseline Verification: Before making changes, the agent must define the PowerShell command used to verify the current state (e.g., npm run build, linting, or testing).

Isolated Execution: The agent executes its refined DoDs one by one.

Post-Execution Proof: The agent runs the verification command in PowerShell again to mechanically prove zero regressions.