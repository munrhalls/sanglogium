# Diagnostic Report: AI Workflows — Experimental Reality vs Proposed Upgrades

> **Date:** 2026-05-26
> **Method:** Read-only diagnostic experiments. Zero files modified.
> **Scope:** Verify or falsify claims from `ai-workflows-comparison-may-2026.md` against git history, file contents, and command execution.

---

## Experiment 1: Workflow Lifecycle Reality

**Method:**
1. `Get-ChildItem .windsurf/workflows` → count files, measure sizes
2. `git log --all --oneline -- .windsurf/workflows/` → 30 commits reviewed
3. Read content of 6 smallest workflow files

**Findings:**

| File | Size | Non-Empty Lines | Content Quality |
|------|------|-----------------|-----------------|
| `open.md` | 0 bytes | 0 | Empty file |
| `checks.md` | 92 bytes | 5 | "simplest possible / 0 gaps / 0 red flags / professionally well-checked" |
| `exe.md` | 264 bytes | 5 | Vague imperative to "execute, simplest possible" |
| `tasks-decomposition.md` | 54 bytes | 3 | "De-compose tasks and make tasks graph. Show it to me." |
| `obsorient.md` | 87 bytes | 5 | "observe orient how to implement / present plan 6 sentences" |
| `ram-watchdog.md` | 119 bytes | 2 | PowerShell one-liner to start watchdog script |
| `system-contract.md` | 678 bytes | 25 | Template with empty placeholders |

**Combined 6 files:** 15 non-empty lines of actual content.

**Git Evidence of Past Cleanup (Validated):**
- `15ff9bdc` 2026-04-24: "Remove obsolete workflow files"
- `df59378a` 2026-04-16: "remove verf.md workflow file"
- `a3f84f2f` 2026-05-03: "Consolidated workflow templates, moved to docs/workflow/"
- `b71f9209` 2026-04-28: "Reorganize workflows from archive to root and add new workflow files" — archive created, then undone
- `8cb52507` (no date in log): "Project organization cleanup: consolidate structure, remove bloat"

**Surprise:** The project ALREADY KNOWS about workflow bloat. It has a documented history of removing obsolete files, consolidating templates, and creating archives. Yet the bloat persists (54 files). This suggests the consolidation attempts were incomplete or the file-addition rate exceeds the cleanup rate.

**Claim Validation:**
- "54 workflows, many unused" → **VALIDATED.** 6 files contain a combined 15 lines of content. `open.md` is literally 0 bytes.
- "Workflow bloat reduces agent adherence" → **NOT DIRECTLY TESTABLE** (would require agent log analysis), but strongly inferential given the 0-byte and near-empty files.

---

## Experiment 2: Hook Enforcement Reality

**Method:**
1. Read `.windsurf/hooks.json` → verify enabled status
2. Read `.claude/settings.json` → verify hook coverage
3. Run `npx eslint . --max-warnings=0` → verify the disabled hook's command actually works
4. `git log -- .windsurf/hooks.json` → discover why it was disabled

**Findings:**

```json
// .windsurf/hooks.json
{
  "postWrite": {
    "enabled": false,
    "command": "npm run lint",
    "shell": "powershell"
  }
}
```

```json
// .claude/settings.json
{
  "hooks": {
    "PreCompact": [{"hooks": [{"command": "bd prime"}]}],
    "SessionStart": [{"hooks": [{"command": "bd prime"}]}]
  }
}
```

**Hook Coverage Matrix:**

| Hook | Windsurf | Claude Code | Status |
|------|----------|-------------|--------|
| postWrite (lint) | ✗ Disabled | N/A | **INACTIVE** |
| pre_run_command (security) | ✗ Missing | N/A | **MISSING** |
| PostToolUse (format) | N/A | ✗ Missing | **MISSING** |
| PreCompact | N/A | ✓ `bd prime` | Active |
| SessionStart | N/A | ✓ `bd prime` | Active |

**Command Viability Test:**
`npx eslint . --max-warnings=0` → **Exit code 0.** The lint command works. The codebase is currently clean.

**Critical Git Finding:**
Commit `f22caa0e` (2026-05-05): **"Disable postWrite lint hook"** — explicit human decision to turn it off.

**Surprise:** The hook was intentionally disabled 3 weeks ago. The person who disabled it had a reason (unknown from this experiment). However, the command the hook would run works perfectly (exit code 0, no lint errors). The infrastructure is present and functional; the switch is just off.

**Claim Validation:**
- "Zero enabled hooks" → **VALIDATED.** `enabled: false` is the only hook in `.windsurf/hooks.json`.
- "No deterministic enforcement" → **VALIDATED.** Zero blocking pre-hooks. Zero PostToolUse format hooks.
- "Enabling the hook would be trivial" → **VALIDATED.** Change one boolean. The command works.

---

## Experiment 3: CLAUDE.md / AGENTS.md Duplication & Emptiness

**Method:**
1. Read `CLAUDE.md` (71 lines)
2. Read `AGENTS.md` (97 lines)
3. `git diff --no-index CLAUDE.md AGENTS.md` → measure overlap
4. `git log -- CLAUDE.md` → check modification history

**Findings:**

**CLAUDE.md line audit:**
- Lines 1–51: Beads integration (identical to AGENTS.md)
- Lines 54–62: Build & Test section → **EMPTY PLACEHOLDER** (`_Add your build and test commands here_`)
- Lines 64–66: Architecture Overview → **EMPTY PLACEHOLDER** (`_Add a brief overview_`)
- Lines 68–71: Conventions & Patterns → **EMPTY PLACEHOLDER** (`_Add your project-specific conventions here_`)

**Non-empty, non-placeholder lines in CLAUDE.md: 46.**
**All 46 lines are copied from AGENTS.md.**

**Git diff output:** `CLAUDE.md => AGENTS.md | 68 +++++++++++++++++++++---------------- 1 file changed, 47 insertions(+), 21 deletions(-)`

**Git history for CLAUDE.md:**
- Only touched in commit `d41c3ebb` (2026-05-14: "bd init: initialize beads issue tracking")
- Since then: **zero modifications.** The empty placeholders have been empty since creation.

**Surprise:** CLAUDE.md has not been updated since its initial creation. The placeholders were never filled. This is not a case of "needs pruning" — it's a case of "was never written."

**Claim Validation:**
- "CLAUDE.md is a stub with empty placeholders" → **VALIDATED.** Lines 54–71 are verbatim placeholders.
- "CLAUDE.md duplicates AGENTS.md content" → **VALIDATED.** 46 of 46 content lines are beads integration copied from AGENTS.md.
- "Needs <200 lines with WHAT/WHY/HOW" → **PARTIALLY DISQUALIFIED** as a recommendation because the file is not over-long — it's under-written. The real problem is missing content, not excessive length.

---

## Experiment 4: Rules Format Reality

**Method:**
1. `Get-ChildItem .windsurf/` → check for `rules/` directory
2. Read `.windsurf/rules.md` → verify flat format
3. `git log -- .windsurf/rules.md` → check modification history

**Findings:**

- `.windsurf/rules.md` EXISTS (3,485 bytes, 91 lines)
- `.windsurf/rules/` directory DOES NOT EXIST
- Modern format (`.windsurf/rules/*.md` with YAML frontmatter) is **NOT PRESENT**

**Git history for `.windsurf/rules.md`:**
- `e0b888a7` 2026-05-08: "Add Next.js 15 barrel file anti-pattern rule"
- `a692d95e` 2026-05-03: "Added AAA pattern research, rules, and testing best practices"
- `5e51bafb` 2026-05-14: "Add beads task tracking documentation to rules"
- `de0c5b2c` 2026-05-21: "update issue state changes and interaction logs"

The flat file is actively maintained (4 commits in May 2026). No attempt has been made to migrate to the modern format.

**Claim Validation:**
- "Uses legacy flat rules format" → **VALIDATED.** No `rules/` directory exists.
- "Modern format supports activation modes and glob scoping" → **VALIDATED by external docs**, but not directly testable in this repo.

---

## Experiment 5: Cross-Agent Portability Reality

**Method:**
1. `Find-Item -Path . -Filter "SKILL.md" -Recurse` → search entire repo
2. Read `.cursorrules` → verify content and references
3. `git log -- .cursorrules` → check history
4. Search for referenced files (`examples/gold-standard.tsx`, `.windsurf/feedback-loop.md`)

**Findings:**

**SKILL.md search:** 0 results across entire repository.

**.cursorrules content:**
- Lines 1–5: Pointers to `@AGENTS.md`, `@examples/gold-standard.tsx`, `@.windsurf/feedback-loop.md`
- Lines 9–13: Cursor-specific settings (tab autocomplete, `@` references, Composer)
- Lines 17–24: Quick reference table
- Lines 28–35: "See AGENTS.md for..." (delegation)
- Lines 39–40: Last updated 2026-04-16

**Dead References in .cursorrules:**
- `@examples/gold-standard.tsx` → **FILE DOES NOT EXIST** (0 results in search)
- `@.windsurf/feedback-loop.md` → **FILE DOES NOT EXIST** (0 results in search)

**Git history for .cursorrules:**
- `088bf8e8` 2026-03-03: **"delete cursorrules file (not using cursor)"**
- Then apparently recreated later (present in repo now)

**Surprise:** `.cursorrules` was explicitly deleted with the message "not using cursor" and then recreated. This suggests intermittent Cursor usage. Also, two of the three `@` references in `.cursorrules` point to non-existent files.

**Claim Validation:**
- "No SKILL.md skills" → **VALIDATED.** Zero files found.
- ".cursorrules is mostly a pointer" → **VALIDATED.** 27 of 41 lines are pointers or delegation.
- ".cursorrules references non-existent files" → **VALIDATED.** 2 of 3 `@` references are dead.

---

## Experiment 6: MCP Configuration Reality

**Method:**
1. `Find-Item -Path . -Filter "*mcp*.json" -Recurse` → search entire repo
2. Check common MCP config locations: `.cursor/mcp.json`, `.mcp.json`, `mcp_config.json`

**Findings:**

| Location | Exists? |
|----------|---------|
| `.cursor/mcp.json` | No |
| `.mcp.json` | No |
| `mcp_config.json` | No |
| Any `*mcp*.json` | **No** |

**Claim Validation:**
- "No MCP configuration" → **VALIDATED.** Zero MCP config files in the repository.

---

## Synthesis: Validated vs Falsified Claims

| Claim from Research Artifact | Experiment Result | Status |
|------------------------------|-------------------|--------|
| 54 workflows exist | Counted 56 items in `.windsurf/workflows/` (54 `.md` + 2 hidden) | **VALIDATED** |
| Many workflows are unused/empty | `open.md` = 0 bytes; 6 smallest files = 15 lines combined | **VALIDATED** |
| Workflow bloat reduces agent adherence | Not directly testable; inferential | **INCONCLUSIVE** |
| hooks.json is disabled | `"enabled": false` | **VALIDATED** |
| Zero deterministic enforcement | Zero blocking pre-hooks; zero PostToolUse hooks | **VALIDATED** |
| Hook command works | `npx eslint . --max-warnings=0` → exit 0 | **VALIDATED** |
| Hook was intentionally disabled | Commit `f22caa0e`: "Disable postWrite lint hook" | **VALIDATED** |
| CLAUDE.md is a stub with empty placeholders | Lines 54–71 are `_Add your ... here_` | **VALIDATED** |
| CLAUDE.md duplicates AGENTS.md | 46 of 46 content lines are beads content from AGENTS.md | **VALIDATED** |
| CLAUDE.md needs to be <200 lines | File is only 71 lines (46 content + 25 empty/placeholder) | **FALSIFIED** — problem is missing content, not excessive length |
| Legacy flat rules format | `.windsurf/rules.md` exists; `.windsurf/rules/` does not | **VALIDATED** |
| No SKILL.md files | Search returned 0 results | **VALIDATED** |
| .cursorrules is mostly pointers | 27 of 41 lines are delegation | **VALIDATED** |
| .cursorrules references dead files | 2 of 3 `@` references don't exist | **VALIDATED** |
| No MCP config | Zero `*mcp*.json` files | **VALIDATED** |
| Past workflow consolidation attempts exist | Commits `a3f84f2f`, `15ff9bdc`, `8cb52507` | **VALIDATED** |

---

## Revised Priority Assessment (Grounded in Evidence)

### Priority 1: Fill CLAUDE.md (15 min, not 30)
**Evidence:** The file is 71 lines, not over-long. It has empty placeholders, not bloat. Fix: delete placeholders, add 3–4 lines of build commands from `package.json` and 3–4 lines of architecture. This is a **content gap**, not a length problem.

### Priority 2: Investigate Why Hook Was Disabled (5 min research, then decide)
**Evidence:** Commit `f22caa0e` explicitly disabled the hook. Someone had a reason. Before re-enabling, check that commit's diff or message body for the rationale. If it was performance, consider running lint only on changed files. Do NOT blindly re-enable.

### Priority 3: Fix .cursorrules Dead References (5 min)
**Evidence:** 2 of 3 `@` references point to non-existent files. Either create the files or remove the references. Currently misleading to any Cursor agent.

### Priority 4: Delete or Archive 6 Empty/Near-Empty Workflows (10 min)
**Evidence:** `open.md` (0 bytes), `checks.md` (5 lines), `exe.md` (5 lines), `tasks-decomposition.md` (3 lines), `obsorient.md` (5 lines), `ram-watchdog.md` (2 lines). Combined: 15 non-empty lines across 6 files. These are not workflows; they're fragments. The project already has a history of deleting obsolete workflows (commits `15ff9bdc`, `df59378a`).

### Priority 5: Migrate Rules to Modern Format (60 min)
**Evidence:** Confirmed legacy flat file. Modern format exists and is documented. This is a real gap but not urgent — the flat file is actively maintained.

### Priority 6: Create SKILL.md Skills (90 min)
**Evidence:** Zero cross-agent portability. Valid gap, but lower urgency if the team primarily uses Windsurf.

### Priority 7: Add MCP Configuration (30 min)
**Evidence:** Zero MCP config. Valid gap. Lower urgency unless the agent frequently needs to query GitHub, run tests, or search documentation programmatically.

---

## Disqualified Recommendations (From Original Research)

| Original Recommendation | Why Disqualified | Evidence |
|-------------------------|------------------|----------|
| "Rewrite CLAUDE.md to <200 lines" | File is ALREADY <200 lines (71 lines). Problem is missing content, not excessive length. | Line count: 71. Content lines: 46. |
| "Consolidate 54 workflows to ~10" | The team ALREADY tried this (commits `a3f84f2f`, `15ff9bdc`, `8cb52507`). Bloat persists because files are still being added. Consolidation without a gate will fail again. | Git history shows 3+ past cleanup attempts. |
| "Enable postWrite lint hook blindly" | Hook was explicitly disabled in commit `f22caa0e`. Unknown rationale. Blind re-enablement is unsafe. | Git evidence of intentional disablement. |

---

## New Findings Not in Original Research

1. **The team knows about bloat and has tried to fix it multiple times.** Commits `a3f84f2f`, `15ff9bdc`, `8cb52507`, `df59378a` all show cleanup. The problem is recurring, not unrecognized.
2. **Cursor was explicitly abandoned then partially re-adopted.** Commit `088bf8e8`: "delete cursorrules file (not using cursor)". Current `.cursorrules` has a dead reference to `feedback-loop.md` that was never recreated.
3. **`.cursorrules` has 2 dead references out of 3.** This is worse than "empty" — it's actively misleading.
4. **CLAUDE.md has never been updated since initial creation.** Not stale; it was never written beyond beads boilerplate.
5. **The lint command works perfectly (exit code 0).** The codebase is clean. If the hook were enabled, it would pass every time. The only thing preventing deterministic enforcement is a boolean switch.

---

## Confidence Update

| Area | Original Confidence | Post-Experiment Confidence | Change |
|------|---------------------|---------------------------|--------|
| Workflow bloat | High | **Higher** | Confirmed 0-byte files; confirmed past cleanup attempts |
| Hook status | High | **Higher** | Confirmed intentional disablement + working command |
| CLAUDE.md emptiness | High | **Higher** | Confirmed never-updated-since-creation |
| CLAUDE.md length | Medium | **FALSIFIED** | File is short, not long |
| Rules format | High | **Higher** | Confirmed no modern format directory |
| Cross-agent portability | High | **Higher** | Confirmed 0 SKILL.md + dead references |
| MCP absence | High | **Higher** | Confirmed zero config files |
