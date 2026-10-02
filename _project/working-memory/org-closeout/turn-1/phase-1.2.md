AXIS org-closeout | TURN 1 of 1 | TASK AREA: enforce the data-layer boundary mechanically (audit H1 enforcement, M4 stale lint text) | PHASE 1.2 of 5 — ESLint

Prerequisite: phase 1.1 done (gate passed). Same OWNS / OFF-LIMITS as phase 1.1.

STANDARD APPLIED: a boundary that is only written down erodes. GROQ lives only in sanity-cms/lib (and scripts/ for Node scripts); the lint config says so and gives the fix. The old rule "only features/*/actions.ts may import sanity-cms" is replaced by "actions.ts and adapters/** may" (axis org-checkout-thin-routes already added the adapters block; this phase aligns the message).

GOAL
eslint.config.mjs forbids GROQ outside the data layer and no longer cites retired tests or dead ignore paths.

TASKS (in order)
1. Precondition. git grep -n -E "_type[[:space:]]*==" -- app lib features must print nothing (the proof scripts moved out of features in axis org-data-scripts). If it prints anything, STOP and report the files.
2. Add a new config block in eslint.config.mjs, before the eslintConfigPrettier entry: files ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"]; rule "no-restricted-syntax": ["error", { selector: "TemplateElement[value.raw=/_type\\s*==/]", message: M }, { selector: "Literal[value=/_type\\s*==/]", message: M }] where M is: "GROQ queries live only in sanity-cms/lib (and scripts/ for Node scripts). Add a named fetcher there and call it." (inside the JS string the regex backslash is doubled as shown). no-restricted-syntax is a different rule from no-restricted-imports, so the existing "a later block replaces the rule" behaviour does not apply to it. sanity-cms/** and scripts/** are not in files, so they stay free.
3. Update the NO_SANITY message constant: it must say that features must not import sanity-cms from ui/, domain/, config/ or index.ts, and that only features/<feature>/actions.ts and features/<feature>/adapters/** may.
4. JEST_PATHS: all three entries end with "See tests/AGENTS.md Testing Rules." (a file that does not exist) and tell people to use Vitest (not installed). Replace each message with: "Jest is not used in this repo; the test suites were retired on 2026-10-02 (see CLAUDE.md, Tests)."
5. Ignores: remove "docs/examples/**" from the ignores block if git ls-files docs/examples lists no .ts/.tsx file (axis org-docs-prune converted the sample to Markdown); remove "_archive/**" if git ls-files _archive prints nothing. Keep ".next/**", "dist/**", "node_modules/**".
6. Do not edit any other block and do not touch rule severities elsewhere. Read the whole file once at the end and check by eye that brackets and commas are balanced.

DONE CRITERIA
- [ ] the precondition grep printed nothing before the edit
- [ ] the new block exists with both selectors, severity "error", and the files list above
- [ ] NO_SANITY message mentions adapters/**; no message in the file still contains "tests/AGENTS.md" or "Vitest"
- [ ] the two stale ignores are gone only if their precondition held
- [ ] the file is syntactically balanced by eye; no other block changed (git diff shows only the edits above)

OWNER LIVE CHECK (for the PR body; the owner's call, one command)
- Run eslint once on the files that used to contain GROQ: app/sitemap.ts, lib/auth/server.ts, lib/auth/dal.ts, app/checkout/payment/page.tsx, app/api/checkout/payment-intent-session/route.ts. Expect zero errors. To see the rule fire, temporarily paste a query string containing _type == into any app file and lint it.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command (you cannot validate the selector syntax by running ESLint: write it exactly as given). The owner verifies in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
