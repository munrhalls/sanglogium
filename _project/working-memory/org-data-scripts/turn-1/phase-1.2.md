AXIS org-data-scripts | TURN 1 of 1 | TASK AREA: scripts, proofs and data layout (audit M4, M6 getClient, M7 slice name) | PHASE 1.2 of 5 — shared script helpers, stale references, tsconfig, slice file name

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
No script reaches into features/ for a helper; no comment or config points at retired tests; every TS module under features/product-filtering/config is camelCase.

TASKS (in order)
1. scripts/catalogue-integrity/apply.mjs and lib.mjs: change the import of sanityRaw from "../../features/product-filtering/__tests__/proofs/sanityRaw.mjs" to "../lib/sanityRaw.mjs".
2. git mv sanity-cms/utils/getClient.mjs scripts/lib/getClient.mjs (its .env.local lookup "../../.env.local" still resolves to the repo root from scripts/lib; leave the code unchanged). Update the dynamic imports in scripts/catalogue-integrity/apply.mjs (about line 149) and rollback.mjs (about line 24) from "../../sanity-cms/utils/getClient.mjs" to "../lib/getClient.mjs". The folder sanity-cms/utils/ must no longer exist. Do NOT touch scripts/build-catalogue-index.mjs (it runs standalone in prebuild on Vercel and keeps its own inline client by design).
3. Dangling comment references. features/product-filtering/domain/facetCounts.ts (about lines 42 to 45): reword the comment so it no longer cites the non-existent sanity-cms/lib/products/__tests__/getFilterFacets.spec.ts; keep the meaning "exported so the matching engine can be exercised directly; purely additive visibility change". features/product-filtering/config/slices/audio-electronics.ts line 3 and headphones.ts line 3: remove the clause citing ../../__tests__/facetConfigParity.spec.ts.
4. tsconfig.json. First prove nothing relies on the stale excludes: git ls-files | grep -E "\.(spec|test)\.(ts|tsx|js|jsx)$" prints nothing, and no tracked path starts with tests/, playwright-report/, coverage/, test-results/, venv/. Then remove these entries from "exclude" (keep every other entry, keep the JSON valid): "tests", "tests/**/*", "playwright-report", "playwright-report/**/*", "coverage", ".nyc_output", "test-results", "venv", "venv/**/*", "**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.js", "**/*.spec.jsx".
5. Slice module naming. git mv features/product-filtering/config/slices/audio-electronics.ts features/product-filtering/config/slices/audioElectronics.ts and update the one importer, features/product-filtering/config/facetRegistry.ts (import * as audioElectronics from './slices/audioElectronics'). Category slug strings such as "audio-electronics" inside registries stay (they are URL/CMS keys, not module names). Run git grep -n "slices/audio-electronics" -- features app lib sanity-cms scripts: no hit may remain in code.
6. Run the phase 1.1 resolver script over all of scripts/ now; it must print nothing.

DONE CRITERIA
- [ ] git grep -n "sanity-cms/utils\|__tests__/proofs" -- . ':(exclude)docs' prints nothing
- [ ] scripts/lib contains getClient.mjs and sanityRaw.mjs; sanity-cms/utils does not exist
- [ ] the resolver script prints nothing for the whole scripts/ tree
- [ ] git grep -n "getFilterFacets.spec\|facetConfigParity.spec" -- features prints nothing
- [ ] tsconfig.json is valid JSON by eye (commas) and none of the removed entries remain; every other entry is still there
- [ ] features/product-filtering/config/slices contains accessories.ts, audioElectronics.ts, headphones.ts

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, any proof or catalogue script, or any other build/check command. Verify with git, grep and the throwaway resolver only. The owner verifies in PR review (the Vercel build type-checks).
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every reference in the same phase.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
