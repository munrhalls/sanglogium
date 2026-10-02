AXIS org-docs-prune | TURN 1 of 1 | TASK AREA: docs consolidation (audit H3) | PHASE 1.1 of 4 — dedupe, canonicalize, drop junk

WAVE 1. Runs in parallel with: org-data-boundary, org-checkout-thin-routes, org-app-shell, org-feature-structure, org-oversized-files, org-data-scripts. Waits for nothing.

GOAL
One canonical file per topic in docs/auth, docs/checkout, docs/user-account. No empty files, no agent-transcript files, no repeated "intelligence" basenames.

OWNS (only these may be edited)
- docs/** EXCEPT the five living docs, whose content you must not edit: docs/vertical-space-lg-touch.md, docs/homepage-structure.md, docs/search-ux.md, docs/post-homepage-product-discovery/catalogue-architecture.md, docs/design-system.md
OFF-LIMITS
- Everything outside docs/. Code comments that cite docs paths are fixed by other axes.
- docs/system-design.md and docs/diagrams/system-design-north-star.md are the owner's untracked files and are not in your worktree: never create, move or delete them.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. docs/user-account/: git rm docs/user-account/data-functionality-should-be-intelligence.md (0 bytes). git mv docs/user-account/user-account-system-intelligence.md docs/auth/user-account-system-intelligence.md. The folder docs/user-account/ must no longer exist.
2. Auth data-functionality trio. Read the first 15 lines of docs/auth/data-functionality-should-be-intelligence.md, ...-update.md and ...-update-2.md. Expected: -update-2 is the structured "Should-Be" version; -update starts with agent chatter ("Searched the web"). Then: git rm the original and the -update file; git mv docs/auth/data-functionality-should-be-intelligence-update-2.md docs/auth/data-functionality-should-be-intelligence.md. If the expectation is wrong, stop and report.
3. userProfile spec. git rm docs/auth/userprofile-atomicity-spec.md. git mv docs/auth/userprofile-atomicity-spec-updated.md docs/auth/userprofile-atomicity-spec.md. In the renamed file delete the "Supersedes: userprofile-atomicity-spec.md" line and drop "(Updated)" from the H1. The final name must be exactly docs/auth/userprofile-atomicity-spec.md (code comments in lib/auth.ts and lib/auth/dal.ts are repointed to this name by axis org-data-boundary).
4. Transcript junk. git rm docs/checkout/shipping/ux-should-be-intelligence.md (36 lines starting "Viewed AddressForm.tsx"). git mv docs/checkout/shipping/ux-should-be-intelligence-update.md docs/checkout/shipping/ux-should-be-intelligence.md.
5. Repeated basenames. Prefix the parent folder name:
   - docs/auth/ux-visual-should-be-intelligence.md -> docs/auth/auth-ux-visual-should-be-intelligence.md
   - docs/checkout/basket-page/ux-visual-should-be-intelligence.md -> .../basket-page-ux-visual-should-be-intelligence.md
   - docs/checkout/global/ux-visual-should-be-intelligence.md -> .../global-ux-visual-should-be-intelligence.md
   - docs/checkout/payment/ux-visual-should-be-intelligence.md -> .../payment-ux-visual-should-be-intelligence.md
   - docs/checkout/return/ux-visual-should-be-intelligence.md -> .../return-ux-visual-should-be-intelligence.md
   - docs/checkout/payment/data-functionality-should-be-intelligence.md -> .../payment-data-functionality-should-be-intelligence.md
6. docs/auth/devin-tasks/ (12 task briefs). Read 00-README.md. Verify these exist (evidence the briefs were executed): updateName in features/account/actions.ts; features/account/ui/AddressesClient.tsx; app/(store)/account/orders/[orderNumber]/page.tsx; app/api/account/export/route.ts; sanity-cms/lib/orders/mergeGuestOrders.ts; features/products/ui/WishlistButton.tsx; features/auth/ui/TwoFactorSection.tsx; sanity-cms/lib/account/setMarketingOptIn.ts. If all exist and 00-README.md marks nothing as pending: git rm -r docs/auth/devin-tasks. Otherwise keep only the brief(s) you cannot verify and say which in the PR.
7. Inbound links. For every file you renamed or deleted run git grep -n "<old basename>" -- docs and repair the link (point to the new name, or remove the line if the target was deleted). docs/README.md is rewritten in phase 1.3: leave it alone now.

DONE CRITERIA
- [ ] docs/user-account/ does not exist; docs/auth/user-account-system-intelligence.md exists
- [ ] only one docs/auth/data-functionality-should-be-intelligence*.md exists, with the -update-2 content
- [ ] docs/auth/userprofile-atomicity-spec.md exists, no *-updated.md, no "Supersedes" line
- [ ] docs/checkout/shipping has one ux-should-be-intelligence.md (the former -update content)
- [ ] no two tracked files share the basename ux-visual-should-be-intelligence.md or data-functionality-should-be-intelligence.md (git ls-files docs | grep those names shows only prefixed/unique names)
- [ ] docs/auth/devin-tasks removed (or only unverified briefs kept, reported)
- [ ] git grep for each old basename in docs/ returns nothing (except docs/README.md)
- [ ] none of the five living docs shows in git status

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (a throwaway node script in your OS temp dir is allowed for path-existence checks; never commit it). The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move/rename with git mv only; fix every inbound link in the same phase.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
