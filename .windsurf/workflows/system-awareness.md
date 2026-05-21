---
description: Check or update system-level awareness for a theme
---

# /system-awareness [THEME]

**Input:** Theme name (e.g., "basket", "checkout", "shipping")
**Output:** Current system awareness state for theme, or update if needed

---

## Usage

**Check awareness:**
```bash
/system-awareness basket
```

**Update awareness (after structural change):**
```bash
/system-awareness basket --update
```

---

## What This Checks

1. **Theme labels:** `bd label list-all | grep theme:<theme>`
2. **Awareness state:** `bd state <issue-id> awareness`
3. **Related issues:** `bd query "labels:theme:<theme>"`

---

## When to Use

- Manual check of system awareness for a theme
- Verify awareness state before starting work
- Update awareness after structural changes (if automatic update failed)
- Audit awareness tracking

---

## Automation Note

This workflow is a MANUAL fallback. System awareness should be automatically checked/updated:
- On issue creation (via rules.md)
- On issue claim (via rules.md)
- On issue close (via rules.md)

Use this workflow only if automatic tracking fails or for manual verification.
