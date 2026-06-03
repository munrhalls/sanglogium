# Sprint: Align All Beads Issues to Scope-Based Model

## UX Flows (Agent Experience)

1. Agent runs `bd show <id>` -> reads issue -> finds active scope quickly -> implements
2. Agent scans issue -> sees only 3 sections -> no confusion about structure
3. Agent updates issue -> adds DoD evidence -> marks scope complete -> moves to next

## End-State Overview

All 15 beads issues use the same 3-section structure: Critical Intelligence (optional), SHOULD BE Scopes, DoD Items Per Scope. Agent reads any issue and immediately knows: what is the active scope, what DoD items need evidence, what to implement next. No "happy path" vs "edge cases" confusion. Sequential scope ordering is self-evident from the issue itself.

## Architecture Contract

- Event: Agent reads issue
- State: Identifies first incomplete scope (active scope)
- Side Effect: Implements scope, runs live check
- Result Event: Updates issue with DoD evidence
- New State: Scope marked PASS, next scope becomes active

## Scope Contracts (5 max)

### Scope 1: Simple Issues — Search, Logging, Beads Kanban, Filters/Sorting, User account

**UX Slice:**
- Short descriptions, minimal embedded research
- Restructure: rename "Happy Path" -> "Scope 1", "Edge Cases Path" -> Scope 2, 3...
- Source code IS -> Critical Intelligence (≤5 bullets) or delete (git tracks history)

**Architecture Slice:**
- Read issue -> identify sections -> rewrite in-place
- Live checks become DoD items under their scope
- Delete "How to unlock" boilerplate (now in workflow)

**Verification:**
- [ ] Issue has only 3 sections
- [ ] Each scope has concrete SHOULD BE + DoD checklist
- [ ] No "Happy Path" or "Edge Cases Path" text remains

### Scope 2: Standard Checkout Issues — Shipping, Payment, Address, Return

**UX Slice:**
- Medium-length descriptions, standard two-path format
- Restructure: core flow = Scope 1, each edge case = separate scope

**Architecture Slice:**
- Same as Scope 1, but descriptions are longer
- May need to link out large "Source Code IS" sections to `.md` files

**Verification:**
- [ ] Same as Scope 1
- [ ] Linked files exist if Source Code IS was moved out

### Scope 3: Complex Issues — Sign-in/up, Basket page, Performance

**UX Slice:**
- Long descriptions with embedded research, gap analysis, framed tasks
- Extract research into linked `.md` files
- Keep only SHOULD BE + DoD in issue

**Architecture Slice:**
- Use `bd note` to append research as notes, then restructure description
- Or create `research/<issue-id>-findings.md` and link from Critical Intelligence

**Verification:**
- [ ] Same as Scope 2
- [ ] No research findings inlined in issue description

### Scope 4: Meta/Epic Issues — UI/UX Epic, Checkout Global UI/UX

**UX Slice:**
- Cross-cutting concerns, may span multiple features
- Check: should these be split into per-feature issues?
- If kept as meta: use `spike` or `task` type, no scope-sequential needed

**Architecture Slice:**
- Review each meta issue: does it follow meta rules (no user-facing flow)?
- If yes: set `status = meta`, keep minimal structure
- If no: split into per-feature issues

**Verification:**
- [ ] Meta issues have `status = meta`
- [ ] No scope-sequential rules applied to meta issues

### Scope 5: System Coherence Check

**UX Slice:**
- Run grep across all issues for old terminology
- Verify no "Happy Path", "Edge Cases Path", "two-path" remains

**Architecture Slice:**
- `grep -r "Happy Path\|Edge Cases Path\|two-path" .beads/` or issue descriptions
- Fix any stragglers

**Verification:**
- [ ] `grep` returns 0 matches for old terminology
- [ ] `@/checks` run on updated workflows — 0 gaps, 0 red flags

## Simplicity Guardrails

- One issue at a time. No batch updates.
- In-place restructure. Don't create new issues.
- If Source Code IS is >10 lines, link out — don't inline.
- "How to unlock" and lock/unlock boilerplate: delete. The workflow already has the rule.

## Continuous Verification

After each scope contract:
1. Update issue
2. Run `bd show <id>` to verify structure
3. Run `@/checks` on the issue content
4. Only then: next issue

## Final Check

- [ ] All 15 issues pass structure check
- [ ] `@/checks` on workflows — 0 gaps, 0 red flags
- [ ] `grep` for old terminology — 0 matches
