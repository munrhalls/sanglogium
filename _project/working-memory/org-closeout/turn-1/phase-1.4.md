AXIS org-closeout | TURN 1 of 1 | TASK AREA: align the written standard and living docs with the code (audit H2, M2, M3, M4, M7, L7 documentation) | PHASE 1.4 of 5 — CLAUDE.md, AGENTS.md, living docs, _project README

Prerequisite: phases 1.1 to 1.3 done. Same OWNS / OFF-LIMITS as phase 1.1. Use the rename map and dead-path list from phase 1.1 (scratch folder).

GOAL
CLAUDE.md, AGENTS.md, the five living docs and _project/README.md describe the code as it now is, and the rules that were wrong are replaced by the right ones.

TASKS (in order)
1. CLAUDE.md. Change ONLY these statements (read each in context first; keep surrounding wording):
   a. Feature layout rule (the "Where feature code goes" bullet): a feature has ui/ (components and component hooks, grouped in sub-folders past about a dozen files), config/, domain/ (pure logic, URL builders and state models such as the basket store), adapters/ (server-only boundary files: external services, the cookie session, data-layer access), index.ts (client-safe entry), server.ts (server-only entry), actions.ts (Server Actions). Delete the clause "(the only __tests__/ content is the product-filtering proof scripts)".
   b. Data-access rule: only a feature's actions.ts and adapters/** may import sanity-cms; ui/, domain/, config/ and index.ts never do. Server components that need data live in the feature, call an adapter, and are exported from server.ts, never from index.ts. Components exported through index.ts must have no import-time side effects (lazy-initialize SDKs such as loadStripe). Routes only compose: guards, redirects, layout; presentation and business logic live in the feature.
   c. Replace the sentence that says a client component with module-scope side effects, or an async Server Component that fetches from Sanity, stays next to its only route and is never re-exported from index.ts: delete it (rule b replaces it).
   d. Data layer bullet: add that GROQ outside sanity-cms/ and scripts/ is blocked by the no-restricted-syntax rule in eslint.config.mjs.
   e. Feature map: checkout line (route-private statement) becomes "features/checkout/ (PaymentFormClient, OrderDetails and the success-state components live in ui/; app/checkout only composes pages)"; auth line paths become lib/auth/server.ts, lib/auth/client.ts, lib/auth/dal.ts, lib/auth/providers.ts; basket line "store in ui/basketStore.ts" becomes "store in domain/basketStore.ts"; the "Filters & sorting" paragraph drops "__tests__/" from its folder list.
   f. Tests bullet: the live-CMS proof scripts now live in scripts/filters-proofs/ (data in scripts/filters-proofs/data/), shared helpers in scripts/lib/.
   g. lib/ bullet: mention lib/eventLogger.ts and lib/auth/ as examples of cross-cutting infrastructure.
   h. Repository Layout Standard, Naming bullet: add "TS modules are camelCase. Exceptions: framework convention files (page, layout, route, global-error, ...), .cjs/.mjs tool and script files (kebab-case), product-source records under data/products, and ordinal names that mirror a CMS content slot (product-spotlight-1..3 mirror spotlight1..3). Client/server pairs are XClient / XServer. homeIems.ts means IEMs (in-ear monitors), not a typo."
   i. Repository Layout Standard, Where-things-go: scripts/lib holds shared script helpers; scripts/filters-proofs holds the live-CMS proofs; data/products holds product source records and data/catalogue-index.json is generated (see data/README.md) — if phase 1.3 of org-data-scripts did not run, keep the old data/<slice> wording.
   j. Campaign-process references (_project/<feature name>/plan.md, _project/missions/...): align them to the _project/ layout that is actually on main now (read _project/README.md and git ls-files _project | head -60). Same fix in AGENTS.md "Campaign process".
2. Living docs. Using the dead-path list from phase 1.1 and the rename map, fix every dead path in the five living docs: renamed files get the new path; deleted files (app/(store)/lib/fetchHomepageData.ts, features/catalogue/ui/catalogueNavUtils.ts, catalogueNavTypes.ts, features/product-search/ui/searchLinks.ts, ...) are replaced by a statement of the current behaviour. docs/search-ux.md mentions __tests__/ and tests/live/...: rewrite that line to the truth (suites retired; proofs in scripts/filters-proofs). Prose that is still true stays untouched. Re-run the dead-path script over the five docs: it must report zero.
3. _project housekeeping. Append the single line of _project/lessons.md to the end of _project/AI_LESSONS.md under a new "## Process notes" heading (do NOT renumber L01 to L11; CLAUDE.md cites them), then git rm _project/lessons.md. In _project/README.md remove the lessons.md entry, add one sentence: "AI_LESSONS.md is the canonical repo lessons file; .devin/memories/ is Devin's own tool memory (not edited by hand); vibe-coding-field-manual.md is the method.", and fix any entry that no longer exists on main (check each listed folder with git ls-files).
4. Re-run the dead-path script over CLAUDE.md, AGENTS.md, README.md and _project/README.md: it must report zero.

DONE CRITERIA
- [ ] CLAUDE.md edits a to j are applied; git diff CLAUDE.md shows no change outside those statements and the phase 1.3 edits
- [ ] the dead-path script reports zero for the five living docs, CLAUDE.md, AGENTS.md, README.md and _project/README.md
- [ ] _project/lessons.md is gone; AI_LESSONS.md still has L01 to L11 unchanged plus the new section
- [ ] no statement in CLAUDE.md still says features/checkout is route-private, that the basket store lives in ui/, that proofs live in __tests__, or that only actions.ts may import sanity-cms

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (the throwaway dead-path script is allowed; never commit it). The owner verifies in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
