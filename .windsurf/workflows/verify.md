---
description: Evidence-based verification workflow that prevents generic verbiage and requires deep checks
---

# /verify - Evidence-Based Verification Workflow

## Purpose
Prevent generic verbiage and principles-based answers by requiring evidence collection and dependency chain verification before any answer can be given.

## Core Principle
**No answer without evidence.** Every claim must be backed by actual verification (file reads, test output, command results, dependency chain traces).

---

## Workflow Steps

### Step 1: Evidence Gate (MANDATORY - Before Any Answer)
Before providing any answer, you MUST collect evidence:

**Required Evidence Types:**
- **File Evidence:** Read actual files, don't assume content
- **Command Evidence:** Run actual commands, don't assume output
- **Data Evidence:** Query actual data, don't assume state
- **Dependency Evidence:** Trace actual dependencies, don't assume connections

**Evidence Collection Protocol:**
```
1. Identify what needs verification
2. Collect actual evidence using tools (read_file, bash, grep)
3. Verify dependency chains explicitly
4. Document all evidence collected
5. Only then proceed to answer
```

**Blocking Rule:** Cannot proceed to Step 2 until evidence is collected and shown.

---

### Step 2: Dependency Chain Verification
Map and verify each link in the dependency chain:

**For Each Dependency:**
- What does it depend on?
- Is that dependency verified?
- What evidence supports this link?
- Where is the evidence shown?

**Dependency Chain Template:**
```markdown
## Dependency Chain Verification

### Link 1: [Component/File/Claim]
- **Depends on:** [What it needs]
- **Evidence:** [File read / Command output / Data query]
- **Status:** VERIFIED / UNVERIFIED

### Link 2: [Component/File/Claim]
- **Depends on:** [What it needs]
- **Evidence:** [File read / Command output / Data query]
- **Status:** VERIFIED / UNVERIFIED

[Continue for all links...]
```

**Blocking Rule:** Cannot proceed to Step 3 until all dependency links are verified.

---

### Step 3: Answer Generation (Evidence-Based Only)
Generate answer based ONLY on collected evidence:

**Answer Rules:**
- Base claims on evidence shown
- Cite evidence for each claim
- No principles without verification
- No memories without evidence
- No assumptions without proof

**Answer Template:**
```markdown
## Answer

**Evidence-Based Conclusion:** [Claim]

**Supporting Evidence:**
- [Evidence 1]: [What it shows]
- [Evidence 2]: [What it shows]
- [Evidence 3]: [What it shows]

**Dependency Chain:** [Summary of verified chain]
```

**Blocking Rule:** Cannot include any claim not supported by collected evidence.

---

### Step 4: Verification Checklist
Before final answer, verify:

```markdown
## Verification Checklist
- [ ] Evidence collected and shown in response
- [ ] Dependency chain explicitly mapped and verified
- [ ] Answer based on evidence only
- [ ] No generic verbiage or principles without evidence
- [ ] No assumptions without proof
- [ ] All claims cite evidence sources
```

**Blocking Rule:** Cannot output answer until all checklist items pass.

---

## Anti-Patterns (FORBIDDEN)

❌ **Answering without evidence** - "Based on principles, X is true"
❌ **Assuming file contents** - "The file probably contains Y"
❌ **Assuming command output** - "The command should return Z"
❌ **Using memories without verification** - "From memory, pattern X applies"
❌ **Making claims without proof** - "This should work because..."

## Required Patterns (MANDATORY)

✅ **Read actual files** - Use `read_file` tool, show content
✅ **Run actual commands** - Use `bash` tool, show output
✅ **Query actual data** - Use `grep` or database tools, show results
✅ **Map dependencies** - Show each link in chain with evidence
✅ **Cite evidence** - Reference specific evidence for each claim
✅ **Show verification** - Display what was actually verified

---

## Example: Correct Usage

**Question:** "Is the design professionally validated?"

**Step 1: Collect Evidence**
```bash
read_file docs/checkout-queue/reservation-ttl/PRD.todo
read_file docs/checkout-queue/reservation-ttl/diagram.md
grep -r "test" tests/checkout-queue/integration/reservation-ttl/
```

**Step 2: Verify Dependencies**
- PRD.todo exists and has DoD items ✓
- diagram.md exists and has flow chart ✓
- Tests exist and map to DoD items ✓

**Step 3: Evidence-Based Answer**
```markdown
**Evidence-Based Conclusion:** No

**Supporting Evidence:**
- PRD.todo has 5 DoD items marked complete but no traceability matrix
- Tests exist but no documented verification they pass
- No human verification guides present
- No audit trail or compliance documentation

**Dependency Chain:**
DoD items → Tests → Implementation (implicit, not explicit)
```

---

## Example: Incorrect Usage (FORBIDDEN)

**Question:** "Is the design professionally validated?"

**Step 1: SKIP evidence collection ❌

**Step 2: SKIP dependency verification ❌

**Step 3: Generic verbiage answer ❌
```markdown
Based on the Directness Principle and human-first methodology,
professional validation requires human observation and direct
evidence. The design has tests and DoD items, so it should be
professionally validated.
```

**Why This Is Wrong:**
- No evidence collected
- No dependency verification
- Principles used without verification
- Assumptions made without proof
- Generic verbiage instead of evidence

---

## Enforcement Mechanism

**Self-Check Before Answering:**
1. Did I collect actual evidence? (If no, STOP and collect)
2. Did I verify dependency chains? (If no, STOP and verify)
3. Is my answer based ONLY on evidence? (If no, STOP and revise)
4. Can I cite evidence for each claim? (If no, STOP and collect more)

**If Any Check Fails:**
- STOP immediately
- Collect missing evidence
- Verify missing dependencies
- Only then proceed

---

## Success Criteria

- Every answer includes evidence citations
- Every claim backed by actual verification
- No principles used without evidence
- No assumptions made without proof
- Dependency chains explicitly mapped
- Verification checklist passes before output
