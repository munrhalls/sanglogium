# Devin Setup Awareness Report — sang-logium

## 1. Scope & Method

This report covers every Devin-related artifact found in the repo and the active global conventions referenced by it. Every file was listed, and the key files were read directly.

Files scanned:
- `CLAUDE.md`, `AGENTS.md`, `tests/TestsContractConvention.md`, `tests/TestsNamingConvention.md`
- `.devin/hooks.json`, `.devin/rules/no-parallel-fallbacks.md`, `.devin/skills/objective-realization/SKILL.md`
- `.devin/memories/*.md` (3 files)
- `.devin/research/*.md` (18 files)
- `.devin/workflows/*.md` (85 files — all summarized)
- `.devin/report.md`
- `.beads/config.yaml`, `.beads/README.md`, `.beads/metadata.json`, `.beads/interactions.jsonl`
- `.claude/settings.local.json`
- `_project/orchestration-plan.md`, `_project/devin-cloud-optimization-plan.md`, `_project/vibe-coding-field-manual.md`
- `orchestration-diagrams/diagrams.md`, `research/devin-cloud-workflow-position.md`, `CLEANUP-TABLE.md`
- `.github/workflows/`, `.windsurf/workflows/`

---

## 2. Top-Level Directives

| File | What it governs |
|------|-----------------|
| `CLAUDE.md` | Hard limits: no `$(...)` or backticks in shell, no expensive commands (`npm run build`, `tsc`, test suites, lint, Lighthouse) unless unavoidable, **one command at a time, no parallel fallbacks**. Also states the AI pipeline: Claude plans, Devin executes. |
| `.devin/rules/no-parallel-fallbacks.md` | Same rule formalized in `.devin/rules`. |
| `tests/AGENTS.md` | Test conventions: contract-based naming, AAA pattern, test-first (RED -> GREEN), context-aware integration tests, layer trust, Zustand reset in `beforeEach`. |
| `tests/TestsContractConvention.md` | `describe('Contract Name')` -> `describe('operationName')` -> `it('action description in present tense')`. |
| `tests/TestsNamingConvention.md` | `describe('System Name')` -> `describe('when ...')` -> `it('action description in present tense')`. |

---

## 3. The `.devin/` Directory

| Path | Type | Count / State |
|------|------|---------------|
| `.devin/hooks.json` | Config | 1 `postWrite` hook for `npm run lint`, currently `enabled: false` |
| `.devin/report.md` | Report | 28,822 bytes — a single production basket-desync debugging session |
| `.devin/rules/` | Rules | 1 file: `no-parallel-fallbacks.md` |
| `.devin/skills/` | Skills | 1 folder: `objective-realization/SKILL.md` |
| `.devin/memories/` | Memories | 3 files |
| `.devin/research/` | Research | 18 files |
| `.devin/workflows/` | Workflows | 85 `.md` files |

### 3.1 `.devin/hooks.json`
```json
{
  "postWrite": {
    "enabled": false,
    "command": "npm run lint",
    "shell": "powershell",
    "description": "Automatically run linter on every file write..."
  }
}
```

### 3.2 `.devin/rules/no-parallel-fallbacks.md`
- Run **one command at a time**, wait, then decide next step.
- Verify tool availability first (`which`, `Get-Command`, `--version`, `--help`).
- No parallel fallbacks.

### 3.3 `.devin/skills/objective-realization/SKILL.md`
- Trigger: `/objective-realization`
- 7 phases: gather intelligence -> gap scan -> decompose -> pre-requirements -> build plan -> friction scan -> one-paragraph summary.
- Outputs **one-paragraph summary only** by default.
- Does **not** write code or create files.
- Its friction scan (Phase 6) previously referenced `sang-logium-direct-access` and `.devin/locks.json`; those references were removed in the cleanup pass and now point to `CLAUDE.md` hard limits.

### 3.4 `.devin/memories` (3 files)
| File | Core content |
|------|--------------|
| `architecture.md` | Architectural invariants: VFS catalogue, Tailwind-only styling, FSM order lifecycle, Sanity type safety, image optimization, Next.js 15 App Router, 4-layer checkout, address/shipping, drawers, testing, spec-first workflow. |
| `compound-development-lessons.md` | End-to-end trace is the only worthwhile method; simplest-first testing; distinguish "time worth" from "time waste". |
| `ide-ram-leak-lesson.md` | Windsurf `language_server_windows_x64` RAM leak fix: `.codeiumignore` is independent of `.gitignore`; the real culprit is a heavy directory not excluded. |

### 3.5 `.devin/research` (18 files)
| File | Topic |
|------|-------|
| `TEST_FIRST_PRINCIPLES.md` | Red-Green-Refactor + AAA, write tests before implementation, tests must fail first. |
| `TEST_INTEGRATION_CONTEXT_AWARENESS.md` | Test each rendering context separately. |
| `TEST_INTEGRATION_GOOD_EXAMPLE.md` | Good `BasketButton` integration test example. |
| `TEST_LAYER_TRUST.md` | Integration tests trust unit tests, never re-test them. |
| `TEST_LOCATION_CONVENTION.md` | Tests co-located with docs: `docs/<feature>/__tests__/<unit|integration|e2e>/`. |
| `TEST_SEPARATION_GUIDE.md` | Unit vs integration test decision tree. |
| `TestsNamingConvention.md` | `describe` and `it` block naming. |
| `aaa-pattern-research.md` | AAA as guideline, strict single-assert for unit, flexible for integration. |
| `basket-feature-research.md` | Basket architecture: Zustand, localStorage, CMS sync, hydration guard, boundary enforcement. |
| `basket-feature-wholeness-understanding.md` | Verified complete basket architecture. |
| `contract-design-best-practices.md` | SRP/ISP, explicit errors, pre/post/invariants, test cases in contracts. |
| `gemini-3-pro-audit-analysis.md` | External audit of basket v2/v3/v4; v3 recommended as baseline. |
| `nextjs-zustand-async-state-management.md` | Async state in Zustand stores, view layer only triggers. |
| `simple-prd-contracts.md` | Design-by-Contract for PRDs, preconditions/postconditions/invariants. |
| `stripe-cms-price-data-format.md` | `{ currency, unit_amount }` format for Stripe PaymentIntent. |
| `structureTool-import-error-root-cause.md` | Local `sanity/` directory shadowed npm `sanity` package. |
| `windows-language-server-monitoring-practical.md` | Practical Windows LSP memory monitoring. |
| `windows-lsp-monitoring-working-plan.md` | PowerShell trend analysis + manual ProcMon. |

### 3.6 `.devin/report.md`
- A single 468-line document capturing a production basket desync debugging session.
- Drives the four-category prod-vs-dev mismatch checklist: caching, session, hydration, env vars.
- Concluded frontend hydration mismatch was the bottleneck and gives minimal PowerShell verification steps.

---

## 4. `.devin/workflows/` — 83 Workflows

All 83 files were scanned. Below is the compact catalogue, grouped by purpose. Empty files are noted.

### 4.1 Audit / Analysis
| Workflow | Description / First Heading |
|----------|------------------------------|
| `audit.md` | Feature audit with end-state, spatial architecture, gap analysis |
| `commits-diagnostics.md` | Git velocity diagnostics — real vs illusory velocity, bottlenecks |
| `git-commits-objective-assessment.md` | Objective, numbers-based commit assessment |
| `git-diff.md` | Assemble complete code-changes list |
| `system-and-root-cause-analyzer.md` | Compare spec, source, logs; identify root-cause discrepancy |
| `system-awareness.md` | Check/update system-level awareness for a theme |

### 4.2 Planning / Decomposition
| Workflow | Description / First Heading |
|----------|------------------------------|
| `frame-decompose.md` | Break feature/bug into objective + 3-5 tasks + acceptance checks |
| `framed-objective.md` | **DEPRECATED** — use `/frame-decompose` |
| `get-tree.md` | Verified folder/file tree overview for a feature |
| `minimal-viable-solution.md` | Minimal viable solution design doc |
| `operational-rhythm.md` | **Safety net only** — full 6-phase chain for stuck features |
| `planning.md` | Examine, /gaps-scan, alternatives, plan, /gaps-close |
| `prd-template.md` | PRD template |
| `q-and-a.md` | Q & A research & design template |
| `rabbit-hole-check.md` | 3-question pre-flight: simple? clear? verified ground? |
| `sprint.md` | Human-first sprint planning, UX flows first |
| `technical-solution-design.md` | Technical solution design template |
| `todolist.md` | Professional task management |
| `vertical-slice-plan.md` | Vertical slice plan template |

### 4.3 Implementation / Execution
| Workflow | Description / First Heading |
|----------|------------------------------|
| `core-building-pattern.md` | Three Passes & Four Layers (Skeleton -> Data -> Style) |
| `exe.md` | 1 execute, simplest possible; 2 stop if complicating |
| `execution-specs.md` | Capture test specs in pure English |
| `fix-prompt.md` | Generate professional system-first fix prompts |
| `folder-and-files-tree-overview.md` | Minimal folder/files tree |
| `html-structure.md` | HTML structure template |
| `implement.md` | /Implement protocol for SWE 1.5 (beads + lessons + plan + execution) |
| `intel-gather.md` | Research-only, critical-only questions |
| `minimal-legacy-delete-debug-fix.md` | Delete only the legacy causing the error |
| `obsorient.md` | Observe, orient, present 6-sentence plan |
| `rgr-core-building-pattern.md` | RGR with unit -> integration -> e2e sequence |
| `rgr-step.md` | Mechanical RGR orchestrator for one vertical slice |
| `source-code-synopsis.md` | Trace code accurately into a concise `.md` report |
| `solve-problem.md` | 5-step professional problem solving |
| `test.md` | Minimal high-value tests |
| `tests-plan.md` | Minimal tests plan with diagram + file list |
| `ux-task.md` | Strengthen a UX element in system visual harmony |

### 4.4 Verification / QA
| Workflow | Description / First Heading |
|----------|------------------------------|
| `acceptance-tests.md` | Simple manual acceptance tests (happy path) |
| `checks.md` | `simplest possible, 0 gaps, 0 red flags, professionally well-checked` |
| `code-changes-record.md` | Meticulous code-changes record only |
| `context.md` | Selective context injection for test development |
| `gap-close.md` | Close gaps with critical intel + system-alignment |
| `gaps-scan.md` | Scan for gaps/red flags/over-complications |
| `grill-me.md` | Interview user relentlessly about objective |
| `hand.md` | **0 bytes** |
| `position.md` | What's the position, candidate moves, which makes development easiest |
| `question.md` | 3 yes/no clarity checks |
| `read-mode.md` | Read-only mode: no edits, commands, builds |
| `respect-cpu-resources.md` | Never run expensive commands; respect parallel-agent resources |
| `trace.md` | Bus-stop debugging with expected results at each stop |
| `verify.md` | Evidence-based verification before answering |
| `viable-output-cycle.md` | Complete tasks in <60 min via single-output iterations |

### 4.5 Learning / Knowledge
| Workflow | Description / First Heading |
|----------|------------------------------|
| `learn.md` | Extract, transmute, codify learnings |
| `learn-organically-index.md` | Index organic lessons from date folders |
| `lesson-capture.md` | Simplest possible reality-based lesson capture |
| `retrieve-lessons.md` | Pre-work lessons retrieval (falls back to `.devin/memories/`, `.devin/research/`, and `_project/` if `_project/lessons/INDEX.md` is absent) |
| `organic-learn.md` | Save organic learning with exact preservation |

### 4.6 Prompt / UX / Communication Quality
| Workflow | Description / First Heading |
|----------|------------------------------|
| `analyze-prompting-quality.md` | Evaluate prompting quality across a conversation |
| `design-ux-intelligence.md` | Compare subject to up-to-date UX practices, rate 1-10 |
| `effective-prompt.md` | Evaluate prompt quality 1-10 with beads context |
| `evaluate-prompt.md` | Assess prompt quality |
| `feedback-prompt-quality.md` | Evaluate prompt and task choice 1-10 |
| `format-text.md` | `only format the text` |
| `grill-me.md` | See Verification |
| `professional-prompt.md` | Rewrite request into professional prompt, do not execute |
| `simple-clear-concise.md` | Answer simplest/clearest/briefest |
| `ux-visual-should-be-specs-prompt.md` | Generate visual UX specs prompt |
| `ux-visual-should-be-specs-prompt-minimal.md` | Minimal visual UX gap-close prompt |

### 4.7 DevOps / Tooling / One-offs
| Workflow | Description / First Heading |
|----------|------------------------------|
| `commit.md` | Git commit workflow with autonomous execution |
| `devtools-all-styles.md` | Snippet: dump computed style map |
| `diagram.md` | Mermaid diagram standards |
| `ethical-scrape.md` | Ethical product-image scraping |
| `fix-ide-ram.md` | Diagnose/fix Windsurf language server RAM leak |
| `git-init-new-.md` | `git init` + `gh repo create` snippet |
| `major-adr.md` | Major ADR template |
| `open-kanban.md` | Launch beads kanban board (`beads-kanban/server.mjs`) |
| `operational-prime.md` | COVER & MOVE, SIMPLE, PRIORITIZE |
| `operational-prime-lean.md` | Terse, high-speed assistant rules |
| `tasks-decomposition.md` | `De-compose tasks and make tasks graph` |
| `teach-me.md` | Teach user a skill over multiple sessions |

### Empty / placeholder workflows
- `beadboard.md` — 0 bytes
- `hand.md` — 0 bytes
- `open.md` — 0 bytes

---

## 5. `.beads` — Issue Tracker

| File | Content |
|------|---------|
| `.beads/README.md` | AI-native issue tracking, CLI-first, Dolt-native, git-native. |
| `.beads/config.yaml` | All defaults commented out except `sync.remote: git+https://github.com/munrhalls/sanglogium.git`. Notes `no-db: false` but metadata says Dolt embedded is in use. |
| `.beads/metadata.json` | `database: dolt`, `backend: dolt`, `dolt_mode: embedded`, `dolt_database: sang_logium` |
| `.beads/interactions.jsonl` | 3 events, all for `sang-logium-2de` (closed then reopened) |

From the verified system memory:
- Tracker currently holds **15 issues**: 12 open, 3 in_progress.
- Priorities: 3 P0, 5 P1, 6 P2, 1 P3.
- Verification found obsolete notes in 3 of 6 checked issues; one P0 (`sang-logium-4nd` Return page) is completed but still open.
- `sang-logium-w92` (Logging mechanism) describes a Redis-based logger that has been removed; current logger is console-only.
- `sang-logium-mzp` is a cleanup issue for 14 deletion targets missing from live DB.
- `bd` CLI is **not reachable** in this shell (`bd --version` not found). Only `CLAUDE.md` and `.devin/rules/no-parallel-fallbacks.md` currently govern `bd`/CLI usage.

---

## 6. `.claude/settings.local.json`

- `defaultMode: "bypassPermissions"` — permission checks are bypassed.
- Allows: `curl`, `node`, `python`, `WebFetch(domain:www.sanglogium.com)`.
- Denies: `rm -rf *`.

---

## 7. Orchestration & Devin Cloud Configuration

| File | Role |
|------|------|
| `_project/orchestration-plan.md` | Three-role pipeline: Orchestrator (you) -> Claude (planning) -> Devin (execution). 8 tracks (SL, PF, CV, VID, LI, TR, STAR, DSA), dependency graph, handoff protocol, done-signal checklist. |
| `orchestration-diagrams/diagrams.md` | Mermaid diagrams: domino chain, track dependency graph, Gantt timeline, orchestration loop, handoff protocol, workload windows. |
| `_project/devin-cloud-optimization-plan.md` | Corrected DeepWiki/Devin Cloud plan. PR-based Devin Review rejected due to friction. DeepWiki indexing kept. Proposes one bounded Devin Cloud trial to audit/file issues into `bd` tracker. Notes `.github/workflows/` is empty; the `lighthouse-ci.yml`, `playwright.yml`, and `daily-rebuild.yml` files referenced in earlier drafts do not exist. |
| `research/devin-cloud-workflow-position.md` | Cost model for Devin Cloud Pro ($20/mo, quota-based), DeepWiki/Ask Devin free for public repo, Devin Review free on public PRs but rejected. Keeps three-role pipeline unchanged. |
| `_project/vibe-coding-field-manual.md` | Post-mortem of 100 logged prompts: 41% spent on `ProductSpotlight` height-ownership; docs exist but are consulted too late; lesson is "number before edit, doc before guess, computed style before screenshot." |
| `CLEANUP-TABLE.md` | Conservative audit of 37 temporary/ephemeral artifacts awaiting cleanup (root scripts, image normalization dirs, QA screenshots, ignored build folders, etc.). |

---

## 8. Verified Missing Artifacts (Post-Cleanup)

A cleanup pass removed source references to the following non-existent artifacts. No source doc now requires them except this report, which documents the gaps:

| Missing artifact | Former references | Actual state |
|------------------|-------------------|--------------|
| `sang-logium-direct-access` skill | `.devin/skills/objective-realization/SKILL.md`, `_project/devin-cloud-optimization-plan.md`, `_project/reports/*.md`, `research/devin-cloud-workflow-position.md` | **Not present** in `.devin/skills/` or elsewhere in repo; replaced with `CLAUDE.md` hard limits |
| `sang-logium-review` skill | `CLAUDE.md`, `_project/devin-cloud-optimization-plan.md`, `docs/vertical-space-lg-touch.md`, `_project/reports/*.md` | **Not present** in `.devin/skills/` or elsewhere in repo; replaced with generic height/sizing diff review |
| `.devin/workflows/execution-friction-scan.md` | System memory only; never in source files | **Not present** in `.devin/workflows/` (83 files scanned) |
| `.devin/locks.json` | `.devin/skills/objective-realization/SKILL.md` | **Not present**; reference removed |
| `scripts/mutex.cjs` | System memory only; no source file found | **Not present** |
| `scripts/get-trace.mjs` | `.devin/workflows/logging.md` (deleted), `research/LOGGING_PATTERNS_2026.md` | **Not present** |
| `scripts/clear-redis-logs.mjs` | `.devin/workflows/logging.md` (deleted), `research/LOGGING_PATTERNS_2026.md` | **Not present** |
| `scripts/language-server-watchdog.ps1` | `.devin/workflows/ram-watchdog.md` (deleted) | **Not present** |
| `_project/lessons/INDEX.md` | `.devin/workflows/retrieve-lessons.md`, `implement.md`, `sprint.md`, `learn.md`, `_project/vibe-coding-field-manual.md` | **Not present** (`_project/lessons/` does not exist); workflows now fall back to `.devin/memories/`, `.devin/research/`, and `_project/` |
| `_project/devin-task-diagrams.md` | `research/devin-cloud-workflow-position.md` | **Not present**; reference removed |
| `docs/devin-beads-cleanup-tasks.md` | `research/devin-cloud-workflow-position.md`, `docs/beads-verification-report-2026-08-01.md` | **Not present**; references removed |
| `.github/workflows/lighthouse-ci.yml`, `playwright.yml`, `daily-rebuild.yml` | `_project/devin-cloud-optimization-plan.md` | `.github/workflows/` is **empty**; false "already runs" claims removed |

`data/catalogue.ts` exists; it is covered by `.codeiumignore` for file-read tools but is not a missing artifact. `.windsurf/workflows/` is also **empty**.

---

## 9. Key Observations

- **Three-role pipeline is documented:** the orchestration plan, diagrams, Devin cloud cost plan, and `vibe-coding-field-manual` all describe a Claude -> Devin handoff, with only the `/objective-realization` skill present in the local skill store. References to the missing `sang-logium-direct-access` and `sang-logium-review` skills were removed from source docs and replaced with `CLAUDE.md` and generic review language.
- **Friction-scan and file-lock protocols are missing and not referenced in source files:** `execution-friction-scan.md`, `scripts/mutex.cjs`, and `.devin/locks.json` are still absent; only this report and system memory mention them.
- **Beads tracker is active but not lean:** 15 issues with stale notes, done-but-open P0, a cleanup issue, and a heavy Dolt embedded backend. The CLI is not available in this session.
- **`.github/workflows/` is empty**; the prior false claims about `lighthouse-ci.yml`, `playwright.yml`, and `daily-rebuild.yml` were removed from `_project/devin-cloud-optimization-plan.md`.
- **`.devin/workflows/` is large (83 files)** and partly duplicated with Cowork/skills; `vibe-coding-field-manual.md` explicitly notes that `rabbit-hole-check.md` and `retrieve-lessons.md` exist but are not being consulted at the right time. The `_project/lessons/INDEX.md` target does not exist, but the relevant workflows now fall back to `.devin/memories/`, `.devin/research/`, and `_project/`.

---

## 10. One-Paragraph Summary

The sang-logium Devin setup is a heavily documented, workflow-driven system: a 4-layer architecture, 83 `.devin/workflows`, 18 research artifacts, 3 memory files, a Beads issue tracker, and explicit rules about CPU respect, no parallel fallbacks, and test-first discipline. A cleanup pass removed source references to non-existent skills, workflows, scripts, and documents (`sang-logium-direct-access`, `sang-logium-review`, `execution-friction-scan.md`, `scripts/mutex.cjs`, `.devin/locks.json`, `_project/lessons/INDEX.md`, `_project/devin-task-diagrams.md`, `docs/devin-beads-cleanup-tasks.md`, the GitHub Actions workflow files, and the logging/ram-watchdog scripts). The missing artifacts remain absent, but source docs no longer depend on them. The `_project/lessons/` index is now a conditional fallback, not a hard requirement, and `_project/devin-cloud-optimization-plan.md` no longer claims CI workflows exist. The Beads tracker has 15 issues with stale/done-but-open entries, and the `bd` CLI is not currently installed in this shell. Overall, the *framework* is thorough; the *live infrastructure* still has gaps, but the codebase no longer contains stale references to them.
