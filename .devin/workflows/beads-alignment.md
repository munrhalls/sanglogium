---
description: Align a single beads issue to canonical 3-section structure (Critical Intelligence + Scopes + DoD). Run once per issue.
---

# /beads-alignment

**Purpose:** Take one beads issue from its current messy/legacy state and rewrite it into the canonical 3-section format. This is a **single-issue, read-then-write** operation. No code changes.

**When to use:** During a beads issue alignment phase, when an issue has accumulated historical cruft (embedded source listings, custom section headers, frame tasks mixed into description, verification tables inline, etc.).

---

## Pre-flight

1. Identify the canonical issue for the feature (`bd ready` or `bd list`)
2. Read it fully: `bd show <id>`
3. Check if it already follows the canonical format. If yes → skip.
4. If it has custom sections (`=== HAPPY PATH ===`, `=== EDGE CASES ===`, etc.) or is >3KB of description → proceed.

---

## Step 1 — Read the full issue

```bash
$issue = bd show <id> --json | ConvertFrom-Json
if ($issue -is [Array]) { $issue = $issue[0] }
```

Read both fields completely:
- `description` — the canonical spec (what gets rewritten)
- `notes` — active frame + historical updates (gets compacted, not deleted)

---

## Step 2 — Extract non-canonical content

| Content Type | Current Location | New Home |
|---|---|---|
| Source code file listing ("Source Code IS") | `description` | Remove entirely (agents search codebase) |
| Architecture notes (data flow, state separation) | `description` | `Critical Intelligence` bullet or `docs/<feature>/architecture.md` |
| Frame-decomposition tasks (Task 1, Task 2...) | `description` | `notes` — active frame only |
| Gap analysis tables (class violations, etc.) | `description` | `docs/<feature>/gap-analysis.md` or discard if already fixed |
| Verification cross-check tables | `description` | `notes` — compacted to one-liners |
| Custom section headers (`=== HAPPY PATH ===`) | `description` | Remove; convert to numbered scopes |
| Status prose (`Status: IN PROGRESS`, `Status: LOCKED`) | `description` | Remove; use `status` field + scope ordering rules |
| Inline live check results with evidence | `description` | `notes` as `[x] Live check N: PASS — evidence` |

---

## Step 3 — Rewrite `description` into canonical 3 sections

### Section A — Critical Intelligence (optional, max 5 bullets)

What goes here:
- Key architectural facts an agent MUST know before touching this feature
- Links to canonical specs in `docs/` (visual design, API contract, etc.)
- State separation rules (e.g., "basket in Zustand, NOT iron-session")

What does NOT go here:
- Source code file paths (agents find those)
- Frame tasks or implementation steps
- Historical context or rationale

Example:
```markdown
### Critical Intelligence
- Basket data lives in Zustand store (localStorage), NOT iron-session. iron-session populated only on Checkout via initCheckoutSession().
- Visual design spec: docs/checkout/basket-page/ux-visual-should-be-intelligence.md
```

### Section B — SHOULD BE Scopes (ordered, symptom-only)

Rules:
- Each scope is ONE concrete, symptom-only behavior
- Scope 1 = core happy path. Scope 2+ = extensions / edge cases
- Numbered list: `1. **Scope 1 (Name):** Description`
- Never describe "how to fix" — describe "what it should do"

Right:
> 1. **Scope 1 (Core):** Basket page displays items with quantities, prices, totals. Users update quantities, remove items, and click Checkout to transition basket data to iron-session and navigate to /checkout/address.

Wrong:
> 1. Fix BasketManager.tsx to use design system tokens

### Section C — DoD Items Per Scope (binary pass/fail checklists)

Rules:
- One checklist per scope, labeled clearly
- Each item MUST be objectively verifiable (live check, build pass, manual observation)
- Use `- [ ]` for unchecked, `- [x]` for checked with evidence
- Include `npx tsc --noEmit: zero new errors` as a baseline for every scope

Example:
```markdown
### DoD Items Per Scope

**Scope 1 — Core**
- [ ] Navigate to /basket with items -> page loads with correct items, prices, totals
- [ ] Update quantity -> total recalculates
- [ ] npx tsc --noEmit: zero new errors in basket files

**Scope 2 — Stock**
- [ ] Live check: basket qty 5, CMS stock 3 -> auto-adjusts to 3, strikethrough 5 + 3
- [ ] npx tsc --noEmit: zero new errors
```

---

## Step 4 — Compact `notes`

Current `notes` likely contains multiple frames, implementation updates, and cross-check tables. Keep only:

1. **Active frame** (the scope currently in progress) — if any
2. **Live check results** — one-liner per check with `[x]` or `[ ]` and evidence
3. **Completed scope summaries** — one line: "Scope N: implemented [date], DoD passed"

Remove:
- Completed frame task lists (already in git history / `docs/`)
- Cross-check tables (replaced by DoD items in description)
- Inline source code diffs (in git history)

Example compacted notes:
```markdown
## Frame — 2026-06-03: Visual Design Alignment
Implemented: BasketManager .type-overline, BasketItem two-zone layout, BasketControls stepper, etc.

Verification:
- [x] npx tsc --noEmit: 0 new errors (2026-06-03)
- [ ] Live check: 375px mobile — pending
- [ ] Live check: 1024px+ desktop — pending
```

---

## Step 5 — Write changes (Windows-safe)

**Use PowerShell in-memory modification, NEVER file redirection (`>`):**

```powershell
$issue = bd show <id> --json | ConvertFrom-Json
if ($issue -is [Array]) { $issue = $issue[0] }

$newDesc = "... rewritten description ..."
$newNotes = "... compacted notes ..."

bd update <id> --description $newDesc
bd update <id> --notes $newNotes
```

**Never use:**
- `bd note <id> -- ...` to modify description (`bd note` appends to `notes`, not `description`)
- File redirection (`>`) or temp files — causes UTF-16 BOM encoding failures
- `node -e` or `python -c` scripts — unnecessary; PowerShell pipeline handles JSON natively

---

## Step 6 — Verify

```bash
bd show <id>
```

Confirm:
- [ ] Description has exactly 3 sections (Critical Intelligence, Scopes, DoD)
- [ ] No custom headers (`=== HAPPY PATH ===`, etc.) remain in description
- [ ] No source code listings in description
- [ ] No frame tasks in description
- [ ] No verification tables in description
- [ ] Notes contain only active frame + live checks
- [ ] Scope numbers are bold: `**Scope 1 (Name):**`
- [ ] All DoD items use `- [ ]` or `- [x]`

---

## Anti-Patterns

| Pattern | Why It Breaks |
|---------|---------------|
| Leaving frame tasks in description | Description becomes stale; active work is in notes |
| Keeping source code listings in description | Code drifts; issue becomes misleading |
| Multiple scopes with no DoD items | No acceptance criteria, no way to verify |
| Using `bd note` to rewrite description | Appends to wrong field, corrupts structure |
| Writing non-symptom scopes ("Fix X in file Y") | Pre-diagnosis; agents implement wrong thing |

---

## One-Issue-At-A-Time Rule

This workflow is designed for sequential single-issue alignment:
- Read one issue → Rewrite it → Verify it → Move to next issue
- Never batch-update multiple issues in one command
- Never attempt code changes during alignment (this is spec-only work)
