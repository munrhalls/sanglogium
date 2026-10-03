AXIS ui-structure · TURN 2 (of 4) · AREA: catalogue and product-search · PHASE 2.1 — Move pure logic to domain/ and hooks to model/

PREREQUISITE: turn 1 is committed and pushed on branch ui-structure. Task area is disjoint from turn 1.
OWNS (touch only these): features/catalogue/ui/catalogueNavTypes.ts and catalogueNavUtils.ts (move), features/catalogue/domain/**, features/catalogue/model/**, features/product-search/ui/{recentSearches,searchLinks,useSearchController,useSearchOverlay,useVisualViewportBox}.ts (move), features/product-search/domain/**, features/product-search/model/**, features/product-search/index.ts, and their importers inside features/catalogue and features/product-search.
NEVER TOUCH: other features, app/**, docs/, any other file.

CONVENTION: ui/ = components only; model/ = client state (stores, React hooks); domain/ = pure types and logic. PURITY RULE: a file belongs in domain/ only if it has no "use client", no React import and no window/document/localStorage/sessionStorage access; otherwise it belongs in model/.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; treehouse get --lease, then cd into the printed path.
3. git switch ui-structure; if origin/main moved, git merge origin/main (no rebase, no force-push).

TASKS
1. Catalogue: apply the PURITY RULE to features/catalogue/ui/catalogueNavTypes.ts and catalogueNavUtils.ts. Pure files git mv to features/catalogue/domain/ (same file name); impure ones to features/catalogue/model/ (mkdir first). Before moving check the destination for an existing file with the same name; if one exists, STOP and report. Update their relative importers inside features/catalogue (grep catalogueNav) and the moved files' own relative imports.
2. Product search: apply the PURITY RULE to features/product-search/ui/recentSearches.ts and searchLinks.ts (pure to features/product-search/domain/, otherwise to features/product-search/model/; same name-collision check).
3. git mv features/product-search/ui/useSearchController.ts, useSearchOverlay.ts and useVisualViewportBox.ts into features/product-search/model/ (mkdir first).
4. features/product-search/index.ts lines 15-16: './ui/useSearchController' and './ui/useSearchOverlay' become './model/useSearchController' and './model/useSearchOverlay' (export names unchanged). Fix every relative importer inside features/product-search (grep each moved name) and each moved file's own relative imports.
5. Check features/product-search/server.ts and everything under features/product-search/domain/: none of them may import from a model/ folder. If one does, STOP and report.

DONE
- [ ] features/catalogue/ui and features/product-search/ui contain no .ts files except those that are components or already-correct; the seven moved files live in domain/ or model/ according to the purity rule
- [ ] grep -rnE "ui/(catalogueNav|recentSearches|searchLinks|useSearch|useVisualViewportBox)" features app returns nothing
- [ ] the export names in features/product-search/index.ts are unchanged
- [ ] no model/ import appears in server.ts or domain/ files

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
