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
