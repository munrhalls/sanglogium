# Replicable Step Recipe — Subject Audit → Issues → Execution Prompt

*2026-08-19. Archaeology of the catalogue-filters workflow (steps 1–10 of the conversation).
Use this recipe to replicate the same process for any other subject (e.g. "checkout", "basket",
"search"). Each step's ask is quoted from the original conversation; generalize by replacing
"filters / products grid" with the new subject.*

---

## The recipe (run in order, one step at a time)

### Step 1 — Bus-stop trace (read-only)
**Ask:** "trace the code busstop by busstop … make sure each point is 100% accurate. Pure read-only."
**Do:** Trace the subject's full code path file-by-file, end-to-end, verifying every claim to a
file:line. No edits. Deliver the trace in chat (no file yet).

### Step 2 — Tech stack & system architecture (SAVE)
**Ask:** "understand tech stack and underlying system … trace, relation by relation, prioritize,
compare, assemble true and rich, precise picture … save your understanding."
**Do:** Map the platform (Next.js 15 + React 19 + nuqs + Sanity/etc.) and the system the subject
runs on; enumerate relations (R1…Rn); prioritize + compare. **Save** to
`docs/<subject>-technical-architecture.md`.

### Step 3 — Professional execution expectations (SAVE)
**Ask:** "gather intel on technical proper professional execution of <subject> in the relevant
tech stack/system context … assemble list of key expectations …"
**Do:** Fetch authoritative guidance (framework docs pinned to installed versions + repo's own
requirement matrix). Assemble expectations E1…En. **Save** to
`docs/<subject>-professional-execution-expectations.md`.

### Step 4 — Professional audit: what is vs what should be (SAVE)
**Ask:** "perform professional audit of what is (source trace) vs what should be (expectations) …
assemble gaps list, prioritize in impact order, connect each gap to real user experience problem."
**Do:** Compare verified source against expectations; produce gap list G1…Gn, priority by user
impact, each gap tied to a concrete UX problem with verified file:line evidence. **Save** to
`docs/<subject>-professional-audit-gaps.md`.

### Step 5 — File beads issues (master + per-gap)
**Ask:** "add beads issue per gap; connect them all to one master beads issue about <subject> as a
whole; don't link issues to each other; each issue priority graded in its description, with
system-fit, tech-stack, system-context and checks so the executing agent has minimal
drift/hallucination/system-misfit risk; keep simplest, leanest."
**Do:** `bd create` one issue per gap + one master (epic). **No** `--deps/--parent/--waits-for`.
Each description template: `PRIORITY:` line · `STACK:` · `ROOT CAUSE (verified): file:line` ·
`SCOPE (touch only):` · `FIX:` · `DoD:` (targeted test/manual check) · `GUARDRAILS:`. Every issue
text-references the master ID. Set `--priority` field + `--type` (bug/task/chore/decision/spike).

### Step 6 — Re-verify on repeat
If the same request arrives again, check the board first; confirm completeness, don't duplicate.

### Step 7 — Master execution prompt (SAVE)
**Ask:** "prepare master well engineered prompt for an agent to execute each issue one by one in
priority importance order … simple, well engineered … issue by issue one at a time."
**Do:** One copy-paste prompt: Mission · Ground rules · explicit ordered issue list (P1→P2→P3) ·
per-issue protocol (show→claim→implement in SCOPE→verify DoD→note→close→next) · stop conditions ·
definition of done. **Save** to `docs/<subject>-master-execution-prompt.md`.

### Step 8 — Easy copy artifact
**Ask:** "save it to MD file so I can copy it very easily."
**Do:** confirm the `.md`; also place a plain-text copy at repo root: `<subject>-master-execution-prompt.txt`.

---

## Non-negotiable invariants (carry into every subject)

- Every artifact is **verified against source** (file:line), never docs-only.
- Filters-style guardrails in every beads issue: no re-derivation, pinned SCOPE, targeted tests
  only, no architecture redesign, no issue links.
- Follow `AGENTS.md` resource discipline (shared server/browser, build lock, no parallel heavy
  tools, never kill Wispr Flow).
- Do not commit / `bd dolt push` unless explicitly asked.
