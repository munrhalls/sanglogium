---
name: subject-recipe
description: Run the full 8-step "filters-style" workflow for a new subject: bus-stop source trace, tech-stack architecture doc, professional execution expectations, what-is vs what-should-be audit with prioritized UX-linked gaps, one beads issue per gap + master epic, and a master execution prompt. Invoke with the subject as argument, e.g. /subject-recipe checkout. Use when the user asks to replicate the catalogue-filters pipeline for another feature or system.
---

# /subject-recipe <subject>

Execute the recipe in `docs/replicable-step-recipe.md` for the subject given in the argument.

1. **Parse the subject** from the argument (e.g. `/subject-recipe checkout` → subject = "checkout").
2. **Run Steps 1–8 in order, one at a time, verifying each:**
   - **Step 1 — Trace:** bus-stop-by-bus-stop source trace of the subject's code path, read-only, every claim verified to a file:line.
   - **Step 2 — Architecture:** save `docs/<subject>-technical-architecture.md` (stack + system, relations R1…Rn, prioritized, compared).
   - **Step 3 — Expectations:** save `docs/<subject>-professional-execution-expectations.md` (authoritative E1…En from framework docs pinned to installed versions + the repo's own requirement matrix).
   - **Step 4 — Audit:** save `docs/<subject>-professional-audit-gaps.md` — what-is vs what-should-be, gaps G1…Gn prioritized by user impact, each tied to a real UX problem with verified evidence.
   - **Step 5 — Beads issues:** `bd create` one issue per gap + one master epic. NO `--deps/--parent/--waits-for`. Each description template: `PRIORITY:` line, `STACK:`, `ROOT CAUSE (verified): file:line`, `SCOPE (touch only):`, `FIX:`, `DoD:`, `GUARDRAILS:`; every issue text-references the master ID; set `--priority` and `--type`.
   - **Step 6 — Re-verify** on repeat requests (check the board first; never duplicate).
   - **Step 7 — Execution prompt:** save `docs/<subject>-master-execution-prompt.md` (Mission · Ground rules · ordered issue list · per-issue protocol · stop conditions · definition of done).
   - **Step 8 — Easy copy:** confirm the `.md` and place a plain-text copy at the repo root.
3. **Non-negotiables (every step):** verify claims against source, never docs-only; no beads issue links; no architecture redesign; targeted tests only (no full suites); follow `AGENTS.md` resource discipline (shared server/browser, build lock, never kill Wispr Flow); do NOT commit, push, or `bd dolt push` unless explicitly asked.
4. **Report at the end:** artifacts saved, beads issue IDs (master + gaps), and the prompt file path. Stop when done — no scope creep.
