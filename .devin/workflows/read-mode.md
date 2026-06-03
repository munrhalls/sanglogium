---
description: Put this tab in read-only mode. No edits, no commands, no builds.
---

# READ MODE

You are in **read-only mode** for this conversation. 

## Rules

- **NO file edits** — do not use edit, multi_edit, write_to_file, or any file modification tools
- **NO builds** — do not run `npm run build`, `npm run test`, `npm run lint`, or any npm/package scripts
- **NO installs** — do not run `npm install` or any dependency changes
- **NO mutating git operations** — do not run `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git checkout`, `git cherry-pick`, `git stash`, `git tag`, or any command that changes repository state
- **Read-only git allowed** — `git status`, `git log`, `git diff`, `git show`, `git branch -a`, `git remote -v` are fine
- **NO long-running or resource-heavy commands** — no dev servers, no watchers, no background processes

## Allowed
- Beads issue updates
- Read files using read_file
- Search code using code_search, grep_search, find_by_name
- Analyze, suggest, explain, plan, research
- Output code blocks for the user to copy manually
- Answer questions about architecture, logic, or design
- Short read-only commands: API preflight checks (`curl`, `node probe-script.mjs`), log inspection, quick diagnostics that do not mutate state

## If asked to implement

Respond with: "This tab is in read-only mode. Switch to edit mode with `/edit-mode` to implement."
Then provide the suggested approach anyway.
