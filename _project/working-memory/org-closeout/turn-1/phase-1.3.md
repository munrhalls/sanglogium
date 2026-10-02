AXIS org-closeout | TURN 1 of 1 | TASK AREA: entry docs, repo hygiene (audit L1, L2, L3, L6) | PHASE 1.3 of 5 — AGENTS/CLAUDE overlap, ignores, unused assets, README

Prerequisite: phases 1.1 and 1.2 done. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
One source for shared agent rules; untracked noise has a policy; no unreferenced public assets; README is a front door.

TASKS (in order)
1. L1 — AGENTS.md vs CLAUDE.md. These sections appear in both files: "Campaign process (MANDATORY)", "Agent Context Profiles", "Session Completion", and the file:// path instruction (a bullet at the top of CLAUDE.md "Conventions & Patterns" and the section "Clickable file links" in AGENTS.md). For each, compare the two texts. Where the meaning is identical, keep it in AGENTS.md and delete it from CLAUDE.md; where they differ, keep BOTH untouched and list the differences in the PR body. Then add near the top of CLAUDE.md one line: "Shared agent rules (campaign process, context profiles, session completion, path links) live in AGENTS.md, imported here:" followed by a line containing exactly @AGENTS.md (Claude Code's file-import syntax). Do not edit any other sentence of either file in this task. Add to the PR body: "Owner: open a fresh Claude Code session, run /memory and confirm AGENTS.md is listed as loaded."
2. L2 — untracked-file policy. .gitignore: add three lines, progress.txt, _project/working-memory/, .lavish/. Then git rm --cached -r .lavish (the two tracked review HTML files stay on disk; .lavish/ holds ephemeral review surfaces and is not versioned). PR body must list, as OWNER TODO (these are untracked files in the owner's main checkout that no executor can see): progress.txt (delete or ignore: now ignored), docs/system-design.md and docs/diagrams/system-design-north-star.md (commit them in a separate docs PR or delete), _project/working-memory/ (now ignored).
3. L3 — unreferenced assets. For each of public/LOGO.svg, public/logo-orbit.svg, public/logo-orbit-white.svg run git grep -n -i "<file name without folder>" -- . ':(exclude)docs' ':(exclude)_project' and also check app/globals.css, next.config.ts, sanity.config.ts, app/**, features/**. If no code, config or CSS references it, git rm it; if referenced, keep it and say where. Check app/components/layout/header/BrandLogo.tsx too (it may inline the logo). Not changed on purpose (put in the PR body): schema.json and sanity.types.ts stay at the repo root, the Sanity CLI's default output locations.
4. L6 — README.md. Replace the "Screenshots (placeholder, see Phase 4)" section (dead reference) with a "Where things live" section of at most 12 lines, each fact checked against the tree: app/ (routes and storefront shell), features/<name>/ (feature slices: ui, domain, config, adapters, index/server/actions entries), sanity-cms/ (Studio schema; lib/ holds every GROQ query), lib/ (cross-cutting infrastructure), data/ (see data/README.md), scripts/ (build and maintenance scripts, scripts/filters-proofs for live-CMS proofs), docs/ (index: docs/README.md), _project/ (process documents, index: _project/README.md). Keep every other README section unchanged.

DONE CRITERIA
- [ ] CLAUDE.md contains the @AGENTS.md line; each deleted duplicate section existed with identical meaning in AGENTS.md (differences, if any, listed in the PR body and left in place)
- [ ] .gitignore contains the three new lines; git ls-files .lavish prints nothing; the files still exist on disk
- [ ] every deleted SVG had zero references; every kept SVG has a named referrer
- [ ] README has no "Phase 4" text and a "Where things live" section whose every path exists
- [ ] git status shows only CLAUDE.md, AGENTS.md (if touched), README.md, .gitignore, .lavish removals, public/*.svg deletions

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
