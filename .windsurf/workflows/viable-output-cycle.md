---
description: Complete tasks in under 60 minutes using single-output iteration
---

## Viable Output Cycle

Complete any task in under 60 minutes by iterating on single smallest viable outputs.

**Core Principle:** One smallest viable output at a time, no planning beyond next output.

### The Cycle (20 minutes per output)

**1. Define SINGLE smallest output (2 minutes)**
- What's the ONE thing I need right now?
- Not three things, ONE thing
- If you can't define it in 2 minutes, the task is too big - break it down

**2. Preflight check (3 minutes)**
- Is this safe/legitimate?
- Do I have access/permissions?
- Any blockers?
- Stop if unsafe or blocked

**3. Ugly experiment (10 minutes)**
- Make it work, ignore quality
- Hardcode values if needed
- No error handling, just the happy path
- Get SOMETHING working

**4. AI professionalize (3 minutes)**
- "Here's working ugly code, make it production-ready"
- Paste the working ugly version
- Let AI handle quality, patterns, best practices

**5. Document what you learned (2 minutes)**
- 3 bullets: what worked, what didn't, what's next
- Save to relevant .md file or memory

**Repeat** until task complete (3 cycles = 60 minutes maximum)

### Key Rules

- **NO planning ahead** - only plan the current cycle's single output
- **NO perfectionism** - ugly is fine, AI will fix it
- **NO multi-tasking** - one output per cycle
- **STOP after 3 cycles** - if not done, reassess whether task is too big

### When to Use This Workflow

Use when:
- Task feels overwhelming or undefined
- You're stuck in research/planning without execution
- Time is limited (under 60 minutes available)
- You need tangible progress quickly

Do NOT use when:
- Task is already well-defined with clear steps
- Complex architectural decisions needed
- Multiple stakeholders involved
- Task requires deep research before any execution

### Example: Shipping Page API Integration

**Cycle 1 (20m):** Get API to return ANY rate
- Preflight: Is AlleKurier API legitimate? ✓
- Ugly: Hardcode credentials, call endpoint, log response
- AI: Clean up error handling, add types, make production-ready
- Document: "API returns rates, credentials work"

**Cycle 2 (20m):** Get rates for Poland specifically
- Preflight: Do I have PL sender address data? ✓
- Ugly: Hardcode PL address, call API with PL params
- AI: Add address validation, proper PL-specific handling
- Document: "PL rates working, delivery times included"

**Cycle 3 (20m):** Integrate into shipping page UI
- Preflight: Is shipping page component accessible? ✓
- Ugly: Render rates as plain text list
- AI: Build proper UI component with styling
- Document: "Shipping page displays PL rates with delivery times"

**Result:** Working shipping page in 60 minutes

### Anti-Patterns to Avoid

- **Planning paralysis:** Spending more time planning than executing
- **Research rabbit holes:** Deep diving before any execution
- **Perfectionism:** Trying to get it right the first time
- **Scope creep:** Adding "just one more thing" to the current cycle
- **Ignoring the timer:** Letting cycles run over 20 minutes

### Stopping Criteria

Stop and reassess if:
- You can't define a single output in 2 minutes
- Preflight reveals blockers you can't resolve
- 3 cycles complete and task isn't done (task too big)
- Quality is critical and "ugly first" is inappropriate
