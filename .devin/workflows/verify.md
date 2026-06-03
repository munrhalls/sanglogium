---
description: Evidence-based verification workflow - requires actual tool execution before answering
---

# /verify - Evidence-Based Verification Workflow

## Rule
Run tools to collect evidence before answering. No text-based blocking rules - actual tool calls only.

## Execution

### 1. Collect Evidence
Run these tools in parallel:
```bash
read_file <file_path>
grep -r <pattern> <directory>
bash <command>
```

### 2. Verify Dependencies
For each claim, show:
- File path and line number
- Command output
- Actual data returned

### 3. Answer
Format:
```markdown
**Claim:** [statement]

**Evidence:**
- File: <path> line <n> shows <content>
- Command: <cmd> returned <output>
- Data: <query> returned <result>
```

## Binary Success Criteria
- Tool calls executed: YES/NO
- Evidence shown: YES/NO
- Each claim cites evidence: YES/NO

If any answer is NO, workflow fails.
