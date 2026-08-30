# Beads Issue Naming Convention (sang-logium)

**Status: MANDATORY.** Every agent that runs `bd create` or edits an issue title MUST
follow this. A non-conforming title is a defect — fix it with `bd update <id> --title "..."`.

## The problem this solves

The beads **ID** (`sang-logium-agq`, `sang-logium-dqf`, …) is a random handle. It is not
human-readable and never will be — do not try to rename IDs. The **title** is the human
surface. If the title is also vague, the issue is unreferenceable. So the title carries all
the readability.

## Rules

### 1. Epic titles

```
EPIC <Two-to-four Title-Case words naming the feature area>
```

- `EPIC Filters Sorting`
- `EPIC Checkout Shipping`
- `EPIC Search Relevance`

No ID strings, no file paths, no verbs. Just the area, prefixed with the literal word `EPIC`.

### 2. Child issue titles (belongs to an epic)

```
[<EpicKeyword>] <specific slice, outcome-focused>
```

- `[Filters] Price min/max <-> URL`
- `[Filters] Clear-all resets facets and page`
- `[Sorting] Persist sort key across pagination`
- `[Checkout] Shipping cost recalculates on address change`

The `[Bracket]` tag is the first word of the epic area. It makes children greppable
(`bd list | grep '\[Filters\]'`) and tells a human which epic they belong to **without
needing the epic's ID**. Still link the real parent/dependency in beads.

### 3. Standalone issue titles (no epic)

```
<Area>: <specific slice, outcome-focused>
```

- `Search: clamp out-of-range ?page= instead of "No products found"`
- `Homepage: DAC card image aspect-ratio jumps on load`

### 4. Universal rules

- Title Case for the `EPIC` word, the `[Tag]`, and the `Area:` prefix. Sentence case for
  the rest.
- Describe the **outcome or behavior**, not the file you'll touch. (`file:line` pointers
  belong in the issue body, per the gate.)
- Target ≤ 60 characters. Hard ceiling 80.
- ASCII arrows are fine and encouraged: `->`, `<->`, `=>`.
- **Never** put `sang-logium-`, a raw ID, or a hash in a title.
- No trailing punctuation, no "(WIP)", no priority markers — those are beads fields.

## How to reference an issue (chat, commits, docs, NOTES)

Always **ID + title together**, ID in backticks:

> `sang-logium-agq` — EPIC Filters Sorting
> `sang-logium-dqf` — [Filters] Price min/max <-> URL

Never the bare ID alone. Never the title alone. The pair is the contract.

## Enforcement surfaces (keep these in sync with this file)

- `CLAUDE.md` → "## Beads issue naming" (hard rule + pointer here)
- `AGENTS.md` → "## Issue tracker = beads" section
- `.clinerules` → "## Issue tracker = beads (`bd` CLI)" section
- `.devin/workflows/beads-issue-gate.md` → gate check #1 (Title anatomy)
- `.devin/rules/fast-beads-issue-creation.md` → the allowed minimal line
- `.cline/skills/implement-beads-issue/SKILL.md` → reference format
- memory `feedback-beads-issue-lean-protocol`
