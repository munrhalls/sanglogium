AXIS org-docs-prune | TURN 1 of 1 | TASK AREA: docs consolidation (audit H3, L5) | PHASE 1.2 of 4 — generic diagrams, code samples, unreferenced binaries

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1 (docs/** except the five living docs).

GOAL
docs/ holds only documentation about this system: no textbook diagrams, no .ts/.tsx files, no images nothing references.

TASKS (in order)
1. docs/diagrams/ (git ls-files docs/diagrams). For each tracked file run: git grep -c -E "features/|app/|lib/|sanity|Stripe|checkout|basket|catalogue|homepage|Sang|sang-logium" -- <file>. A file with count 0 is generic: git rm it. Expected generic (confirm by reading the head of each before deleting): diagram-broken-windows-theory, diagram-cap-theorem-tradeoffs, diagram-red-green-refactor-cycle, diagram-tracer-bullets-prototypes, diagram-finding-seams-legacy, diagram-function-structure-pyramid. Keep every file with a non-zero count. Do not touch an untracked docs/diagrams/system-design-north-star.md (not in your worktree).
2. Code samples become Markdown:
   a. git mv docs/examples/gold-standard.tsx docs/examples/gold-standard.md. Edit it: add an H1 "Gold-standard component (reference)" and one line saying it is a documentation sample, then wrap the original file content in a fenced block (tsx). If the content contains three backticks use a ~~~ fence. Change nothing inside the sample.
   b. Same for docs/performance/performance-test-template.ts -> docs/performance/performance-test-template.md (ts fence, H1 "Performance test template (reference)").
   c. git grep -n "gold-standard.tsx\|performance-test-template.ts" -- docs and repoint every hit to the .md name (docs/README.md excepted; rewritten in 1.3).
   Do NOT edit eslint.config.mjs (its docs/examples/** ignore is pruned by axis org-closeout).
3. Unreferenced images. List: git ls-files docs | grep -E "\.(png|webp|jpe?g|gif|svg)$". For each basename run git grep -l "<basename>" and ignore hits in docs/README.md. If nothing else references it, git rm it. Keep every image referenced by any other tracked file (including the living docs and the docs/post-homepage-product-discovery README). Record the deleted list; it goes in the PR body.

DONE CRITERIA
- [ ] every deleted diagram has zero repo-specific tokens; the six expected ones are gone or a different, justified set is listed in the PR
- [ ] git ls-files docs | grep -E "\.(ts|tsx)$" prints nothing
- [ ] docs/examples/gold-standard.md and docs/performance/performance-test-template.md exist and wrap the original content unchanged
- [ ] git grep -n "gold-standard.tsx\|performance-test-template.ts" -- docs shows hits only in docs/README.md
- [ ] no image under docs/ is unreferenced (excluding docs/README.md mentions)
- [ ] none of the five living docs shows in git status

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (a throwaway node script in your OS temp dir is allowed; never commit it). The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move/rename with git mv only; fix every inbound link in the same phase.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
