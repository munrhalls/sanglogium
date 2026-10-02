AXIS org-docs-prune | TURN 1 of 1 | TASK AREA: docs consolidation (audit H3, M4 docs part) | PHASE 1.3 of 4 — retired-practice docs, honesty banners, docs index

Prerequisite: phases 1.1 and 1.2 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
Docs for retired practices are gone; every remaining doc that may name outdated paths carries the repo's "Point-in-time document" banner; docs/README.md matches the real tree and has no dead link.

TASKS (in order)
1. Banner text: copy the exact banner line from docs/auth/2026-07-11-account-auth-verification-and-gap-analysis.md (line 2, starts "> **Point-in-time document.**"). Use it verbatim everywhere below.
2. docs/testing/*.md: the unit/integration/e2e suites these guides describe were retired on 2026-10-02, and a doc that teaches a retired practice is noise (git history is the archive). Keep a file ONLY if it names the surviving live-CMS proof scripts (words "proofs/", "filters-proofs" or "live-CMS proof"); git rm every other file in that folder. For each kept file make sure it carries the banner (right after the H1) and add one line directly under it: "> The unit/integration/e2e suites were retired on 2026-10-02; only the live-CMS proof scripts in scripts/filters-proofs remain (see CLAUDE.md, Tests)." If the folder ends up empty it disappears. List kept and deleted files in the PR body.
3. Dead-path banners. Write a throwaway node script in your OS temp dir (never in the repo, never committed). For every tracked docs/**/*.md EXCEPT the five living docs, docs/README.md and files that are empty or already contain "Point-in-time document": read the text, collect backtick-quoted tokens that start with app/ features/ lib/ sanity-cms/ scripts/ tools/ docs/ data/ public/ _project/ tests/ (strip trailing punctuation and :line suffixes), and test each against git ls-files (exact file, or a directory prefix). Print the docs that have at least one dead token. For each printed doc insert the banner after its first H1 (top of file if none). Do not banner docs whose tokens all resolve. Paste the printed list into the PR body.
4. Rewrite docs/README.md:
   - Keep the Living section and its five entries.
   - "By folder" must list exactly the folders that now exist. Remove user-account/ (merged into auth/), the "devin task briefs" mention under auth/, footer/ if its images were deleted, and fix examples/ to say "documentation samples (Markdown)".
   - testing/ line: if the folder still exists say only what its remaining files cover; if it was emptied remove the line. Either way delete the references to tests/TestsNamingConvention.md and tests/TestsContractConvention.md (those files do not exist).
   - Keep the sentence that process docs and closed campaign records live in _project/, not here.
5. Link integrity. Extend the throwaway script to check every relative markdown link ( ](./x) or ](../x) ) in docs/**/*.md. Fix or remove every link whose target was deleted or renamed by this axis (compare with git diff --name-status origin/main). Links that were already broken before this axis and point at untouched files: list them in the PR body, do not fix.

DONE CRITERIA
- [ ] docs/testing holds only files that name the surviving proof scripts, each with banner plus the retired-suites line (or the folder is gone)
- [ ] the script lists zero docs with a dead path and no banner (excluding living docs and docs/README.md)
- [ ] every relative link in docs/README.md resolves to an existing file
- [ ] docs/README.md has no mention of user-account/, devin task briefs, or tests/Tests*Convention.md
- [ ] no link broken by this axis remains (script output pasted in PR body)
- [ ] none of the five living docs shows in git status; no script file is staged

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (the throwaway node script above is the only allowed script; never commit it). The owner verifies in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
