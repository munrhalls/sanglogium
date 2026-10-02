AXIS org-oversized-files | TURN 1 of 1 | TASK AREA: split oversized files at their real seams (audit L4) | PHASE 1.1 of 4 — Sanity schemas (productType, orderType)

WAVE 1. Runs in parallel with: org-docs-prune, org-data-boundary, org-checkout-thin-routes, org-app-shell, org-feature-structure, org-data-scripts. Waits for nothing. Blocks: org-lib-infra, org-closeout.

STANDARD APPLIED: a module has one reason to change; files over about 450 lines are split at their natural seams. Declarative tables are exempt (features/product-filtering/config/facetMap.ts, 539 lines, is one facet table; length is not complexity there; no task).

GOAL
sanity-cms/schemaTypes/productType.ts and orderType.ts each drop below 300 lines by moving their largest field definitions into sibling modules, verbatim.

OWNS (only these may be edited)
- sanity-cms/schemaTypes/** , sanity-cms/lib/homepage/** , features/product-filtering/ui/** , features/product-filtering/index.ts , features/account/ui/** , features/account/index.ts
OFF-LIMITS
- features/product-filtering/config/**, domain/**, __tests__/** (axis org-data-scripts), lib/** (axis org-lib-infra later edits the "@/lib/auth-client" import lines in features/account/ui), all other features, app/**.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. productType. In sanity-cms/schemaTypes/productType.ts find the field whose name is "filterAttributes" (git grep -n 'name: "filterAttributes"'); it spans roughly lines 213 to 1081, followed by the "sortAttributes" field. Create sanity-cms/schemaTypes/productFilterAttributes.ts exporting const filterAttributesField = defineField({ ... }) holding that block moved verbatim (including its inner arrays, helper code and comments). Import from "sanity" whatever the block uses (defineField, and defineArrayMember only if used). In productType.ts replace the block with "filterAttributesField," and import it. Keep the productType export and every other field exactly as is.
2. orderType. In sanity-cms/schemaTypes/orderType.ts: create orderItemsField.ts exporting const orderItemsField = defineField({ ... }) with the "items" field (about lines 58 to 202, verbatim); create orderAddressFields.ts exporting shippingAddressField and billingAddressField (the "shippingAddress" and "billingAddress" fields, about lines 203 to 265, verbatim). Replace the blocks in orderType.ts by the three identifiers (keep field order) and import them. Import only the sanity helpers each new file uses.
3. sanity-cms/schemaTypes/index.ts must remain unchanged (it only imports productType and orderType).

DONE CRITERIA
- [ ] productType.ts is at most 300 lines; orderType.ts is at most 300 lines
- [ ] the three new files exist and each exports exactly the identifiers named above
- [ ] field order inside both fields arrays is unchanged (compare the list from git grep -n '^      name:' before and after: same names, same order)
- [ ] line counts: new files plus the two schema files add up to the old totals within the new import/export lines (nothing lost, nothing duplicated: git grep -c 'name: "filterAttributes"' sanity-cms/schemaTypes is exactly 1)
- [ ] sanity-cms/schemaTypes/index.ts shows no diff

OWNER LIVE CHECK (for the PR body)
- Open /studio: a Product document shows the same Filter Attributes object and Sort Attributes; an Order document opens with items and both addresses.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review (the Vercel build type-checks).
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Moved code stays verbatim: no reformatting, no renames beyond the exported identifiers named above.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
