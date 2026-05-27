---
description: "Add issue to beads tracker. One, singular issue per feature. Tracks current status of: should be, source code, live checks + logs vs should be (dev or production app manual checks, checking actual logs vs what the logs should be, checking if live app behaves as expected by 'should be'). Safety net triggers after 2+ failed attempts."
---

## Minimal Beads Organization System

### Mandatory Type (exactly one)
Run `bd types` to verify. Common types:
- `task` - General work item (default)
- `feature` - New features or enhancements
- `bug` - Defects or fixes
- `spike` - Timeboxed investigation to reduce uncertainty
- `chore` - Maintenance or housekeeping

**Note:** `research` and `infra` are NOT valid `bd` types. Use `spike` for investigations, `chore` for infrastructure.

### What Goes in Beads Issues
- One feature or one bug per issue. No bundling.
- Source code changes (diff summary, files touched)
- Live check results (pass/fail with evidence)
- Logs (trace IDs, error messages)
- Blockers (if any)
- Nothing else

### What Does NOT Go in Beads Issues
- Research findings → `research/` directory
- Documentation → `docs/` directory
- Notes or observations → appropriate doc files
- Theories or pre-formed diagnoses (see Content Quality below)

### Content Quality — Symptoms Only
Issue descriptions MUST contain symptoms, never theories.
- **Right:** "Cookie error at page.tsx:124. Trace: chk_12345. Repro: load /checkout/payment with empty session."
- **Wrong:** "Fix Server Component → Route Handler communication" or "The problem is X"

Why: AI agents are compliance-optimized. They will implement your wrong diagnosis rather than challenge it.

### Keep As-Is
- ID format (beads generates automatically)
- Priority system (0/1/2 is beads native)
- Simple description (no complex templates)

## Usage

add as beads issue
professionally determine simple, clear type (run `bd types` first)
later reference must be simple, clear, well-organized
must fit into overall beads organization, so beads stays coherent, simple, easy to navigate and use

### When to Create an Issue (Default Mode — 90% of work)

Create a beads issue when:
- You need to implement a feature or fix a bug
- The root cause is known or the feature is well-specified
- You expect 1-2 agent attempts to resolve it

**What the issue contains:**
- Feature/bug name + expected behavior (1-2 sentences)
- Files expected to change (optional)

**What happens next:**
Agent reads issue → implements → runs live check → updates issue with result.

### When to Use Safety Net Mode (10% of work)

Trigger: Same feature/bug has 2+ failed attempts, scope drift, or root cause is unclear.

**Do NOT create a new issue.** Update the existing issue with:
- "SAFETY NET MODE — 2+ failed attempts detected"
- Summary of what was tried and why it failed

Then run `@/system-and-root-cause-analyzer` on the existing issue.

### Content Guard — Prevent Pre-Diagnosis

If the issue description contains a theory ("the problem is X" or "we should do Y"):
- For **straightforward bugs** (single file, clear error): Rewrite the description with symptoms only, then proceed.
- For **complex bugs** (multiple files, unclear cause): Run `@/system-and-root-cause-analyzer` first.

Never create an issue that tells an agent what to implement without evidence.

### Operational Noise Guard

- **Already investigated with no fixable target:** STOP. An agent already spent compute and concluded "no concrete fix target exists." Creating an issue to re-investigate = noise. Capture a reproducible stack trace first, or close the thread.
- **Duplicate issue:** STOP. Check `bd ready` first. If an issue exists for this feature/bug, update it instead of creating a new one.

## Lifecycle Context

This workflow creates the issue **container**. The issue becomes the canonical record of:
- **What the feature should do** (expected behavior)
- **What the source code IS** (current implementation state — NOT what changed; git tracks changes)
- **Whether live checks passed or failed** (dev/prod manual checks, logs vs expected)
- **What logs were captured** (trace IDs, errors)

**Why "source code IS" not "what changed":** Git already tracks diffs. The next agent needs to know the CURRENT state of files to work from — not a changelog. Document the actual implementation: file paths, key functions, data flow.

Agents read the issue before touching code. Agents update the issue before handing off. The issue is the hand-off artifact.

For the full safety net chain (analysis → orchestration → framing → implementation → verification), see `@/operational-rhythm`. Use it only after 2+ failed attempts.

`@/frame-decompose` runs INSIDE the beads issue, never in `docs/` during active work. Default mode = brief framing (objective + 3-5 tasks + acceptance). Safety net mode = full framing (root cause + complete decomposition + risk flags).
