AXIS org-feature-structure | TURN 1 of 1 | TASK AREA: feature-internal structure (audit M2) | PHASE 1.1 of 4 — group features/products/ui

WAVE 1. Runs in parallel with: org-docs-prune, org-data-boundary, org-checkout-thin-routes, org-app-shell, org-oversized-files, org-data-scripts. Waits for nothing. Blocks: org-lib-infra, org-closeout.

STANDARD APPLIED (target, not the old doc): inside a feature, ui/ holds components and component hooks, grouped into sub-folders once it passes about a dozen files; URL builders and state/model code live in domain/; no dead indirection (alias-only files, identity wrappers).

GOAL
features/products/ui/ has three focused sub-folders instead of 20 flat files.

OWNS (only these may be edited)
- features/products/**, features/product-search/**, features/catalogue/**, features/basket/**
OFF-LIMITS
- app/**, lib/** (the "@/lib/auth-client" import in WishlistButton.tsx stays as is; axis org-lib-infra updates it later), other features, docs.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. git mv the 20 files of features/products/ui/ into three new sub-folders:
   - listing/: ProductGrid.tsx, ProductGridSkeleton.tsx, ChunkedProductGrid.tsx, ProductChunk.tsx, ProductChunkSkeleton.tsx, EmptyResults.tsx, Pagination.tsx, ShopHeader.tsx, ShopHeaderSkeleton.tsx
   - card/: ProductCard.tsx, ProductImage.tsx, ImageRevealClient.tsx, ImageRevealScript.tsx, reveal.module.css, WishlistButton.tsx
   - detail/: ProductDetail.tsx, ProductInfo.tsx, ImageGallery.tsx, QuantitySelector.tsx, RelatedProducts.tsx
2. Fix every relative import inside the moved files. Known edges: listing/ChunkedProductGrid -> ../card/ImageRevealScript and ../card/ImageRevealClient; listing/ProductGrid -> ../card/ProductCard and ../card/ImageRevealScript; listing/ProductChunk -> ../card/ProductCard; card/ProductCard -> ./ProductImage and ./WishlistButton; card/ProductImage -> ./reveal.module.css; card/ImageRevealClient -> ./ImageRevealScript; card/WishlistButton -> ../../actions; detail/ProductDetail -> ./ImageGallery, ./ProductInfo, ./RelatedProducts; detail/ProductInfo -> ./QuantitySelector and ../card/WishlistButton; listing/ShopHeaderSkeleton -> ./ShopHeader. Every "../config/", "../domain/", "../actions" import gains one more "../". Then run git grep -n "from ['\"]\.\.\?/" -- features/products and check each remaining relative import by hand.
3. features/products/index.ts: update the 12 ui export paths to the new locations.
4. git grep -n "features/products/ui" -- app features lib sanity-cms must print nothing (deep imports are not allowed anyway). The WishlistButton "@/lib/auth-client" import is unchanged.
5. Write a throwaway node script in your OS temp dir (never in the repo) that, for every .ts/.tsx file under features/products, resolves each relative import specifier (try the exact path, .ts, .tsx, .css, /index.ts) and prints any that do not exist. It must print nothing.

DONE CRITERIA
- [ ] features/products/ui/ contains only the folders listing/, card/, detail/ (no loose files)
- [ ] the script from task 5 prints no unresolved import
- [ ] features/products/index.ts exports resolve to the new paths and export the same 12 names as before (compare with git show HEAD:features/products/index.ts)
- [ ] reveal.module.css sits next to ProductImage.tsx, the only file importing it
- [ ] no className or JSX line changed (git diff -M shows renames plus import-line edits only)

OWNER LIVE CHECK (for the PR body)
- /products listing renders with the image reveal; open a product page: gallery, quantity selector, related products, wishlist heart (signed in and out) work.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (the throwaway resolver script is allowed; never commit it). The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every importer in the same phase.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
