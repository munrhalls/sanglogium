AXIS entry-docs · TURN 1 (of 1) · AREA: make CLAUDE.md, AGENTS.md and the living docs tell the truth about the reorganized repo · PHASE 1.1 — Update CLAUDE.md

WAVE 4 (last) — PREREQUISITE: every other axis is merged into main. Verify on origin/main that these exist: shared/ui/carousel/CarouselRoot.tsx, shared/styles/tokens.ts, lib/auth/server.ts, lib/sanity/imageUrl.ts, lib/dev/eventLogger.ts, features/basket/model/basketStore.ts, features/homepage/domain/heroTypes.ts, features/product-filtering/proofs/11-single-option-subset-proof.mjs, sanity-cms/schemaTypes/productFilterAttributes/index.ts; and that these do NOT exist: app/components/ui, docs/design-system.md, progress.txt, _project/lessons.md. git ls-files .claude/skills must print nothing. If the owner deliberately dropped an axis (for example data-md-removal), skip the matching edit below and say so in the PR body; any other missing prerequisite: STOP and report.
OWNS (touch only these): CLAUDE.md. Phase 1.2 owns AGENTS.md, README.md, .no-mistakes.yaml. Phase 1.3 owns the five files under docs/.
NEVER TOUCH: any source file. Do NOT merge, delete or restructure CLAUDE.md, AGENTS.md, .claude/, .codex/ or .devin/: the owner uses Claude Code CLI, Devin CLI and occasionally Cline, and each reads its own file. Only correct statements that are now false.

GOAL
Every path and rule CLAUDE.md states matches the repo after the other ten axes. Change nothing else; keep wording tight.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; make sure you start from the latest origin/main (fast-forward or pull if behind).
3. treehouse get --lease, then cd into the printed path.
4. git switch -c entry-docs from up-to-date main.

TASKS (edit CLAUDE.md; quoted text is what it says today)
1. "Campaign process (MANDATORY)": replace the sentence "`_project/<feature name>/plan.md` (feature campaigns) or `_project/missions/<mission name>/plan.md` (ad-hoc, time-boxed missions) is the live milestone roadmap for that unit of work." with: "Live plans are the architect's phase files under `_project/working-memory/<axis>/turn-<n>/phase-<n.m>.md` (transient: each turn's last phase deletes them, never committed); one PR per thematic axis." Keep the methodology-file sentence before it.
2. "Workflow note": remove "`_project/devin-cloud-optimization-plan.md` is a narrower side-thread, not the methodology" and its separator, leaving "(see `_project/00-MOST-IMPORTANT-lean-tracer-bullet-methodology.md`)".
3. "Top-level route/folder map": "components/{ui,layout,analytics} (shared UI and shell)" becomes "components/{layout,analytics} (shell)"; add one clause that shared presentational primitives and Tailwind tokens live in shared/{ui,styles}.
4. Conventions, "Where feature code goes": the structure list becomes ui/ (components), model/ (client state: Zustand stores and React hooks, only when the feature has any), config/, domain/ (pure types and logic); delete the parenthetical "(the only __tests__/ content is the product-filtering proof scripts)".
5. Conventions, "Shared UI and shell": "app/components/ui" becomes "shared/ui" (primitives with no domain knowledge or with at least two consuming features); add: features never import app/ at all and shared/ imports neither app/ nor features/ (both lint-enforced), so dependencies run app -> features -> shared; shared/styles holds the Tailwind tokens and component plugin used by tailwind.config.ts. Keep the app/components/layout sentences and the "app/components/features/ no longer exists" sentence.
6. Conventions, "lib/": after "cross-cutting infrastructure only" describe the layout: lib/auth/{server,client,dal,providers}.ts, lib/sanity/{imageUrl,imageLoader}.ts, lib/dev/eventLogger.ts, lib/utils/, lib/email.ts, lib/stripe.ts; add "module files are camelCase".
7. Conventions, "Data layer": append one sentence: sanity-cms/ holds the Sanity Studio configuration (schemaTypes/, structure.ts, env.ts) and, in sanity-cms/lib/, the app's data layer.
8. Conventions, "Tests": replace "Only the filters live-CMS proof scripts remain, in features/product-filtering/__tests__/{proofs,data}/." with "Only two filters live-CMS proof scripts remain, in features/product-filtering/proofs/ (their output goes to the git-ignored proofs/out/)."
9. Conventions, "Feature map": "(store in ui/basketStore.ts)" becomes "(store in model/basketStore.ts)"; the auth entry's "lib/auth.ts, lib/auth-client.ts, lib/auth/dal.ts, lib/auth/providers.ts" becomes "lib/auth/{server,client,dal,providers}.ts".
10. "Mandatory review gate": add shared/** to "under app/components/** or features/**/ui/**".
11. "Repository Layout Standard" - Root allowlist: add shared/ to the folder list and remove .lavish/ (now git-ignored); keep .claude/ .codex/ .devin/. "Where things go": replace "documentation in docs/ (index: docs/README.md); closed campaign records in _project/archive/, living process documents at the top level of _project/" with "documentation in docs/ (only living reference documents and ADRs; working notes and generated analyses are deleted, never stored); _project/ holds the three living process documents and the transient working-memory/ hand-off folder; closed campaign records are deleted, not archived". "Never committed": add "phase files under _project/working-memory/". "Naming": run git ls-files data; if it prints only data/catalogue-index.json remove "and the verbatim product-source file names under data/" from the exemptions, otherwise leave it. "Docs honesty": remove the "Point-in-time document" banner clause and say the living docs (the four UX/architecture references and the checkout ADR) must contain no dead path.

DONE
- [ ] none of these strings remain in CLAUDE.md: "app/components/ui", "_project/archive", "_project/missions", "devin-cloud-optimization-plan", "__tests__", "lib/auth-client", "ui/basketStore", "docs/README.md", ".lavish/"
- [ ] CLAUDE.md names shared/, model/, lib/auth/{server,client,dal,providers}.ts and features/product-filtering/proofs/
- [ ] every other line of CLAUDE.md is unchanged (git diff)

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
