AXIS entry-docs · TURN 1 (of 1) · AREA: make CLAUDE.md, AGENTS.md and the living docs tell the truth about the reorganized repo · PHASE 1.3 — Dead-path sweep of the five surviving docs

PREREQUISITE: phases 1.1 and 1.2 done on branch entry-docs. Stay on that branch.
OWNS (touch only these): docs/vertical-space-lg-touch.md, docs/homepage-structure.md, docs/search-ux.md, docs/post-homepage-product-discovery/catalogue-architecture.md, docs/checkout/ADR-002-checkout-inventory-concurrency.md. (If git ls-files docs lists anything else, leave it alone and mention it in the PR body.)
NEVER TOUCH: any other file. Add no new content: only correct statements that are now false.

GOAL
CLAUDE.md promises that the living docs contain no dead path. Earlier axes moved or renamed files these docs may mention.

TASKS
1. For each of the five files run grep -nE with these patterns and fix every hit that is now wrong (correct path/name, or delete the clause if its subject no longer exists):
   app/components/ui | ProductSpotlight[123] | product-spotlight-[123] | general/Shelf | (store)/lib/fetchHomepageData | (store)/configuration | lib/auth\.ts | lib/auth-client | sanityImageUrl | sanityImageLoader | event-logger | ui/basketStore | ui/useSignOut | ui/useFilterParam | ui/useSearchController | ui/useSearchOverlay | ui/useVisualViewportBox | ui/recentSearches | ui/searchLinks | catalogueNavTypes | catalogueNavUtils | PriceRangeSlider | AccountActionsClient | hero/types | accessories/types | __tests__ | productFilterAttributes | tailwind.config.ts | docs/
   Use the repo as truth: ls or git ls-files each path you are about to write. Typical corrections: ui/useSearchController becomes model/useSearchController; product spotlights get their new names (ProductSpotlightMediaLeft, ProductSpotlightMediaRight, ProductSpotlightFractal); Price/Carousel/Checkbox live in shared/ui; symbols formerly exported from PriceRangeSlider.tsx now live in FilterSection.tsx or DualRangeSlider.tsx; Tailwind tokens live in shared/styles/tokens.ts.
   Links to deleted docs (docs/README.md, docs/design-system.md, docs/performance/..., docs/diagrams/... and every file not in the five-file list) are removed or reworded so no link remains.
2. For every backticked repo path or relative markdown link that remains in the five files, confirm with ls or git ls-files that it exists.
3. Report in the PR body how many statements you changed per file (counts only).

DONE
- [ ] every path and link mentioned in the five files exists in the tree
- [ ] no hit of the task 1 patterns remains that points to a moved, renamed or deleted thing
- [ ] the diff contains only corrected paths/names/clauses, no new prose

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
