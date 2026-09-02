# Fast Beads Issue Creation — Hard Constraint

## Rule

Adding a new beads issue is a single append to `.beads/issues.jsonl`. It must finish in under 3 seconds. If it does not, cancel and use the simplest possible manual append.

## Forbidden steps

- Do not read the file first.
- Do not verify line endings, encoding, or ID uniqueness.
- Do not run `bd` CLI, `Get-Content`, or any command to inspect the file.
- Do not build a todo list, plan, or verification step around the append.
- Do not add labels, notes, or extra fields beyond the minimal issue line.

## Title must follow the naming convention

`_project/beads-naming-convention.md` is MANDATORY even on the fast path — it costs no time.
Epic = `EPIC Filters Sorting`. Child of an epic = `[Filters] Price min/max <-> URL`.
Standalone = `Search: clamp out-of-range ?page=`. Never a raw ID or `sang-logium-` in a title.

## The `description` is end-user UX acceptance tests — MANDATORY, not opt-in

The `description` field is NOT a prose problem statement. It is:

- `ACCEPTANCE TESTS` — a list of `When I <interaction>, then <observable outcome>` lines,
  each runnable by a human in a browser on `localhost:3000`. No `file:line`, no tokens, no
  implementation detail. Each line is the human's words verbatim or a direct when/then
  translation of their stated goal — no invented speculation.
- `CURRENT STATUS:` — one plain factual line.

Never paste the human's bug-report paragraph verbatim as the description. Translate first.
This overrides the heavier anatomy in `.devin/workflows/beads-issue-gate.md`.

## Allowed minimal line

```
{"_type":"issue","id":"sang-logium-XXX","title":"[Filters] Price min/max <-> URL","description":"ACCEPTANCE TESTS\n- When I ..., then ...\n\nCURRENT STATUS: not started","status":"open","priority":1,"issue_type":"task","owner":"antarcticdepths71@gmail.com","created_at":"...","created_by":"Munrhalls","updated_at":"...","dependency_count":0,"dependent_count":0,"comment_count":0}
```

## Time bound

If the append is not committed in 1–3 seconds, the operation is invalid and must be aborted.
