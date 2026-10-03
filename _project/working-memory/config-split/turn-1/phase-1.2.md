AXIS config-split · TURN 1 (of 2) · AREA: Tailwind config and tsconfig · PHASE 1.2 — tsconfig: include shared/, drop dead test excludes

PREREQUISITE: phase 1.1 done on branch config-split. Stay on that branch.
OWNS (touch only this): tsconfig.json.
NEVER TOUCH: everything else.

GOAL
tsconfig lists every source root (app, features, lib, sanity-cms) in include but not the new shared/ root, and still excludes folders of a retired test stack.

TASKS
1. tsconfig.json include: add "shared/**/*.ts" and "shared/**/*.tsx" directly after "sanity-cms/**/*.ts" (keeps the list alphabetical, before "tailwind.config.ts").
2. tsconfig.json exclude: remove exactly these seven entries and nothing else: "coverage", ".nyc_output", "test-results", "playwright-report", "playwright-report/**/*", "tests", "tests/**/*". Keep node_modules, .next, out, .turbo, .cache, scripts, scripts/**/*, public and every other entry.
3. Check the file is still valid JSON-with-comments as before: commas correct after each removed/added entry.

DONE
- [ ] include contains shared/**/*.ts and shared/**/*.tsx
- [ ] none of the seven removed excludes remains; all other excludes are untouched
- [ ] git diff of tsconfig.json shows only those additions and removals

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
