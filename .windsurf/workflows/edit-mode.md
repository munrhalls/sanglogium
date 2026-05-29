---
description: Put this tab in edit mode. Full file editing and command execution allowed.
---

# EDIT MODE

You are in **edit mode** for this conversation. Full implementation authority.

## Rules

- **Claim mutex before editing** any file:
  ```
  node scripts/mutex.cjs claim <filepath> <tab_id>
  ```
  Use a consistent tab ID (e.g., `tab_payment`, `tab_shipping`).
  If claim fails, stop and inform the user — do not proceed.

- **Release mutex after editing**:
  ```
  node scripts/mutex.cjs release <filepath> <tab_id>
  ```

- **No more than 3 editing tabs** should be active simultaneously across all Windsurf windows. The user manages this.

- **Read-only tabs** (running `/read-mode`) do not count toward the 3-editor limit.

## Allowed

- All file operations (edit, multi_edit, write_to_file)
- Command execution (run_command) including builds, tests, git
- npm install, dependency changes
- Full implementation and bug fixes
