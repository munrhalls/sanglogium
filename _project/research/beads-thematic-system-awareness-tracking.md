# Beads Thematic System-Level Awareness Tracking - Research

## Research Scope Contract
- **Topic:** Minimal thematic system-level awareness tracking in beads using separate MEANS
- **First Principles:** Labels as minimal categorization mechanism, state dimensions for operational tracking, hooks for lifecycle integration
- **Fundamentals:** Beads labels, state dimensions, hooks system, bd remember, key-value store
- **Scope Boundary:** Research only - no implementation, no code changes, pure analysis
- **Target Audience:** Project maintainers implementing awareness tracking
- **Decay Risk:** Low - beads core features stable

---

## Source Hierarchy

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| bd prime | local | CLI output | Canonical | 2026-05-20 | `bd remember` for persistent knowledge | ✅ Verified |
| bd help | local | CLI output | Canonical | 2026-05-20 | Labels, state dimensions, hooks available | ✅ Verified |
| AGENTS.md | local | Project docs | Canonical | 2026-05-20 | Use `bd remember` - do NOT use MEMORY.md | ✅ Verified |
| .windsurf/rules.md | local | Project rules | Canonical | 2026-05-20 | `bd remember "insight"` to save learnings | ✅ Verified |
| .beads/config.yaml | local | Config | Canonical | 2026-05-20 | No custom types configured | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
Track what the system knows about different themes (e.g., "basket", "checkout", "shipping") at a system level, updating only when required, with minimal overhead.

### Underlying Constraints
1. **Beads storage:** Issues live in Dolt database, not markdown files
2. **Lifecycle integration:** Must work at issue start (claim) and end (close)
3. **Minimal updates:** Only update awareness when actually required
4. **Zero noise:** No unnecessary writes or updates
5. **Hooks availability:** pre-commit, post-merge, post-checkout available
6. **Label system:** Free-form labels for categorization
7. **State dimensions:** Structured dimension:value labels for operational state

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Labels (theme:basket) | Simple, queryable, existing | No validation, manual | Quick categorization |
| State dimensions (awareness:basket=known) | Structured, operational | Requires dimension naming | System-level tracking |
| Key-value store | Simple key-value | No query by theme, no history | Simple flags |
| bd remember | Persistent, injected at prime | Not queryable, per-insight | Lessons learned |

### Failure Modes
1. **Misapplication:** Using bd remember for system-level awareness (not queryable)
2. **Over-application:** Updating awareness on every issue (noise)
3. **Under-application:** Never updating awareness (stale data)

---

## Code Fundamentals

### Fundamental: Beads Labels
**Claim:** Labels are free-form strings attached to issues for categorization

**Verification:**
- [x] Located in codebase: `.beads/issues.jsonl` (labels array in each issue)
- [x] CLI verified: `bd label list-all` shows 8 unique labels currently
- [x] Source inspected: beads help output shows label commands

**Actual Behavior:**
- Labels are stored as array of strings in each issue
- Can be added/removed via `bd label add/remove`
- Queryable via `bd label list-all` and `bd label list <issue-id>`
- No schema validation - any string allowed

**Edge Cases:**
- Case sensitivity: labels are case-sensitive
- Duplicates: beads prevents duplicate labels on same issue
- No hierarchy: labels are flat, no parent-child relationships

### Fundamental: State Dimensions
**Claim:** State labels follow `<dimension>:<value>` convention for operational tracking

**Verification:**
- [x] CLI verified: `bd state --help` shows dimension:value pattern
- [x] CLI verified: `bd set-state --help` shows atomic state change with event bead creation
- [x] Examples: patrol:active, mode:degraded, health:healthy

**Actual Behavior:**
- `bd set-state <issue-id> <dimension>=<value>` creates event bead (source of truth)
- Removes existing label for dimension, adds new dimension:value label (fast lookup cache)
- Provides audit trail via event bead with reason field
- Queryable via `bd state <issue-id> <dimension>`

**Edge Cases:**
- Dimension naming: no validation, convention-based
- Multiple dimensions: one issue can have multiple state labels
- No global state query: must query per issue

### Fundamental: Beads Hooks
**Claim:** Hooks provide pre-commit, post-merge, post-checkout integration points

**Verification:**
- [x] Located in codebase: `.beads/hooks/pre-commit`, `post-merge`, `post-checkout`
- [x] CLI verified: `bd hooks --help` shows available hooks
- [x] Source inspected: Hook files call `bd hooks run <hook-name>` with timeout

**Actual Behavior:**
- Hooks are shell scripts that call `bd hooks run`
- Timeout configurable via BEADS_HOOK_TIMEOUT (default 300s)
- Exit code 3 means "database not initialized" (non-fatal)
- Hooks run automatically on git operations

**Edge Cases:**
- Timeout: hook exits with code 124 on timeout (continues without beads)
- No database: hook exits with code 3 (continues without beads)
- Manual execution: can run `bd hooks run <hook-name>` manually

### Fundamental: bd remember
**Claim:** Memories persist across sessions and are injected at prime time

**Verification:**
- [x] CLI verified: `bd remember --help` shows memory storage
- [x] CLI verified: `bd memories` shows no memories currently stored
- [x] Project docs: AGENTS.md and .windsurf/rules.md both mandate `bd remember`

**Actual Behavior:**
- Stores insight with optional key (auto-generated if not set)
- Injected at `bd prime` time for every session
- Key-based updates: if key exists, updates in place
- Not queryable: no search/filter, only recall by key

**Edge Cases:**
- Key collision: overwrites existing memory with same key
- No search: cannot list all memories, only recall specific ones
- Session-only: not visible in issue data, only at prime time

---

## Best Practices (Verified)

### Practice: Use Labels for Thematic Categorization
**Consensus:** High - labels are designed for categorization

**Supporting Evidence:**
- bd help output: "Manage issue labels"
- Current usage: 8 unique labels in database (bug, feature, infra, research, etc.)
- Queryable: `bd label list-all` shows all labels across all issues

**Counter-Evidence (Falsification Attempts):**
- No validation: could lead to inconsistent label names (mitigation: convention)
- No hierarchy: flat structure may not capture complex themes (mitigation: use compound labels like "research furgonetka shipping")

**Verdict:** ✅ Recommended for thematic categorization

**When to Use:** When you need to group issues by theme for querying
**When to Skip:** When you need structured operational state (use state dimensions instead)

### Practice: Use State Dimensions for System-Level Tracking
**Consensus:** High - state dimensions designed for operational tracking

**Supporting Evidence:**
- bd state help: "Query the current value of a state dimension"
- bd set-state help: "Atomically set operational state on an issue"
- Creates audit trail via event bead (source of truth)

**Counter-Evidence (Falsification Attempts):**
- No global query: cannot query all issues with specific state (mitigation: use labels for global queries)
- Dimension naming: no validation, requires convention (mitigation: document dimension names)

**Verdict:** ✅ Recommended for system-level operational tracking

**When to Use:** When you need to track operational state (e.g., awareness:basket=known)
**When to Skip:** When you need simple categorization (use labels instead)

### Practice: Use Hooks for Lifecycle Integration
**Consensus:** High - hooks designed for git workflow integration

**Supporting Evidence:**
- bd hooks help: "Install, uninstall, or list git hooks for beads integration"
- Current setup: pre-commit, post-merge, post-checkout hooks installed
- Automatic execution: hooks run on git operations

**Counter-Evidence (Falsification Attempts):**
- Shell-only: hooks are shell scripts, not Node.js (mitigation: can call Node.js scripts from shell)
- Timeout risk: long-running hooks can timeout (mitigation: keep hooks fast or increase timeout)

**Verdict:** ✅ Recommended for lifecycle integration

**When to Use:** When you need to run commands on git operations
**When to Skip:** When you need issue-specific triggers (use beads formulas/gates instead)

---

## Common Solutions Landscape

### Solution: Labels for Thematic Awareness
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Simple to use: `bd label add <issue-id> theme:basket`
- Queryable: `bd label list-all` shows all themes
- No setup required: labels work out of the box
- Fast lookup: labels are cached on issues

**Cons:**
- No validation: inconsistent naming possible
- No audit trail: label changes not tracked as events
- No history: cannot see previous label values

**Real-World Pain Points:**
- Inconsistent naming: "basket" vs "Basket" vs "basket-page"
- No awareness of when label was added or why
- Cannot distinguish between "theme" labels and other labels

**Recommendation:** Use for simple thematic categorization with documented naming convention

### Solution: State Dimensions for Awareness Tracking
**Prevalence:** Niche (designed for operational state)
**Type:** Idiomatic for operational tracking

**Pros:**
- Audit trail: event bead records state change with reason
- Atomic: removes old label, adds new label in one operation
- Queryable per issue: `bd state <issue-id> awareness`
- Structured: dimension:value pattern enforces structure

**Cons:**
- No global query: cannot query all issues with awareness:basket=known
- Per-issue only: must query each issue individually
- Dimension naming: requires convention for dimension names

**Real-World Pain Points:**
- Cannot get list of all themes the system is "aware" of
- Must iterate through all issues to check awareness state
- No validation of dimension names

**Recommendation:** Use for operational tracking where audit trail is critical, supplement with labels for global queries

### Solution: Key-Value Store for Awareness Flags
**Prevalence:** Niche
**Type:** Workaround

**Pros:**
- Simple: `bd kv set awareness:basket true`
- Global: can query all keys with `bd kv list`
- Fast: direct key-value lookup

**Cons:**
- No audit trail: no history of changes
- No issue linkage: not tied to specific issues
- No structure: flat key-value pairs
- No validation: any key/value allowed

**Real-World Pain Points:**
- No connection to issues that changed awareness
- No way to know when or why awareness changed
- Cannot query by issue (only by key)

**Recommendation:** Avoid for awareness tracking - no issue linkage, no audit trail

### Solution: bd remember for Awareness
**Prevalence:** Common (for lessons learned)
**Type:** Anti-pattern for system-level awareness

**Pros:**
- Persistent: survives session rotation
- Injected at prime: available in every session
- Simple: `bd remember "basket API uses parcel data"`

**Cons:**
- Not queryable: cannot search or filter memories
- Not tied to issues: no linkage to specific work
- Per-insight: each memory is independent
- No global view: cannot see all awareness at once

**Real-World Pain Points:**
- Cannot query "what is the system aware of about basket?"
- No connection to issues that generated the awareness
- No validation or structure

**Recommendation:** ❌ Avoid for system-level awareness - use for lessons learned instead

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Labels are queryable | `bd label list-all` output | CLI |
| State dimensions create audit trail | `bd set-state --help` output | CLI |
| Hooks run on git operations | Hook files in .beads/hooks/ | Source |
| bd remember not queryable | `bd memories` shows no list command | CLI |
| Key-value store has no audit trail | `bd kv --help` shows no history | CLI |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Labels provide audit trail | No event beads created for label changes | Abandoned |
| State dimensions are globally queryable | `bd state` requires issue-id parameter | Modified - use labels for global query |
| bd remember suitable for awareness | No query capability, no issue linkage | Abandoned |
| Key-value store ties to issues | No issue-id parameter in kv commands | Abandoned |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Beads CLI commands | Low - stable API | 2027-05-20 |
| Hook system | Low - stable integration | 2027-05-20 |
| Label system | Low - core feature | 2027-05-20 |
| State dimensions | Low - core feature | 2027-05-20 |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use labels for thematic awareness | Simple, queryable, existing infrastructure | Add labels like `theme:basket`, `theme:checkout` to issues |
| Use state dimensions for operational awareness | Audit trail critical for system-level tracking | Use `awareness:basket=known`, `awareness:checkout=known` on issues |
| Combine labels + state dimensions | Labels for global query, state for audit trail | Label for theme, state for awareness level |
| Use hooks for lifecycle integration | Automatic execution on claim/close | Add hook script to update awareness on claim/close |
| Avoid bd remember for awareness | Not queryable, no issue linkage | Use bd remember for lessons learned only |
| Avoid key-value store for awareness | No audit trail, no issue linkage | Use labels/state dimensions instead |

### Minimal Awareness Tracking Pattern

**MEANS:** Labels + State Dimensions

**Lifecycle Integration:**
1. **Issue claimed (start):** Hook checks if issue has theme label, sets `awareness:<theme>=in_progress`
2. **Issue closed (end):** Hook checks if issue has theme label, sets `awareness:<theme>=known` (ONLY if awareness actually changed)

**Update Condition:** Only update awareness if the issue actually changed system-level awareness about the theme (not every issue)

**0 Noise:** Skip awareness update if issue did not change awareness (e.g., minor bug fix, documentation)

**Query Patterns:**
- Global themes: `bd label list-all | grep theme:`
- Per-issue awareness: `bd state <issue-id> awareness`
- All issues with theme: `bd query "labels:theme:basket"`

### Immediate Actions

1. Document theme naming convention (e.g., `theme:<feature-name>`)
2. Document awareness dimension naming (e.g., `awareness:<feature-name>`)
3. Add convention to .windsurf/rules.md
4. Add convention to memories via bd remember
5. Design hook script for lifecycle integration
6. Create minimal experiment to validate pattern

### Open Questions

1. What constitutes "changed system-level awareness"? (need clear criteria)
2. Should awareness be per-feature or per-technical-domain? (e.g., `theme:basket` vs `theme:parcel-calculation`)
3. How to handle awareness degradation? (e.g., code rollback - should awareness revert?)
4. Should awareness have more states than `in_progress`/`known`? (e.g., `deprecated`, `unknown`)

---

## Minimal Experiment Design

**Objective:** Validate that labels + state dimensions can track thematic awareness with 0 noise

**Experiment Steps:**

1. Create test issue with `theme:test-awareness` label
2. Claim issue - hook should set `awareness:test-awareness=in_progress`
3. Close issue with reason "no awareness change" - hook should NOT update awareness
4. Create another test issue with `theme:test-awareness` label
5. Close issue with reason "implemented feature" - hook should set `awareness:test-awareness=known`
6. Verify:
   - `bd label list-all` shows `theme:test-awareness`
   - `bd state <issue-id> awareness` shows correct state
   - Only issue 5 updated awareness (issue 3 did not - 0 noise)

**Success Criteria:**
- Labels correctly categorize themes
- State dimensions correctly track awareness
- Hook only updates awareness when required (0 noise)
- Query patterns work as expected

**Cleanup:** Delete test issues after validation

---

## Conclusion

**Recommended MEANS:** Labels + State Dimensions

**Rationale:**
- Labels provide global query capability for themes
- State dimensions provide audit trail for awareness changes
- Hooks provide automatic lifecycle integration
- Minimal overhead: uses existing beads features
- 0 noise: conditional updates only when awareness actually changes

**Integration Points:**
- .windsurf/rules.md: Add naming conventions
- bd remember: Add conventions to memories
- Hooks: Add lifecycle integration script

**Next Steps:** Implement minimal experiment to validate pattern before full rollout
