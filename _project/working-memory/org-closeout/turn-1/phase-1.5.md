AXIS org-closeout | TURN 1 of 1 | TASK AREA: enforce the boundary, align the written standard | PHASE 1.5 of 5 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 to 1.4 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-closeout/ exists in your worktree, delete it (rm -r). It must never be staged or committed. Make sure no scratch script or rename-map file is inside the repo.
2. git status: only files under phase 1.1's OWNS list may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Enforce the GROQ boundary in ESLint and align CLAUDE.md, AGENTS.md and living docs with the code (audit H1, M3, M4, M7, L1 to L3, L6, L7)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Closeout: lint boundary and written standard". Body sections:
   - Changed: the ESLint rule and messages; the CLAUDE.md/AGENTS.md rule changes (a to j in phase 1.4) with one line of WHY for each rule that was replaced; living docs fixed; _project lessons folded; .gitignore and .lavish policy; README map; assets removed.
   - Closed audit findings by id: H1 (enforcement), M3 (second half), M4 (stale lint text, living docs), M7 (rule), L1, L2, L3, L6, L7 (documented decisions below).
   - Decisions recorded, NOT changed (with reasons): routes product/[slug] vs products/[...slug] stay (public URLs, SEO); app/components is not renamed (churn without functional gain); schema.json and sanity.types.ts stay at the root (Sanity CLI defaults); .claude/skills vendored copies stay tracked (agents load project skills from the repo on fresh clones; skills-lock.json records provenance); .devin/memories stays (Devin-owned); ordinal names product-spotlight-1..3 stay (they mirror the CMS slots spotlight1..3); features/product-filtering/config/facetMap.ts is one declarative table.
   - OWNER TODO (nobody else can do these): (1) untracked files in your main checkout: docs/system-design.md, docs/diagrams/system-design-north-star.md, progress.txt; (2) rename the slug that contains the numero sign (Sanity slug + data/products record together); (3) if sourcing prompts mention data/<slice>/, point them to data/products/<slice>/; (4) the sitemap "category" block looks dead (no schema, no route): decide whether to delete; (5) verify AGENTS.md loads in a fresh Claude Code session (/memory); (6) run eslint once on the five files listed in the phase 1.2 owner check.

OWNER LIVE CHECK (put in the PR body)
- Nothing runs on localhost:3000 for this PR. Review the diff of CLAUDE.md and eslint.config.mjs; run the one eslint command from phase 1.2.

DONE CRITERIA
- [ ] working-memory folder deleted and not staged; no scratch files in the repo
- [ ] branch pushed; one PR open against main
- [ ] PR body has all four sections (Changed, Closed findings, Decisions not changed, Owner TODO)

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
