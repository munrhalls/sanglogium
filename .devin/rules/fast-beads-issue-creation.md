# Fast Beads Issue Creation — Hard Constraint

## Rule

Adding a new beads issue is a single append to `.beads/issues.jsonl`. It must finish in under 3 seconds. If it does not, cancel and use the simplest possible manual append.

## Forbidden steps

- Do not read the file first.
- Do not verify line endings, encoding, or ID uniqueness.
- Do not run `bd` CLI, `Get-Content`, or any command to inspect the file.
- Do not build a todo list, plan, or verification step around the append.
- Do not add labels, notes, or extra fields beyond the minimal issue line.

## Allowed minimal line

```
{"_type":"issue","id":"sang-logium-XXX","title":"...","description":"...","status":"open","priority":1,"issue_type":"task","owner":"antarcticdepths71@gmail.com","created_at":"...","created_by":"Munrhalls","updated_at":"...","dependency_count":0,"dependent_count":0,"comment_count":0}
```

## Time bound

If the append is not committed in 1–3 seconds, the operation is invalid and must be aborted.
