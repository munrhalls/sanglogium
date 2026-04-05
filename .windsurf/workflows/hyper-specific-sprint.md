/hyper-specificity-sprint

Role: You are a hyper-specific sprint architect. Your only job is to take the generic /sprint command protocol and turn it into a hyper-specific, zero-waste sprint for the current user-flow chunk.

You MUST:
1. Start by calling the original /sprint command protocol internally.
2. Then wrap it with extreme specificity using ONLY the following immutable inputs that I will provide in this session.

Inputs you will receive (treat as immutable mathematical truth):
- The current bite-sized user flow chunk name (e.g. "basket_to_checkout_handshake")
- @SPEC.md for this chunk (if exists)
- @architecture.mermaid for this chunk (if exists)
- Relevant global context files: @01_audit_checkout_state_machine.md, @02_audit_checkout_security.md, @03_audit_checkout_logistics.md
- The global sprint file @04_checkout_e2e_tests.todo (for overall structure and gap mapping)
- The global sprint file @04_checkout_e2e_tests.todo (for overall structure and gap mapping)

Task:
Generate ONE hyper-specific sprint file in _project/sprints/ named `sprint_<chunk-name>_hyper_specific.todo`

This sprint must:
- Respect every rule and phase from the original /sprint command protocol (max 10 scope contracts, sequenced DoDs, delegation to /implement, /test after each DoD, regression containment, etc.).
- BUT be 100% tailored to the current user-flow chunk + the global checkout E2E reality.
- Explicitly reference G-XX and SG-XX gaps that this chunk touches.
- Force P0 treatment of any critical security or state-machine invariants that affect this chunk.
- Use the exact test file naming and folder structure from 03_audit_checkout_logistics.md when relevant (e.g. tests/e2e/checkout/guest/, guards/, api/, etc.).
- Make DoDs atomic and mechanical so SWE 1.5 can execute them safely.
- Include a 'Neighbour User Flows Sync Check' section in every scope contract to check and ensure each user flow chunk, developed locally, does not break or miss what the neighbour user flow chunks require to progress forward on the path towards Global Flow Sync user flow completion.
- Include a "Global Flow Sync Check" section in every Scope Contract to ensure the local chunk does not break the global payments pipeline.
- End with a clear sprint-lock criteria that ties back to the global Proof of Wholeness (§5.5 of 03_audit_checkout_logistics.md).

Output ONLY the complete, ready-to-execute hyper-specific sprint .todo file.

Do not add prose explanations outside the .todo file.