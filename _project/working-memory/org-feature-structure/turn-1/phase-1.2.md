AXIS org-feature-structure | TURN 1 of 1 | TASK AREA: feature-internal structure (audit M2) | PHASE 1.2 of 4 — product-search grouping and link helpers, catalogue dead indirection

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
features/product-search/ui/ is grouped; URL builders are domain code; features/catalogue/ui has no alias-only or identity-only file.

TASKS (in order)
1. Split features/product-search/ui/searchLinks.ts (19 lines). Create features/product-search/domain/searchLinks.ts with searchHref and productHref (pure URL builders, bodies verbatim). Create features/product-search/ui/isPlainLeftClick.ts with isPlainLeftClick and its React MouseEvent type import (bodies verbatim). git rm the old searchLinks.ts. Update its importers: AutocompletePanel.tsx (isPlainLeftClick, productHref, searchHref), SearchEmpty.tsx (searchHref), SearchZeroQueryPanel.tsx (isPlainLeftClick), useSearchController.ts (productHref, searchHref).
2. Group features/product-search/ui with git mv:
   - field/: SearchBarTrigger.tsx, SearchFieldDesktop.tsx, SearchSheet.tsx, SearchInput.tsx, AutocompletePanel.tsx, SearchZeroQueryPanel.tsx, HighlightedText.tsx
   - results/: SearchHeader.tsx, SearchError.tsx, SearchEmpty.tsx, SearchPagination.tsx, SearchSort.tsx, SearchCategoryChips.tsx
   - stay in ui/ root (shared by both groups): useSearchController.ts, useSearchOverlay.ts, useVisualViewportBox.ts, recentSearches.ts (browser-storage helper used only by the UI layer; colocated on purpose), isPlainLeftClick.ts
   Known edges: field/* import ../useVisualViewportBox, ../useSearchController, ../recentSearches, ../isPlainLeftClick, ../../config/searchSuggestions, ../../domain/...; results/SearchEmpty imports ../../config/searchSuggestions and the domain searchLinks via ../../domain/searchLinks; field/HighlightedText imports ../../domain/highlight.
3. features/product-search/index.ts (and server.ts if it references ui): update the paths of the 11 ui exports (SearchHeader, SearchError, SearchEmpty, SearchPagination, SearchSort, SearchCategoryChips, SearchBarTrigger, SearchFieldDesktop, SearchSheet, useSearchController, useSearchOverlay).
4. Catalogue dead indirection.
   a. features/catalogue/ui/catalogueNavUtils.ts only exports transformCatalogueJson, an identity function that returns rawData.catalogue. In CatalogueCarousel.tsx and CatalogueNavbar.tsx replace each transformCatalogueJson(x) call with x.catalogue, remove the import, git rm the file.
   b. features/catalogue/ui/catalogueNavTypes.ts holds an alias (CatalogueNavItem = NavigationItem) and NavbarManagerProps. Replace every CatalogueNavItem usage with NavigationItem imported from the domain module the alias pointed at (use the correct relative path per file: ../domain/catalogue, ../../domain/catalogue, ../../../domain/catalogue). Move NavbarManagerProps into NavbarManager.tsx next to its component (exported if anything else imports it). git rm catalogueNavTypes.ts. Importers to fix: CatalogueCarousel, CatalogueNavbar, CatalogueView, NavbarManager, details/DetailSection, details/SliceDetails, hero/HeroImage, hero/SliceHero.
5. Run the same throwaway resolver script as in phase 1.1 over features/product-search and features/catalogue; it must print nothing.

DONE CRITERIA
- [ ] git grep -n "searchLinks'\|searchLinks\"" -- features lists only imports of ../domain/searchLinks / ../../domain/searchLinks; no import of a ui searchLinks
- [ ] features/product-search/ui/ contains field/, results/ and exactly five loose files (useSearchController.ts, useSearchOverlay.ts, useVisualViewportBox.ts, recentSearches.ts, isPlainLeftClick.ts)
- [ ] git grep -n "transformCatalogueJson\|catalogueNavUtils\|catalogueNavTypes\|CatalogueNavItem" -- features prints nothing
- [ ] resolver script prints nothing for product-search and catalogue
- [ ] features/product-search/index.ts exports the same names as before
- [ ] no className or JSX line changed

OWNER LIVE CHECK (for the PR body)
- Header search on desktop (type a query: suggestions, highlight, recent searches in the empty state) and the mobile search sheet; /search results page (sort, chips, pagination, empty state); catalogue navbar and category carousel render.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (the throwaway resolver script is allowed; never commit it). The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every importer in the same phase.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
