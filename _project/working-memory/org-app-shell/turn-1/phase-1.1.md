AXIS org-app-shell | TURN 1 of 1 | TASK AREA: storefront shell cleanup (audit M5, M7 module naming) | PHASE 1.1 of 3 — remove the homepage shim, split configuration.ts, rename suppressWarnings

WAVE 1. Runs in parallel with: org-docs-prune, org-data-boundary, org-checkout-thin-routes, org-feature-structure, org-oversized-files, org-data-scripts. Waits for nothing. Blocks: org-closeout.

GOAL
app/(store) has no pass-through shim, no vaguely named config file, no kebab-case TS module.

OWNS (only these may be edited)
- app/(store)/** , app/components/** , app/suppress-warnings.ts (renamed in this phase)
- features/homepage/index.ts, features/homepage/domain/emptyHomepageData.ts (new)
OFF-LIMITS
- app/checkout/**, app/api/**, every other feature, lib/**, sanity-cms/**. Note: axis org-oversized-files splits sanity-cms/lib/homepage/getHomepageData.ts but keeps the export fetchHomepageDataBatched at that same path; import it exactly as the shim does today.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. Read app/(store)/lib/fetchHomepageData.ts, app/(store)/page.tsx, app/(store)/layout.tsx, app/(store)/configuration.ts, app/suppress-warnings.ts. Run git grep -n "fetchHomepageData\|configuration\|suppress-warnings" -- app features to list every importer.
2. Create features/homepage/domain/emptyHomepageData.ts: export const EMPTY_HOMEPAGE_DATA: HomepageData with exactly the empty structure the shim's catch block returns today (hero null, featured [], spotlight1/2/3 null, iemsGallery [], newestRelease null, dacs [], accessories with the seven empty arrays cables, interconnects, adapters, earpads, eartips, careCleaning, storage). Type from "./homepageTypes". Add an explicit named export to features/homepage/index.ts.
3. app/(store)/page.tsx: delete the import of ./lib/fetchHomepageData; import fetchHomepageDataBatched from "@/sanity-cms/lib/homepage/getHomepageData" and EMPTY_HOMEPAGE_DATA from "@/features/homepage". Where the page did "const data = await fetchHomepageData()" use a try/catch (or .catch) with identical behaviour: on error console.error('Error fetching homepage data:', error) and fall back to EMPTY_HOMEPAGE_DATA. Then git rm app/(store)/lib/fetchHomepageData.ts (the folder app/(store)/lib/ disappears). The shim's "backward compatibility" type re-export has no importers; it goes with the file.
4. Split app/(store)/configuration.ts: git mv it to app/(store)/metadata.ts and keep only the metadata export there (remove the Montserrat import and const). Create app/(store)/fonts.ts holding the Montserrat import and the exported montserrat const (same options, verbatim). In app/(store)/layout.tsx replace the two "./configuration" imports with import { metadata } from "./metadata" and import { montserrat } from "./fonts". Everything else in layout.tsx unchanged.
5. git mv app/suppress-warnings.ts app/suppressWarnings.ts (TS modules are camelCase; framework convention files such as global-error.tsx are exempt). Update the one importer in app/(store)/layout.tsx from "../suppress-warnings" to "../suppressWarnings".

DONE CRITERIA
- [ ] git ls-files app/(store) shows no lib/ folder and no configuration.ts; metadata.ts and fonts.ts exist
- [ ] git grep -n "fetchHomepageData\b\|\./configuration\|suppress-warnings" -- app features prints nothing
- [ ] EMPTY_HOMEPAGE_DATA has all 11 top-level keys the old catch block returned (hero, featured, spotlight1, spotlight2, spotlight3, iemsGallery, newestRelease, dacs, accessories + its 7 arrays)
- [ ] page.tsx still logs the same message on error
- [ ] layout.tsx imports resolve to existing files (metadata, fonts, suppressWarnings)

OWNER LIVE CHECK (for the PR body)
- Load / : sections render, Montserrat font unchanged, page title/metadata unchanged (view-source <title>).

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move/rename with git mv only; fix every importer in the same phase.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
