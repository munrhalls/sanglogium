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

Each issue has **exactly three sections**:

#### 1. Critical Intelligence (optional)
- Max 5 bullets of key context. If more → link to a `.md` file.
- Links to research, architecture, or key files go here.

#### 2. SHOULD BE Scopes
Ordered list. Each scope is one concrete, symptom-only behavior.
- **Right:** "Payment page renders Stripe PaymentElement with client_secret from server"
- **Wrong:** "Fix Server Component → Route Handler communication"

#### 3. DoD Items Per Scope
For each scope, a checklist of binary verifications.
- Each item must be objectively pass/fail.
- Mark with evidence: "PASS — screenshot of Stripe form, trace xyz"

- **Blockers** (if any)
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

### What Counts as One Feature

A feature is a **user-facing capability** with a clear boundary:

- **Basket page** = one feature (display basket, update quantities, remove items)
- **Address collection** = one feature (form, validation, save to session)
- **Shipping selection** = one feature (fetch rates, display options, save selection)
- **Payment page** = one feature (funnel guards, Stripe integration, order creation)
- **Return page** = one feature (display order confirmation, show order details)

**NOT one feature:**
- "Checkout flow" (too broad — spans 5+ features)
- "Payment + return page" (two separate features)
- "Basket + payment" (unrelated capabilities)

If in doubt, split. One small feature per issue is better than one kitchen sink.

### Meta Issues (research, testing, cross-cutting concerns)

Meta issues are background concerns that don't follow the two-path structure:
- **Examples:** AI research, testing strategy, tooling exploration, architectural investigation
- **Status:** Set `status = meta` after creation: `bd update <id> --status meta`
- **Type:** Use `spike` (timeboxed investigation) or `task` as the `bd` type
- **No two-path required** — describe what to research/track; record findings in notes
- **No happy-path-first rule** — meta issues have no user-facing flow to validate

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

### Enforcement — No Work Without Issue

**Every agent MUST:**
1. **Read the beads issue completely** before touching any code
2. **Check `bd ready`** before creating a new issue — if an issue exists for this feature, update it
3. **Update the issue** with live check results before declaring done or handing off

**Violations:**
- Working on a feature without reading its issue = **STOP.** Demand issue ID first.
- Creating a new issue when one exists = **STOP.** Update existing issue instead.
- Declaring "done" without updating the issue = **NOT done.** Live check evidence must be in the issue.

### Content Guard — Prevent Pre-Diagnosis

If the issue description contains a theory ("the problem is X" or "we should do Y"):
- For **straightforward bugs** (single file, clear error): Rewrite the description with symptoms only, then proceed.
- For **complex bugs** (multiple files, unclear cause): Run `@/system-and-root-cause-analyzer` first.

Never create an issue that tells an agent what to implement without evidence.

### Operational Noise Guard

- **Already investigated with no fixable target:** STOP. An agent already spent compute and concluded "no concrete fix target exists." Creating an issue to re-investigate = noise. Capture a reproducible stack trace first, or close the thread.
- **Duplicate issue:** STOP. Check `bd ready` first. If an issue exists for this feature/bug, update it instead of creating a new one.
- **Scope change mid-issue:** STOP. If the feature definition changes (e.g., "payment page" → "payment page + return page + email capture"), close the current issue and create a new one. Never expand scope inside an existing issue.
- **Separate issue for edge case of existing feature:** STOP. Edge cases are later scopes in the same issue. Close the new issue, merge content into parent. One feature = one issue.

### Scope Ordering

**Work on Scope N only after all DoD items for Scope N-1 are PASS with evidence.**

- Scope 1 = core behavior. Later scopes = extensions / edge cases.
- Later scopes are inactive until prior scopes are complete.

**"Complete" definition:** All DoD items for a scope pass with evidence (logs, screenshots).

**Agent MUST NOT touch later scopes until:**
1. All prior scope DoD items marked PASS
2. Issue updated with evidence
3. User or orchestrator explicitly approves next scope

**Violation:** Agent working on Scope N+1 before Scope N is done = **STOP.** Redirect to active scope.

## Lifecycle Context

This workflow creates the issue **container**. The issue becomes the canonical record of:
- **Critical Intelligence** (key context, linked files)
- **SHOULD BE Scopes** (what the feature should do, ordered)
- **DoD Items** (pass/fail checks with evidence)

Agents read the issue before touching code. Agents update the issue before handing off. The issue is the hand-off artifact.

For the full safety net chain (analysis → orchestration → framing → implementation → verification), see `@/operational-rhythm`. Use it only after 2+ failed attempts.

`@/frame-decompose` runs INSIDE the beads issue, never in `docs/` during active work. Default mode = brief framing (objective + 3-5 tasks + acceptance). Safety net mode = full framing (root cause + complete decomposition + risk flags).
