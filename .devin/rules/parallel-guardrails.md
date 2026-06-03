---
trigger: always_on
---

# Parallel Execution Guardrails (CRITICAL)

You are operating in a parallel multi-agent environment. To prevent file corruption
and resource starvation, you MUST adhere to these rules on every task:

1. **Claim before editing:** Before modifying ANY file, run:
   `node scripts/mutex.cjs claim <filepath> <your_pane_or_session_id>` 
   Use a consistent ID for your session (e.g. `cascade_pane_1`).

2. **Respect lock rejections:** If the command exits with code 1 (prints `[ERROR]`),
   you MUST stop and NOT edit that file. Wait or choose a different task.

3. **Release after editing:** After finishing edits to a file, immediately run:
   `node scripts/mutex.cjs release <filepath> <your_pane_or_session_id>` 

4. **Semaphore limit:** No more than 2 Cascade dev agents may run simultaneously.

5. **No heavy concurrent processes:** Never run a dev agent alongside a build or test suite.

---

## Beads Issue Update Protocol (Windows — CRITICAL)

When updating ANY field (description, notes, status, etc.) in a beads issue, you MUST follow this exact sequence. This prevents the wrong-field-write error and the Windows encoding panic loop.

### The 5-Step Protocol

```powershell
# Step 1: READ the issue first to identify which field contains the target text
bd show <id>

# Step 2: FETCH via native PowerShell pipeline ONLY
# NEVER use file redirection (>) or temp files — Windows defaults to UTF-16 BOM
$issue = bd show <id> --json | ConvertFrom-Json
if ($issue -is [Array]) { $issue = $issue[0] }

# Step 3: MODIFY in-memory using .Replace() (literal string, not regex)
$newValue = $issue.<field>.Replace("exact anchor text", "replacement text")

# Step 4: UPDATE via bd CLI, passing the variable directly
bd update <id> --<field> $newValue

# Step 5: VERIFY the change landed in the right place
bd show <id> | Select-Object -Skip <N> -First <M>
```

### NEVER

- Use `bd note` to modify `description` content — `bd note` appends to the `notes` field, not inline in `description`
- Use file redirection (`>`) or temp files — causes UTF-16 BOM encoding failures when read by Node.js/Python
- Use `node -e`, `python -c`, or any external script — unnecessary; PowerShell pipeline handles JSON natively
- Use `-replace` (regex) when `.Replace()` (literal string) suffices — brackets and special chars break regex unexpectedly

### WHY

The previous failure mode: agent used `bd note` to add a live check, but the list lived in `description`. Then agent panicked and tried 15+ convoluted file-based workarounds instead of the native PowerShell pipeline that was already available. This rule makes the correct path the only path.
